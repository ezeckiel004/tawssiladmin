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
  FaLightbulb,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaArrowRight,
  FaEye,
  FaEdit,
  FaTrash,
  FaDownload,
  FaChevronDown,
  FaChevronUp,
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchNavettes();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchNavettes();
  }, [filters, currentPage]);

  const fetchNavettes = async () => {
    try {
      setLoading(true);
      const response = await navetteService.getAllNavettes({
        ...filters,
        page: currentPage,
        per_page: 10,
      });
      
      // Adapter selon la structure de la réponse
      const data = response.data?.data || response.data || response;
      
      if (data.data) {
        // Structure paginée
        setNavettes(data.data);
        setCurrentPage(data.current_page || 1);
        setLastPage(data.last_page || 1);
        setTotal(data.total || 0);
      } else if (Array.isArray(data)) {
        // Structure simple
        setNavettes(data);
        setLastPage(1);
        setTotal(data.length);
      } else {
        setNavettes([]);
      }
      
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
      setLoading(true);
      const response = await navetteService.getSuggestions({
        wilaya_depart: filters.wilaya_depart || "16",
      });
      
      const suggestionsData = response.data?.data || response.data || [];
      setSuggestions(suggestionsData);
      setShowSuggestions(true);
      
    } catch (error) {
      toast.error("Erreur lors de la génération des suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset à la première page
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      wilaya_depart: "",
      date_debut: "",
      date_fin: "",
      search: "",
    });
    setCurrentPage(1);
    setShowMobileFilters(false);
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

      const navetteId = response.data?.id || response?.id;
      if (navetteId) {
        navigate(`/navettes/${navetteId}`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la création",
      );
    }
  };

  const handleDelete = async (id, status) => {
    let message = "Êtes-vous sûr de vouloir supprimer cette navette ?";
    
    if (status === "annulee") {
      message = "Cette navette est annulée. Voulez-vous vraiment la supprimer définitivement ?";
    } else if (status === "terminee") {
      message = "Cette navette est terminée. La suppression est irréversible. Continuer ?";
    } else if (status === "en_cours") {
      message = "ATTENTION : Cette navette est en cours. La supprimer aura un impact sur les livraisons en cours. Continuer ?";
    }

    if (!window.confirm(message)) {
      return;
    }

    try {
      await navetteService.deleteNavette(id);
      toast.success("Navette supprimée avec succès");
      fetchNavettes();
      fetchStats(); // Mettre à jour les stats
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleExportPDF = async () => {
    try {
      await navetteService.exportPDF(filters);
      toast.success("Export PDF généré avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'export PDF");
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
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* En-tête responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Gestion des Navettes
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Optimisez vos trajets et regroupez vos colis
          </p>
        </div>
        
        {/* Boutons actions responsive */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={fetchSuggestions}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
            disabled={loading}
          >
            <FaLightbulb className="text-sm" /> 
            <span className="hidden sm:inline">Suggestions</span>
            <span className="sm:hidden">Idées</span>
          </button>
          
          <button
            onClick={() => navigate("/navettes/create")}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
          >
            <FaPlus /> 
            <span className="hidden sm:inline">Nouvelle</span>
            <span className="sm:hidden">Créer</span>
          </button>
          
          <button
            onClick={fetchNavettes}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
            disabled={loading}
          >
            <FaSync className={loading ? "animate-spin" : ""} /> 
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Statistiques responsive */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {stats.global?.total_navettes || 0}
                </p>
              </div>
              <FaTruck className="w-6 h-6 sm:w-8 sm:h-8 text-primary-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Colis</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {stats.global?.total_colis_transportes || 0}
                </p>
              </div>
              <FaBoxes className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Distance</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {stats.global?.distance_totale || 0} km
                </p>
              </div>
              <FaMapMarkerAlt className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">En cours</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                  {stats.par_status?.en_cours || 0}
                </p>
              </div>
              <FaSpinner className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filtres - Version desktop */}
      <div className="hidden lg:block bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Rechercher par référence ou livreur..."
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
        
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <FaDownload /> Export PDF
          </button>
          
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            <FaFilter /> Réinitialiser
          </button>
        </div>
      </div>

      {/* Filtres - Version mobile */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-between bg-white rounded-lg shadow p-4"
        >
          <span className="font-medium">Filtres de recherche</span>
          {showMobileFilters ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        
        {showMobileFilters && (
          <div className="bg-white rounded-lg shadow p-4 mt-2 space-y-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Rechercher..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Tous les statuts</option>
              <option value="planifiee">Planifiée</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminée</option>
              <option value="annulee">Annulée</option>
            </select>
            
            <input
              type="text"
              name="wilaya_depart"
              placeholder="Wilaya départ"
              value={filters.wilaya_depart}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            
            <input
              type="date"
              name="date_debut"
              value={filters.date_debut}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            
            <input
              type="date"
              name="date_fin"
              value={filters.date_fin}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            
            <div className="flex gap-2">
              <button
                onClick={handleExportPDF}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                <FaDownload /> PDF
              </button>
              
              <button
                onClick={resetFilters}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
              >
                <FaFilter /> Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions modal - Version responsive */}
      {showSuggestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Suggestions d'optimisation
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Navettes recommandées basées sur les colis en attente
              </p>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {loading ? (
                <LoadingSpinner />
              ) : suggestions.length === 0 ? (
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
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                        <div>
                          <h3 className="font-semibold text-base sm:text-lg">
                            {suggestion.type === "destination_unique"
                              ? `Navette vers ${suggestion.wilaya_nom || suggestion.wilaya}`
                              : "Tournée multi-destinations"}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {suggestion.nb_colis} colis • {suggestion.poids_total} kg • 
                            Valeur {comptabiliteService.formatMontant(suggestion.valeur_totale)}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
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
                          <p className="text-xs sm:text-sm font-medium text-gray-700">
                            Itinéraire:
                          </p>
                          <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                            {suggestion.itineraire?.map((wilaya, idx) => (
                              <React.Fragment key={idx}>
                                <span className="bg-gray-100 px-2 py-1 rounded text-xs sm:text-sm">
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
                      
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => handleCreerSuggestion(suggestion)}
                          className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                        >
                          Créer cette navette
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
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

      {/* Liste des navettes - Version desktop avec scroll horizontal */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Table desktop avec défilement horizontal */}
          <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Référence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Trajet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Date départ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Livreur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Colis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Taux
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {navettes.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
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
                                {new Date(navette.date_depart).toLocaleDateString("fr-FR")}
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
                                {navette.livreur?.user?.nom || navette.livreur?.nom || "Non assigné"}
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
                                  style={{ width: `${navette.taux_remplissage || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">
                                {navette.taux_remplissage || 0}%
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div
                              className="flex gap-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => navigate(`/navettes/${navette.id}`)}
                                className="text-primary-600 hover:text-primary-900"
                                title="Voir détails"
                              >
                                <FaEye />
                              </button>
                              
                              {/* Modification possible seulement pour les navettes planifiées */}
                              {navette.status === "planifiee" && (
                                <button
                                  onClick={() => navigate(`/navettes/edit/${navette.id}`)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Modifier"
                                >
                                  <FaEdit />
                                </button>
                              )}
                              
                              {/* Suppression possible pour les navettes planifiées ET annulées */}
                              {(navette.status === "planifiee" || navette.status === "annulee") && (
                                <button
                                  onClick={() => handleDelete(navette.id, navette.status)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Supprimer"
                                >
                                  <FaTrash />
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
          </div>

          {/* Cartes mobile */}
          <div className="lg:hidden space-y-4">
            {navettes.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                Aucune navette trouvée
              </div>
            ) : (
              navettes.map((navette) => {
                const status = getStatusBadge(navette.status);
                const StatusIcon = status.icon;

                return (
                  <div
                    key={navette.id}
                    className="bg-white rounded-lg shadow p-4"
                    onClick={() => navigate(`/navettes/${navette.id}`)}
                  >
                    {/* En-tête de carte */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-sm font-medium text-primary-600">
                          {navette.reference}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1 flex-wrap">
                          <FaMapMarkerAlt className="text-gray-400" />
                          <span>{navette.wilaya_depart_id}</span>
                          <FaArrowRight className="text-gray-400 text-xs" />
                          {navette.wilaya_transit_id && (
                            <>
                              <span>{navette.wilaya_transit_id}</span>
                              <FaArrowRight className="text-gray-400 text-xs" />
                            </>
                          )}
                          <span>{navette.wilaya_arrivee_id}</span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full ${status.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>

                    {/* Détails */}
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400" />
                        <span>
                          {new Date(navette.date_depart).toLocaleDateString("fr-FR")}
                        </span>
                        <span className="text-xs text-gray-500">
                          {navette.heure_depart}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        <span className="truncate">
                          {navette.livreur?.user?.nom || navette.livreur?.nom || "Non assigné"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FaBoxes className="text-gray-400" />
                        <span>
                          {navette.nb_colis}/{navette.capacite_max} colis
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${navette.taux_remplissage || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">
                          {navette.taux_remplissage || 0}%
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-2 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/navettes/${navette.id}`);
                        }}
                        className="text-primary-600 hover:text-primary-900"
                        title="Voir détails"
                      >
                        <FaEye size={18} />
                      </button>
                      
                      {/* Modification seulement pour planifiée */}
                      {navette.status === "planifiee" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/navettes/edit/${navette.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Modifier"
                        >
                          <FaEdit size={18} />
                        </button>
                      )}
                      
                      {/* Suppression pour planifiée ET annulée */}
                      {(navette.status === "planifiee" || navette.status === "annulee") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(navette.id, navette.status);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <FaTrash size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-700">
                Page {currentPage} sur {lastPage} (total: {total} navettes)
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
                  disabled={currentPage === lastPage}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NavettesList;