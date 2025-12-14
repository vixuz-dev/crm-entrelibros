import React, { useState } from 'react';
import { FiCalendar, FiTag, FiFileText, FiSave, FiEdit } from 'react-icons/fi';
import CustomDropdown from '../ui/CustomDropdown';
import { MONTH_OPTIONS } from '../../constants/bookClub';
import { showSuccess } from '../../utils/notifications';

const NextReleasesSection = ({
  month,
  setMonth,
  theme,
  setTheme,
  description,
  setDescription,
  isLocked = false,
  onEdit,
  onSave,
  showEditButton = true
}) => {
  const [localMonth, setLocalMonth] = useState(month || '');
  const [localTheme, setLocalTheme] = useState(theme || '');
  const [localDescription, setLocalDescription] = useState(description || '');
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setLocalMonth(month || '');
  }, [month]);

  React.useEffect(() => {
    setLocalTheme(theme || '');
  }, [theme]);

  React.useEffect(() => {
    setLocalDescription(description || '');
  }, [description]);

  const handleSave = (e) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    const newErrors = {};
    if (!localMonth || localMonth.trim() === '') {
      newErrors.month = 'El mes es obligatorio';
    }
    if (!localTheme || localTheme.trim() === '') {
      newErrors.theme = 'El tema es obligatorio';
    }
    if (!localDescription || localDescription.trim() === '') {
      newErrors.description = 'La descripción es obligatoria';
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

    // Mostrar mensaje de éxito
    showSuccess('Próximos Lanzamientos guardados exitosamente');

    // Bloquear la sección después de guardar
    if (onSave) {
      onSave();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-cabin-bold text-gray-800 mb-2">
            Próximos Lanzamientos
          </h2>
          <p className="text-gray-600 font-cabin-regular">
            Configura la información sobre los próximos lanzamientos del Book Club Lectores
          </p>
        </div>
        {isLocked && showEditButton && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-cabin-medium"
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
            <label htmlFor="nextReleasesMonth" className="block text-sm font-cabin-semibold text-gray-700 mb-2">
              Mes *
            </label>
            <CustomDropdown
              options={MONTH_OPTIONS}
              selectedValues={localMonth ? [localMonth] : []}
              onChange={(selected) => {
                if (!isLocked) {
                  setLocalMonth(selected && selected.length > 0 ? selected[0] : '');
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
            <label htmlFor="nextReleasesTheme" className="block text-sm font-cabin-semibold text-gray-700 mb-2">
              Tema *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiTag className="text-gray-400" />
              </div>
              <input
                type="text"
                id="nextReleasesTheme"
                value={localTheme}
                onChange={(e) => {
                  if (!isLocked) {
                    setLocalTheme(e.target.value);
                    if (errors.theme) {
                      setErrors(prev => ({ ...prev, theme: null }));
                    }
                  }
                }}
                disabled={isLocked}
                className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular ${
                  errors.theme ? 'border-red-500' : ''
                } ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="Ej: Celebro la vida"
              />
            </div>
            {errors.theme && (
              <p className="text-red-500 text-xs font-cabin-regular mt-1">{errors.theme}</p>
            )}
          </div>
        </div>

        {/* Campo Descripción */}
        <div>
          <label htmlFor="nextReleasesDescription" className="block text-sm font-cabin-semibold text-gray-700 mb-2">
            Descripción *
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <FiFileText className="text-gray-400" />
            </div>
            <textarea
              id="nextReleasesDescription"
              value={localDescription}
              onChange={(e) => {
                if (!isLocked) {
                  setLocalDescription(e.target.value);
                  if (errors.description) {
                    setErrors(prev => ({ ...prev, description: null }));
                  }
                }
              }}
              disabled={isLocked}
              rows={4}
              className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular resize-y ${
                errors.description ? 'border-red-500' : ''
              } ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Ej: Exploraremos libros sobre la pérdida y sobre disfrutar el día a día."
            />
          </div>
          {errors.description && (
            <p className="text-red-500 text-xs font-cabin-regular mt-1">{errors.description}</p>
          )}
        </div>

        {/* Botón de guardar - Solo mostrar si no está bloqueado */}
        {!isLocked && (
          <div className="flex items-center justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-cabin-medium flex items-center space-x-2"
            >
              <FiSave className="w-5 h-5" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default NextReleasesSection;
