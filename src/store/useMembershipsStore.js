import { create } from 'zustand';
import { getMemberships } from '../api/memberships';

const useMembershipsStore = create((set, get) => ({
  memberships: [],
  isLoading: false,
  error: null,
  isInitialized: false,
  lastLoadTime: 0, // Para evitar llamadas muy cercanas

  // Cargar membresías
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
      const response = await getMemberships();
      
      if (response.status === true) {
        set({
          memberships: response.membership_list || [],
          isLoading: false,
          isInitialized: true,
          error: null
        });

      } else {
        set({
          memberships: [],
          isLoading: false,
          isInitialized: true,
          error: response.status_Message || 'Error al cargar membresías'
        });
      }
    } catch (error) {
      console.error('Error loading memberships:', error);
      set({
        memberships: [],
        isLoading: false,
        isInitialized: true,
        error: error.message || 'Error al cargar membresías'
      });
    }
  },

  // Agregar nueva membresía al store (después de crear)
  addMembership: (membership) => {
    set((state) => ({
      memberships: [...state.memberships, membership]
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

  // Limpiar error
  clearError: () => {
    set({ error: null });
  }
}));

export default useMembershipsStore;
