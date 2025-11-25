import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiBook, FiLoader, FiPlus, FiEdit, FiX } from 'react-icons/fi';
import { MONTH_OPTIONS } from '../constants/bookClub';
import { getBookClub } from '../api/bookClubApi';
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

const BookClubLectoresList = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [bookClubData, setBookClubData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBookClubAvailable, setIsBookClubAvailable] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
    updateSquare
  } = useBookClubStore();

  // Función para obtener el índice del mes actual
  const getCurrentMonthIndex = () => {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth(); // 0-11 (Enero = 0, Diciembre = 11)
    return currentMonthIndex;
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
        
        // Si el Book Club está disponible, poblar los datos
        setIsBookClubAvailable(true);
        setBookClubData(response);
        
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-cabin-bold text-gray-800">
              Book Club - {MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label}
            </h2>
            {isBookClubAvailable && !loading && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors font-cabin-medium ${
                  isEditing
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
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
                    Editar contenido
                  </>
                )}
              </button>
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
                isLocked={!isEditing}
                onEdit={() => setIsEditing(true)}
                onSave={() => setIsEditing(false)}
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
                isLocked={!isEditing}
                onEdit={() => setIsEditing(true)}
                onSave={() => setIsEditing(false)}
                showEditButton={isEditing}
              />

              {/* Sección Libros de la Membresía */}
              <BooksSection
                books={books}
                setBooks={setBooks}
                isLocked={!isEditing}
                onEdit={() => setIsEditing(true)}
                onSave={() => setIsEditing(false)}
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
                isLocked={!isEditing}
                onEdit={() => setIsEditing(true)}
                onSave={() => setIsEditing(false)}
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
                isLocked={!isEditing}
                onEdit={() => setIsEditing(true)}
                onSave={() => setIsEditing(false)}
                showEditButton={isEditing}
              />

              {/* Sección Timbiriche */}
              <TimbiricheSection
                isLocked={!isEditing}
                onEdit={() => setIsEditing(true)}
                onSave={() => setIsEditing(false)}
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
                isLocked={!isEditing}
                onEdit={() => setIsEditing(true)}
                onSave={() => setIsEditing(false)}
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
    </div>
  );
};

export default BookClubLectoresList;

