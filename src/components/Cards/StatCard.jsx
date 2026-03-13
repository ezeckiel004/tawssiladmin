import React from "react";

const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor,
  trend,
  trendColor,
}) => {
  return (
    <div className="p-6 transition-shadow duration-200 bg-white shadow-sm rounded-xl hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  trendColor || "text-green-600"
                }`}
              >
                {trend}
              </span>
              <span className="ml-2 text-xs text-gray-500">
                vs mois dernier
              </span>
            </div>
          )}
        </div>
        <div
          className={`h-12 w-12 rounded-lg ${
            iconColor || "bg-primary-100"
          } flex items-center justify-center`}
        >
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
