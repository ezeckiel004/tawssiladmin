// src/pages/Comptabilite/components/GainsChart.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import comptabiliteService from "../../../services/comptabiliteService";

const GainsChart = ({ data = [] }) => {
  const formatData = () => {
    return data.map((item) => ({
      ...item,
      commissions: item.commissions || 0,
      societe: item.societe || 0,
      livraisons: item.livraisons || 0,
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-medium">
                {entry.name === "Livraisons" 
                  ? entry.value 
                  : comptabiliteService.formatMontant(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={formatData()}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mois" />
        <YAxis
          yAxisId="left"
          tickFormatter={(value) => `${value / 1000}k DA`}
          domain={[0, "auto"]}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, "auto"]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar yAxisId="left" dataKey="commissions" name="Commissions" fill="#3B82F6" />
        <Bar yAxisId="left" dataKey="societe" name="Part société" fill="#10B981" />
        <Bar yAxisId="right" dataKey="livraisons" name="Livraisons" fill="#8B5CF6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default GainsChart;