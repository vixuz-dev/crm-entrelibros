import React from 'react';
import { FiRefreshCw, FiTrash2 } from 'react-icons/fi';

const PWACacheReset = () => {
  const clearPWACache = async () => {
    try {
      // console.log('🔄 Iniciando limpieza de cache PWA...');
      
      // Limpiar service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        // console.log('✅ Service Workers desregistrados');
      }

      // Limpiar cache del navegador
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        // console.log('✅ Cache del navegador limpiado');
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
      // console.log('✅ localStorage PWA limpiado');

      // Limpiar sessionStorage relacionado con PWA
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('pwa') || key.includes('workbox') || key.includes('sw'))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
      // console.log('✅ sessionStorage PWA limpiado');

      // console.log('✅ Cache PWA limpiado exitosamente');
      
      // Recargar la página después de limpiar
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('❌ Error limpiando cache PWA:', error);
    }
  };

  // Solo mostrar en desarrollo
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={clearPWACache}
        className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-colors duration-200 group"
        title="Limpiar cache PWA para testing"
      >
        <div className="flex items-center space-x-2">
          <FiTrash2 className="w-5 h-5 group-hover:animate-pulse" />
          <span className="text-sm font-medium hidden sm:block">Limpiar PWA Cache</span>
        </div>
      </button>
    </div>
  );
};

export default PWACacheReset;
