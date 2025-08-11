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
  Legend
);

const OrderChart = ({ data, type = 'line', title, description }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type === 'doughnut', // Solo display legend para doughnut
        position: 'bottom',
        labels: {
          font: { family: 'Cabin', size: 12 },
          color: '#374151',
          usePointStyle: true,
          padding: 20
        }
      },
      title: { display: false }, // Title handled by parent component
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
            if (type === 'doughnut') { return context[0].label; }
            return context[0].label;
          },
          label: function(context) {
            if (type === 'doughnut') { return `${context.label}: ${context.parsed} pedidos`; }
            return `${context.dataset.label}: ${context.parsed.y} pedidos`;
          }
        }
      }
    },
    scales: type !== 'doughnut' ? {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { family: 'Cabin', size: 12 },
          color: '#6B7280'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#E5E7EB'
        },
        ticks: {
          font: { family: 'Cabin', size: 12 },
          color: '#6B7280'
        }
      }
    } : undefined
  };

  const renderChart = () => {
    switch (type) {
      case 'line': return <Line options={options} data={data} />;
      case 'bar': return <Bar options={options} data={data} />;
      case 'doughnut': return <Doughnut options={options} data={data} />;
      default: return <Line options={options} data={data} />;
    }
  };

  return (
    <div className="h-full">
      {renderChart()}
    </div>
  );
};

export default OrderChart; 