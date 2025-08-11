import React, { useState, useEffect } from 'react';
import { FiX, FiCreditCard, FiEdit, FiSave, FiPlus, FiBook, FiDollarSign, FiCalendar, FiCheck } from 'react-icons/fi';
import CustomDropdown from '../ui/CustomDropdown';

const MembershipInformation = ({ membership, isOpen, onClose, mode = 'view', onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    benefits: [''],
    price: 0,
    selectedBooks: [],
    recurrence: 'Mensual',
    status: 'Activo'
  });
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Datos simulados de libros disponibles
  const availableBooks = [
    { id: 1, title: 'El Principito', author: 'Antoine de Saint-Exupéry', category: 'Ficción' },
    { id: 2, title: 'Don Quijote', author: 'Miguel de Cervantes', category: 'Clásico' },
    { id: 3, title: 'Cien años de soledad', author: 'Gabriel García Márquez', category: 'Realismo mágico' },
    { id: 4, title: 'Harry Potter y la piedra filosofal', author: 'J.K. Rowling', category: 'Fantasía' },
    { id: 5, title: 'El Señor de los Anillos', author: 'J.R.R. Tolkien', category: 'Fantasía' },
    { id: 6, title: '1984', author: 'George Orwell', category: 'Ciencia ficción' },
    { id: 7, title: 'Orgullo y prejuicio', author: 'Jane Austen', category: 'Romance' },
    { id: 8, title: 'Los miserables', author: 'Victor Hugo', category: 'Drama' },
    { id: 9, title: 'Crimen y castigo', author: 'Fiódor Dostoyevski', category: 'Drama' },
    { id: 10, title: 'El hobbit', author: 'J.R.R. Tolkien', category: 'Fantasía' }
  ];

  useEffect(() => {
    if (membership) {
      setFormData({
        title: membership.title || '',
        description: membership.description || '',
        benefits: membership.benefits || [''],
        price: membership.price || 0,
        selectedBooks: membership.selectedBooks || [],
        recurrence: membership.recurrence || 'Mensual',
        status: membership.status || 'Activo'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        benefits: [''],
        price: 0,
        selectedBooks: [],
        recurrence: 'Mensual',
        status: 'Activo'
      });
    }
    setIsEditing(mode === 'create' || mode === 'edit');
  }, [membership, mode]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isBookDropdownOpen && !event.target.closest('.book-dropdown-container')) {
        setIsBookDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBookDropdownOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBookSearch = (searchTerm) => {
    setBookSearchTerm(searchTerm);
    setIsBookDropdownOpen(true);
  };

  const handleBookSelect = (book) => {
    const isAlreadySelected = formData.selectedBooks.some(selectedBook => selectedBook.id === book.id);
    if (!isAlreadySelected) {
      setFormData(prev => ({
        ...prev,
        selectedBooks: [...prev.selectedBooks, book]
      }));
      // Mostrar feedback visual temporal
      const input = document.querySelector('input[placeholder="Buscar libros..."]');
      if (input) {
        input.style.borderColor = '#10b981'; // Verde temporal
        setTimeout(() => {
          input.style.borderColor = '';
        }, 500);
      }
    }
    setBookSearchTerm('');
    setIsBookDropdownOpen(false);
  };

  const handleBookRemove = (bookId) => {
    setFormData(prev => ({
      ...prev,
      selectedBooks: prev.selectedBooks.filter(book => book.id !== bookId)
    }));
  };

  const filteredBooks = availableBooks.filter(book => 
    book.title.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
    book.category.toLowerCase().includes(bookSearchTerm.toLowerCase())
  ).filter(book => 
    !formData.selectedBooks.some(selectedBook => selectedBook.id === book.id)
  );

  const handleBenefitChange = (index, value) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData(prev => ({
      ...prev,
      benefits: newBenefits
    }));
  };

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  const removeBenefit = (index) => {
    if (formData.benefits.length > 1) {
      const newBenefits = formData.benefits.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        benefits: newBenefits
      }));
    }
  };

  const handleSave = () => {
    if (onSave) {
      // Filtrar beneficios vacíos
      const cleanBenefits = formData.benefits.filter(benefit => benefit.trim() !== '');
      onSave({
        ...formData,
        benefits: cleanBenefits
      });
    }
    onClose();
  };

  const handleCancel = () => {
    if (mode === 'create') {
      onClose();
    } else {
      setIsEditing(false);
      // Restaurar datos originales
      if (membership) {
        setFormData({
          title: membership.title || '',
          description: membership.description || '',
          benefits: membership.benefits || [''],
          price: membership.price || 0,
          selectedBooks: membership.selectedBooks || [],
          recurrence: membership.recurrence || 'Mensual',
          status: membership.status || 'Activo'
        });
      }
    }
  };

  const getModalTitle = () => {
    if (mode === 'create') return 'Crear Nueva Membresía';
    if (isEditing) return 'Editar Membresía';
    return 'Información de la Membresía';
  };

  const getModalSubtitle = () => {
    if (mode === 'create') return 'Agregar una nueva membresía al sistema';
    if (isEditing) return `Editando membresía "${membership?.title || 'membresía'}"`;
    return `Detalles de la membresía "${membership?.title || 'membresía'}"`;
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4 relative z-[10000]">
        <div className="bg-white rounded-t-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                {mode === 'create' ? (
                  <FiPlus className="w-6 h-6 text-amber-600" />
                ) : (
                  <FiCreditCard className="w-6 h-6 text-amber-600" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-cabin-bold text-gray-800">
                  {getModalTitle()}
                </h2>
                <p className="text-gray-600 font-cabin-regular">
                  {getModalSubtitle()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing && mode !== 'create' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <FiEdit className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4 flex items-center">
                <FiCreditCard className="w-5 h-5 mr-2 text-amber-600" />
                Información Básica
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Título</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                      placeholder="Ingrese el título de la membresía"
                    />
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiCreditCard className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.title}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Precio</label>
                  {isEditing ? (
                    <div className="relative mt-1">
                      <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                        placeholder="0.00"
                      />
                    </div>
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiDollarSign className="w-4 h-4 mr-2 text-gray-500" />
                      {formatPrice(formData.price)}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-cabin-medium text-gray-600">Libros Incluidos</label>
                    <div className="flex items-center space-x-2">
                      {isEditing && formData.selectedBooks.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, selectedBooks: [] }))}
                          className="text-xs text-red-600 hover:text-red-800 font-cabin-medium"
                        >
                          Limpiar todos
                        </button>
                      )}
                      {isEditing && (
                        <span className="text-xs text-amber-600 font-cabin-medium bg-amber-100 px-2 py-1 rounded-full">
                          {formData.selectedBooks.length} seleccionado{formData.selectedBooks.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Libros seleccionados - SIEMPRE VISIBLE */}
                  <div className="mb-3">
                    {formData.selectedBooks.length > 0 ? (
                      <div className="max-h-32 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2 bg-gray-50">
                        {formData.selectedBooks.map((book) => (
                          <div key={book.id} className="flex items-center justify-between bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <FiBook className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="font-cabin-medium text-gray-800 text-sm truncate">{book.title}</div>
                                <div className="text-xs text-gray-600 font-cabin-regular truncate">
                                  {book.author} • {book.category}
                                </div>
                              </div>
                            </div>
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => handleBookRemove(book.id)}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors flex-shrink-0 ml-2"
                              >
                                <FiX className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 font-cabin-regular text-sm border border-gray-200 rounded-lg bg-gray-50">
                        No hay libros seleccionados
                      </div>
                    )}
                  </div>

                  {/* Campo de búsqueda - SOLO EN MODO EDICIÓN */}
                  {isEditing && (
                    <div className="relative book-dropdown-container">
                      <FiBook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={bookSearchTerm}
                        onChange={(e) => handleBookSearch(e.target.value)}
                        onFocus={() => setIsBookDropdownOpen(true)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                        placeholder="Buscar libros..."
                      />
                      
                      {/* Dropdown de libros */}
                      {isBookDropdownOpen && (
                        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredBooks.length > 0 ? (
                            filteredBooks.map((book) => (
                              <div
                                key={book.id}
                                onClick={() => handleBookSelect(book)}
                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-cabin-medium text-gray-800">{book.title}</div>
                                <div className="text-sm text-gray-600 font-cabin-regular">
                                  {book.author} • {book.category}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-gray-500 text-sm">
                              {bookSearchTerm ? 'No se encontraron libros con esa búsqueda' : 'Escribe para buscar libros'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-cabin-medium text-gray-600">Recurrencia</label>
                  {isEditing ? (
                    <div className="mt-1">
                      <CustomDropdown
                        options={[
                          { value: 'Semanal', label: 'Semanal' },
                          { value: 'Mensual', label: 'Mensual' },
                          { value: 'Anual', label: 'Anual' }
                        ]}
                        selectedValues={[formData.recurrence]}
                        onChange={(values) => handleInputChange('recurrence', values[0])}
                        placeholder="Seleccionar recurrencia"
                        className="w-full relative z-50"
                      />
                    </div>
                  ) : (
                    <p className="font-cabin-semibold text-gray-800 flex items-center">
                      <FiCalendar className="w-4 h-4 mr-2 text-gray-500" />
                      {formData.recurrence}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4">
                Descripción
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {isEditing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular resize-none"
                    placeholder="Ingrese la descripción de la membresía"
                  />
                ) : (
                  <p className="font-cabin-regular text-gray-700">
                    {formData.description}
                  </p>
                )}
              </div>
            </div>

            {/* Beneficios */}
            <div>
              <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4 flex items-center">
                <FiCheck className="w-5 h-5 mr-2 text-amber-600" />
                Beneficios
              </h3>
              <div className="space-y-3">
                {isEditing ? (
                  <>
                    {formData.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => handleBenefitChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-cabin-regular"
                          placeholder={`Beneficio ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeBenefit(index)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addBenefit}
                      className="px-4 py-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors font-cabin-medium"
                    >
                      + Agregar Beneficio
                    </button>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {formData.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <FiCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="font-cabin-regular text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Estado */}
            <div>
              <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4">
                Estado
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {isEditing ? (
                  <CustomDropdown
                    options={[
                      { value: 'Activo', label: 'Activo' },
                      { value: 'Inactivo', label: 'Inactivo' }
                    ]}
                    selectedValues={[formData.status]}
                    onChange={(values) => handleInputChange('status', values[0])}
                    placeholder="Seleccionar estado"
                    className="w-full relative z-50"
                  />
                ) : (
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-cabin-medium border ${
                    formData.status === 'Activo' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {formData.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-white rounded-b-xl">
            <button
              onClick={handleCancel}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-cabin-medium transition-colors"
            >
              {isEditing ? 'Cancelar' : 'Cerrar'}
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-cabin-medium transition-colors flex items-center space-x-2"
              >
                <FiSave className="w-4 h-4" />
                <span>{mode === 'create' ? 'Crear' : 'Guardar'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipInformation; 