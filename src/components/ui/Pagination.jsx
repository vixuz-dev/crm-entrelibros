import React from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import CustomDropdown from './CustomDropdown';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage,
  showItemsPerPage = true,
  itemsPerPageOptions = [5, 8, 16, 24, 32],
  onItemsPerPageChange
}) => {
  // Calcular información de paginación
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  // Opciones para el dropdown de elementos por página
  const itemsPerPageDropdownOptions = itemsPerPageOptions.map(option => ({
    value: option,
    label: option.toString()
  }));
  
  // Generar array de páginas a mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si hay pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas alrededor de la página actual
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      // Ajustar si estamos cerca del final
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return null; // No mostrar paginación si solo hay una página
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white rounded-lg shadow-sm border p-4">
      {/* Información de elementos mostrados - Arriba en móviles, izquierda en desktop */}
      <div className="text-sm text-gray-600 font-cabin-regular text-center lg:text-left">
        Mostrando {startItem} a {endItem} de {totalItems} elementos
      </div>

      {/* Controles de paginación - Medio en móviles, centro en desktop */}
      <div className="flex flex-col items-center lg:flex-row lg:items-center gap-4 lg:gap-6">
        {/* Botones de navegación */}
        <div className="flex items-center justify-center gap-1">
          {/* Primera página */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Primera página"
          >
            <FiChevronsLeft className="w-4 h-4" />
          </button>

          {/* Página anterior */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Página anterior"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>

          {/* Números de página */}
          {pageNumbers.map(pageNum => {
            // Mostrar "..." si hay gap
            if (pageNum === pageNumbers[0] && pageNum > 1) {
              return (
                <React.Fragment key={`ellipsis-start`}>
                  <button
                    onClick={() => onPageChange(1)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors font-cabin-medium"
                  >
                    1
                  </button>
                  {pageNum > 2 && (
                    <span className="px-2 py-2 text-gray-400">...</span>
                  )}
                </React.Fragment>
              );
            }

            if (pageNum === pageNumbers[pageNumbers.length - 1] && pageNum < totalPages) {
              return (
                <React.Fragment key={`ellipsis-end`}>
                  {pageNum < totalPages - 1 && (
                    <span className="px-2 py-2 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(totalPages)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors font-cabin-medium"
                  >
                    {totalPages}
                  </button>
                </React.Fragment>
              );
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-2 text-sm rounded-md transition-colors font-cabin-medium ${
                  currentPage === pageNum
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Página siguiente */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Página siguiente"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>

          {/* Última página */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Última página"
          >
            <FiChevronsRight className="w-4 h-4" />
          </button>
        </div>

        {/* Selector de elementos por página para desktop - Oculto en móviles */}
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-sm text-gray-600 font-cabin-regular">
              Mostrar:
            </span>
            <CustomDropdown
              options={itemsPerPageDropdownOptions}
              selectedValues={[itemsPerPage]}
              onChange={(values) => onItemsPerPageChange(Number(values[0]))}
              placeholder="Seleccionar"
              multiple={false}
              searchable={false}
              className="min-w-[80px]"
            />
          </div>
        )}
      </div>

      {/* Selector de elementos por página - Abajo en móviles, junto a paginación en desktop */}
      {showItemsPerPage && onItemsPerPageChange && (
        <div className="flex items-center justify-center gap-2 lg:hidden">
          <span className="text-sm text-gray-600 font-cabin-regular">
            Mostrar:
          </span>
          <CustomDropdown
            options={itemsPerPageDropdownOptions}
            selectedValues={[itemsPerPage]}
            onChange={(values) => onItemsPerPageChange(Number(values[0]))}
            placeholder="Seleccionar"
            multiple={false}
            searchable={false}
            className="min-w-[80px]"
          />
        </div>
      )}


    </div>
  );
};

export default Pagination;
