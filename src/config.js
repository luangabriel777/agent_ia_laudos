// Configurações da aplicação
const config = {
  // URL da API - ajuste conforme seu backend
  API_BASE_URL: process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === 'development' 
      ? '' // Em desenvolvimento, usa o proxy do package.json
      : 'https://agentialaudos-production.up.railway.app' // ✅ URL REAL DO RAILWAY
    ),
  
  // Timeout das requisições
  API_TIMEOUT: 30000,
  
  // Configurações de debug
  DEBUG: process.env.NODE_ENV === 'development',
};

export default config; 