import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSessionToken } from '../utils/sessionCookie';

/**
 * Store de Zustand para manejar la información del administrador
 */
export const useAdminStore = create(
  persist(
    (set, get) => ({
  // Estado del administrador
  adminInfo: null,
  isLoading: false,

  // Acciones
  setAdminInfo: (adminInfo) => set({ adminInfo }),
  
  setLoading: (isLoading) => set({ isLoading }),

  // Guardar información del administrador desde el login
  setAdminInfoFromLogin: (loginResponse) => {
    const { personal_information, expiration_date } = loginResponse;
    
    const adminData = {
      ...personal_information,
      expiration: expiration_date
    };

    set({ adminInfo: adminData });
    
  },

  // Limpiar información del administrador
  clearAdminInfo: () => {
    set({ adminInfo: null });
    
  },

  // Verificar si el administrador está autenticado (solo verifica expiración)
  isAuthenticated: () => {
    const { adminInfo } = get();
    
    // Verificar que exista información del admin
    if (!adminInfo) return false;
    
    // Verificar que no haya expirado
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime < adminInfo.expiration;
  },

  // Obtener información personal del administrador
  getPersonalInfo: () => {
    const { adminInfo } = get();
    if (!adminInfo) return null;
    
    const { expiration, ...personalInfo } = adminInfo;
    return personalInfo;
  },

  // Actualizar información personal del administrador
  updatePersonalInfo: (newInfo) => {
    const { adminInfo } = get();
    if (!adminInfo) return;

    const updatedInfo = {
      ...adminInfo,
      ...newInfo
    };

    set({ adminInfo: updatedInfo });
    
  }
}),
    {
      name: 'admin-store', // Nombre para localStorage
      partialize: (state) => ({
        // Solo persistir adminInfo, no el estado de loading
        adminInfo: state.adminInfo
      })
    }
  )
);
