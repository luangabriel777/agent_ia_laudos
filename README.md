# RSM Frontend

Frontend do sistema RSM (Relatórios de Serviços e Manutenção) desenvolvido em React.

## 🚀 Tecnologias

- React
- Tailwind CSS
- JavaScript (ES6+)
- HTML5
- CSS3

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd rsm-frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Inicie o servidor de desenvolvimento:
```bash
npm start
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
├── utils/              # Utilitários e helpers
├── App.js              # Componente principal
├── index.js            # Ponto de entrada
└── ...

public/
├── index.html          # HTML principal
├── manifest.json       # Manifesto PWA
└── ...

package.json            # Dependências e scripts
tailwind.config.js      # Configuração do Tailwind CSS
```

## 🛠️ Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm build` - Gera build de produção
- `npm test` - Executa os testes
- `npm eject` - Ejecta do Create React App

## 🌐 Deploy

O projeto está configurado para deploy no Vercel. Para fazer deploy:

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático será feito a cada push

## 📝 Licença

Este projeto está sob a licença MIT. 