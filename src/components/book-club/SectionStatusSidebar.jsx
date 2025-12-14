import React from 'react';
import { FiCheck, FiX, FiSettings, FiImage, FiBook, FiVolume2, FiCalendar, FiTrendingUp, FiUsers } from 'react-icons/fi';

const SECTION_CONFIG = [
  {
    id: 'main-config',
    name: 'Configuración Principal',
    icon: FiSettings,
    description: 'Mes, tema y descripción'
  },
  {
    id: 'hero-section',
    name: 'Banner Inicial',
    icon: FiImage,
    description: 'Título, subtítulo e imagen'
  },
  {
    id: 'books',
    name: 'Libros de la Membresía',
    icon: FiBook,
    description: 'Libros del mes'
  },
  {
    id: 'welcome-audio',
    name: 'Audio de Bienvenida',
    icon: FiVolume2,
    description: 'Audio introductorio'
  },
  {
    id: 'course-sections',
    name: 'Actividad del Mes',
    icon: FiCalendar,
    description: 'Actividad mensual'
  },
  {
    id: 'next-releases',
    name: 'Próximos Lanzamientos',
    icon: FiTrendingUp,
    description: 'Próximos meses'
  },
  {
    id: 'children-section',
    name: 'Sección para niños',
    icon: FiUsers,
    description: 'Video cuentos'
  }
];

const SectionStatusSidebar = ({ sectionStatuses, onEditSection }) => {
  const handleSectionClick = (sectionId) => {
    const sectionElement = document.getElementById(`section-${sectionId}`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-80 bg-white rounded-xl shadow-lg p-6 sticky top-6 h-fit">
      <div className="mb-6">
        <h3 className="text-xl font-cabin-bold text-gray-900 mb-2">
          Estado de Secciones
        </h3>
        <p className="text-sm text-gray-700 font-cabin-regular">
          Revisa el progreso de configuración
        </p>
      </div>

      <div className="space-y-3">
        {SECTION_CONFIG.map((section) => {
          const isCompleted = sectionStatuses[section.id] || false;
          const Icon = section.icon;

          return (
            <div
              key={section.id}
              onClick={() => handleSectionClick(section.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSectionClick(section.id);
                }
              }}
              aria-label={`${section.name} - ${isCompleted ? 'Completada' : 'Pendiente'}. Click para ir a la sección`}
              className={`p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-lg ${
                isCompleted
                  ? 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div
                    className={`p-2 rounded-lg ${
                      isCompleted ? 'bg-green-100' : 'bg-gray-200'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-cabin-semibold text-gray-900 mb-1">
                      {section.name}
                    </h4>
                    <p className="text-xs text-gray-700 font-cabin-regular">
                      {section.description}
                    </p>
                  </div>
                </div>
                <div className="ml-2">
                  {isCompleted ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <FiCheck className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-gray-400">
                      <FiX className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SectionStatusSidebar;

