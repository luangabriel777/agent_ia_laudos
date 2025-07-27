import React, { useState, useEffect } from 'react';
import Login from './Login';
import AudioRecorder from './components/AudioRecorder';
import LaudoForm from './components/LaudoForm';
import api from './api';

function App() {
  // Controla se o usuário está autenticado. Ao carregar o componente, verifica
  // se existe um token salvo no localStorage. Após o login, definimos
  // isAuthenticated como true, exibindo as funcionalidades do sistema.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [laudoData, setLaudoData] = useState({});

  const handleSave = async () => {
    try {
      await api.post('/laudos', laudoData);
      alert('Laudo salvo com sucesso');
      setLaudoData({});
    } catch (err) {
      console.error('Erro ao salvar laudo', err);
      alert('Erro ao salvar laudo');
    }
  };

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
          <AudioRecorder onParsed={(data) => setLaudoData(data)} />
          <LaudoForm data={laudoData} onChange={setLaudoData} onSave={handleSave} />
        </>
      ) : (
        // Exibe tela de login. Ao autenticar com sucesso, atualiza o estado.
        <Login onLogin={() => setIsAuthenticated(true)} />
      )}
    </div>
  );
}

export default App;