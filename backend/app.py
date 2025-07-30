"""
ART-Laudo-Técnico-Pro - Backend API
Sistema de geração de laudos técnicos com IA
"""

import os
import json
import tempfile
import logging
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from enum import Enum

from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Body, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse, HTMLResponse
from pydantic import BaseModel, validator
from jose import JWTError, jwt
import io
import base64
import traceback
import sys

# Importar sistema de banco de dados
from database import LaudoDatabase, get_db_connection, init_database

# Importar configuração da OpenAI
from config_openai import get_openai_key, is_openai_configured, get_status

# Importar sistema de monitoramento
from monitoring import health_checker

# === CONFIGURAÇÃO DE LOGGING PROFISSIONAL ===
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# === CONFIGURAÇÕES DE SEGURANÇA ===
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Validar se SECRET_KEY não é o padrão em produção
if SECRET_KEY == "your-secret-key-here-change-in-production":
    if os.getenv("ENVIRONMENT") == "production":
        raise ValueError("CRITICAL: SECRET_KEY padrão detectada em produção!")
    logger.warning("AVISO: Usando SECRET_KEY padrão em desenvolvimento")

# === INICIALIZAÇÃO DA APLICAÇÃO ===
init_database()
health_checker.start_monitoring(interval=60)  # Monitoramento a cada 60 segundos
logger.info("Sistema inicializado com sucesso")

app = FastAPI(
    title="ART-Laudo-Técnico-Pro API",
    description="Sistema de geração de laudos técnicos com IA",
    version="2.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") != "production" else None
)

# === MIDDLEWARE DE SEGURANÇA ===
# Configuração CORS para produção
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://seu-frontend.vercel.app')
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', FRONTEND_URL)

ALLOWED_ORIGINS = [
    FRONTEND_URL,
    'http://localhost:3000',  # desenvolvimento
    'https://localhost:3000'  # desenvolvimento HTTPS
]

# Adicionar origens do CORS_ORIGINS se especificado
if CORS_ORIGINS and CORS_ORIGINS != FRONTEND_URL:
    ALLOWED_ORIGINS.extend([origin.strip() for origin in CORS_ORIGINS.split(',')])

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# === MODELOS DE DADOS COM VALIDAÇÃO ===
class UserResponse(BaseModel):
    id: int
    username: str
    is_admin: bool
    user_type: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TranscriptionRequest(BaseModel):
    transcription: str
    
    @validator('transcription')
    def validate_transcription(cls, v):
        if not v or not v.strip():
            raise ValueError('Transcrição não pode estar vazia')
        if len(v.strip()) < 3:
            raise ValueError('Transcrição muito curta')
        return v.strip()

class LaudoSimples(BaseModel):
    cliente: str
    equipamento: str
    problema_relatado: str
    diagnostico: str
    solucao: str
    
    @validator('cliente', 'equipamento', 'diagnostico')
    def validate_required_fields(cls, v):
        if not v or not v.strip():
            raise ValueError('Campo obrigatório não pode estar vazio')
        return v.strip()

class LaudoAvancado(BaseModel):
    nomeCliente: str
    data: str
    baterias: List[Dict[str, Any]]
    tecnicoResponsavel: str
    manutencaoPreventiva: Optional[List[str]] = []
    manutencaoCorretiva: Optional[List[str]] = []
    conclusaoFinal: str
    
    @validator('nomeCliente', 'tecnicoResponsavel', 'conclusaoFinal')
    def validate_required_fields(cls, v):
        if not v or not v.strip():
            raise ValueError('Campo obrigatório não pode estar vazio')
        return v.strip()
    
    @validator('baterias')
    def validate_baterias(cls, v):
        if not v or len(v) == 0:
            raise ValueError('Pelo menos uma bateria deve ser informada')
        return v

class TagUpdate(BaseModel):
    tag: str
    description: Optional[str] = None
    
    @validator('tag')
    def validate_tag(cls, v):
        if not v or not v.strip():
            raise ValueError('Tag não pode estar vazia')
        if len(v.strip()) > 50:
            raise ValueError('Tag deve ter no máximo 50 caracteres')
        return v.strip()

# === FUNÇÕES DE SEGURANÇA ===
def hash_password(password: str) -> str:
    """Gera hash seguro da senha"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """Verifica senha contra hash"""
    return hash_password(password) == hashed

def sanitize_string(value: str, max_length: int = 1000) -> str:
    """Sanitiza string removendo caracteres perigosos"""
    if not isinstance(value, str):
        return ""
    
    # Remove caracteres potencialmente perigosos
    import re
    cleaned = re.sub(r'[<>"\']', '', value)
    cleaned = cleaned.strip()
    
    # Limita tamanho
    if len(cleaned) > max_length:
        cleaned = cleaned[:max_length]
    
    return cleaned

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Cria token JWT seguro"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    
    try:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        logger.info(f"Token criado para usuário ID: {data.get('sub', 'unknown')}")
        return encoded_jwt
    except Exception as e:
        logger.error(f"Erro ao criar token: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# === FUNÇÕES DE AUTENTICAÇÃO ===
def authenticate_user(username: str, password: str) -> Optional[Dict[str, Any]]:
    """Autentica usuário usando banco de dados"""
    if not username or not password:
        return None
    
    # Sanitizar inputs
    username = sanitize_string(username, 50)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        
        if user and verify_password(password, user['password_hash']):
            logger.info(f"Login bem-sucedido para usuário: {username}")
            return {
                'id': user['id'],
                'username': user['username'],
                'is_admin': bool(user['is_admin']),
                'user_type': user['user_type'] if 'user_type' in user.keys() else 'tecnico'
            }
        
        logger.warning(f"Tentativa de login falhada para usuário: {username}")
        return None
    except Exception as e:
        logger.error(f"Erro na autenticação: {e}")
        return None
    finally:
        conn.close()

def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """Obtém usuário atual do token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError as e:
        logger.warning(f"Token JWT inválido: {e}")
        raise credentials_exception
    
    # Buscar usuário no banco
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        if user is None:
            logger.warning(f"Usuário não encontrado para ID: {user_id}")
            raise credentials_exception
        
        return {
            'id': user['id'],
            'username': user['username'],
            'is_admin': bool(user['is_admin']),
            'user_type': user['user_type'] if 'user_type' in user.keys() else 'tecnico'
        }
    except Exception as e:
        logger.error(f"Erro ao buscar usuário: {e}")
        raise credentials_exception
    finally:
        conn.close()

# === ENDPOINTS DE AUTENTICAÇÃO ===
@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Dict[str, str]:
    """Endpoint de login com validação robusta"""
    try:
        user = authenticate_user(form_data.username, form_data.password)
        if not user:
            # Delay para prevenir ataques de força bruta
            import time
            time.sleep(1)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user['id'])}, expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no endpoint de login: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.get("/me", response_model=UserResponse)
def get_user_info(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Retorna informações do usuário atual"""
    return current_user

# === ENDPOINTS DE LAUDOS ===
@app.get("/laudos")
def get_laudos(current_user: Dict[str, Any] = Depends(get_current_user)) -> List[Dict[str, Any]]:
    """Lista laudos baseado no tipo de usuário"""
    try:
        if current_user['is_admin']:
            # Admin vê todos os laudos
            laudos = LaudoDatabase.get_all_laudos()
        else:
            # Usuários comuns veem apenas seus próprios laudos
            laudos = LaudoDatabase.get_laudos_by_user(current_user['id'])
        
        logger.info(f"Usuário {current_user['username']} acessou {len(laudos)} laudos")
        return laudos or []
    
    except Exception as e:
        logger.error(f"Erro ao buscar laudos: {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar laudos")

@app.get("/laudos/approval")
def get_laudos_for_approval(current_user: Dict[str, Any] = Depends(get_current_user)) -> List[Dict[str, Any]]:
    """Lista laudos para aprovação baseado no tipo de usuário"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Filtrar laudos baseado no tipo de usuário
        if current_user['is_admin']:
            # Admin vê todos os laudos
            cursor.execute("""
                SELECT l.*, u.username as user_name 
                FROM laudos l 
                LEFT JOIN users u ON l.user_id = u.id 
                WHERE l.status != 'finalizado'
                ORDER BY l.created_at DESC
            """)
        elif current_user['user_type'] == 'encarregado':
            # Encarregado vê laudos que podem ser aprovados para manutenção
            cursor.execute("""
                SELECT l.*, u.username as user_name 
                FROM laudos l 
                LEFT JOIN users u ON l.user_id = u.id 
                WHERE l.status IN ('em_andamento', 'aprovado_vendas') AND l.status != 'finalizado'
                ORDER BY l.created_at DESC
            """)
        elif current_user['user_type'] == 'vendedor':
            # Vendedor vê laudos que podem ser aprovados para vendas
            cursor.execute("""
                SELECT l.*, u.username as user_name 
                FROM laudos l 
                LEFT JOIN users u ON l.user_id = u.id 
                WHERE l.status IN ('em_andamento', 'aprovado_manutencao') AND l.status != 'finalizado'
                ORDER BY l.created_at DESC
            """)
        else:
            # Usuários sem permissão de aprovação
            logger.warning(f"Usuário {current_user['username']} tentou acessar painel de aprovação sem permissão")
            conn.close()
            return []
        
        laudos = []
        for row in cursor.fetchall():
            laudo_dict = dict(row)
            laudos.append(laudo_dict)
        
        conn.close()
        
        logger.info(f"Usuário {current_user['username']} ({current_user['user_type']}) acessou {len(laudos)} laudos para aprovação")
        return laudos
    
    except Exception as e:
        logger.error(f"Erro ao buscar laudos para aprovação: {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar laudos para aprovação")

@app.get("/laudos/finalized")
def get_finalized_laudos(current_user: Dict[str, Any] = Depends(get_current_user)) -> List[Dict[str, Any]]:
    """Retorna todos os laudos finalizados - acesso para todos os usuários"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Todos os usuários podem ver laudos finalizados
        cursor.execute("""
            SELECT l.*, u.username as user_name 
            FROM laudos l 
            LEFT JOIN users u ON l.user_id = u.id 
            WHERE l.status = 'finalizado'
            ORDER BY l.updated_at DESC, l.created_at DESC
        """)
        
        laudos = []
        for row in cursor.fetchall():
            laudo_dict = dict(row)
            laudos.append(laudo_dict)
        
        conn.close()
        
        logger.info(f"Usuário {current_user['username']} ({current_user['user_type']}) acessou {len(laudos)} laudos finalizados")
        return laudos
        
    except Exception as e:
        logger.error(f"Erro ao buscar laudos finalizados: {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar laudos finalizados")

@app.post("/laudos", status_code=201)
def create_laudo(laudo: LaudoSimples, current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Cria um novo laudo simples"""
    try:
        # Sanitizar dados de entrada
        laudo_data = {
            'cliente': sanitize_string(laudo.cliente, 200),
            'equipamento': sanitize_string(laudo.equipamento, 200),
            'problema_relatado': sanitize_string(laudo.problema_relatado, 1000),
            'diagnostico': sanitize_string(laudo.diagnostico, 1000),
            'solucao': sanitize_string(laudo.solucao, 1000)
        }
        
        created_laudo = LaudoDatabase.create_laudo(current_user['id'], laudo_data)
        
        if created_laudo:
            logger.info(f"Laudo criado pelo usuário {current_user['username']} (ID: {created_laudo.get('id')})")
            return created_laudo
        else:
            raise HTTPException(status_code=400, detail="Erro ao criar laudo")
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao criar laudo: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# ✅ CORREÇÃO: Endpoint para buscar laudo por ID (necessário para editor/visualizador)
@app.get("/laudos/{laudo_id}")
def get_laudo_by_id(laudo_id: int, current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Busca um laudo específico por ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Buscar o laudo
        cursor.execute("""
            SELECT l.*, u.username as user_name 
            FROM laudos l 
            LEFT JOIN users u ON l.user_id = u.id 
            WHERE l.id = ?
        """, (laudo_id,))
        
        laudo = cursor.fetchone()
        
        if not laudo:
            raise HTTPException(status_code=404, detail="Laudo não encontrado")
        
        # Verificar permissões
        if not current_user['is_admin'] and laudo['user_id'] != current_user['id']:
            raise HTTPException(status_code=403, detail="Acesso negado")
        
        # Converter para dicionário
        laudo_dict = dict(laudo)
        
        # Buscar informações de aprovação se houver
        if laudo['approved_by']:
            cursor.execute("SELECT username FROM users WHERE id = ?", (laudo['approved_by'],))
            approved_user = cursor.fetchone()
            if approved_user:
                laudo_dict['approved_by_name'] = approved_user['username']
        
        conn.close()
        
        logger.info(f"Laudo {laudo_id} acessado pelo usuário {current_user['username']}")
        return laudo_dict
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar laudo {laudo_id}: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")

@app.get("/admin/privileges")
def get_all_privileges(current_user: Dict[str, Any] = Depends(get_current_user)) -> List[Dict[str, Any]]:
    """Retorna todos os privilégios do sistema (apenas admin)"""
    try:
        if not current_user['is_admin']:
            raise HTTPException(status_code=403, detail="Acesso negado")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT up.id, up.user_id, up.privilege_type, up.granted_by, up.granted_at, up.is_active,
                   u.username as user_name, g.username as granted_by_name
            FROM user_privileges up
            JOIN users u ON up.user_id = u.id
            JOIN users g ON up.granted_by = g.id
            ORDER BY up.granted_at DESC
        """)
        
        privileges = []
        for row in cursor.fetchall():
            privileges.append({
                'id': row[0],
                'user_id': row[1],
                'privilege_type': row[2],
                'granted_by': row[3],
                'granted_at': row[4],
                'is_active': bool(row[5]),
                'user_name': row[6],
                'granted_by_name': row[7]
            })
        
        conn.close()
        return privileges
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar privilégios: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.post("/admin/privileges")
def create_privilege(privilege_data: dict, current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Cria um novo privilégio (admin e encarregado)"""
    try:
        if not current_user['is_admin'] and current_user.get('user_type') != 'encarregado':
            raise HTTPException(status_code=403, detail="Acesso negado")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar se o usuário existe
        cursor.execute('SELECT id, user_type FROM users WHERE id = ?', (privilege_data['user_id'],))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        user_id, user_type = user
        
        if user_type != 'tecnico':
            raise HTTPException(status_code=400, detail="Privilégios só podem ser concedidos a técnicos")
        
        # Verificar se já tem o privilégio ativo
        cursor.execute('''
            SELECT id FROM user_privileges 
            WHERE user_id = ? AND privilege_type = ? AND is_active = TRUE
        ''', (user_id, privilege_data['privilege_type']))
        
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Usuário já possui este privilégio")
        
        # Criar privilégio
        cursor.execute('''
            INSERT INTO user_privileges (user_id, privilege_type, granted_by)
            VALUES (?, ?, ?)
        ''', (user_id, privilege_data['privilege_type'], current_user['id']))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Privilégio {privilege_data['privilege_type']} concedido ao usuário {user_id} por {current_user['username']}")
        
        return {"message": "Privilégio concedido com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar privilégio: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.delete("/admin/privileges/{user_id}/{privilege_type}")
def revoke_privilege(user_id: int, privilege_type: str, current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Revoga um privilégio (admin e encarregado)"""
    try:
        if not current_user['is_admin'] and current_user.get('user_type') != 'encarregado':
            raise HTTPException(status_code=403, detail="Acesso negado")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Revogar privilégio
        cursor.execute('''
            UPDATE user_privileges 
            SET is_active = FALSE 
            WHERE user_id = ? AND privilege_type = ? AND is_active = TRUE
        ''', (user_id, privilege_type))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Privilégio não encontrado ou já revogado")
        
        conn.commit()
        conn.close()
        
        logger.info(f"Privilégio {privilege_type} revogado do usuário {user_id} por {current_user['username']}")
        
        return {"message": "Privilégio revogado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao revogar privilégio: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.get("/user/privileges")
def get_user_privileges(current_user: Dict[str, Any] = Depends(get_current_user)) -> List[str]:
    """Retorna os privilégios do usuário atual"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT privilege_type 
            FROM user_privileges 
            WHERE user_id = ? AND is_active = TRUE
        """, (current_user['id'],))
        
        privileges = [row[0] for row in cursor.fetchall()]
        conn.close()
        
        return privileges
        
    except Exception as e:
        logger.error(f"Erro ao buscar privilégios do usuário: {e}")
        return []

@app.get("/laudo-viewer/{laudo_id}")
def get_laudo_for_viewer(laudo_id: int) -> HTMLResponse:
    """Rota pública para visualização de laudos"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Buscar o laudo
        cursor.execute("""
            SELECT l.*, u.username as user_name 
            FROM laudos l 
            LEFT JOIN users u ON l.user_id = u.id 
            WHERE l.id = ?
        """, (laudo_id,))
        
        laudo = cursor.fetchone()
        conn.close()
        
        if not laudo:
            return HTMLResponse(content="<h1>Laudo não encontrado</h1>", status_code=404)
        
        # Gerar HTML do laudo
        laudo_dict = dict(laudo)
        html_content = generate_laudo_html(laudo_dict, print_mode=False)
        
        return HTMLResponse(content=html_content)
        
    except Exception as e:
        logger.error(f"Erro ao gerar visualização do laudo {laudo_id}: {e}")
        return HTMLResponse(content="<h1>Erro ao carregar laudo</h1>", status_code=500)

# ✅ CORREÇÃO: Endpoint para atualizar laudo (necessário para editor)
@app.put("/laudos/{laudo_id}")
def update_laudo(laudo_id: int, laudo_data: dict, current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Atualiza um laudo existente"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar se o laudo existe
        cursor.execute("SELECT user_id FROM laudos WHERE id = ?", (laudo_id,))
        laudo = cursor.fetchone()
        
        if not laudo:
            raise HTTPException(status_code=404, detail="Laudo não encontrado")
        
        # Verificar permissões - permitir aprovação para Encarregado e Vendedor
        if not current_user['is_admin'] and laudo['user_id'] != current_user['id']:
            # Verificar se o usuário tem permissão de aprovação
            if current_user['user_type'] not in ['encarregado', 'vendedor']:
                raise HTTPException(status_code=403, detail="Acesso negado")
            
            # Para usuários com permissão de aprovação, verificar se estão apenas alterando o status
            if 'status' not in laudo_data or len(laudo_data) > 2:  # status + observacoes
                raise HTTPException(status_code=403, detail="Usuários de aprovação só podem alterar status e observações")
        
        # Sanitizar dados de entrada
        sanitized_data = {}
        for field in ['cliente', 'equipamento', 'diagnostico', 'solucao', 'status']:
            if field in laudo_data:
                sanitized_data[field] = sanitize_string(str(laudo_data[field]), 1000)
        
        # Atualizar o laudo
        update_fields = []
        update_values = []
        
        for field, value in sanitized_data.items():
            update_fields.append(f"{field} = ?")
            update_values.append(value)
        
        update_values.append(datetime.now().isoformat())  # updated_at
        update_values.append(laudo_id)  # WHERE id = ?
        
        query = f"""
            UPDATE laudos 
            SET {', '.join(update_fields)}, updated_at = ? 
            WHERE id = ?
        """
        
        cursor.execute(query, update_values)
        conn.commit()
        
        # Buscar o laudo atualizado
        cursor.execute("""
            SELECT l.*, u.username as user_name 
            FROM laudos l 
            LEFT JOIN users u ON l.user_id = u.id 
            WHERE l.id = ?
        """, (laudo_id,))
        
        updated_laudo = cursor.fetchone()
        conn.close()
        
        logger.info(f"Laudo {laudo_id} atualizado pelo usuário {current_user['username']}")
        return dict(updated_laudo)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar laudo {laudo_id}: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")

# ✅ CORREÇÃO: Sistema de notificações real
@app.get('/api/notifications')
def get_notifications(current_user: Dict[str, Any] = Depends(get_current_user)):
    try:
        # Buscar notificações do usuário atual
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar se a tabela notifications existe
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='notifications'
        """)
        
        if not cursor.fetchone():
            # Se a tabela não existe, criar ela
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    type TEXT NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    read BOOLEAN DEFAULT FALSE,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            conn.commit()
        
        cursor.execute("""
            SELECT id, type, message, created_at, read 
            FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 50
        """, (current_user['id'],))
        
        notifications = []
        for row in cursor.fetchall():
            notifications.append({
                'id': row[0],
                'type': row[1],
                'message': row[2],
                'created_at': row[3],
                'read': bool(row[4])
            })
        
        conn.close()
        return notifications
    except Exception as e:
        logger.error(f"Erro ao buscar notificações: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return []

@app.put('/api/notifications/{notification_id}/read')
def mark_notification_read(notification_id: int, current_user: Dict[str, Any] = Depends(get_current_user)):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar se a tabela notifications existe
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='notifications'
        """)
        
        if not cursor.fetchone():
            # Se a tabela não existe, criar ela
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    type TEXT NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    read BOOLEAN DEFAULT FALSE,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            conn.commit()
        
        cursor.execute("""
            UPDATE notifications 
            SET read = 1 
            WHERE id = ? AND user_id = ?
        """, (notification_id, current_user['id']))
        
        conn.commit()
        conn.close()
        
        return {"message": "Notificação marcada como lida"}
    except Exception as e:
        logger.error(f"Erro ao marcar notificação como lida: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Erro interno")

def create_notification(user_id: int, notification_type: str, message: str):
    """Função auxiliar para criar notificações"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO notifications (user_id, type, message, created_at, read)
            VALUES (?, ?, ?, datetime('now'), 0)
        """, (user_id, notification_type, message))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Erro ao criar notificação: {e}")

# === ROTAS DE PDF ===
@app.get("/laudos/{laudo_id}/pdf")
def generate_laudo_pdf(
    laudo_id: int, 
    current_user: Dict[str, Any] = Depends(get_current_user),
    download: bool = Query(False, description="Baixar PDF"),
    print: bool = Query(False, description="Modo impressão")
):
    """Gera PDF do laudo técnico"""
    try:
        # Buscar dados do laudo
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT l.*, u.username as user_name 
            FROM laudos l 
            LEFT JOIN users u ON l.user_id = u.id 
            WHERE l.id = ?
        """, (laudo_id,))
        
        laudo = cursor.fetchone()
        conn.close()
        
        if not laudo:
            raise HTTPException(status_code=404, detail="Laudo não encontrado")
        
        # Converter para dicionário
        laudo_dict = dict(laudo)
        
        # Gerar HTML do PDF
        html_content = generate_laudo_html(laudo_dict, print)
        
        # Se for download, retornar como arquivo
        if download:
            return HTMLResponse(
                content=html_content,
                headers={
                    "Content-Disposition": f"attachment; filename=laudo_{laudo_id}.html"
                }
            )
        
        # Se for impressão, retornar HTML otimizado para impressão
        if print:
            return HTMLResponse(content=html_content)
        
        # Retorno normal (visualização)
        return HTMLResponse(content=html_content)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao gerar PDF do laudo {laudo_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro ao gerar PDF")

def generate_laudo_html(laudo: Dict[str, Any], print_mode: bool = False) -> str:
    """Gera HTML formatado para o laudo"""
    
    # Formatar data
    data_criacao = datetime.fromisoformat(laudo['created_at']).strftime('%d/%m/%Y às %H:%M')
    data_atualizacao = datetime.fromisoformat(laudo['updated_at']).strftime('%d/%m/%Y às %H:%M') if laudo['updated_at'] else 'Não atualizado'
    
    # Status com cores
    status_info = {
        'em_andamento': {'label': 'Em Andamento', 'color': '#f59e0b'},
        'pendente': {'label': 'Pendente', 'color': '#3b82f6'},
        'ap_manutencao': {'label': 'Aprovado - Manutenção', 'color': '#10b981'},
        'aguardando_orcamento': {'label': 'Aguardando Orçamento', 'color': '#8b5cf6'},
        'ap_vendas': {'label': 'Aprovado - Vendas', 'color': '#6366f1'},
        'finalizado': {'label': 'Finalizado', 'color': '#059669'},
        'reprovado': {'label': 'Reprovado', 'color': '#ef4444'}
    }
    
    status = status_info.get(laudo['status'], {'label': laudo['status'], 'color': '#6b7280'})
    
    html = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Laudo Técnico #{laudo['id']} - RSM Moura</title>
        <style>
            @media print {{
                body {{ margin: 0; padding: 20px; }}
                .no-print {{ display: none !important; }}
                .page-break {{ page-break-before: always; }}
            }}
            
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }}
            
            .header {{
                text-align: center;
                border-bottom: 3px solid #1e40af;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }}
            
            .logo {{
                font-size: 24px;
                font-weight: bold;
                color: #1e40af;
                margin-bottom: 10px;
            }}
            
            .title {{
                font-size: 28px;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 5px;
            }}
            
            .subtitle {{
                font-size: 16px;
                color: #6b7280;
                margin-bottom: 20px;
            }}
            
            .laudo-info {{
                background: white;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }}
            
            .info-grid {{
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }}
            
            .info-item {{
                display: flex;
                flex-direction: column;
            }}
            
            .info-label {{
                font-weight: 600;
                color: #374151;
                margin-bottom: 5px;
                font-size: 14px;
            }}
            
            .info-value {{
                color: #1f2937;
                font-size: 16px;
            }}
            
            .status-badge {{
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                color: white;
                background-color: {status['color']};
            }}
            
            .section {{
                background: white;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }}
            
            .section-title {{
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 15px;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 8px;
            }}
            
            .content-text {{
                color: #374151;
                line-height: 1.7;
                text-align: justify;
            }}
            
            .footer {{
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }}
            
            .signature-section {{
                margin-top: 40px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
            }}
            
            .signature-box {{
                text-align: center;
                padding: 20px;
                border-top: 2px solid #1e40af;
            }}
            
            .signature-line {{
                width: 200px;
                height: 1px;
                background-color: #1e40af;
                margin: 40px auto 10px;
            }}
            
            .print-button {{
                position: fixed;
                top: 20px;
                right: 20px;
                background: #1e40af;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }}
            
            .print-button:hover {{
                background: #1e3a8a;
            }}
        </style>
    </head>
    <body>
        <button class="print-button no-print" onclick="window.print()">🖨️ Imprimir</button>
        
        <div class="header">
            <div class="logo">🔋 RSM - Rede de Serviços Moura</div>
            <h1 class="title">Laudo Técnico</h1>
            <p class="subtitle">Sistema de Gestão de Laudos Técnicos</p>
        </div>
        
        <div class="laudo-info">
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Número do Laudo:</span>
                    <span class="info-value">#{laudo['id']}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Status:</span>
                    <span class="status-badge">{status['label']}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Cliente:</span>
                    <span class="info-value">{laudo.get('cliente', 'Não informado')}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Equipamento:</span>
                    <span class="info-value">{laudo.get('equipamento', 'Não informado')}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Técnico Responsável:</span>
                    <span class="info-value">{laudo.get('user_name', 'Não informado')}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Data de Criação:</span>
                    <span class="info-value">{data_criacao}</span>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">Problema Relatado</h2>
            <p class="content-text">{laudo.get('problema_relatado', 'Não informado')}</p>
        </div>
        
        <div class="section">
            <h2 class="section-title">Diagnóstico Técnico</h2>
            <p class="content-text">{laudo.get('diagnostico', 'Não informado')}</p>
        </div>
        
        <div class="section">
            <h2 class="section-title">Solução Aplicada</h2>
            <p class="content-text">{laudo.get('solucao', 'Não informado')}</p>
        </div>
        
        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line"></div>
                <p><strong>{laudo.get('user_name', 'Técnico Responsável')}</strong></p>
                <p>Técnico Responsável</p>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <p><strong>Cliente</strong></p>
                <p>Assinatura</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Documento gerado automaticamente pelo sistema RSM - Rede de Serviços Moura</p>
            <p>Última atualização: {data_atualizacao}</p>
        </div>
    </body>
    </html>
    """
    
    return html

# === ROTAS ADMINISTRATIVAS ===
@app.get("/admin/stats")
def get_admin_stats(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Estatísticas para o dashboard administrativo"""
    if not current_user.get('is_admin') and current_user.get('user_type') != 'encarregado':
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Total de laudos
        cursor.execute("SELECT COUNT(*) FROM laudos")
        total_laudos = cursor.fetchone()[0]
        
        # Laudos hoje
        cursor.execute("SELECT COUNT(*) FROM laudos WHERE DATE(created_at) = DATE('now')")
        laudos_hoje = cursor.fetchone()[0]
        
        # Laudos da semana
        cursor.execute("SELECT COUNT(*) FROM laudos WHERE created_at >= DATE('now', '-7 days')")
        laudos_semana = cursor.fetchone()[0]
        
        # Laudos do mês
        cursor.execute("SELECT COUNT(*) FROM laudos WHERE created_at >= DATE('now', '-30 days')")
        laudos_mes = cursor.fetchone()[0]
        
        # Calcular laudos pendentes e aprovados
        cursor.execute("SELECT COUNT(*) FROM laudos WHERE status = 'em_andamento'")
        laudos_pendentes = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM laudos WHERE status IN ('aprovado_manutencao', 'aprovado_vendas', 'finalizado')")
        laudos_aprovados = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "total_laudos": total_laudos,
            "laudos_pendentes": laudos_pendentes,
            "laudos_aprovados": laudos_aprovados,
            "laudos_hoje": laudos_hoje,
            "laudos_semana": laudos_semana,
            "laudos_mes": laudos_mes
        }
        
    except Exception as e:
        logger.error(f"Erro ao buscar estatísticas: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.get("/admin/defeitos-frequentes")
def get_defeitos_frequentes(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Defeitos mais frequentes nos laudos"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Buscar diagnósticos mais frequentes
        cursor.execute("""
            SELECT diagnostico, COUNT(*) as quantidade
            FROM laudos 
            WHERE diagnostico IS NOT NULL AND diagnostico != ''
            GROUP BY diagnostico 
            ORDER BY quantidade DESC 
            LIMIT 5
        """)
        
        defeitos = []
        total = 0
        for row in cursor.fetchall():
            defeitos.append({
                "defeito": row[0],
                "quantidade": row[1]
            })
            total += row[1]
        
        # Calcular percentuais
        for defeito in defeitos:
            defeito["percentual"] = round((defeito["quantidade"] / total) * 100, 1) if total > 0 else 0
        
        conn.close()
        return defeitos
        
    except Exception as e:
        logger.error(f"Erro ao buscar defeitos frequentes: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.get("/admin/laudos-recentes")
def get_laudos_recentes(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Laudos mais recentes"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT l.id, l.cliente, l.equipamento, l.diagnostico, l.created_at, u.username
            FROM laudos l
            LEFT JOIN users u ON l.user_id = u.id
            ORDER BY l.created_at DESC
            LIMIT 10
        """)
        
        laudos = []
        for row in cursor.fetchall():
            laudos.append({
                "id": row[0],
                "cliente": row[1],
                "equipamento": row[2],
                "diagnostico": row[3],
                "data": row[4],
                "tecnico": row[5]
            })
        
        conn.close()
        return laudos
        
    except Exception as e:
        logger.error(f"Erro ao buscar laudos recentes: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# === ROTAS DE GERENCIAMENTO DE USUÁRIOS ===
@app.get("/admin/users")
def get_users(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Lista todos os usuários (admin e encarregado)"""
    if not current_user.get('is_admin') and current_user.get('user_type') != 'encarregado':
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, username, is_admin, user_type, created_at
            FROM users 
            ORDER BY username
        """)
        
        users = []
        for row in cursor.fetchall():
            users.append({
                "id": row[0],
                "username": row[1],
                "is_admin": bool(row[2]),
                "user_type": row[3],
                "created_at": row[4]
            })
        
        conn.close()
        return users
        
    except Exception as e:
        logger.error(f"Erro ao buscar usuários: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.post("/admin/users")
def create_user(user_data: dict, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Cria novo usuário (admin e encarregado)"""
    if not current_user.get('is_admin') and current_user.get('user_type') != 'encarregado':
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    try:
        # Validar dados de entrada
        if not isinstance(user_data, dict):
            raise HTTPException(status_code=400, detail="Dados inválidos")
        
        username = user_data.get('username', '').strip()
        password = user_data.get('password', '').strip()
        user_type = user_data.get('user_type', 'tecnico')
        is_admin = user_data.get('is_admin', False)
        
        if not username or not password:
            raise HTTPException(status_code=400, detail="Username e senha são obrigatórios")
        
        if len(password) < 6:
            raise HTTPException(status_code=400, detail="Senha deve ter pelo menos 6 caracteres")
        
        if user_type not in ['tecnico', 'vendedor', 'admin', 'encarregado']:
            raise HTTPException(status_code=400, detail="Tipo de usuário inválido")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar se username já existe
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=400, detail="Username já existe")
        
        # Criar usuário
        hashed_password = hash_password(password)
        cursor.execute("""
            INSERT INTO users (username, password_hash, is_admin, user_type, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))
        """, (username, hashed_password, is_admin, user_type))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        logger.info(f"Usuário {username} criado pelo admin {current_user['username']}")
        return {"message": "Usuário criado com sucesso", "user_id": user_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar usuário: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")

@app.put("/admin/users/{user_id}")
def update_user(user_id: int, user_data: dict, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Atualiza usuário (admin e encarregado)"""
    if not current_user.get('is_admin') and current_user.get('user_type') != 'encarregado':
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar se usuário existe
        cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        # Preparar campos para atualização
        update_fields = []
        update_values = []
        
        if 'username' in user_data:
            username = user_data['username'].strip()
            if username:
                # Verificar se username já existe (exceto o próprio usuário)
                cursor.execute("SELECT id FROM users WHERE username = ? AND id != ?", (username, user_id))
                if cursor.fetchone():
                    conn.close()
                    raise HTTPException(status_code=400, detail="Username já existe")
                update_fields.append("username = ?")
                update_values.append(username)
        
        if 'user_type' in user_data:
            update_fields.append("user_type = ?")
            update_values.append(user_data['user_type'])
        
        if 'is_admin' in user_data:
            update_fields.append("is_admin = ?")
            update_values.append(user_data['is_admin'])
        
        if 'password' in user_data and user_data['password'].strip():
            password = user_data['password'].strip()
            if len(password) < 6:
                conn.close()
                raise HTTPException(status_code=400, detail="Senha deve ter pelo menos 6 caracteres")
            update_fields.append("password_hash = ?")
            update_values.append(hash_password(password))
        
        if update_fields:
            update_values.append(user_id)
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, update_values)
            conn.commit()
        
        conn.close()
        
        logger.info(f"Usuário {user_id} atualizado pelo admin {current_user['username']}")
        return {"message": "Usuário atualizado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar usuário {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Deleta usuário (apenas admin)"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    try:
        # Não permitir deletar o próprio usuário
        if user_id == current_user['id']:
            raise HTTPException(status_code=400, detail="Não é possível deletar seu próprio usuário")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar se usuário existe
        cursor.execute("SELECT username FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            conn.close()
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        # Deletar usuário
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        conn.close()
        
        logger.info(f"Usuário {user[0]} deletado pelo admin {current_user['username']}")
        return {"message": "Usuário deletado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao deletar usuário {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# ✅ CORREÇÃO: Rotas de configurações que estavam faltando
@app.get("/admin/settings")
def get_admin_settings(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Configurações do administrador"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    return {
        "system_name": "RSM - Rede de Serviços Moura",
        "version": "2.0.0",
        "admin_email": "admin@moura.com",
        "support_phone": "+55 81 99999-9999"
    }

@app.get("/admin/audit-log")
def get_audit_log(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Log de auditoria do sistema"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    # Simular log de auditoria
    return [
        {
            "id": 1,
            "action": "login",
            "user": "admin",
            "timestamp": datetime.now().isoformat(),
            "details": "Login realizado com sucesso"
        },
        {
            "id": 2,
            "action": "create_user",
            "user": "admin",
            "timestamp": datetime.now().isoformat(),
            "details": "Usuário técnico criado"
        }
    ]

@app.get("/admin/sectors")
def get_sectors(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Lista todos os setores disponíveis"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    sectors = [
        {"id": "vendas", "name": "Vendas", "description": "Equipe de vendas"},
        {"id": "manutencao", "name": "Manutenção", "description": "Equipe técnica de manutenção"},
        {"id": "supervisao", "name": "Supervisão", "description": "Supervisores e coordenadores"},
        {"id": "liderados", "name": "Liderados", "description": "Equipe liderada"},
        {"id": "admin", "name": "Administração", "description": "Administradores do sistema"}
    ]
    
    return sectors

# === ENDPOINTS DE MONITORAMENTO ===

@app.get("/health")
def health_check():
    """Endpoint de health check para monitoramento de produção"""
    try:
        # Verificar conexão com banco
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        conn.close()
        
        # Verificar OpenAI se configurada
        openai_status = "configured" if is_openai_configured() else "not_configured"
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "environment": os.getenv("ENVIRONMENT", "development"),
            "database": "connected",
            "openai": openai_status,
            "version": "2.0.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

@app.get("/admin/executive-stats")
def get_executive_stats(current_user: Dict[str, Any] = Depends(get_current_user), period: str = Query("month")):
    """Estatísticas executivas para dashboard"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    try:
        # Simular dados executivos (em produção, seria calculado)
        stats = {
            "totalRevenue": 1250000,
            "averageTicket": 850,
            "conversionRate": 87.5,
            "customerSatisfaction": 94.2,
            "totalLaudos": 1472,
            "laudosThisMonth": 156,
            "averageProcessingTime": 2.3,
            "qualityScore": 96.8,
            "activeTechnicians": 24,
            "technicianProductivity": 89.3,
            "averageApprovalTime": 1.8,
            "teamEfficiency": 92.1,
            "monthlyGrowth": 15.7,
            "weeklyTrend": 8.3,
            "dailyActivity": 12,
            "forecastNextMonth": 180
        }
        
        return stats
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas executivas: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.get("/admin/top-performers")
def get_top_performers(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Top performers da equipe"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    try:
        performers = [
            {"name": "João Silva", "laudos": 45, "quality": 98.5, "efficiency": 95.2},
            {"name": "Maria Santos", "laudos": 42, "quality": 97.8, "efficiency": 93.8},
            {"name": "Pedro Costa", "laudos": 38, "quality": 96.9, "efficiency": 91.5},
            {"name": "Ana Oliveira", "laudos": 35, "quality": 95.7, "efficiency": 89.3}
        ]
        
        return performers
    except Exception as e:
        logger.error(f"Erro ao obter top performers: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.get("/admin/critical-issues")
def get_critical_issues(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Issues críticos do sistema"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    try:
        issues = [
            {"type": "Bateria Crítica", "count": 3, "priority": "Alta", "location": "São Paulo"},
            {"type": "Manutenção Urgente", "count": 2, "priority": "Média", "location": "Rio de Janeiro"},
            {"type": "Substituição Necessária", "count": 1, "priority": "Alta", "location": "Belo Horizonte"}
        ]
        
        return issues
    except Exception as e:
        logger.error(f"Erro ao obter issues críticos: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.get("/admin/recent-activities")
def get_recent_activities(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Atividades recentes do sistema"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    try:
        activities = [
            {"description": "Laudo técnico criado", "timestamp": "2024-01-15 14:30", "user": "João Silva"},
            {"description": "Aprovação de manutenção", "timestamp": "2024-01-15 14:25", "user": "Maria Santos"},
            {"description": "PDF gerado", "timestamp": "2024-01-15 14:20", "user": "Pedro Costa"},
            {"description": "Gravação de áudio processada", "timestamp": "2024-01-15 14:15", "user": "Ana Oliveira"},
            {"description": "Laudo finalizado", "timestamp": "2024-01-15 14:10", "user": "Carlos Lima"}
        ]
        
        return activities
    except Exception as e:
        logger.error(f"Erro ao obter atividades recentes: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.get("/admin/alerts")
def get_alerts(current_user: Dict[str, Any] = Depends(get_current_user), limit: int = Query(10)):
    """Alertas do sistema"""
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    try:
        return health_checker.get_recent_alerts(limit)
    except Exception as e:
        logger.error(f"Erro ao obter alertas: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# ✅ CORREÇÃO: Rota para laudos avançados
@app.post("/laudos/{laudo_id}/tag")
def update_laudo_tag(laudo_id: int, tag_data: TagUpdate, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Atualiza a tag de um laudo e notifica todos os usuários"""
    try:
        db = get_db_connection()
        cursor = db.cursor()
        
        # Verificar se o laudo existe
        cursor.execute("SELECT id, cliente, equipamento FROM laudos WHERE id = ?", (laudo_id,))
        laudo = cursor.fetchone()
        
        if not laudo:
            raise HTTPException(status_code=404, detail="Laudo não encontrado")
        
        # Atualizar a tag do laudo
        cursor.execute(
            "UPDATE laudos SET tag = ?, tag_description = ?, tag_updated_at = ?, tag_updated_by = ? WHERE id = ?",
            (tag_data.tag, tag_data.description, datetime.now(), current_user['username'], laudo_id)
        )
        
        # Criar notificação para todos os usuários
        message = f"🏷️ Nova tag '{tag_data.tag}' adicionada ao laudo #{laudo_id} - {laudo[1]} ({laudo[2]}) por {current_user['username']}"
        if tag_data.description:
            message += f" - {tag_data.description}"
        
        # Buscar todos os usuários
        cursor.execute("SELECT id FROM users")
        users = cursor.fetchall()
        
        # Criar notificação para cada usuário
        for user in users:
            cursor.execute(
                "INSERT INTO notifications (user_id, type, message, created_at, read) VALUES (?, ?, ?, ?, ?)",
                (user[0], 'tag_update', message, datetime.now(), 0)
            )
        
        db.commit()
        
        logger.info(f"Tag '{tag_data.tag}' adicionada ao laudo {laudo_id} por {current_user['username']}")
        
        return {
            "success": True,
            "message": f"Tag '{tag_data.tag}' adicionada com sucesso",
            "laudo_id": laudo_id,
            "tag": tag_data.tag,
            "notifications_sent": len(users)
        }
        
    except Exception as e:
        logger.error(f"Erro ao atualizar tag: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")
    finally:
        if 'db' in locals():
            db.close()

@app.get("/stats")
def get_stats(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retorna estatísticas gerais do sistema"""
    try:
        db = get_db_connection()
        cursor = db.cursor()
        
        # Total de laudos
        cursor.execute("SELECT COUNT(*) FROM laudos")
        total_laudos = cursor.fetchone()[0]
        
        # Laudos hoje
        cursor.execute("SELECT COUNT(*) FROM laudos WHERE DATE(created_at) = DATE('now')")
        laudos_hoje = cursor.fetchone()[0]
        
        # Laudos da semana
        cursor.execute("SELECT COUNT(*) FROM laudos WHERE created_at >= DATE('now', '-7 days')")
        laudos_semana = cursor.fetchone()[0]
        
        # Laudos do mês
        cursor.execute("SELECT COUNT(*) FROM laudos WHERE created_at >= DATE('now', '-30 days')")
        laudos_mes = cursor.fetchone()[0]
        
        # Pendentes de aprovação
        cursor.execute("SELECT COUNT(*) FROM laudos WHERE status = 'pendente'")
        pendentes_aprovacao = cursor.fetchone()[0]
        
        return {
            "totalLaudos": total_laudos,
            "laudosHoje": laudos_hoje,
            "laudosSemana": laudos_semana,
            "laudosMes": laudos_mes,
            "pendentesAprovacao": pendentes_aprovacao
        }
        
    except Exception as e:
        logger.error(f"Erro ao buscar estatísticas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")
    finally:
        if 'db' in locals():
            db.close()

@app.get("/laudos/tags/recent")
def get_recent_tags(current_user: Dict[str, Any] = Depends(get_current_user), limit: int = Query(10, ge=1, le=50)):
    """Busca tags recentes para o painel de atualizações"""
    try:
        db = get_db_connection()
        cursor = db.cursor()
        
        cursor.execute("""
            SELECT l.id, l.cliente, l.equipamento, l.tag, l.tag_description, 
                   l.tag_updated_at, l.tag_updated_by, l.status
            FROM laudos l
            WHERE l.tag IS NOT NULL AND l.tag != ''
            ORDER BY l.tag_updated_at DESC
            LIMIT ?
        """, (limit,))
        
        tags = []
        for row in cursor.fetchall():
            tags.append({
                "laudo_id": row[0],
                "cliente": row[1],
                "equipamento": row[2],
                "tag": row[3],
                "description": row[4],
                "updated_at": row[5],
                "updated_by": row[6],
                "status": row[7]
            })
        
        return {"tags": tags}
        
    except Exception as e:
        logger.error(f"Erro ao buscar tags recentes: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")
    finally:
        if 'db' in locals():
            db.close()

@app.post("/laudos/{laudo_id}/finalize")
def finalize_laudo(laudo_id: int, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Finaliza um laudo - Técnico pode finalizar a qualquer momento"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar se o laudo existe
        cursor.execute("SELECT user_id, status, cliente, equipamento FROM laudos WHERE id = ?", (laudo_id,))
        laudo = cursor.fetchone()
        
        if not laudo:
            raise HTTPException(status_code=404, detail="Laudo não encontrado")
        
        # Verificar permissões - Técnico pode finalizar seus próprios laudos, Encarregado pode finalizar qualquer um
        if not current_user['is_admin'] and laudo['user_id'] != current_user['id']:
            if current_user['user_type'] != 'encarregado':
                raise HTTPException(status_code=403, detail="Apenas o técnico responsável ou encarregado pode finalizar este laudo")
        
        # Atualizar status para finalizado
        cursor.execute(
            "UPDATE laudos SET status = ?, updated_at = ? WHERE id = ?",
            ('finalizado', datetime.now().isoformat(), laudo_id)
        )
        
        # Criar notificação para todos os usuários
        message = f"🏁 Laudo #{laudo_id} - {laudo['cliente']} ({laudo['equipamento']}) foi FINALIZADO por {current_user['username']}"
        
        # Buscar todos os usuários
        cursor.execute("SELECT id FROM users")
        users = cursor.fetchall()
        
        # Criar notificação para cada usuário
        for user in users:
            cursor.execute(
                "INSERT INTO notifications (user_id, type, message, created_at, read) VALUES (?, ?, ?, ?, ?)",
                (user[0], 'laudo_finalizado', message, datetime.now(), 0)
            )
        
        conn.commit()
        conn.close()
        
        logger.info(f"Laudo {laudo_id} finalizado pelo usuário {current_user['username']}")
        
        return {
            "success": True,
            "message": f"Laudo #{laudo_id} finalizado com sucesso",
            "laudo_id": laudo_id,
            "status": "finalizado",
            "notifications_sent": len(users)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao finalizar laudo {laudo_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")

@app.post("/laudos/{laudo_id}/approve")
def approve_laudo(laudo_id: int, approval_type: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Aprova um laudo - Encarregado aprova manutenção, Vendedor aprova orçamento"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar se o laudo existe
        cursor.execute("SELECT user_id, status, cliente, equipamento FROM laudos WHERE id = ?", (laudo_id,))
        laudo = cursor.fetchone()
        
        if not laudo:
            raise HTTPException(status_code=404, detail="Laudo não encontrado")
        
        # Verificar permissões baseado no tipo de aprovação
        if approval_type == "manutencao":
            if current_user['user_type'] not in ['encarregado', 'admin']:
                raise HTTPException(status_code=403, detail="Apenas encarregados podem aprovar manutenção")
            new_status = "aprovado_manutencao"
            approval_message = "manutenção"
        elif approval_type == "vendas":
            if current_user['user_type'] not in ['vendedor', 'admin']:
                raise HTTPException(status_code=403, detail="Apenas vendedores podem aprovar orçamento")
            new_status = "aprovado_vendas"
            approval_message = "orçamento"
        else:
            raise HTTPException(status_code=400, detail="Tipo de aprovação inválido")
        
        # Atualizar status
        cursor.execute(
            "UPDATE laudos SET status = ?, updated_at = ? WHERE id = ?",
            (new_status, datetime.now().isoformat(), laudo_id)
        )
        
        # Criar notificação para todos os usuários
        message = f"✅ Laudo #{laudo_id} - {laudo['cliente']} ({laudo['equipamento']}) teve {approval_message} APROVADO por {current_user['username']}"
        
        # Buscar todos os usuários
        cursor.execute("SELECT id FROM users")
        users = cursor.fetchall()
        
        # Criar notificação para cada usuário
        for user in users:
            cursor.execute(
                "INSERT INTO notifications (user_id, type, message, created_at, read) VALUES (?, ?, ?, ?, ?)",
                (user[0], 'laudo_aprovado', message, datetime.now(), 0)
            )
        
        conn.commit()
        conn.close()
        
        logger.info(f"Laudo {laudo_id} aprovado ({approval_type}) pelo usuário {current_user['username']}")
        
        return {
            "success": True,
            "message": f"Laudo #{laudo_id} aprovado ({approval_message}) com sucesso",
            "laudo_id": laudo_id,
            "status": new_status,
            "approval_type": approval_type,
            "notifications_sent": len(users)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao aprovar laudo {laudo_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")

@app.post("/laudos-avancados")
def create_laudo_avancado(laudo_data: dict, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Cria um novo laudo avançado"""
    try:
        # Validar dados de entrada
        if not isinstance(laudo_data, dict):
            raise HTTPException(status_code=400, detail="Dados inválidos")
        
        required_fields = ['nomeCliente', 'data', 'baterias', 'tecnicoResponsavel', 'conclusaoFinal']
        for field in required_fields:
            if field not in laudo_data or not laudo_data[field]:
                raise HTTPException(status_code=400, detail=f"Campo obrigatório: {field}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Inserir laudo avançado
        cursor.execute("""
            INSERT INTO laudos_avancados (
                user_id, nome_cliente, data, baterias, tecnico_responsavel,
                manutencao_preventiva, manutencao_corretiva, conclusao_final, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        """, (
            current_user['id'],
            laudo_data['nomeCliente'],
            laudo_data['data'],
            json.dumps(laudo_data['baterias']),
            laudo_data['tecnicoResponsavel'],
            json.dumps(laudo_data.get('manutencaoPreventiva', [])),
            json.dumps(laudo_data.get('manutencaoCorretiva', [])),
            laudo_data['conclusaoFinal']
        ))
        
        laudo_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        logger.info(f"Laudo avançado {laudo_id} criado pelo usuário {current_user['username']}")
        return {"message": "Laudo avançado criado com sucesso", "laudo_id": laudo_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar laudo avançado: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)