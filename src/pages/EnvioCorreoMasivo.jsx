import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCreditCard } from 'react-icons/fi';
import { getMembershipsResume } from '../api/memberships';
import { ROUTES } from '../utils/routes';
import { generateRoute } from '../utils/routes';

const EnvioCorreoMasivo = () => {
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getMembershipsResume();
        if (response.status === true && response.memberships) {
          const mapped = response.memberships.map((m, index) => ({
            membership_id: m.membership_id ?? index + 1,
            membership_name: m.membership_name,
            status: m.membership_status === 'active',
            active_subscribers_count: m.active_subscribers_count ?? 0,
          }));
          setMemberships(mapped);
        } else {
          setMemberships([]);
        }
      } catch (err) {
        setError(err.message || 'Error al cargar membresías');
        setMemberships([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleCardClick = (membershipId) => {
    navigate(generateRoute(ROUTES.CORREOS_ENVIO_MASIVO_MEMBRESIA, { id: membershipId }));
  };

  const statusCardColor = (status) =>
    status
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-cabin-bold text-gray-800">
          Envío de correo masivo
        </h1>
        <p className="mt-2 text-gray-600 font-cabin-regular max-w-3xl">
          Esta sección te permite enviar correos masivos a todos los usuarios de cada una de las
          membresías activas. Haz clic en una membresía para ver sus suscriptores y elegir
          destinatarios.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-200 border-t-amber-600" />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-800 font-cabin-regular text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {memberships.map((membership) => (
            <button
              type="button"
              key={membership.membership_id}
              onClick={() => handleCardClick(membership.membership_id)}
              className={`relative rounded-lg border bg-white px-3 py-2.5 shadow-sm transition-shadow hover:shadow-md text-left cursor-pointer ${
                membership.status ? 'border-gray-200' : 'border-gray-100 opacity-80'
              }`}
            >
              <span
                className={`absolute right-2 top-2 inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusCardColor(
                  membership.status
                )}`}
              >
                {membership.status ? 'Activa' : 'Inactiva'}
              </span>
              <h2 className="font-cabin-semibold text-gray-800 text-sm pr-20 truncate">
                {membership.membership_name}
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 font-cabin-regular">
                {membership.active_subscribers_count} suscriptores
              </p>
            </button>
          ))}
        </div>
      )}

      {!isLoading && !error && memberships.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-10 text-center">
          <FiCreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 font-cabin-regular text-gray-600">
            No hay membresías para mostrar.
          </p>
        </div>
      )}
    </div>
  );
};

export default EnvioCorreoMasivo;
