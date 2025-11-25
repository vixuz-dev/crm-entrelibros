import React, { useState, useEffect } from 'react';
import { FiX, FiBook, FiActivity, FiHeadphones } from 'react-icons/fi';
import SquareBookForm from './forms/SquareBookForm';
import SquareActivityForm from './forms/SquareActivityForm';
import SquareAudioForm from './forms/SquareAudioForm';
import ConfirmationModal from '../modals/ConfirmationModal';

const TimbiricheSquareModal = ({
  isOpen,
  onClose,
  onSave,
  squareNumber,
  squareData,
  defaultUnlockDay,
  defaultType
}) => {
  // Estado para el tipo seleccionado
  // Si ya hay datos guardados, usar el tipo guardado directamente
  // Si no hay datos, empezar sin tipo para que el usuario elija
  const [selectedType, setSelectedType] = useState(
    squareData?.type || null
  );

  // Estado para rastrear cambios sin guardar
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Actualizar selectedType cuando squareData cambie (cuando se abre el modal con datos existentes)
  useEffect(() => {
    if (isOpen && squareData?.type) {
      setSelectedType(squareData.type);
    } else if (isOpen && !squareData) {
      // Si se abre el modal sin datos, resetear el tipo
      setSelectedType(null);
    }
    // Resetear hasChanges cuando se abre el modal
    if (isOpen) {
      setHasChanges(false);
    }
  }, [isOpen, squareData]);

  if (!isOpen) return null;

  const handleSave = (formData) => {
    // Construir el objeto completo de la casilla según el tipo
    const squareObject = {
      squareNumber,
      unlockDay: formData.unlockDay || defaultUnlockDay,
      type: selectedType,
      bookInfo: {
        bookId: formData.bookId || null
      },
      cardContent: formData.cardContent || {}
    };

    onSave(squareObject);
    setHasChanges(false); // Resetear cambios después de guardar
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowConfirmModal(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmModal(false);
    setHasChanges(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowConfirmModal(false);
  };

  const handleFormChange = () => {
    setHasChanges(true);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  // Si no hay tipo seleccionado, mostrar selector de tipo
  if (!selectedType) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-cabin-bold text-gray-800">
                Configurar Casilla {squareNumber}
              </h2>
              <p className="text-sm text-gray-600 font-cabin-regular mt-1">
                Selecciona el tipo de casilla
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Selector de tipo */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-cabin-semibold text-gray-800 mb-2">
                Elige el tipo de casilla:
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tipo: Libro */}
              <button
                onClick={() => handleTypeSelect('book')}
                className="p-6 border-2 border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all duration-200 flex flex-col items-center space-y-3 group"
              >
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <FiBook className="w-8 h-8 text-amber-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-cabin-bold text-gray-800 mb-1">Libro</h3>
                  <p className="text-sm text-gray-600 font-cabin-regular">
                    Actividades de lectura con libro
                  </p>
                </div>
              </button>

              {/* Tipo: Actividad */}
              <button
                onClick={() => handleTypeSelect('activity')}
                className="p-6 border-2 border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all duration-200 flex flex-col items-center space-y-3 group"
              >
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <FiActivity className="w-8 h-8 text-amber-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-cabin-bold text-gray-800 mb-1">Actividad</h3>
                  <p className="text-sm text-gray-600 font-cabin-regular">
                    Actividades prácticas y manuales
                  </p>
                </div>
              </button>

              {/* Tipo: Audio */}
              <button
                onClick={() => handleTypeSelect('audio')}
                className="p-6 border-2 border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all duration-200 flex flex-col items-center space-y-3 group"
              >
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <FiHeadphones className="w-8 h-8 text-amber-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-cabin-bold text-gray-800 mb-1">Audio</h3>
                  <p className="text-sm text-gray-600 font-cabin-regular">
                    Contenido de audio educativo
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si hay tipo seleccionado, mostrar el formulario correspondiente
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-cabin-bold text-gray-800">
              Configurar Casilla {squareNumber}
            </h2>
            {selectedType && (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-cabin-semibold">
                {selectedType === 'book' ? 'Libro' : selectedType === 'activity' ? 'Actividad' : 'Audio'}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedType(null)}
              className="text-sm text-gray-600 hover:text-gray-800 font-cabin-medium transition-colors"
            >
              Cambiar tipo
            </button>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {selectedType === 'book' && (
            <SquareBookForm
              squareData={squareData}
              squareNumber={squareNumber}
              defaultUnlockDay={defaultUnlockDay}
              defaultType={selectedType}
              onSave={handleSave}
              onCancel={handleClose}
              onChange={handleFormChange}
            />
          )}
          {selectedType === 'activity' && (
            <SquareActivityForm
              squareData={squareData}
              squareNumber={squareNumber}
              defaultUnlockDay={defaultUnlockDay}
              defaultType={selectedType}
              onSave={handleSave}
              onCancel={handleClose}
              onChange={handleFormChange}
            />
          )}
          {selectedType === 'audio' && (
            <SquareAudioForm
              squareData={squareData}
              squareNumber={squareNumber}
              defaultUnlockDay={defaultUnlockDay}
              defaultType={selectedType}
              onSave={handleSave}
              onCancel={handleClose}
              onChange={handleFormChange}
            />
          )}
          {selectedType !== 'book' && selectedType !== 'activity' && selectedType !== 'audio' && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg font-cabin-medium mb-2">
                Formulario para tipo "{selectedType}" aún no implementado
              </p>
              <button
                onClick={() => setSelectedType(null)}
                className="text-amber-600 hover:text-amber-700 font-cabin-medium"
              >
                Seleccionar otro tipo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación para cambios sin guardar */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="¿Descartar cambios?"
        description="Tienes cambios sin guardar. Si cierras la casilla, perderás todo el contenido que has desarrollado. ¿Estás seguro de que quieres continuar?"
        onCancel={handleCancelClose}
        onAccept={handleConfirmClose}
        cancelText="Cancelar"
        acceptText="Sí, descartar cambios"
        type="warning"
      />
    </div>
  );
};

export default TimbiricheSquareModal;

