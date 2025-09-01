import React, { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

const PWAManager = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        setOfflineReady(true);
      },
    });
  }, []);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const updateServiceWorker = () => {
    updateSW();
    close();
  };

  return (
    <>
      {(needRefresh || offlineReady) && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {needRefresh ? 'Nueva versión disponible' : 'Aplicación lista para uso offline'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {needRefresh 
                    ? 'Hay una nueva versión disponible. ¿Deseas actualizar?' 
                    : 'La aplicación se ha descargado y está lista para uso offline.'
                  }
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                {needRefresh && (
                  <button
                    onClick={updateServiceWorker}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-700 mr-2"
                  >
                    Actualizar
                  </button>
                )}
                <button
                  onClick={close}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAManager;
