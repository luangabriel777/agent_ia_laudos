import React, { useState, useEffect } from 'react';
import Login from './Login';
import AudioRecorder from './components/AudioRecorder';

function App() {
  // Controla se o usuário está autenticado. Ao carregar o componente, verifica
  // se existe um token salvo no localStorage. Após o login, definimos
  // isAuthenticated como true, exibindo as funcionalidades do sistema.
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Ao montar, verifica se há token armazenado
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div className="App">
      <h1>ART-Laudo-Técnico-Pro</h1>
      {isAuthenticated ? (
        // Conteúdo exibido após autenticação
        <>
          {/* Aqui serão inseridos outros componentes protegidos, como o formulário e lista de laudos */}
          <AudioRecorder />
        </>
      ) : (
        // Exibe tela de login. Ao autenticar com sucesso, atualiza o estado.
        <Login onLogin={() => setIsAuthenticated(true)} />
      )}
    </div>
  );
}

export default App;