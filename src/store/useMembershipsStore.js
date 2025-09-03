import { create } from 'zustand';
import { getMemberships } from '../api/memberships';
import { getSubscriptions } from '../api/subscriptions';

const useMembershipsStore = create((set, get) => ({
  memberships: [],
  isLoading: false,
  error: null,
  isInitialized: false,
  lastLoadTime: 0, // Para evitar llamadas muy cercanas
  
  // Métricas de suscripciones
  totalSubscriptions: 0,
  activeSubscriptions: 0,

  // Cargar membresías con suscripciones
  loadMemberships: async () => {
    // Evitar llamadas duplicadas si ya está cargando
    const currentState = get();
    const now = Date.now();
    
    if (currentState.isLoading) {
      return;
    }
    
    // Evitar llamadas muy cercanas (menos de 100ms)
    if (now - currentState.lastLoadTime < 100) {
      return;
    }
    
    set({ isLoading: true, error: null, lastLoadTime: now });
    
    try {
      // Cargar membresías básicas
      const membershipsResponse = await getMemberships();
      
      if (membershipsResponse.status === true) {
        const basicMemberships = membershipsResponse.membership_list || [];
        
        // Cargar suscripciones para enriquecer las membresías
        try {
          const subscriptionsResponse = await getSubscriptions();
          
          if (subscriptionsResponse.status === true) {
            const membershipsWithSubscriptions = basicMemberships.map(basicMembership => {
              // Buscar si hay suscripciones para esta membresía
              const membershipWithSubs = subscriptionsResponse.memberships?.find(
                m => m.membership_id === basicMembership.membership_id
              );
              
              // Combinar información básica con suscripciones
              return {
                ...basicMembership,
                subscriptions: membershipWithSubs?.subscriptions || []
              };
            });
            
            // Calcular métricas totales
            const totalSubscriptions = membershipsWithSubscriptions.reduce((total, membership) => {
              return total + (membership.subscriptions?.length || 0);
            }, 0);
            
            const activeSubscriptions = membershipsWithSubscriptions.reduce((total, membership) => {
              const activeSubs = membership.subscriptions?.filter(sub => sub.status === 'active') || [];
              return total + activeSubs.length;
            }, 0);
            
            set({
              memberships: membershipsWithSubscriptions,
              totalSubscriptions,
              activeSubscriptions,
              isLoading: false,
              isInitialized: true,
              error: null
            });
          } else {
            // Si falla la carga de suscripciones, usar solo membresías básicas
            set({
              memberships: basicMemberships,
              totalSubscriptions: 0,
              activeSubscriptions: 0,
              isLoading: false,
              isInitialized: true,
              error: null
            });
          }
        } catch (subscriptionsError) {
          console.warn('Error loading subscriptions, using basic memberships:', subscriptionsError);
          // Si falla la carga de suscripciones, usar solo membresías básicas
          set({
            memberships: basicMemberships,
            totalSubscriptions: 0,
            activeSubscriptions: 0,
            isLoading: false,
            isInitialized: true,
            error: null
          });
        }
      } else {
        set({
          memberships: [],
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          isLoading: false,
          isInitialized: true,
          error: membershipsResponse.status_Message || 'Error al cargar membresías'
        });
      }
    } catch (error) {
      console.error('Error loading memberships:', error);
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

  // Recargar solo las suscripciones (sin recargar membresías básicas)
  refreshSubscriptions: async () => {
    try {
      const subscriptionsResponse = await getSubscriptions();
      
      if (subscriptionsResponse.status === true) {
        const currentState = get();
        const updatedMemberships = currentState.memberships.map(basicMembership => {
          // Buscar si hay suscripciones para esta membresía
          const membershipWithSubs = subscriptionsResponse.memberships?.find(
            m => m.membership_id === basicMembership.membership_id
          );
          
          // Combinar información básica con suscripciones
          return {
            ...basicMembership,
            subscriptions: membershipWithSubs?.subscriptions || []
          };
        });
        
        // Calcular métricas totales
        const totalSubscriptions = updatedMemberships.reduce((total, membership) => {
          return total + (membership.subscriptions?.length || 0);
        }, 0);
        
        const activeSubscriptions = updatedMemberships.reduce((total, membership) => {
          const activeSubs = membership.subscriptions?.filter(sub => sub.status === 'active') || [];
          return total + activeSubs.length;
        }, 0);
        
        set({
          memberships: updatedMemberships,
          totalSubscriptions,
          activeSubscriptions
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error refreshing subscriptions:', error);
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
