import React, { useState, useEffect } from 'react';
import { FiTag, FiFileText, FiSave, FiEdit } from 'react-icons/fi';
import CustomDropdown from '../ui/CustomDropdown';
import { showSuccess } from '../../utils/notifications';

const MainConfigurationSection = ({
  month,
  setMonth,
  theme,
  setTheme,
  description,
  setDescription,
  monthOptions,
  isLocked = false,
  onEdit,
  onSave,
  showEditButton = true
}) => {
  // Estado local para los campos del formulario
  const [localMonth, setLocalMonth] = useState(month || []);
  const [localTheme, setLocalTheme] = useState(theme || '');
  const [localDescription, setLocalDescription] = useState(description || '');
  const [errors, setErrors] = useState({});

  // Sincronizar estado local cuando cambian los props
  useEffect(() => {
    setLocalMonth(month || []);
  }, [month]);

  useEffect(() => {
    setLocalTheme(theme || '');
  }, [theme]);

  useEffect(() => {
    setLocalDescription(description || '');
  }, [description]);

  // Manejar guardar
  const handleSave = (e) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    const newErrors = {};
    if (!localMonth || localMonth.length === 0) {
      newErrors.month = 'El mes es obligatorio';
    }
    if (!localTheme || localTheme.trim() === '') {
      newErrors.theme = 'El tema es obligatorio';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Limpiar errores
    setErrors({});

    // Guardar en el store
    setMonth(localMonth);
    setTheme(localTheme);
    setDescription(localDescription);

    showSuccess('Configuración Principal guardada exitosamente');
    
    const button = document.activeElement;
    if (button && button.type === 'submit') {
      button.classList.add('animate-pulse');
      setTimeout(() => button.classList.remove('animate-pulse'), 1000);
    }

    // Bloquear la sección después de guardar
    if (onSave) {
      onSave();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-cabin-bold text-gray-900 mb-2">
            Configuración Principal de la Membresía
          </h2>
          <p className="text-gray-700 font-cabin-regular">
            Configura los datos principales de la membresía del Book Club Lectores
          </p>
        </div>
        {isLocked && showEditButton && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Editar configuración principal"
            className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all duration-200 font-cabin-medium transform hover:scale-105 active:scale-95"
          >
            <FiEdit className="w-4 h-4" />
            <span>Editar</span>
          </button>
        )}
      </div>

      {/* Formulario */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Campos Mes y Tema en la misma línea */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campo Mes */}
          <div>
            <label htmlFor="month" className="block text-sm font-cabin-semibold text-gray-700 mb-2">
              Mes de la membresía *
            </label>
            <CustomDropdown
              options={monthOptions}
              selectedValues={localMonth}
              onChange={(selected) => {
                if (!isLocked) {
                  setLocalMonth(selected);
                  if (errors.month) {
                    setErrors(prev => ({ ...prev, month: null }));
                  }
                }
              }}
              placeholder="Selecciona el mes"
              multiple={false}
              className="w-full"
              disabled={isLocked}
            />
            {errors.month && (
              <p className="text-red-500 text-xs font-cabin-regular mt-1">{errors.month}</p>
            )}
          </div>

          {/* Campo Tema */}
          <div>
            <label htmlFor="theme" className="block text-sm font-cabin-semibold text-gray-700 mb-2">
              Tema *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiTag className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="theme"
                type="text"
                value={localTheme}
                onChange={(e) => {
                  if (!isLocked) {
                    setLocalTheme(e.target.value);
                    if (errors.theme) {
                      setErrors(prev => ({ ...prev, theme: null }));
                    }
                  }
                }}
                placeholder="Ej: Monstruosamente divertido"
                disabled={isLocked}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular transition-colors hover:border-gray-400 ${
                  errors.theme ? 'border-red-500' : 'border-gray-300'
                } ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
            </div>
            {errors.theme && (
              <p className="text-red-500 text-xs font-cabin-regular mt-1">{errors.theme}</p>
            )}
          </div>
        </div>

        {/* Campo Descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-cabin-semibold text-gray-700 mb-2">
            Ingresa una descripción personalizada del curso (opcional)
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <FiFileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="description"
              value={localDescription}
              onChange={(e) => {
                if (!isLocked) {
                  setLocalDescription(e.target.value);
                }
              }}
              placeholder="Este mes Octubre de 2025 será... monstruosamente divertido!"
              rows={4}
              disabled={isLocked}
              className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular transition-colors hover:border-gray-400 resize-y ${
                isLocked ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>
        </div>

        {/* Botón de guardar - Solo mostrar si no está bloqueado */}
        {!isLocked && (
          <div className="flex items-center justify-start pt-4 border-t border-gray-200">
            <button
              type="submit"
              aria-label="Guardar sección"
              className="px-6 py-3 bg-amber-500 text-white rounded-lg transition-all duration-200 font-cabin-medium flex items-center space-x-2 transform hover:bg-amber-600 hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <FiSave className="w-5 h-5" />
              <span>Guardar sección</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default MainConfigurationSection;

