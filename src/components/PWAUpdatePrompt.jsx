import React, { useEffect, useState } from 'react';
import { FiRefreshCw, FiX } from 'react-icons/fi';

const PWAUpdatePrompt = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let updateFound = false;

    const handleUpdateFound = () => {
      updateFound = true;
    };

    const checkForUpdates = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (registration) {
          if (registration.waiting && updateFound) {
            setShowUpdatePrompt(true);
          }

          registration.addEventListener('updatefound', handleUpdateFound);
        }
      } catch (error) {
        console.log('Error checking for updates:', error);
      }
    };

    // Verificar actualizaciones después de un delay
    const timer = setTimeout(() => {
      checkForUpdates();
    }, 3000);

    return () => {
      clearTimeout(timer);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
          if (registration) {
            registration.removeEventListener('updatefound', handleUpdateFound);
          }
        });
      }
    };
  }, []);

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

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm mx-auto">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <FiRefreshCw className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            Nueva versión disponible
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Una nueva versión de la aplicación está lista para instalar.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-3 flex space-x-2">
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="flex-1 bg-green-600 text-white text-xs font-medium py-2 px-3 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isUpdating ? 'Actualizando...' : 'Actualizar'}
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 bg-gray-100 text-gray-700 text-xs font-medium py-2 px-3 rounded-md hover:bg-gray-200 transition-colors"
        >
          Más tarde
        </button>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
