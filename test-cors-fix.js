// Script para testar se o CORS foi corrigido
// Execute este script no console do navegador em https://www.escolhatech.shop

console.log('🔧 Testando correção do CORS...');

const BACKEND_URL = 'https://agentialaudos-production.up.railway.app';

async function testCORSFix() {
  console.log('📡 Testando CORS após correção...');
  
  try {
    // Teste básico de conectividade
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('✅ CORS funcionando! Backend respondeu corretamente.');
      const data = await response.json();
      console.log('📊 Resposta:', data);
      
      // Testar login
      console.log('🔐 Testando login...');
      const loginResponse = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: 'admin',
          password: '123456'
        }),
      });
      
      if (loginResponse.ok) {
        console.log('✅ Login funcionando! CORS corrigido com sucesso.');
        const loginData = await loginResponse.json();
        console.log('📊 Token recebido:', loginData.access_token ? 'Sim' : 'Não');
      } else {
        console.log('⚠️ Login falhou com status:', loginResponse.status);
      }
    } else {
      console.log('⚠️ Backend respondeu, mas com status:', response.status);
    }
  } catch (error) {
    console.error('❌ Erro de CORS ainda presente:', error.message);
    console.log('🔧 O deploy pode ainda estar em andamento. Aguarde alguns minutos e teste novamente.');
  }
}

// Executar teste
testCORSFix(); 