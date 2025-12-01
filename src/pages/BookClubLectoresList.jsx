import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiBook, FiLoader, FiPlus, FiEdit, FiX } from 'react-icons/fi';
import { MONTH_OPTIONS } from '../constants/bookClub';
import { getBookClub, updateBookClub } from '../api/bookClubApi';
import { showDataLoadError } from '../utils/notifications';
import { useBookClubStore } from '../store/useBookClubStore';
import { ROUTES } from '../utils/routes';
import MainConfigurationSection from '../components/book-club/MainConfigurationSection';
import HeroSectionSection from '../components/book-club/HeroSectionSection';
import BooksSection from '../components/book-club/BooksSection';
import WelcomeAudioSection from '../components/book-club/WelcomeAudioSection';
import CourseSectionsSection from '../components/book-club/CourseSectionsSection';
import TimbiricheSection from '../components/book-club/TimbiricheSection';
import NextReleasesSection from '../components/book-club/NextReleasesSection';
import ConfirmationModal from '../components/modals/ConfirmationModal';

const BookClubLectoresList = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [bookClubData, setBookClubData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBookClubAvailable, setIsBookClubAvailable] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [initialBookClubConfig, setInitialBookClubConfig] = useState(null);
  const [showConfirmUpdateModal, setShowConfirmUpdateModal] = useState(false);

  // Estado de bloqueo por sección (similar a la pantalla de creación)
  const [sectionLocked, setSectionLocked] = useState({
    'main-config': true,
    'hero-section': true,
    'books': true,
    'welcome-audio': true,
    'course-sections': true,
    'next-releases': true
  });

  // Obtener estado y acciones del store
  const {
    month,
    theme,
    description,
    title,
    subtitle,
    fileUrl,
    welcomeAudioTitle,
    welcomeAudioSubtitle,
    welcomeAudioFileUrl,
    monthlyActivityTitle,
    monthlyActivitySubtitle,
    monthlyActivityFileUrl,
    activityName,
    activityDescription,
    books,
    nextReleasesMonth,
    nextReleasesTheme,
    nextReleasesDescription,
    metadata,
    heroSection,
    sections,
    timbiriche,
    setMonth,
    setTheme,
    setDescription,
    setTitle,
    setSubtitle,
    setFileUrl,
    setWelcomeAudioTitle,
    setWelcomeAudioSubtitle,
    setWelcomeAudioFileUrl,
    setMonthlyActivityTitle,
    setMonthlyActivitySubtitle,
    setMonthlyActivityFileUrl,
    setActivityName,
    setActivityDescription,
    setBooks,
    setNextReleasesMonth,
    setNextReleasesTheme,
    setNextReleasesDescription,
    updateSquare,
    getFullConfiguration
  } = useBookClubStore();

  // Función para obtener el índice del mes actual
  const getCurrentMonthIndex = () => {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth(); // 0-11 (Enero = 0, Diciembre = 11)
    return currentMonthIndex;
  };

  const performUpdateBookClub = async () => {
    if (!bookClubData) {
      showDataLoadError('Book Club', 'No hay datos de Book Club cargados para actualizar.');
      return;
    }

    // Intentar obtener el ID del book club desde la respuesta del API
    const bookClubId = bookClubData.book_club_id || bookClubData.id;

    if (!bookClubId) {
      showDataLoadError(
        'Book Club',
        'No se encontró el ID del Book Club a actualizar. Verifica la respuesta del API.'
      );
      return;
    }

    try {
      setIsSavingChanges(true);

      // Asegurarse de que los objetos derivados estén actualizados antes de construir el objeto final
      const store = useBookClubStore.getState();
      if (store.updateMetadata) store.updateMetadata();
      if (store.updateHeroSection) store.updateHeroSection();
      if (store.updateWelcomeAudioSection) store.updateWelcomeAudioSection();
      if (store.updateMonthlyActivitySection) store.updateMonthlyActivitySection();

      const bookClubObject = store.getFullConfiguration
        ? store.getFullConfiguration()
        : null;

      if (!bookClubObject) {
        showDataLoadError('Book Club', 'No se pudo construir el objeto de configuración del Book Club.');
        return;
      }

      await updateBookClub(bookClubId, bookClubObject);

      // Actualizar la configuración inicial para que deje de marcar cambios pendientes
      setInitialBookClubConfig(bookClubObject);
    } catch (err) {
      // El error ya se muestra en updateBookClub
      console.error('Error al actualizar Book Club:', err);
    } finally {
      setIsSavingChanges(false);
    }
  };

  const handleUpdateClick = () => {
    if (!hasUnsavedChanges || isSavingChanges) return;
    setShowConfirmUpdateModal(true);
  };

  // Función para obtener el índice del mes "Septiembre"
  const getSeptemberIndex = () => {
    return MONTH_OPTIONS.findIndex(month => month.value === 'Septiembre');
  };

  // Generar lista de meses disponibles (desde Septiembre hasta el mes actual, incluyendo el actual)
  const availableMonths = useMemo(() => {
    const currentMonthIndex = getCurrentMonthIndex();
    const septemberIndex = getSeptemberIndex();
    
    // Crear array de meses desde Septiembre hasta el mes actual (incluyendo el actual)
    const months = [];
    for (let i = septemberIndex; i <= currentMonthIndex; i++) {
      months.push(MONTH_OPTIONS[i]);
    }
    
    return months;
  }, []);

  // Detectar si hay cambios sin guardar comparando contra la configuración inicial cargada
  const hasUnsavedChanges = useMemo(() => {
    if (!initialBookClubConfig || !getFullConfiguration) return false;
    const currentConfig = getFullConfiguration();
    try {
      return JSON.stringify(currentConfig) !== JSON.stringify(initialBookClubConfig);
    } catch {
      return false;
    }
  }, [
    initialBookClubConfig,
    metadata,
    heroSection,
    sections,
    books,
    timbiriche,
    nextReleasesMonth,
    nextReleasesTheme,
    nextReleasesDescription,
    getFullConfiguration
  ]);

  // Handlers para bloqueo por sección (solo afectan el UI de cada sección)
  const handleSectionSaved = (sectionId) => {
    setSectionLocked((prev) => ({
      ...prev,
      [sectionId]: true
    }));
  };

  const handleEditSection = (sectionId) => {
    setIsEditing(true);
    setSectionLocked((prev) => ({
      ...prev,
      [sectionId]: false
    }));
  };

  // Cargar book club cuando se selecciona un mes
  useEffect(() => {
    if (selectedMonth) {
      loadBookClub(selectedMonth);
    }
  }, [selectedMonth]);

  const loadBookClub = async (month) => {
    setLoading(true);
    setError(null);
    setBookClubData(null);
    setIsBookClubAvailable(false);
    setIsEditing(false); // Resetear modo edición al cargar un nuevo mes

    try {
      const response = await getBookClub(month);
      
      // Validar si el Book Club está disponible
      if (response && response.status === true) {
        // Verificar si book_club existe y no está vacío
        const bookClub = response.book_club;
        const isBookClubEmpty = !bookClub || Object.keys(bookClub).length === 0;
        
        if (isBookClubEmpty || response.status_Message === 'Book Club no disponible') {
          setIsBookClubAvailable(false);
          setBookClubData(null);
          setError(`No hay un Book Club asignado para el mes de ${month}`);
          
          // Limpiar el store para evitar mostrar datos de meses anteriores
          const { reset } = useBookClubStore.getState();
          if (reset) {
            reset();
          }
          
          return;
        }
        
        // Si el Book Club está disponible, reiniciar el store y poblar los datos
        const { reset } = useBookClubStore.getState();
        if (reset) {
          reset();
        }

        setIsBookClubAvailable(true);
        setBookClubData(response);
        setInitialBookClubConfig(bookClub);

        // Inicializar bloqueo por sección (todas bloqueadas al cargar)
        setSectionLocked({
          'main-config': true,
          'hero-section': true,
          'books': true,
          'welcome-audio': true,
          'course-sections': true,
          'next-releases': true
        });
        
        // Metadata (Configuración Principal)
        if (bookClub.metadata) {
          setMonth([bookClub.metadata.month]);
          setTheme(bookClub.metadata.theme || '');
          setDescription(bookClub.metadata.description || '');
        }
        
        // Hero Section
        if (bookClub.heroSection) {
          setTitle(bookClub.heroSection.title || 'Book Club');
          setSubtitle(bookClub.heroSection.subtitle || 'Lectores');
          setFileUrl(bookClub.heroSection.fileUrl || '');
        }
        
        // Welcome Audio Section
        if (bookClub.sections?.welcomeAudioSection) {
          const welcomeAudio = bookClub.sections.welcomeAudioSection;
          setWelcomeAudioTitle(welcomeAudio.title || '');
          setWelcomeAudioSubtitle(welcomeAudio.subtitle || '');
          setWelcomeAudioFileUrl(welcomeAudio.fileUrl || '');
        } else {
          // Si no está en sections, intentar directamente
          if (bookClub.welcomeAudioSection) {
            const welcomeAudio = bookClub.welcomeAudioSection;
            setWelcomeAudioTitle(welcomeAudio.title || '');
            setWelcomeAudioSubtitle(welcomeAudio.subtitle || '');
            setWelcomeAudioFileUrl(welcomeAudio.fileUrl || '');
          }
        }
        
        // Monthly Activity Section
        if (bookClub.sections?.monthlyActivitySection) {
          setMonthlyActivityTitle(bookClub.sections.monthlyActivitySection.title || '');
          setMonthlyActivitySubtitle(bookClub.sections.monthlyActivitySection.subtitle || '');
          setMonthlyActivityFileUrl(bookClub.sections.monthlyActivitySection.fileUrl || '');
          if (bookClub.sections.monthlyActivitySection.activity) {
            setActivityName(bookClub.sections.monthlyActivitySection.activity.name || '');
            setActivityDescription(bookClub.sections.monthlyActivitySection.activity.description || '');
          }
        }
        
        // Books
        if (bookClub.books && Array.isArray(bookClub.books)) {
          setBooks(bookClub.books);
        }
        
        // Timbiriche
        if (bookClub.timbiriche) {
          Object.keys(bookClub.timbiriche).forEach((squareKey) => {
            const squareNumber = parseInt(squareKey.replace('square', ''));
            if (squareNumber && bookClub.timbiriche[squareKey]) {
              updateSquare(squareNumber, bookClub.timbiriche[squareKey]);
            }
          });
        }
        
        // Next Releases
        if (bookClub.nextReleases) {
          setNextReleasesMonth(bookClub.nextReleases.month || '');
          setNextReleasesTheme(bookClub.nextReleases.theme || '');
          setNextReleasesDescription(bookClub.nextReleases.description || '');
        }
      }
    } catch (err) {
      // Si es 404, el book club no existe para ese mes
      setIsBookClubAvailable(false);
      
      // Limpiar el store para evitar mostrar datos de meses anteriores
      const { reset } = useBookClubStore.getState();
      if (reset) {
        reset();
      }
      
      if (err.response?.status === 404) {
        setError(`No hay un Book Club asignado para el mes de ${month}`);
      } else {
        setError(err.message || 'Error al cargar el Book Club');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-cabin-bold text-gray-800 mb-2">
          Listado de Book Clubs
        </h1>
        <p className="text-gray-600 font-cabin-regular">
          Visualiza y gestiona todos los book clubs creados por mes
        </p>
      </div>

      {/* Cards de meses disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {availableMonths.map((monthOption) => {
          const isSelected = selectedMonth === monthOption.value;
          return (
            <button
              key={monthOption.value}
              onClick={() => setSelectedMonth(monthOption.value)}
              className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-200 text-left ${
                isSelected
                  ? 'ring-2 ring-amber-500 border-2 border-amber-500'
                  : 'hover:shadow-xl hover:scale-105'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${
                  isSelected ? 'bg-amber-100' : 'bg-gray-100'
                }`}>
                  <FiCalendar className={`w-6 h-6 ${
                    isSelected ? 'text-amber-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h3 className={`text-lg font-cabin-bold ${
                    isSelected ? 'text-amber-600' : 'text-gray-800'
                  }`}>
                    {monthOption.label}
                  </h3>
                  <p className="text-sm font-cabin-regular text-gray-500">
                    Ver Book Club
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Área de visualización del Book Club */}
      {selectedMonth && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm px-2 py-3 mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-cabin-bold text-gray-800">
              Book Club - {MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label}
            </h2>
            {isBookClubAvailable && !loading && (
              <div className="flex items-center space-x-3">
                {isEditing && (
                  <button
                    onClick={handleUpdateClick}
                    disabled={isSavingChanges || !hasUnsavedChanges}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors font-cabin-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSavingChanges ? (
                      <>
                        <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <FiEdit className="w-5 h-5 mr-2" />
                        Actualizar Book Club
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors font-cabin-medium ${
                    isEditing
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <FiX className="w-5 h-5 mr-2" />
                      Cancelar edición
                    </>
                  ) : (
                    <>
                      <FiEdit className="w-5 h-5 mr-2" />
                      Editar Book Club
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="w-8 h-8 text-amber-500 animate-spin mr-3" />
              <span className="text-gray-600 font-cabin-medium">Cargando Book Club...</span>
            </div>
          )}

          {error && !loading && !isBookClubAvailable && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="bg-gray-50 rounded-lg p-8 max-w-md w-full text-center">
                <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-cabin-bold text-gray-800 mb-2">
                  Book Club no disponible
                </h3>
                <p className="text-gray-600 font-cabin-regular mb-6">
                  No hay un Book Club asignado para el mes de{' '}
                  <span className="font-cabin-semibold">
                    {MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label}
                  </span>
                </p>
                <button
                  onClick={() => navigate(ROUTES.BOOK_CLUB_LECTORES_CREATE)}
                  className="inline-flex items-center justify-center px-6 py-3 bg-amber-500 text-white rounded-lg transition-colors font-cabin-medium hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  Crear Book Club
                </button>
              </div>
            </div>
          )}

          {isBookClubAvailable && bookClubData && !loading && (
            <div className="space-y-6">
              {/* Sección de Configuración Principal */}
              <MainConfigurationSection
                month={month}
                setMonth={setMonth}
                theme={theme}
                setTheme={setTheme}
                description={description}
                setDescription={setDescription}
                monthOptions={MONTH_OPTIONS}
                isLocked={!isEditing || sectionLocked['main-config']}
                onEdit={() => handleEditSection('main-config')}
                onSave={() => handleSectionSaved('main-config')}
                showEditButton={isEditing}
              />

              {/* Sección Hero Section */}
              <HeroSectionSection
                title={title}
                setTitle={setTitle}
                subtitle={subtitle}
                setSubtitle={setSubtitle}
                fileUrl={fileUrl}
                setFileUrl={setFileUrl}
                isLocked={!isEditing || sectionLocked['hero-section']}
                onEdit={() => handleEditSection('hero-section')}
                onSave={() => handleSectionSaved('hero-section')}
                showEditButton={isEditing}
              />

              {/* Sección Libros de la Membresía */}
              <BooksSection
                books={books}
                setBooks={setBooks}
                isLocked={!isEditing || sectionLocked['books']}
                onEdit={() => handleEditSection('books')}
                onSave={() => handleSectionSaved('books')}
                showEditButton={isEditing}
              />

              {/* Sección Audio de Bienvenida */}
              <WelcomeAudioSection
                welcomeAudioTitle={welcomeAudioTitle}
                setWelcomeAudioTitle={setWelcomeAudioTitle}
                welcomeAudioSubtitle={welcomeAudioSubtitle}
                setWelcomeAudioSubtitle={setWelcomeAudioSubtitle}
                welcomeAudioFileUrl={welcomeAudioFileUrl}
                setWelcomeAudioFileUrl={setWelcomeAudioFileUrl}
                isLocked={!isEditing || sectionLocked['welcome-audio']}
                onEdit={() => handleEditSection('welcome-audio')}
                onSave={() => handleSectionSaved('welcome-audio')}
                showEditButton={isEditing}
              />

              {/* Sección Actividad del Mes */}
              <CourseSectionsSection
                monthlyActivityTitle={monthlyActivityTitle}
                setMonthlyActivityTitle={setMonthlyActivityTitle}
                monthlyActivitySubtitle={monthlyActivitySubtitle}
                setMonthlyActivitySubtitle={setMonthlyActivitySubtitle}
                monthlyActivityFileUrl={monthlyActivityFileUrl}
                setMonthlyActivityFileUrl={setMonthlyActivityFileUrl}
                activityName={activityName}
                setActivityName={setActivityName}
                activityDescription={activityDescription}
                setActivityDescription={setActivityDescription}
                isLocked={!isEditing || sectionLocked['course-sections']}
                onEdit={() => handleEditSection('course-sections')}
                onSave={() => handleSectionSaved('course-sections')}
                showEditButton={isEditing}
              />

              {/* Sección Timbiriche */}
              <TimbiricheSection
                isLocked={!isEditing}
                onEdit={() => setIsEditing(true)}
                onSave={() => {}}
                showEditButton={isEditing}
              />

              {/* Sección Próximos Lanzamientos */}
              <NextReleasesSection
                month={nextReleasesMonth}
                setMonth={setNextReleasesMonth}
                theme={nextReleasesTheme}
                setTheme={setNextReleasesTheme}
                description={nextReleasesDescription}
                setDescription={setNextReleasesDescription}
                isLocked={!isEditing || sectionLocked['next-releases']}
                onEdit={() => handleEditSection('next-releases')}
                onSave={() => handleSectionSaved('next-releases')}
                showEditButton={isEditing}
              />

            </div>
          )}
        </div>
      )}

      {availableMonths.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 font-cabin-regular text-center">
            No hay meses disponibles para mostrar. Los meses disponibles son desde Septiembre hasta el mes actual.
          </p>
        </div>
      )}

      {/* Modal de confirmación para actualizar el Book Club */}
      <ConfirmationModal
        isOpen={showConfirmUpdateModal}
        title="¿Actualizar Book Club?"
        description="Se enviarán todos los cambios realizados en este Book Club al servidor. ¿Deseas continuar?"
        onCancel={() => setShowConfirmUpdateModal(false)}
        onAccept={async () => {
          setShowConfirmUpdateModal(false);
          await performUpdateBookClub();
        }}
        cancelText="Cancelar"
        acceptText="Sí, actualizar"
        type="warning"
      />
    </div>
  );
};

export default BookClubLectoresList;

