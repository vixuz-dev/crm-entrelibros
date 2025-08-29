import { useState, useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';
import { getSessionToken } from '../utils/sessionCookie';

/**
 * Hook personalizado para manejar el estado de autenticación
 */
export const useAuth = () => {
  const { adminInfo, clearAdminInfo } = useAdminStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Primero verificar que exista el token en SessionCookie
        const token = getSessionToken();
        if (!token) {
    
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Si hay token, verificar que exista información del admin
        if (!adminInfo) {
  
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Verificar que no haya expirado
        const currentTime = Math.floor(Date.now() / 1000);
        const isValid = currentTime < adminInfo.expiration;

        setIsAuthenticated(isValid);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    // Verificar autenticación cuando cambie el token o adminInfo
    checkAuth();
  }, [adminInfo]);

  const logout = () => {
    clearAdminInfo();
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    adminInfo,
    logout
  };
};
