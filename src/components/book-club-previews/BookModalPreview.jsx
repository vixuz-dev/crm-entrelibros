import React, { useState, useEffect } from 'react';
import { FiX, FiDownload } from 'react-icons/fi';
import { getProductDetail } from '../../api/products';
import placeholderImage from '../../assets/images/placeholder.jpg';

const BookModalPreview = ({ isOpen, onClose, squareData }) => {
  const [bookDetails, setBookDetails] = useState(null);
  const [isLoadingBook, setIsLoadingBook] = useState(false);

  useEffect(() => {
    const loadBookDetails = async () => {
      if (isOpen && squareData?.bookInfo?.bookId) {
        setIsLoadingBook(true);
        try {
          const response = await getProductDetail(squareData.bookInfo.bookId);
          if (response.status === true && response.product) {
            setBookDetails(response.product);
          }
        } catch (error) {
          console.error('Error loading book details:', error);
        } finally {
          setIsLoadingBook(false);
        }
      }
    };

    loadBookDetails();
  }, [isOpen, squareData]);

  if (!isOpen || !squareData) return null;

  const cardContent = squareData.cardContent || {};
  const sections = cardContent.sections || {};
  const actions = cardContent.actions || [];
  
  // Usar selectedBook si está disponible (del formulario), sino usar bookDetails (de la API)
  const currentBook = squareData?.selectedBook || bookDetails;
  const bookTitle = currentBook?.product_name || 'Libro';
  const bookImageUrl = currentBook?.main_image_url || placeholderImage;
  const unlockDay = squareData?.unlockDay || 1;

  const handleDownload = (e, action) => {
    e.stopPropagation(); // Evitar que el clic cierre el modal
    if (action.kind === 'download' || action.kind === 'link') {
      const link = document.createElement('a');
      link.href = action.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      if (action.kind === 'download') {
        link.download = action.url.split('/').pop() || 'download';
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (action.kind === 'video') {
      window.open(action.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out relative"
        onClick={(e) => e.stopPropagation()}
        style={{ isolation: 'isolate' }}
      >
        {/* Header del modal - Sticky */}
        <div className="sticky top-0 z-30 bg-white p-6 border-b border-gray-200 shadow-sm" style={{ isolation: 'isolate' }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
          >
            <FiX className="w-5 h-5 text-gray-600" />
          </button>

          <div className="pr-8">
            <h2 className="text-2xl font-cabin-bold text-gray-900 mb-3">
              {bookTitle}
            </h2>
            <div className="space-y-2">
              <div className="text-sm font-cabin-medium text-gray-600">
                Día de desbloqueo: {unlockDay}
              </div>
              <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-sm font-cabin-semibold rounded-full">
                Libro
              </div>
            </div>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 relative" style={{ zIndex: 1 }}>
          <div className="space-y-6 relative" style={{ zIndex: 1 }}>
            {/* Portada del libro */}
            <div className="flex justify-center">
              {isLoadingBook && !currentBook ? (
                <div className="w-48 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                </div>
              ) : (
                <img
                  src={bookImageUrl}
                  alt={`Portada de ${bookTitle}`}
                  className="w-48 h-64 object-contain rounded-lg shadow-md"
                  onError={(e) => {
                    e.target.src = placeholderImage;
                  }}
                />
              )}
            </div>

            {/* Contenido estructurado */}
            <div className="space-y-6">
              {/* Actividad Previa */}
              {sections.previousActivitySection && (
                <div className="space-y-3">
                  <h3 className="text-lg font-cabin-semibold text-gray-900">
                    {sections.previousActivitySection.title || 'Actividad previa'}
                  </h3>
                  {sections.previousActivitySection.subtitle && (
                    <p className="text-gray-700 leading-relaxed font-cabin-regular">
                      {sections.previousActivitySection.subtitle}
                    </p>
                  )}
                </div>
              )}

              {/* Actividades con tu hijo */}
              {sections.activitiesSection && (
                <div className="space-y-3">
                  <h3 className="text-lg font-cabin-semibold text-gray-900">
                    {sections.activitiesSection.title || 'Actividades con tu hijo (una cada día):'}
                  </h3>
                  {sections.activitiesSection.subtitle && (
                    <p className="text-gray-700 leading-relaxed font-cabin-regular mb-3">
                      {sections.activitiesSection.subtitle}
                    </p>
                  )}
                  {sections.activitiesSection.activities && sections.activitiesSection.activities.length > 0 && (
                    <div className="space-y-3">
                      {sections.activitiesSection.activities.map((activity, index) => (
                        <div
                          key={index}
                          className="rounded-lg p-4 border border-gray-100"
                          style={{ backgroundColor: 'rgba(190, 155, 123, 0.08)' }}
                        >
                          {activity.title && (
                            <h4
                              className="font-cabin-semibold text-gray-900 mb-2"
                              style={{ color: '#BE9B7B' }}
                            >
                              {activity.title}
                            </h4>
                          )}
                          {activity.subtitle && (
                            <p className="text-gray-700 leading-relaxed font-cabin-regular">
                              {activity.subtitle}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Nota */}
              {sections.noteSection && (
                <div className="space-y-3 relative" style={{ zIndex: 1 }}>
                  <h3 className="text-lg font-cabin-semibold text-gray-900 relative" style={{ zIndex: 1 }}>
                    {sections.noteSection.title || 'Nota'}
                  </h3>
                  {sections.noteSection.subtitle && (
                    <div 
                      className="text-gray-700 leading-relaxed font-cabin-regular prose prose-sm max-w-none relative"
                      style={{ position: 'relative', zIndex: 1, isolation: 'isolate' }}
                      dangerouslySetInnerHTML={{ __html: sections.noteSection.subtitle }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Botones de acción */}
            {actions.length > 0 && (
              <div className="flex justify-center pt-4 space-x-3" onClick={(e) => e.stopPropagation()}>
                {actions.map((action, index) => (
                  <button
                    key={index}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-cabin-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2"
                    onClick={(e) => handleDownload(e, action)}
                  >
                    <FiDownload className="w-5 h-5" />
                    {action.labelTitle || 'Descargar'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookModalPreview;

