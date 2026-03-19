// src/pages/Comptabilite/ImpayesList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import comptabiliteService from "../../services/comptabiliteService";
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaUserTie,
  FaCity,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaDownload,
  FaFilter,
  FaFileExport,
  FaSearch,
  FaCheckDouble,
  FaExclamationTriangle,
  FaSpinner,
  FaFileExcel,
  FaFilePdf,
  FaFileCsv,
  FaHistory,
} from "react-icons/fa";

const ImpayesList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [impayes, setImpayes] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedGains, setSelectedGains] = useState([]);
  const [filters, setFilters] = useState({
    gestionnaire: "",
    wilaya: "",
    periode: "",
    search: "",
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showAnnulerModal, setShowAnnulerModal] = useState(false);
  const [selectedGainId, setSelectedGainId] = useState(null);
  const [payAll, setPayAll] = useState(false);
  const [payNote, setPayNote] = useState("");
  const [gestionnaireOptions, setGestionnaireOptions] = useState([]);
  const [wilayas, setWilayas] = useState([]);

  // Liste statique des wilayas (fallback uniquement)
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

  useEffect(() => {
    fetchGestionnaireOptions();
    fetchWilayas();
    fetchImpayes();
  }, []);

  const fetchGestionnaireOptions = async () => {
    try {
      const gestionnaireService = (await import("../../services/gestionnaireService")).default;
      const options = await gestionnaireService.getGestionnaireOptions();
      setGestionnaireOptions(options || []);
    } catch (error) {
      console.error("Erreur chargement gestionnaires:", error);
    }
  };

  const fetchWilayas = async () => {
    try {
      const response = await comptabiliteService.getWilayas();
      console.log("📦 Réponse wilayas brute:", response);
      
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
      }
      
      if (wilayasData.length === 0) {
        console.warn("⚠️ Utilisation de la liste statique des wilayas");
        wilayasData = wilayasStatiques;
      }
      
      console.log("✅ Wilayas formatées:", wilayasData);
      setWilayas(wilayasData);
      
    } catch (error) {
      console.error("❌ Erreur chargement wilayas:", error);
      setWilayas(wilayasStatiques);
    }
  };

  const fetchImpayes = async () => {
    try {
      setLoading(true);
      const response = await comptabiliteService.getImpayes();
      console.log("📦 Impayés reçus:", response.data);
      
      const data = response.data;
      
      // Sauvegarder les données brutes
      setRawData(data);
      
      // Si c'est un tableau
      if (Array.isArray(data)) {
        // Calculer les totaux
        const total_impaye = data.reduce((sum, gain) => sum + (parseFloat(gain.montant_commission) || 0), 0);
        
        // Grouper par gestionnaire
        const parGestionnaire = {};
        data.forEach(gain => {
          const gestionnaire = gain.gestionnaire || {};
          const user = gestionnaire.user || {};
          
          const id = gain.gestionnaire_id;
          if (!id) return;
          
          let nom = 'Gestionnaire inconnu';
          if (user.prenom && user.nom) {
            nom = `${user.prenom} ${user.nom}`;
          } else if (user.nom) {
            nom = user.nom;
          } else if (gestionnaire.nom) {
            nom = gestionnaire.nom;
          }
          
          if (!parGestionnaire[id]) {
            parGestionnaire[id] = {
              gestionnaire_id: id,
              nom: nom,
              email: user.email || gestionnaire.email || '',
              wilaya_code: gestionnaire.wilaya_id || '',
              montant_total: 0,
              nb_livraisons: 0
            };
          }
          parGestionnaire[id].montant_total += parseFloat(gain.montant_commission) || 0;
          parGestionnaire[id].nb_livraisons++;
        });
        
        // Formater les détails
        const details = data.map(gain => {
          const gestionnaire = gain.gestionnaire || {};
          const user = gestionnaire.user || {};
          
          let nom = 'Gestionnaire inconnu';
          if (user.prenom && user.nom) {
            nom = `${user.prenom} ${user.nom}`;
          } else if (user.nom) {
            nom = user.nom;
          } else if (gestionnaire.nom) {
            nom = gestionnaire.nom;
          }
          
          return {
            id: gain.id,
            gestionnaire_id: gain.gestionnaire_id,
            gestionnaire_nom: nom,
            gestionnaire_email: user.email || gestionnaire.email || '',
            wilaya_code: gestionnaire.wilaya_id || '',
            livraison_id: gain.livraison_id,
            periode: gain.periode || (gain.created_at ? new Date(gain.created_at).toISOString().slice(0, 7) : ''),
            total_commissions: parseFloat(gain.montant_commission) || 0,
            pourcentage_applique: gain.pourcentage_applique || 0,
            status: gain.status || 'en_attente',
            date_demande: gain.date_demande,
            date_paiement: gain.date_paiement,
            note_admin: gain.note_admin
          };
        });
        
        setImpayes({
          total_impaye: total_impaye,
          nb_total: data.length,
          par_gestionnaire: Object.values(parGestionnaire),
          details: details
        });
      } else {
        setImpayes(data);
      }
      
    } catch (error) {
      console.error("❌ Erreur chargement impayés:", error);
      toast.error("Erreur lors du chargement des impayés");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    const filtered = getFilteredGains();
    if (selectedGains.length === filtered.length) {
      setSelectedGains([]);
    } else {
      setSelectedGains(filtered.map((g) => g.id));
    }
  };

  const handleSelectGain = (gainId) => {
    if (selectedGains.includes(gainId)) {
      setSelectedGains(selectedGains.filter((id) => id !== gainId));
    } else {
      setSelectedGains([...selectedGains, gainId]);
    }
  };

  const handlePayerGain = async (gainId) => {
    try {
      setProcessing(true);
      const response = await comptabiliteService.marquerPaye(gainId, payNote || "Payé par l'admin");
      toast.success(response.message || "Gain marqué comme payé");
      setPayNote("");
      setSelectedGainId(null);
      setShowAnnulerModal(false);
      fetchImpayes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors du paiement");
    } finally {
      setProcessing(false);
    }
  };

  const handleAnnulerGain = async (gainId) => {
    try {
      setProcessing(true);
      const response = await comptabiliteService.annulerGain(gainId, payNote || "Annulé par l'admin");
      toast.success(response.message || "Gain annulé avec succès");
      setPayNote("");
      setSelectedGainId(null);
      setShowAnnulerModal(false);
      fetchImpayes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'annulation");
    } finally {
      setProcessing(false);
    }
  };

  const handleMarquerPayes = async () => {
    if (selectedGains.length === 0) {
      toast.error("Veuillez sélectionner au moins un gain");
      return;
    }

    try {
      setProcessing(true);
      const response = await comptabiliteService.marquerPayes(selectedGains, payNote || null);
      toast.success(response.message || `${selectedGains.length} gains marqués comme payés`);
      setSelectedGains([]);
      setPayNote("");
      setShowPayModal(false);
      fetchImpayes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors du marquage des paiements");
    } finally {
      setProcessing(false);
    }
  };

  const handleMarquerPeriodePayee = async () => {
    try {
      setProcessing(true);
      const periode = filters.periode || new Date().toISOString().slice(0, 7);
      
      const gainsIds = getFilteredGains().map(g => g.id);
      
      if (gainsIds.length === 0) {
        toast.error("Aucun gain à marquer pour cette période");
        return;
      }
      
      const response = await comptabiliteService.marquerPayes(gainsIds, `Paiement période ${periode}`);
      toast.success(response.message || `${gainsIds.length} gains marqués comme payés`);
      setShowPayModal(false);
      setPayAll(false);
      fetchImpayes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors du marquage des paiements");
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = async (format = "excel") => {
    try {
      await comptabiliteService.exportRapportGestionnaires({
        periode: "personnalise",
        date_debut: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        date_fin: new Date().toISOString().split("T")[0],
        statut: "en_attente,demande_envoyee",
        gestionnaire_id: filters.gestionnaire || undefined,
        wilaya_id: filters.wilaya || undefined,
        format: format
      });
      toast.success("Export lancé avec succès");
      setShowExportModal(false);
    } catch (error) {
      toast.error("Erreur lors de l'export");
    }
  };

  const getWilayaName = (code) => {
    if (!code) return "";
    const wilaya = wilayas.find(w => w && w.code === code);
    return wilaya ? wilaya.nom : `Wilaya ${code}`;
  };

  const getFilteredGains = () => {
    if (!impayes?.details) return [];

    return impayes.details.filter((gain) => {
      if (filters.gestionnaire && gain.gestionnaire_id !== filters.gestionnaire)
        return false;
      if (filters.wilaya && gain.wilaya_code !== filters.wilaya) return false;
      if (filters.periode && gain.periode !== filters.periode) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          gain.gestionnaire_nom?.toLowerCase().includes(searchLower) ||
          getWilayaName(gain.wilaya_code)?.toLowerCase().includes(searchLower) ||
          gain.livraison_id?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  };

  const formatMontant = (montant) => {
    return comptabiliteService.formatMontant(montant || 0);
  };

  const getPeriodes = () => {
    const periodes = [];
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      periodes.push(date.toISOString().slice(0, 7));
    }
    return periodes;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'en_attente':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'En attente', icon: FaClock };
      case 'demande_envoyee':
        return { color: 'bg-blue-100 text-blue-800', label: 'Demande envoyée', icon: FaCheckCircle };
      case 'paye':
        return { color: 'bg-green-100 text-green-800', label: 'Payé', icon: FaCheckCircle };
      case 'annule':
        return { color: 'bg-red-100 text-red-800', label: 'Annulé', icon: FaTimesCircle };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: status, icon: FaClock };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const filteredGains = getFilteredGains();
  const totalSelectionne = selectedGains.reduce((sum, id) => {
    const gain = filteredGains.find((g) => g.id === id);
    return sum + (gain?.total_commissions || 0);
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Onglets */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => navigate("/comptabilite/impayes")}
          className={`px-4 py-2 text-sm font-medium transition ${
            location.pathname === "/comptabilite/impayes"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Impayés en cours
        </button>
        <button
          onClick={() => navigate("/comptabilite/historique")}
          className={`px-4 py-2 text-sm font-medium transition ${
            location.pathname === "/comptabilite/historique"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaHistory className="inline mr-1" />
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
              Gestion des impayés - Gestionnaires
            </h1>
            <p className="text-gray-600">
              Total impayés : {formatMontant(impayes?.total_impaye)} (
              {impayes?.nb_total || 0} gains)
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              disabled={processing}
            >
              <FaFileExport /> Exporter
            </button>
            {selectedGains.length > 0 && (
              <button
                onClick={() => setShowPayModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                disabled={processing}
              >
                <FaCheckCircle /> Marquer comme payés ({selectedGains.length})
              </button>
            )}
            <button
              onClick={() => {
                setPayAll(true);
                setShowPayModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              disabled={processing}
            >
              <FaCheckDouble /> Tout payer (période)
            </button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gestionnaire
            </label>
            <select
              value={filters.gestionnaire}
              onChange={(e) =>
                setFilters({ ...filters, gestionnaire: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Tous les gestionnaires</option>
              {gestionnaireOptions.map((gestionnaire) => (
                <option key={gestionnaire.value} value={gestionnaire.value}>
                  {gestionnaire.label} - {getWilayaName(gestionnaire.wilaya_id)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wilaya
            </label>
            <select
              value={filters.wilaya}
              onChange={(e) =>
                setFilters({ ...filters, wilaya: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Toutes les wilayas</option>
              {wilayas.map((wilaya) => (
                <option key={wilaya.code} value={wilaya.code}>
                  {wilaya.code} - {wilaya.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période
            </label>
            <select
              value={filters.periode}
              onChange={(e) =>
                setFilters({ ...filters, periode: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Toutes les périodes</option>
              {getPeriodes().map((periode) => (
                <option key={periode} value={periode}>
                  {new Date(periode + "-01").toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recherche
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => setFilters({ gestionnaire: "", wilaya: "", periode: "", search: "" })}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            <FaFilter /> Réinitialiser
          </button>
        </div>
      </div>

      {/* Résumé par gestionnaire */}
      {impayes?.par_gestionnaire && impayes.par_gestionnaire.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {impayes.par_gestionnaire.map((gestionnaire) => (
            <div
              key={gestionnaire.gestionnaire_id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => {
                setFilters({
                  ...filters,
                  gestionnaire: gestionnaire.gestionnaire_id,
                });
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FaUserTie className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{gestionnaire.nom}</p>
                  <p className="text-sm text-gray-600">
                    {getWilayaName(gestionnaire.wilaya_code)} ({gestionnaire.wilaya_code})
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total impayé</span>
                <span className="font-bold text-red-600">
                  {formatMontant(gestionnaire.montant_total)}
                </span>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {gestionnaire.nb_livraisons} livraisons
                </span>
                <span className="text-xs text-primary-600">
                  Cliquer pour filtrer
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tableau des gains impayés */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Détail des impayés{" "}
            {filteredGains.length > 0 && `(${filteredGains.length})`}
          </h2>
          {filteredGains.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              {selectedGains.length === filteredGains.length
                ? "Tout désélectionner"
                : "Tout sélectionner"}
            </button>
          )}
        </div>

        {filteredGains.length === 0 ? (
          <div className="text-center py-12">
            <FaExclamationTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun impayé trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={
                        selectedGains.length === filteredGains.length &&
                        filteredGains.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gestionnaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wilaya
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Livraison
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % appliqué
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGains.map((gain) => {
                  const statusBadge = getStatusBadge(gain.status);
                  const StatusIcon = statusBadge.icon;
                  return (
                    <tr key={gain.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedGains.includes(gain.id)}
                          onChange={() => handleSelectGain(gain.id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          disabled={gain.status === 'paye' || gain.status === 'annule'}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <FaUserTie className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {gain.gestionnaire_nom}
                            </p>
                            <p className="text-xs text-gray-500">
                              {gain.gestionnaire_email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600">
                          {getWilayaName(gain.wilaya_code)} ({gain.wilaya_code})
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600">
                          {gain.livraison_id?.substring(0, 8)}...
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          {gain.periode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-semibold text-red-600">
                          {formatMontant(gain.total_commissions)}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600">
                          {gain.pourcentage_applique}%
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {gain.status === 'demande_envoyee' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedGainId(gain.id);
                                  setPayNote("");
                                  handlePayerGain(gain.id);
                                }}
                                disabled={processing}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition flex items-center gap-1 disabled:opacity-50"
                              >
                                <FaCheckCircle className="w-3 h-3" />
                                Payer
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedGainId(gain.id);
                                  setPayNote("");
                                  setShowAnnulerModal(true);
                                }}
                                disabled={processing}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition flex items-center gap-1 disabled:opacity-50"
                              >
                                <FaTimesCircle className="w-3 h-3" />
                                Annuler
                              </button>
                            </>
                          )}
                          {gain.status === 'en_attente' && (
                            <span className="text-xs text-gray-500 italic flex items-center gap-1">
                              <FaClock className="w-3 h-3" />
                              En attente
                            </span>
                          )}
                          {gain.status === 'paye' && (
                            <span className="text-xs text-green-600 italic flex items-center gap-1">
                              <FaCheckCircle className="w-3 h-3" />
                              Payé
                            </span>
                          )}
                          {gain.status === 'annule' && (
                            <span className="text-xs text-red-600 italic flex items-center gap-1">
                              <FaTimesCircle className="w-3 h-3" />
                              Annulé
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pied de tableau avec total */}
        {filteredGains.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  {selectedGains.length} gain(s) sélectionné(s)
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total sélectionné</p>
                <p className="text-xl font-bold text-primary-600">
                  {formatMontant(totalSelectionne)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmation de paiement multiple */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {payAll
                  ? "Marquer une période comme payée"
                  : "Confirmer le paiement multiple"}
              </h2>
            </div>

            <div className="p-6">
              {payAll ? (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Vous allez marquer tous les gains comme payés pour :
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Période
                    </label>
                    <select
                      value={filters.periode || new Date().toISOString().slice(0, 7)}
                      onChange={(e) =>
                        setFilters({ ...filters, periode: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      {getPeriodes().map((periode) => (
                        <option key={periode} value={periode}>
                          {new Date(periode + "-01").toLocaleDateString("fr-FR", {
                            month: "long",
                            year: "numeric",
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                  {filters.gestionnaire && (
                    <p className="text-sm text-gray-600">
                      Gestionnaire: {
                        gestionnaireOptions.find(
                          (g) => g.value === filters.gestionnaire
                        )?.label
                      }
                    </p>
                  )}
                  {filters.wilaya && (
                    <p className="text-sm text-gray-600">
                      Wilaya: {getWilayaName(filters.wilaya)} ({filters.wilaya})
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Vous êtes sur le point de marquer <span className="font-bold">{selectedGains.length}</span>{" "}
                    gain(s) comme payés pour un montant total de{" "}
                    <span className="font-bold text-green-600">{formatMontant(totalSelectionne)}</span>.
                  </p>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note (optionnelle)
                    </label>
                    <textarea
                      value={payNote}
                      onChange={(e) => setPayNote(e.target.value)}
                      placeholder="Ajouter une note..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Cette action est irréversible. Les gestionnaires concernés seront notifiés par email.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPayModal(false);
                  setPayAll(false);
                  setPayNote("");
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                disabled={processing}
              >
                Annuler
              </button>
              <button
                onClick={payAll ? handleMarquerPeriodePayee : handleMarquerPayes}
                disabled={processing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {processing ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Confirmer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'annulation individuelle */}
      {showAnnulerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Confirmer l'annulation</h2>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Êtes-vous sûr de vouloir annuler ce gain ?
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motif d'annulation (optionnel)
                  </label>
                  <textarea
                    value={payNote}
                    onChange={(e) => setPayNote(e.target.value)}
                    placeholder="Raison de l'annulation..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <p className="text-sm text-gray-500">
                  Cette action est irréversible. Le gestionnaire sera notifié par email.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAnnulerModal(false);
                  setPayNote("");
                  setSelectedGainId(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                disabled={processing}
              >
                Retour
              </button>
              <button
                onClick={() => handleAnnulerGain(selectedGainId)}
                disabled={processing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {processing ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <FaTimesCircle />
                    Confirmer l'annulation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'export */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Exporter les impayés
              </h2>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format d'export
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleExport("excel")}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      <FaFileExcel className="w-6 h-6 text-green-600" />
                      <span className="text-xs text-gray-600">Excel</span>
                    </button>
                    <button
                      onClick={() => handleExport("pdf")}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      <FaFilePdf className="w-6 h-6 text-red-600" />
                      <span className="text-xs text-gray-600">PDF</span>
                    </button>
                    <button
                      onClick={() => handleExport("csv")}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      <FaFileCsv className="w-6 h-6 text-blue-600" />
                      <span className="text-xs text-gray-600">CSV</span>
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  L'export inclura {filteredGains.length} gains impayés
                  {filters.gestionnaire && " pour le gestionnaire sélectionné"}
                  {filters.wilaya && ` pour la wilaya ${getWilayaName(filters.wilaya)}`}
                  {filters.periode && ` pour la période ${filters.periode}`}.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpayesList;