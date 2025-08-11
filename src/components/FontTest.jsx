import React from 'react';

const FontTest = () => {
  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-cabin-bold mb-6 text-gray-800">Prueba de Fuentes Cabin</h2>
      
      <div className="space-y-6">
        {/* Variantes regulares */}
        <div>
          <h3 className="text-lg font-cabin-semibold mb-3 text-gray-700">Variantes Regulares:</h3>
          <div className="space-y-2">
            <p className="text-lg font-cabin-regular">Cabin Regular - font-cabin-regular</p>
            <p className="text-lg font-cabin-medium">Cabin Medium - font-cabin-medium</p>
            <p className="text-lg font-cabin-semibold">Cabin SemiBold - font-cabin-semibold</p>
            <p className="text-lg font-cabin-bold">Cabin Bold - font-cabin-bold</p>
          </div>
        </div>

        {/* Variantes cursivas */}
        <div>
          <h3 className="text-lg font-cabin-semibold mb-3 text-gray-700">Variantes Cursivas:</h3>
          <div className="space-y-2">
            <p className="text-lg font-cabin-italic">Cabin Italic - font-cabin-italic</p>
            <p className="text-lg font-cabin-medium-italic">Cabin Medium Italic - font-cabin-medium-italic</p>
            <p className="text-lg font-cabin-semibold-italic">Cabin SemiBold Italic - font-cabin-semibold-italic</p>
            <p className="text-lg font-cabin-bold-italic">Cabin Bold Italic - font-cabin-bold-italic</p>
          </div>
        </div>

        {/* Comparación con fuentes del sistema */}
        <div>
          <h3 className="text-lg font-cabin-semibold mb-3 text-gray-700">Comparación con fuentes del sistema:</h3>
          <div className="space-y-2">
            <p className="text-lg font-cabin-regular">Cabin Regular (font-cabin-regular)</p>
            <p className="text-lg font-mono">Mono (font-mono) - Para comparar</p>
          </div>
        </div>

        {/* Ejemplos de uso */}
        <div>
          <h3 className="text-lg font-cabin-semibold mb-3 text-gray-700">Ejemplos de uso:</h3>
          <div className="space-y-3">
            <div>
              <h4 className="text-base font-cabin-bold text-gray-800">Título con font-cabin-bold</h4>
              <p className="text-sm font-cabin-regular text-gray-600">Texto descriptivo con font-cabin-regular</p>
            </div>
            <div>
              <h4 className="text-base font-cabin-semibold text-gray-800">Subtítulo con font-cabin-semibold</h4>
              <p className="text-sm font-cabin-medium text-gray-600">Texto medio con font-cabin-medium</p>
            </div>
            <div>
              <h4 className="text-base font-cabin-medium text-gray-800">Encabezado con font-cabin-medium</h4>
              <p className="text-sm font-cabin-italic text-gray-600">Texto cursiva con font-cabin-italic</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <p className="text-sm font-cabin-regular text-gray-700">
          <strong>Instrucciones:</strong> Todas las variantes de Cabin deberían verse consistentes 
          pero con diferentes pesos. La fuente Mono debería verse claramente diferente.
        </p>
      </div>
    </div>
  );
};

export default FontTest; 