// src/pages/Comptabilite/GainsNavetteList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import comptabiliteService from "../../services/comptabiliteService";
import {
  FaTruck,
  FaSearch,
  FaFilter,
  FaEye,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUsers,
  FaBuilding,
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
  FaSync,
  FaChartLine
} from "react-icons/fa";

const GainsNavetteList = () => {
  const navigate = useNavigate();
  const [navettes, setNavettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    date_debut: "",
    date_fin: "",
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchNavettes();
  }, [filters, currentPage]);

  const fetchNavettes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/navettes', {
        params: {
          status: 'terminee',
          search: filters.search,
          date_debut: filters.date_debut,
          date_fin: filters.date_fin,
          page: currentPage,
          per_page: 10
        }
      });
      
      console.log("📦 Réponse API brute:", response.data);
      
      const data = response.data?.data || response.data || response;
      console.log("📦 Données formatées:", data);
      
      if (data.data) {
        // Transformer les données pour ajouter les champs calculés si nécessaire
        const navettesAvecGains = data.data.map(navette => {
          // Calculer le total des gains à partir des gains existants
          let totalGains = 0;
          if (navette.gains && Array.isArray(navette.gains)) {
            totalGains = navette.gains.reduce((sum, gain) => {
              return sum + (parseFloat(gain.montant_commission) || 0);
            }, 0);
          }
          
          // Nombre d'acteurs
          const nbActeurs = navette.acteurs?.length || 0;
          
          // Nombre de livraisons
          const nbLivraisons = navette.livraisons_count || navette.nb_livraisons || navette.livraisons?.length || 0;
          
          console.log(`Navette ${navette.reference}:`, {
            totalGains,
            nbActeurs,
            nbLivraisons,
            gainsCount: navette.gains?.length,
            acteursCount: navette.acteurs?.length
          });
          
          return {
            ...navette,
            total_gains: totalGains,
            nb_acteurs: nbActeurs,
            nb_livraisons: nbLivraisons
          };
        });
        
        setNavettes(navettesAvecGains);
        setCurrentPage(data.current_page || 1);
        setLastPage(data.last_page || 1);
        setTotal(data.total || 0);
      } else if (Array.isArray(data)) {
        const navettesAvecGains = data.map(navette => {
          let totalGains = 0;
          if (navette.gains && Array.isArray(navette.gains)) {
            totalGains = navette.gains.reduce((sum, gain) => {
              return sum + (parseFloat(gain.montant_commission) || 0);
            }, 0);
          }
          
          return {
            ...navette,
            total_gains: totalGains,
            nb_acteurs: navette.acteurs?.length || 0,
            nb_livraisons: navette.livraisons_count || navette.nb_livraisons || navette.livraisons?.length || 0
          };
        });
        setNavettes(navettesAvecGains);
        setLastPage(1);
        setTotal(data.length);
      } else {
        setNavettes([]);
      }
    } catch (error) {
      console.error("❌ Erreur chargement navettes:", error);
      toast.error("Erreur lors du chargement des navettes");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: "", date_debut: "", date_fin: "" });
    setCurrentPage(1);
    setShowMobileFilters(false);
  };

  const handleViewGains = (id) => {
    navigate(`/comptabilite/navette/${id}/gains`);
  };

  const formatMontant = (montant) => {
    return comptabiliteService.formatMontant(montant || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaChartLine className="text-primary-600" />
          Gains par navette
        </h1>
        <p className="text-gray-600">
          Consultez les gains générés par chaque navette terminée
        </p>
      </div>

      {/* Filtres version desktop */}
      <div className="hidden lg:block bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Rechercher par référence..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <input
              type="date"
              name="date_debut"
              placeholder="Date début"
              value={filters.date_debut}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <input
              type="date"
              name="date_fin"
              placeholder="Date fin"
              value={filters.date_fin}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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

      {/* Filtres version mobile */}
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
            <input
              type="date"
              name="date_debut"
              placeholder="Date début"
              value={filters.date_debut}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="date"
              name="date_fin"
              placeholder="Date fin"
              value={filters.date_fin}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              <FaFilter /> Réinitialiser
            </button>
          </div>
        )}
      </div>

      {/* Tableau des navettes */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Référence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date départ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date arrivée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Livraisons
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total gains
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acteurs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {navettes.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        Aucune navette terminée trouvée
                      </td>
                    </tr>
                  ) : (
                    navettes.map((navette) => {
                      // Récupérer les valeurs calculées
                      const nbLivraisons = navette.nb_livraisons || 0;
                      const totalGains = navette.total_gains || 0;
                      const nbActeurs = navette.nb_acteurs || 0;
                      
                      return (
                        <tr key={navette.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-primary-600">{navette.reference}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-gray-400" />
                              <span className="text-sm">{formatDate(navette.date_depart)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-gray-400" />
                              <span className="text-sm">{formatDate(navette.date_arrivee_reelle)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <FaTruck className="text-gray-400" />
                              <span className="text-sm font-medium">{nbLivraisons}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-semibold text-green-600">
                              {formatMontant(totalGains)}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <FaUsers className="text-gray-400" />
                              <span className="text-sm">{nbActeurs} acteur(s)</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleViewGains(navette.id)}
                              className="flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition"
                            >
                              <FaEye /> Voir gains
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Version mobile */}
          <div className="lg:hidden space-y-4">
            {navettes.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                Aucune navette terminée trouvée
              </div>
            ) : (
              navettes.map((navette) => {
                const nbLivraisons = navette.nb_livraisons || 0;
                const totalGains = navette.total_gains || 0;
                const nbActeurs = navette.nb_acteurs || 0;
                
                return (
                  <div key={navette.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-primary-600">{navette.reference}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(navette.date_depart)} → {formatDate(navette.date_arrivee_reelle)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewGains(navette.id)}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm"
                      >
                        Voir gains
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <FaTruck className="text-gray-400" />
                        <span>{nbLivraisons} livraisons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaUsers className="text-gray-400" />
                        <span>{nbActeurs} acteurs</span>
                      </div>
                      <div className="col-span-2 flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-gray-600">Total gains</span>
                        <span className="font-bold text-green-600">{formatMontant(totalGains)}</span>
                      </div>
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
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
                  disabled={currentPage === lastPage}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
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

export default GainsNavetteList;