// src/pages/Comptabilite/GainsGestionnaire.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import commissionService from "../../services/commissionService";
import {
  FaMoneyBillWave,
  FaCalendarAlt,
  FaDownload,
  FaArrowLeft,
  FaChartLine,
  FaUser,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
  FaBan,
} from "react-icons/fa";

const GainsGestionnaire = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gains, setGains] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("mois");
  const [customDate, setCustomDate] = useState({
    debut: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    fin: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchGains();
  }, [period, customDate]);

  const fetchGains = async () => {
    try {
      setLoading(true);

      let params = {};

      if (period === "personnalise") {
        params.date_debut = customDate.debut;
        params.date_fin = customDate.fin;
      } else {
        // Pour les périodes prédéfinies, on laisse le backend gérer
        params.periode = period;
      }

      const response = await commissionService.getGainsGestionnaire(id, params);
      setGains(response.data);
    } catch (error) {
      console.error("Erreur chargement gains:", error);
      toast.error("Erreur lors du chargement des gains");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = "excel") => {
    try {
      const params = {
        gestionnaire_id: id,
        periode: period,
        format,
      };

      if (period === "personnalise") {
        params.date_debut = customDate.debut;
        params.date_fin = customDate.fin;
      }

      await commissionService.exportStatistiques(params);
      toast.success("Export réussi");
    } catch (error) {
      toast.error("Erreur lors de l'export");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      calcule: {
        color: "bg-yellow-100 text-yellow-800",
        icon: FaClock,
        label: "Calculé",
      },
      verse: {
        color: "bg-green-100 text-green-800",
        icon: FaCheckCircle,
        label: "Versé",
      },
      en_attente: {
        color: "bg-gray-100 text-gray-800",
        icon: FaClock,
        label: "En attente",
      },
    };

    return badges[status] || badges.en_attente;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!gains) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FaArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gains du Gestionnaire
            </h1>
            <p className="text-gray-600">
              {gains.gestionnaire?.nom} - Wilaya {gains.gestionnaire?.wilaya}
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod("mois")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                period === "mois"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Ce mois
            </button>
            <button
              onClick={() => setPeriod("annee")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                period === "annee"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cette année
            </button>
            <button
              onClick={() => setPeriod("personnalise")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                period === "personnalise"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Personnalisé
            </button>
          </div>

          <button
            onClick={() => handleExport("excel")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <FaDownload />
            Exporter
          </button>
        </div>

        {/* Période personnalisée */}
        {period === "personnalise" && (
          <div className="mt-4 bg-white rounded-lg shadow p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date début
                </label>
                <input
                  type="date"
                  value={customDate.debut}
                  onChange={(e) =>
                    setCustomDate({ ...customDate, debut: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date fin
                </label>
                <input
                  type="date"
                  value={customDate.fin}
                  onChange={(e) =>
                    setCustomDate({ ...customDate, fin: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                onClick={fetchGains}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Appliquer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaMoneyBillWave className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Total gains</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {commissionService.formatCommission(gains.resume?.total_gains)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Sur {gains.resume?.nombre_livraisons} livraisons
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaChartLine className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Moyenne/livraison</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {commissionService.formatCommission(gains.resume?.moyenne_par_livraison)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaMapMarkerAlt className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Répartition</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm">
              Départ:{" "}
              <span className="font-medium">
                {commissionService.formatCommission(gains.repartition_par_type?.depart)}
              </span>
            </p>
            <p className="text-sm">
              Arrivée:{" "}
              <span className="font-medium">
                {commissionService.formatCommission(gains.repartition_par_type?.arrivee)}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FaClock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600">Statut des gains</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm">
              Versé:{" "}
              <span className="font-medium text-green-600">
                {commissionService.formatCommission(gains.stats_par_statut?.verse)}
              </span>
            </p>
            <p className="text-sm">
              Calculé:{" "}
              <span className="font-medium text-yellow-600">
                {commissionService.formatCommission(gains.stats_par_statut?.calcule)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Détail des gains */}
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
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livraison
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix livraison
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % appliqué
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gains.details?.map((gain) => {
                const StatusIcon = getStatusBadge(gain.status).icon;
                return (
                  <tr key={gain.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {gain.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{gain.livraison_id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          gain.type === "depart"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {gain.type === "depart" ? "Départ" : "Arrivée"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {commissionService.formatCommission(gain.prix_livraison)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {commissionService.formatCommission(gain.montant)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {gain.pourcentage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ${getStatusBadge(gain.status).color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {getStatusBadge(gain.status).label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {(!gains.details || gains.details.length === 0) && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun gain enregistré pour cette période</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GainsGestionnaire;