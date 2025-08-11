import React from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';

const ConfirmationModal = ({ 
  isOpen, 
  title, 
  description, 
  onCancel, 
  onAccept,
  cancelText = "Cancelar",
  acceptText = "Confirmar",
  type = "warning" // warning, danger, info
}) => {
  if (!isOpen) return null;

  // Configuración de colores según el tipo
  const typeConfig = {
    warning: {
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      acceptBtn: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
    },
    danger: {
      iconBg: "bg-red-100", 
      iconColor: "text-red-600",
      acceptBtn: "bg-red-600 hover:bg-red-700 focus:ring-red-500"
    },
    info: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600", 
      acceptBtn: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
    }
  };

  const config = typeConfig[type] || typeConfig.warning;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onCancel}></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Header */}
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              {/* Icon */}
              <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${config.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                <FiAlertTriangle className={`h-6 w-6 ${config.iconColor}`} />
              </div>
              
              {/* Content */}
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-base font-cabin-bold leading-6 text-gray-900" id="modal-title">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 font-cabin-medium">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            {/* Accept Button */}
            <button
              type="button"
              onClick={onAccept}
              className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-cabin-bold text-white shadow-sm transition-colors sm:ml-3 sm:w-auto ${config.acceptBtn} focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              {acceptText}
            </button>
            
            {/* Cancel Button */}
            <button
              type="button"
              onClick={onCancel}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-cabin-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors sm:mt-0 sm:w-auto"
            >
              {cancelText}
            </button>
          </div>
          
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;