import axios from '../utils/axiosConfig';
import { setSessionToken } from '../utils/sessionCookie';

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Login service
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise} Promise that resolves to the authentication data
 */
export const login = async (credentials) => {
  try {
    // Validación básica
    if (!credentials.email || !credentials.password) {
      throw new Error('Email y contraseña son requeridos');
    }

    // Llamada real al backend
    const response = await axios.post(`${API_BASE_URL}/users/login-admin`, credentials);
    
    // Verificar el status de la respuesta
    if (!response.data.status) {
      // El backend devolvió status: false, pero no es un error HTTP
      // Devolvemos la respuesta completa para que el componente la maneje
      return response.data;
    }
    
    // Login exitoso - extraer datos de la respuesta
    const { token, personal_information, expiration_date } = response.data;
    
    // Guardar solo el token en SessionCookie
    setSessionToken(token, null, null);
    
    console.log('Login successful:', personal_information.email);
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    
    // Manejar errores específicos del backend
    if (error.response) {
      // Error de respuesta del servidor
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          throw new Error('Credenciales inválidas');
        case 404:
          throw new Error('Usuario no encontrado');
        case 500:
          throw new Error('Error del servidor. Intenta más tarde');
        default:
          throw new Error(data?.status_Message || 'Error de autenticación');
      }
    } else if (error.request) {
      // Error de red
      throw new Error('Error de conexión. Verifica tu internet');
    } else {
      // Otros errores
      throw new Error(error.message || 'Error inesperado');
    }
  }
};

