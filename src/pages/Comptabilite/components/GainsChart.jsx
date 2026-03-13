// src/pages/Comptabilite/components/GainsChart.jsx
import React from "react";
import {
  LineChart,
  Line,
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
      brut: item.brut || 0,
      societe: item.societe || 0,
      livreurs: item.livreurs || 0,
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
                {comptabiliteService.formatMontant(entry.value)}
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
          tickFormatter={(value) => `${value / 1000}k`}
          domain={[0, "auto"]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="brut" name="Brut" fill="#3B82F6" />
        <Bar dataKey="societe" name="Société mère" fill="#10B981" />
        <Bar dataKey="livreurs" name="Livreurs" fill="#8B5CF6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default GainsChart;
