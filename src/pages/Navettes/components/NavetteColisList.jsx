// src/pages/Navettes/components/NavetteColisList.jsx
import React from "react";
import {
  FaBox,
  FaTrash,
  FaMapMarkerAlt,
  FaWeightHanging,
  FaMoneyBillWave,
} from "react-icons/fa";
import comptabiliteService from "../../../services/comptabiliteService";

const NavetteColisList = ({ colis = [], onRemove, canRemove = false }) => {
  if (colis.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <FaBox className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Aucun colis dans cette navette</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Colis
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Destination
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Poids
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prix
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Position
            </th>
            {canRemove && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {colis.map((item, index) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FaBox className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item.colis_label || item.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {item.id.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <FaMapMarkerAlt className="text-gray-400 w-3 h-3" />
                  <span className="text-sm text-gray-900">
                    {item.destination ||
                      item.demande_livraison?.addresse_delivery ||
                      "N/A"}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <FaWeightHanging className="text-gray-400 w-3 h-3" />
                  <span className="text-sm text-gray-900">
                    {item.poids || 0} kg
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <FaMoneyBillWave className="text-gray-400 w-3 h-3" />
                  <span className="text-sm font-semibold text-green-600">
                    {comptabiliteService.formatMontant(item.colis_prix || 0)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                  #{item.pivot?.position_chargement || index + 1}
                </span>
              </td>
              {canRemove && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Retirer de la navette"
                  >
                    <FaTrash />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NavetteColisList;
