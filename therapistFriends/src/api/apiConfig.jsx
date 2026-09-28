import axios from 'axios';
import { toast } from 'react-toastify';

const host = window.location.hostname;
const baseURL = host === 'localhost' || host === '127.0.0.1'
  ? 'http://localhost:8000'
  : `http://${host}:8000`;

const api = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor de Resposta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    // Tenta o REFRESH se o erro for 401
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        return api(originalRequest); // Refaz a requisição com sucesso
      } catch (refreshError) {
        // Exibe mensagem apenas se a renovação de sessão falhar
        toast.error('Sessão expirada. Faça login novamente.');
        return Promise.reject(refreshError);
      }
    }

    // Exibe os toasts APENAS para erros que NÃO sejam 401
    if (status !== 401) {
      const errors = error.response?.data?.errors || error?.messages;

      if (Array.isArray(errors) && errors.length > 0) {
        errors.forEach((msg) => toast.error(msg));
      } else if (typeof errors === 'string') {
        toast.error(errors);
      } else {
        toast.error('Erro ao processar a solicitação. Por favor, tente novamente mais tarde.');
      }
    }

    return Promise.reject(error);
  }
);
export default api;