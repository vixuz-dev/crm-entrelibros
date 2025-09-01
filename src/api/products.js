import axios from "axios";
import { showDataLoadError, showDataLoadSuccess } from "../utils/notifications";
import { prepareSearchTerm } from "../utils/searchUtils";
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Crear una instancia de axios sin interceptores para endpoints públicos
const publicAxios = axios.create();

// Instancia de axios con interceptores para endpoints que requieren token
import axiosConfig from "../utils/axiosConfig";



/**
 * Get products with pagination and optional search
 * @param {number} page - Page number (starts from 1)
 * @param {number} limit - Number of items per page
 * @param {string} searchTerm - Optional search term for product_name
 * @returns {Promise} Promise with products data
 */
export const getProducts = async (page = 1, limit = 8, searchTerm = '') => {
  try {

    
    // Build URL with query parameters
    let url = `${API_BASE_URL}/products/get-products`;
    const queryParams = new URLSearchParams();
    
    // Add search parameter as query param if provided
    if (searchTerm && searchTerm.trim()) {
      // Preparar el término de búsqueda preservando caracteres especiales
      const preparedSearchTerm = prepareSearchTerm(searchTerm);
      queryParams.append('product_name', preparedSearchTerm);
    }
    
    // Add query params to URL if any exist
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const requestBody = {
      page,
      limit,
    };

    
    
    const response = await axiosConfig.post(url, requestBody);

    // if (response.data.status === true) {
    //   const productCount = response.data.product_list?.length || 0;
    //   showDataLoadSuccess('productos', productCount);
    // }

    
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    const errorMessage = error.response?.data?.status_Message || 'Error al cargar productos';
    showDataLoadError('productos', errorMessage);
    throw error;
  }
};

/**
 * Get product detail by ID
 * @param {number} productId - Product ID
 * @returns {Promise} Promise with product detail data
 */
export const getProductDetail = async (productId) => {
  try {
    const response = await axiosConfig.get(
      `${API_BASE_URL}/products/get-detail-product?product_id=${productId}`
    );

    
    return response.data;
  } catch (error) {
    console.error("Error fetching product detail:", error);
    throw error;
  }
};

/**
 * Update product stock
 * @param {number} productId - Product ID
 * @param {number} stockChange - Stock change amount (positive for increase, negative for decrease)
 * @returns {Promise} Promise with update result
 */
export const updateProductStock = async (productId, stockChange) => {
  try {
    const response = await axiosConfig.post(
      `${API_BASE_URL}/products/update-stock`,
      {
        product_id: productId,
        stock_change: stockChange,
      }
    );

    
    return response.data;
  } catch (error) {
    console.error("Error updating stock:", error);
    throw error;
  }
};

/**
 * Convert image to WebP format and get S3 URL
 * @param {string} base64_image - Base64 encoded image data
 * @param {string} file_type_extension - Original file extension (e.g., 'png', 'jpg', 'jpeg')
 * @param {boolean} is_main_image - Whether this is the main image for the product
 * @returns {Promise} Promise with S3 URL result
 */
export const convertImageToWebpGetUrl = async (base64_image, file_type_extension, is_main_image = true) => {
  try {
    const response = await axiosConfig.post(
      `${API_BASE_URL}/products/convert-image-to-webp-get-url`,
      {
        base64_image,
        file_type_extension,
        is_main_image
      }
    );

    if (response.data.status === true || response.data.status === 'true') {
      
      return response.data;
    } else {
      console.error('Error converting image:', response.data.status_Message);
      throw new Error(response.data.status_Message || 'Error al convertir y subir imagen');
    }
  } catch (error) {
    console.error('Error converting image to WebP:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al convertir y subir imagen';
    throw new Error(errorMessage);
  }
};

/**
 * Update existing product
 * @param {Object} productData - Product data to update
 * @param {number} productData.product_id - Product ID
 * @param {string} productData.product_name - Product name
 * @param {string} productData.product_description - Product description
 * @param {number} productData.price - Product price
 * @param {number} productData.price_offer - Product offer price
 * @param {number} productData.stock - Product stock
 * @param {number} productData.amount_pages - Number of pages
 * @param {boolean} productData.status - Product status
 * @param {Array<number>} productData.author_id_list - List of author IDs
 * @param {Array<number>} productData.category_id_list - List of category IDs
 * @param {Array<number>} productData.topic_id_list - List of topic IDs
 * @param {string} productData.main_image_url - Main image URL
 * @param {Array<string>} productData.secondary_image_url_list - List of secondary image URLs
 * @returns {Promise} Promise with update result
 */
export const updateProduct = async (productData) => {
  try {
    const response = await axiosConfig.put(
      `${API_BASE_URL}/products/update-product`,
      productData
    );

    if (response.data.status === true || response.data.status === 'true') {
      
      return response.data;
    } else {
      console.error('Error updating product:', response.data.status_Message);
      throw new Error(response.data.status_Message || 'Error al actualizar producto');
    }
  } catch (error) {
    console.error('Error updating product:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al actualizar producto';
    throw new Error(errorMessage);
  }
};

/**
 * Create new product
 * @param {Object} productData - Product data to create
 * @param {string} productData.product_name - Product name
 * @param {string} productData.product_description - Product description
 * @param {string} productData.product_type - Product type (e.g., 'FISICO', 'DIGITAL')
 * @param {number} productData.price - Product price
 * @param {number} productData.price_offer - Product offer price
 * @param {number} productData.stock - Product stock
 * @param {number} productData.amount_pages - Number of pages
 * @param {boolean} productData.status - Product status
 * @param {Array<number>} productData.author_id_list - List of author IDs
 * @param {Array<number>} productData.category_id_list - List of category IDs
 * @param {Array<number>} productData.topic_id_list - List of topic IDs
 * @param {string} productData.main_image_url - Main image URL
 * @param {Array<string>} productData.secondary_image_url_list - List of secondary image URLs
 * @returns {Promise} Promise with creation result
 */
export const addProduct = async (productData) => {
  try {
    const response = await axiosConfig.post(
      `${API_BASE_URL}/products/add-product`,
      productData
    );

    if (response.data.status === true || response.data.status === 'true') {
      
      return response.data;
    } else {
      console.error('Error creating product:', response.data.status_Message);
      throw new Error(response.data.status_Message || 'Error al crear producto');
    }
  } catch (error) {
    console.error('Error creating product:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al crear producto';
    throw new Error(errorMessage);
  }
};
