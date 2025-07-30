# 🔑 Configuração da OpenAI - ART-Laudo-Técnico-Pro

## 📋 Passo a Passo Rápido

### 1. Obter Chave da OpenAI
1. Acesse: https://platform.openai.com/api-keys
2. Faça login na sua conta OpenAI
3. Clique em **"Create new secret key"**
4. Dê um nome (ex: "ART-Laudo-Pro")
5. **Copie a chave gerada** (começa com `sk-`)

### 2. Configurar (Escolha UMA opção)

#### ⚡ Opção A - Via PowerShell (Rápido)
```powershell
$env:OPENAI_API_KEY="sk-sua-chave-aqui"
```

#### 💾 Opção B - Via Configurador Interativo
```powershell
python configure_openai.py
```

#### ✏️ Opção C - Editando Arquivo Manualmente
1. Abra: `backend/config_openai.py`
2. Encontre: `OPENAI_API_KEY = None`
3. Substitua por: `OPENAI_API_KEY = "sk-sua-chave-aqui"`

### 3. Verificar Status
```powershell
cd backend
python config_openai.py
```

### 4. Reiniciar Servidor
```powershell
# Parar servidor atual
taskkill /f /im python.exe

# Iniciar novamente
cd backend
python app.py
```

## 🧪 Testando se Funcionou

### Verificar via API
```powershell
# Deve mostrar: "✅ OpenAI configurada"
Invoke-WebRequest -Uri "http://localhost:8000/" -Method GET
```

### Testar no Frontend
1. Acesse: http://localhost:3000
2. Faça login como admin
3. Vá para "Gravação Contínua"
4. **Grave um áudio falando**: "Cliente João Silva, bateria 60Ah descarregada"
5. **Observe**: Campos sendo preenchidos automaticamente!

## 🎯 Diferenças com OpenAI Real

| Recurso | Sem OpenAI (Simulação) | Com OpenAI Real |
|---------|------------------------|-----------------|
| **Transcrição** | Texto simulado | Whisper real |
| **Análise** | Regex básico | GPT-3.5-turbo |
| **Precisão** | ~70% | ~95% |
| **Idiomas** | Português só | 50+ idiomas |
| **Contexto** | Limitado | Muito avançado |

## ⚠️ Requisitos

- Conta OpenAI ativa
- Créditos disponíveis na conta
- Conexão com internet
- Chave válida (sk-...)

## 🔧 Solução de Problemas

### ❌ "OpenAI não configurada"
- Verifique se a chave está correta
- Reinicie o servidor backend
- Use o configurador interativo

### ❌ "API key not found"
- Chave inválida ou expirada
- Gere nova chave no painel OpenAI

### ❌ "Quota exceeded"
- Sem créditos na conta OpenAI
- Adicione créditos ou upgrade do plano

## 💡 Dicas

1. **Teste primeiro**: Use simulação para testar o fluxo
2. **Configure depois**: Adicione OpenAI quando tudo estiver ok
3. **Monitore uso**: Acompanhe gastos no painel OpenAI
4. **Backup da chave**: Salve em local seguro

---

## 🚀 Status Atual: PRONTO PARA CONFIGURAR!

✅ **Sistema funcionando** com simulação inteligente  
✅ **APIs corrigidas** (PDF + Parse)  
✅ **Configurador criado** e testado  
✅ **Fluxo completo** Áudio → IA → Formulário  

**Próximo passo**: Configure sua chave OpenAI e teste a IA real! 🎉 