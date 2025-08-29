import axios from '../utils/axiosConfig';
import { showDataLoadError, showDataLoadSuccess } from '../utils/notifications';

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get orders with pagination
 * @param {number} page - Page number (starts from 1)
 * @param {number} limit - Number of items per page
 * @returns {Promise} Promise with orders data
 */
export const getProductOrders = async (page = 1, limit = 8) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/orders/get-orders`, {
      page,
      limit
    });

    // if (response.data.status === true) {
    //   const orderCount = response.data.orders?.length || 0;
    //   showDataLoadSuccess('órdenes', orderCount);
    // }

    
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al cargar órdenes';
    showDataLoadError('órdenes', errorMessage);
    throw error;
  }
};

/**
 * Get order detail by ID
 * @param {number} orderId - Order ID
 * @returns {Promise} Promise with order detail data
 */
export const getOrderDetail = async (orderId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/orders/get-order-detail`, {
      order_id: orderId
    });
    
    
    return response.data;
  } catch (error) {
    console.error('Error fetching order detail:', error);
    throw error;
  }
};

/**
 * Change order sent status
 * @param {number} orderId - Order ID
 * @returns {Promise} Promise with order status change response
 */
export const changeOrderSentStatus = async (orderId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/orders/change-order-sent`, {
      order_id: orderId
    });
    
    
    return response.data;
  } catch (error) {
    console.error('Error changing order status:', error);
    throw error;
  }
};
