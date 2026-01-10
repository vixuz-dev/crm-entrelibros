import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MembershipChart = ({ data, type = 'line', title, description }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type === 'doughnut',
        position: 'bottom',
        labels: {
          font: {
            family: 'Cabin',
            size: 12
          },
          color: '#374151',
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#C79E7E',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: type !== 'doughnut',
        callbacks: {
          title: function(context) {
            if (type === 'doughnut') {
              return context[0].label;
            }
            return context[0].label;
          },
          label: function(context) {
            if (type === 'doughnut') {
              return `${context.label}: ${context.parsed} suscriptores`;
            }
            return `${context.dataset.label}: ${context.parsed.y} inscripciones`;
          }
        }
      }
    },
    scales: type !== 'doughnut' ? {
      x: {
        title: {
          display: true,
          text: type === 'line' ? 'Meses' : 'Categorías',
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
          text: type === 'line' ? 'Inscripciones' : 'Cantidad',
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
            return value.toLocaleString();
          }
        }
      }
    } : undefined
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line options={options} data={data} />;
      case 'bar':
        return <Bar options={options} data={data} />;
      case 'doughnut':
        return <Doughnut options={options} data={data} />;
      default:
        return <Line options={options} data={data} />;
    }
  };

  return (
    <div className="h-80 w-full">
      {renderChart()}
    </div>
  );
};

export default MembershipChart; 