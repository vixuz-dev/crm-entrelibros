import axios from 'axios';
import { clearSession, getSessionToken } from './sessionCookie';
import { ROUTES } from './routes';

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Configurar interceptor para agregar token automáticamente
axios.interceptors.request.use(
  (config) => {
    const token = getSessionToken();
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Configurar interceptor para manejar errores de autenticación
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido, limpiar token y redirigir al login
      try {
        // Limpiar token de SessionCookie
        clearSession();
      } catch (e) {
        console.error('Error clearing session token:', e);
      }
      window.location.href = ROUTES.LOGIN;
    }
    return Promise.reject(error);
  }
);

export default axios;
