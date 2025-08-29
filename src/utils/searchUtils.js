/**
 * Utilidades para manejo de búsquedas con caracteres especiales
 */

/**
 * Normaliza el texto de búsqueda removiendo acentos y convirtiendo a minúsculas
 * Útil para búsquedas que no distinguen acentos
 * @param {string} searchTerm - Término de búsqueda
 * @returns {string} Término normalizado sin acentos
 */
export const normalizeSearchTerm = (searchTerm) => {
  if (!searchTerm) return '';
  
  return searchTerm
    .trim()
    // Normalizar espacios múltiples
    .replace(/\s+/g, ' ')
    // Remover acentos y convertir a minúsculas
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .toLowerCase();
};

/**
 * Prepara el término de búsqueda preservando caracteres especiales
 * Útil para búsquedas que distinguen acentos
 * @param {string} searchTerm - Término de búsqueda
 * @returns {string} Término preparado con caracteres especiales
 */
export const prepareSearchTerm = (searchTerm) => {
  if (!searchTerm) return '';
  
  return searchTerm
    .trim()
    // Normalizar espacios múltiples
    .replace(/\s+/g, ' ')
    // Preservar caracteres especiales pero normalizar
    .normalize('NFC'); // Forma de composición canónica
};

/**
 * Escapa caracteres especiales para búsquedas en expresiones regulares
 * @param {string} searchTerm - Término de búsqueda
 * @returns {string} Término escapado
 */
export const escapeSearchTerm = (searchTerm) => {
  if (!searchTerm) return '';
  
  return searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Crea un objeto URLSearchParams con el término de búsqueda
 * @param {string} searchTerm - Término de búsqueda
 * @param {string} paramName - Nombre del parámetro (default: 'search')
 * @returns {URLSearchParams} Objeto con parámetros de búsqueda
 */
export const createSearchParams = (searchTerm, paramName = 'search') => {
  const params = new URLSearchParams();
  
  if (searchTerm && searchTerm.trim()) {
    const preparedTerm = prepareSearchTerm(searchTerm);
    params.append(paramName, preparedTerm);
  }
  
  return params;
};

/**
 * Decodifica un término de búsqueda desde la URL
 * @param {string} encodedTerm - Término codificado
 * @returns {string} Término decodificado
 */
export const decodeSearchTerm = (encodedTerm) => {
  if (!encodedTerm) return '';
  
  try {
    return decodeURIComponent(encodedTerm);
  } catch (error) {
    console.warn('Error decoding search term:', error);
    return encodedTerm;
  }
};

/**
 * Valida si un término de búsqueda es válido
 * @param {string} searchTerm - Término de búsqueda
 * @param {number} minLength - Longitud mínima (default: 2)
 * @returns {boolean} True si es válido
 */
export const isValidSearchTerm = (searchTerm, minLength = 2) => {
  if (!searchTerm || typeof searchTerm !== 'string') return false;
  
  const trimmed = searchTerm.trim();
  return trimmed.length >= minLength;
};
