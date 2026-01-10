import axios from "axios";
import { showDataLoadError, showDataLoadSuccess } from "../utils/notifications";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Instancia de axios con interceptores para endpoints que requieren token
import axiosConfig from "../utils/axiosConfig";

// Instancia de axios sin interceptores para endpoints que NO requieren token
const axiosWithoutToken = axios.create();

/**
 * Create new membership
 * @param {Object} membershipData - Membership data to create
 * @param {string} membershipData.membership_name - Membership name
 * @param {string} membershipData.description - Membership description
 * @param {Array<string>} membershipData.benefits - List of benefits
 * @param {number} membershipData.price - Membership price
 * @param {boolean} membershipData.status - Membership status
 * @param {Array<number>} membershipData.product_id_list - List of product IDs
 * @returns {Promise} Promise with creation result
 */
export const addMembership = async (membershipData) => {
  try {
    const response = await axiosConfig.post(
      `${API_BASE_URL}/memberships/add-membership`,
      membershipData
    );

    if (response.data.status === true || response.data.status === 'true') {
      
      return response.data;
    } else {
      console.error('Error creating membership:', response.data.status_Message);
      throw new Error(response.data.status_Message || 'Error al crear membresía');
    }
  } catch (error) {
    console.error('Error creating membership:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al crear membresía';
    throw new Error(errorMessage);
  }
};

/**
 * Get memberships resume (replaces getMemberships + getSubscriptions)
 * @returns {Promise} Promise with memberships resume data
 * Note: This endpoint does not require authentication token
 */
export const getMembershipsResume = async () => {
  try {
    const response = await axiosWithoutToken.get(
      `${API_BASE_URL}/memberships/get-suscriptions-summary`,
      {
        headers: {},
        withCredentials: false
      }
    );

    if (response.data.status === true) {
      const membershipCount = response.data.memberships?.length || 0;
      if (membershipCount > 0) {
        showDataLoadSuccess('membresías', membershipCount);
      }
      return response.data;
    } else {
      const errorMessage = response.data.status_Message || 'Error al cargar membresías';
      showDataLoadError('membresías', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Error fetching memberships resume:", error);
    const errorMessage = error.response?.data?.status_Message || 'Error al cargar membresías';
    showDataLoadError('membresías', errorMessage);
    throw error;
  }
};

/**
 * Get memberships (legacy - kept for backward compatibility)
 * @returns {Promise} Promise with memberships data
 */
export const getMemberships = async () => {
  try {
    const response = await axiosConfig.get(
      `${API_BASE_URL}/memberships/get-memberships`
    );

    if (response.data.status === true) {
      const membershipCount = response.data.membership_list?.length || 0;
      if (membershipCount > 0) {
        // showDataLoadSuccess('membresías', membershipCount);
      } else {

      }
    }

    
    return response.data;
  } catch (error) {
    console.error("Error fetching memberships:", error);
    const errorMessage = error.response?.data?.status_Message || 'Error al cargar membresías';
    showDataLoadError('membresías', errorMessage);
    throw error;
  }
};

/**
 * Get membership detail by ID
 * @param {number} membershipId - Membership ID
 * @returns {Promise} Promise with membership detail data
 * Note: This endpoint does not require authentication token
 */
export const getMembershipDetail = async (membershipId) => {
  try {
    // Usar instancia de axios sin interceptores para no enviar token
    // Nuevo endpoint: get-memberships/details
    const response = await axiosWithoutToken.get(
      `${API_BASE_URL}/memberships/get-memberships/details`,
      {
        params: { id: membershipId },
        headers: {},
        withCredentials: false
      }
    );

    if (response.data.status === true) {
      return response.data;
    } else {
      const errorMessage = response.data.status_Message || 'Error al cargar detalle de membresía';
      showDataLoadError('membresía', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Error fetching membership detail:", error);
    const errorMessage = error.response?.data?.status_Message || 'Error al cargar detalle de membresía';
    showDataLoadError('membresía', errorMessage);
    throw error;
  }
};

/**
 * Update existing membership
 * @param {Object} membershipData - Membership data to update
 * @param {number} membershipData.membership_id - Membership ID
 * @param {string} membershipData.membership_name - Membership name
 * @param {string} membershipData.description - Membership description
 * @param {Array<string>} membershipData.benefits - List of benefits
 * @param {number} membershipData.price - Membership price
 * @param {boolean} membershipData.status - Membership status
 * @param {Array<number>} membershipData.product_id_list - List of product IDs
 * @returns {Promise} Promise with update result
 */
export const updateMembership = async (membershipData) => {
  try {
    const response = await axiosConfig.put(
      `${API_BASE_URL}/memberships/update-membership`,
      membershipData
    );

    if (response.data.status === true || response.data.status === 'true') {
      
      return response.data;
    } else {
      console.error('Error updating membership:', response.data.status_Message);
      throw new Error(response.data.status_Message || 'Error al actualizar membresía');
    }
  } catch (error) {
    console.error('Error updating membership:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al actualizar membresía';
    throw new Error(errorMessage);
  }
};
