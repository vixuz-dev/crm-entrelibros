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

      weeklyAudioTitle: 'Audio de bienvenida',
      weeklyAudioDescription: '',
      weeklyAudioFileUrl: '',

      practicalSheetTitle: '',
      practicalSheetDescription: '',
      practicalSheetFileUrl: '',

      questionsForAnyBookTitle: '',
      questionsForAnyBookDescription: '',
      questionsForAnyBookFileUrl: '',

      // Tema que liga los libros de la sección
      booksTheme: '',
      // Estados para libros (siempre 4)
      books: [
        { order: 1, bookId: null, guideUrl: '', guideFileType: '' },
        { order: 2, bookId: null, guideUrl: '', guideFileType: '' },
        { order: 3, bookId: null, guideUrl: '', guideFileType: '' },
        { order: 4, bookId: null, guideUrl: '', guideFileType: '' }
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
        weeklyAudio: {
          title: '',
          description: '',
          fileUrl: '',
          fileType: 'audio'
        },
        practicalSheet: {
          title: '',
          description: '',
          fileUrl: '',
          fileType: 'pdf'
        },
        questionsForAnyBook: {
          title: '',
          description: '',
          fileUrl: '',
          fileType: 'pdf'
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

      setWeeklyAudioTitle: (title) => {
        set({ weeklyAudioTitle: title });
        get().updateWeeklyAudioSection();
      },

      setWeeklyAudioDescription: (description) => {
        set({ weeklyAudioDescription: description });
        get().updateWeeklyAudioSection();
      },

      setWeeklyAudioFileUrl: (fileUrl) => {
        set({ weeklyAudioFileUrl: fileUrl });
        get().updateWeeklyAudioSection();
      },

      setPracticalSheetTitle: (title) => {
        set({ practicalSheetTitle: title });
        get().updatePracticalSheetSection();
      },

      setPracticalSheetDescription: (description) => {
        set({ practicalSheetDescription: description });
        get().updatePracticalSheetSection();
      },

      setPracticalSheetFileUrl: (fileUrl) => {
        set({ practicalSheetFileUrl: fileUrl });
        get().updatePracticalSheetSection();
      },

      setQuestionsForAnyBookTitle: (title) => {
        set({ questionsForAnyBookTitle: title });
        get().updateQuestionsForAnyBookSection();
      },
      setQuestionsForAnyBookDescription: (description) => {
        set({ questionsForAnyBookDescription: description });
        get().updateQuestionsForAnyBookSection();
      },
      setQuestionsForAnyBookFileUrl: (fileUrl) => {
        set({ questionsForAnyBookFileUrl: fileUrl });
        get().updateQuestionsForAnyBookSection();
      },

      // Acciones para Books
      addBook: (bookData) => {
        set((state) => {
          const newBooks = [...state.books];
          const existingIndex = newBooks.findIndex(book => book.order === bookData.order);
          if (existingIndex !== -1) {
            newBooks[existingIndex] = {
              order: bookData.order,
              bookId: bookData.bookId,
              guideUrl: bookData.guideUrl || '',
              guideFileType: bookData.guideFileType || ''
            };
          } else {
            const emptyIndex = newBooks.findIndex(book => !book.bookId);
            if (emptyIndex !== -1) {
              newBooks[emptyIndex] = {
                order: bookData.order,
                bookId: bookData.bookId,
                guideUrl: bookData.guideUrl || '',
                guideFileType: bookData.guideFileType || ''
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
              return { order: book.order, bookId: null, guideUrl: '', guideFileType: '' };
            }
            return book;
          });
          return { books: newBooks };
        });
      },

      setBooks: (booksArray) => {
        set({ books: booksArray });
      },

      setBooksTheme: (theme) => set({ booksTheme: theme }),

      setBook: (index, bookData) => {
        set((state) => {
          const newBooks = [...state.books];
          if (bookData === null) {
            newBooks[index] = { order: index + 1, bookId: null, guideUrl: '', guideFileType: '' };
          } else {
            newBooks[index] = {
              order: index + 1,
              bookId: bookData.bookId,
              guideUrl: bookData.guideUrl || '',
              guideFileType: bookData.guideFileType || ''
            };
          }
          return { books: newBooks };
        });
      },

      setBookGuide: (index, guideUrl, guideFileType) => {
        set((state) => {
          const newBooks = [...state.books];
          if (newBooks[index]) {
            newBooks[index] = {
              ...newBooks[index],
              guideUrl: guideUrl || '',
              guideFileType: guideFileType || ''
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

      updateWeeklyAudioSection: () => {
        const { weeklyAudioTitle, weeklyAudioDescription, weeklyAudioFileUrl } = get();
        set((state) => ({
          sections: {
            ...state.sections,
            weeklyAudio: {
              title: weeklyAudioTitle,
              description: weeklyAudioDescription,
              fileUrl: weeklyAudioFileUrl,
              fileType: 'audio'
            }
          }
        }));
      },

      updatePracticalSheetSection: () => {
        const { practicalSheetTitle, practicalSheetDescription, practicalSheetFileUrl } = get();
        set((state) => ({
          sections: {
            ...state.sections,
            practicalSheet: {
              title: practicalSheetTitle,
              description: practicalSheetDescription,
              fileUrl: practicalSheetFileUrl,
              fileType: 'pdf'
            }
          }
        }));
      },

      updateQuestionsForAnyBookSection: () => {
        const { questionsForAnyBookTitle, questionsForAnyBookDescription, questionsForAnyBookFileUrl } = get();
        set((state) => ({
          sections: {
            ...state.sections,
            questionsForAnyBook: {
              title: questionsForAnyBookTitle,
              description: questionsForAnyBookDescription,
              fileUrl: questionsForAnyBookFileUrl,
              fileType: 'pdf'
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
          weeklyAudioTitle: 'Audio de bienvenida',
          weeklyAudioDescription: '',
          weeklyAudioFileUrl: '',
          practicalSheetTitle: '',
          practicalSheetDescription: '',
          practicalSheetFileUrl: '',
          questionsForAnyBookTitle: '',
          questionsForAnyBookDescription: '',
          questionsForAnyBookFileUrl: '',
          booksTheme: '',
          childrenSectionStories: [],
          books: [
            { order: 1, bookId: null, guideUrl: '', guideFileType: '' },
            { order: 2, bookId: null, guideUrl: '', guideFileType: '' },
            { order: 3, bookId: null, guideUrl: '', guideFileType: '' },
            { order: 4, bookId: null, guideUrl: '', guideFileType: '' }
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
            weeklyAudio: {
              title: '',
              description: '',
              fileUrl: '',
              fileType: 'audio'
            },
            practicalSheet: {
              title: '',
              description: '',
              fileUrl: '',
              fileType: 'pdf'
            },
            questionsForAnyBook: {
              title: '',
              description: '',
              fileUrl: '',
              fileType: 'pdf'
            },
            childrenSection: null
          }
        });
      },

      // Obtener el JSON completo de la configuración
      getFullConfiguration: () => {
        const { metadata, sections, books, booksTheme, nextReleasesMonth, nextReleasesTheme, nextReleasesDescription } = get();
        const validBooks = books.filter(book => book.bookId !== null);
        const nextReleases = (nextReleasesMonth || nextReleasesTheme || nextReleasesDescription) ? {
          month: nextReleasesMonth,
          theme: nextReleasesTheme,
          description: nextReleasesDescription
        } : null;
        const sectionsToInclude = { ...sections };
        delete sectionsToInclude.childrenSection;
        delete sectionsToInclude.monthlyActivitySection;
        const config = {
          metadata,
          sections: sectionsToInclude,
          books: validBooks,
          booksTheme: booksTheme || ''
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
        weeklyAudioTitle: state.weeklyAudioTitle,
        weeklyAudioDescription: state.weeklyAudioDescription,
        weeklyAudioFileUrl: state.weeklyAudioFileUrl,
        practicalSheetTitle: state.practicalSheetTitle,
        practicalSheetDescription: state.practicalSheetDescription,
        practicalSheetFileUrl: state.practicalSheetFileUrl,
        questionsForAnyBookTitle: state.questionsForAnyBookTitle,
        questionsForAnyBookDescription: state.questionsForAnyBookDescription,
        questionsForAnyBookFileUrl: state.questionsForAnyBookFileUrl,
        booksTheme: state.booksTheme,
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

