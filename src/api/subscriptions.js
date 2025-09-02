import axiosConfig from '../utils/axiosConfig';
import { showDataLoadError, showDataLoadSuccess } from '../utils/notifications';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Get all subscriptions with membership details
 * @returns {Promise} Promise with subscriptions data including memberships
 */
export const getSubscriptions = async () => {
  try {
    const response = await axiosConfig.get(
      `${API_BASE_URL}/memberships/get-subscriptions`
    );

    if (response.data.status === true) {
      const membershipCount = response.data.memberships?.length || 0;
      const totalSubscriptions = response.data.memberships?.reduce((total, membership) => {
        return total + (membership.subscriptions?.length || 0);
      }, 0) || 0;
      
      if (membershipCount > 0) {
        showDataLoadSuccess('suscripciones', totalSubscriptions);
      }
      
      return response.data;
    } else {
      showDataLoadError('suscripciones', response.data.status_Message || 'Error al cargar suscripciones');
      throw new Error(response.data.status_Message || 'Error al cargar suscripciones');
    }
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    const errorMessage = error.response?.data?.status_Message || 'Error al cargar suscripciones';
    showDataLoadError('suscripciones', errorMessage);
    throw error;
  }
};

/**
 * Get subscriptions by membership ID
 * @param {number} membershipId - Membership ID to filter subscriptions
 * @returns {Promise} Promise with filtered subscriptions data
 */
export const getSubscriptionsByMembership = async (membershipId) => {
  try {
    const response = await getSubscriptions();
    
    if (response.status === true && response.memberships) {
      const membership = response.memberships.find(m => m.membership_id === membershipId);
      return {
        status: true,
        membership: membership || null,
        subscriptions: membership?.subscriptions || []
      };
    } else {
      throw new Error('Error al filtrar suscripciones por membresía');
    }
  } catch (error) {
    console.error('Error filtering subscriptions by membership:', error);
    throw error;
  }
};

/**
 * Get active subscriptions count
 * @returns {Promise} Promise with active subscriptions count
 */
export const getActiveSubscriptionsCount = async () => {
  try {
    const response = await getSubscriptions();
    
    if (response.status === true && response.memberships) {
      const activeCount = response.memberships.reduce((total, membership) => {
        const activeSubs = membership.subscriptions?.filter(sub => sub.status === 'active') || [];
        return total + activeSubs.length;
      }, 0);
      
      return {
        status: true,
        activeCount,
        totalCount: response.memberships.reduce((total, membership) => {
          return total + (membership.subscriptions?.length || 0);
        }, 0)
      };
    } else {
      throw new Error('Error al obtener conteo de suscripciones');
    }
  } catch (error) {
    console.error('Error getting subscriptions count:', error);
    throw error;
  }
};
