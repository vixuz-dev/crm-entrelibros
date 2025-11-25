import React, { useState, useEffect, useRef } from 'react';
import { FiSave, FiX, FiPlus, FiTrash2, FiEye, FiSearch } from 'react-icons/fi';
import { getProducts, getProductDetail } from '../../../api/products';
import { useDebounce } from '../../../hooks/useDebounce';
import { useBookClubStore } from '../../../store/useBookClubStore';
import { saveBookClubFile } from '../../../api/bookClubApi';
import CustomDropdown from '../../ui/CustomDropdown';
import FileUpload from '../../ui/FileUpload';
import placeholderImage from '../../../assets/images/placeholder.jpg';
import AudioModalPreview from '../../book-club-previews/AudioModalPreview';

const SquareAudioForm = ({ squareData, squareNumber, defaultUnlockDay, defaultType, onSave, onCancel, onChange }) => {
  // Obtener libros del store
  const { books } = useBookClubStore();
  
  // Estado inicial basado en squareData existente
  const [unlockDay, setUnlockDay] = useState(squareData?.unlockDay || defaultUnlockDay || 1);
  const type = defaultType || 'audio';
  const [bookId, setBookId] = useState(squareData?.bookInfo?.bookId || null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableBooks, setAvailableBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [addedBooksDetails, setAddedBooksDetails] = useState({});
  const [isSaving, setIsSaving] = useState(false); // Estado para el loader al guardar

  // CardContent para tipo audio
  const [title, setTitle] = useState(squareData?.cardContent?.title || '');
  const [intro, setIntro] = useState(squareData?.cardContent?.intro || '');
  const [audios, setAudios] = useState(
    squareData?.cardContent?.audios || []
  );

  // Estado para el preview
  const [showPreview, setShowPreview] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Buscar libros
  useEffect(() => {
    const searchProducts = async () => {
      if (!debouncedSearchTerm.trim()) {
        setAvailableBooks([]);
        return;
      }

      setIsLoadingBooks(true);
      try {
        const response = await getProducts(1, 20, debouncedSearchTerm);
        if (response.status === true && response.product_list) {
          setAvailableBooks(response.product_list);
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

    searchProducts();
  }, [debouncedSearchTerm]);

  // Cargar detalles de los libros agregados en la sección de Books
  useEffect(() => {
    const loadAddedBooksDetails = async () => {
      const booksToLoad = books.filter(
        book => book && book.bookId && (!addedBooksDetails[book.bookId])
      );

      if (booksToLoad.length === 0) return;

      booksToLoad.forEach(book => {
        getProductDetail(book.bookId)
          .then(response => {
            if (response.status === true && response.product) {
              setAddedBooksDetails(prev => ({
                ...prev,
                [book.bookId]: response.product
              }));
            }
          })
          .catch(error => {
            console.error('Error loading book detail:', error);
          });
      });
    };

    loadAddedBooksDetails();
  }, [books]);

  // Cargar detalles del libro seleccionado cuando hay bookId pero no selectedBook
  useEffect(() => {
    const loadBookDetails = async () => {
      if (bookId && !selectedBook) {
        if (addedBooksDetails[bookId]) {
          setSelectedBook(addedBooksDetails[bookId]);
          return;
        }

        try {
          const response = await getProductDetail(bookId);
          if (response.status === true && response.product) {
            setSelectedBook(response.product);
          }
        } catch (error) {
          console.error('Error loading book detail:', error);
          setBookId(null);
        }
      }
    };

    loadBookDetails();
  }, [bookId, selectedBook, addedBooksDetails]);

  const handleBookSelect = async (book) => {
    if (addedBooksDetails[book.bookId || book.product_id]) {
      setSelectedBook(addedBooksDetails[book.bookId || book.product_id]);
      setBookId(book.bookId || book.product_id);
    } else {
      try {
        const response = await getProductDetail(book.product_id);
        if (response.status === true && response.product) {
          setSelectedBook(response.product);
        } else {
          setSelectedBook(book);
        }
      } catch (error) {
        console.error('Error loading book detail:', error);
        setSelectedBook(book);
      }
      setBookId(book.product_id);
    }
    
    setSearchTerm('');
    setAvailableBooks([]);
    setShowSearch(false);
  };

  const handleRemoveBook = () => {
    setSelectedBook(null);
    setBookId(null);
    setSearchTerm('');
    setAvailableBooks([]);
  };

  const handleAddAudio = () => {
    setAudios(prev => [...prev, {
      title: '',
      subTitle: '',
      url: ''
    }]);
  };

  const handleRemoveAudio = (index) => {
    setAudios(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateAudio = (index, field, value) => {
    setAudios(prev =>
      prev.map((audio, i) =>
        i === index ? { ...audio, [field]: value } : audio
      )
    );
  };

  // Guardar archivo de audio localmente (sin subir a S3 todavía)
  const handleAudioFileSelect = (index, file, base64) => {
    // Guardar el archivo y base64 en el estado para subirlo después
    handleUpdateAudio(index, 'url', base64);
    handleUpdateAudio(index, '_pendingFile', { file, base64 });
  };

  // Detectar cambios y notificar al componente padre (evitar en el primer render)
  const isFirstRender = useRef(true);
  
  // Resetear isFirstRender cuando cambia squareData (modal se abre con datos diferentes)
  useEffect(() => {
    isFirstRender.current = true;
  }, [squareData]);
  
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (onChange) {
      onChange();
    }
  }, [unlockDay, bookId, title, intro, audios, onChange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Subir archivos de audio pendientes antes de guardar
      const updatedAudios = await Promise.all(
      audios.map(async (audio) => {
        // Si hay un archivo pendiente, subirlo
        if (audio._pendingFile) {
          try {
            const { file, base64 } = audio._pendingFile;
            const fileExtension = file.name.split('.').pop().toLowerCase();
            // Para audio, pasar el objeto File original
            const response = await saveBookClubFile(fileExtension, base64, file);
            
            if (response.status === true && response.file_url) {
              return {
                ...audio,
                url: response.file_url,
                _pendingFile: undefined
              };
            } else {
              console.error('Error: No se recibió URL del servidor', response);
              return {
                ...audio,
                url: base64, // Fallback a base64
                _pendingFile: undefined
              };
            }
          } catch (error) {
            console.error('Error al subir archivo:', error);
            return {
              ...audio,
              url: audio._pendingFile.base64, // Fallback a base64
              _pendingFile: undefined
            };
          }
        }
        return audio;
      })
    );

    // Limpiar audios para remover _pendingFile antes de guardar
    const cleanedAudios = updatedAudios.map(({ _pendingFile, ...audio }) => audio);

    const cardContent = {
      title,
      intro,
      audios: cleanedAudios
    };

      onSave({
        unlockDay,
        bookId,
        cardContent
      });
    } catch (error) {
      console.error('Error al guardar la casilla:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Construir el objeto squareData para el preview
  const getPreviewData = () => {
    const previewData = {
      squareNumber: squareNumber || 3,
      unlockDay,
      type: 'audio',
      bookInfo: {
        bookId: bookId
      },
      cardContent: {
        title,
        intro,
        audios
      }
    };

    // Si tenemos el libro seleccionado, agregarlo para que el preview lo use inmediatamente
    if (selectedBook) {
      previewData.selectedBook = selectedBook;
    }

    return previewData;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Configuración básica de la casilla */}
      <div className="pb-6 border-b border-gray-200">
        <div className="space-y-6">
          {/* Día de desbloqueo */}
          <div>
            <label className="block text-sm font-cabin-semibold text-gray-700 mb-3">
              Día de desbloqueo *
            </label>
            <div className="flex items-center space-x-6">
              {[1, 7, 14, 21].map((day) => (
                <label
                  key={day}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    name="unlockDay"
                    value={day}
                    checked={unlockDay === day}
                    onChange={(e) => setUnlockDay(parseInt(e.target.value))}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500 focus:ring-2 border-gray-300"
                  />
                  <span className="ml-2 text-sm font-cabin-medium text-gray-700">
                    {day}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 font-cabin-regular mt-2">
              Día del mes en que se desbloquea esta casilla
            </p>
          </div>

          {/* Selección de libro */}
          <div className="relative">
            <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
              Libro asociado *
            </label>
            
            {/* Obtener libros agregados con sus detalles */}
            {(() => {
              const addedBooks = books
                .filter(book => book && book.bookId && addedBooksDetails[book.bookId])
                .map(book => ({
                  bookId: book.bookId,
                  name: addedBooksDetails[book.bookId]?.product_name || `Libro ${book.order}`,
                  order: book.order
                }));

              if (addedBooks.length > 0) {
                return (
                  <CustomDropdown
                    options={addedBooks.map(book => ({
                      value: book.bookId,
                      label: `${book.name} (Semana ${book.order})`
                    }))}
                    selectedValues={bookId ? [bookId] : []}
                    onChange={(selected) => {
                      if (selected && selected.length > 0) {
                        const selectedId = selected[0];
                        handleBookSelect({ bookId: selectedId });
                      } else {
                        handleRemoveBook();
                      }
                    }}
                    placeholder="Selecciona un libro agregado"
                    multiple={false}
                    className="w-full"
                  />
                );
              } else {
                return (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700 font-cabin-regular">
                      No hay libros agregados. Por favor, agrega libros en la sección "Libros de la Membresía" primero.
                    </p>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      </div>

      {/* Sección: Información General */}
      <div className="pt-6">
        <h2 className="text-xl font-cabin-bold text-gray-800 mb-2">Información General</h2>
        <p className="text-sm text-gray-600 font-cabin-regular mb-6">
          Configura la información general de los audios.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular"
              placeholder="Título de la sección de audios"
            />
          </div>
          <div>
            <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              rows={3}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular resize-y"
              placeholder="Descripción de los audios complementarios"
            />
          </div>
        </div>
      </div>

      {/* Sección: Audios */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-cabin-semibold text-gray-800">Audios</h3>
            <p className="text-sm text-gray-600 font-cabin-regular mt-1">
              Agrega los audios complementarios para esta casilla
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddAudio}
            className="flex items-center space-x-2 px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-cabin-medium text-sm"
          >
            <FiPlus className="w-4 h-4" />
            <span>Agregar audio</span>
          </button>
        </div>

        <div className="space-y-4">
          {audios.length > 0 ? (
            audios.map((audio, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-cabin-semibold text-gray-800">
                    Audio {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveAudio(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
                      Título del audio *
                    </label>
                    <input
                      type="text"
                      value={audio.title || ''}
                      onChange={(e) => handleUpdateAudio(index, 'title', e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular"
                      placeholder="Ej: El poder de la relectura"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
                      Descripción del audio
                    </label>
                    <textarea
                      value={audio.subTitle || ''}
                      onChange={(e) => handleUpdateAudio(index, 'subTitle', e.target.value)}
                      rows={2}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular resize-y"
                      placeholder="Ej: Porqué tu hijo debería leer, el mismo libro, más de una vez."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
                      Archivo de audio / URL *
                    </label>
                    <FileUpload
                      value={audio.url || ''}
                      onChange={(url) => handleUpdateAudio(index, 'url', url)}
                      onFileSelect={(file, base64) => handleAudioFileSelect(index, file, base64)}
                      accept="audio/*"
                      allowedExtensions={['mp3', 'mp4', 'wav']}
                      maxSize={100 * 1024 * 1024} // 100MB
                      fileTypeLabel="audio"
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 border-dashed text-center text-gray-500 text-sm">
              No hay audios agregados. Haz clic en "Agregar audio" para comenzar.
            </div>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-cabin-medium text-gray-700"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          disabled={audios.length === 0}
          className="px-6 py-3 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors font-cabin-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiEye className="w-5 h-5" />
          <span>Vista previa</span>
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className={`px-6 py-3 bg-amber-500 text-white rounded-lg transition-colors font-cabin-medium flex items-center space-x-2 ${
            isSaving 
              ? 'opacity-75 cursor-not-allowed' 
              : 'hover:bg-amber-600'
          }`}
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <FiSave className="w-5 h-5" />
              <span>Guardar Casilla</span>
            </>
          )}
        </button>
      </div>

      {/* Modal de Preview */}
      <AudioModalPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        squareData={getPreviewData()}
      />
    </form>
  );
};

export default SquareAudioForm;

