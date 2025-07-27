# 🚀 Scripts de Desenvolvimento - ART-Laudo-Técnico-Pro

Este documento descreve os scripts disponíveis para facilitar o desenvolvimento e teste da aplicação.

## 📋 Scripts Disponíveis

### 🟦 Windows (PowerShell)

| Script | Descrição | Uso |
|--------|-----------|-----|
| `start-dev.ps1` | Inicia backend e frontend simultaneamente | `.\start-dev.ps1` |
| `stop-dev.ps1` | Para todos os servidores | `.\stop-dev.ps1` |

### 🟩 Linux/Mac (Bash)

| Script | Descrição | Uso |
|--------|-----------|-----|
| `start-dev.sh` | Inicia backend e frontend simultaneamente | `./start-dev.sh` |
| `stop-dev.sh` | Para todos os servidores | `./stop-dev.sh` |

## 🎯 Como Usar

### Primeira Execução

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd agent_ia_laudos
   ```

2. **Execute o script de inicialização:**
   
   **Windows:**
   ```powershell
   .\start-dev.ps1
   ```
   
   **Linux/Mac:**
   ```bash
   ./start-dev.sh
   ```

3. **Aguarde a inicialização completa**

### Uso Diário

- **Para iniciar:** Execute o script `start-dev.ps1` (Windows) ou `start-dev.sh` (Linux/Mac)
- **Para parar:** Execute o script `stop-dev.ps1` (Windows) ou `stop-dev.sh` (Linux/Mac)
- **Para reiniciar:** Pare e inicie novamente

## 🔧 O que os Scripts Fazem

### Script de Inicialização (`start-dev.*`)

1. **Verificações de Pré-requisitos:**
   - ✅ Python 3.8+ instalado
   - ✅ Node.js instalado
   - ✅ npm instalado

2. **Instalação de Dependências:**
   - 📦 Instala dependências Python (`pip install -r requirements.txt`)
   - 📦 Instala dependências Node.js (`npm install`)

3. **Configuração:**
   - 🔧 Cria arquivo `.env` se não existir
   - 🔧 Configura variáveis de ambiente

4. **Inicialização dos Servidores:**
   - 🔧 Backend (FastAPI) na porta 8000
   - ⚛️ Frontend (React) na porta 3000

5. **Monitoramento:**
   - 📊 Verifica se os servidores estão rodando
   - 📋 Mostra logs em tempo real

### Script de Parada (`stop-dev.*`)

1. **Para Processos:**
   - 🛑 Para backend (uvicorn)
   - 🛑 Para frontend (npm/react-scripts)
   - 🧹 Limpa jobs do PowerShell (Windows)

2. **Limpeza:**
   - 🧹 Remove arquivos de log
   - 🧹 Libera portas em uso

## 🌐 URLs da Aplicação

Após a inicialização, acesse:

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## 🔑 Credenciais de Teste

- **Usuário:** `admin`
- **Senha:** `123456`

## 🛠️ Solução de Problemas

### Porta Já em Uso

Se uma porta estiver em uso, o script tentará:
1. Parar o processo automaticamente
2. Forçar a parada se necessário
3. Continuar com a inicialização

### Dependências Não Instaladas

O script detecta e instala automaticamente:
- Dependências Python ausentes
- Dependências Node.js ausentes

### Arquivo .env Ausente

O script cria automaticamente:
```
SECRET_KEY=your-secret-key-here-change-in-production
OPENAI_API_KEY=your-openai-api-key-here
```

### Logs

- **Windows:** Logs aparecem no console do PowerShell
- **Linux/Mac:** Logs são salvos em `backend.log` e `frontend.log`

## 💡 Dicas

### Windows
- Use `Ctrl+C` para parar os servidores
- Use `Get-Job | Stop-Job` para parar jobs em background
- Use `Get-Job | Remove-Job` para limpar jobs

### Linux/Mac
- Use `Ctrl+C` para parar os servidores
- Use `tail -f backend.log` para ver logs do backend
- Use `tail -f frontend.log` para ver logs do frontend

## 🔄 Comandos Manuais

Se preferir executar manualmente:

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 📝 Notas

- Os scripts são idempotentes (podem ser executados múltiplas vezes)
- Verificações automáticas de portas em uso
- Limpeza automática de processos órfãos
- Interface colorida para melhor experiência
- Logs em tempo real para debugging

---

**Desenvolvido para facilitar o desenvolvimento da ART-Laudo-Técnico-Pro** 🎉 