# 📚 Documentação do Sistema RSM

## 🎯 Visão Geral

O **Sistema RSM (Rede de Serviços Moura)** é uma plataforma SaaS moderna para gestão de laudos técnicos de manutenção de baterias. Desenvolvido com arquitetura robusta e design profissional.

## 🏗️ Arquitetura

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (desenvolvimento) / PostgreSQL (produção)
- **Autenticação**: JWT
- **Documentação**: OpenAPI/Swagger

### Frontend
- **Framework**: React 18
- **Styling**: CSS Custom Properties + Grid/Flexbox
- **Estado**: React Hooks
- **Build**: Vite

## 📋 Funcionalidades Principais

### 👨‍💼 Técnicos
- ✅ Criação de laudos técnicos
- ✅ Edição de laudos próprios
- ✅ Visualização de histórico
- ✅ Upload de imagens
- ✅ Gravação de áudio

### 👑 Administradores
- ✅ Aprovação de laudos
- ✅ Dashboard completo
- ✅ Relatórios avançados
- ✅ Gestão de usuários
- ✅ Configurações do sistema

## 🚀 Quick Start

### Pré-requisitos
- Python 3.8+
- Node.js 16+
- Git

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd rsm-system

# Backend
cd backend
pip install -r requirements.txt
python app.py

# Frontend (novo terminal)
cd frontend
npm install
npm start
```

## 📖 Documentação Detalhada

- [Guia de Instalação](./setup/INSTALLATION.md)
- [Configuração do Ambiente](./setup/ENVIRONMENT.md)
- [API Reference](./api/README.md)
- [Componentes Frontend](./frontend/README.md)
- [Deploy](./deploy/README.md)

## 🔧 Desenvolvimento

### Estrutura do Projeto
```
rsm-system/
├── backend/                 # API FastAPI
│   ├── app.py              # Aplicação principal
│   ├── database.py         # Modelos e conexão DB
│   ├── requirements.txt    # Dependências Python
│   └── config/             # Configurações
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas da aplicação
│   │   └── utils/          # Utilitários
│   └── package.json
├── docs/                   # Documentação
└── scripts/                # Scripts de automação
```

### Padrões de Código
- **Backend**: PEP 8, type hints, docstrings
- **Frontend**: ESLint, Prettier, Componentes funcionais
- **CSS**: BEM methodology, CSS Custom Properties

## 🧪 Testes

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## 📦 Deploy

- **Desenvolvimento**: Docker Compose
- **Produção**: Kubernetes + Helm Charts
- **CI/CD**: GitHub Actions

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](../LICENSE) para mais detalhes.

## 📞 Suporte

- **Email**: suporte@moura.com.br
- **Documentação**: [docs.moura.com.br](https://docs.moura.com.br)
- **Issues**: [GitHub Issues](https://github.com/moura/rsm-system/issues)

---

*Última atualização: ${new Date().toLocaleDateString('pt-BR')}* 