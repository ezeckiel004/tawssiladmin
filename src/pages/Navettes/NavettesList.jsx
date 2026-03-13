// src/pages/Navettes/NavettesList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import navetteService from "../../services/navetteService";
import comptabiliteService from "../../services/comptabiliteService";
import {
  FaPlus,
  FaTruck,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaBoxes,
  FaSearch,
  FaFilter,
  FaSync,
  FaFilePdf,
  FaLightbulb,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaArrowRight,
} from "react-icons/fa";

const NavettesList = () => {
  const navigate = useNavigate();
  const [navettes, setNavettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    wilaya_depart: "",
    date_debut: "",
    date_fin: "",
    search: "",
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchNavettes();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchNavettes();
  }, [filters]);

  const fetchNavettes = async () => {
    try {
      setLoading(true);
      const response = await navetteService.getAllNavettes(filters);
      setNavettes(response.data?.data || []);
    } catch (error) {
      console.error("Erreur chargement navettes:", error);
      toast.error("Erreur lors du chargement des navettes");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await navetteService.getStatistiques();
      setStats(response.data);
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await navetteService.getSuggestions({
        wilaya_depart: filters.wilaya_depart || "16",
      });
      setSuggestions(response.data || []);
      setShowSuggestions(true);
    } catch (error) {
      toast.error("Erreur lors de la génération des suggestions");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      wilaya_depart: "",
      date_debut: "",
      date_fin: "",
      search: "",
    });
  };

  const handleCreerSuggestion = async (suggestion) => {
    try {
      const response = await navetteService.creerNavetteOptimisee({
        wilaya_depart: suggestion.wilaya || filters.wilaya_depart || "16",
        date_limite: new Date().toISOString().split("T")[0],
        priorite: "date",
      });

      toast.success("Navette optimisée créée avec succès");
      fetchNavettes();
      setShowSuggestions(false);

      if (response.data?.id) {
        navigate(`/navettes/${response.data.id}`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la création",
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette navette ?")) {
      return;
    }

    try {
      await navetteService.deleteNavette(id);
      toast.success("Navette supprimée avec succès");
      fetchNavettes();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      planifiee: {
        color: "bg-blue-100 text-blue-800",
        icon: FaClock,
        label: "Planifiée",
      },
      en_cours: {
        color: "bg-yellow-100 text-yellow-800",
        icon: FaSpinner,
        label: "En cours",
      },
      terminee: {
        color: "bg-green-100 text-green-800",
        icon: FaCheckCircle,
        label: "Terminée",
      },
      annulee: {
        color: "bg-red-100 text-red-800",
        icon: FaTimesCircle,
        label: "Annulée",
      },
    };
    return badges[status] || badges.planifiee;
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Navettes
          </h1>
          <p className="text-gray-600">
            Optimisez vos trajets et regroupez vos colis
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchSuggestions}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <FaLightbulb /> Suggestions
          </button>
          <button
            onClick={() => navigate("/navettes/create")}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <FaPlus /> Nouvelle navette
          </button>
          <button
            onClick={fetchNavettes}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            <FaSync /> Actualiser
          </button>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total navettes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.global?.total_navettes || 0}
                </p>
              </div>
              <FaTruck className="w-8 h-8 text-primary-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Colis transportés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.global?.total_colis_transportes || 0}
                </p>
              </div>
              <FaBoxes className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Distance totale</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.global?.distance_totale || 0} km
                </p>
              </div>
              <FaMapMarkerAlt className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.par_status?.en_cours || 0}
                </p>
              </div>
              <FaSpinner className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Rechercher par référence ou chauffeur..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Tous les statuts</option>
              <option value="planifiee">Planifiée</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              name="wilaya_depart"
              placeholder="Wilaya départ (ex: 16)"
              value={filters.wilaya_depart}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <input
              type="date"
              name="date_debut"
              value={filters.date_debut}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <input
              type="date"
              name="date_fin"
              value={filters.date_fin}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            <FaFilter /> Réinitialiser
          </button>
        </div>
      </div>

      {/* Suggestions modal */}
      {showSuggestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Suggestions d'optimisation
              </h2>
              <p className="text-gray-600">
                Navettes recommandées basées sur les colis en attente
              </p>
            </div>
            <div className="p-6">
              {suggestions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Aucune suggestion pour le moment
                </p>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {suggestion.type === "destination_unique"
                              ? `Navette vers ${suggestion.wilaya}`
                              : "Tournée multi-destinations"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {suggestion.nb_colis} colis •{" "}
                            {suggestion.poids_total} kg • Valeur{" "}
                            {comptabiliteService.formatMontant(
                              suggestion.valeur_totale,
                            )}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            suggestion.confiance > 80
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          Confiance {suggestion.confiance}%
                        </span>
                      </div>
                      {suggestion.type === "tournee_multi_destinations" && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">
                            Itinéraire:
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {suggestion.itineraire?.map((wilaya, idx) => (
                              <React.Fragment key={idx}>
                                <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                                  {wilaya}
                                </span>
                                {idx < suggestion.itineraire.length - 1 && (
                                  <FaArrowRight className="text-gray-400 text-xs" />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleCreerSuggestion(suggestion)}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                        >
                          Créer cette navette
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowSuggestions(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des navettes */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trajet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date départ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chauffeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Colis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taux
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {navettes.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Aucune navette trouvée
                  </td>
                </tr>
              ) : (
                navettes.map((navette) => {
                  const status = getStatusBadge(navette.status);
                  const StatusIcon = status.icon;

                  return (
                    <tr
                      key={navette.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/navettes/${navette.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-primary-600">
                          {navette.reference}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm">
                          <span className="font-medium">
                            {navette.wilaya_depart_id}
                          </span>
                          <FaArrowRight className="text-gray-400 text-xs" />
                          {navette.wilaya_transit_id && (
                            <>
                              <span className="text-gray-600">
                                {navette.wilaya_transit_id}
                              </span>
                              <FaArrowRight className="text-gray-400 text-xs" />
                            </>
                          )}
                          <span className="font-medium">
                            {navette.wilaya_arrivee_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          <span className="text-sm">
                            {new Date(navette.date_depart).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                          <span className="text-xs text-gray-500">
                            {navette.heure_depart}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-gray-400" />
                          <span className="text-sm">
                            {navette.chauffeur?.user?.nom || "Non assigné"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-1">
                          <FaBoxes className="text-gray-400" />
                          <span className="font-medium">
                            {navette.nb_colis}
                          </span>
                          <span className="text-gray-500">
                            /{navette.capacite_max}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${navette.taux_remplissage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">
                            {navette.taux_remplissage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div
                          className="flex gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => navigate(`/navettes/${navette.id}`)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Voir détails"
                          >
                            Voir
                          </button>
                          {navette.status === "planifiee" && (
                            <button
                              onClick={() => handleDelete(navette.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer"
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NavettesList;
