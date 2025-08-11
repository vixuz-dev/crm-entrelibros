import React from 'react';
import { useLocation } from 'react-router-dom';
import { getPageTitle } from '../utils/routes';

const PlaceholderPage = () => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-amber-600 text-3xl">📚</span>
        </div>
        <h1 className="text-3xl font-cabin-bold text-gray-800 mb-4">
          {pageTitle}
        </h1>
        <p className="text-gray-600 font-cabin-regular max-w-2xl mx-auto">
          Esta página está en desarrollo. La funcionalidad completa estará disponible pronto.
        </p>
        <div className="mt-6">
          <p className="text-sm text-gray-500 font-cabin-regular">
            Ruta actual: <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage; 