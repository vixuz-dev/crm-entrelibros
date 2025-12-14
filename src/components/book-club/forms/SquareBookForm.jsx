import React, { useState, useEffect, useRef } from 'react';
import { FiSave, FiX, FiFileText, FiPlus, FiTrash2, FiEye, FiSearch } from 'react-icons/fi';
import { getProducts, getProductDetail } from '../../../api/products';
import { useDebounce } from '../../../hooks/useDebounce';
import { saveBookClubFile } from '../../../api/bookClubApi';
import { useBookClubStore } from '../../../store/useBookClubStore';
import CustomDropdown from '../../ui/CustomDropdown';
import FileUpload from '../../ui/FileUpload';
import RichTextEditor from '../../ui/RichTextEditor';
import placeholderImage from '../../../assets/images/placeholder.jpg';
import BookModalPreview from '../../book-club-previews/BookModalPreview';

const SquareBookForm = ({ squareData, squareNumber, defaultUnlockDay, defaultType, onSave, onCancel, onChange }) => {
  // Obtener libros del store
  const { books } = useBookClubStore();
  
  // Estado inicial basado en squareData existente
  const [unlockDay, setUnlockDay] = useState(squareData?.unlockDay || defaultUnlockDay || 1);
  // El tipo ya está seleccionado en el modal, no lo necesitamos aquí
  const type = defaultType || 'book';
  const [bookId, setBookId] = useState(squareData?.bookInfo?.bookId || null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableBooks, setAvailableBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [showSearch, setShowSearch] = useState(false); // Para alternar entre dropdown de libros agregados y búsqueda
  const [addedBooksDetails, setAddedBooksDetails] = useState({}); // Detalles de los libros agregados
  const [isSaving, setIsSaving] = useState(false); // Estado para el loader al guardar

  // Secciones del cardContent
  const [previousActivitySection, setPreviousActivitySection] = useState({
    title: squareData?.cardContent?.sections?.previousActivitySection?.title || 'Actividad previa',
    subtitle: squareData?.cardContent?.sections?.previousActivitySection?.subtitle || 'Leer tú el libro así como la ficha que puedes ver si das click en el botón de abajo que dice "descargar ficha".'
  });

  const [activitiesSection, setActivitiesSection] = useState({
    title: squareData?.cardContent?.sections?.activitiesSection?.title || 'Actividades con tu hijo (una cada día):',
    subtitle: squareData?.cardContent?.sections?.activitiesSection?.subtitle || '',
    activities: squareData?.cardContent?.sections?.activitiesSection?.activities || [
      {
        title: 'Primera lectura',
        subtitle: 'Realiza las preguntas para antes y durante la lectura. También, si así lo quieres, puedes hacer una de las preguntas para después de leer.'
      },
      {
        title: 'Segunda lectura',
        subtitle: 'Solo haz las preguntas para después de leer.'
      }
    ]
  });

  const [noteSection, setNoteSection] = useState({
    title: squareData?.cardContent?.sections?.noteSection?.title || 'Nota',
    subtitle: squareData?.cardContent?.sections?.noteSection?.subtitle || '<p>Las preguntas para antes de leer y durante la lectura solo son funcionales para la primera lectura que haces con tu hijo, así que te recomiendo no saltártelas porque perderías una oportunidad muy valiosa de desarrollar habilidades lectoras. Por su parte, las preguntas para después de leer las puedes hacer cuando sea.</p>'
  });

  // Actions (botones de descarga/enlaces)
  // Inicializar actions con contentType inferido desde kind
  const initializeActions = (actionsData) => {
    // Si no hay acciones, crear una por defecto con "Descargar ficha"
    if (!actionsData || actionsData.length === 0) {
      return [{
        contentType: 'download',
        labelTitle: 'Descargar ficha',
        kind: 'download',
        url: ''
      }];
    }
    
    return actionsData.map(action => {
      // Mapear kind a contentType para el formulario
      let contentType = 'download'; // default
      
      if (action.kind === 'link') {
        contentType = 'link';
      } else if (action.kind === 'video') {
        contentType = 'video';
      } else if (action.kind === 'download' || !action.kind) {
        contentType = 'download';
      }
      
      return {
        ...action,
        contentType
      };
    });
  };

  const [actions, setActions] = useState(
    initializeActions(squareData?.cardContent?.actions)
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
      // Filtrar libros que tienen bookId y no tenemos sus detalles
      const booksToLoad = books.filter(
        book => book && book.bookId && (!addedBooksDetails[book.bookId])
      );

      if (booksToLoad.length === 0) return;

      // Cargar detalles de cada libro
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
        // Primero verificar si ya tenemos los detalles en addedBooksDetails
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
          // Si falla la carga, limpiar el bookId para permitir seleccionar otro
          setBookId(null);
        }
      }
    };

    loadBookDetails();
  }, [bookId, selectedBook, addedBooksDetails]);

  const handleBookSelect = async (book) => {
    // Si el libro viene de los agregados, usar los detalles que ya tenemos
    if (addedBooksDetails[book.bookId || book.product_id]) {
      setSelectedBook(addedBooksDetails[book.bookId || book.product_id]);
      setBookId(book.bookId || book.product_id);
    } else {
      // Si viene de la búsqueda, cargar detalles
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

  const handleAddActivity = () => {
    setActivitiesSection(prev => ({
      ...prev,
      activities: [...prev.activities, { title: '', subtitle: '' }]
    }));
  };

  const handleRemoveActivity = (index) => {
    setActivitiesSection(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateActivity = (index, field, value) => {
    setActivitiesSection(prev => ({
      ...prev,
      activities: prev.activities.map((activity, i) =>
        i === index ? { ...activity, [field]: value } : activity
      )
    }));
  };

  const handleAddAction = () => {
    setActions(prev => [...prev, { 
      contentType: 'download', 
      labelTitle: '', 
      kind: 'download', 
      url: '' 
    }]);
  };

  const handleRemoveAction = (index) => {
    setActions(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateAction = (index, field, value) => {
    setActions(prev =>
      prev.map((action, i) => {
        if (i === index) {
          const updatedAction = { ...action, [field]: value };
          
          // Si cambió el contentType, actualizar kind automáticamente
          if (field === 'contentType') {
            if (value === 'download') {
              updatedAction.kind = 'download';
            } else if (value === 'link') {
              updatedAction.kind = 'link';
            } else if (value === 'video') {
              updatedAction.kind = 'video';
            }
          }
          
          return updatedAction;
        }
        return action;
      })
    );
  };

  // Guardar archivo localmente (sin subir a S3 todavía)
  const handleFileSelect = (actionIndex, file, base64) => {
    // Guardar el archivo y base64 en el estado para subirlo después
    handleUpdateAction(actionIndex, 'url', base64);
    handleUpdateAction(actionIndex, '_pendingFile', { file, base64 });
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
  }, [unlockDay, bookId, previousActivitySection, activitiesSection, noteSection, actions, onChange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Subir archivos pendientes antes de guardar
      const updatedActions = await Promise.all(
      actions.map(async (action, index) => {
        // Si hay un archivo pendiente, subirlo
        if (action._pendingFile) {
          try {
            const { file, base64 } = action._pendingFile;
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const response = await saveBookClubFile(fileExtension, base64);
            
            if (response.status === true && response.file_url) {
              return {
                ...action,
                url: response.file_url,
                _pendingFile: undefined
              };
            } else {
              console.error('Error: No se recibió URL del servidor', response);
              return {
                ...action,
                url: base64, // Fallback a base64
                _pendingFile: undefined
              };
            }
          } catch (error) {
            console.error('Error al subir archivo:', error);
            return {
              ...action,
              url: action._pendingFile.base64, // Fallback a base64
              _pendingFile: undefined
            };
          }
        }
        return action;
      })
    );

    // Limpiar actions para remover contentType y _pendingFile antes de guardar
    const cleanedActions = updatedActions.map(({ contentType, _pendingFile, ...action }) => action);

    const cardContent = {
      sections: {
        previousActivitySection,
        activitiesSection,
        noteSection
      },
      actions: cleanedActions
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
    // Limpiar actions para remover contentType antes de mostrar en preview
    const cleanedActions = actions.map(({ contentType, ...action }) => action);
    
    const previewData = {
      squareNumber: squareNumber || 1,
      unlockDay,
      type: 'book',
      bookInfo: {
        bookId: bookId
      },
      cardContent: {
        sections: {
          previousActivitySection,
          activitiesSection,
          noteSection
        },
        actions: cleanedActions
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

      {/* Sección: Actividades Generales */}
      <div className="pt-6">
        <h2 className="text-xl font-cabin-bold text-gray-800 mb-2">Actividades Generales</h2>
        <p className="text-sm text-gray-600 font-cabin-regular mb-6">
          Desglosa las actividades para la casilla.
        </p>

        {/* Actividad Previa */}
        <div className="mb-6 ">
          <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4">Actividad Previa</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
                Título
              </label>
              <input
                type="text"
                value={previousActivitySection.title}
                onChange={(e) => setPreviousActivitySection(prev => ({ ...prev, title: e.target.value }))}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular"
              />
            </div>
            <div>
              <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
                Descripción de la actividad
              </label>
              <textarea
                value={previousActivitySection.subtitle}
                onChange={(e) => setPreviousActivitySection(prev => ({ ...prev, subtitle: e.target.value }))}
                rows={3}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular resize-y"
              />
            </div>
          </div>
        </div>

        {/* Actividades con tu hijo */}
        <div className="border-t border-gray-200 pt-6">
          <div className="mb-6">
            <h3 className="text-lg font-cabin-semibold text-gray-800 mb-4">Actividades con tu hijo</h3>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
                  Título de la sección
                </label>
                <input
                  type="text"
                  value={activitiesSection.title}
                  onChange={(e) => setActivitiesSection(prev => ({ ...prev, title: e.target.value }))}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular"
                />
              </div>
              <div>
                <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
                  Subtítulo de la sección
                </label>
                <textarea
                  value={activitiesSection.subtitle}
                  onChange={(e) => setActivitiesSection(prev => ({ ...prev, subtitle: e.target.value }))}
                  rows={2}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular resize-y"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end mb-4">
            <button
              type="button"
              onClick={handleAddActivity}
              className="flex items-center space-x-2 px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-cabin-medium text-sm"
            >
              <FiPlus className="w-4 h-4" />
              <span>Agregar actividad</span>
            </button>
          </div>

          <div className="space-y-4">
            {activitiesSection.activities.length > 0 && activitiesSection.activities.map((activity, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-end mb-3">
                  <button
                    type="button"
                    onClick={() => handleRemoveActivity(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={activity.title}
                      onChange={(e) => handleUpdateActivity(index, 'title', e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
                      Descripción de la actividad
                    </label>
                    <textarea
                      value={activity.subtitle}
                      onChange={(e) => handleUpdateActivity(index, 'subtitle', e.target.value)}
                      rows={2}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular resize-y"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección: Nota */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-cabin-bold text-gray-800 mb-4">Nota</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              value={noteSection.title}
              onChange={(e) => setNoteSection(prev => ({ ...prev, title: e.target.value }))}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular"
            />
          </div>
          <div>
            <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
              Descripción de la nota
            </label>
            <RichTextEditor
              value={noteSection.subtitle}
              onChange={(value) => setNoteSection(prev => ({ ...prev, subtitle: value }))}
              placeholder="Escribe la descripción de la nota..."
              minHeight="200px"
            />
          </div>
        </div>
      </div>

      {/* Sección: Elementos Descargables */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-cabin-semibold text-gray-800">Elementos Descargables</h3>
            <p className="text-sm text-gray-600 font-cabin-regular mt-1">
              Configura los elementos descargables o visualizables para esta casilla
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddAction}
            className="flex items-center space-x-2 px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-cabin-medium text-sm"
          >
            <FiPlus className="w-4 h-4" />
            <span>Agregar archivo</span>
          </button>
        </div>

        <div className="space-y-4">
          {actions.length > 0 ? (
            actions.map((action, index) => {
              // Determinar el contentType desde el action existente o usar 'download' por defecto
              const contentType = action.contentType || 
                (action.kind === 'link' ? 'link' : 
                 action.kind === 'video' ? 'video' : 'download');
              
              return (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-end mb-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveAction(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
                        Tipo de contenido *
                      </label>
                      <CustomDropdown
                        options={[
                          { value: 'video', label: 'Video' },
                          { value: 'link', label: 'Enlace' },
                          { value: 'download', label: 'Descargable' }
                        ]}
                        selectedValues={[contentType]}
                        onChange={(selected) => {
                          if (selected && selected.length > 0) {
                            handleUpdateAction(index, 'contentType', selected[0]);
                          }
                        }}
                        placeholder="Selecciona el tipo de contenido"
                        multiple={false}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
                        Título del botón *
                      </label>
                      <input
                        type="text"
                        value={action.labelTitle || ''}
                        onChange={(e) => handleUpdateAction(index, 'labelTitle', e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular"
                        placeholder="Ej: Descargar ficha, Ver video, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
                        {contentType === 'video' ? 'URL del video *' : contentType === 'link' ? 'URL del enlace *' : 'Archivo *'}
                      </label>
                      {contentType === 'video' || contentType === 'link' ? (
                        <input
                          type="url"
                          value={action.url || ''}
                          onChange={(e) => handleUpdateAction(index, 'url', e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular"
                          placeholder={contentType === 'video' ? 'https://ejemplo.com/video.mp4' : 'https://ejemplo.com'}
                        />
                      ) : (
                        <FileUpload
                          value={action.url || ''}
                          onChange={(url) => handleUpdateAction(index, 'url', url)}
                          onFileSelect={(file, base64) => handleFileSelect(index, file, base64)}
                          accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
                          allowedExtensions={['pdf', 'png', 'jpg', 'jpeg', 'webp']}
                          maxSize={50 * 1024 * 1024} // 50MB
                          fileTypeLabel="PDF o imagen"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 border-dashed text-center text-gray-500 text-sm">
              No hay elementos descargables agregados. Haz clic en "Agregar archivo" para comenzar.
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
          disabled={!bookId}
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
      <BookModalPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        squareData={getPreviewData()}
      />
    </form>
  );
};

export default SquareBookForm;

