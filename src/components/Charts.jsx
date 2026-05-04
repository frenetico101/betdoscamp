import React, { useMemo } from 'react';
import { useBetContext } from '../context/BetContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';

// Registro de componentes do Chart.js para tree-shaking eficiente【599463627541566†L607-L623】.
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

export default function Charts() {
  const { dailyProfit, bets } = useBetContext();

  // Dados para gráfico de lucro por dia (linha)
  const dailyData = useMemo(() => {
    const entries = Object.entries(dailyProfit).sort(([a], [b]) => (a < b ? -1 : 1));
    const labels = entries.map(([date]) => format(parseISO(date), 'dd/MM'));
    const data = entries.map(([, profit]) => profit);
    return {
      labels,
      datasets: [
        {
          label: 'Lucro diário (R$)',
          data,
          borderColor: 'rgba(75,192,192,1)',
          backgroundColor: 'rgba(75,192,192,0.2)',
          tension: 0.3,
        },
      ],
    };
  }, [dailyProfit]);

  // Dados para gráfico de lucro por mês (barra)
  const monthlyData = useMemo(() => {
    const map = {};
    bets.forEach((b) => {
      const monthKey = b.date.slice(0, 7); // yyyy-mm
      const profit = (b.returnAmount || 0) - b.stake;
      map[monthKey] = (map[monthKey] || 0) + profit;
    });
    const entries = Object.entries(map).sort(([a], [b]) => (a < b ? -1 : 1));
    const labels = entries.map(([month]) => {
      const [year, m] = month.split('-');
      return `${m}/${year}`;
    });
    const data = entries.map(([, profit]) => profit);
    return {
      labels,
      datasets: [
        {
          label: 'Lucro mensal (R$)',
          data,
          backgroundColor: data.map((val) => (val >= 0 ? 'rgba(54, 162, 235, 0.6)' : 'rgba(255, 99, 132, 0.6)')),
          borderColor: data.map((val) => (val >= 0 ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 99, 132, 1)')),
          borderWidth: 1,
        },
      ],
    };
  }, [bets]);

  // Dados para gráfico de vitórias vs derrotas (pizza)
  const pieData = useMemo(() => {
    const wins = bets.filter((b) => b.outcome === 'win').length;
    const losses = bets.filter((b) => b.outcome === 'loss').length;
    return {
      labels: ['Vitórias', 'Derrotas'],
      datasets: [
        {
          data: [wins, losses],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
          borderWidth: 1,
        },
      ],
    };
  }, [bets]);

  return (
    <section>
      <h2>Gráficos</h2>
      <div className="chart-container">
        <Line data={dailyData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
      </div>
      <div className="chart-container">
        <Bar data={monthlyData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
      </div>
      <div className="chart-container">
        <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
      </div>
    </section>
  );
}