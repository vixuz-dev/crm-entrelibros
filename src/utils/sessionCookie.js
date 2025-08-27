/**
 * SessionCookie Utility
 * Maneja el almacenamiento y validación de tokens de sesión
 */

const SESSION_TOKEN_KEY = 'sessionToken';
const USER_DATA_KEY = 'userData';
const EXPIRATION_KEY = 'tokenExpiration';

/**
 * Guarda el token de sesión y datos del usuario
 * @param {string} token - Token JWT
 * @param {Object|null} userData - Datos del usuario (opcional)
 * @param {number|null} expirationDate - Timestamp de expiración (opcional)
 */
export const setSessionToken = (token, userData = null, expirationDate = null) => {
  try {
    // Guardar siempre el token
    localStorage.setItem(SESSION_TOKEN_KEY, token);
    
    // Solo guardar userData si se proporciona
    if (userData) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    }
    
    // Solo guardar expirationDate si se proporciona
    if (expirationDate) {
      localStorage.setItem(EXPIRATION_KEY, expirationDate.toString());
    }
  } catch (error) {
    console.error('Error setting session token:', error);
    throw error;
  }
};

/**
 * Obtiene el token de sesión actual
 * @returns {string|null} Token de sesión o null si no existe
 */
export const getSessionToken = () => {
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting session token:', error);
    return null;
  }
};

/**
 * Obtiene los datos del usuario de la sesión
 * @returns {Object|null} Datos del usuario o null si no existe
 */
export const getUserData = () => {
  try {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Obtiene la fecha de expiración del token
 * @returns {number|null} Timestamp de expiración o null si no existe
 */
export const getTokenExpiration = () => {
  try {
    const expiration = localStorage.getItem(EXPIRATION_KEY);
    return expiration ? parseInt(expiration) : null;
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} True si el usuario está autenticado (tiene token)
 */
export const isUserAuthenticated = () => {
  try {
    const token = getSessionToken();
    
    // Solo verificar si existe el token
    return !!token;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Limpia toda la información de sesión
 */
export const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(EXPIRATION_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};

/**
 * Obtiene información completa de la sesión
 * @returns {Object} Objeto con token y estado de autenticación
 */
export const getSessionInfo = () => {
  return {
    token: getSessionToken(),
    userData: getUserData(),
    expiration: getTokenExpiration(),
    isAuthenticated: isUserAuthenticated()
  };
};

/**
 * Verifica si el token expirará pronto
 * @returns {boolean} False ya que no guardamos la fecha de expiración
 */
export const isTokenExpiringSoon = () => {
  // No guardamos la fecha de expiración, por lo que siempre retornamos false
  return false;
}; 