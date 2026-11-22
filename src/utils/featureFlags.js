// Banderas del CRM.
//
// ENABLE_PANEL: el Panel (dashboard) está OCULTO por ahora. No se borró: su código sigue en
// src/pages/Panel.jsx. Para volver a mostrarlo, define VITE_ENABLE_PANEL=true en el .env y reinicia
// el servidor (o vuelve a compilar). Con el Panel oculto, la pantalla de inicio es Libros.
export const ENABLE_PANEL = import.meta.env.VITE_ENABLE_PANEL === "true";
