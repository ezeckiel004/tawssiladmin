import React from "react";

const StatsChart = ({ data }) => {
  // Données simulées pour le graphique
  const chartData = [
    { day: "Lun", value: 12 },
    { day: "Mar", value: 19 },
    { day: "Mer", value: 8 },
    { day: "Jeu", value: 15 },
    { day: "Ven", value: 22 },
    { day: "Sam", value: 18 },
    { day: "Dim", value: 14 },
  ];

  const maxValue = Math.max(...chartData.map((d) => d.value));

  return (
    <div className="space-y-4">
      {/* Graphique simple en barres */}
      <div className="flex items-end h-40 space-x-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="w-full transition-all duration-300 rounded-t-lg bg-primary-500 hover:bg-primary-600"
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            ></div>
            <span className="mt-2 text-xs text-gray-500">{item.day}</span>
          </div>
        ))}
      </div>

      {/* Légende */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>Livraisons cette semaine</span>
        <span className="font-medium">
          {chartData.reduce((sum, item) => sum + item.value, 0)} total
        </span>
      </div>
    </div>
  );
};

export default StatsChart;
