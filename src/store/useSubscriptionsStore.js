import { create } from 'zustand';
import { getSubscriptions, getSubscriptionsByMembership, getActiveSubscriptionsCount } from '../api/subscriptions';

const useSubscriptionsStore = create((set, get) => ({
  // Estado principal
  memberships: [],
  isLoading: false,
  error: null,
  isInitialized: false,
  lastLoadTime: 0,
  
  // Métricas y conteos
  totalMemberships: 0,
  totalSubscriptions: 0,
  activeSubscriptions: 0,
  
  // Filtros y búsquedas
  selectedMembershipId: null,
  searchTerm: '',

  // Cargar todas las suscripciones
  loadSubscriptions: async () => {
    const currentState = get();
    const now = Date.now();
    
    // Evitar llamadas duplicadas
    if (currentState.isLoading) {
      return;
    }
    
    // Evitar llamadas muy cercanas (menos de 100ms)
    if (now - currentState.lastLoadTime < 100) {
      return;
    }
    
    
    set({ isLoading: true, error: null, lastLoadTime: now });
    
    try {
      const response = await getSubscriptions();
      
      if (response.status === true) {
        const memberships = response.memberships || [];
        const totalSubscriptions = memberships.reduce((total, membership) => {
          return total + (membership.subscriptions?.length || 0);
        }, 0);
        
        const activeSubscriptions = memberships.reduce((total, membership) => {
          const activeSubs = membership.subscriptions?.filter(sub => sub.status === 'active') || [];
          return total + activeSubs.length;
        }, 0);
        
        set({
          memberships,
          totalMemberships: memberships.length,
          totalSubscriptions,
          activeSubscriptions,
          isLoading: false,
          isInitialized: true,
          error: null
        });


      } else {
        set({
          memberships: [],
          totalMemberships: 0,
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          isLoading: false,
          isInitialized: true,
          error: response.status_Message || 'Error al cargar suscripciones'
        });
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      set({
        memberships: [],
        totalMemberships: 0,
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        isLoading: false,
        isInitialized: true,
        error: error.message || 'Error al cargar suscripciones'
      });
    }
  },

  // Cargar suscripciones por membresía específica
  loadSubscriptionsByMembership: async (membershipId) => {
    try {
      const response = await getSubscriptionsByMembership(membershipId);
      
      if (response.status === true) {
        // Buscar si ya existe la membresía en el estado
        const currentState = get();
        const existingMembershipIndex = currentState.memberships.findIndex(m => m.membership_id == membershipId);
        
        if (existingMembershipIndex !== -1) {
          // Actualizar la membresía existente con las nuevas suscripciones
          const updatedMemberships = [...currentState.memberships];
          updatedMemberships[existingMembershipIndex] = {
            ...updatedMemberships[existingMembershipIndex],
            subscriptions: response.subscriptions || []
          };
          
          set({ 
            memberships: updatedMemberships,
            selectedMembershipId: membershipId 
          });
        } else {
          // Si no existe, agregar la nueva membresía con suscripciones
          const newMembership = {
            membership_id: membershipId,
            subscriptions: response.subscriptions || []
          };
          
          set({ 
            memberships: [...currentState.memberships, newMembership],
            selectedMembershipId: membershipId 
          });
        }
        
        return response;
      } else {
        throw new Error('Error al cargar suscripciones de la membresía');
      }
    } catch (error) {
      console.error('Error loading subscriptions by membership:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Obtener conteo de suscripciones activas
  loadSubscriptionsCount: async () => {
    try {
      const response = await getActiveSubscriptionsCount();
      
      if (response.status === true) {
        set({
          activeSubscriptions: response.activeCount,
          totalSubscriptions: response.totalCount
        });
        return response;
      } else {
        throw new Error('Error al obtener conteo de suscripciones');
      }
    } catch (error) {
      console.error('Error loading subscriptions count:', error);
      set({ error: error.message });
      throw error;
    }
  },

  // Filtrar membresías por término de búsqueda
  filterMemberships: (searchTerm) => {
    set({ searchTerm });
  },

  // Obtener membresías filtradas
  getFilteredMemberships: () => {
    const { memberships, searchTerm } = get();
    
    if (!searchTerm || searchTerm.trim() === '') {
      return memberships;
    }
    
    const term = searchTerm.toLowerCase().trim();
    
    return memberships.filter(membership => 
      membership.membership_name?.toLowerCase().includes(term) ||
      membership.description?.toLowerCase().includes(term) ||
      membership.benefits?.some(benefit => 
        benefit.toLowerCase().includes(term)
      )
    );
  },

  // Obtener membresía por ID
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
    const { memberships, totalMemberships, totalSubscriptions, activeSubscriptions } = get();
    
    // Calcular métricas adicionales
    const totalRevenue = memberships.reduce((total, membership) => {
      const activeSubs = membership.subscriptions?.filter(sub => sub.status === 'active') || [];
      return total + (activeSubs.length * membership.price);
    }, 0);
    
    const averageSubscriptionValue = totalSubscriptions > 0 ? totalRevenue / totalSubscriptions : 0;
    
    return {
      totalMemberships,
      totalSubscriptions,
      activeSubscriptions,
      inactiveSubscriptions: totalSubscriptions - activeSubscriptions,
      totalRevenue,
      averageSubscriptionValue,
      conversionRate: totalMemberships > 0 ? (activeSubscriptions / totalSubscriptions) * 100 : 0
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
      totalMemberships: 0,
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      selectedMembershipId: null,
      searchTerm: ''
    });
  }
}));

export default useSubscriptionsStore;
