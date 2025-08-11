// Tema visual de EntreLibros CRM
// Colores inspirados en libros infantiles - cálidos, editoriales y profesionales

export const COLORS = {
  // Colores principales
  primary: '#C79E7E',        // Color principal (botones, destacados)
  primaryHover: '#A67C52',   // Color primario en hover
  
  // Colores de texto
  textPrimary: '#333333',    // Texto principal
  textSecondary: '#666666',  // Texto secundario
  
  // Colores de fondo
  backgroundPrimary: '#FFFFFF',    // Fondo principal
  backgroundSecondary: '#F9F5F1',  // Fondo secundario
  backgroundAccent: '#F5F0EB',     // Fondo de acento
  
  // Colores de borde
  borderPrimary: '#C79E7E',        // Borde principal
  borderSecondary: '#E5E0DB',      // Borde secundario
  
  // Colores de estado
  success: '#4A7C59',        // Verde para éxito
  warning: '#D97706',        // Naranja para advertencias
  error: '#DC2626',          // Rojo para errores
};

export const SHADOWS = {
  soft: '0 2px 8px rgba(199, 158, 126, 0.1)',
  medium: '0 4px 16px rgba(199, 158, 126, 0.15)',
  large: '0 8px 32px rgba(199, 158, 126, 0.2)',
};

export const BORDER_RADIUS = {
  default: '8px',
  large: '12px',
  xl: '16px',
};

export const TRANSITIONS = {
  smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  fast: 'all 0.15s ease-in-out',
  slow: 'all 0.5s ease-in-out',
};

export const TYPOGRAPHY = {
  fontFamily: '"Cabin", sans-serif',
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
};

// Clases de utilidad para usar directamente en Tailwind
export const UTILITY_CLASSES = {
  // Colores de texto
  textPrimary: 'text-[#333333]',
  textSecondary: 'text-[#666666]',
  textBrand: 'text-[#C79E7E]',
  
  // Colores de fondo
  bgPrimary: 'bg-[#FFFFFF]',
  bgSecondary: 'bg-[#F9F5F1]',
  bgAccent: 'bg-[#F5F0EB]',
  bgBrand: 'bg-[#C79E7E]',
  
  // Bordes
  borderPrimary: 'border-[#C79E7E]',
  borderSecondary: 'border-[#E5E0DB]',
  
  // Sombras
  shadowSoft: 'shadow-[0_2px_8px_rgba(199,158,126,0.1)]',
  shadowMedium: 'shadow-[0_4px_16px_rgba(199,158,126,0.15)]',
  shadowLarge: 'shadow-[0_8px_32px_rgba(199,158,126,0.2)]',
  
  // Transiciones
  transitionSmooth: 'transition-all duration-300 ease-out',
  transitionFast: 'transition-all duration-150 ease-in-out',
  
  // Estados hover
  hoverLift: 'hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(199,158,126,0.15)]',
  hoverBrand: 'hover:bg-[#A67C52] hover:text-white',
}; 