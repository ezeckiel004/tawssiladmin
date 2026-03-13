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
  FaDownload,
  FaSync,
  FaFileAlt,
  FaCalendarAlt,
  FaFilter,
  FaCalendarDay,
  FaInfoCircle,
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
  });

  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchLivraisons();
  }, []);

  // Filtrer les livraisons quand les filtres changent
  useEffect(() => {
    if (livraisons.length > 0) {
      applyFilters();
    }
  }, [searchTerm, statusFilter, startDateFilter, endDateFilter, livraisons]);

  const fetchLivraisons = async () => {
    try {
      setLoading(true);
      const response = await livraisonService.getAllLivraisons();
      console.log("Données reçues complètes:", response);

      // Debug: Vérifier la structure des téléphones
      if (response && response.length > 0) {
        const firstLivraison = response[0];
        console.log("DEBUG Structure téléphones:", {
          client: firstLivraison.client,
          "client.telephone": firstLivraison.client?.telephone,
          destinataire: firstLivraison.destinataire,
          "destinataire.telephone": firstLivraison.destinataire?.telephone,
          demande_livraison: firstLivraison.demande_livraison,
          "demande_livraison.destinataire":
            firstLivraison.demande_livraison?.destinataire,
          "demande_livraison.destinataire.user":
            firstLivraison.demande_livraison?.destinataire?.user,
          "demande_livraison.destinataire.user.telephone":
            firstLivraison.demande_livraison?.destinataire?.user?.telephone,
        });
      }

      setLivraisons(response || []);
      calculateStats(response || []);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement des livraisons");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir le nom complet du client
  const getClientFullName = (livraison) => {
    // 1. Dans client (user object)
    if (livraison.client) {
      const nom = livraison.client.nom || "";
      const prenom = livraison.client.prenom || "";
      const fullName = `${prenom} ${nom}`.trim();
      if (fullName) return fullName;
    }

    // 2. Dans demande_livraison.client.user
    if (livraison.demande_livraison?.client?.user) {
      const nom = livraison.demande_livraison.client.user.nom || "";
      const prenom = livraison.demande_livraison.client.user.prenom || "";
      const fullName = `${prenom} ${nom}`.trim();
      if (fullName) return fullName;
    }

    // 3. Dans demande_livraison.client (champ texte)
    if (livraison.demande_livraison?.client) {
      if (typeof livraison.demande_livraison.client === "string") {
        return livraison.demande_livraison.client;
      }
    }

    return "Non spécifié";
  };

  // Fonction pour obtenir le téléphone du client - CORRIGÉ SELON LE CONTROLEUR
  const getClientTelephone = (livraison) => {
    // 1. Vérifier dans client.telephone (direct dans user object)
    if (livraison.client?.telephone) {
      const phone = livraison.client.telephone.toString().trim();
      if (phone && phone !== "") return phone;
    }

    // 2. Vérifier dans demande_livraison.client.user.telephone
    if (livraison.demande_livraison?.client?.user?.telephone) {
      const phone = livraison.demande_livraison.client.user.telephone
        .toString()
        .trim();
      if (phone && phone !== "") return phone;
    }

    // 3. Vérifier dans demande_livraison.client_telephone (champ direct)
    if (livraison.demande_livraison?.client_telephone) {
      const phone = livraison.demande_livraison.client_telephone
        .toString()
        .trim();
      if (phone && phone !== "") return phone;
    }

    return "Non spécifié";
  };

  // Fonction pour obtenir le nom du destinataire
  const getDestinataireName = (livraison) => {
    // 1. Vérifier dans destinataire (user object)
    if (livraison.destinataire) {
      const nom = livraison.destinataire.nom || "";
      const prenom = livraison.destinataire.prenom || "";
      const fullName = `${prenom} ${nom}`.trim();
      if (fullName) return fullName;
    }

    // 2. Vérifier dans demande_livraison.destinataire.user
    if (livraison.demande_livraison?.destinataire?.user) {
      const nom = livraison.demande_livraison.destinataire.user.nom || "";
      const prenom = livraison.demande_livraison.destinataire.user.prenom || "";
      const fullName = `${prenom} ${nom}`.trim();
      if (fullName) return fullName;
    }

    // 3. Fallback à demande_livraison.destinataire (champ texte)
    if (livraison.demande_livraison?.destinataire) {
      if (typeof livraison.demande_livraison.destinataire === "string") {
        return livraison.demande_livraison.destinataire;
      }
    }

    return "Non spécifié";
  };

  // Fonction pour obtenir le téléphone du destinataire - CORRIGÉ SELON LE CONTROLEUR
  const getDestinataireTelephone = (livraison) => {
    // 1. Vérifier dans destinataire.telephone (direct dans user object)
    if (livraison.destinataire?.telephone) {
      const phone = livraison.destinataire.telephone.toString().trim();
      if (phone && phone !== "") return phone;
    }

    // 2. Vérifier dans demande_livraison.destinataire.user.telephone
    if (livraison.demande_livraison?.destinataire?.user?.telephone) {
      const phone = livraison.demande_livraison.destinataire.user.telephone
        .toString()
        .trim();
      if (phone && phone !== "") return phone;
    }

    // 3. Vérifier dans demande_livraison.telephone_destinataire
    if (livraison.demande_livraison?.telephone_destinataire) {
      const phone = livraison.demande_livraison.telephone_destinataire
        .toString()
        .trim();
      if (phone && phone !== "") return phone;
    }

    // 4. Vérifier dans demande_livraison.destinataire_telephone
    if (livraison.demande_livraison?.destinataire_telephone) {
      const phone = livraison.demande_livraison.destinataire_telephone
        .toString()
        .trim();
      if (phone && phone !== "") return phone;
    }

    return "Non spécifié";
  };

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      en_attente: data.filter((l) => l.status === "en_attente").length,
      prise_en_charge_ramassage: data.filter(
        (l) => l.status === "prise_en_charge_ramassage",
      ).length,
      ramasse: data.filter((l) => l.status === "ramasse").length,
      en_transit: data.filter((l) => l.status === "en_transit").length,
      prise_en_charge_livraison: data.filter(
        (l) => l.status === "prise_en_charge_livraison",
      ).length,
      livre: data.filter((l) => l.status === "livre").length,
      annule: data.filter((l) => l.status === "annule").length,
      en_cours: data.filter(
        (l) => !["en_attente", "livre", "annule"].includes(l.status),
      ).length,
    };
    setStats(stats);
  };

  // Fonction pour rechercher dans toutes les propriétés d'un objet
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
        return Object.values(currentObj).some((value) =>
          searchRecursive(value),
        );
      }

      return false;
    };

    return searchRecursive(obj);
  };

  // Fonction principale pour appliquer les filtres
  const applyFilters = () => {
    try {
      let filtered = [...livraisons];

      // 1. Filtrer par statut si spécifié
      if (statusFilter) {
        filtered = filtered.filter(
          (livraison) => livraison.status === statusFilter,
        );
      }

      // 3. Filtrer par recherche textuelle si spécifiée
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();

        filtered = filtered.filter((livraison) => {
          // Vérifier directement avec la fonction de recherche récursive
          if (searchInObject(livraison, searchLower)) {
            return true;
          }

          // Recherche spécifique dans les champs principaux
          const fieldsToCheck = [
            // ID et code PIN
            livraison.id,
            livraison.code_pin,

            // Informations client
            getClientFullName(livraison),
            getClientTelephone(livraison),

            // Informations destinataire
            getDestinataireName(livraison),
            getDestinataireTelephone(livraison),

            // Informations demande de livraison
            livraison.demande_livraison?.wilaya,
            livraison.demande_livraison?.commune,
            livraison.demande_livraison?.adresse,
            livraison.demande_livraison?.addresse_depot,
            livraison.demande_livraison?.addresse_delivery,

            // Informations colis
            livraison.demande_livraison?.colis?.colis_label,
            livraison.demande_livraison?.colis?.reference,

            // Statut
            getStatusFrenchName(livraison.status),
          ]
            .filter(Boolean)
            .map(String); // Convertir en string et filtrer les valeurs falsy

          // Vérifier si le terme de recherche est présent dans un des champs
          return fieldsToCheck.some((field) =>
            field.toLowerCase().includes(searchLower),
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

  // Fonction pour obtenir le nom français du statut
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

  const handleDeleteLivraison = async (id) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer cette livraison ?")
    ) {
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
  };

  const hasActiveFilters =
    searchTerm || statusFilter || startDateFilter || endDateFilter;

  const LoadingSpinner = ({ className = "w-4 h-4" }) => (
    <div
      className={`${className} border-2 border-current border-t-transparent rounded-full animate-spin`}
    ></div>
  );

  const statCards = [
    {
      title: "Total Livraisons",
      value: stats.total,
      icon: FaTruck,
      color: "bg-blue-500",
      textColor: "text-blue-500",
      description: "Toutes les livraisons",
    },
    {
      title: "En Attente",
      value: stats.en_attente,
      icon: FaClock,
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
      description: "En attente de traitement",
    },
    {
      title: "En Cours",
      value: stats.en_cours,
      icon: FaBox,
      color: "bg-orange-500",
      textColor: "text-orange-500",
      description: "Livraisons en cours",
    },
    {
      title: "Livrées",
      value: stats.livre,
      icon: FaCheckCircle,
      color: "bg-green-500",
      textColor: "text-green-500",
      description: "Livraisons terminées",
    },
    {
      title: "Annulées",
      value: stats.annule,
      icon: FaExclamationTriangle,
      color: "bg-red-500",
      textColor: "text-red-500",
      description: "Livraisons annulées",
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
          {/* Première ligne : Filtres principaux */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-5">
            {/* Barre de recherche améliorée */}
            <div className="lg:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher... (ID, client, téléphone, wilaya, commune, destinataire, etc.)"
                  className="w-full pl-10 input-field"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  title="Recherche dans tous les champs : ID, wilaya, commune, nom client, téléphone, destinataire, etc."
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Recherche dans tous les champs de la livraison
              </p>
            </div>

            {/* Filtre par statut */}
            <div>
              <select
                className="w-full input-field"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="en_attente">En attente</option>
                <option value="prise_en_charge_ramassage">
                  Prise en charge ramassage
                </option>
                <option value="ramasse">Ramasse</option>
                <option value="en_transit">En transit</option>
                <option value="prise_en_charge_livraison">
                  Prise en charge livraison
                </option>
                <option value="livre">Livré</option>
                <option value="annule">Annulé</option>
              </select>
            </div>

            {/* Filtre par période - Date de début */}
            <div className="relative">
              <FaCalendarDay className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="date"
                className="w-full pl-10 input-field"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                title="Date de début de la période"
                max={endDateFilter || undefined}
              />
            </div>

            {/* Filtre par période - Date de fin */}
            <div className="relative">
              <FaCalendarAlt className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="date"
                className="w-full pl-10 input-field"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                title="Date de fin de la période"
                min={startDateFilter || undefined}
              />
            </div>
          </div>

          {/* Deuxième ligne : Boutons d'action */}
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
                {exportLoading ? (
                  <LoadingSpinner className="w-4 h-4" />
                ) : (
                  <FaFileExcel className="w-4 h-4" />
                )}
                Exporter ({filteredLivraisons.length})
              </button>
            </div>
          </div>

          {/* Indicateur de résultats */}
          {hasActiveFilters && (
            <div className="p-3 text-sm bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-800">
                    {filteredLivraisons.length} livraison(s) trouvée(s)
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1 text-blue-600">
                    {searchTerm && (
                      <span className="px-2 py-1 text-xs bg-blue-100 rounded">
                        Recherche: "{searchTerm}"
                      </span>
                    )}
                    {statusFilter && (
                      <span className="px-2 py-1 text-xs bg-blue-100 rounded">
                        Statut: {getStatusFrenchName(statusFilter)}
                      </span>
                    )}
                    {startDateFilter && endDateFilter && (
                      <span className="px-2 py-1 text-xs bg-blue-100 rounded">
                        Période:{" "}
                        {new Date(startDateFilter).toLocaleDateString("fr-FR")}{" "}
                        - {new Date(endDateFilter).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                    {startDateFilter && !endDateFilter && (
                      <span className="px-2 py-1 text-xs bg-blue-100 rounded">
                        Date:{" "}
                        {new Date(startDateFilter).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                    {endDateFilter && !startDateFilter && (
                      <span className="px-2 py-1 text-xs bg-blue-100 rounded">
                        Jusqu'au:{" "}
                        {new Date(endDateFilter).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
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
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="px-4 py-2 mt-4 text-primary-600 hover:text-primary-800"
              >
                Réinitialiser les filtres
              </button>
            )}
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Exporter les livraisons
                  </h3>
                  {filteredLivraisons.length > 5000 && (
                    <span className="px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded-full">
                      ⚠️ GROS VOLUME
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {filteredLivraisons.length} livraison(s) à exporter
                </p>

                {filteredLivraisons.length > 5000 && (
                  <div className="p-3 mt-3 text-sm text-yellow-700 bg-yellow-50 rounded-md">
                    <div className="flex items-start">
                      <FaInfoCircle className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2" />
                      <div>
                        <p className="font-medium">
                          Attention : Gros volume détecté
                        </p>
                        <p className="mt-1">
                          L'export de {filteredLivraisons.length} livraisons
                          peut prendre du temps et utiliser beaucoup de mémoire.
                          Pour de meilleures performances :
                        </p>
                        <ul className="pl-5 mt-1 list-disc">
                          <li>Appliquez des filtres (dates, statuts)</li>
                          <li>Exportez par lots plus petits</li>
                          <li>
                            Privilégiez le format CSV pour les gros volumes
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <p className="mt-3 text-xs text-gray-600">
                  Les champs exportés seront:
                </p>
                <div className="mt-2 text-xs text-gray-600 grid grid-cols-2 gap-1">
                  <div>• ID</div>
                  <div>• Client</div>
                  <div>• Téléphone Client</div>
                  <div>• Destinataire</div>
                  <div>• Téléphone Destinataire</div>
                  <div>• Label Colis</div>
                  <div>• Statut</div>
                  <div>• Date Création</div>
                  <div>• Date Ramassage</div>
                  <div>• Date Livraison</div>
                  <div>• Ramassé par</div>
                  <div>• Distribué par</div>
                  <div>• Wilaya Départ</div>
                  <div>• Wilaya Arrivé</div>
                  <div>• Poids (kg)</div>
                  <div>• Prix Colis</div>
                  <div>• Prix Livraison</div>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <p className="mb-3 text-sm font-medium text-gray-700">
                      Choisir le format:
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setExportLoading(true);
                          handleExport("pdf").finally(() =>
                            setExportLoading(false),
                          );
                          setShowExportModal(false);
                        }}
                        disabled={exportLoading}
                        className="flex items-center justify-center flex-1 gap-2 px-4 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        <FaFilePdf className="w-5 h-5" />
                        PDF
                      </button>
                      <button
                        onClick={() => {
                          setExportLoading(true);
                          handleExport("xlsx").finally(() =>
                            setExportLoading(false),
                          );
                          setShowExportModal(false);
                        }}
                        disabled={exportLoading}
                        className="flex items-center justify-center flex-1 gap-2 px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <FaFileExcel className="w-5 h-5" />
                        Excel
                      </button>
                      <button
                        onClick={() => {
                          setExportLoading(true);
                          handleExport("csv").finally(() =>
                            setExportLoading(false),
                          );
                          setShowExportModal(false);
                        }}
                        disabled={exportLoading}
                        className="flex items-center justify-center flex-1 gap-2 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <FaFileAlt className="w-5 h-5" />
                        CSV
                      </button>
                    </div>
                  </div>

                  {/* Informations sur les filtres appliqués */}
                  <div className="p-3 text-xs bg-gray-50 rounded-md">
                    <p className="font-medium text-gray-700">
                      Filtres appliqués:
                    </p>
                    <div className="mt-1 space-y-1">
                      {searchTerm && (
                        <p>
                          Recherche:{" "}
                          <span className="font-medium">"{searchTerm}"</span>
                        </p>
                      )}
                      {statusFilter && (
                        <p>
                          Statut:{" "}
                          <span className="font-medium">
                            {getStatusFrenchName(statusFilter)}
                          </span>
                        </p>
                      )}
                      {startDateFilter && (
                        <p>
                          Date début:{" "}
                          <span className="font-medium">
                            {new Date(startDateFilter).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                        </p>
                      )}
                      {endDateFilter && (
                        <p>
                          Date fin:{" "}
                          <span className="font-medium">
                            {new Date(endDateFilter).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                        </p>
                      )}
                      {!searchTerm &&
                        !statusFilter &&
                        !startDateFilter &&
                        !endDateFilter && (
                          <p className="text-gray-500">
                            Aucun filtre spécifique
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivraisonsList;
