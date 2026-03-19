// src/pages/Comptabilite/components/TopGestionnaires.jsx
import React from "react";
import { FaTrophy, FaMedal, FaAward, FaCity } from "react-icons/fa";
import comptabiliteService from "../../../services/comptabiliteService";

const TopGestionnaires = ({ data = [] }) => {
  const getMedalIcon = (index) => {
    switch (index) {
      case 0:
        return <FaTrophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <FaMedal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <FaAward className="w-5 h-5 text-orange-500" />;
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-sm font-medium text-gray-600">
            {index + 1}
          </span>
        );
    }
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Aucun gestionnaire ce mois-ci
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((gestionnaire, index) => (
        <div
          key={gestionnaire.id}
          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          onClick={() => {
            // Naviguer vers les détails du gestionnaire si besoin
            console.log("Voir détails:", gestionnaire.id);
          }}
        >
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            {getMedalIcon(index)}
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <div>
                <p className="font-medium text-gray-900">{gestionnaire.nom}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <FaCity className="w-3 h-3" />
                  <span>Wilaya {gestionnaire.wilaya}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">
                  {comptabiliteService.formatMontant(gestionnaire.total_gains)}
                </p>
                <p className="text-xs text-gray-500">
                  {gestionnaire.nb_livraisons} livraisons
                </p>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-primary-600 h-1.5 rounded-full"
                style={{
                  width:
                    data.length > 0 && data[0].total_gains > 0
                      ? `${(gestionnaire.total_gains / data[0].total_gains) * 100}%`
                      : "0%",
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopGestionnaires;