import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck, FiX } from 'react-icons/fi';

const CustomDropdown = ({ 
  options = [], 
  selectedValues = [], 
  onChange, 
  placeholder = "Seleccionar...",
  multiple = false,
  searchable = false,
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Filtrar opciones basado en el término de búsqueda
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar selección de opciones
  const handleOptionClick = (option) => {
    if (multiple) {
      const isSelected = selectedValues.includes(option.value);
      const newValues = isSelected
        ? selectedValues.filter(val => val !== option.value)
        : [...selectedValues, option.value];
      onChange(newValues);
    } else {
      onChange([option.value]);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Remover opción seleccionada
  const removeOption = (value, e) => {
    e.stopPropagation();
    const newValues = selectedValues.filter(val => val !== value);
    onChange(newValues);
  };

  // Obtener opciones seleccionadas
  const getSelectedOptions = () => {
    return options.filter(option => selectedValues.includes(option.value));
  };

  // Texto del placeholder dinámico
  const getDisplayText = () => {
    const selected = getSelectedOptions();
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) return selected[0].label;
    return `${selected.length} seleccionados`;
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
          ${isOpen ? 'ring-2 ring-amber-500 border-amber-500' : ''}
        `}
      >
        <div className="flex items-center flex-1 min-w-0">
          {multiple && selectedValues.length > 0 ? (
            <div className="flex flex-wrap gap-1 flex-1">
              {getSelectedOptions().map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"
                >
                  {option.label}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => removeOption(option.value, e)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        removeOption(option.value, e);
                      }
                    }}
                    className="ml-1 hover:text-amber-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 rounded"
                  >
                    <FiX className="w-3 h-3" />
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <span className={`truncate ${selectedValues.length === 0 ? 'text-gray-500' : 'text-gray-800'}`}>
              {getDisplayText()}
            </span>
          )}
        </div>
        <FiChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors
                      ${isSelected ? 'bg-amber-50 text-amber-800' : 'text-gray-800'}
                    `}
                  >
                    <span className="font-cabin-medium">{option.label}</span>
                    {isSelected && <FiCheck className="w-4 h-4 text-amber-600" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-gray-500 text-sm">
                {searchTerm ? 'No se encontraron resultados' : 'No hay opciones disponibles'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;