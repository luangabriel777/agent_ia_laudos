import React, { useState } from 'react';
// Importamos o cliente de API centralizado para evitar chamadas de rede para a porta do
// frontend. Ele utiliza a baseURL definida em REACT_APP_API_BASE_URL e pode
// adicionar cabeçalhos padrões para autenticação.
import api from './api';

// Componente de login que aceita um callback `onLogin` para notificar o
// componente pai quando a autenticação ocorrer com sucesso.
function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Envia as credenciais para o endpoint de login usando x-www-form-urlencoded.
      const res = await api.post(
        '/login',
        new URLSearchParams({ username, password }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );
      const { access_token } = res.data;
      // Armazena o token para uso futuro (por exemplo, em localStorage)
      localStorage.setItem('token', access_token);
      console.log('Login bem-sucedido');
      // Informa ao componente pai que o login ocorreu corretamente
      if (typeof onLogin === 'function') {
        onLogin();
      }
    } catch (err) {
      console.error(err);
      alert('Falha no login, verifique suas credenciais');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <label>
          Usuário:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <label>
          Senha:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
      </div>
      <button type="submit">Entrar</button>
    </form>
  );
}

export default Login;