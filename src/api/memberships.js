import axios from "axios";
import { showDataLoadError, showDataLoadSuccess } from "../utils/notifications";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Instancia de axios con interceptores para endpoints que requieren token
import axiosConfig from "../utils/axiosConfig";

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
 * Get memberships
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
