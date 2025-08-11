import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import Sidebar from './Sidebar';
import { getPageTitle } from '../../utils/routes';

const Layout = ({ children }) => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Sidebar - Mobile */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Overlay */}
        <div 
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${sidebarOpen ? 'bg-opacity-50' : 'bg-opacity-0'}`}
          onClick={toggleSidebar}
        />
        
        {/* Sidebar */}
        <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar onClose={toggleSidebar} />
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Solo visible en móvil */}
        <header className="lg:hidden bg-white border-b border-gray-200 h-16 flex items-center px-6">
          <div className="flex items-center justify-between w-full">
            {/* Mobile Menu Button */}
            <button 
              onClick={toggleSidebar}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            
            <h2 className="text-xl font-cabin-semibold text-gray-800">
              {pageTitle}
            </h2>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                </svg>
              </button>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 lg:pt-12">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 