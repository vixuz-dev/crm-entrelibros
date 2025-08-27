import CryptoJS from 'crypto-js';

// Salt de seguridad para la encriptación
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;


/**
 * Utilidad para encriptar contraseñas usando SHA-256 con salt
 * @param {string} password - Contraseña en texto plano
 * @returns {string} - Contraseña encriptada en SHA-256 con salt
 */
export const encryptPassword = (password) => {
  try {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }
    
    // Encriptar usando SHA-256 con salt de seguridad
    const encryptedPassword = CryptoJS.SHA256(password + SECRET_KEY).toString();
    
    console.log('Password encrypted successfully with salt');
    return encryptedPassword;
  } catch (error) {
    console.error('Error encrypting password:', error);
    throw error;
  }
};

/**
 * Verificar si una contraseña coincide con su versión encriptada
 * @param {string} plainPassword - Contraseña en texto plano
 * @param {string} encryptedPassword - Contraseña encriptada
 * @returns {boolean} - True si coinciden
 */
export const verifyPassword = (plainPassword, encryptedPassword) => {
  try {
    const hashedInput = encryptPassword(plainPassword);
    return hashedInput === encryptedPassword;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};
