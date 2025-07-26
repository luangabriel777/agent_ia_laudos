// Utilitário para configurar chamadas HTTP para o backend.
// Ajuste `BASE_URL` conforme o endereço onde o backend está rodando.

import axios from 'axios';

export const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
});

export default api;