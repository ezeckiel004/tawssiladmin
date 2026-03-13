// src/pages/Comptabilite/RapportGains.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import comptabiliteService from "../../services/comptabiliteService";
import ExportModal from "./components/ExportModal";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaUser,
  FaMoneyBillWave,
  FaDownload,
  FaSearch,
  FaFileExport,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";

const RapportGains = () => {
  const navigate = useNavigate();
  const [rapport, setRapport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [filters, setFilters] = useState({
    type_periode: "mois",
    date: new Date().toISOString().split("T")[0],
    date_debut: "",
    date_fin: "",
    livreur_id: "",
  });

  const fetchRapport = async () => {
    try {
      setLoading(true);
      const response = await comptabiliteService.getRapport(filters);
      setRapport(response.data);
    } catch (error) {
      console.error("Erreur chargement rapport:", error);
      toast.error("Erreur lors du chargement du rapport");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRapport();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handlePeriodChange = (type) => {
    setFilters({
      ...filters,
      type_periode: type,
      date:
        type === "personnalise" ? "" : new Date().toISOString().split("T")[0],
    });
  };

  const handleSearch = () => {
    fetchRapport();
  };

  const handleExport = async (params) => {
    try {
      await comptabiliteService.exportRapport(params, params.format);
      toast.success("Export lancé avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'export");
    }
  };

  const getStatusBadge = (statut) => {
    const badges = {
      en_attente: {
        color: "bg-yellow-100 text-yellow-800",
        icon: FaClock,
        label: "En attente",
      },
      paye: {
        color: "bg-green-100 text-green-800",
        icon: FaCheckCircle,
        label: "Payé",
      },
      annule: {
        color: "bg-red-100 text-red-800",
        icon: FaTimesCircle,
        label: "Annulé",
      },
    };
    return badges[statut] || badges.en_attente;
  };

  const formatMontant = (montant) => {
    return comptabiliteService.formatMontant(montant || 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/comptabilite")}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-4"
        >
          <FaArrowLeft /> Retour au dashboard
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Rapport des gains
            </h1>
            <p className="text-gray-600">
              {rapport?.periode?.libelle || "Sélectionnez une période"}
            </p>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <FaFileExport /> Exporter
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handlePeriodChange("jour")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg ${
                  filters.type_periode === "jour"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Jour
              </button>
              <button
                onClick={() => handlePeriodChange("semaine")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg ${
                  filters.type_periode === "semaine"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Semaine
              </button>
              <button
                onClick={() => handlePeriodChange("mois")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg ${
                  filters.type_periode === "mois"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Mois
              </button>
              <button
                onClick={() => handlePeriodChange("personnalise")}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg ${
                  filters.type_periode === "personnalise"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Perso
              </button>
            </div>
          </div>

          {filters.type_periode !== "personnalise" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date début
                </label>
                <input
                  type="date"
                  name="date_debut"
                  value={filters.date_debut}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date fin
                </label>
                <input
                  type="date"
                  name="date_fin"
                  value={filters.date_fin}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Livreur
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  name="livreur_id"
                  value={filters.livreur_id}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Tous</option>
                  {/* Options livreurs */}
                </select>
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <FaSearch />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Résultats */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : rapport ? (
        <div className="space-y-6">
          {/* Totaux */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Montant brut</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMontant(rapport.totaux?.montant_brut)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {rapport.totaux?.nb_livraisons} livraisons
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Frais navette</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatMontant(rapport.totaux?.frais_navette)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Part société mère</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatMontant(rapport.totaux?.montant_societe_mere)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Gains livreurs</p>
              <p className="text-2xl font-bold text-green-600">
                {formatMontant(rapport.totaux?.montant_net_livreurs)}
              </p>
            </div>
          </div>

          {/* Tableau détaillé */}
          {rapport.details && rapport.details.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Détail des gains
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Livreur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Livraison
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Brut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Navette
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Société
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net livreur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rapport.details.map((gain, index) => {
                      const status = getStatusBadge(gain.statut_paiement);
                      const StatusIcon = status.icon;
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {comptabiliteService.formatDate(gain.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {gain.livreur_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {gain.livraison_id.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatMontant(gain.montant_brut)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">
                            {formatMontant(gain.frais_navette)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                            {formatMontant(gain.montant_societe_mere)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            {formatMontant(gain.montant_net_livreur)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${status.color}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Récapitulatif par livreur */}
          {rapport.par_livreur && rapport.par_livreur.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Récapitulatif par livreur
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Livreur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Livraisons
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant brut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frais navette
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net perçu
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rapport.par_livreur.map((livreur, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {livreur.nom}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {livreur.nb_livraisons}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatMontant(livreur.montant_brut)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">
                          {formatMontant(livreur.frais_navette)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatMontant(livreur.montant_net)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Modal d'export */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />
    </div>
  );
};

export default RapportGains;
