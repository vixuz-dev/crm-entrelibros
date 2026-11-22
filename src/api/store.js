import axios from '../utils/axiosConfig';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Error con el mensaje que devuelve el servidor (status_Message), para mostrarlo tal cual en pantalla.
const toError = (error, fallback) => {
  const err = new Error(error.response?.data?.status_Message || fallback);
  err.status = error.response?.status;
  return err;
};

/**
 * Configuración de la tienda: interruptor de venta y temporadas actual/próxima.
 * @returns {Promise<{store_open: boolean, current_season: object|null, next_season: object|null}>}
 */
export const getStoreConfig = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/store/get-store-config`);
    return response.data;
  } catch (error) {
    console.error('Error getting store config:', error);
    throw toError(error, 'Error al cargar la configuración de la tienda');
  }
};

/**
 * Cambia el interruptor de venta y/o las temporadas. Solo se modifica lo que se envíe.
 * @param {Object} changes
 * @param {boolean} [changes.store_open]
 * @param {number|null} [changes.current_season_id]
 * @param {number|null} [changes.next_season_id]
 */
export const updateStoreConfig = async (changes) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/store/update-store-config`, changes);
    return response.data;
  } catch (error) {
    console.error('Error updating store config:', error);
    throw toError(error, 'Error al actualizar la configuración de la tienda');
  }
};

/** Catálogo de temporadas (incluye archivadas). @returns {Promise<{season_list: Array}>} */
export const getSeasons = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/store/get-seasons`);
    return response.data;
  } catch (error) {
    console.error('Error getting seasons:', error);
    throw toError(error, 'Error al cargar las temporadas');
  }
};

/**
 * Crea una temporada.
 * @param {Object} season - { slug, name, eyebrow, title, description, teaser?, status? }
 */
export const addSeason = async (season) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/store/add-season`, season);
    return response.data;
  } catch (error) {
    console.error('Error creating season:', error);
    throw toError(error, 'Error al crear la temporada');
  }
};

/**
 * Edita una temporada (solo los campos enviados; el slug no se puede cambiar).
 * @param {Object} season - { season_id, name?, eyebrow?, title?, description?, teaser?, status? }
 */
export const updateSeason = async (season) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/store/update-season`, season);
    return response.data;
  } catch (error) {
    console.error('Error updating season:', error);
    throw toError(error, 'Error al actualizar la temporada');
  }
};
