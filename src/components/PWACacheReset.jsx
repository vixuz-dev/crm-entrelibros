import { useState } from 'react';
import { FiRefreshCw, FiTrash2 } from 'react-icons/fi';

const PWACacheReset = () => {
  const [isClearing, setIsClearing] = useState(false);

  const clearPWACache = async () => {
    setIsClearing(true);
    
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

      console.log('✅ Cache PWA limpiado exitosamente');
      
      // Recargar la página después de limpiar
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('❌ Error limpiando cache PWA:', error);
      setIsClearing(false);
    }
  };

  // Solo mostrar en desarrollo
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={clearPWACache}
        disabled={isClearing}
        className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 transition-colors"
        title="Limpiar cache PWA para testing"
      >
        {isClearing ? (
          <>
            <FiRefreshCw className="w-4 h-4 animate-spin" />
            <span>Limpiando...</span>
          </>
        ) : (
          <>
            <FiTrash2 className="w-4 h-4" />
            <span>Limpiar PWA Cache</span>
          </>
        )}
      </button>
    </div>
  );
};

export default PWACacheReset;
