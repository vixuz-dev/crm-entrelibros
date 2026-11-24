import axios from '../utils/axiosConfig';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Error con el mensaje que devuelve el servidor (status_Message), para mostrarlo tal cual en pantalla.
const toError = (error, fallback) => {
  const err = new Error(error.response?.data?.status_Message || fallback);
  err.status = error.response?.status;
  return err;
};

/**
 * Lista de códigos de descuento con sus usos.
 * @param {Object} [params] - { search, batch_label, season_id, status (0|1), page, page_size }
 * @returns {Promise<{discount_codes: Array, total: number, page: number, page_size: number, total_pages: number}>}
 */
export const getDiscountCodes = async (params = {}) => {
  try {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));
    const response = await axios.get(`${API_BASE_URL}/discounts/get-discount-codes`, { params: clean });
    return response.data;
  } catch (error) {
    console.error('Error getting discount codes:', error);
    throw toError(error, 'Error al cargar los códigos de descuento');
  }
};

/**
 * Crea códigos: uno ({ code }), un lote ({ quantity, prefix }) o personales ({ assigned_emails }).
 * Reglas comunes: type, value, max_discount, min_subtotal, starts_at, ends_at, max_uses_total, season_id,
 * description, batch_label.
 * @returns {Promise<{codes: Array<{code_id, code, assigned_email}>}>}
 */
export const createDiscountCodes = async (payload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/discounts/create-discount-codes`, payload);
    return response.data;
  } catch (error) {
    console.error('Error creating discount codes:', error);
    throw toError(error, 'Error al crear los códigos');
  }
};

/**
 * Edita un código (solo los campos enviados). No cambia code, type ni value.
 * @param {Object} changes - { code_id, description?, status?, starts_at?, ends_at?, max_uses_total?, min_subtotal?,
 *                             max_discount?, assigned_email?, season_id?, batch_label? }
 */
export const updateDiscountCode = async (changes) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/discounts/update-discount-code`, changes);
    return response.data;
  } catch (error) {
    console.error('Error updating discount code:', error);
    throw toError(error, 'Error al actualizar el código');
  }
};
