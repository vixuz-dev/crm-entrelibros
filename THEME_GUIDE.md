# 🎨 Tema Visual EntreLibros CRM

Un sistema de diseño completo inspirado en libros infantiles, con un enfoque editorial, cálido y profesional.

## 🎯 Características del Tema

- **Editorial**: Diseño limpio y tipográfico
- **Cálido**: Paleta de colores suaves y acogedores
- **Minimalista**: Interfaz limpia y sin distracciones
- **Profesional**: Mantiene la seriedad necesaria para un CRM
- **Accesible**: Alto contraste y navegación clara

## 🎨 Paleta de Colores

### Colores Principales
- **Primario**: `#C79E7E` - Color principal para botones y destacados
- **Primario Hover**: `#A67C52` - Color para estados hover
- **Texto Principal**: `#333333` - Texto principal con alto contraste
- **Texto Secundario**: `#666666` - Texto secundario

### Fondos
- **Fondo Principal**: `#FFFFFF` - Fondo blanco limpio
- **Fondo Secundario**: `#F9F5F1` - Fondo suave y cálido
- **Fondo Acento**: `#F5F0EB` - Fondo de acento para destacados

### Estados
- **Éxito**: `#4A7C59` - Verde para confirmaciones
- **Advertencia**: `#D97706` - Naranja para alertas
- **Error**: `#DC2626` - Rojo para errores

## 🔤 Tipografía

**Fuente Principal**: Cabin (Google Fonts)
- Importada automáticamente en `src/index.css`
- Usar con clase `font-[Cabin]` en Tailwind

### Jerarquía de Texto
```css
h1 { font-size: 2.5rem; font-weight: 600; }
h2 { font-size: 2rem; font-weight: 600; }
h3 { font-size: 1.5rem; font-weight: 600; }
h4 { font-size: 1.25rem; font-weight: 600; }
h5 { font-size: 1.125rem; font-weight: 600; }
h6 { font-size: 1rem; font-weight: 600; }
```

## 🧩 Componentes Base

### Botones
```jsx
// Variantes disponibles
<Button variant="primary">Botón Principal</Button>
<Button variant="secondary">Botón Secundario</Button>
<Button variant="ghost">Botón Fantasma</Button>
<Button variant="outline">Botón Contorno</Button>

// Tamaños
<Button size="sm">Pequeño</Button>
<Button size="md">Mediano</Button>
<Button size="lg">Grande</Button>
```

### Tarjetas
```jsx
// Variantes disponibles
<Card variant="default">Tarjeta por defecto</Card>
<Card variant="secondary">Tarjeta secundaria</Card>
<Card variant="accent">Tarjeta de acento</Card>
<Card variant="elevated">Tarjeta elevada</Card>
```

### Inputs
```jsx
<Input 
  label="Nombre"
  placeholder="Tu nombre"
  error="Campo requerido"
/>
```

## 🎯 Clases de Utilidad

### Colores de Texto
```css
text-[#333333]    /* Texto principal */
text-[#666666]    /* Texto secundario */
text-[#C79E7E]    /* Color de marca */
```

### Fondos
```css
bg-[#FFFFFF]      /* Fondo principal */
bg-[#F9F5F1]      /* Fondo secundario */
bg-[#F5F0EB]      /* Fondo de acento */
bg-[#C79E7E]      /* Color de marca */
```

### Sombras
```css
shadow-[0_2px_8px_rgba(199,158,126,0.1)]      /* Sombra suave */
shadow-[0_4px_16px_rgba(199,158,126,0.15)]    /* Sombra media */
shadow-[0_8px_32px_rgba(199,158,126,0.2)]     /* Sombra grande */
```

### Transiciones
```css
transition-all duration-300 ease-out    /* Transición suave */
transition-all duration-150 ease-in-out /* Transición rápida */
```

## 📱 Responsive Design

El tema incluye breakpoints estándar de Tailwind:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## ♿ Accesibilidad

### Contraste
- Texto principal (#333) sobre fondo blanco: Ratio 12.6:1 ✅
- Texto secundario (#666) sobre fondo blanco: Ratio 5.7:1 ✅
- Color de marca (#C79E7E) sobre fondo blanco: Ratio 3.2:1 ✅

### Estados de Foco
- Todos los elementos interactivos tienen estados de foco visibles
- Anillos de foco con color de marca y opacidad reducida

### Navegación
- Estructura semántica clara con HTML5
- Jerarquía de encabezados apropiada
- Enlaces descriptivos

## 🚀 Uso Rápido

### 1. Importar componentes
```jsx
import Button from './components/Button';
import Card from './components/Card';
import Input from './components/Input';
```

### 2. Usar clases directas
```jsx
<div className="bg-[#F9F5F1] font-[Cabin]">
  <h1 className="text-[#333333] text-4xl font-bold">
    Título Principal
  </h1>
  <p className="text-[#666666]">
    Texto descriptivo
  </p>
</div>
```

### 3. Usar constantes del tema
```jsx
import { COLORS, UTILITY_CLASSES } from './constants/theme';

<div className={`${UTILITY_CLASSES.bgSecondary} ${UTILITY_CLASSES.textPrimary}`}>
  Contenido
</div>
```

## 📁 Estructura de Archivos

```
src/
├── components/
│   ├── Button.jsx          # Componente de botón
│   ├── Card.jsx            # Componente de tarjeta
│   └── Input.jsx           # Componente de input
├── constants/
│   └── theme.js            # Constantes del tema
├── index.css               # Estilos base y variables CSS
└── App.jsx                 # Ejemplo de implementación
```

## 🎨 Personalización

Para personalizar el tema, edita las variables CSS en `src/index.css`:

```css
@theme {
  --color-primary: #tu-color;
  --color-text-primary: #tu-color-texto;
  /* ... más variables */
}
```

---

**Desarrollado con ❤️ para promover la lectura infantil** 