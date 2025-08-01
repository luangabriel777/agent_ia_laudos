// Utilitário para configurar chamadas HTTP para o backend.
// Ajuste `BASE_URL` conforme o endereço onde o backend está rodando.

import axios from 'axios';
import config from './config';

// Debug: mostrar configuração da API
console.log('🔧 API Config:', {
  baseURL: config.API_BASE_URL,
  environment: process.env.NODE_ENV,
  apiUrl: process.env.REACT_APP_API_URL
});

const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;