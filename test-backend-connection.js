// Script para testar a conectividade com o backend
// Execute este script no console do navegador em https://www.escolhatech.shop

console.log('🔧 Testando conectividade com o backend...');

// URL do backend
const BACKEND_URL = 'https://agentialaudos-production.up.railway.app';

// Função para testar CORS
async function testCORS() {
  console.log('📡 Testando CORS...');
  
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
      console.log('✅ CORS configurado corretamente!');
      const data = await response.json();
      console.log('📊 Resposta:', data);
    } else {
      console.log('⚠️ Backend respondeu, mas com status:', response.status);
    }
  } catch (error) {
    console.error('❌ Erro de CORS:', error.message);
    
    if (error.message.includes('CORS')) {
      console.log('🔧 Solução: Configure CORS no backend para aceitar requisições de https://www.escolhatech.shop');
    }
  }
}

// Função para testar endpoint de login
async function testLogin() {
  console.log('🔐 Testando endpoint de login...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/login`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: '123456'
      }),
    });
    
    if (response.ok) {
      console.log('✅ Login funcionando!');
      const data = await response.json();
      console.log('📊 Resposta:', data);
    } else {
      console.log('⚠️ Login falhou com status:', response.status);
      const errorData = await response.text();
      console.log('📊 Erro:', errorData);
    }
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
  }
}

// Função para testar preflight OPTIONS
async function testPreflight() {
  console.log('🛫 Testando preflight OPTIONS...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/login`, {
      method: 'OPTIONS',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    
    console.log('📊 Status OPTIONS:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 200) {
      console.log('✅ Preflight funcionando!');
    } else {
      console.log('⚠️ Preflight falhou');
    }
  } catch (error) {
    console.error('❌ Erro no preflight:', error.message);
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes de conectividade...');
  console.log('📍 Backend URL:', BACKEND_URL);
  console.log('📍 Frontend URL:', window.location.origin);
  console.log('---');
  
  await testPreflight();
  console.log('---');
  await testCORS();
  console.log('---');
  await testLogin();
  console.log('---');
  
  console.log('🏁 Testes concluídos!');
}

// Executar automaticamente
runAllTests(); 