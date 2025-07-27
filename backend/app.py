"""
Melhorias no backend da API ART‑Laudo‑Técnico‑Pro.

Esta versão corrige problemas de segurança e adiciona operações de atualização e
remoção de laudos. Também utiliza hashing de senha simples via SHA‑256 para
armazenar credenciais no arquivo `users.json` e inclui o campo `sub` no payload
do token JWT.

ATENÇÃO: em um ambiente real, utilize bibliotecas como `passlib` e algoritmos
de hashing com salt (bcrypt, argon2) em vez de SHA‑256 simples. Este código
apenas demonstra a refatoração solicitada.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from functools import wraps
from pathlib import Path
from typing import Any, Dict, List, Optional

import hashlib
import json
import os

from fastapi import Depends, FastAPI, HTTPException, UploadFile, File, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel
from dotenv import load_dotenv
import tempfile

load_dotenv()

# Initialize application
app = FastAPI(title="ART-Laudo-Técnico-Pro")

# Enable CORS for development; restrict origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Secret key must be defined in .env; do not fall back to insecure default
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not set in the environment")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OAuth2 scheme for token retrieval
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Directory and file paths
BASE_DIR = Path(__file__).resolve().parent
USERS_FILE = BASE_DIR / "users.json"
LAUDOS_FILE = BASE_DIR / "laudos.json"

# TODO: consider moving data files to a dedicated storage directory or database


def _load_json(path: Path, default: Any) -> Any:
    """Helper to load a JSON file, returning `default` on error."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return default
    except json.JSONDecodeError:
        return default


def _save_json(path: Path, data: Any) -> None:
    """Helper to save data as JSON with UTF‑8 encoding."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def load_users() -> List[Dict[str, Any]]:
    """Load the list of users from USERS_FILE, returning an empty list on error."""
    return _load_json(USERS_FILE, [])


def load_laudos() -> List[Dict[str, Any]]:
    """Load the list of laudos from LAUDOS_FILE, returning an empty list on error."""
    return _load_json(LAUDOS_FILE, [])


def save_laudos(data: List[Dict[str, Any]]) -> None:
    """Persist the list of laudos to LAUDOS_FILE."""
    _save_json(LAUDOS_FILE, data)


def hash_password(password: str) -> str:
    """Return a SHA‑256 hash of the given password as a hex string."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def authenticate_user(username: str, password: str) -> Optional[Dict[str, Any]]:
    """Validate credentials against stored users. Returns user dict on success."""
    hashed_input = hash_password(password)
    for user in load_users():
        # We expect the user object to have a 'username' and a hashed 'password'
        if user.get("username") == username and user.get("password") == hashed_input:
            return user
    return None


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token with a subject (`sub`) and expiry."""
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = {"exp": expire, **data}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """Decode the JWT token and return the username as a dictionary."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return {"username": username}

# -----------------------------------------------------------------------------
# API endpoints
# -----------------------------------------------------------------------------



class Laudo(BaseModel):
    id: Optional[int] = None
    user: Optional[str] = None
    cliente: Optional[str] = None
    equipamento: Optional[str] = None
    diagnostico: Optional[str] = None
    solucao: Optional[str] = None


@app.get("/")
def read_root() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Dict[str, str]:
    """Authenticate a user and return a JWT access token."""
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = create_access_token({"sub": user["username"]})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/laudos")
def list_laudos(current_user: Dict[str, Any] = Depends(get_current_user)) -> List[Dict[str, Any]]:
    """Return laudos belonging to the current user."""
    return [l for l in load_laudos() if l.get("user") == current_user["username"]]


@app.post("/laudos", status_code=201)
def create_laudo(laudo: Laudo, current_user: Dict[str, Any] = Depends(get_current_user)) -> Laudo:
    """Create a new laudo for the current user."""
    laudos = load_laudos()
    # Compute next ID as max existing id + 1
    next_id = max((item.get("id", 0) for item in laudos), default=0) + 1
    laudo.id = next_id
    laudo.user = current_user["username"]
    laudos.append(laudo.dict())
    save_laudos(laudos)
    return laudo


@app.put("/laudos/{laudo_id}")
def update_laudo(laudo_id: int, laudo: Laudo, current_user: Dict[str, Any] = Depends(get_current_user)) -> Laudo:
    """Update an existing laudo by ID for the current user."""
    laudos = load_laudos()
    for idx, item in enumerate(laudos):
        if item.get("id") == laudo_id and item.get("user") == current_user["username"]:
            # Preserve id and user
            laudo.id = laudo_id
            laudo.user = current_user["username"]
            laudos[idx] = laudo.dict()
            save_laudos(laudos)
            return laudo
    raise HTTPException(status_code=404, detail="Laudo not found")


@app.delete("/laudos/{laudo_id}", status_code=204)
def delete_laudo(
    laudo_id: int, current_user: Dict[str, Any] = Depends(get_current_user)
) -> Response:
    """Delete a laudo by ID for the current user."""
    laudos = load_laudos()
    for idx, item in enumerate(laudos):
        if item.get("id") == laudo_id and item.get("user") == current_user["username"]:
            del laudos[idx]
            save_laudos(laudos)
            # Return an explicit empty response to satisfy 204 semantics
            return Response(status_code=status.HTTP_204_NO_CONTENT)
    raise HTTPException(status_code=404, detail="Laudo not found")


# -----------------------------------------------------------------------------
# Integração de áudio e IA
# -----------------------------------------------------------------------------

@app.post("/upload-audio", status_code=201)
async def upload_audio(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Recebe um arquivo de áudio enviado pelo frontend e envia para a API Whisper
    da OpenAI para transcrição. A transcrição é retornada como texto.

    Se a variável de ambiente `OPENAI_API_KEY` não estiver configurada,
    retorna uma mensagem de placeholder.

    Parâmetros
    ----------
    file : UploadFile
        O arquivo de áudio enviado pelo cliente.
    current_user : dict
        O usuário autenticado, extraído do token JWT.

    Retorna
    -------
    dict
        Um dicionário com a transcrição do áudio.
    """
    audio_bytes = await file.read()
    if os.getenv("OPENAI_API_KEY"):
        try:
            import openai
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".webm")
            tmp.write(audio_bytes)
            tmp.close()
            with open(tmp.name, "rb") as fh:
                response = openai.Audio.transcribe("whisper-1", fh)
            os.remove(tmp.name)
            transcription = response["text"]
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Erro na transcrição: {exc}")
    else:
        transcription = f"Arquivo recebido com {len(audio_bytes)} bytes (transcrição simulada)"
    return {"transcription": transcription}


@app.post("/parse-laudo")
async def parse_laudo(
    payload: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Recebe o texto transcrito do áudio e utiliza o ChatGPT para extrair
    automaticamente os campos do laudo em formato estruturado (JSON).

    TODO:
    - Validar o conteúdo recebido (`payload` deve conter uma chave `transcription`).
    - Enviar a transcrição para a API ChatGPT com um prompt adequado.
    - Tratar e retornar o JSON com os campos extraídos.
    - Lidar com possíveis erros de API e limites de uso.

    Parâmetros
    ----------
    payload : dict
        Deve conter ao menos a chave "transcription" com a string transcrita.
    current_user : dict
        O usuário autenticado, extraído do token JWT.

    Retorna
    -------
    dict
        Dicionário contendo os campos extraídos.
    """
    transcript = payload.get("transcription")
    if not transcript:
        raise HTTPException(status_code=400, detail="Campo 'transcription' não fornecido")

    if os.getenv("OPENAI_API_KEY"):
        try:
            import openai
            prompt = (
                "Extraia do texto a seguir os campos cliente, equipamento, diagnostico e solucao "
                "no formato JSON com essas mesmas chaves."\
            )
            completion = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt + "\n" + transcript}],
                temperature=0,
            )
            content = completion.choices[0].message["content"]
            campos = json.loads(content)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Erro na IA: {exc}")
    else:
        # Resposta simulada para ambientes sem chave
        campos = {
            "cliente": "N/D",
            "equipamento": "N/D",
            "diagnostico": transcript,
            "solucao": "N/D",
        }

    return campos