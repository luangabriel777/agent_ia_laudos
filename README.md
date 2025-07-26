# ART-Laudo-Técnico-Pro

## Contexto do Projeto

**ART-Laudo-Técnico-Pro** é uma plataforma multiplataforma destinada à geração
automática de laudos técnicos de baterias tracionárias. O objetivo principal
é permitir que técnicos no campo possam ditar livremente seus relatórios e,
de forma inteligente, o sistema transcreva, interprete e preencha os campos
necessários, reduzindo o tempo de preenchimento e aumentando a precisão.

### Objetivos

- Interface web responsiva, otimizada para tablets.
- Login seguro (usuário/senha), com possibilidade de expansão para login
  social no futuro.
- Gravação de áudio diretamente pelo navegador.
- Transcrição automática via API Whisper/OpenAI.
- Interpretação do áudio pelo ChatGPT para extrair e preencher
  automaticamente todos os campos do laudo, mesmo que a ordem da fala
  seja diferente da ordem do formulário.
- Edição manual dos laudos, histórico por usuário e armazenamento seguro.
- Estrutura pronta para anexar fotos, arquivos e gerar PDFs.
- Suporte futuro à sincronização offline/online e integração com ERP.

### Motivação

O fluxo atual de preenchimento de laudos consome tempo e é suscetível a erros.
Este projeto busca otimizar esse processo, oferecendo mobilidade (funcionar
offline/online), escalabilidade (multiusuário) e integração futura com
serviços em nuvem e relatórios.

### Stack Utilizada

- **Frontend:** React.js
  - Tela de login com proteção de rotas.
  - Formulário de laudo.
  - Gravação e envio de áudio (MediaRecorder).
  - Histórico de laudos.
  - Paleta de cores Moura e design responsivo.
- **Backend:** FastAPI (Python)
  - Autenticação via JWT.
  - Endpoints protegidos.
  - Integração com Whisper (OpenAI) para transcrição de áudio.
  - Integração com ChatGPT (OpenAI) para parsing dos campos do laudo.
  - Armazenamento provisório em `users.json` e `laudos.json` (previsto
    para migração futura para um banco de dados relacional).

### Fluxo de Uso

1. O técnico realiza login.
2. Grava o laudo via voz pelo navegador.
3. O backend transcreve o áudio (Whisper) e extrai os campos (ChatGPT).
4. Os campos do laudo são exibidos e podem ser ajustados manualmente.
5. O laudo é salvo e fica associado ao usuário logado.
6. O sistema está preparado para futuras expansões, como anexos e PDF.

### Funcionalidades Atuais

- Estrutura inicial de frontend e backend separada.
- Login JWT com armazenamento de usuários em hash SHA‑256.
- Cadastro e listagem de laudos, incluindo rotas de atualização e remoção.
- Gravação de áudio no navegador e envio para o backend.
- Endpoints esqueleto para transcrição (Whisper) e parsing (ChatGPT).
- Histórico de laudos filtrado por usuário.
- Middleware CORS configurado.

### Próximos Passos Possíveis

- Implementar integração real com a API Whisper para transcrição de áudio.
- Utilizar ChatGPT para extrair automaticamente os campos do laudo
  (definindo prompts e tratamentos de resposta adequados).
- Adicionar upload de fotos/anexos e geração de PDF.
- Suportar sincronização offline/online via PWA e armazenamento local.
- Migrar `users.json` e `laudos.json` para um banco de dados relacional
  (ex.: SQLite ou PostgreSQL) com ORM.
- Implementar login social (Google, Microsoft, etc.).
- Criar dashboard de administração para gestão de usuários e laudos.
- Integrar com sistemas ERP e emitir relatórios automáticos.

---

## Estrutura de Pastas Esperada

```
backend/
  app.py           # API FastAPI com endpoints, autenticação e integração IA
  requirements.txt # dependências do backend
  .env             # variáveis de ambiente (SECRET_KEY, API keys)
  users.json       # usuários (senha em hash)
  laudos.json      # laudos salvos

frontend/
  package.json     # dependências e scripts do frontend
  public/
    index.html     # entrada da aplicação React
  src/
    index.js       # ponto de entrada React
    App.js         # componente principal
    App.css        # estilos básicos
    Login.js       # tela de login com autenticação JWT
    api.js         # utilitário para chamadas ao backend
    components/
      AudioRecorder.js # grava áudio e envia ao backend
      LaudoForm.js     # formulário para visualizar/editar campos do laudo
      LaudoList.js     # lista de laudos do usuário

README.md         # este arquivo de documentação

art_laudo_tecnico_pro.zip # distribuição compactada (exemplo)
```

---

## Instruções Gerais

- Utilize commits claros e descritivos para cada funcionalidade ou correção.
- Priorize código limpo, comentado e testado.
- Mantenha esta documentação atualizada conforme novas features são
  implementadas.
- Em caso de dúvidas ou melhorias pendentes, crie `TODO`s no código e issues
  no GitHub para acompanhamento.

---

**Nota:** Este repositório contém apenas uma estrutura inicial. Alguns
arquivos (como integrações com OpenAI) contêm `TODO`s indicando trechos
incompletos. Complete as seções conforme os requisitos do projeto e as
chaves de API estiverem disponíveis.