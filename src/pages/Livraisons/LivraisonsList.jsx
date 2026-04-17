// src/pages/Livraisons/LivraisonsList.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import livraisonService from "../../services/livraisonService";
import LivraisonsTable from "../../components/Tables/LivraisonsTable";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  FaTruck,
  FaBox,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileExcel,
  FaFilePdf,
  FaSync,
  FaFileAlt,
  FaCalendarAlt,
  FaFilter,
  FaCalendarDay,
} from "react-icons/fa";

const LivraisonsList = () => {
  const [livraisons, setLivraisons] = useState([]);
  const [filteredLivraisons, setFilteredLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    en_attente: 0,
    prise_en_charge_ramassage: 0,
    ramasse: 0,
    en_transit: 0,
    prise_en_charge_livraison: 0,
    livre: 0,
    annule: 0,
    en_cours: 0,
    depot_client: 0, // Nouveau compteur pour dépôt client
  });

  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchLivraisons();
  }, []);

  useEffect(() => {
    if (livraisons.length > 0) {
      applyFilters();
    }
  }, [searchTerm, statusFilter, startDateFilter, endDateFilter, monthFilter, livraisons]);

  // Vérifier si une livraison est en mode dépôt client
  const isDepotClient = (livraison) => {
    return livraison?.demande_livraison?.depose_au_depot === true;
  };

  const fetchLivraisons = async () => {
    try {
      setLoading(true);
      const response = await livraisonService.getAllLivraisons();
      setLivraisons(response || []);
      calculateStats(response || []);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement des livraisons");
    } finally {
      setLoading(false);
    }
  };

  // ==================== FONCTIONS DE GESTION DES DATES ====================

  const getLivraisonDate = (livraison) => {
    let date = null;
    
    if (livraison.created_at) {
      date = new Date(livraison.created_at);
    } else if (livraison.demande_livraison?.created_at) {
      date = new Date(livraison.demande_livraison.created_at);
    } else if (livraison.date_livraison) {
      date = new Date(livraison.date_livraison);
    } else {
      return new Date();
    }
    
    return date;
  };

  const createLocalDate = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const getMonthStart = (year, month) => {
    return new Date(year, month, 1, 0, 0, 0, 0);
  };

  const getMonthEnd = (year, month) => {
    return new Date(year, month + 1, 0, 23, 59, 59, 999);
  };

  const getFrenchMonthName = (month) => {
    const months = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    return months[month];
  };

  const formatDateForSearch = (livraison) => {
    const date = getLivraisonDate(livraison);
    return date.toLocaleDateString('fr-FR');
  };

  const getClientFullName = (livraison) => {
    if (livraison.client) {
      const nom = livraison.client.nom || "";
      const prenom = livraison.client.prenom || "";
      const fullName = `${prenom} ${nom}`.trim();
      if (fullName) return fullName;
    }

    if (livraison.demande_livraison?.client?.user) {
      const nom = livraison.demande_livraison.client.user.nom || "";
      const prenom = livraison.demande_livraison.client.user.prenom || "";
      const fullName = `${prenom} ${nom}`.trim();
      if (fullName) return fullName;
    }

    if (livraison.demande_livraison?.client) {
      if (typeof livraison.demande_livraison.client === "string") {
        return livraison.demande_livraison.client;
      }
    }

    return "Non spécifié";
  };

  const getClientTelephone = (livraison) => {
    if (livraison.client?.telephone) {
      const phone = livraison.client.telephone.toString().trim();
      if (phone && phone !== "") return phone;
    }

    if (livraison.demande_livraison?.client?.user?.telephone) {
      const phone = livraison.demande_livraison.client.user.telephone.toString().trim();
      if (phone && phone !== "") return phone;
    }

    if (livraison.demande_livraison?.client_telephone) {
      const phone = livraison.demande_livraison.client_telephone.toString().trim();
      if (phone && phone !== "") return phone;
    }

    return "Non spécifié";
  };

  const getDestinataireName = (livraison) => {
    if (livraison.destinataire) {
      const nom = livraison.destinataire.nom || "";
      const prenom = livraison.destinataire.prenom || "";
      const fullName = `${prenom} ${nom}`.trim();
      if (fullName) return fullName;
    }

    if (livraison.demande_livraison?.destinataire?.user) {
      const nom = livraison.demande_livraison.destinataire.user.nom || "";
      const prenom = livraison.demande_livraison.destinataire.user.prenom || "";
      const fullName = `${prenom} ${nom}`.trim();
      if (fullName) return fullName;
    }

    if (livraison.demande_livraison?.destinataire) {
      if (typeof livraison.demande_livraison.destinataire === "string") {
        return livraison.demande_livraison.destinataire;
      }
    }

    return "Non spécifié";
  };

  const getDestinataireTelephone = (livraison) => {
    if (livraison.destinataire?.telephone) {
      const phone = livraison.destinataire.telephone.toString().trim();
      if (phone && phone !== "") return phone;
    }

    if (livraison.demande_livraison?.destinataire?.user?.telephone) {
      const phone = livraison.demande_livraison.destinataire.user.telephone.toString().trim();
      if (phone && phone !== "") return phone;
    }

    if (livraison.demande_livraison?.telephone_destinataire) {
      const phone = livraison.demande_livraison.telephone_destinataire.toString().trim();
      if (phone && phone !== "") return phone;
    }

    return "Non spécifié";
  };

  const getStatusFrenchName = (status) => {
    const statusMap = {
      en_attente: "en attente",
      prise_en_charge_ramassage: "prise en charge ramassage",
      ramasse: "ramassé",
      en_transit: "en transit",
      prise_en_charge_livraison: "prise en charge livraison",
      livre: "livré",
      annule: "annulé",
    };
    return statusMap[status] || status;
  };

  // ==================== FONCTIONS DE RECHERCHE ET FILTRAGE ====================

  const searchInObject = (obj, searchTerm) => {
    if (!searchTerm) return false;
    const term = searchTerm.toLowerCase();

    const searchRecursive = (currentObj) => {
      if (typeof currentObj === "string") {
        return currentObj.toLowerCase().includes(term);
      }
      if (typeof currentObj === "number") {
        return currentObj.toString().includes(term);
      }
      if (Array.isArray(currentObj)) {
        return currentObj.some((item) => searchRecursive(item));
      }
      if (currentObj && typeof currentObj === "object") {
        return Object.values(currentObj).some((value) => searchRecursive(value));
      }
      return false;
    };

    return searchRecursive(obj);
  };

  const applyFilters = () => {
    try {
      let filtered = [...livraisons];

      if (statusFilter) {
        filtered = filtered.filter((livraison) => livraison.status === statusFilter);
      }

      if (monthFilter) {
        const [year, month] = monthFilter.split('-');
        const targetYear = parseInt(year);
        const targetMonth = parseInt(month) - 1;
        
        const startDate = getMonthStart(targetYear, targetMonth);
        const endDate = getMonthEnd(targetYear, targetMonth);
        
        filtered = filtered.filter((livraison) => {
          const livraisonDate = getLivraisonDate(livraison);
          return livraisonDate >= startDate && livraisonDate <= endDate;
        });
      } 
      else if (startDateFilter || endDateFilter) {
        let startDate = null;
        let endDate = null;
        
        if (startDateFilter) {
          startDate = createLocalDate(startDateFilter);
          if (startDate) {
            startDate.setHours(0, 0, 0, 0);
          }
        }
        
        if (endDateFilter) {
          endDate = createLocalDate(endDateFilter);
          if (endDate) {
            endDate.setHours(23, 59, 59, 999);
          }
        }
        
        filtered = filtered.filter((livraison) => {
          const livraisonDate = getLivraisonDate(livraison);
          
          let meetsStartCondition = true;
          let meetsEndCondition = true;
          
          if (startDate) {
            meetsStartCondition = livraisonDate >= startDate;
          }
          
          if (endDate) {
            meetsEndCondition = livraisonDate <= endDate;
          }
          
          return meetsStartCondition && meetsEndCondition;
        });
      }

      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();

        filtered = filtered.filter((livraison) => {
          if (searchInObject(livraison, searchLower)) {
            return true;
          }

          const fieldsToCheck = [
            livraison.id,
            livraison.code_pin,
            getClientFullName(livraison),
            getClientTelephone(livraison),
            getDestinataireName(livraison),
            getDestinataireTelephone(livraison),
            livraison.demande_livraison?.wilaya,
            livraison.demande_livraison?.commune,
            livraison.demande_livraison?.colis?.colis_label,
            getStatusFrenchName(livraison.status),
            formatDateForSearch(livraison),
            isDepotClient(livraison) ? "dépôt client" : "",
          ]
            .filter(Boolean)
            .map(String);

          return fieldsToCheck.some((field) =>
            field.toLowerCase().includes(searchLower)
          );
        });
      }

      setFilteredLivraisons(filtered);
    } catch (error) {
      console.error("Erreur lors du filtrage:", error);
      toast.error("Erreur lors du filtrage");
      setFilteredLivraisons(livraisons);
    }
  };

  // ==================== STATISTIQUES ====================

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      en_attente: data.filter((l) => l.status === "en_attente").length,
      prise_en_charge_ramassage: data.filter((l) => l.status === "prise_en_charge_ramassage").length,
      ramasse: data.filter((l) => l.status === "ramasse").length,
      en_transit: data.filter((l) => l.status === "en_transit").length,
      prise_en_charge_livraison: data.filter((l) => l.status === "prise_en_charge_livraison").length,
      livre: data.filter((l) => l.status === "livre").length,
      annule: data.filter((l) => l.status === "annule").length,
      en_cours: data.filter((l) => !["en_attente", "livre", "annule"].includes(l.status)).length,
      depot_client: data.filter((l) => isDepotClient(l)).length,
    };
    setStats(stats);
  };

  // ==================== GESTION DES ACTIONS ====================

  const handleDeleteLivraison = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette livraison ?")) {
      return;
    }

    try {
      await livraisonService.smartDeleteLivraison(id);
      toast.success("Livraison supprimée avec succès");
      fetchLivraisons();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleCancelLivraison = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette livraison ?")) {
      return;
    }

    try {
      await livraisonService.smartUpdateStatus(id, "annule");
      toast.success("Livraison annulée avec succès");
      fetchLivraisons();
    } catch (error) {
      toast.error("Erreur lors de l'annulation");
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/livraisons/${id}`);
  };

  const handleExport = async (format = "pdf") => {
    try {
      setExportLoading(true);

      const exportParams = {
        search: searchTerm,
        status: statusFilter,
        startDate: startDateFilter,
        endDate: endDateFilter,
        month: monthFilter,
        format: format,
        filteredLivraisonsCount: filteredLivraisons.length,
      };

      await livraisonService.exportLivraisonsExcel(exportParams);
      toast.success(`Export ${format.toUpperCase()} terminé avec succès`);
    } catch (error) {
      if (error.message !== "Export annulé par l'utilisateur") {
        console.error("Erreur lors de l'export:", error);
        toast.error(error.message || "Erreur lors de l'export");
      }
    } finally {
      setExportLoading(false);
    }
  };

  const resetAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setMonthFilter("");
  };

  const hasActiveFilters =
    searchTerm || statusFilter || startDateFilter || endDateFilter || monthFilter;

  const LoadingSpinner = ({ className = "w-4 h-4" }) => (
    <div
      className={`${className} border-2 border-current border-t-transparent rounded-full animate-spin`}
    ></div>
  );

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthValue = `${year}-${String(month + 1).padStart(2, '0')}`;
      const monthName = getFrenchMonthName(month);
      options.push({ value: monthValue, label: `${monthName} ${year}` });
    }
    
    return options;
  };

  const statCards = [
    {
      title: "Total Livraisons",
      value: stats.total,
      icon: FaTruck,
      textColor: "text-blue-500",
      description: "Toutes les livraisons",
    },
    {
      title: "En Attente",
      value: stats.en_attente,
      icon: FaClock,
      textColor: "text-yellow-500",
      description: "En attente de traitement",
    },
    {
      title: "En Cours",
      value: stats.en_cours,
      icon: FaBox,
      textColor: "text-orange-500",
      description: "Livraisons en cours",
    },
    {
      title: "Livrées",
      value: stats.livre,
      icon: FaCheckCircle,
      textColor: "text-green-500",
      description: "Livraisons terminées",
    },
    {
      title: "Annulées",
      value: stats.annule,
      icon: FaExclamationTriangle,
      textColor: "text-red-500",
      description: "Livraisons annulées",
    },
    {
      title: "Dépôt client",
      value: stats.depot_client,
      icon: FaBox,
      textColor: "text-blue-500",
      description: "Colis déposés par le client",
    },
  ];

  return (
    <div>
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col justify-between md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestion des Livraisons
            </h1>
            <p className="text-gray-600">
              Liste de toutes les livraisons - Recherche par ID, wilaya,
              commune, client, téléphone, destinataire, etc.
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                <FaBox className="w-3 h-3 mr-1" />
                Dépôt client = colis déposé directement
              </span>
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              onClick={fetchLivraisons}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner /> : <FaSync />}
              Rafraîchir
            </button>
          </div>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Aperçu global
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="p-4 transition-shadow duration-200 bg-white rounded-lg shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {stat.description}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-full ${stat.textColor} bg-opacity-10`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section de filtrage */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher... (ID, client, téléphone, wilaya, commune, destinataire, 'dépôt client', etc.)"
                  className="w-full pl-10 input-field"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <select
                className="w-full input-field"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="en_attente">En attente</option>
                <option value="prise_en_charge_ramassage">Prise en charge ramassage</option>
                <option value="ramasse">Ramasse</option>
                <option value="en_transit">En transit</option>
                <option value="prise_en_charge_livraison">Prise en charge livraison</option>
                <option value="livre">Livré</option>
                <option value="annule">Annulé</option>
              </select>
            </div>

            <div>
              <select
                className="w-full input-field"
                value={monthFilter}
                onChange={(e) => {
                  setMonthFilter(e.target.value);
                  if (e.target.value) {
                    setStartDateFilter("");
                    setEndDateFilter("");
                  }
                }}
              >
                <option value="">Tous les mois</option>
                {generateMonthOptions().map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {!monthFilter && (
              <>
                <div className="relative">
                  <FaCalendarDay className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="date"
                    className="w-full pl-10 input-field"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    placeholder="Date début"
                  />
                </div>

                <div className="relative">
                  <FaCalendarAlt className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="date"
                    className="w-full pl-10 input-field"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    placeholder="Date fin"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2">
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                >
                  <FaFilter className="w-4 h-4" />
                  Réinitialiser tous les filtres
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowExportModal(true)}
                disabled={exportLoading || filteredLivraisons.length === 0}
                className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {exportLoading ? <LoadingSpinner /> : <FaFileExcel />}
                Exporter ({filteredLivraisons.length})
              </button>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="p-3 text-sm bg-blue-50 border border-blue-200 rounded-md">
              <p className="font-medium text-blue-800">
                {filteredLivraisons.length} livraison(s) trouvée(s)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner className="w-12 h-12" />
          </div>
        ) : filteredLivraisons.length > 0 ? (
          <LivraisonsTable
            livraisons={filteredLivraisons}
            onViewDetail={handleViewDetail}
            onDelete={handleDeleteLivraison}
            onCancel={handleCancelLivraison}
            getClientFullName={getClientFullName}
            getClientTelephone={getClientTelephone}
            getDestinataireName={getDestinataireName}
            getDestinataireTelephone={getDestinataireTelephone}
          />
        ) : (
          <div className="py-16 text-center">
            <FaBox className="w-12 h-12 mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {hasActiveFilters
                ? "Aucune livraison ne correspond aux filtres"
                : "Aucune livraison disponible"}
            </h3>
          </div>
        )}
      </div>

      {/* Modale d'export */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowExportModal(false)}
            ></div>

            <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="px-6 pt-6 pb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Exporter les livraisons
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filteredLivraisons.length} livraison(s) à exporter
                </p>

                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">Choisir le format:</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        handleExport("pdf");
                        setShowExportModal(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      <FaFilePdf /> PDF
                    </button>
                    <button
                      onClick={() => {
                        handleExport("xlsx");
                        setShowExportModal(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      <FaFileExcel /> Excel
                    </button>
                    <button
                      onClick={() => {
                        handleExport("csv");
                        setShowExportModal(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <FaFileAlt /> CSV
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivraisonsList;