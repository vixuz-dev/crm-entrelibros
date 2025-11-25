import React, { useState, useEffect } from 'react';
import { FiX, FiDownload } from 'react-icons/fi';
import { getProductDetail } from '../../api/products';
import placeholderImage from '../../assets/images/placeholder.jpg';

const ActivityModalPreview = ({ isOpen, onClose, squareData }) => {
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
  const title = cardContent.title || '';
  const subtitle = cardContent.subtitle || '';
  const activities = cardContent.activities || [];
  const unlockDay = squareData?.unlockDay || 1;
  
  // Usar selectedBook si está disponible (del formulario), sino usar bookDetails (de la API)
  const currentBook = squareData?.selectedBook || bookDetails;
  const bookTitle = currentBook?.product_name || 'Actividad';

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
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal - Sticky */}
        <div className="sticky top-0 z-10 bg-white p-6 border-b border-gray-200 shadow-sm">
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
                Actividades
              </div>
            </div>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Icono de actividades */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>

            {/* Información inicial */}
            <div>
              {subtitle ? (
                <div 
                  className="text-gray-900 text-sm leading-relaxed prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: subtitle }}
                  style={{ isolation: 'isolate' }}
                />
              ) : (
                <p className="text-gray-900 text-sm leading-relaxed font-cabin-regular">
                  En la ficha que puedes descargar abajo, vienen actividades para <strong>mitad de la semana</strong> y para el <strong>fin de semana</strong> (los días que a ti te acomoden mejor).
                </p>
              )}
            </div>

            {/* Contenido estructurado de actividades + descargas por bloque */}
            {activities.length > 0 ? (
              <div className={`grid gap-6 ${activities.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {activities.map((activity, idx) => (
                  <div key={idx} className="rounded-xl border border-gray-100 p-5 bg-white shadow-sm">
                    {activity.title && (
                      <h4 className="text-base font-cabin-semibold mb-2" style={{ color: '#BE9B7B' }}>
                        {activity.title}
                      </h4>
                    )}
                    {activity.subtitle && (
                      <p className="text-gray-700 text-sm leading-relaxed mb-3 font-cabin-regular">
                        {activity.subtitle}
                      </p>
                    )}
                    
                    {/* Botones de acción para esta actividad */}
                    {activity.actions && activity.actions.length > 0 && (
                      <div onClick={(e) => e.stopPropagation()}>
                        {activity.actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-cabin-medium py-2 px-4 rounded-md transition-colors duration-200"
                            onClick={(e) => handleDownload(e, action)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {action.labelTitle || 'Descargar'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-xl font-cabin-semibold text-gray-900 mb-2">{title || 'Actividad'}</h3>
                <p className="text-gray-600 font-cabin-regular">{subtitle || 'No hay actividades configuradas'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityModalPreview;

