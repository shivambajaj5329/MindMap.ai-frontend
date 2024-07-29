import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

function SentimentChart({ data }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Sentiment Over Time',
        data: data.datasets[0].data,
        backgroundColor: data.datasets[0].backgroundColor,
        borderColor: data.datasets[0].borderColor,
        fill: false,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        type: 'category',
        labels: data.labels,
      },
      y: {
        beginAtZero: true,
        min: -1,
        max: 1,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            if (value === 1) return 'Positive';
            if (value === 0) return 'Neutral';
            if (value === -1) return 'Negative';
          },
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}

export default SentimentChart;
