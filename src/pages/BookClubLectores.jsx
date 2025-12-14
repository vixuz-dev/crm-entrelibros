import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCode, FiCopy, FiCheck, FiSave } from 'react-icons/fi';
import { saveBookClubFile, addBookClub } from '../api/bookClubApi';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import MainConfigurationSection from '../components/book-club/MainConfigurationSection';
import HeroSectionSection from '../components/book-club/HeroSectionSection';
import BooksSection from '../components/book-club/BooksSection';
import WelcomeAudioSection from '../components/book-club/WelcomeAudioSection';
import CourseSectionsSection from '../components/book-club/CourseSectionsSection';
import TimbiricheSection from '../components/book-club/TimbiricheSection';
import NextReleasesSection from '../components/book-club/NextReleasesSection';
import ChildrenSection from '../components/book-club/ChildrenSection';
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
    metadata,
    heroSection,
    sections,
    timbiriche,
    nextReleasesMonth,
    nextReleasesTheme,
    nextReleasesDescription,
    childrenSectionStories,
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
    addBook,
    removeBook,
    setBooks,
    setNextReleasesMonth,
    setNextReleasesTheme,
    setNextReleasesDescription,
    addChildrenSectionStory,
    updateChildrenSectionStory,
    removeChildrenSectionStory,
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

  // Valores por defecto para Hero Section
  const DEFAULT_TITLE = 'Book Club';
  const DEFAULT_SUBTITLE = 'Lectores';
  const DEFAULT_FILE_URL = 'https://el-book-club.s3.mx-central-1.amazonaws.com/book-club-lectores/assets/heroSectionBg.jpg';

  // Función para verificar si una sección tiene datos configurados
  const checkSectionHasData = useMemo(() => {
    // Hero Section siempre está "guardada" porque tiene valores por defecto
    // Se considera guardada si tiene título, subtítulo y fileUrl (ya sean los defaults o valores personalizados)
    const heroSectionHasData = !!(title && title.trim() !== '') && 
                               !!(subtitle && subtitle.trim() !== '') && 
                               !!(fileUrl && fileUrl.trim() !== '');

    return {
      'main-config': !!(month && month.length > 0 && theme && theme.trim() !== ''),
      'hero-section': heroSectionHasData, // Siempre true si tiene los valores (defaults o personalizados)
      'books': books && books.some(book => book && book.bookId && book.ownerDescription && book.ownerDescription.trim() !== ''),
      'welcome-audio': !!(welcomeAudioSubtitle && welcomeAudioSubtitle.trim() !== '' && welcomeAudioFileUrl && welcomeAudioFileUrl.trim() !== ''),
      'course-sections': !!(monthlyActivityTitle && monthlyActivityTitle.trim() !== '') &&
                         !!(monthlyActivitySubtitle && monthlyActivitySubtitle.trim() !== '') &&
                         !!(monthlyActivityFileUrl && monthlyActivityFileUrl.trim() !== '') &&
                         !!(activityName && activityName.trim() !== '') &&
                         !!(activityDescription && activityDescription.trim() !== ''),
      'next-releases': !!(nextReleasesMonth && nextReleasesMonth.trim() !== '') &&
                       !!(nextReleasesTheme && nextReleasesTheme.trim() !== '') &&
                       !!(nextReleasesDescription && nextReleasesDescription.trim() !== ''),
      'children-section': childrenSectionStories && childrenSectionStories.length > 0 &&
                         childrenSectionStories.some(story => 
                           story.title && story.title.trim() !== '' && 
                           story.videoUrl && story.videoUrl.trim() !== ''
                         )
    };
  }, [month, theme, title, subtitle, fileUrl, books, welcomeAudioSubtitle, welcomeAudioFileUrl, 
      monthlyActivityTitle, monthlyActivitySubtitle, monthlyActivityFileUrl, activityName, activityDescription,
      nextReleasesMonth, nextReleasesTheme, nextReleasesDescription,
      childrenSectionStories]);

  // Estado de bloqueo/editando para cada sección
  // Hero Section siempre inicia bloqueada porque tiene valores por defecto
  const [sectionLocked, setSectionLocked] = useState(() => {
    // Inicializar con hero-section bloqueada por defecto (tiene valores por defecto)
    return {
      'main-config': false,
      'hero-section': true, // Siempre bloqueada desde el inicio (valores por defecto)
      'books': false,
      'welcome-audio': false,
      'course-sections': false,
      'next-releases': false,
      'children-section': false
    };
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      const timer = setTimeout(() => {
        const hasData = { ...checkSectionHasData };
        hasData['hero-section'] = true;
        setSectionLocked(hasData);
        setIsInitialized(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      const hasData = { ...checkSectionHasData };
      hasData['hero-section'] = true;
      setSectionLocked(prev => {
        const updated = { ...prev };
        Object.keys(hasData).forEach(key => {
          if (hasData[key] && !prev[key]) {
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
        welcomeAudioTitle: '',
        welcomeAudioSubtitle: '',
        welcomeAudioFileUrl: '',
        monthlyActivityTitle: '',
        monthlyActivitySubtitle: '',
        monthlyActivityFileUrl: '',
        activityName: '',
        activityDescription: '',
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
          }, [metadata, heroSection, sections, books, timbiriche, nextReleasesMonth, nextReleasesTheme, nextReleasesDescription, getFullConfiguration, childrenSectionStories]);

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
      if (store.updateHeroSection) store.updateHeroSection();
      if (store.updateWelcomeAudioSection) store.updateWelcomeAudioSection();
      if (store.updateMonthlyActivitySection) store.updateMonthlyActivitySection();
      if (store.updateChildrenSection) store.updateChildrenSection();
      
      // Obtener la configuración completa después de actualizar
      const bookClubObject = getFullConfiguration();
      
      await addBookClub(bookClubObject);
      
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 2000);
      
      initialStateRef.current = {
        month: [...(month || [])],
        theme: theme || '',
        description: description || '',
        title: title || 'Book Club',
        subtitle: subtitle || 'Lectores',
        fileUrl: fileUrl || 'https://el-book-club.s3.mx-central-1.amazonaws.com/book-club-lectores/assets/heroSectionBg.jpg',
        welcomeAudioTitle: welcomeAudioTitle || '',
        welcomeAudioSubtitle: welcomeAudioSubtitle || '',
        welcomeAudioFileUrl: welcomeAudioFileUrl || '',
        monthlyActivityTitle: monthlyActivityTitle || '',
        monthlyActivitySubtitle: monthlyActivitySubtitle || '',
        monthlyActivityFileUrl: monthlyActivityFileUrl || '',
        activityName: activityName || '',
        activityDescription: activityDescription || '',
        books: JSON.parse(JSON.stringify(books || [])),
        nextReleasesMonth: nextReleasesMonth || '',
        nextReleasesTheme: nextReleasesTheme || '',
        nextReleasesDescription: nextReleasesDescription || '',
        childrenSectionStories: JSON.parse(JSON.stringify(childrenSectionStories || [])),
        timbiriche: JSON.parse(JSON.stringify(timbiriche || {}))
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
      'hero-section': true,
      'books': false,
      'welcome-audio': false,
      'course-sections': false,
      'next-releases': false,
      'children-section': false
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
          title: title || 'Book Club',
          subtitle: subtitle || 'Lectores',
          fileUrl: fileUrl || 'https://el-book-club.s3.mx-central-1.amazonaws.com/book-club-lectores/assets/heroSectionBg.jpg',
          welcomeAudioTitle: welcomeAudioTitle || '',
          welcomeAudioSubtitle: welcomeAudioSubtitle || '',
          welcomeAudioFileUrl: welcomeAudioFileUrl || '',
          monthlyActivityTitle: monthlyActivityTitle || '',
          monthlyActivitySubtitle: monthlyActivitySubtitle || '',
          monthlyActivityFileUrl: monthlyActivityFileUrl || '',
          activityName: activityName || '',
          activityDescription: activityDescription || '',
          books: JSON.parse(JSON.stringify(books || [])),
          nextReleasesMonth: nextReleasesMonth || '',
          nextReleasesTheme: nextReleasesTheme || '',
          nextReleasesDescription: nextReleasesDescription || '',
          timbiriche: JSON.parse(JSON.stringify(timbiriche || {}))
        };
        isInitialMount.current = false;
      }, 200); // Aumentar el timeout para dar tiempo al reset
    }
  }, [month, theme, description, title, subtitle, fileUrl, welcomeAudioTitle, welcomeAudioSubtitle, welcomeAudioFileUrl,
      monthlyActivityTitle, monthlyActivitySubtitle, monthlyActivityFileUrl, activityName, activityDescription,
      books, nextReleasesMonth, nextReleasesTheme, nextReleasesDescription, timbiriche]);

  // Función para detectar si hay cambios sin guardar
  const hasUnsavedChanges = useMemo(() => {
    if (!initialStateRef.current) return false;

    const current = {
      month: [...(month || [])],
      theme: theme || '',
      description: description || '',
      title: title || 'Book Club',
      subtitle: subtitle || 'Lectores',
      fileUrl: fileUrl || 'https://el-book-club.s3.mx-central-1.amazonaws.com/book-club-lectores/assets/heroSectionBg.jpg',
      welcomeAudioTitle: welcomeAudioTitle || '',
      welcomeAudioSubtitle: welcomeAudioSubtitle || '',
      welcomeAudioFileUrl: welcomeAudioFileUrl || '',
      monthlyActivityTitle: monthlyActivityTitle || '',
      monthlyActivitySubtitle: monthlyActivitySubtitle || '',
      monthlyActivityFileUrl: monthlyActivityFileUrl || '',
      activityName: activityName || '',
      activityDescription: activityDescription || '',
      books: JSON.parse(JSON.stringify(books || [])),
      nextReleasesMonth: nextReleasesMonth || '',
      nextReleasesTheme: nextReleasesTheme || '',
      nextReleasesDescription: nextReleasesDescription || '',
      timbiriche: JSON.parse(JSON.stringify(timbiriche || {}))
    };

    const initial = initialStateRef.current;

    // Comparar cada campo
    return (
      JSON.stringify(current.month) !== JSON.stringify(initial.month) ||
      current.theme !== initial.theme ||
      current.description !== initial.description ||
      current.title !== initial.title ||
      current.subtitle !== initial.subtitle ||
      current.fileUrl !== initial.fileUrl ||
      current.welcomeAudioTitle !== initial.welcomeAudioTitle ||
      current.welcomeAudioSubtitle !== initial.welcomeAudioSubtitle ||
      current.welcomeAudioFileUrl !== initial.welcomeAudioFileUrl ||
      current.monthlyActivityTitle !== initial.monthlyActivityTitle ||
      current.monthlyActivitySubtitle !== initial.monthlyActivitySubtitle ||
      current.monthlyActivityFileUrl !== initial.monthlyActivityFileUrl ||
      current.activityName !== initial.activityName ||
      current.activityDescription !== initial.activityDescription ||
      JSON.stringify(current.books) !== JSON.stringify(initial.books) ||
      current.nextReleasesMonth !== initial.nextReleasesMonth ||
      current.nextReleasesTheme !== initial.nextReleasesTheme ||
      current.nextReleasesDescription !== initial.nextReleasesDescription ||
      JSON.stringify(current.childrenSectionStories) !== JSON.stringify(initial.childrenSectionStories) ||
      JSON.stringify(current.timbiriche) !== JSON.stringify(initial.timbiriche)
    );
  }, [month, theme, description, title, subtitle, fileUrl, welcomeAudioTitle, welcomeAudioSubtitle, welcomeAudioFileUrl,
      monthlyActivityTitle, monthlyActivitySubtitle, monthlyActivityFileUrl, activityName, activityDescription,
      books, nextReleasesMonth, nextReleasesTheme, nextReleasesDescription, 
      childrenSectionStories,
      timbiriche]);

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

  // Manejar selección de archivo y subir automáticamente a S3
  const handleFileSelect = async (file, base64Image) => {
    if (!file || !base64Image) {
      setFileUrl('');
      return;
    }

    try {
      // Obtener la extensión del archivo
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      // Subir el archivo al endpoint
      const response = await saveBookClubFile(fileExtension, base64Image);
      
      // Si la respuesta es exitosa, obtener la URL del archivo
      if (response.status === true && response.file_url) {
        setFileUrl(response.file_url);
      } else {
        console.error('Error: No se recibió URL del servidor', response);
        // En caso de que no haya URL, mantener el base64 como fallback
        setFileUrl(base64Image);
      }
    } catch (error) {
      console.error('Error al subir archivo:', error);
      // En caso de error, mantener el base64 como fallback
      setFileUrl(base64Image);
    }
  };


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
                    ? 'bg-amber-500 text-white opacity-75 cursor-not-allowed'
                    : 'bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg hover:scale-105 active:scale-95'
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

          {/* Sección Hero Section */}
          <div id="section-hero-section">
            <HeroSectionSection
            title={title}
            setTitle={setTitle}
            subtitle={subtitle}
            setSubtitle={setSubtitle}
            fileUrl={fileUrl}
            setFileUrl={setFileUrl}
            isLocked={sectionLocked['hero-section']}
            onEdit={() => handleEditSection('hero-section')}
            onSave={() => handleSectionSaved('hero-section')}
          />
          </div>

          {/* Sección Libros de la Membresía */}
          <div id="section-books">
            <BooksSection
            books={books}
            setBooks={setBooks}
            isLocked={sectionLocked['books']}
            onEdit={() => handleEditSection('books')}
            onSave={() => handleSectionSaved('books')}
          />
          </div>

          {/* Sección para niños */}
          <div id="section-children-section">
            <ChildrenSection
            childrenSectionStories={childrenSectionStories}
            addChildrenSectionStory={addChildrenSectionStory}
            updateChildrenSectionStory={updateChildrenSectionStory}
            removeChildrenSectionStory={removeChildrenSectionStory}
            isLocked={sectionLocked['children-section']}
            onEdit={() => handleEditSection('children-section')}
            onSave={() => handleSectionSaved('children-section')}
          />
          </div>

          {/* Sección Audio de Bienvenida */}
          <div id="section-welcome-audio">
            <WelcomeAudioSection
            welcomeAudioTitle={welcomeAudioTitle}
            setWelcomeAudioTitle={setWelcomeAudioTitle}
            welcomeAudioSubtitle={welcomeAudioSubtitle}
            setWelcomeAudioSubtitle={setWelcomeAudioSubtitle}
            welcomeAudioFileUrl={welcomeAudioFileUrl}
            setWelcomeAudioFileUrl={setWelcomeAudioFileUrl}
            isLocked={sectionLocked['welcome-audio']}
            onEdit={() => handleEditSection('welcome-audio')}
            onSave={() => handleSectionSaved('welcome-audio')}
          />
          </div>

          {/* Sección Course Sections */}
          <div id="section-course-sections">
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
            isLocked={sectionLocked['course-sections']}
            onEdit={() => handleEditSection('course-sections')}
            onSave={() => handleSectionSaved('course-sections')}
          />
          </div>

          {/* Sección Timbiriche */}
          <div id="section-timbiriche">
            <TimbiricheSection />
          </div>

          {/* Sección Next Releases */}
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

