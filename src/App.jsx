import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layouts/Layout';
import PlaceholderPage from './components/PlaceholderPage';
import Panel from './pages/Panel';
import Usuarios from './pages/Usuarios';
import Clientes from './pages/Clientes';
import Libros from './pages/Libros';
import Categorias from './pages/Categorias';
import Membresias from './pages/Membresias';
import Pedidos from './pages/Pedidos';
import DetallePedido from './pages/DetallePedido';
import { ROUTES } from './utils/routes';
import "./index.css";

// Componente Dashboard (página principal)
const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-cabin-bold text-gray-800 mb-2">
          Bienvenido al CRM de EntreLibros
        </h1>
        <p className="text-gray-600 font-cabin-regular">
          Sistema de administración para tu e-commerce de libros infantiles
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <span className="text-amber-600 text-xl">📚</span>
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Total Libros</h3>
              <p className="text-2xl font-cabin-bold text-amber-600">1,234</p>
              <p className="text-sm font-cabin-regular text-gray-500">En catálogo</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Usuarios</h3>
              <p className="text-2xl font-cabin-bold text-blue-600">567</p>
              <p className="text-sm font-cabin-regular text-gray-500">Registrados</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">📊</span>
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Categorías</h3>
              <p className="text-2xl font-cabin-bold text-green-600">89</p>
              <p className="text-sm font-cabin-regular text-gray-500">Activas</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">💎</span>
            </div>
            <div>
              <h3 className="font-cabin-semibold text-gray-800">Membresías</h3>
              <p className="text-2xl font-cabin-bold text-purple-600">234</p>
              <p className="text-sm font-cabin-regular text-gray-500">Activas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
                        <Routes>
                  {/* Rutas principales */}
                  <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                  <Route path={ROUTES.PANEL} element={<Panel />} />
                  
                  {/* Rutas de gestión */}
                  <Route path={ROUTES.USERS} element={<Usuarios />} />
                  <Route path={ROUTES.BOOKS} element={<Libros />} />
                                        <Route path={ROUTES.CATEGORIES} element={<Categorias />} />
                      <Route path={ROUTES.MEMBERSHIPS} element={<Membresias />} />
                                            <Route path={ROUTES.ORDERS} element={<Pedidos />} />
                      <Route path="/pedidos/detalle/:id" element={<DetallePedido />} />
                      <Route path={ROUTES.CUSTOMERS} element={<Clientes />} />
                  <Route path={ROUTES.INVENTORY} element={<PlaceholderPage />} />
                  <Route path={ROUTES.REPORTS} element={<PlaceholderPage />} />
                  <Route path={ROUTES.SETTINGS} element={<PlaceholderPage />} />
                  <Route path={ROUTES.NOTIFICATIONS} element={<PlaceholderPage />} />
                  <Route path={ROUTES.HELP} element={<PlaceholderPage />} />
                  
                  {/* Redirección por defecto */}
                  <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                </Routes>
       </Layout>
     </Router>
   );
 }

export default App;
