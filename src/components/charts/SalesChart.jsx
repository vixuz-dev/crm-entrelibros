import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalesChart = () => {
  // Obtener el mes actual y generar datos de ejemplo
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('es-ES', { month: 'long' });
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  
  // Generar datos de ventas para el mes actual (simulados)
  const generateSalesData = () => {
    const data = [];
    for (let i = 1; i <= daysInMonth; i++) {
      // Simular ventas con variación diaria
      const baseSales = 1500;
      const variation = Math.random() * 1000 - 500; // Variación de -500 a +500
      const weekendBonus = [6, 7, 13, 14, 20, 21, 27, 28].includes(i) ? 300 : 0; // Bonus en fines de semana
      data.push(Math.max(0, Math.round(baseSales + variation + weekendBonus)));
    }
    return data;
  };

  const salesData = generateSalesData();
  const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Ventas de ${currentMonth} ${currentDate.getFullYear()}`,
        font: {
          family: 'Cabin',
          size: 16,
          weight: '600'
        },
        color: '#374151'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#C79E7E',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context) {
            return `Día ${context[0].label}`;
          },
          label: function(context) {
            return `Ventas: $${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Días del mes',
          font: {
            family: 'Cabin',
            size: 12,
            weight: '500'
          },
          color: '#6B7280'
        },
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Cabin',
            size: 11
          },
          color: '#6B7280'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Ventas ($)',
          font: {
            family: 'Cabin',
            size: 12,
            weight: '500'
          },
          color: '#6B7280'
        },
        grid: {
          color: '#E5E7EB',
          drawBorder: false
        },
        ticks: {
          font: {
            family: 'Cabin',
            size: 11
          },
          color: '#6B7280',
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'Ventas Diarias',
        data: salesData,
        backgroundColor: 'rgba(199, 158, 126, 0.8)',
        borderColor: 'rgba(199, 158, 126, 1)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(199, 158, 126, 1)',
        hoverBorderColor: 'rgba(166, 124, 82, 1)',
        hoverBorderWidth: 2
      }
    ]
  };

  // Calcular estadísticas
  const totalSales = salesData.reduce((sum, sale) => sum + sale, 0);
  const averageSales = Math.round(totalSales / salesData.length);
  const maxSales = Math.max(...salesData);
  const minSales = Math.min(...salesData);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-cabin-semibold text-gray-800 mb-2">
          Gráfico de Ventas Mensual
        </h3>
        <p className="text-sm font-cabin-regular text-gray-600">
          Análisis detallado de las ventas diarias del mes actual
        </p>
      </div>
      
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-amber-50 rounded-lg p-3">
          <p className="text-xs font-cabin-medium text-amber-700 uppercase tracking-wider">Total</p>
          <p className="text-lg font-cabin-bold text-amber-800">${totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs font-cabin-medium text-blue-700 uppercase tracking-wider">Promedio</p>
          <p className="text-lg font-cabin-bold text-blue-800">${averageSales.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs font-cabin-medium text-green-700 uppercase tracking-wider">Máximo</p>
          <p className="text-lg font-cabin-bold text-green-800">${maxSales.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-xs font-cabin-medium text-purple-700 uppercase tracking-wider">Mínimo</p>
          <p className="text-lg font-cabin-bold text-purple-800">${minSales.toLocaleString()}</p>
        </div>
      </div>
      
      {/* Gráfico */}
      <div className="h-80">
        <Bar options={options} data={data} />
      </div>
    </div>
  );
};

export default SalesChart; 