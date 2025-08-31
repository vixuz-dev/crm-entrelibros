# 🔄 Reset Cache PWA - EntreLibros CRM

## 🚨 **Problema: No aparece el prompt de instalación**

### **¿Por qué sucede esto?**

Los navegadores "recuerdan" si ya mostraste el prompt de instalación y no lo vuelven a mostrar para evitar spam. Esto es un comportamiento normal.

## 🛠️ **Soluciones Implementadas:**

### **✅ 1. Botón de Reset Automático (Desarrollo)**

En la esquina superior izquierda de la aplicación (solo en desarrollo) aparecerá un botón rojo:

```
[🗑️ Limpiar PWA Cache]
```

**Pasos:**
1. **Hacer clic** en el botón rojo
2. **Esperar** a que termine de limpiar
3. **La página se recargará** automáticamente
4. **El prompt de instalación** debería aparecer de nuevo

### **✅ 2. Limpieza Manual (Cualquier momento)**

#### **Opción A: DevTools Console**
```javascript
// En Chrome DevTools > Console (F12)
// Ejecutar este código:

// 1. Limpiar Service Workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister());
  });
}

// 2. Limpiar Cache
if ('caches' in window) {
  caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  });
}

// 3. Limpiar localStorage PWA
Object.keys(localStorage).forEach(key => {
  if (key.includes('pwa') || key.includes('workbox') || key.includes('sw')) {
    localStorage.removeItem(key);
  }
});

// 4. Recargar página
window.location.reload();
```

#### **Opción B: DevTools Application**
```bash
# En Chrome DevTools:
1. F12 → Application
2. Storage → Clear storage
3. Marcar todas las opciones
4. Clear site data
5. Recargar página
```

#### **Opción C: Configuración del Navegador**
```bash
# Chrome/Edge:
1. Configuración → Privacidad y seguridad
2. Cookies y datos del sitio
3. Ver todos los datos del sitio
4. Buscar tu dominio
5. Eliminar datos
6. Recargar página
```

## 📱 **Para Dispositivos Móviles:**

### **Android (Chrome):**
```bash
# Opción 1: Configuración
1. Chrome → Configuración
2. Privacidad y seguridad
3. Eliminar datos de navegación
4. Marcar "Cookies y datos del sitio"
5. Eliminar datos

# Opción 2: Modo Incógnito
1. Abrir Chrome en modo incógnito
2. Ir a tu aplicación
3. El prompt aparecerá sin problemas
```

### **iOS (Safari):**
```bash
# Opción 1: Configuración
1. Configuración → Safari
2. Avanzado → Datos de sitios web
3. Buscar tu dominio
4. Deslizar para eliminar

# Opción 2: Modo Privado
1. Abrir Safari en modo privado
2. Ir a tu aplicación
3. Funcionará sin cache
```

## 🔧 **Comandos Rápidos:**

### **Reset Completo (Copiar y pegar en Console):**
```javascript
// Reset completo de PWA
(async () => {
  console.log('🔄 Iniciando reset PWA...');
  
  // Limpiar SW
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('✅ Service Workers eliminados');
  }
  
  // Limpiar cache
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('✅ Cache limpiado');
  }
  
  // Limpiar localStorage
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('pwa') || key.includes('workbox') || key.includes('sw')) {
      localStorage.removeItem(key);
    }
  });
  console.log('✅ localStorage limpiado');
  
  // Recargar
  setTimeout(() => {
    window.location.reload();
  }, 1000);
})();
```

## 🎯 **Verificación:**

### **Después del Reset:**
1. **Recargar la página**
2. **Esperar 3-5 segundos**
3. **Debería aparecer el prompt de instalación**
4. **Si no aparece, usar modo incógnito**

### **Indicadores de Éxito:**
- ✅ Prompt de instalación aparece
- ✅ No hay errores en Console
- ✅ Service Worker se registra de nuevo

## 🚀 **Para Producción:**

### **En producción, el botón de reset NO aparecerá**
- Solo está disponible en desarrollo
- Los usuarios reales no verán el botón
- El comportamiento será normal

### **Si necesitas reset en producción:**
```bash
# Usar las opciones manuales arriba
# O cambiar temporalmente la URL para forzar un nuevo registro
```

---

**¡Con estas herramientas podrás resetear el cache PWA fácilmente! 🔄✨**
