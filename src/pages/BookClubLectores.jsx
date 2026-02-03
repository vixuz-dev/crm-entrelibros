import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCode, FiCopy, FiCheck, FiSave } from 'react-icons/fi';
import { addBookClub } from '../api/bookClubApi';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import MainConfigurationSection from '../components/book-club/MainConfigurationSection';
import BooksSection from '../components/book-club/BooksSection';
import WelcomeAudioSection from '../components/book-club/WelcomeAudioSection';
import PracticalSheetSection from '../components/book-club/PracticalSheetSection';
import QuestionsForAnyBookSection from '../components/book-club/QuestionsForAnyBookSection';
import NextReleasesSection from '../components/book-club/NextReleasesSection';
import SectionStatusSidebar from '../components/book-club/SectionStatusSidebar';
import { MONTH_OPTIONS } from '../constants/bookClub';
import { useBookClubStore } from '../store/useBookClubStore';

const BookClubLectores = () => {
  const { adminInfo } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener estado y acciones del store
  const {
    month,
    theme,
    description,
    weeklyAudioTitle,
    weeklyAudioDescription,
    weeklyAudioFileUrl,
    practicalSheetTitle,
    practicalSheetDescription,
    practicalSheetFileUrl,
    questionsForAnyBookTitle,
    questionsForAnyBookDescription,
    questionsForAnyBookFileUrl,
    booksTheme,
    books,
    metadata,
    sections,
    nextReleasesMonth,
    nextReleasesTheme,
    nextReleasesDescription,
    setMonth,
    setTheme,
    setDescription,
    setWeeklyAudioTitle,
    setWeeklyAudioDescription,
    setWeeklyAudioFileUrl,
    setPracticalSheetTitle,
    setPracticalSheetDescription,
    setPracticalSheetFileUrl,
    setQuestionsForAnyBookTitle,
    setQuestionsForAnyBookDescription,
    setQuestionsForAnyBookFileUrl,
    setBooksTheme,
    addBook,
    removeBook,
    setBooks,
    setNextReleasesMonth,
    setNextReleasesTheme,
    setNextReleasesDescription,
    initializeWithAdmin,
    getFullConfiguration,
    reset
  } = useBookClubStore();

  // Estado para copiar al portapapeles
  const [copied, setCopied] = React.useState(false);
  
  const [isSavingBookClub, setIsSavingBookClub] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Estado para el modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Guardar estado inicial para comparar cambios
  const initialStateRef = useRef(null);
  const isInitialMount = useRef(true);

  const checkSectionHasData = useMemo(() => {
    return {
      'main-config': !!(month && month.length > 0 && theme && theme.trim() !== ''),
      'books': books && books.some(book => book && book.bookId && book.guideUrl && book.guideUrl.trim() !== ''),
      'weekly-audio': !!(weeklyAudioTitle && weeklyAudioTitle.trim() !== '') &&
                        !!(weeklyAudioDescription && weeklyAudioDescription.trim() !== '') &&
                        !!(weeklyAudioFileUrl && weeklyAudioFileUrl.trim() !== ''),
      'practical-sheet': !!(practicalSheetTitle && practicalSheetTitle.trim() !== '') &&
                        !!(practicalSheetDescription && practicalSheetDescription.trim() !== '') &&
                        !!(practicalSheetFileUrl && practicalSheetFileUrl.trim() !== ''),
      'questions-for-any-book': !!(questionsForAnyBookTitle && questionsForAnyBookTitle.trim() !== '') &&
                        !!(questionsForAnyBookDescription && questionsForAnyBookDescription.trim() !== '') &&
                        !!(questionsForAnyBookFileUrl && questionsForAnyBookFileUrl.trim() !== ''),
      'next-releases': !!(nextReleasesMonth && nextReleasesMonth.trim() !== '') &&
                       !!(nextReleasesTheme && nextReleasesTheme.trim() !== '') &&
                       !!(nextReleasesDescription && nextReleasesDescription.trim() !== '')
    };
  }, [month, theme, books, weeklyAudioTitle, weeklyAudioDescription, weeklyAudioFileUrl,
      practicalSheetTitle, practicalSheetDescription, practicalSheetFileUrl,
      questionsForAnyBookTitle, questionsForAnyBookDescription, questionsForAnyBookFileUrl,
      nextReleasesMonth, nextReleasesTheme, nextReleasesDescription]);

  // Estado de bloqueo/editando para cada sección
  // Hero Section siempre inicia bloqueada porque tiene valores por defecto
  const [sectionLocked, setSectionLocked] = useState(() => ({
    'main-config': false,
    'books': false,
    'weekly-audio': false,
    'practical-sheet': false,
    'questions-for-any-book': false,
    'next-releases': false
  }));
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      const timer = setTimeout(() => {
        setSectionLocked({ ...checkSectionHasData });
        setIsInitialized(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setSectionLocked(prev => {
        const updated = { ...prev };
        Object.keys(checkSectionHasData).forEach(key => {
          if (checkSectionHasData[key] && !prev[key]) {
            updated[key] = true;
          }
        });
        return updated;
      });
    }
  }, [checkSectionHasData, isInitialized]);

  // Función para bloquear una sección después de guardar
  const handleSectionSaved = (sectionId) => {
    setSectionLocked(prev => ({
      ...prev,
      [sectionId]: true
    }));
  };

  // Función para desbloquear una sección para editar
  const handleEditSection = (sectionId) => {
    setSectionLocked(prev => ({
      ...prev,
      [sectionId]: false
    }));
  };

  // Manejar confirmación de salir
  const handleConfirmExit = () => {
    isNavigatingAwayRef.current = true;
    
    reset();
    
    if (adminInfo) {
      initializeWithAdmin(adminInfo);
    }

    setTimeout(() => {
      initialStateRef.current = {
        month: ['Enero'],
        theme: '',
        description: '',
        title: 'Book Club',
        subtitle: 'Lectores',
        fileUrl: 'https://el-book-club.s3.mx-central-1.amazonaws.com/book-club-lectores/assets/heroSectionBg.jpg',
        weeklyAudioTitle: '',
        weeklyAudioDescription: '',
        weeklyAudioFileUrl: '',
        books: [
          { order: 1, bookId: null, ownerDescription: '' },
          { order: 2, bookId: null, ownerDescription: '' },
          { order: 3, bookId: null, ownerDescription: '' },
          { order: 4, bookId: null, ownerDescription: '' }
        ],
        nextReleasesMonth: '',
        nextReleasesTheme: '',
        nextReleasesDescription: '',
        childrenSectionStories: [],
        timbiriche: {
          square1: null,
          square2: null,
          square3: null,
          square4: null,
          square5: null,
          square6: null,
          square7: null,
          square8: null,
          square9: null,
          square10: null
        }
      };
    }, 100);

    // Navegar si hay una navegación pendiente
    if (pendingNavigation) {
      navigate(pendingNavigation.to, pendingNavigation.options);
      setPendingNavigation(null);
    } else {
      // Si no hay navegación pendiente, navegar a la ruta anterior o al panel
      const targetPath = prevLocationRef.current.includes('/book-club-lectores') 
        ? '/panel' 
        : prevLocationRef.current;
      navigate(targetPath);
    }

    setShowConfirmModal(false);
  };

  // Manejar cancelar salir
  const handleCancelExit = () => {
    setShowConfirmModal(false);
    setPendingNavigation(null);
  };

          // Generar el JSON completo con todas las secciones
          const fullConfigurationJSON = useMemo(() => {
            const config = getFullConfiguration();
            return JSON.stringify(config, null, 2);
          }, [metadata, sections, books, nextReleasesMonth, nextReleasesTheme, nextReleasesDescription, getFullConfiguration]);

  // Función para copiar al portapapeles
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullConfigurationJSON);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };

  // Función para guardar el book club completo
  const handleSaveBookClub = async () => {
    try {
      setIsSavingBookClub(true);
      
      // Asegurarse de que todos los objetos estén actualizados antes de obtener la configuración
      // Esto garantiza que metadata, heroSection y sections tengan los valores más recientes
      const store = useBookClubStore.getState();
      if (store.updateMetadata) store.updateMetadata();
      if (store.updateWeeklyAudioSection) store.updateWeeklyAudioSection();
      if (store.updatePracticalSheetSection) store.updatePracticalSheetSection();
      if (store.updateMonthlyActivitySection) store.updateMonthlyActivitySection();
      
      // Obtener la configuración completa después de actualizar
      const bookClubObject = getFullConfiguration();
      
      await addBookClub(bookClubObject);
      
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 2000);
      
      initialStateRef.current = {
        month: [...(month || [])],
        theme: theme || '',
        description: description || '',
        weeklyAudioTitle: weeklyAudioTitle || '',
        weeklyAudioDescription: weeklyAudioDescription || '',
        weeklyAudioFileUrl: weeklyAudioFileUrl || '',
        practicalSheetTitle: practicalSheetTitle || '',
        practicalSheetDescription: practicalSheetDescription || '',
        practicalSheetFileUrl: practicalSheetFileUrl || '',
        questionsForAnyBookTitle: questionsForAnyBookTitle || '',
        questionsForAnyBookDescription: questionsForAnyBookDescription || '',
        questionsForAnyBookFileUrl: questionsForAnyBookFileUrl || '',
        books: JSON.parse(JSON.stringify(books || [])),
        nextReleasesMonth: nextReleasesMonth || '',
        nextReleasesTheme: nextReleasesTheme || '',
        nextReleasesDescription: nextReleasesDescription || ''
      };
      
    } catch (error) {
      console.error('Error al guardar book club:', error);
    } finally {
      setIsSavingBookClub(false);
    }
  };

  useEffect(() => {
    setSectionLocked({
      'main-config': false,
      'books': false,
      'weekly-audio': false,
      'practical-sheet': false,
      'questions-for-any-book': false,
      'next-releases': false
    });
    setIsInitialized(false);
    
    reset();
    
    if (adminInfo) {
      initializeWithAdmin(adminInfo);
    }
  }, []);

  // Guardar estado inicial después de la inicialización
  useEffect(() => {
    if (isInitialMount.current) {
      // Guardar el estado inicial después de que todo esté inicializado
      setTimeout(() => {
        initialStateRef.current = {
          month: [...(month || [])],
          theme: theme || '',
          description: description || '',
          weeklyAudioTitle: weeklyAudioTitle || '',
          weeklyAudioDescription: weeklyAudioDescription || '',
          weeklyAudioFileUrl: weeklyAudioFileUrl || '',
practicalSheetTitle: practicalSheetTitle || '',
        practicalSheetDescription: practicalSheetDescription || '',
        practicalSheetFileUrl: practicalSheetFileUrl || '',
        questionsForAnyBookTitle: questionsForAnyBookTitle || '',
        questionsForAnyBookDescription: questionsForAnyBookDescription || '',
        questionsForAnyBookFileUrl: questionsForAnyBookFileUrl || '',
        books: JSON.parse(JSON.stringify(books || [])),
        nextReleasesMonth: nextReleasesMonth || '',
          nextReleasesTheme: nextReleasesTheme || '',
          nextReleasesDescription: nextReleasesDescription || ''
        };
        isInitialMount.current = false;
      }, 200);
    }
  }, [month, theme, description, weeklyAudioTitle, weeklyAudioDescription, weeklyAudioFileUrl,
      practicalSheetTitle, practicalSheetDescription, practicalSheetFileUrl,
      questionsForAnyBookTitle, questionsForAnyBookDescription, questionsForAnyBookFileUrl,
      books, nextReleasesMonth, nextReleasesTheme, nextReleasesDescription]);

  // Función para detectar si hay cambios sin guardar
  const hasUnsavedChanges = useMemo(() => {
    if (!initialStateRef.current) return false;

    const current = {
      month: [...(month || [])],
      theme: theme || '',
      description: description || '',
      weeklyAudioTitle: weeklyAudioTitle || '',
      weeklyAudioDescription: weeklyAudioDescription || '',
      weeklyAudioFileUrl: weeklyAudioFileUrl || '',
practicalSheetTitle: practicalSheetTitle || '',
        practicalSheetDescription: practicalSheetDescription || '',
        practicalSheetFileUrl: practicalSheetFileUrl || '',
        questionsForAnyBookTitle: questionsForAnyBookTitle || '',
      questionsForAnyBookDescription: questionsForAnyBookDescription || '',
      questionsForAnyBookFileUrl: questionsForAnyBookFileUrl || '',
      books: JSON.parse(JSON.stringify(books || [])),
      nextReleasesMonth: nextReleasesMonth || '',
      nextReleasesTheme: nextReleasesTheme || '',
      nextReleasesDescription: nextReleasesDescription || ''
    };

    const initial = initialStateRef.current;

    return (
      JSON.stringify(current.month) !== JSON.stringify(initial.month) ||
      current.theme !== initial.theme ||
      current.description !== initial.description ||
      current.weeklyAudioTitle !== initial.weeklyAudioTitle ||
      current.weeklyAudioDescription !== initial.weeklyAudioDescription ||
      current.weeklyAudioFileUrl !== initial.weeklyAudioFileUrl ||
      current.practicalSheetTitle !== initial.practicalSheetTitle ||
      current.practicalSheetDescription !== initial.practicalSheetDescription ||
      current.practicalSheetFileUrl !== initial.practicalSheetFileUrl ||
      current.questionsForAnyBookTitle !== initial.questionsForAnyBookTitle ||
      current.questionsForAnyBookDescription !== initial.questionsForAnyBookDescription ||
      current.questionsForAnyBookFileUrl !== initial.questionsForAnyBookFileUrl ||
      JSON.stringify(current.books) !== JSON.stringify(initial.books) ||
      current.nextReleasesMonth !== initial.nextReleasesMonth ||
      current.nextReleasesTheme !== initial.nextReleasesTheme ||
      current.nextReleasesDescription !== initial.nextReleasesDescription
    );
  }, [month, theme, description, weeklyAudioTitle, weeklyAudioDescription, weeklyAudioFileUrl,
      practicalSheetTitle, practicalSheetDescription, practicalSheetFileUrl,
      questionsForAnyBookTitle, questionsForAnyBookDescription, questionsForAnyBookFileUrl,
      books, nextReleasesMonth, nextReleasesTheme, nextReleasesDescription]);

  // Interceptar navegación cuando hay cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Interceptar cambios de ruta usando location change
  const prevLocationRef = useRef(location.pathname);
  const isNavigatingAwayRef = useRef(false);
  
  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevLocationRef.current;
    
    // Verificar si estamos saliendo de la página del book club
    const isBookClubPage = currentPath.includes('/book-club-lectores');
    const wasBookClubPage = prevPath.includes('/book-club-lectores');
    
    // Si estamos saliendo de la página del book club y hay cambios sin guardar
    if (wasBookClubPage && !isBookClubPage && hasUnsavedChanges && !isNavigatingAwayRef.current) {
      // Revertir la navegación
      navigate(prevPath, { replace: true });
      setShowConfirmModal(true);
      return;
    }
    
    prevLocationRef.current = currentPath;
    isNavigatingAwayRef.current = false;
  }, [location.pathname, hasUnsavedChanges, navigate]);

  return (
    <div className="space-y-6">
      {/* Layout de dos columnas */}
      <div className="flex gap-6 items-start">
        {/* Columna principal con las secciones */}
        <div className="flex-1 space-y-6">
          <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white rounded-xl shadow-lg transition-all duration-300 border-b-2 border-transparent hover:border-amber-200">
            <div>
              <h1 className="text-3xl font-cabin-bold text-gray-900 mb-2">
                Book Club Lectores
              </h1>
              <p className="text-gray-700 font-cabin-regular">
                Gestión del contenido del Book Club Lectores
              </p>
            </div>
            <button
              onClick={handleSaveBookClub}
              disabled={isSavingBookClub}
              aria-label="Guardar Book Club completo"
              className={`px-6 py-3 rounded-lg transition-all duration-200 font-cabin-medium flex items-center space-x-2 transform ${
                showSuccessAnimation
                  ? 'bg-green-500 text-white scale-105 shadow-lg'
                  : isSavingBookClub
                    ? 'bg-primary-600 text-white opacity-75 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:scale-105 active:scale-95'
              }`}
            >
              {showSuccessAnimation ? (
                <>
                  <FiCheck className="w-5 h-5" />
                  <span>¡Guardado!</span>
                </>
              ) : isSavingBookClub ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  <span>Guardar Book Club</span>
                </>
              )}
            </button>
          </div>
          {/* Sección de Configuración Principal */}
          <div id="section-main-config">
            <MainConfigurationSection
            month={month}
            setMonth={setMonth}
            theme={theme}
            setTheme={setTheme}
            description={description}
            setDescription={setDescription}
            monthOptions={MONTH_OPTIONS}
            isLocked={sectionLocked['main-config']}
            onEdit={() => handleEditSection('main-config')}
            onSave={() => handleSectionSaved('main-config')}
          />
          </div>

          <div id="section-books">
            <BooksSection
            books={books}
            setBooks={setBooks}
            booksTheme={booksTheme}
            setBooksTheme={setBooksTheme}
            isLocked={sectionLocked['books']}
            onEdit={() => handleEditSection('books')}
            onSave={() => handleSectionSaved('books')}
          />
          </div>

          {/* Audio del mes + Ficha práctica en una misma línea */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div id="section-weekly-audio">
              <WelcomeAudioSection
                weeklyAudioTitle={weeklyAudioTitle}
                setWeeklyAudioTitle={setWeeklyAudioTitle}
                weeklyAudioDescription={weeklyAudioDescription}
                setWeeklyAudioDescription={setWeeklyAudioDescription}
                weeklyAudioFileUrl={weeklyAudioFileUrl}
                setWeeklyAudioFileUrl={setWeeklyAudioFileUrl}
                isLocked={sectionLocked['weekly-audio']}
                onEdit={() => handleEditSection('weekly-audio')}
                onSave={() => handleSectionSaved('weekly-audio')}
              />
            </div>
            <div id="section-practical-sheet">
              <PracticalSheetSection
                practicalSheetTitle={practicalSheetTitle}
                setPracticalSheetTitle={setPracticalSheetTitle}
                practicalSheetDescription={practicalSheetDescription}
                setPracticalSheetDescription={setPracticalSheetDescription}
                practicalSheetFileUrl={practicalSheetFileUrl}
                setPracticalSheetFileUrl={setPracticalSheetFileUrl}
                isLocked={sectionLocked['practical-sheet']}
                onEdit={() => handleEditSection('practical-sheet')}
                onSave={() => handleSectionSaved('practical-sheet')}
              />
            </div>
          </div>

          <div id="section-questions-for-any-book">
            <QuestionsForAnyBookSection
              questionsForAnyBookTitle={questionsForAnyBookTitle}
              setQuestionsForAnyBookTitle={setQuestionsForAnyBookTitle}
              questionsForAnyBookDescription={questionsForAnyBookDescription}
              setQuestionsForAnyBookDescription={setQuestionsForAnyBookDescription}
              questionsForAnyBookFileUrl={questionsForAnyBookFileUrl}
              setQuestionsForAnyBookFileUrl={setQuestionsForAnyBookFileUrl}
              isLocked={sectionLocked['questions-for-any-book']}
              onEdit={() => handleEditSection('questions-for-any-book')}
              onSave={() => handleSectionSaved('questions-for-any-book')}
            />
          </div>

          <div id="section-next-releases">
            <NextReleasesSection
            month={nextReleasesMonth}
            setMonth={setNextReleasesMonth}
            theme={nextReleasesTheme}
            setTheme={setNextReleasesTheme}
            description={nextReleasesDescription}
            setDescription={setNextReleasesDescription}
            isLocked={sectionLocked['next-releases']}
            onEdit={() => handleEditSection('next-releases')}
            onSave={() => handleSectionSaved('next-releases')}
            showEditButton={true}
          />
          </div>
        </div>

        {/* Sidebar de estado de secciones */}
        <SectionStatusSidebar
          sectionStatuses={checkSectionHasData}
        />
      </div>

      {/* Modal de confirmación para salir con cambios sin guardar */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="¿Descartar cambios?"
        description="Tienes cambios sin guardar en el Book Club. Si sales, perderás todos los datos que has ingresado. ¿Estás seguro de que quieres continuar?"
        onCancel={handleCancelExit}
        onAccept={handleConfirmExit}
        cancelText="Cancelar"
        acceptText="Sí, descartar cambios"
        type="warning"
      />
    </div>
  );
};

export default BookClubLectores;

