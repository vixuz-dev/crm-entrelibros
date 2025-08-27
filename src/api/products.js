import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Crear una instancia de axios sin interceptores para endpoints públicos
const publicAxios = axios.create();

/**
 * Get products with pagination
 * @param {number} page - Page number (starts from 1)
 * @param {number} limit - Number of items per page
 * @returns {Promise} Promise with products data
 */
export const getProducts = async (page = 1, limit = 8) => {
  try {
    const response = await publicAxios.post(
      `${API_BASE_URL}/products/get-products`,
      {
        page,
        limit,
      }
    );

    console.log("Products fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
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
    const response = await publicAxios.get(
      `${API_BASE_URL}/products/get-detail-product?product_id=${productId}`
    );

    console.log("Product detail fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching product detail:", error);
    throw error;
  }
};
