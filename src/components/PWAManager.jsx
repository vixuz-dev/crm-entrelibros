import { useEffect, useState } from 'react';
import { FiDownload, FiX, FiRefreshCw } from 'react-icons/fi';

const PWAManager = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Función para limpiar cache y resetear PWA
  const clearPWACache = async () => {
    try {
      // Limpiar service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      // Limpiar cache del navegador
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Limpiar localStorage relacionado con PWA
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('pwa') || key.includes('workbox') || key.includes('sw'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      console.log('Cache PWA limpiado exitosamente');
      
      // Recargar la página después de limpiar
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error limpiando cache PWA:', error);
    }
  };

  useEffect(() => {
    // Variables para controlar el estado
    let updateFound = false;
    let isFirstLoad = true;

    // Función para manejar la instalación
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Función para manejar cuando se instala la app
    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // Función para manejar actualizaciones
    const handleUpdateFound = () => {
      updateFound = true;
    };

    // Verificar actualizaciones
    const checkForUpdates = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (registration) {
          // Solo mostrar actualización si no es la primera carga y hay una actualización real
          if (registration.waiting && updateFound && !isFirstLoad) {
            setShowUpdatePrompt(true);
          }

          registration.addEventListener('updatefound', handleUpdateFound);
        }
      } catch (error) {
        console.log('Error checking for updates:', error);
      }
    };

    // Agregar event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Verificar actualizaciones después de un delay para evitar falsos positivos
    const timer = setTimeout(() => {
      isFirstLoad = false;
      checkForUpdates();
    }, 3000);

    // Cleanup
    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
          if (registration) {
            registration.removeEventListener('updatefound', handleUpdateFound);
          }
        });
      }
    };
  }, []);

  // Manejar instalación
  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuario aceptó instalar la PWA');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  // Manejar actualización
  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.log('Error updating PWA:', error);
      setIsUpdating(false);
    }
  };

  // Manejar descarte
  const handleDismiss = (type) => {
    if (type === 'install') {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    } else if (type === 'update') {
      setShowUpdatePrompt(false);
    }
  };

  // Renderizar prompt de instalación
  if (showInstallPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm mx-auto">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <FiDownload className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-cabin-medium text-gray-900">
              Instalar EntreLibros CRM
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Instala esta aplicación en tu dispositivo para un acceso más rápido.
            </p>
          </div>
          <button
            onClick={() => handleDismiss('install')}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 flex space-x-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-blue-600 text-white text-xs font-cabin-medium py-2 px-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Instalar
          </button>
          <button
            onClick={() => handleDismiss('install')}
            className="flex-1 bg-gray-100 text-gray-700 text-xs font-cabin-medium py-2 px-3 rounded-md hover:bg-gray-200 transition-colors"
          >
            Más tarde
          </button>
        </div>
      </div>
    );
  }

  // Renderizar prompt de actualización
  if (showUpdatePrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm mx-auto">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <FiRefreshCw className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-cabin-medium text-gray-900">
              Nueva versión disponible
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Una nueva versión de la aplicación está lista para instalar.
            </p>
          </div>
          <button
            onClick={() => handleDismiss('update')}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 flex space-x-2">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 bg-green-600 text-white text-xs font-cabin-medium py-2 px-3 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button
            onClick={() => handleDismiss('update')}
            className="flex-1 bg-gray-100 text-gray-700 text-xs font-cabin-medium py-2 px-3 rounded-md hover:bg-gray-200 transition-colors"
          >
            Más tarde
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PWAManager;
