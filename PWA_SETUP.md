# 🚀 Configuración PWA - EntreLibros CRM

## 📱 ¿Qué es una PWA?

Una **Progressive Web App (PWA)** es una aplicación web que se puede instalar en dispositivos móviles y funcionar como una aplicación nativa, con características como:

- ✅ **Instalable** en el teléfono
- ✅ **Funciona offline** (con cache)
- ✅ **Notificaciones push** (opcional)
- ✅ **Actualizaciones automáticas**
- ✅ **Experiencia nativa**

## 🛠️ Configuración Actual

### ✅ **Ya Implementado:**

1. **Plugin PWA de Vite** - Configurado con:
   - Service Worker automático
   - Cache inteligente para API e imágenes
   - Manifest automático

2. **Meta Tags** - Configurados para:
   - iOS (Apple)
   - Android
   - Windows

3. **Componente de Actualizaciones** - Maneja:
   - Detección de nuevas versiones
   - Prompt de actualización
   - Actualización automática

## 🎨 **Iconos Requeridos**

### 📋 **Archivos que necesitas crear:**

```
public/
├── pwa-192x192.png     # Icono principal (192x192 px)
├── pwa-512x512.png     # Icono grande (512x512 px)
├── apple-touch-icon.png # Icono iOS (180x180 px)
├── favicon-32x32.png   # Favicon pequeño (32x32 px)
├── favicon-16x16.png   # Favicon muy pequeño (16x16 px)
└── masked-icon.svg     # Icono SVG para Safari
```

### 🎯 **Especificaciones de Iconos:**

- **Formato:** PNG (excepto masked-icon.svg)
- **Fondo:** Sólido (no transparente)
- **Tamaño:** Exacto según especificación
- **Contenido:** Logo de EntreLibros

## 🌐 **Despliegue en Hosting**

### **1. Preparación:**

```bash
# Construir la aplicación
npm run build

# Verificar que se generaron los archivos PWA
ls dist/
# Deberías ver:
# - manifest.webmanifest
# - sw.js (service worker)
# - workbox-*.js
```

### **2. Configuración del Servidor:**

#### **Para Apache (.htaccess):**
```apache
# Habilitar compresión
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache para PWA
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
</IfModule>

# Headers de seguridad
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>
```

#### **Para Nginx:**
```nginx
# Compresión
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Cache para PWA
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Headers de seguridad
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
```

### **3. HTTPS Obligatorio:**

⚠️ **IMPORTANTE:** Las PWAs requieren HTTPS para funcionar correctamente.

- **Certificado SSL** obligatorio
- **HTTP/2** recomendado
- **HSTS** recomendado

## 📱 **Instalación en Dispositivos**

### **Android (Chrome):**
1. Abrir la aplicación en Chrome
2. Aparecerá un banner "Añadir a pantalla de inicio"
3. Tocar "Añadir"
4. La app aparecerá en el menú de aplicaciones

### **iOS (Safari):**
1. Abrir la aplicación en Safari
2. Tocar el botón de compartir (cuadrado con flecha)
3. Seleccionar "Añadir a pantalla de inicio"
4. La app aparecerá en el home screen

### **Windows (Edge/Chrome):**
1. Abrir la aplicación en el navegador
2. Aparecerá un banner de instalación
3. Tocar "Instalar"
4. La app aparecerá en el menú de inicio

## 🔧 **Testing PWA**

### **1. Lighthouse Audit:**
```bash
# En Chrome DevTools
1. Abrir DevTools (F12)
2. Ir a la pestaña "Lighthouse"
3. Seleccionar "Progressive Web App"
4. Ejecutar auditoría
```

### **2. Verificar Service Worker:**
```bash
# En Chrome DevTools
1. Ir a Application > Service Workers
2. Verificar que el SW esté registrado
3. Verificar que el cache esté funcionando
```

### **3. Testing Offline:**
```bash
# En Chrome DevTools
1. Ir a Network
2. Marcar "Offline"
3. Recargar la página
4. Verificar que funcione sin internet
```

## 🚀 **Características Implementadas**

### ✅ **Cache Inteligente:**
- **API:** Network First (siempre actualizada)
- **Imágenes:** Cache First (rápido acceso)
- **Assets:** Cache automático

### ✅ **Actualizaciones:**
- **Detección automática** de nuevas versiones
- **Prompt de actualización** para el usuario
- **Actualización en segundo plano**

### ✅ **Experiencia Nativa:**
- **Pantalla completa** sin navegador
- **Icono en home screen**
- **Splash screen** personalizado
- **Orientación** configurada

## 🔮 **Próximas Mejoras (Opcionales)**

### **1. Notificaciones Push:**
```javascript
// Implementar notificaciones push
if ('Notification' in window) {
  Notification.requestPermission();
}
```

### **2. Background Sync:**
```javascript
// Sincronización en segundo plano
if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
  // Implementar sync
}
```

### **3. Share API:**
```javascript
// Compartir contenido
if ('share' in navigator) {
  navigator.share({
    title: 'EntreLibros CRM',
    text: 'Mira esta aplicación',
    url: window.location.href
  });
}
```

## 📞 **Soporte**

Si tienes problemas con la PWA:

1. **Verificar HTTPS** en el hosting
2. **Revisar iconos** (tamaños correctos)
3. **Probar en diferentes dispositivos**
4. **Usar Lighthouse** para auditoría

---

**¡Tu aplicación EntreLibros CRM ahora es una PWA completa! 🎉**
