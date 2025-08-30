import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layouts/Layout';
import PlaceholderPage from './components/PlaceholderPage';
import Panel from './pages/Panel';
import Usuarios from './pages/Usuarios';
import Clientes from './pages/Clientes';
import Libros from './pages/Libros';
import Categorias from './pages/Categorias';
import Temas from './pages/Temas';
import Autores from './pages/Autores';
import Membresias from './pages/Membresias';
import Pedidos from './pages/Pedidos';
import InformacionPedido from './pages/InformacionPedido';
import Login from './pages/Login';
import PWAManager from './components/PWAManager';
import { ROUTES } from './utils/routes';
import { useAuth } from './hooks/useAuth';
import "./index.css";



function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9F5F1] via-white to-[#F5F0EB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C79E7E] mx-auto mb-4"></div>
          <p className="text-[#666666] font-cabin-regular">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Ruta pública - Login */}
        <Route path={ROUTES.LOGIN} element={
          isAuthenticated ? <Navigate to={ROUTES.PANEL} replace /> : <Login />
        } />
        
        {/* Rutas protegidas */}
        <Route path="*" element={
          isAuthenticated ? (
            <Layout>
              <Routes>
                {/* Rutas principales */}
                <Route path={ROUTES.PANEL} element={<Panel />} />
                
                {/* Rutas de gestión */}
                <Route path={ROUTES.USERS} element={<Usuarios />} />
                <Route path={ROUTES.BOOKS} element={<Libros />} />
                <Route path={ROUTES.BOOKS_CREATE} element={<Libros />} />
                <Route path={ROUTES.BOOKS_LIST} element={<Libros />} />
                <Route path={ROUTES.BOOKS_CATEGORIES} element={<Categorias />} />
                <Route path={ROUTES.BOOKS_AUTHORS} element={<Autores />} />
                <Route path={ROUTES.CATEGORIES} element={<Categorias />} />
                <Route path={ROUTES.TOPICS} element={<Temas />} />
                <Route path={ROUTES.MEMBERSHIPS} element={<Membresias />} />
                <Route path={ROUTES.ORDERS} element={<Pedidos />} />
                <Route path={ROUTES.ORDERS_CREATE} element={<Pedidos />} />
                <Route path={ROUTES.ORDERS_INFORMATION} element={<InformacionPedido />} />
                <Route path={ROUTES.CUSTOMERS} element={<Clientes />} />
                <Route path={ROUTES.CUSTOMERS_CREATE} element={<Clientes />} />
                <Route path={ROUTES.INVENTORY} element={<PlaceholderPage />} />
                <Route path={ROUTES.REPORTS} element={<PlaceholderPage />} />
                <Route path={ROUTES.SETTINGS} element={<PlaceholderPage />} />
                <Route path={ROUTES.NOTIFICATIONS} element={<PlaceholderPage />} />
                <Route path={ROUTES.HELP} element={<PlaceholderPage />} />
                
                {/* Redirección por defecto */}
                <Route path="*" element={<Navigate to={ROUTES.PANEL} replace />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to={ROUTES.LOGIN} replace />
          )
        } />
      </Routes>
      
      {/* PWA Manager */}
      <PWAManager />
    </Router>
  );
}

export default App;
