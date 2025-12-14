import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store de Zustand para manejar la configuración del Book Club Lectores
 * Persistente para mantener el estado durante toda la configuración
 */
export const useBookClubStore = create(
  persist(
    (set, get) => ({
      // Estados para inputs del usuario - Metadata
      month: ['Enero'], // Temporal: Enero por defecto
      theme: '',
      description: '',

      // Estados para inputs del usuario - Hero Section
      // Valores por defecto
      title: 'Book Club',
      subtitle: 'Lectores',
      fileUrl: 'https://el-book-club.s3.mx-central-1.amazonaws.com/book-club-lectores/assets/heroSectionBg.jpg',

      welcomeAudioTitle: 'Audio de bienvenida',
      welcomeAudioSubtitle: '',
      welcomeAudioFileUrl: '',

      monthlyActivityTitle: 'Actividad del mes',
      monthlyActivitySubtitle: '',
      monthlyActivityFileUrl: '',
      activityName: '',
      activityDescription: '',

      // Estados para libros (siempre 4)
      books: [
        { order: 1, bookId: null, ownerDescription: '' },
        { order: 2, bookId: null, ownerDescription: '' },
        { order: 3, bookId: null, ownerDescription: '' },
        { order: 4, bookId: null, ownerDescription: '' }
      ],

      // Estados para Timbiriche (10 squares)
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
      },

      // Estados para Next Releases
      nextReleasesMonth: '',
      nextReleasesTheme: '',
      nextReleasesDescription: '',

      // Estados para Children Section (Sección para niños) - Array de cuentos
      childrenSectionStories: [], // Array de objetos { id, title, thumbnail, videoUrl, description, category, author, publishedDate }

      // Objetos completos generados automáticamente
      metadata: {
        month: '',
        theme: '',
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
        description: '',
        createdBy: 'admin'
      },

      heroSection: {
        title: '',
        subtitle: '',
        fileUrl: '',
        fileType: 'image',
        sectionNumber: 1
      },

      sections: {
        welcomeAudioSection: {
          title: '',
          subtitle: '',
          fileUrl: '',
          fileType: 'video',
          sectionNumber: 2
        },
        monthlyActivitySection: {
          title: '',
          subtitle: '',
          fileUrl: '',
          fileType: 'pdf',
          sectionNumber: 3,
          activity: {
            name: '',
            description: ''
          }
        },
        childrenSection: null
      },

      // Acciones para Metadata
      setMonth: (month) => {
        set({ month });
        get().updateMetadata();
      },

      setTheme: (theme) => {
        set({ theme });
        get().updateMetadata();
      },

      setDescription: (description) => {
        set({ description });
        get().updateMetadata();
      },

      // Acciones para Hero Section
      setTitle: (title) => {
        set({ title });
        get().updateHeroSection();
      },

      setSubtitle: (subtitle) => {
        set({ subtitle });
        get().updateHeroSection();
      },

      setFileUrl: (fileUrl) => {
        set({ fileUrl });
        get().updateHeroSection();
      },

      // Acciones para Welcome Audio Section
      setWelcomeAudioTitle: (title) => {
        set({ welcomeAudioTitle: title });
        get().updateWelcomeAudioSection();
      },

      setWelcomeAudioSubtitle: (subtitle) => {
        set({ welcomeAudioSubtitle: subtitle });
        get().updateWelcomeAudioSection();
      },

      setWelcomeAudioFileUrl: (fileUrl) => {
        set({ welcomeAudioFileUrl: fileUrl });
        get().updateWelcomeAudioSection();
      },

      // Acciones para Monthly Activity Section
      setMonthlyActivityTitle: (title) => {
        set({ monthlyActivityTitle: title });
        get().updateMonthlyActivitySection();
      },

      setMonthlyActivitySubtitle: (subtitle) => {
        set({ monthlyActivitySubtitle: subtitle });
        get().updateMonthlyActivitySection();
      },

      setMonthlyActivityFileUrl: (fileUrl) => {
        set({ monthlyActivityFileUrl: fileUrl });
        get().updateMonthlyActivitySection();
      },

      setActivityName: (name) => {
        set({ activityName: name });
        get().updateMonthlyActivitySection();
      },

      setActivityDescription: (description) => {
        set({ activityDescription: description });
        get().updateMonthlyActivitySection();
      },

      // Acciones para Books
      addBook: (bookData) => {
        set((state) => {
          const newBooks = [...state.books];
          // Buscar si ya existe un libro con ese order y reemplazarlo, o agregar uno nuevo
          const existingIndex = newBooks.findIndex(book => book.order === bookData.order);
          if (existingIndex !== -1) {
            newBooks[existingIndex] = {
              order: bookData.order,
              bookId: bookData.bookId,
              ownerDescription: bookData.ownerDescription || ''
            };
          } else {
            // Buscar el primer slot vacío
            const emptyIndex = newBooks.findIndex(book => !book.bookId);
            if (emptyIndex !== -1) {
              newBooks[emptyIndex] = {
                order: bookData.order,
                bookId: bookData.bookId,
                ownerDescription: bookData.ownerDescription || ''
              };
            }
          }
          return { books: newBooks };
        });
      },

      removeBook: (bookId) => {
        set((state) => {
          const newBooks = state.books.map(book => {
            if (book.bookId === bookId) {
              return { order: book.order, bookId: null, ownerDescription: '' };
            }
            return book;
          });
          return { books: newBooks };
        });
      },

      setBooks: (booksArray) => {
        set({ books: booksArray });
      },

      setBook: (index, bookData) => {
        set((state) => {
          const newBooks = [...state.books];
          if (bookData === null) {
            newBooks[index] = { order: index + 1, bookId: null, ownerDescription: '' };
          } else {
            newBooks[index] = {
              order: index + 1,
              bookId: bookData.bookId,
              ownerDescription: bookData.ownerDescription || ''
            };
          }
          return { books: newBooks };
        });
      },

      setBookDescription: (index, description) => {
        set((state) => {
          const newBooks = [...state.books];
          if (newBooks[index]) {
            newBooks[index] = {
              ...newBooks[index],
              ownerDescription: description
            };
          }
          return { books: newBooks };
        });
      },

      // Función para actualizar metadata automáticamente
      updateMetadata: () => {
        const { month, theme, description, metadata } = get();
        const selectedMonth = month.length > 0 ? month[0] : '';
        const currentYear = new Date().getFullYear();
        const generatedDescription = selectedMonth && theme 
          ? `Configuración dinámica para Book Club Lectores - ${selectedMonth} ${currentYear}`
          : '';

        set({
          metadata: {
            month: selectedMonth,
            theme: theme,
            lastUpdated: new Date().toISOString(),
            version: '1.0.0',
            description: description || generatedDescription,
            createdBy: metadata.createdBy || 'admin'
          }
        });
      },

      // Función para actualizar heroSection automáticamente
      updateHeroSection: () => {
        const { title, subtitle, fileUrl } = get();
        // Usar valores por defecto si están vacíos
        const defaultTitle = 'Book Club';
        const defaultSubtitle = 'Lectores';
        const defaultFileUrl = 'https://el-book-club.s3.mx-central-1.amazonaws.com/book-club-lectores/assets/heroSectionBg.jpg';
        
        set({
          heroSection: {
            title: title || defaultTitle,
            subtitle: subtitle || defaultSubtitle,
            fileUrl: fileUrl || defaultFileUrl,
            fileType: 'image',
            sectionNumber: 1
          }
        });
      },

      // Función para actualizar welcomeAudioSection automáticamente
      updateWelcomeAudioSection: () => {
        const { welcomeAudioTitle, welcomeAudioSubtitle, welcomeAudioFileUrl } = get();
        set((state) => ({
          sections: {
            ...state.sections,
            welcomeAudioSection: {
              title: welcomeAudioTitle,
              subtitle: welcomeAudioSubtitle,
              fileUrl: welcomeAudioFileUrl,
              fileType: 'video',
              sectionNumber: 2
            }
          }
        }));
      },

      // Función para actualizar monthlyActivitySection automáticamente
      updateMonthlyActivitySection: () => {
        const { monthlyActivityTitle, monthlyActivitySubtitle, monthlyActivityFileUrl, activityName, activityDescription } = get();
        set((state) => ({
          sections: {
            ...state.sections,
            monthlyActivitySection: {
              title: monthlyActivityTitle,
              subtitle: monthlyActivitySubtitle,
              fileUrl: monthlyActivityFileUrl,
              fileType: 'pdf',
              sectionNumber: 3,
              activity: {
                name: activityName,
                description: activityDescription
              }
            }
          }
        }));
      },

      // Función para actualizar childrenSection automáticamente
      updateChildrenSection: () => {
        const { childrenSectionStories } = get();
        
        // Filtrar solo los cuentos que tienen título y video URL válidos
        const validStories = childrenSectionStories.filter(story => 
          story.title && story.title.trim() !== '' && 
          story.videoUrl && story.videoUrl.trim() !== ''
        );
        
        // Si hay cuentos válidos, crear el array, sino null
        set((state) => ({
          sections: {
            ...state.sections,
            childrenSection: validStories.length > 0 ? validStories : null
          }
        }));
      },

      // Inicializar con información del admin
      initializeWithAdmin: (adminInfo) => {
        const createdBy = adminInfo?.name || adminInfo?.email || 'admin';
        set((state) => ({
          metadata: {
            ...state.metadata,
            createdBy: createdBy
          }
        }));
        // Actualizar metadata completo después de establecer createdBy
        get().updateMetadata();
      },

      // Acciones para Next Releases
      setNextReleasesMonth: (month) => set({ nextReleasesMonth: month }),
      setNextReleasesTheme: (theme) => set({ nextReleasesTheme: theme }),
      setNextReleasesDescription: (description) => set({ nextReleasesDescription: description }),

      // Acciones para Children Section (Array de cuentos)
      addChildrenSectionStory: () => {
        const { childrenSectionStories } = get();
        const newId = childrenSectionStories.length > 0 
          ? Math.max(...childrenSectionStories.map(s => s.id || 0)) + 1 
          : 1;
        const getTodayDate = () => {
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        const newStory = {
          id: newId,
          title: '',
          thumbnail: '',
          videoUrl: '',
          description: '',
          category: 'Cuento',
          author: 'Rocío Fernandez',
          publishedDate: getTodayDate()
        };
        set({ childrenSectionStories: [...childrenSectionStories, newStory] });
        get().updateChildrenSection();
      },
      updateChildrenSectionStory: (index, storyData) => {
        set((state) => {
          const newStories = [...state.childrenSectionStories];
          if (newStories[index]) {
            newStories[index] = { ...newStories[index], ...storyData };
          }
          return { childrenSectionStories: newStories };
        });
        get().updateChildrenSection();
      },
      removeChildrenSectionStory: (index) => {
        set((state) => {
          const newStories = state.childrenSectionStories.filter((_, i) => i !== index);
          return { childrenSectionStories: newStories };
        });
        get().updateChildrenSection();
      },
      setChildrenSectionStories: (stories) => {
        set({ childrenSectionStories: stories });
        get().updateChildrenSection();
      },

      // Acciones para Timbiriche
      updateSquare: (squareNumber, squareData) => {
        set((state) => {
          const squareKey = `square${squareNumber}`;
          return {
            timbiriche: {
              ...state.timbiriche,
              [squareKey]: squareData
            }
          };
        });
      },

      reset: () => {
        set({
          month: ['Enero'], // Temporal: Enero por defecto
          theme: '',
          description: '',
          // Valores por defecto para Hero Section
          title: 'Book Club',
          subtitle: 'Lectores',
          fileUrl: 'https://el-book-club.s3.mx-central-1.amazonaws.com/book-club-lectores/assets/heroSectionBg.jpg',
          welcomeAudioTitle: 'Audio de bienvenida',
          welcomeAudioSubtitle: '',
          welcomeAudioFileUrl: '',
          monthlyActivityTitle: 'Actividad del mes',
          monthlyActivitySubtitle: '',
          monthlyActivityFileUrl: '',
          activityName: '',
          activityDescription: '',
          childrenSectionStories: [],
          books: [
            { order: 1, bookId: null, ownerDescription: '' },
            { order: 2, bookId: null, ownerDescription: '' },
            { order: 3, bookId: null, ownerDescription: '' },
            { order: 4, bookId: null, ownerDescription: '' }
          ],
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
          },
          metadata: {
            month: '',
            theme: '',
            lastUpdated: new Date().toISOString(),
            version: '1.0.0',
            description: '',
            createdBy: 'admin'
          },
          heroSection: {
            title: '',
            subtitle: '',
            fileUrl: '',
            fileType: 'image',
            sectionNumber: 1
          },
          sections: {
            welcomeAudioSection: {
              title: '',
              subtitle: '',
              fileUrl: '',
              fileType: 'video',
              sectionNumber: 2
            },
            monthlyActivitySection: {
              title: '',
              subtitle: '',
              fileUrl: '',
              fileType: 'pdf',
              sectionNumber: 3,
              activity: {
                name: '',
                description: ''
              }
            },
            childrenSection: null
          }
        });
      },

      // Obtener el JSON completo de la configuración
      getFullConfiguration: () => {
        const { metadata, heroSection, sections, books, timbiriche, nextReleasesMonth, nextReleasesTheme, nextReleasesDescription } = get();
        // Filtrar solo los libros que tienen bookId
        const validBooks = books.filter(book => book.bookId !== null);
        // Filtrar solo los squares que tienen datos
        const validTimbiriche = Object.entries(timbiriche).reduce((acc, [key, value]) => {
          if (value !== null) {
            acc[key] = value;
          }
          return acc;
        }, {});
        // Construir nextReleases solo si tiene datos
        const nextReleases = (nextReleasesMonth || nextReleasesTheme || nextReleasesDescription) ? {
          month: nextReleasesMonth,
          theme: nextReleasesTheme,
          description: nextReleasesDescription
        } : null;
        
        // Construir sections sin childrenSection si es null
        const sectionsToInclude = { ...sections };
        if (!sectionsToInclude.childrenSection) {
          delete sectionsToInclude.childrenSection;
        }
        
        const config = {
          metadata,
          heroSection,
          sections: sectionsToInclude,
          books: validBooks,
          timbiriche: validTimbiriche
        };
        
        if (nextReleases) {
          config.nextReleases = nextReleases;
        }
        
        return config;
      }
    }),
    {
      name: 'book-club-store', // Nombre para localStorage
      partialize: (state) => ({
        // Persistir todos los estados excepto funciones
        month: state.month,
        theme: state.theme,
        description: state.description,
        title: state.title,
        subtitle: state.subtitle,
        fileUrl: state.fileUrl,
        welcomeAudioTitle: state.welcomeAudioTitle,
        welcomeAudioSubtitle: state.welcomeAudioSubtitle,
        welcomeAudioFileUrl: state.welcomeAudioFileUrl,
        monthlyActivityTitle: state.monthlyActivityTitle,
        monthlyActivitySubtitle: state.monthlyActivitySubtitle,
        monthlyActivityFileUrl: state.monthlyActivityFileUrl,
        activityName: state.activityName,
        activityDescription: state.activityDescription,
        childrenSectionStories: state.childrenSectionStories,
          books: state.books,
          metadata: state.metadata,
          heroSection: state.heroSection,
          sections: state.sections,
          timbiriche: state.timbiriche,
          nextReleasesMonth: state.nextReleasesMonth,
          nextReleasesTheme: state.nextReleasesTheme,
          nextReleasesDescription: state.nextReleasesDescription
      })
    }
  )
);

