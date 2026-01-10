import { create } from 'zustand';
import { getMembershipsResume } from '../api/memberships';

const useMembershipsStore = create((set, get) => ({
  memberships: [],
  isLoading: false,
  error: null,
  isInitialized: false,
  lastLoadTime: 0, // Para evitar llamadas muy cercanas
  
  // Métricas de suscripciones
  totalSubscriptions: 0,
  activeSubscriptions: 0,

  // Cargar membresías con resumen de suscripciones
  loadMemberships: async () => {
    const currentState = get();
    const now = Date.now();
    
    if (currentState.isLoading) {
      return;
    }
    
    if (now - currentState.lastLoadTime < 100) {
      return;
    }
    
    set({ isLoading: true, error: null, lastLoadTime: now });
    
    try {
      const response = await getMembershipsResume();
      
      if (response.status === true) {
        const membershipsData = response.memberships || [];
        
        // Mapear los datos del nuevo endpoint al formato esperado por la UI
        const mappedMemberships = membershipsData.map((membership, index) => ({
          membership_id: membership.membership_id || index + 1,
          membership_name: membership.membership_name,
          description: membership.description || '',
          price: membership.price,
          status: membership.membership_status === 'active',
          active_subscribers_count: membership.active_subscribers_count,
          subscriptions: Array(membership.active_subscribers_count || 0).fill(null).map((_, i) => ({
            subscription_id: `temp-${index}-${i}`,
            status: 'active'
          }))
        }));
        
        // Calcular métricas totales
        const totalSubscriptions = membershipsData.reduce((total, membership) => {
          return total + (membership.active_subscribers_count || 0);
        }, 0);
        
        const activeSubscriptions = membershipsData
          .filter(m => m.membership_status === 'active')
          .reduce((total, membership) => {
            return total + (membership.active_subscribers_count || 0);
          }, 0);
        
        set({
          memberships: mappedMemberships,
          totalSubscriptions,
          activeSubscriptions,
          isLoading: false,
          isInitialized: true,
          error: null
        });
      } else {
        set({
          memberships: [],
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          isLoading: false,
          isInitialized: true,
          error: response.status_Message || 'Error al cargar membresías'
        });
      }
    } catch (error) {
      console.error('Error loading memberships resume:', error);
      set({
        memberships: [],
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        isLoading: false,
        isInitialized: true,
        error: error.message || 'Error al cargar membresías'
      });
    }
  },

  // Recargar el resumen de membresías
  refreshSubscriptions: async () => {
    try {
      const response = await getMembershipsResume();
      
      if (response.status === true) {
        const membershipsData = response.memberships || [];
        
        // Mapear los datos del nuevo endpoint al formato esperado por la UI
        const mappedMemberships = membershipsData.map((membership, index) => ({
          membership_id: membership.membership_id || index + 1,
          membership_name: membership.membership_name,
          description: membership.description || '',
          price: membership.price,
          status: membership.membership_status === 'active',
          active_subscribers_count: membership.active_subscribers_count,
          subscriptions: Array(membership.active_subscribers_count || 0).fill(null).map((_, i) => ({
            subscription_id: `temp-${index}-${i}`,
            status: 'active'
          }))
        }));
        
        // Calcular métricas totales
        const totalSubscriptions = membershipsData.reduce((total, membership) => {
          return total + (membership.active_subscribers_count || 0);
        }, 0);
        
        const activeSubscriptions = membershipsData
          .filter(m => m.membership_status === 'active')
          .reduce((total, membership) => {
            return total + (membership.active_subscribers_count || 0);
          }, 0);
        
        set({
          memberships: mappedMemberships,
          totalSubscriptions,
          activeSubscriptions
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing memberships resume:', error);
      return false;
    }
  },

  // Agregar nueva membresía al store (después de crear)
  addMembership: (membership) => {
    set((state) => ({
      memberships: [...state.memberships, { ...membership, subscriptions: [] }]
    }));
  },

  // Actualizar membresía en el store
  updateMembership: (membershipId, updatedData) => {
    set((state) => ({
      memberships: state.memberships.map(membership => 
        membership.membership_id === membershipId 
          ? { ...membership, ...updatedData }
          : membership
      )
    }));
  },

  // Eliminar membresía del store
  removeMembership: (membershipId) => {
    set((state) => ({
      memberships: state.memberships.filter(membership => membership.membership_id !== membershipId)
    }));
  },

  // Obtener membresía por ID (con suscripciones incluidas)
  getMembershipById: (membershipId) => {
    const { memberships } = get();
    return memberships.find(m => m.membership_id === membershipId);
  },

  // Obtener suscripciones por membresía ID
  getSubscriptionsByMembershipId: (membershipId) => {
    const { memberships } = get();
    const membership = memberships.find(m => m.membership_id === membershipId);
    return membership?.subscriptions || [];
  },

  // Obtener suscripciones activas por membresía ID
  getActiveSubscriptionsByMembershipId: (membershipId) => {
    const { memberships } = get();
    const membership = memberships.find(m => m.membership_id === membershipId);
    return membership?.subscriptions?.filter(sub => sub.status === 'active') || [];
  },

  // Obtener estadísticas generales
  getStatistics: () => {
    const { memberships, totalSubscriptions, activeSubscriptions } = get();
    
    // Calcular métricas adicionales
    const totalRevenue = memberships.reduce((total, membership) => {
      const activeSubs = membership.subscriptions?.filter(sub => sub.status === 'active') || [];
      return total + (activeSubs.length * (membership.price || 0));
    }, 0);
    
    const averageSubscriptionValue = totalSubscriptions > 0 ? totalRevenue / totalSubscriptions : 0;
    
    return {
      totalMemberships: memberships.length,
      totalSubscriptions,
      activeSubscriptions,
      inactiveSubscriptions: totalSubscriptions - activeSubscriptions,
      totalRevenue,
      averageSubscriptionValue,
      conversionRate: totalSubscriptions > 0 ? (activeSubscriptions / totalSubscriptions) * 100 : 0
    };
  },

  // Limpiar error
  clearError: () => {
    set({ error: null });
  },

  // Resetear estado
  reset: () => {
    set({
      memberships: [],
      isLoading: false,
      error: null,
      isInitialized: false,
      lastLoadTime: 0,
      totalSubscriptions: 0,
      activeSubscriptions: 0
    });
  }
}));

export default useMembershipsStore;
