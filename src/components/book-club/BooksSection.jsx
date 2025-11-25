import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX, FiFileText, FiPlus, FiBook, FiSave, FiEdit } from 'react-icons/fi';
import { getProducts, getProductDetail } from '../../api/products';
import { useDebounce } from '../../hooks/useDebounce';
import placeholderImage from '../../assets/images/placeholder.jpg';
import CustomDropdown from '../ui/CustomDropdown';
import { showSuccess } from '../../utils/notifications';

const BooksSection = ({
  books,
  setBooks,
  isLocked = false,
  onEdit,
  onSave,
  showEditButton = true
}) => {
  // Estado local para los libros
  const [localBooks, setLocalBooks] = useState(books || [
    { order: 1, bookId: null, ownerDescription: '' },
    { order: 2, bookId: null, ownerDescription: '' },
    { order: 3, bookId: null, ownerDescription: '' },
    { order: 4, bookId: null, ownerDescription: '' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedBookDetails, setSelectedBookDetails] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [addedBooksDetails, setAddedBooksDetails] = useState({});

  // Sincronizar estado local cuando cambian los props
  useEffect(() => {
    setLocalBooks(books || [
      { order: 1, bookId: null, ownerDescription: '' },
      { order: 2, bookId: null, ownerDescription: '' },
      { order: 3, bookId: null, ownerDescription: '' },
      { order: 4, bookId: null, ownerDescription: '' }
    ]);
  }, [books]);

  // Debounce para la búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Opciones de semana/orden (1-4)
  const orderOptions = [
    { value: 1, label: 'Semana 1' },
    { value: 2, label: 'Semana 2' },
    { value: 3, label: 'Semana 3' },
    { value: 4, label: 'Semana 4' }
  ];

  // Función para buscar productos
  const searchProducts = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setAvailableBooks([]);
      return;
    }

    setIsLoadingBooks(true);

    try {
      const response = await getProducts(1, 20, searchTerm);
      if (response.status === true && response.product_list) {
        // Filtrar libros que ya están seleccionados (usar estado local)
        const selectedBookIds = localBooks.map(book => book?.bookId).filter(Boolean);
        const filtered = response.product_list.filter(
          book => !selectedBookIds.includes(book.product_id)
        );
        setAvailableBooks(filtered);
      } else {
        setAvailableBooks([]);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setAvailableBooks([]);
    } finally {
      setIsLoadingBooks(false);
    }
  };

  // Efecto para buscar productos cuando cambia el término de búsqueda
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchProducts(debouncedSearchTerm);
    } else {
      setAvailableBooks([]);
    }
  }, [debouncedSearchTerm]);

  // Cargar detalles de libros agregados (solo para libros que no tenemos detalles)
  useEffect(() => {
    const loadBookDetails = async () => {
      // Obtener el estado actual de addedBooksDetails
      setAddedBooksDetails(currentDetails => {
        // Filtrar libros que necesitan cargarse (solo los que no tienen detalles o no tienen imagen)
        // Usar estado local
        const booksToLoad = localBooks.filter(
          book => book && book.bookId && (!currentDetails[book.bookId] || !currentDetails[book.bookId].main_image_url)
        );
        
        if (booksToLoad.length === 0) {
          return currentDetails; // No hay libros que cargar
        }
        
        // Cargar detalles de cada libro de forma asíncrona
        booksToLoad.forEach(book => {
          getProductDetail(book.bookId)
            .then(response => {
              if (response.status === true && response.product && response.product.main_image_url) {
                // Verificar nuevamente antes de actualizar para evitar condiciones de carrera
                // Solo actualizar si no tenemos detalles o si los detalles actuales no tienen imagen
                setAddedBooksDetails(prev => {
                  const current = prev[book.bookId];
                  if (!current || !current.main_image_url) {
                    return {
                      ...prev,
                      [book.bookId]: response.product
                    };
                  }
                  return prev; // Ya tenemos detalles con imagen, no sobrescribir
                });
              }
            })
            .catch(error => {
              console.error('Error loading book detail:', error);
            });
        });
        
        return currentDetails; // Retornar el estado actual sin cambios inmediatos
      });
    };

    loadBookDetails();
  }, [localBooks]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.book-dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setIsDropdownOpen(true);
  };

  const handleBookSelect = async (book) => {
    // Cargar detalles del libro para mostrar portada y título
    try {
      const response = await getProductDetail(book.product_id);
      if (response.status === true && response.product) {
        setSelectedBookDetails(response.product);
      } else {
        setSelectedBookDetails(book);
      }
    } catch (error) {
      console.error('Error loading book detail:', error);
      setSelectedBookDetails(book);
    }

    setSelectedBook(book);
    setSearchTerm('');
    setIsDropdownOpen(false);
    setSelectedOrder([]);
    setSelectedDescription('');
  };

  const handleAddBook = async () => {
    if (!selectedBook || selectedOrder.length === 0 || !selectedDescription.trim()) {
      return;
    }

    const order = selectedOrder[0];
    const bookId = selectedBook.product_id;
    
    // Usar los detalles que ya tenemos de selectedBookDetails (cargados en handleBookSelect)
    // Similar a cómo Libros.jsx usa los datos básicos y luego carga los detalles
    let bookDetails = selectedBookDetails;
    
    // Si no tenemos detalles completos, intentar cargarlos (similar a Libros.jsx)
    if (!bookDetails || !bookDetails.main_image_url) {
      // Primero verificar si ya los tenemos guardados
      if (addedBooksDetails[bookId]) {
        bookDetails = addedBooksDetails[bookId];
      } else {
        // Solo cargar si realmente no los tenemos (similar a Libros.jsx)
        try {
          const response = await getProductDetail(bookId);
          if (response.status === true && response.product) {
            bookDetails = response.product;
          }
        } catch (error) {
          console.error('Error loading book detail:', error);
          // Continuar con los datos básicos si falla (similar a Libros.jsx)
          if (!bookDetails) {
            bookDetails = selectedBook; // Usar datos básicos como fallback
          }
        }
      }
    }
    
    // Guardar los detalles del libro si los tenemos
    if (bookDetails) {
      setAddedBooksDetails(prev => ({
        ...prev,
        [bookId]: bookDetails
      }));
    }

    // Agregar el libro al estado local
    setLocalBooks(prevBooks => {
      const newBooks = [...prevBooks];
      // Buscar si ya existe un libro con ese order y reemplazarlo
      const existingIndex = newBooks.findIndex(book => book.order === order);
      if (existingIndex !== -1) {
        newBooks[existingIndex] = {
          order: order,
          bookId: bookId,
          ownerDescription: selectedDescription
        };
      } else {
        // Buscar el primer slot vacío
        const emptyIndex = newBooks.findIndex(book => !book.bookId);
        if (emptyIndex !== -1) {
          newBooks[emptyIndex] = {
            order: order,
            bookId: bookId,
            ownerDescription: selectedDescription
          };
        }
      }
      return newBooks;
    });

    // Limpiar selección
    setSelectedBook(null);
    setSelectedBookDetails(null);
    setSelectedOrder([]);
    setSelectedDescription('');
  };

  const handleRemoveBook = (bookId) => {
    // Remover el libro del estado local
    setLocalBooks(prevBooks => {
      return prevBooks.map(book => {
        if (book.bookId === bookId) {
          return { order: book.order, bookId: null, ownerDescription: '' };
        }
        return book;
      });
    });
    
    // Limpiar los detalles del libro removido
    setAddedBooksDetails(prev => {
      const newDetails = { ...prev };
      delete newDetails[bookId];
      return newDetails;
    });
  };

  // Manejar guardar
  const handleSave = (e) => {
    e.preventDefault();
    
    // Validar que todos los libros tengan bookId y descripción
    const booksWithData = localBooks.filter(book => book.bookId !== null);
    
    if (booksWithData.length === 0) {
      // No hay libros agregados, pero permitimos guardar un array vacío
      setBooks(localBooks);
      return;
    }

    // Validar que todos los libros tengan descripción
    const incompleteBooks = booksWithData.filter(book => !book.ownerDescription || book.ownerDescription.trim() === '');
    if (incompleteBooks.length > 0) {
      alert('Por favor, completa la descripción de todos los libros antes de guardar.');
      return;
    }

    // Guardar en el store
    setBooks(localBooks);

    // Mostrar mensaje de éxito
    showSuccess('Libros de la Membresía guardados exitosamente');

    // Bloquear la sección después de guardar
    if (onSave) {
      onSave();
    }
  };

  // Obtener semanas ya ocupadas y calcular opciones disponibles
  const occupiedOrders = React.useMemo(() => {
    // Solo considerar libros que realmente tienen un bookId asignado (usar estado local)
    return localBooks
      .filter(book => book && book.bookId !== null)
      .map(book => book.order)
      .filter(Boolean);
  }, [localBooks]);

  const availableOrderOptions = React.useMemo(() => {
    return orderOptions.filter(option => !occupiedOrders.includes(option.value));
  }, [occupiedOrders]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-cabin-bold text-gray-800 mb-2">
            Libros de la Membresía
          </h2>
          <p className="text-gray-600 font-cabin-regular">
            Selecciona los 4 libros que formarán parte del curso (uno por semana)
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

      {/* Buscador de libros */}
      <div className="mb-6">
        <div className="relative book-dropdown-container">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular"
              placeholder="Buscar libro para agregar..."
            />
          </div>

          {/* Dropdown de libros */}
          {isDropdownOpen && !selectedBook && (
            <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {isLoadingBooks ? (
                <div className="px-4 py-3 text-gray-500 text-sm flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600 mr-2"></div>
                  Buscando libros...
                </div>
              ) : availableBooks.length > 0 ? (
                availableBooks.map((bookOption) => (
                  <div
                    key={bookOption.product_id}
                    onClick={() => handleBookSelect(bookOption)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-cabin-medium text-gray-800">{bookOption.product_name}</div>
                    <div className="text-sm text-gray-600 font-cabin-regular">
                      {bookOption.author_list && bookOption.author_list.length > 0 
                        ? bookOption.author_list.map(author => author.author_name).join(', ')
                        : 'Sin autor'
                      }
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-sm">
                  {searchTerm ? 'No se encontraron libros con esa búsqueda' : 'Escribe para buscar libros'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview del libro seleccionado */}
      {selectedBook && selectedBookDetails && (
        <div className="mb-6 p-6 bg-white rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lado izquierdo: Campos del formulario */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
                  Semana (Orden) *
                </label>
                <CustomDropdown
                  options={availableOrderOptions}
                  selectedValues={selectedOrder}
                  onChange={setSelectedOrder}
                  placeholder="Selecciona la semana"
                  multiple={false}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
                  Coloca descripción del libro *
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FiFileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    value={selectedDescription}
                    onChange={(e) => setSelectedDescription(e.target.value)}
                    placeholder="Ej: Una aventura emocionante que combina fútbol y misterio..."
                    rows={4}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular transition-colors hover:border-gray-400 resize-y"
                  />
                </div>
              </div>

              <button
                onClick={handleAddBook}
                disabled={selectedOrder.length === 0 || !selectedDescription.trim()}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-cabin-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <FiPlus className="w-5 h-5" />
                <span>Agregar libro</span>
              </button>
            </div>

            {/* Lado derecho: Preview de la tarjeta del libro */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative w-full max-w-xs bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                {/* Tag de semana (si está seleccionada) */}
                {selectedOrder.length > 0 && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-sm font-cabin-semibold shadow-md">
                      Semana {selectedOrder[0]}
                    </span>
                  </div>
                )}
                
                {/* Botón cancelar */}
                <button
                  onClick={() => {
                    setSelectedBook(null);
                    setSelectedBookDetails(null);
                    setSelectedOrder([]);
                    setSelectedDescription('');
                  }}
                  className="absolute top-3 right-3 z-10 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                  title="Cancelar selección"
                >
                  <FiX className="w-4 h-4" />
                </button>

                {/* Portada del libro */}
                <div className="w-full bg-gray-100 flex items-center justify-center p-4">
                  <img
                    src={selectedBookDetails.main_image_url || placeholderImage}
                    alt={selectedBookDetails.product_name || 'Libro'}
                    className="max-w-full max-h-[400px] w-auto h-auto object-contain rounded-lg"
                    onError={(e) => {
                      e.target.src = placeholderImage;
                    }}
                  />
                </div>

                {/* Información del libro */}
                <div className="p-4">
                  <h4 className="text-lg font-cabin-bold text-gray-800 mb-2">
                    {selectedBookDetails.product_name || 'Libro seleccionado'}
                  </h4>
                  {selectedDescription ? (
                    <p className="text-sm text-gray-600 font-cabin-regular line-clamp-3">
                      {selectedDescription}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 font-cabin-regular italic">
                      Agrega una descripción...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de libros agregados */}
      {localBooks.filter(book => book && book.bookId).length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-cabin-bold text-gray-800 mb-4">
            Libros Agregados ({localBooks.filter(book => book && book.bookId).length}/4)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {localBooks
              .filter(book => book && book.bookId)
              .sort((a, b) => a.order - b.order)
              .map((book) => {
                const bookDetail = addedBooksDetails[book.bookId];
                
                return (
                  <div key={book.bookId} className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                    {/* Tag de semana */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-sm font-cabin-semibold shadow-md">
                        Semana {book.order}
                      </span>
                    </div>

                    {/* Botón remover */}
                    <button
                      onClick={() => handleRemoveBook(book.bookId)}
                      className="absolute top-3 right-3 z-10 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                      title="Remover libro"
                    >
                      <FiX className="w-4 h-4" />
                    </button>

                    {/* Portada del libro */}
                    <div className="w-full bg-gray-100 flex items-center justify-center p-4 min-h-[250px]">
                      <img
                        src={bookDetail?.main_image_url || placeholderImage}
                        alt={bookDetail?.product_name || 'Libro'}
                        className="max-w-full max-h-[300px] w-auto h-auto object-contain rounded-lg"
                        onError={(e) => {
                          e.target.src = placeholderImage;
                        }}
                      />
                    </div>

                    {/* Información del libro */}
                    <div className="p-4">
                      <h4 className="text-base font-cabin-bold text-gray-800 mb-2 line-clamp-2">
                        {bookDetail?.product_name || `Libro ${book.order}`}
                      </h4>
                      <p className="text-sm text-gray-600 font-cabin-regular line-clamp-3">
                        {book.ownerDescription || 'Sin descripción'}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Botón de guardar - Solo mostrar si no está bloqueado */}
      {!isLocked && (
        <div className="mt-8 flex items-center justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-cabin-medium flex items-center space-x-2"
          >
            <FiSave className="w-5 h-5" />
            <span>Guardar Libros</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BooksSection;


