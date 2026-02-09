import axiosConfig from "../utils/axiosConfig";

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Envía un lote de correos por SMTP.
 * @param {Object} payload
 * @param {string} payload.subject - Asunto del correo
 * @param {string} payload.htmlContent - Contenido HTML del correo
 * @param {Array<{ email: string, name: string, params?: Object }>} payload.recipients - Lista de destinatarios
 * @returns {Promise<{ ok: boolean, sent: number, messageIds: string[] }>} Respuesta del API
 */
export const sendBatch = async (payload) => {
  try {
    const response = await axiosConfig.post(
      `${API_BASE_URL}/smtp/email/send-batch`,
      payload
    );

    const data = response.data;
    if (data.ok === true) {
      return data;
    }
    const errorMessage = data.message || "Error al enviar el lote de correos";
    throw new Error(errorMessage);
  } catch (error) {
    console.error("Error sending batch email:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.status_Message ||
      "Error al enviar el lote de correos";
    throw new Error(errorMessage);
  }
};
