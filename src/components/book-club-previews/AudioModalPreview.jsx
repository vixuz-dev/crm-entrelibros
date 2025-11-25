import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { getProductDetail } from '../../api/products';
import placeholderImage from '../../assets/images/placeholder.jpg';

const AudioModalPreview = ({ isOpen, onClose, squareData }) => {
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
  const title = cardContent.title || 'Audios';
  const intro = cardContent.intro || 'Audios complementarios para profundizar en el tema';
  const audios = Array.isArray(cardContent.audios) ? cardContent.audios : [];
  const unlockDay = squareData?.unlockDay || 1;
  
  // Usar selectedBook si está disponible (del formulario), sino usar bookDetails (de la API)
  const currentBook = squareData?.selectedBook || bookDetails;
  const bookTitle = currentBook?.product_name || 'Audio';


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
                Audios
              </div>
            </div>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Icono y título/descripción */}
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
              <h3 className="text-xl font-cabin-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 font-cabin-regular mb-4">{intro}</p>
            </div>

            {/* Lista de Audios */}
            {audios.length > 0 ? (
              <div className="space-y-4">
                {audios.map((audio, index) => {
                  // Detectar el tipo MIME del audio
                  const getAudioType = (url) => {
                    if (!url) return 'audio/*';
                    
                    // Si es un data URI, extraer el tipo MIME
                    if (url.startsWith('data:')) {
                      const match = url.match(/data:([^;]+)/);
                      if (match && match[1]) {
                        return match[1];
                      }
                      return 'audio/*';
                    }
                    
                    // Si es una URL normal, detectar por extensión
                    if (url.endsWith('.mp3')) return 'audio/mpeg';
                    if (url.endsWith('.wav')) return 'audio/wav';
                    if (url.endsWith('.ogg')) return 'audio/ogg';
                    if (url.endsWith('.m4a')) return 'audio/mp4';
                    
                    return 'audio/*';
                  };

                  return (
                    <div key={index} className="space-y-3">
                      {audio.title && (
                        <h4 className="text-lg font-cabin-semibold text-gray-900">{audio.title}</h4>
                      )}
                      {audio.subTitle && (
                        <p className="text-gray-600 text-sm font-cabin-regular">{audio.subTitle}</p>
                      )}
                      <div
                        className="p-4 rounded-lg"
                        style={{ backgroundColor: "#EBE7DC" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {audio.url ? (
                          <audio
                            controls
                            preload="metadata"
                            className="w-full"
                            style={{
                              accentColor: "#BE9B7B",
                              backgroundColor: "transparent",
                              height: "48px",
                              display: "block"
                            }}
                          >
                            <source src={audio.url} type={getAudioType(audio.url)} />
                            Tu navegador no soporta el elemento de audio.
                          </audio>
                        ) : (
                          <div className="text-center text-gray-500 text-sm font-cabin-regular py-2">
                            No hay archivo de audio configurado
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-sm font-cabin-regular">
                No hay audios configurados. Agrega al menos un audio para ver el preview.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioModalPreview;

