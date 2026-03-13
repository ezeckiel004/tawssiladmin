// src/pages/Comptabilite/components/TopLivreurs.jsx
import React from "react";
import { FaTrophy, FaMedal, FaAward } from "react-icons/fa";
import comptabiliteService from "../../../services/comptabiliteService";

const TopLivreurs = ({ data = [] }) => {
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
        Aucun livreur ce mois-ci
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((livreur, index) => (
        <div
          key={livreur.livreur_id}
          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
        >
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            {getMedalIcon(index)}
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <div>
                <p className="font-medium text-gray-900">{livreur.nom}</p>
                <p className="text-xs text-gray-500">
                  {livreur.nb_livraisons} livraisons
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">
                  {comptabiliteService.formatMontant(livreur.total_gains)}
                </p>
                <p className="text-xs text-gray-500">
                  Moy.{" "}
                  {comptabiliteService.formatMontant(
                    livreur.moyenne_par_livraison,
                  )}
                  /livr.
                </p>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-primary-600 h-1.5 rounded-full"
                style={{
                  width:
                    data.length > 0 && data[0].total_gains > 0
                      ? `${(livreur.total_gains / data[0].total_gains) * 100}%`
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

export default TopLivreurs;
