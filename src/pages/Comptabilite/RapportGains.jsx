// src/pages/Comptabilite/RapportGains.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import comptabiliteService from "../../services/comptabiliteService";
import gestionnaireService from "../../services/gestionnaireService";
import ExportModal from "./components/ExportModal";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaUserTie,
  FaMoneyBillWave,
  FaSearch,
  FaFileExport,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSync,
  FaCity,
  FaHistory,
  FaDownload,
} from "react-icons/fa";

const RapportGains = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [rapport, setRapport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [loadingGestionnaires, setLoadingGestionnaires] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [gestionnaireOptions, setGestionnaireOptions] = useState([]);
  const [wilayas, setWilayas] = useState([]);
  const [filters, setFilters] = useState({
    type_periode: "mois",
    date: new Date().toISOString().split("T")[0],
    date_debut: "",
    date_fin: "",
    gestionnaire_id: "",
    wilaya_id: "",
  });

  // Liste COMPLÈTE des 58 wilayas algériennes
  const wilayasStatiques = [
    { code: "01", nom: "Adrar" }, { code: "02", nom: "Chlef" }, { code: "03", nom: "Laghouat" },
    { code: "04", nom: "Oum El Bouaghi" }, { code: "05", nom: "Batna" }, { code: "06", nom: "Béjaïa" },
    { code: "07", nom: "Biskra" }, { code: "08", nom: "Béchar" }, { code: "09", nom: "Blida" },
    { code: "10", nom: "Bouira" }, { code: "11", nom: "Tamanrasset" }, { code: "12", nom: "Tébessa" },
    { code: "13", nom: "Tlemcen" }, { code: "14", nom: "Tiaret" }, { code: "15", nom: "Tizi Ouzou" },
    { code: "16", nom: "Alger" }, { code: "17", nom: "Djelfa" }, { code: "18", nom: "Jijel" },
    { code: "19", nom: "Sétif" }, { code: "20", nom: "Saïda" }, { code: "21", nom: "Skikda" },
    { code: "22", nom: "Sidi Bel Abbès" }, { code: "23", nom: "Annaba" }, { code: "24", nom: "Guelma" },
    { code: "25", nom: "Constantine" }, { code: "26", nom: "Médéa" }, { code: "27", nom: "Mostaganem" },
    { code: "28", nom: "M'Sila" }, { code: "29", nom: "Mascara" }, { code: "30", nom: "Ouargla" },
    { code: "31", nom: "Oran" }, { code: "32", nom: "El Bayadh" }, { code: "33", nom: "Illizi" },
    { code: "34", nom: "Bordj Bou Arréridj" }, { code: "35", nom: "Boumerdès" }, { code: "36", nom: "El Tarf" },
    { code: "37", nom: "Tindouf" }, { code: "38", nom: "Tissemsilt" }, { code: "39", nom: "El Oued" },
    { code: "40", nom: "Khenchela" }, { code: "41", nom: "Souk Ahras" }, { code: "42", nom: "Tipaza" },
    { code: "43", nom: "Mila" }, { code: "44", nom: "Aïn Defla" }, { code: "45", nom: "Naâma" },
    { code: "46", nom: "Aïn Témouchent" }, { code: "47", nom: "Ghardaïa" }, { code: "48", nom: "Relizane" },
    { code: "49", nom: "Timimoun" }, { code: "50", nom: "Bordj Badji Mokhtar" }, { code: "51", nom: "Ouled Djellal" },
    { code: "52", nom: "Béni Abbès" }, { code: "53", nom: "In Salah" }, { code: "54", nom: "In Guezzam" },
    { code: "55", nom: "Touggourt" }, { code: "56", nom: "Djanet" }, { code: "57", nom: "El M'Ghair" },
    { code: "58", nom: "El Meniaa" }
  ];

  // Charger la liste des gestionnaires au montage du composant
  useEffect(() => {
    fetchGestionnaireOptions();
    fetchWilayas();
  }, []);

  // Charger le rapport au montage
  useEffect(() => {
    fetchRapport();
  }, []);

  const fetchGestionnaireOptions = async () => {
    try {
      setLoadingGestionnaires(true);
      
      const options = await gestionnaireService.getGestionnaireOptions();
      
      console.log("Gestionnaires chargés:", options);
      setGestionnaireOptions(options || []);
      
    } catch (error) {
      console.error("Erreur chargement gestionnaires:", error);
      toast.error("Erreur lors du chargement des gestionnaires");
      setGestionnaireOptions([]);
    } finally {
      setLoadingGestionnaires(false);
    }
  };

  const fetchWilayas = async () => {
    try {
      const response = await comptabiliteService.getWilayas();
      
      console.log("🔍 Réponse wilayas brute:", response);
      
      let wilayasData = [];
      
      if (Array.isArray(response) && response.length > 0) {
        wilayasData = response
          .map(w => {
            if (!w || typeof w !== 'object') return null;
            const code = w.code || w.id || '';
            const nom = w.name || w.nom || w.libelle || `Wilaya ${code}`;
            if (!code) return null;
            return { code: String(code).padStart(2, '0'), nom: String(nom) };
          })
          .filter(w => w !== null);
        
        if (wilayasData.length > 0) {
          wilayasData.sort((a, b) => {
            const codeA = a.code || '';
            const codeB = b.code || '';
            return codeA.localeCompare(codeB);
          });
        }
        
        console.log(`✅ Wilayas formatées (${wilayasData.length}):`, wilayasData);
        
        if (wilayasData.length < 58) {
          console.warn(`⚠️ API n'a retourné que ${wilayasData.length} wilayas sur 58, utilisation de la liste statique`);
          setWilayas(wilayasStatiques);
        } else {
          setWilayas(wilayasData);
        }
        
      } else {
        console.warn("⚠️ Réponse API invalide, utilisation de la liste statique");
        setWilayas(wilayasStatiques);
      }
      
    } catch (error) {
      console.error("❌ Erreur chargement wilayas:", error);
      setWilayas(wilayasStatiques);
      toast.error("Erreur lors du chargement des wilayas, utilisation de la liste par défaut");
    }
  };

  const fetchRapport = async () => {
    try {
      setLoading(true);
      
      const params = {
        periode: filters.type_periode,
        ...(filters.type_periode === 'personnalise' 
          ? { date_debut: filters.date_debut, date_fin: filters.date_fin }
          : { date: filters.date }
        ),
        ...(filters.gestionnaire_id && { gestionnaire_id: filters.gestionnaire_id }),
        ...(filters.wilaya_id && { wilaya_id: filters.wilaya_id }),
      };
      
      const response = await comptabiliteService.getRapportGestionnaires(params);
      
      console.log("📊 Structure du rapport:", response.data);
      if (response.data?.details?.length > 0) {
        console.log("📊 Premier détail:", response.data.details[0]);
      }
      
      setRapport(response.data);
    } catch (error) {
      console.error("Erreur chargement rapport:", error);
      toast.error("Erreur lors du chargement du rapport");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'gestionnaire_id' && value) {
      const selectedGestionnaire = gestionnaireOptions.find(g => g.value === value);
      if (selectedGestionnaire) {
        setFilters(prev => ({
          ...prev,
          wilaya_id: selectedGestionnaire.wilaya_id || ''
        }));
      }
    }
  };

  const handlePeriodChange = (type) => {
    setFilters({
      ...filters,
      type_periode: type,
      date: type === "personnalise" ? "" : new Date().toISOString().split("T")[0],
      date_debut: type === "personnalise" ? filters.date_debut : "",
      date_fin: type === "personnalise" ? filters.date_fin : "",
    });
  };

  const handleSearch = () => {
    fetchRapport();
  };

  const handleExport = async (params) => {
    try {
      setExportLoading(true);
      await comptabiliteService.exportRapportGestionnaires({
        ...params,
        ...filters
      });
      toast.success("Export lancé avec succès");
      setShowExportModal(false);
    } catch (error) {
      console.error("Erreur export:", error);
      toast.error(error.message || "Erreur lors de l'export");
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportFormat = async (format) => {
    try {
      setExportLoading(true);
      
      const params = {
        periode: filters.type_periode,
        format: format,
        ...(filters.type_periode === 'personnalise' 
          ? { date_debut: filters.date_debut, date_fin: filters.date_fin }
          : { date: filters.date }
        ),
        ...(filters.gestionnaire_id && { gestionnaire_id: filters.gestionnaire_id }),
        ...(filters.wilaya_id && { wilaya_id: filters.wilaya_id }),
      };
      
      console.log(`📤 Export ${format} avec params:`, params);
      
      await comptabiliteService.exportRapportGestionnaires(params);
      toast.success(`Export ${format.toUpperCase()} lancé avec succès`);
    } catch (error) {
      console.error(`❌ Erreur export ${format}:`, error);
      toast.error(error.message || `Erreur lors de l'export ${format.toUpperCase()}`);
    } finally {
      setExportLoading(false);
    }
  };

  const getStatusBadge = (statut) => {
    const badges = {
      en_attente: {
        color: "bg-yellow-100 text-yellow-800",
        icon: FaClock,
        label: "En attente",
      },
      demande_envoyee: {
        color: "bg-blue-100 text-blue-800",
        icon: FaCheckCircle,
        label: "Demande envoyée",
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
    return badges[statut] || { color: "bg-gray-100 text-gray-800", icon: FaClock, label: statut };
  };

  const formatMontant = (montant) => {
    return comptabiliteService.formatMontant(montant || 0);
  };

  // Fonction pour obtenir le nom de la wilaya à partir du code
  const getWilayaName = (code) => {
    if (!code) return "";
    const wilaya = wilayas.find(w => w && w.code === code);
    return wilaya && wilaya.nom ? wilaya.nom : `Wilaya ${code}`;
  };

  // Calculer les totaux par statut en gérant les différents formats de données
  const getStatsByStatus = () => {
    if (!rapport?.details) return {};
    
    const stats = {
      en_attente: { count: 0, montant: 0 },
      demande_envoyee: { count: 0, montant: 0 },
      paye: { count: 0, montant: 0 },
      annule: { count: 0, montant: 0 }
    };
    
    rapport.details.forEach(detail => {
      // Essayer différents noms de champs possibles
      const statut = detail.statut || detail.status || 'en_attente';
      
      // Essayer différents noms de champs pour le montant
      let montant = 0;
      if (detail.total_commissions) montant = detail.total_commissions;
      else if (detail.montant_commission) montant = detail.montant_commission;
      else if (detail.montant) montant = detail.montant;
      
      // Essayer différents noms de champs pour le nombre de livraisons
      let count = 1;
      if (detail.nb_livraisons) count = detail.nb_livraisons;
      else if (detail.nombre_livraisons) count = detail.nombre_livraisons;
      
      if (stats[statut]) {
        stats[statut].count += count;
        stats[statut].montant += montant;
      }
    });
    
    return stats;
  };

  const statsByStatus = getStatsByStatus();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Onglets de navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => navigate("/comptabilite")}
          className={`px-4 py-2 text-sm font-medium transition ${
            location.pathname === "/comptabilite"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate("/comptabilite/rapport")}
          className={`px-4 py-2 text-sm font-medium transition ${
            location.pathname === "/comptabilite/rapport"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Rapport gains
        </button>
        <button
          onClick={() => navigate("/comptabilite/impayes")}
          className={`px-4 py-2 text-sm font-medium transition ${
            location.pathname === "/comptabilite/impayes"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Impayés
        </button>
        <button
          onClick={() => navigate("/comptabilite/historique")}
          className={`px-4 py-2 text-sm font-medium transition flex items-center gap-1 ${
            location.pathname === "/comptabilite/historique"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaHistory />
          Historique
        </button>
      </div>

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
              Rapport des gains - Gestionnaires
            </h1>
            <p className="text-gray-600">
              {rapport?.periode?.libelle || "Sélectionnez une période"}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleExportFormat("excel")}
              disabled={exportLoading || !rapport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              title="Exporter en Excel"
            >
              <FaFileExport />
              <span className="hidden md:inline">Excel</span>
            </button>
            <button
              onClick={() => handleExportFormat("pdf")}
              disabled={exportLoading || !rapport}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              title="Exporter en PDF"
            >
              <FaDownload />
              <span className="hidden md:inline">PDF</span>
            </button>
            <button
              onClick={() => handleExportFormat("csv")}
              disabled={exportLoading || !rapport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              title="Exporter en CSV"
            >
              <FaFileExport />
              <span className="hidden md:inline">CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période
            </label>
            <div className="flex flex-wrap gap-2">
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
              Wilaya
            </label>
            <div className="relative">
              <FaCity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                name="wilaya_id"
                value={filters.wilaya_id}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Toutes les wilayas</option>
                {wilayas.map((wilaya) => (
                  <option key={wilaya.code} value={wilaya.code}>
                    {wilaya.code} - {wilaya.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {wilayas.length} wilayas chargées
            </div>
          </div>
        </div>

        {/* Deuxième ligne de filtres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gestionnaire
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FaUserTie className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  name="gestionnaire_id"
                  value={filters.gestionnaire_id}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  disabled={loadingGestionnaires}
                >
                  <option value="">Tous les gestionnaires</option>
                  {gestionnaireOptions.length > 0 ? (
                    gestionnaireOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {getWilayaName(option.wilaya_id)}
                      </option>
                    ))
                  ) : (
                    !loadingGestionnaires && <option disabled>Aucun gestionnaire trouvé</option>
                  )}
                </select>
                {loadingGestionnaires && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaSync className="animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <FaSync className="animate-spin" /> : <FaSearch />}
              </button>
            </div>
            {gestionnaireOptions.length === 0 && !loadingGestionnaires && (
              <p className="mt-1 text-xs text-red-600">
                Aucun gestionnaire disponible
              </p>
            )}
          </div>

          {/* Résumé des filtres actifs */}
          {(filters.gestionnaire_id || filters.wilaya_id) && (
            <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-blue-700">Filtres actifs :</span>
              {filters.gestionnaire_id && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {gestionnaireOptions.find(g => g.value === filters.gestionnaire_id)?.label || 'Gestionnaire'}
                </span>
              )}
              {filters.wilaya_id && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {getWilayaName(filters.wilaya_id)} ({filters.wilaya_id})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Résultats */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : rapport ? (
        <div className="space-y-6">
          {/* Cartes de résumé */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Total commissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMontant(rapport.totaux?.total_commissions)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {rapport.totaux?.nb_gestionnaires} gestionnaires
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Moyenne par gestionnaire</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatMontant(rapport.totaux?.moyenne_par_gestionnaire)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Part société mère</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatMontant(rapport.totaux?.part_societe_mere)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Livraisons concernées</p>
              <p className="text-2xl font-bold text-green-600">
                {rapport.totaux?.nb_livraisons || 0}
              </p>
            </div>
          </div>

          {/* Statistiques par statut */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-800 mb-1 flex items-center gap-1">
                <FaClock className="text-yellow-600" />
                En attente
              </p>
              <p className="text-xl font-bold text-yellow-600">
                {formatMontant(statsByStatus.en_attente?.montant)}
              </p>
              <p className="text-xs text-yellow-700">{statsByStatus.en_attente?.count || 0} gains</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-800 mb-1 flex items-center gap-1">
                <FaCheckCircle className="text-blue-600" />
                Demandes envoyées
              </p>
              <p className="text-xl font-bold text-blue-600">
                {formatMontant(statsByStatus.demande_envoyee?.montant)}
              </p>
              <p className="text-xs text-blue-700">{statsByStatus.demande_envoyee?.count || 0} gains</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-800 mb-1 flex items-center gap-1">
                <FaCheckCircle className="text-green-600" />
                Payés
              </p>
              <p className="text-xl font-bold text-green-600">
                {formatMontant(statsByStatus.paye?.montant)}
              </p>
              <p className="text-xs text-green-700">{statsByStatus.paye?.count || 0} gains</p>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-sm text-red-800 mb-1 flex items-center gap-1">
                <FaTimesCircle className="text-red-600" />
                Annulés
              </p>
              <p className="text-xl font-bold text-red-600">
                {formatMontant(statsByStatus.annule?.montant)}
              </p>
              <p className="text-xs text-red-700">{statsByStatus.annule?.count || 0} gains</p>
            </div>
          </div>

          {/* Répartition par wilaya */}
          {rapport.par_wilaya && rapport.par_wilaya.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Répartition par wilaya
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Wilaya
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gestionnaire
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Livraisons
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total commissions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Part
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rapport.par_wilaya.map((wilaya, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaCity className="text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {getWilayaName(wilaya.code)} ({wilaya.code})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {wilaya.gestionnaire_nom || "Non assigné"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {wilaya.nb_livraisons}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatMontant(wilaya.total_commissions)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full"
                                style={{ width: `${wilaya.pourcentage || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">
                              {wilaya.pourcentage || 0}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top gestionnaires */}
          {rapport.top_gestionnaires && rapport.top_gestionnaires.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Top 5 des gestionnaires
                </h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {rapport.top_gestionnaires.map((g, index) => (
                    <div
                      key={g.id}
                      className="bg-gradient-to-br from-primary-50 to-white rounded-lg p-4 border border-primary-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-primary-600">
                          #{index + 1}
                        </span>
                        <span className="text-xs px-2 py-1 bg-primary-100 text-primary-800 rounded-full">
                          {getWilayaName(g.wilaya)} ({g.wilaya})
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mb-1">{g.nom}</p>
                      <p className="text-xs text-gray-500 mb-2">{g.email}</p>
                      <p className="text-lg font-bold text-primary-600">
                        {formatMontant(g.total_gains)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {g.nb_livraisons} livraisons
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Détail par gestionnaire */}
          {rapport.details && rapport.details.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Détail des gains par gestionnaire
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gestionnaire
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Wilaya
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Période
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Livraisons
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total commissions
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
                    {rapport.details.map((detail, index) => {
                      // Déterminer le statut
                      const statut = detail.statut || detail.status || 'en_attente';
                      const statusBadge = getStatusBadge(statut);
                      const StatusIcon = statusBadge.icon;
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FaUserTie className="text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {detail.gestionnaire_nom || 'Inconnu'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {detail.gestionnaire_email || ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {getWilayaName(detail.wilaya_code)} ({detail.wilaya_code})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {detail.periode || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {detail.nb_livraisons || 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatMontant(detail.total_commissions || detail.montant_commission || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {detail.pourcentage_applique || 0}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${statusBadge.color}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusBadge.label}
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
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Aucune donnée disponible pour la période sélectionnée
        </div>
      )}

      {/* Modal d'export */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        type="gestionnaires"
      />
    </div>
  );
};

export default RapportGains;