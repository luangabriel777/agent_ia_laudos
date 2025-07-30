# 🔍 Debug e Troubleshooting - Gravação Contínua

## 🚨 Problemas Comuns e Soluções

### 1. **Sistema Trava ao Gravar**

**Sintomas:**
- Clica para gravar e fica processando indefinidamente
- Não retorna campos preenchidos
- Interface fica travada

**Possíveis Causas:**

#### A. **Prompt Mal Estruturado**
- O ChatGPT pode estar retornando texto livre em vez de JSON
- Prompt não está específico o suficiente

**Solução:**
- Verificar logs do backend para ver a resposta bruta do ChatGPT
- Ajustar o prompt conforme necessário

#### B. **Problemas de Áudio**
- Formato não suportado pelo Whisper
- Áudio muito ruidoso ou com delays
- Tamanho do arquivo muito grande

**Solução:**
- Testar com arquivos `.wav` pequenos e claros
- Verificar se o microfone está funcionando corretamente
- Reduzir ruído ambiente

#### C. **Limitações do Whisper/ChatGPT**
- Whisper pode não transcrever corretamente
- ChatGPT pode "inventar" respostas

**Solução:**
- Verificar transcrição bruta nos logs
- Ajustar temperatura do ChatGPT (atualmente 0.1)
- Usar prompts mais específicos

### 2. **Como Investigar Problemas**

#### A. **Verificar Logs do Backend**
```bash
# No terminal onde o backend está rodando, procurar por:
🤖 ENVIANDO PARA CHATGPT:
🤖 RESPOSTA BRUTA DO CHATGPT:
✅ JSON PARSEADO COM SUCESSO:
❌ ERRO NO PARSE JSON:
```

#### B. **Verificar Logs do Frontend**
```javascript
// No console do navegador, procurar por:
🎯 FRONTEND DEBUG - Enviando áudio para backend:
🎯 FRONTEND DEBUG - Resposta do backend:
🎯 FRONTEND DEBUG - Campos extraídos:
```

#### C. **Testar com Áudio Controlado**
1. Grave um áudio simples e claro
2. Fale algo como: "Cliente: Oficina Silva, Equipamento: Bateria 12V 60Ah, Diagnóstico: Bateria descarregada"
3. Verifique se os campos são preenchidos corretamente

### 3. **Ajustes de Prompt**

#### Prompt Atual (Otimizado):
```text
Você é um especialista em análise de laudos técnicos de baterias e equipamentos eletrônicos.

A partir do texto transcrito abaixo, extraia EXATAMENTE as informações para preencher o JSON.
Se não encontrar informação para um campo, retorne string vazia ("").

IMPORTANTE: Retorne SOMENTE o JSON válido, sem explicações, sem markdown, sem código.

FORMATO EXATO DO JSON:
{
  "cliente": "",
  "equipamento": "",
  "diagnostico": "",
  "solucao": ""
}

REGRAS DE EXTRAÇÃO:
- cliente: nome da pessoa, empresa, oficina ou estabelecimento
- equipamento: tipo específico de bateria (ex: "Bateria 12V 60Ah", "Bateria de notebook Dell")
- diagnostico: problema técnico identificado (ex: "Bateria não carrega", "Células sulfatadas")
- solucao: ação realizada para resolver (ex: "Substituição da bateria", "Limpeza dos terminais")

EXEMPLO DE RESPOSTA VÁLIDA:
{
  "cliente": "Oficina Silva",
  "equipamento": "Bateria 12V 45Ah",
  "diagnostico": "Bateria descarregada e sulfatada",
  "solucao": "Substituição por bateria nova"
}

TEXTO TRANSCRITO:
[texto aqui]
```

### 4. **Fluxo de Debug Recomendado**

1. **Teste Básico:**
   - Grave um áudio simples e claro
   - Verifique logs do backend
   - Verifique se o JSON está sendo retornado corretamente

2. **Se JSON Inválido:**
   - Ajuste o prompt
   - Reduza a temperatura do ChatGPT
   - Adicione mais exemplos no prompt

3. **Se Transcrição Ruim:**
   - Teste com áudio mais claro
   - Verifique formato do arquivo
   - Teste com arquivo `.wav` em vez de `.webm`

4. **Se Campos Não Preenchidos:**
   - Verifique se o frontend está recebendo os dados
   - Verifique se a função `onFieldUpdate` está sendo chamada
   - Verifique se os campos estão sendo mesclados corretamente

### 5. **Configurações Recomendadas**

#### Backend:
- **Modelo:** `gpt-3.5-turbo`
- **Temperature:** `0.1` (baixa para respostas consistentes)
- **Max Tokens:** `500`
- **Formato de Áudio:** `webm` (padrão do navegador)

#### Frontend:
- **Intervalo de Processamento:** `3000ms` (3 segundos)
- **Tamanho Mínimo:** `10000 bytes`
- **Formato:** `audio/webm;codecs=opus`

### 6. **Comandos Úteis para Debug**

```bash
# Verificar se o backend está rodando
curl http://localhost:8000/

# Testar endpoint de áudio
curl -X POST http://localhost:8000/audio-to-laudo \
  -H "Authorization: Bearer [token]" \
  -F "file=@teste.wav"

# Verificar logs em tempo real
tail -f backend.log
```

### 7. **Exemplo de Teste Completo**

1. **Preparar áudio de teste:**
   ```
   "Cliente: Auto Center Santos, Equipamento: Bateria 12V 70Ah, 
   Diagnóstico: Bateria não carrega mais, Solução: Substituição por bateria nova"
   ```

2. **Gravar e verificar logs:**
   - Backend deve mostrar transcrição
   - ChatGPT deve retornar JSON válido
   - Frontend deve preencher campos

3. **Resultado esperado:**
   ```json
   {
     "cliente": "Auto Center Santos",
     "equipamento": "Bateria 12V 70Ah",
     "diagnostico": "Bateria não carrega mais",
     "solucao": "Substituição por bateria nova"
   }
   ```

---

## 🎯 **Resumo dos Ajustes Implementados**

### ✅ **Backend:**
- Prompt otimizado e mais específico
- Logs detalhados para debug
- Melhor tratamento de erros JSON
- Permissões corrigidas (vendedor aprova orçamento, técnico aprova execução)

### ✅ **Frontend:**
- Botões de aprovação com labels claros
- Uso do endpoint correto `/audio-to-laudo`
- Logs detalhados no console
- Melhor feedback visual

### ✅ **Fluxo de Aprovação:**
1. **Pendente** → **Vendedor** aprova orçamento
2. **Aprovado Manutenção** → **Técnico** aprova execução
3. **Aprovado Vendas** → Processo completo

---

**💡 Dica:** Sempre verifique os logs primeiro antes de fazer ajustes no código! 