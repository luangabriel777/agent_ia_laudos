"""
Sistema de Banco de Dados para ART-Laudo-Técnico-Pro
Utiliza SQLite para simplicidade e facilidade de migração futura
"""

import sqlite3
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

# Configuração do banco
DB_PATH = Path(__file__).parent / "laudos.db"

def init_database():
    """Inicializa o banco de dados com as tabelas necessárias"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Tabela de usuários
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_admin BOOLEAN DEFAULT FALSE,
            user_type TEXT DEFAULT 'tecnico',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabela de laudos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS laudos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            cliente TEXT,
            equipamento TEXT,
            diagnostico TEXT,
            solucao TEXT,
            status TEXT DEFAULT 'em_andamento',
            approved_by INTEGER,
            rejection_reason TEXT,
            tag TEXT,
            tag_description TEXT,
            tag_updated_at TIMESTAMP,
            tag_updated_by TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (approved_by) REFERENCES users (id)
        )
    ''')
    
    # Tabela de estatísticas (cache para performance)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS stats_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            stat_name TEXT UNIQUE NOT NULL,
            stat_value TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # ✅ CORREÇÃO: Tabela de laudos avançados
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS laudos_avancados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            nome_cliente TEXT NOT NULL,
            data TEXT NOT NULL,
            baterias TEXT NOT NULL,
            tecnico_responsavel TEXT NOT NULL,
            manutencao_preventiva TEXT,
            manutencao_corretiva TEXT,
            conclusao_final TEXT NOT NULL,
            status TEXT DEFAULT 'pendente',
            approved_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (approved_by) REFERENCES users (id)
        )
    ''')
    
    # Inserir usuário admin padrão se não existir
    cursor.execute('SELECT COUNT(*) FROM users WHERE username = ?', ('admin',))
    if cursor.fetchone()[0] == 0:
        import hashlib
        password_hash = hashlib.sha256('123456'.encode()).hexdigest()
        cursor.execute('''
            INSERT INTO users (username, password_hash, is_admin)
            VALUES (?, ?, ?)
        ''', ('admin', password_hash, True))
    
    # Inserir usuário técnico padrão se não existir
    cursor.execute('SELECT COUNT(*) FROM users WHERE username = ?', ('tecnico',))
    if cursor.fetchone()[0] == 0:
        import hashlib
        password_hash = hashlib.sha256('123456'.encode()).hexdigest()
        cursor.execute('''
            INSERT INTO users (username, password_hash, is_admin, user_type)
            VALUES (?, ?, ?, ?)
        ''', ('tecnico', password_hash, False, 'tecnico'))
    
    # Inserir usuário vendedor padrão se não existir
    cursor.execute('SELECT COUNT(*) FROM users WHERE username = ?', ('vendedor',))
    if cursor.fetchone()[0] == 0:
        import hashlib
        password_hash = hashlib.sha256('123456'.encode()).hexdigest()
        cursor.execute('''
            INSERT INTO users (username, password_hash, is_admin, user_type)
            VALUES (?, ?, ?, ?)
        ''', ('vendedor', password_hash, False, 'vendedor'))
    
    # ✅ CORREÇÃO: Criar dados de teste para demonstração do fluxo
    # Verificar se já existem laudos de teste
    cursor.execute('SELECT COUNT(*) FROM laudos')
    total_laudos = cursor.fetchone()[0]
    
    if total_laudos == 0:
        print("🧪 Criando dados de teste para demonstração...")
        
        # Buscar IDs dos usuários
        cursor.execute('SELECT id FROM users WHERE username = ?', ('admin',))
        admin_id = cursor.fetchone()[0]
        
        cursor.execute('SELECT id FROM users WHERE username = ?', ('tecnico',))
        tecnico_result = cursor.fetchone()
        tecnico_id = tecnico_result[0] if tecnico_result else admin_id
        
        # Dados de teste para diferentes status
        test_laudos = [
            # 1. Laudo pendente para ADMIN aprovar
            {
                'user_id': tecnico_id,
                'cliente': 'Empresa ABC Ltda',
                'equipamento': 'Empilhadeira Elétrica XYZ-200',
                'diagnostico': 'Bateria tracionária apresentando perda de capacidade significativa',
                'solucao': 'Recomendada substituição da bateria por modelo 12V 100Ah',
                'status': 'pendente'
            },
            # 2. Laudo aguardando orçamento para VENDEDOR aprovar
            {
                'user_id': tecnico_id,
                'cliente': 'Transportadora Delta',
                'equipamento': 'Empilhadeira Toyota 2T',
                'diagnostico': 'Sistema de bateria com células danificadas',
                'solucao': 'Substituição completa do banco de baterias',
                'status': 'aguardando_orcamento'
            },
            # 3. Laudo aprovado (ap_vendas) para TÉCNICO executar
            {
                'user_id': tecnico_id,
                'cliente': 'Armazém Central',
                'equipamento': 'Empilhadeira Hyster 1.5T',
                'diagnostico': 'Necessidade de manutenção preventiva',
                'solucao': 'Limpeza de terminais e check-up geral',
                'status': 'ap_vendas'
            },
            # 4. Laudo finalizado (exemplo de concluído)
            {
                'user_id': tecnico_id,
                'cliente': 'Indústria Sigma',
                'equipamento': 'Empilhadeira Still 2T',
                'diagnostico': 'Manutenção corretiva em cabos',
                'solucao': 'Substituição de cabos danificados',
                'status': 'finalizado'
            }
        ]
        
        for i, laudo in enumerate(test_laudos, 1):
            cursor.execute('''
                INSERT INTO laudos (
                    user_id, cliente, equipamento, diagnostico, solucao, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'))
            ''', (
                laudo['user_id'],
                laudo['cliente'],
                laudo['equipamento'],
                laudo['diagnostico'],
                laudo['solucao'],
                laudo['status'],
                i  # Diferentes datas para variedade
            ))
        
        print(f"[OK] Criados {len(test_laudos)} laudos de teste com diferentes status")
    
    conn.commit()
    conn.close()
    print("[OK] Banco de dados inicializado com sucesso!")

def get_db_connection():
    """Retorna uma conexão com o banco de dados"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Permite acessar colunas por nome
    return conn

class LaudoDatabase:
    """Classe para gerenciar operações do banco de dados"""
    
    @staticmethod
    def create_laudo(user_id: int, laudo_data: Dict[str, Any]) -> Dict[str, Any]:
        """Cria um novo laudo no banco"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar se todos os campos obrigatórios estão preenchidos
        required_fields = ['cliente', 'equipamento', 'diagnostico', 'solucao']
        missing_fields = [field for field in required_fields if not laudo_data.get(field, '').strip()]
        
        # Definir status baseado na completude
        status = 'pendente' if len(missing_fields) == 0 else 'em_andamento'
        
        try:
            cursor.execute('''
                INSERT INTO laudos (user_id, cliente, equipamento, diagnostico, solucao, status)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                user_id,
                laudo_data.get('cliente', ''),
                laudo_data.get('equipamento', ''),
                laudo_data.get('diagnostico', ''),
                laudo_data.get('solucao', ''),
                status
            ))
            
            laudo_id = cursor.lastrowid
            conn.commit()
            
            # Retorna o laudo criado
            return LaudoDatabase.get_laudo_by_id(laudo_id)
        finally:
            conn.close()
    
    @staticmethod
    def get_laudo_by_id(laudo_id: int) -> Optional[Dict[str, Any]]:
        """Busca um laudo por ID"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT l.*, u.username as user_name, a.username as approved_by_name
                FROM laudos l
                JOIN users u ON l.user_id = u.id
                LEFT JOIN users a ON l.approved_by = a.id
                WHERE l.id = ?
            ''', (laudo_id,))
            
            row = cursor.fetchone()
            if row:
                return dict(row)
            return None
        finally:
            conn.close()
    
    @staticmethod
    def get_laudos_by_user(user_id: int, limit: int = 50) -> List[Dict[str, Any]]:
        """Busca laudos de um usuário específico"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT l.*, u.username as user_name, a.username as approved_by_name
                FROM laudos l
                JOIN users u ON l.user_id = u.id
                LEFT JOIN users a ON l.approved_by = a.id
                WHERE l.user_id = ?
                ORDER BY l.created_at DESC
                LIMIT ?
            ''', (user_id, limit))
            
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()
    
    @staticmethod
    def get_all_laudos(limit: int = 100) -> List[Dict[str, Any]]:
        """Busca todos os laudos (para admin)"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT l.*, u.username as user_name, a.username as approved_by_name
                FROM laudos l
                JOIN users u ON l.user_id = u.id
                LEFT JOIN users a ON l.approved_by = a.id
                ORDER BY l.created_at DESC
                LIMIT ?
            ''', (limit,))
            
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()
    
    @staticmethod
    def update_laudo(laudo_id: int, user_id: int, laudo_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Atualiza um laudo existente"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                UPDATE laudos 
                SET cliente = ?, equipamento = ?, diagnostico = ?, solucao = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND user_id = ?
            ''', (
                laudo_data.get('cliente', ''),
                laudo_data.get('equipamento', ''),
                laudo_data.get('diagnostico', ''),
                laudo_data.get('solucao', ''),
                laudo_id,
                user_id
            ))
            
            if cursor.rowcount > 0:
                conn.commit()
                return LaudoDatabase.get_laudo_by_id(laudo_id)
            return None
        finally:
            conn.close()
    
    @staticmethod
    def delete_laudo(laudo_id: int, user_id: int) -> bool:
        """Deleta um laudo"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('DELETE FROM laudos WHERE id = ? AND user_id = ?', (laudo_id, user_id))
            success = cursor.rowcount > 0
            conn.commit()
            return success
        finally:
            conn.close()
    
    @staticmethod
    def approve_laudo(laudo_id: int, admin_id: int) -> Optional[Dict[str, Any]]:
        """Aprova um laudo para manutenção (admin)"""
        return LaudoDatabase.update_laudo_status(laudo_id, 'aprovado_manutencao', admin_id)
    
    @staticmethod
    def update_laudo_status(laudo_id: int, new_status: str, user_id: int) -> Optional[Dict[str, Any]]:
        """Atualiza o status de um laudo no sistema multi-setor"""
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                UPDATE laudos SET status = ?, approved_by = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (new_status, user_id, laudo_id))
            if cursor.rowcount > 0:
                conn.commit()
                return LaudoDatabase.get_laudo_by_id(laudo_id)
            return None
        finally:
            conn.close()
    
    @staticmethod
    def reject_laudo(laudo_id: int, admin_id: int, rejection_reason: str = '') -> Optional[Dict[str, Any]]:
        """Recusa um laudo (admin) com motivo"""
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                UPDATE laudos SET status = 'reprovado', approved_by = ?, rejection_reason = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (admin_id, rejection_reason, laudo_id))
            if cursor.rowcount > 0:
                conn.commit()
                return LaudoDatabase.get_laudo_by_id(laudo_id)
            return None
        finally:
            conn.close()
    
    @staticmethod
    def get_pending_laudos(limit: int = 100) -> List[Dict[str, Any]]:
        """Retorna laudos em andamento para aprovação"""
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                SELECT l.*, u.username as user_name
                FROM laudos l
                JOIN users u ON l.user_id = u.id
                WHERE l.status = 'em_andamento'
                ORDER BY l.created_at DESC
                LIMIT ?
            ''', (limit,))
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()
    
    @staticmethod
    def get_approved_laudos(limit: int = 100) -> List[Dict[str, Any]]:
        """Retorna laudos aprovados"""
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                SELECT l.*, u.username as user_name
                FROM laudos l
                JOIN users u ON l.user_id = u.id
                WHERE l.status IN ('aprovado_manutencao', 'aprovado_vendas', 'finalizado')
                ORDER BY l.created_at DESC
                LIMIT ?
            ''', (limit,))
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()
    
    @staticmethod
    def get_rejected_laudos(limit: int = 100) -> List[Dict[str, Any]]:
        """Retorna laudos reprovados"""
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                SELECT l.*, u.username as user_name
                FROM laudos l
                JOIN users u ON l.user_id = u.id
                WHERE l.status = 'reprovado'
                ORDER BY l.created_at DESC
                LIMIT ?
            ''', (limit,))
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()
    
    @staticmethod
    def get_stats() -> Dict[str, Any]:
        """Retorna estatísticas gerais"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Total de laudos
            cursor.execute('SELECT COUNT(*) as total FROM laudos')
            total_laudos = cursor.fetchone()['total']
            
            # Laudos hoje
            cursor.execute('''
                SELECT COUNT(*) as hoje 
                FROM laudos 
                WHERE DATE(created_at) = DATE('now')
            ''')
            laudos_hoje = cursor.fetchone()['hoje']
            
            # Laudos esta semana
            cursor.execute('''
                SELECT COUNT(*) as semana 
                FROM laudos 
                WHERE created_at >= DATE('now', '-7 days')
            ''')
            laudos_semana = cursor.fetchone()['semana']
            
            # Laudos este mês
            cursor.execute('''
                SELECT COUNT(*) as mes 
                FROM laudos 
                WHERE created_at >= DATE('now', '-30 days')
            ''')
            laudos_mes = cursor.fetchone()['mes']
            
            return {
                'totalLaudos': total_laudos,
                'laudosHoje': laudos_hoje,
                'laudosSemana': laudos_semana,
                'laudosMes': laudos_mes
            }
        finally:
            conn.close()
    
    @staticmethod
    def get_defeitos_frequentes(limit: int = 10) -> List[Dict[str, Any]]:
        """Analisa os defeitos mais frequentes nos diagnósticos"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Busca palavras-chave comuns em diagnósticos
            cursor.execute('''
                SELECT 
                    CASE 
                        WHEN LOWER(diagnostico) LIKE '%bateria%descarregada%' THEN 'Bateria descarregada'
                        WHEN LOWER(diagnostico) LIKE '%sulfatação%' OR LOWER(diagnostico) LIKE '%sulfatacao%' THEN 'Sulfatação'
                        WHEN LOWER(diagnostico) LIKE '%célula%danificada%' OR LOWER(diagnostico) LIKE '%celula%danificada%' THEN 'Célula danificada'
                        WHEN LOWER(diagnostico) LIKE '%terminal%oxidado%' THEN 'Terminal oxidado'
                        WHEN LOWER(diagnostico) LIKE '%carga%lenta%' THEN 'Carga lenta'
                        WHEN LOWER(diagnostico) LIKE '%falha%' THEN 'Falha geral'
                        ELSE 'Outros'
                    END as defeito,
                    COUNT(*) as quantidade
                FROM laudos 
                GROUP BY defeito
                ORDER BY quantidade DESC
                LIMIT ?
            ''', (limit,))
            
            results = []
            total = sum(row['quantidade'] for row in cursor.fetchall())
            
            cursor.execute('''
                SELECT 
                    CASE 
                        WHEN LOWER(diagnostico) LIKE '%bateria%descarregada%' THEN 'Bateria descarregada'
                        WHEN LOWER(diagnostico) LIKE '%sulfatação%' OR LOWER(diagnostico) LIKE '%sulfatacao%' THEN 'Sulfatação'
                        WHEN LOWER(diagnostico) LIKE '%célula%danificada%' OR LOWER(diagnostico) LIKE '%celula%danificada%' THEN 'Célula danificada'
                        WHEN LOWER(diagnostico) LIKE '%terminal%oxidado%' THEN 'Terminal oxidado'
                        WHEN LOWER(diagnostico) LIKE '%carga%lenta%' THEN 'Carga lenta'
                        WHEN LOWER(diagnostico) LIKE '%falha%' THEN 'Falha geral'
                        ELSE 'Outros'
                    END as defeito,
                    COUNT(*) as quantidade
                FROM laudos 
                GROUP BY defeito
                ORDER BY quantidade DESC
                LIMIT ?
            ''', (limit,))
            
            for row in cursor.fetchall():
                percentual = (row['quantidade'] / total * 100) if total > 0 else 0
                results.append({
                    'defeito': row['defeito'],
                    'quantidade': row['quantidade'],
                    'percentual': round(percentual, 1)
                })
            
            return results
        finally:
            conn.close()
    
    @staticmethod
    def get_laudos_recentes(limit: int = 10) -> List[Dict[str, Any]]:
        """Retorna os laudos mais recentes"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT l.*, u.username as user_name
                FROM laudos l
                JOIN users u ON l.user_id = u.id
                ORDER BY l.created_at DESC
                LIMIT ?
            ''', (limit,))
            
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()

    @staticmethod
    def create_laudo_avancado(user_id: int, laudo_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Cria um novo laudo avançado no banco de dados"""
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            import json
            
            # ✅ CORREÇÃO: Logging detalhado
            print(f"[INFO] Iniciando criação de laudo avançado para usuário {user_id}")
            print(f"[INFO] Dados recebidos: {list(laudo_data.keys())}")
            
            # ✅ CORREÇÃO: Validar se dados obrigatórios existem
            required_fields = ['nomeCliente', 'data', 'baterias', 'tecnicoResponsavel', 'conclusaoFinal']
            for field in required_fields:
                if field not in laudo_data or not laudo_data[field]:
                    print(f"❌ Campo obrigatório ausente: {field}")
                    return None
            
            # ✅ CORREÇÃO: Preparar dados para inserção
            baterias_json = json.dumps(laudo_data.get('baterias', []))
            manutencao_preventiva_json = json.dumps(laudo_data.get('manutencaoPreventiva', []))
            manutencao_corretiva_json = json.dumps(laudo_data.get('manutencaoCorretiva', []))
            
            print(f"💾 Preparando inserção no banco...")
            
            cursor.execute('''
                INSERT INTO laudos (
                    user_id, tipo, nomeCliente, data, baterias, tecnicoResponsavel,
                    manutencaoPreventiva, manutencaoCorretiva, conclusaoFinal,
                    numeroTotalBaterias, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ''', (
                user_id,
                laudo_data.get('tipo', 'avancado'),
                laudo_data.get('nomeCliente', ''),
                laudo_data.get('data', ''),
                baterias_json,
                laudo_data.get('tecnicoResponsavel', ''),
                manutencao_preventiva_json,
                manutencao_corretiva_json,
                laudo_data.get('conclusaoFinal', ''),
                laudo_data.get('numeroTotalBaterias', 0),
                'em_andamento'
            ))
            
            laudo_id = cursor.lastrowid
            conn.commit()
            
            print(f"[OK] Laudo inserido com ID: {laudo_id}")
            
            # Buscar o laudo criado
            cursor.execute('''
                SELECT l.*, u.username as user_name 
                FROM laudos l 
                JOIN users u ON l.user_id = u.id 
                WHERE l.id = ?
            ''', (laudo_id,))
            
            laudo = cursor.fetchone()
            
            if laudo:
                result = dict(laudo)
                print(f"📄 Laudo recuperado do banco: ID={result['id']}, Cliente={result['nomeCliente']}")
                return result
            else:
                print(f"❌ Falha ao recuperar laudo criado")
                return None
            
        except json.JSONEncodeError as e:
            print(f"❌ Erro ao serializar JSON: {e}")
            conn.rollback()
            return None
        except sqlite3.Error as e:
            print(f"❌ Erro do SQLite: {e}")
            conn.rollback()
            return None
        except Exception as e:
            print(f"❌ Erro inesperado ao criar laudo avançado: {e}")
            print(f"❌ Tipo do erro: {type(e).__name__}")
            import traceback
            print(f"❌ Traceback: {traceback.format_exc()}")
            conn.rollback()
            return None
        finally:
            conn.close()
    
    @staticmethod
    def get_all_laudos_avancados() -> List[Dict[str, Any]]:
        """Obtém todos os laudos avançados"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT l.*, u.username as user_name 
                FROM laudos l 
                JOIN users u ON l.user_id = u.id 
                WHERE l.tipo = 'avancado'
                ORDER BY l.created_at DESC
            ''')
            
            laudos = cursor.fetchall()
            return [dict(laudo) for laudo in laudos]
        finally:
            conn.close()
    
    @staticmethod
    def get_approved_laudos_avancados() -> List[Dict[str, Any]]:
        """Obtém laudos avançados aprovados"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT l.*, u.username as user_name 
                FROM laudos l 
                JOIN users u ON l.user_id = u.id 
                WHERE l.tipo = 'avancado' AND l.status IN ('aprovado', 'ap_manutencao', 'aguardando_orcamento', 'orcamento_aprovado', 'finalizado')
                ORDER BY l.created_at DESC
            ''')
            
            laudos = cursor.fetchall()
            return [dict(laudo) for laudo in laudos]
        finally:
            conn.close()
    
    @staticmethod
    def get_laudos_avancados_by_user(user_id: int) -> List[Dict[str, Any]]:
        """Obtém laudos avançados de um usuário específico"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT l.*, u.username as user_name 
                FROM laudos l 
                JOIN users u ON l.user_id = u.id 
                WHERE l.user_id = ? AND l.tipo = 'avancado'
                ORDER BY l.created_at DESC
            ''', (user_id,))
            
            laudos = cursor.fetchall()
            return [dict(laudo) for laudo in laudos]
        finally:
            conn.close()
    
    @staticmethod
    def get_laudo_avancado_by_id(laudo_id: int) -> Optional[Dict[str, Any]]:
        """Obtém um laudo avançado específico"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT l.*, u.username as user_name 
                FROM laudos l 
                JOIN users u ON l.user_id = u.id 
                WHERE l.id = ? AND l.tipo = 'avancado'
            ''', (laudo_id,))
            
            laudo = cursor.fetchone()
            return dict(laudo) if laudo else None
        finally:
            conn.close()
    
    @staticmethod
    def update_laudo_avancado(laudo_id: int, user_id: int, laudo_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Atualiza um laudo avançado existente"""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            import json
            
            cursor.execute('''
                UPDATE laudos SET
                    nomeCliente = ?, data = ?, baterias = ?, tecnicoResponsavel = ?,
                    manutencaoPreventiva = ?, manutencaoCorretiva = ?, conclusaoFinal = ?,
                    numeroTotalBaterias = ?, updated_at = datetime('now')
                WHERE id = ? AND user_id = ? AND tipo = 'avancado'
            ''', (
                laudo_data.get('nomeCliente', ''),
                laudo_data.get('data', ''),
                json.dumps(laudo_data.get('baterias', [])),
                laudo_data.get('tecnicoResponsavel', ''),
                json.dumps(laudo_data.get('manutencaoPreventiva', [])),
                json.dumps(laudo_data.get('manutencaoCorretiva', [])),
                laudo_data.get('conclusaoFinal', ''),
                laudo_data.get('numeroTotalBaterias', 0),
                laudo_id,
                user_id
            ))
            
            if cursor.rowcount == 0:
                return None
                
            conn.commit()
            
            # Buscar o laudo atualizado
            return LaudoDatabase.get_laudo_avancado_by_id(laudo_id)
            
        except Exception as e:
            print(f"Erro ao atualizar laudo avançado: {e}")
            conn.rollback()
            return None
        finally:
            conn.close()

# Inicializar banco na importação
init_database() 