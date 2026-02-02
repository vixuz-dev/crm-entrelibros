import axios from '../utils/axiosConfig';
import { showDataLoadError, showDataLoadSuccess } from '../utils/notifications';

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Validar que todas las secciones del book club estén completas
 * @param {Object} bookClubObject - The complete book club configuration object
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
const validateBookClub = (bookClubObject) => {
  const errors = [];

  // Validar metadata (Configuración Principal)
  if (!bookClubObject.metadata) {
    errors.push('Configuración Principal: Falta la sección de metadata');
  } else {
    if (!bookClubObject.metadata.month || bookClubObject.metadata.month.trim() === '') {
      errors.push('Configuración Principal: El mes es obligatorio');
    }
    if (!bookClubObject.metadata.theme || bookClubObject.metadata.theme.trim() === '') {
      errors.push('Configuración Principal: El tema es obligatorio');
    }
  }

  if (!bookClubObject.sections || !bookClubObject.sections.weeklyAudio) {
    errors.push('Audio del mes: Falta la sección weeklyAudio');
  } else {
    if (!bookClubObject.sections.weeklyAudio.title || 
        bookClubObject.sections.weeklyAudio.title.trim() === '') {
      errors.push('Audio del mes: El título es obligatorio');
    }
    if (!bookClubObject.sections.weeklyAudio.description || 
        bookClubObject.sections.weeklyAudio.description.trim() === '') {
      errors.push('Audio del mes: La descripción es obligatoria');
    }
    if (!bookClubObject.sections.weeklyAudio.fileUrl || 
        bookClubObject.sections.weeklyAudio.fileUrl.trim() === '') {
      errors.push('Audio del mes: El archivo de audio es obligatorio');
    }
  }

  if (!bookClubObject.sections || !bookClubObject.sections.practicalSheet) {
    errors.push('Ficha Práctica: Falta la sección practicalSheet');
  } else {
    if (!bookClubObject.sections.practicalSheet.title || 
        bookClubObject.sections.practicalSheet.title.trim() === '') {
      errors.push('Ficha Práctica: El título es obligatorio');
    }
    if (!bookClubObject.sections.practicalSheet.description || 
        bookClubObject.sections.practicalSheet.description.trim() === '') {
      errors.push('Ficha Práctica: La descripción es obligatoria');
    }
    if (!bookClubObject.sections.practicalSheet.fileUrl || 
        bookClubObject.sections.practicalSheet.fileUrl.trim() === '') {
      errors.push('Ficha Práctica: El archivo descargable es obligatorio');
    }
  }

  if (!bookClubObject.sections || !bookClubObject.sections.questionsForAnyBook) {
    errors.push('Preguntas para cualquier libro: Falta la sección questionsForAnyBook');
  } else {
    if (!bookClubObject.sections.questionsForAnyBook.title || 
        bookClubObject.sections.questionsForAnyBook.title.trim() === '') {
      errors.push('Preguntas para cualquier libro: El título es obligatorio');
    }
    if (!bookClubObject.sections.questionsForAnyBook.description || 
        bookClubObject.sections.questionsForAnyBook.description.trim() === '') {
      errors.push('Preguntas para cualquier libro: La descripción es obligatoria');
    }
    if (!bookClubObject.sections.questionsForAnyBook.fileUrl || 
        bookClubObject.sections.questionsForAnyBook.fileUrl.trim() === '') {
      errors.push('Preguntas para cualquier libro: La ficha con las preguntas es obligatoria');
    }
  }

  if (!bookClubObject.books || !Array.isArray(bookClubObject.books) || bookClubObject.books.length === 0) {
    errors.push('Libros sugeridos del mes: Debe haber al menos un libro configurado');
  } else {
    bookClubObject.books.forEach((book, index) => {
      if (!book.bookId) {
        return;
      }
      if (!book.guideUrl || book.guideUrl.trim() === '') {
        errors.push(`Libros sugeridos del mes: El libro ${index + 1} no tiene guía (PDF o imagen)`);
      }
    });
    const withBookId = bookClubObject.books.filter((b) => b && b.bookId);
    if (withBookId.length === 0) {
      errors.push('Libros sugeridos del mes: Debe haber al menos un libro configurado');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Add a new book club
 * @param {Object} bookClubObject - The complete book club configuration object
 * @returns {Promise} Promise that resolves to the response data
 */
export const addBookClub = async (bookClubObject) => {
  try {
    // Validar que todas las secciones estén completas
    const validation = validateBookClub(bookClubObject);
    
    if (!validation.isValid) {
      const errorMessage = `Por favor, completa todas las secciones antes de guardar:\n${validation.errors.join('\n')}`;
      showDataLoadError('Book Club', errorMessage);
      throw new Error(errorMessage);
    }

    // Realizar la petición POST
    const response = await axios.post(`${API_BASE_URL}/book-club/add-book-club`, {
      book_club_object: bookClubObject
    });

    // Validar el status code y el status de la respuesta
    if (response.status === 200 && response.data.status === true) {
      showDataLoadSuccess('Book Club', 'Book Club guardado exitosamente');
      return response.data;
    } else {
      const errorMessage = response.data?.status_Message || 'Error al guardar el Book Club';
      showDataLoadError('Book Club', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error adding book club:', error);
    
    // Si ya se mostró el error en la validación, no mostrar otro
    if (error.message && error.message.includes('Por favor, completa todas las secciones')) {
      throw error;
    }
    
    const errorMessage = error.response?.data?.status_Message || error.message || 'Error al guardar el Book Club';
    showDataLoadError('Book Club', errorMessage);
    throw error;
  }
};

/**
 * Save a book club file (image, audio, PDF, etc.) to S3
 * @param {string} fileTypeExtension - File extension (e.g., 'jpg', 'mp3', 'pdf')
 * @param {string} base64File - Base64 encoded file content
 * @param {File} file - Original File object (required for audio files)
 * @param {boolean} showNotification - Whether to show success notification (default: false)
 * @returns {Promise} Promise that resolves to the response data with file URL
 */
export const saveBookClubFile = async (fileTypeExtension, base64File, file = null, showNotification = false) => {
  try {
    // Extensiones de audio válidas
    const audioExtensions = ['mp3', 'mp4', 'wav'];
    
    // Determinar si es un archivo de audio
    const isAudio = audioExtensions.includes(fileTypeExtension?.toLowerCase());
    
    // Para archivos de audio, enviar base64_file vacío, solo la extensión
    const requestBody = {
      file_type_extension: fileTypeExtension,
      base64_file: isAudio ? '' : base64File
    };

    const response = await axios.post(`${API_BASE_URL}/book-club/save-book-club-file`, requestBody);

    // Si es audio y recibimos uploadUrl, hacer PUT al presigned URL
    if (isAudio && response.data.status === true && response.data.uploadUrl) {
      if (!file) {
        throw new Error('El objeto File es requerido para subir archivos de audio');
      }

      try {
        // Hacer PUT al uploadUrl con el archivo original
        const uploadResponse = await fetch(response.data.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file // El objeto File directo del input, NO Base64
        });

        if (!uploadResponse.ok) {
          // Verificar si es error 413 (Content Too Large)
          if (uploadResponse.status === 413) {
            const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
            const errorMessage = `El archivo es demasiado pesado (${fileSizeMB}MB). Por favor, selecciona un archivo más pequeño.`;
            showDataLoadError('Archivo', errorMessage);
            throw new Error(errorMessage);
          }
          throw new Error(`Error al subir archivo a S3: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }

        // Extraer la URL final sin query parameters (todo antes del ?)
        const uploadUrl = response.data.uploadUrl;
        const finalUrl = uploadUrl.split('?')[0];

        // Retornar respuesta con la URL final
        return {
          ...response.data,
          file_url: finalUrl
        };
      } catch (uploadError) {
        console.error('Error al subir archivo a S3:', uploadError);
        
        // Verificar si es error 413 (Content Too Large) en el PUT
        if (uploadError.message && uploadError.message.includes('413')) {
          const fileSizeMB = file ? (file.size / 1024 / 1024).toFixed(2) : 'desconocido';
          const errorMessage = `El archivo es demasiado pesado (${fileSizeMB}MB). Por favor, selecciona un archivo más pequeño.`;
          showDataLoadError('Archivo', errorMessage);
          throw new Error(errorMessage);
        }
        
        throw new Error(`Error al subir archivo a S3: ${uploadError.message}`);
      }
    }

    // Solo mostrar notificación si se solicita explícitamente
    if (showNotification && response.data.status === true) {
      showDataLoadSuccess('Archivo', 'Archivo guardado exitosamente');
    }

    return response.data;
  } catch (error) {
    console.error('Error saving book club file:', error);
    
    // Verificar si es error 413 (Content Too Large)
    if (error.response?.status === 413) {
      const fileSizeMB = file ? (file.size / 1024 / 1024).toFixed(2) : 'desconocido';
      const errorMessage = `El archivo es demasiado pesado (${fileSizeMB}MB). Por favor, selecciona un archivo más pequeño.`;
      showDataLoadError('Archivo', errorMessage);
      throw new Error(errorMessage);
    }
    
    // Verificar si el mensaje de error ya contiene información sobre el tamaño
    const errorMessage = error.response?.data?.status_Message || error.message || 'Error al guardar archivo';
    
    // Si el mensaje ya menciona el error 413, personalizarlo
    if (errorMessage.includes('413') || errorMessage.includes('Content Too Large') || errorMessage.includes('too large')) {
      const fileSizeMB = file ? (file.size / 1024 / 1024).toFixed(2) : 'desconocido';
      const customMessage = `El archivo es demasiado pesado (${fileSizeMB}MB). Por favor, selecciona un archivo más pequeño.`;
      showDataLoadError('Archivo', customMessage);
      throw new Error(customMessage);
    }
    
    // Siempre mostrar errores
    showDataLoadError('Archivo', errorMessage);
    throw error;
  }
};

/**
 * Get a book club by target month
 * @param {string} targetMonth - Target month to retrieve (e.g., 'Noviembre', 'Diciembre')
 * @returns {Promise} Promise that resolves to the book club data
 */
export const getBookClub = async (targetMonth) => {
  try {
    // Asegurar que el mes tenga la primera letra mayúscula
    const formattedMonth = targetMonth.charAt(0).toUpperCase() + targetMonth.slice(1).toLowerCase();
    
    const response = await axios.get(`${API_BASE_URL}/book-club/get-book-club`, {
      params: {
        target_month: formattedMonth,
        only_text_object: 'yes'
      }
    });

    if (response.status === 200 && response.data.status === true) {
      return response.data;
    } else {
      const errorMessage = response.data?.status_Message || 'Error al obtener Book Club';
      showDataLoadError('Book Club', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error getting book club:', error);
    // No mostrar error si el book club no existe (404)
    if (error.response?.status !== 404) {
      const errorMessage = error.response?.data?.status_Message || error.message || 'Error al obtener Book Club';
      showDataLoadError('Book Club', errorMessage);
    }
    throw error;
  }
};

/**
 * Update an existing book club
 * @param {number} bookClubId - ID of the book club to update
 * @param {Object} bookClubObject - The complete book club configuration object
 * @returns {Promise} Promise that resolves to the response data
 */
export const updateBookClub = async (bookClubId, bookClubObject) => {
  try {
    // Validar que todas las secciones estén completas (reutilizar la misma validación de creación)
    const validation = validateBookClub(bookClubObject);

    if (!validation.isValid) {
      const errorMessage = `Por favor, completa todas las secciones antes de actualizar:\n${validation.errors.join('\n')}`;
      showDataLoadError('Book Club', errorMessage);
      throw new Error(errorMessage);
    }

    const response = await axios.post(
      `${API_BASE_URL}/book-club/update-book-club`,
      {
        book_club_id: bookClubId,
        book_club_object: bookClubObject
      }
    );

    if (response.status === 200 && response.data.status === true) {
      showDataLoadSuccess('Book Club', 'Book Club actualizado exitosamente');
      return response.data;
    } else {
      const errorMessage = response.data?.status_Message || 'Error al actualizar el Book Club';
      showDataLoadError('Book Club', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error updating book club:', error);

    // Si ya se mostró el error en la validación, no mostrar otro
    if (error.message && error.message.includes('Por favor, completa todas las secciones')) {
      throw error;
    }

    const errorMessage =
      error.response?.data?.status_Message || error.message || 'Error al actualizar el Book Club';
    showDataLoadError('Book Club', errorMessage);
    throw error;
  }
};

/**
 * Obtener las preguntas (y respuestas) que las personas envían desde la ecommerce para un book club.
 * Requiere token de autenticación.
 * @param {number} bookClubId - ID del book club
 * @returns {Promise<{ status: boolean, status_Message: string, body: Array<{ book_club_question_id: number, question: string, created_at: string, name: string, book_club_answer_id: number|null, answer: string }> }>}
 */
export const getBookClubQuestions = async (bookClubId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/book-club/get_book_club_questions`, {
      book_club_id: bookClubId
    });

    if (response.status === 200 && response.data.status === true) {
      return response.data;
    }
    const errorMessage = response.data?.status_Message || 'Error al obtener preguntas del Book Club';
    showDataLoadError('Preguntas Book Club', errorMessage);
    throw new Error(errorMessage);
  } catch (error) {
    console.error('Error getting book club questions:', error);
    const errorMessage =
      error.response?.data?.status_Message || error.message || 'Error al obtener preguntas del Book Club';
    if (!error.response || error.response.status !== 404) {
      showDataLoadError('Preguntas Book Club', errorMessage);
    }
    throw error;
  }
};

/**
 * Añadir respuesta a una pregunta del book club.
 * Requiere token de autenticación.
 * @param {number} bookClubQuestionId - ID de la pregunta
 * @param {string} answer - Texto de la respuesta
 * @returns {Promise<{ status: boolean, status_Message: string, book_club_answer_id: number }>}
 */
export const addBookClubAnswer = async (bookClubQuestionId, answer) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/book-club/add_book_club_answer`, {
      book_club_question_id: bookClubQuestionId,
      answer
    });

    const data = response.data;
    if (data?.status === true) {
      return data;
    }
    const errorMessage = data?.status_Message || 'Error al guardar la respuesta';
    showDataLoadError('Preguntas Book Club', errorMessage);
    throw new Error(errorMessage);
  } catch (error) {
    console.error('Error adding book club answer:', error);
    const data = error.response?.data;
    if (data?.status === true) {
      return data;
    }
    const errorMessage = data?.status_Message || error.message || 'Error al guardar la respuesta';
    showDataLoadError('Preguntas Book Club', errorMessage);
    throw error;
  }
};

/**
 * Actualizar la respuesta de una pregunta del book club.
 * Requiere token de autenticación.
 * @param {number} bookClubAnswerId - ID de la respuesta
 * @param {number} bookClubQuestionId - ID de la pregunta
 * @param {string} answer - Nuevo texto de la respuesta
 * @returns {Promise<void>} Respuesta 204 sin cuerpo
 */
export const updateBookClubAnswer = async (bookClubAnswerId, bookClubQuestionId, answer) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/book-club/update_book_club_answer`, {
      book_club_answer_id: bookClubAnswerId,
      book_club_question_id: bookClubQuestionId,
      answer
    });

    if (response.status === 204 || response.status === 200) {
      return response.data;
    }
    const errorMessage = response.data?.status_Message || 'Error al actualizar la respuesta';
    showDataLoadError('Preguntas Book Club', errorMessage);
    throw new Error(errorMessage);
  } catch (error) {
    console.error('Error updating book club answer:', error);
    const errorMessage =
      error.response?.data?.status_Message || error.message || 'Error al actualizar la respuesta';
    showDataLoadError('Preguntas Book Club', errorMessage);
    throw error;
  }
};


