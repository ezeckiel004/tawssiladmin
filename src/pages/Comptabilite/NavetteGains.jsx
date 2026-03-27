// src/pages/Comptabilite/NavetteGains.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import comptabiliteService from "../../services/comptabiliteService";
import {
  FaArrowLeft,
  FaTruck,
  FaMoneyBillWave,
  FaUserTie,
  FaBuilding,
  FaChartPie,
  FaPercentage,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaDownload
} from "react-icons/fa";

const NavetteGains = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchGains();
  }, [id]);

  const fetchGains = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/comptabilite/navette/${id}/gains`);
      setData(response.data.data);
    } catch (error) {
      console.error("Erreur chargement gains:", error);
      toast.error("Erreur lors du chargement des gains");
    } finally {
      setLoading(false);
    }
  };

  const formatMontant = (montant) => {
    return comptabiliteService.formatMontant(montant || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/navettes")}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-4"
        >
          <FaArrowLeft /> Retour aux navettes
        </button>
        
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaTruck className="text-primary-600" />
              Gains de la navette {data.navette?.reference}
            </h1>
            <p className="text-gray-600 mt-1">
              {data.navette?.status === 'terminee' ? (
                <span className="flex items-center gap-1 text-green-600">
                  <FaCheckCircle /> Terminée le {formatDate(data.navette?.date_arrivee_reelle)}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-600">
                  <FaClock /> Statut: {data.navette?.status}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => {/* TODO: Export PDF */}}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FaDownload /> Exporter
          </button>
        </div>
      </div>

      {/* Résumé financier */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaMoneyBillWave className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Total livraisons</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {comptabiliteService.formatNombre(data.total_prix_livraisons)} DA
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Prix total des livraisons transportées
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaUserTie className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Commissions versées</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {formatMontant(data.total_gains)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Réparties entre {data.gains_par_acteur?.length || 0} acteurs
          </p>
        </div>
      </div>

      {/* Répartition des gains */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaChartPie className="text-primary-600" />
            Répartition des gains par acteur
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Les gains des livraisons sont intégralement redistribués entre les acteurs (gestionnaires et hubs)
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.gains_par_acteur?.map((acteur, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    acteur.type === 'gestionnaire' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {acteur.type === 'gestionnaire' ? (
                      <FaUserTie className={`w-5 h-5 ${acteur.type === 'gestionnaire' ? 'text-blue-600' : 'text-purple-600'}`} />
                    ) : (
                      <FaBuilding className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{acteur.nom}</p>
                    <p className="text-xs text-gray-500">
                      {acteur.type === 'gestionnaire' 
                        ? `Gestionnaire wilaya ${acteur.wilaya}`
                        : 'Hub logistique'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Total gains</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatMontant(acteur.total_gains)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Livraisons</p>
                    <p className="text-lg font-bold text-gray-900">
                      {acteur.nb_livraisons}
                    </p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div
                    className={`h-1.5 rounded-full ${acteur.type === 'gestionnaire' ? 'bg-blue-600' : 'bg-purple-600'}`}
                    style={{ width: `${data.total_gains > 0 ? (acteur.total_gains / data.total_gains) * 100 : 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-right">
                  {data.total_gains > 0 
                    ? `${((acteur.total_gains / data.total_gains) * 100).toFixed(1)}% des commissions`
                    : '0%'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Détail des gains par livraison */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Détail des gains par livraison
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livraison
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix livraison
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date calcul
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.gains_par_acteur?.flatMap(acteur => 
                acteur.details.map((detail, idx) => (
                  <tr key={`${acteur.id}-${idx}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {acteur.type === 'gestionnaire' ? (
                          <FaUserTie className="text-blue-600 mr-2" />
                        ) : (
                          <FaBuilding className="text-purple-600 mr-2" />
                        )}
                        <span className="text-sm text-gray-900">{acteur.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        acteur.type === 'gestionnaire' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {acteur.type === 'gestionnaire' ? 'Gestionnaire' : 'Hub'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {detail.livraison_id?.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatMontant(detail.prix_livraison)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatMontant(detail.montant)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {detail.pourcentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {detail.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {(!data.gains_par_acteur || data.gains_par_acteur.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun gain enregistré pour cette navette</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavetteGains;