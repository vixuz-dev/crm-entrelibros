import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { ROUTES } from '../utils/routes';
import { login } from '../api/auth';
import { useAdminStore } from '../store/adminStore';

const Login = () => {
  const navigate = useNavigate();
  const { setAdminInfoFromLogin, isAuthenticated } = useAdminStore();
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Función para manejar cambios en los inputs (memoizada para evitar re-renders)
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Actualizar estado sin causar re-renderizados innecesarios
    setFormData(prev => {
      // Solo actualizar si el valor realmente cambió
      if (prev[name] === value) return prev;
      return {
        ...prev,
        [name]: value
      };
    });
    
    // Limpiar error solo si el usuario está escribiendo y hay un error
    if (error) {
      setError('');
    }
  }, [error]);

  // Función para limpiar el formulario
  const clearForm = useCallback(() => {
    setFormData({ email: '', password: '' });
    setError('');
    setRememberMe(false);
  }, []);

  // Función para autenticación real
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validación básica del frontend
    if (!formData.email.trim()) {
      setError('El correo electrónico es requerido');
      return;
    }
    
    if (!formData.password.trim()) {
      setError('La contraseña es requerida');
      return;
    }
    
    if (!formData.email.includes('@')) {
      setError('Ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Llamada real al servicio de autenticación
      const response = await login(formData);
      
      // Verificar el status de la respuesta
      if (response && response.status === true) {
            
        // Guardar información del administrador en el store
        setAdminInfoFromLogin(response);
        
        // Limpiar formulario solo en caso de éxito
        clearForm();
        
        // Redirigir al Panel
        navigate(ROUTES.PANEL);
      } else {
        // Login fallido - el backend devolvió status: false
        throw new Error(response?.status_Message || 'Credenciales incorrectas');
      }
    } catch (err) {
      // Manejar errores de red, servidor, etc.
      let errorMessage = 'Error en el proceso de autenticación';
      
      if (err.response) {
        // Error de respuesta del servidor (HTTP error)
        const serverResponse = err.response.data;
        errorMessage = serverResponse?.status_Message || 'Error del servidor';
      } else if (err.request) {
        // Error de red
        errorMessage = 'Error de conexión. Verifica tu internet';
      } else if (err.message) {
        // Error personalizado
        errorMessage = err.message;
      }
      
      // Mantener los datos del formulario cuando falla
      // NO limpiar el formulario, NO guardar en localStorage
      setError(errorMessage);
      console.error('Error de login:', err);
    } finally {
      setIsLoading(false);
    }
  }, [formData, clearForm, navigate, setAdminInfoFromLogin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F5F1] via-white to-[#F5F0EB] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-[#C79E7E] to-[#A67C52] rounded-full flex items-center justify-center mb-6 shadow-[0_4px_16px_rgba(199,158,126,0.15)]">
            <span className="text-white text-2xl font-cabin-bold">📚</span>
          </div>
          <h2 className="text-3xl font-cabin-bold text-[#333333] mb-2">
            EntreLibros CRM
          </h2>
          <p className="text-[#666666] font-cabin-regular">
            Inicia sesión en tu cuenta
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(199,158,126,0.2)] p-8 border border-[#E5E0DB]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-cabin-semibold text-[#333333] mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-[#666666]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-[#E5E0DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C79E7E] focus:border-[#C79E7E] font-cabin-regular transition-all duration-300 placeholder-[#999999]"
                  placeholder="tu@email.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-cabin-semibold text-[#333333] mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-[#666666]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-[#E5E0DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C79E7E] focus:border-[#C79E7E] font-cabin-regular transition-all duration-300 placeholder-[#999999]"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={useCallback(() => setShowPassword(prev => !prev), [])}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-[#666666] hover:text-[#333333] transition-colors duration-200" />
                  ) : (
                    <FiEye className="h-5 w-5 text-[#666666] hover:text-[#333333] transition-colors duration-200" />
                  )}
                </button>
              </div>
            </div>

            {/* Opciones adicionales */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={useCallback((e) => setRememberMe(e.target.checked), [])}
                  className="h-4 w-4 text-[#C79E7E] focus:ring-[#C79E7E] border-[#E5E0DB] rounded"
                  disabled={isLoading}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-cabin-regular text-[#333333]">
                  Recordarme
                </label>
              </div>
              <div className="text-sm">
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="font-cabin-semibold text-[#C79E7E] hover:text-[#A67C52] transition-colors duration-200"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-cabin-regular text-[#DC2626]">{error}</p>
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-cabin-semibold rounded-lg text-white bg-gradient-to-r from-[#C79E7E] to-[#A67C52] hover:from-[#A67C52] hover:to-[#8B6B4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C79E7E] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_4px_16px_rgba(199,158,126,0.15)] hover:shadow-[0_6px_20px_rgba(199,158,126,0.25)]"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          {/* Enlaces adicionales */}
          <div className="mt-6 text-center">
            <p className="text-sm font-cabin-regular text-[#666666]">
              ¿No tienes una cuenta?{' '}
              <Link
                to={ROUTES.REGISTER}
                className="font-cabin-semibold text-[#C79E7E] hover:text-[#A67C52] transition-colors duration-200"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs font-cabin-regular text-[#999999]">
            © 2024 EntreLibros CRM. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
