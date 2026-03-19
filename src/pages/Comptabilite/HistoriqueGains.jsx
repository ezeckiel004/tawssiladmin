// src/pages/Comptabilite/HistoriqueGains.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../services/api";
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
  FaTrash,
  FaExclamationTriangle,
  FaSpinner,
  FaHistory,
} from "react-icons/fa";

const HistoriqueGains = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGainId, setSelectedGainId] = useState(null);
  const [filters, setFilters] = useState({
    gestionnaire: "",
    wilaya: "",
    periode: "",
    search: "",
  });
  const [gestionnaireOptions, setGestionnaireOptions] = useState([]);
  const [wilayas, setWilayas] = useState([]);
  const [stats, setStats] = useState({
    total_paye: 0,
    total_annule: 0,
    montant_total_paye: 0,
    montant_total_annule: 0,
  });

  // Liste statique des wilayas (fallback)
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
    fetchHistorique();
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
      
      setWilayas(wilayasData);
      
    } catch (error) {
      console.error("❌ Erreur chargement wilayas:", error);
      setWilayas(wilayasStatiques);
    }
  };

  const fetchHistorique = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/historique/gains');
      console.log("📦 Historique reçu:", response.data);
      
      const data = response.data.data || [];
      setHistorique(data);
      
      // Calculer les statistiques
      const totalPaye = data.filter(g => g.status === 'paye').length;
      const totalAnnule = data.filter(g => g.status === 'annule').length;
      const montantPaye = data
        .filter(g => g.status === 'paye')
        .reduce((sum, g) => sum + parseFloat(g.montant_commission), 0);
      const montantAnnule = data
        .filter(g => g.status === 'annule')
        .reduce((sum, g) => sum + parseFloat(g.montant_commission), 0);
      
      setStats({
        total_paye: totalPaye,
        total_annule: totalAnnule,
        montant_total_paye: montantPaye,
        montant_total_annule: montantAnnule,
      });
      
    } catch (error) {
      console.error("❌ Erreur chargement historique:", error);
      toast.error("Erreur lors du chargement de l'historique");
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimerGain = async () => {
    if (!selectedGainId) return;
    
    try {
      setProcessing(true);
      const response = await api.delete(`/admin/historique/gains/${selectedGainId}`);
      toast.success(response.data.message || "Gain supprimé de l'historique");
      setShowDeleteModal(false);
      setSelectedGainId(null);
      fetchHistorique(); // Rafraîchir la liste
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setProcessing(false);
    }
  };

  const getWilayaName = (code) => {
    if (!code) return "";
    const wilaya = wilayas.find(w => w && w.code === code);
    return wilaya ? wilaya.nom : `Wilaya ${code}`;
  };

  const getFilteredHistorique = () => {
    return historique.filter((gain) => {
      const gestionnaire = gain.gestionnaire || {};
      const user = gestionnaire.user || {};
      const gestionnaireNom = user.prenom && user.nom ? `${user.prenom} ${user.nom}` : 'Inconnu';
      const wilayaCode = gestionnaire.wilaya_id || '';
      const periode = gain.created_at ? new Date(gain.created_at).toISOString().slice(0, 7) : '';
      
      if (filters.gestionnaire && gain.gestionnaire_id !== filters.gestionnaire)
        return false;
      if (filters.wilaya && wilayaCode !== filters.wilaya) return false;
      if (filters.periode && periode !== filters.periode) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          gestionnaireNom.toLowerCase().includes(searchLower) ||
          getWilayaName(wilayaCode).toLowerCase().includes(searchLower) ||
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

  const filteredHistorique = getFilteredHistorique();

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
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaHistory className="text-primary-600" />
              Historique des gains traités
            </h1>
            <p className="text-gray-600">
              Consultez les gains déjà payés ou annulés
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Gains payés</p>
              <p className="text-xl font-bold text-gray-900">{stats.total_paye}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FaTimesCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Gains annulés</p>
              <p className="text-xl font-bold text-gray-900">{stats.total_annule}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaMoneyBillWave className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Montant total payé</p>
              <p className="text-xl font-bold text-green-600">{formatMontant(stats.montant_total_paye)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FaMoneyBillWave className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Montant total annulé</p>
              <p className="text-xl font-bold text-red-600">{formatMontant(stats.montant_total_annule)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {/* Tableau de l'historique */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Historique des gains ({filteredHistorique.length})
          </h2>
        </div>

        {filteredHistorique.length === 0 ? (
          <div className="text-center py-12">
            <FaHistory className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun gain dans l'historique</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date traitement
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
                    Type
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
                    Note
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistorique.map((gain) => {
                  const gestionnaire = gain.gestionnaire || {};
                  const user = gestionnaire.user || {};
                  const nomGestionnaire = user.prenom && user.nom 
                    ? `${user.prenom} ${user.nom}` 
                    : 'Inconnu';
                  const statusBadge = getStatusBadge(gain.status);
                  const StatusIcon = statusBadge.icon;
                  
                  return (
                    <tr key={gain.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {gain.date_paiement 
                          ? new Date(gain.date_paiement).toLocaleDateString('fr-FR')
                          : gain.updated_at 
                            ? new Date(gain.updated_at).toLocaleDateString('fr-FR')
                            : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <FaUserTie className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {nomGestionnaire}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.email || ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600">
                          {getWilayaName(gestionnaire.wilaya_id)} ({gestionnaire.wilaya_id})
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600">
                          {gain.livraison_id?.substring(0, 8)}...
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          gain.wilaya_type === 'depart' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {gain.wilaya_type === 'depart' ? 'Départ' : 'Arrivée'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className={`text-sm font-semibold ${
                          gain.status === 'paye' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatMontant(gain.montant_commission)}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {gain.pourcentage_applique}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-xs text-gray-600 max-w-xs truncate" title={gain.note_admin}>
                          {gain.note_admin || '-'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedGainId(gain.id);
                            setShowDeleteModal(true);
                          }}
                          disabled={processing}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          title="Supprimer de l'historique"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Confirmer la suppression</h2>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-yellow-600 bg-yellow-50 p-4 rounded-lg">
                  <FaExclamationTriangle className="w-6 h-6" />
                  <p className="text-sm">
                    Cette action est irréversible. Le gain sera définitivement supprimé de l'historique.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedGainId(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                disabled={processing}
              >
                Annuler
              </button>
              <button
                onClick={handleSupprimerGain}
                disabled={processing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {processing ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <FaTrash />
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoriqueGains;