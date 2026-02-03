import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX, FiSave, FiEdit } from 'react-icons/fi';
import { getProducts, getProductDetail } from '../../api/products';
import { useDebounce } from '../../hooks/useDebounce';
import { saveBookClubFile } from '../../api/bookClubApi';
import FileUpload from '../ui/FileUpload';
import placeholderImage from '../../assets/images/placeholder.jpg';
import { showSuccess } from '../../utils/notifications';

const getGuideFileType = (extension) => {
  const ext = (extension || '').toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'image';
  return 'pdf';
};

const BooksSection = ({
  books,
  setBooks,
  booksTheme = '',
  setBooksTheme,
  isLocked = false,
  onEdit,
  onSave,
  showEditButton = true
}) => {
  const [localBooks, setLocalBooks] = useState(books || [
    { order: 1, bookId: null, guideUrl: '', guideFileType: '' },
    { order: 2, bookId: null, guideUrl: '', guideFileType: '' },
    { order: 3, bookId: null, guideUrl: '', guideFileType: '' },
    { order: 4, bookId: null, guideUrl: '', guideFileType: '' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [bookDetailsCache, setBookDetailsCache] = useState({});
  const [uploadingSlotIndex, setUploadingSlotIndex] = useState(null);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const initial = [
      { order: 1, bookId: null, guideUrl: '', guideFileType: '' },
      { order: 2, bookId: null, guideUrl: '', guideFileType: '' },
      { order: 3, bookId: null, guideUrl: '', guideFileType: '' },
      { order: 4, bookId: null, guideUrl: '', guideFileType: '' }
    ];
    if (books && Array.isArray(books) && books.length >= 4) {
      setLocalBooks(books.map((b, i) => ({
        order: (b.order ?? i + 1),
        bookId: b.bookId ?? null,
        guideUrl: b.guideUrl ?? '',
        guideFileType: b.guideFileType ?? ''
      })));
    } else {
      setLocalBooks(initial);
    }
  }, [books]);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const firstEmptySlotIndex = () => {
    const i = localBooks.findIndex((b) => !b?.bookId);
    return i >= 0 ? i : 4;
  };

  const addedSlots = localBooks
    .map((b, i) => (b?.bookId ? i : null))
    .filter((i) => i !== null);

  const booksWithGuide = localBooks.filter(
    (b) => b?.bookId && b?.guideUrl?.trim()
  );
  const firstEmpty = firstEmptySlotIndex();
  const showAddArea = firstEmpty < 4 && !isLocked;

  const searchProducts = async (term) => {
    if (!term.trim()) {
      setAvailableBooks([]);
      return;
    }
    setIsLoadingBooks(true);
    try {
      const response = await getProducts(1, 20, term);
      if (response.status === true && response.product_list) {
        const selectedIds = localBooks.map((b) => b?.bookId).filter(Boolean);
        const filtered = response.product_list.filter(
          (p) => !selectedIds.includes(p.product_id)
        );
        setAvailableBooks(filtered);
      } else {
        setAvailableBooks([]);
      }
    } catch (err) {
      console.error(err);
      setAvailableBooks([]);
    } finally {
      setIsLoadingBooks(false);
    }
  };

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchProducts(debouncedSearchTerm);
    } else {
      setAvailableBooks([]);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    localBooks.forEach((b) => {
      if (!b?.bookId || bookDetailsCache[b.bookId]) return;
      getProductDetail(b.bookId)
        .then((res) => {
          if (res.status === true && res.product) {
            setBookDetailsCache((prev) => ({ ...prev, [b.bookId]: res.product }));
          }
        })
        .catch(() => {});
    });
  }, [localBooks]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectBook = (product, slotIndex) => {
    setLocalBooks((prev) => {
      const next = [...prev];
      next[slotIndex] = {
        order: slotIndex + 1,
        bookId: product.product_id,
        guideUrl: '',
        guideFileType: ''
      };
      return next;
    });
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleGuideUpload = async (slotIndex, file, base64File) => {
    if (!file || !base64File) return;
    const ext = file.name.split('.').pop() || 'pdf';
    setUploadingSlotIndex(slotIndex);
    try {
      const response = await saveBookClubFile(ext, base64File);
      if (response.status === true && response.file_url) {
        const guideFileType = getGuideFileType(ext);
        setLocalBooks((prev) => {
          const next = [...prev];
          if (next[slotIndex]) {
            next[slotIndex] = {
              ...next[slotIndex],
              guideUrl: response.file_url,
              guideFileType
            };
          }
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingSlotIndex(null);
    }
  };

  const handleRemoveBook = (slotIndex) => {
    const book = localBooks[slotIndex];
    const hasGuide = book?.guideUrl?.trim();
    if (hasGuide && booksWithGuide.length <= 1) return;
    setLocalBooks((prev) => {
      const next = prev.map((b, i) =>
        i === slotIndex
          ? { order: i + 1, bookId: null, guideUrl: '', guideFileType: '' }
          : b
      );
      return next;
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const withGuide = localBooks.filter((b) => b?.bookId && b?.guideUrl?.trim());
    if (withGuide.length < 1) {
      alert('Debe haber al menos un libro con su guía.');
      return;
    }
    const withBookNoGuide = localBooks.filter((b) => b?.bookId && (!b?.guideUrl || !b.guideUrl.trim()));
    if (withBookNoGuide.length > 0) {
      alert('Todos los libros deben tener guía (PDF o imagen) antes de guardar.');
      return;
    }
    setBooks(localBooks);
    showSuccess('Libros sugeridos del mes guardados exitosamente');
    if (onSave) onSave();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-cabin-bold text-gray-800 mb-2">
            Libros sugeridos del mes
          </h2>
          <p className="text-gray-600 font-cabin-regular">
            Agrega libros y sube su guía (PDF o imagen). Debe haber al menos un libro con guía. Puedes quitar cualquiera.
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

      {/* Tema que liga los libros */}
      {setBooksTheme && (
        <div className="mb-6">
          <label className="block text-sm font-cabin-semibold text-gray-700 mb-2">
            Tema
          </label>
          {isLocked ? (
            <p className="text-gray-800 font-cabin-regular">
              {booksTheme || '—'}
            </p>
          ) : (
            <input
              type="text"
              value={booksTheme || ''}
              onChange={(e) => setBooksTheme(e.target.value)}
              placeholder="Ej: Aventuras, Crecimiento personal..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-cabin-regular text-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          )}
        </div>
      )}

      {showAddArea && !localBooks[firstEmpty]?.bookId && (
        <div ref={searchContainerRef} className="mb-6">
          <h3 className="text-sm font-cabin-semibold text-gray-700 mb-2">Agregar libro</h3>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-cabin-regular"
              placeholder="Buscar libro..."
            />
            {isDropdownOpen && (
              <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {isLoadingBooks ? (
                  <div className="px-4 py-3 text-gray-500 text-sm flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600 mr-2" />
                    Buscando...
                  </div>
                ) : availableBooks.length > 0 ? (
                  availableBooks.map((p) => (
                    <div
                      key={p.product_id}
                      onClick={() => handleSelectBook(p, firstEmpty)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-cabin-medium text-gray-800">{p.product_name}</div>
                      <div className="text-sm text-gray-600 font-cabin-regular">
                        {p.author_list?.length ? p.author_list.map((a) => a.author_name).join(', ') : 'Sin autor'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-sm">
                    {searchTerm ? 'No se encontraron libros' : 'Escribe para buscar'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {addedSlots.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-cabin-bold text-gray-800 mb-4">
            Libros agregados ({addedSlots.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {addedSlots.map((slotIndex) => {
              const book = localBooks[slotIndex];
              const hasGuide = book?.guideUrl?.trim();
              const detail = book?.bookId ? bookDetailsCache[book.bookId] : null;
              const isUploading = uploadingSlotIndex === slotIndex;
              const isOnlyBookWithGuide = booksWithGuide.length === 1 && hasGuide;
              const canRemove = !isLocked && (!hasGuide || booksWithGuide.length > 1);

              return (
                <div
                  key={slotIndex}
                  className="rounded-xl border-2 border-gray-200 bg-white overflow-hidden hover:border-amber-200 transition-colors"
                >
                  <div className="p-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                    <span className="text-sm font-cabin-semibold text-gray-800">
                      Libro {slotIndex + 1}
                    </span>
                    {canRemove && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBook(slotIndex)}
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                        title="Quitar libro"
                        aria-label="Quitar libro"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    )}
                    {isOnlyBookWithGuide && (
                      <span className="text-xs text-gray-500" title="Debe haber al menos un libro con guía">
                        (mínimo 1)
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="mb-4 flex justify-center bg-gray-100 rounded-lg p-2 min-h-[160px]">
                      <img
                        src={detail?.main_image_url || placeholderImage}
                        alt={detail?.product_name || 'Libro'}
                        className="max-h-[180px] w-auto object-contain rounded"
                        onError={(e) => { e.target.src = placeholderImage; }}
                      />
                    </div>
                    <p className="text-sm font-cabin-semibold text-gray-800 mb-2 line-clamp-2">
                      {detail?.product_name || `Libro ${slotIndex + 1}`}
                    </p>

                    {!hasGuide && !isLocked && (
                      <div className="mt-3">
                        <label className="block text-xs font-cabin-semibold text-gray-700 mb-1">
                          Guía (PDF o imagen) *
                        </label>
                        <FileUpload
                          value=""
                          onChange={() => {}}
                          onFileSelect={(file, base64) => handleGuideUpload(slotIndex, file, base64)}
                          accept=".pdf,application/pdf,image/jpeg,image/png,image/webp,image/jpg"
                          allowedExtensions={['pdf', 'jpg', 'jpeg', 'png', 'webp']}
                          maxSize={50 * 1024 * 1024}
                          fileTypeLabel="PDF o imagen"
                          className="w-full"
                          disabled={isUploading}
                        />
                        {isUploading && (
                          <p className="text-xs text-amber-600 mt-1">Subiendo...</p>
                        )}
                      </div>
                    )}

                    {hasGuide && (
                      <p className="text-xs text-green-600 font-cabin-medium mt-2">
                        Guía subida
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {addedSlots.length === 0 && !showAddArea && (
        <p className="text-gray-500 font-cabin-regular py-4">
          Agrega al menos un libro usando el buscador de arriba.
        </p>
      )}

      {!isLocked && (
        <div className="mt-8 flex justify-start pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSave}
            disabled={booksWithGuide.length < 1}
            className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-cabin-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave className="w-5 h-5" />
            <span>Guardar sección.</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BooksSection;
