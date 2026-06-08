// src/components/Tables/LivraisonsTable.jsx
import React, { useMemo, useState } from "react";
import { EyeIcon, TrashIcon, XCircleIcon, PencilIcon } from "@heroicons/react/24/outline";
import {
  FaClock,
  FaTruck,
  FaBox,
  FaRoute,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaHourglassHalf,
  FaExchangeAlt,
  FaCheckDouble,
  FaCopy,
  FaTag,
  FaUndoAlt,
  FaCalculator,
  FaCheck,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import CancelLivraisonModal from "../Modals/CancelLivraisonModal";

// Configuration des statuts de paiement
const PAYMENT_STATUS_CONFIG = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: FaHourglassHalf },
  available: { label: "Disponible", color: "bg-blue-100 text-blue-800", icon: FaMoneyBillWave },
  in_transit: { label: "En transit", color: "bg-purple-100 text-purple-800", icon: FaExchangeAlt },
  paid: { label: "Payé", color: "bg-green-100 text-green-800", icon: FaCheckDouble },
};

// Liste des statuts de paiement pour le modal
const PAYMENT_STATUSES = [
  { value: 'pending', label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: FaHourglassHalf },
  { value: 'available', label: 'Disponible', color: 'bg-blue-100 text-blue-800', icon: FaMoneyBillWave },
  { value: 'in_transit', label: 'En transit', color: 'bg-purple-100 text-purple-800', icon: FaExchangeAlt },
  { value: 'paid', label: 'Payé', color: 'bg-green-100 text-green-800', icon: FaCheckDouble }
];

// Configuration des types de livraison pour l'affichage
const TYPE_LIVRAISON_LABELS = {
  Livraison: { label: "Livraison", color: "bg-blue-100 text-blue-800" },
  Échange: { label: "Échange", color: "bg-purple-100 text-purple-800" },
  "Pick-up": { label: "Pick-up", color: "bg-green-100 text-green-800" },
};

const PRESTATION_LABELS = {
  "A domicile": { label: "À domicile", color: "bg-green-100 text-green-800" },
  "Stop Desk": { label: "Stop Desk", color: "bg-orange-100 text-orange-800" },
};

// Configuration du type de livraison (normale, dépôt client, gratuite)
const TYPE_LIVRAISON_MODE_CONFIG = {
  normale: { label: "Normale", color: "bg-gray-100 text-gray-800", description: "Livraison standard avec ramassage à domicile" },
  depose: { label: "Dépôt client", color: "bg-blue-100 text-blue-800", description: "Colis déposé directement par le client" },
  gratuite: { label: "Gratuite", color: "bg-green-100 text-green-800", description: "Livraison gratuite - remise sur le colis" },
};

// Formatage des prix
const formatPrice = (price) => {
  if (price === 0 || !price) return "0 DA";
  return new Intl.NumberFormat('fr-DZ', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(price) + " DA";
};

// Calcul du total d'une livraison
const calculateTotal = (livraison) => {
  const prixColis = livraison?.prix_colis || livraison?.demande_livraison?.colis?.colis_prix || 0;
  const prixLivraison = livraison?.prix_livraison || livraison?.demande_livraison?.prix || 0;
  const isGratuite = livraison?.livraison_gratuite || false;
  return isGratuite ? prixColis - prixLivraison : prixColis + prixLivraison;
};

// ========== FONCTIONS UTILITAIRES ==========
const getClientFullName = (livraison) => {
  if (!livraison?.client) return "Client inconnu";
  const client = livraison.client;
  const nom = client.nom || "";
  const prenom = client.prenom || "";
  if (nom && prenom) return `${prenom} ${nom}`;
  if (nom) return nom;
  if (prenom) return prenom;
  return client.email || client.telephone || "Client inconnu";
};

const getClientTelephone = (livraison) => {
  if (!livraison?.client) return "Non spécifié";
  return livraison.client.telephone || "Non spécifié";
};

const getDestinataireName = (livraison) => {
  if (!livraison?.demande_livraison) return "Destinataire inconnu";
  const destinataire = livraison.demande_livraison.destinataire || {};
  const nom = destinataire.nom || "";
  const prenom = destinataire.prenom || "";
  if (nom && prenom) return `${prenom} ${nom}`;
  if (nom) return nom;
  if (prenom) return prenom;
  return destinataire.nom_complet || "Non spécifié";
};

const getDestinataireTelephone = (livraison) => {
  if (!livraison?.demande_livraison) return "Non spécifié";
  const destinataire = livraison.demande_livraison.destinataire || {};
  return destinataire.telephone || "Non spécifié";
};

// Fonction pour obtenir le badge du type de livraison
const getTypeLivraisonModeBadge = (livraison) => {
  const mode = livraison?.type_livraison_mode || "normale";
  const config = TYPE_LIVRAISON_MODE_CONFIG[mode] || TYPE_LIVRAISON_MODE_CONFIG.normale;
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`} title={config.description}>
      {config.label}
    </span>
  );
};

// Composant de bouton de copie avec feedback visuel
const CopyButton = ({ text, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    if (!text || text === "Non spécifié" || text === "Non attribué") return;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 transition-all duration-200 ${
        copied ? 'text-green-600' : 'text-gray-400 hover:text-blue-600'
      }`}
      title={`Copier ${label}`}
    >
      {copied ? (
        <>
          <FaCheck className="w-3 h-3" />
          <span className="text-xs">Copié !</span>
        </>
      ) : (
        <FaCopy className="w-3 h-3" />
      )}
    </button>
  );
};

// Composant Modal pour changer le statut de paiement
const PaymentStatusModal = ({ isOpen, onClose, livraison, onUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState(livraison?.payment_status || "pending");
  const [updating, setUpdating] = useState(false);

  if (!isOpen || !livraison) return null;

  const getPaymentStatusInfo = (status) => {
    const config = PAYMENT_STATUSES.find(s => s.value === status) || PAYMENT_STATUSES[0];
    return config;
  };

  const handleSubmit = async () => {
    if (!selectedStatus) {
      toast.error("Veuillez sélectionner un statut de paiement");
      return;
    }

    setUpdating(true);
    try {
      await onUpdate(livraison.id, selectedStatus);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setUpdating(false);
    }
  };

  const currentStatusInfo = getPaymentStatusInfo(livraison.payment_status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
        ></div>
        
        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-purple-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                <FaCreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Modifier le statut de paiement
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Livraison #{livraison.id?.substring(0, 8)}...
                </p>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Statut actuel
                  </label>
                  <div className={`mt-1 inline-flex px-3 py-1 rounded-full text-sm font-medium items-center gap-2 ${currentStatusInfo.color}`}>
                    {React.createElement(currentStatusInfo.icon, { className: "w-4 h-4" })}
                    {currentStatusInfo.label}
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Nouveau statut
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={updating}
                  >
                    {PAYMENT_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={updating}
              className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {updating ? "Mise à jour..." : "Mettre à jour"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={updating}
              className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LivraisonsTable = ({
  livraisons,
  onViewDetail,
  onEdit,
  onDelete,
  onCancelWithReturn,
  onUpdatePaymentStatus,
  getClientFullName: propGetClientFullName,
  getClientTelephone: propGetClientTelephone,
  getDestinataireName: propGetDestinataireName,
  getDestinataireTelephone: propGetDestinataireTelephone,
}) => {
  const clientFullNameFn = propGetClientFullName || getClientFullName;
  const clientTelephoneFn = propGetClientTelephone || getClientTelephone;
  const destinataireNameFn = propGetDestinataireName || getDestinataireName;
  const destinataireTelephoneFn = propGetDestinataireTelephone || getDestinataireTelephone;

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedLivraison, setSelectedLivraison] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  
  // États pour le modal de changement de statut de paiement
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentLivraison, setSelectedPaymentLivraison] = useState(null);

  // Données de la livraison sélectionnée
  const selectedLivraisonData = useMemo(() => {
    if (!selectedRowId) return null;
    return livraisons.find(l => l.id === selectedRowId);
  }, [selectedRowId, livraisons]);

  const selectedTotal = selectedLivraisonData ? calculateTotal(selectedLivraisonData) : null;
  const selectedPrixColis = selectedLivraisonData?.prix_colis || selectedLivraisonData?.demande_livraison?.colis?.colis_prix || 0;
  const selectedPrixLivraison = selectedLivraisonData?.prix_livraison || selectedLivraisonData?.demande_livraison?.prix || 0;
  const selectedIsGratuite = selectedLivraisonData?.livraison_gratuite || false;

  const getStatusBadge = (status) => {
    const statusConfig = {
      en_attente: { color: "bg-yellow-100 text-yellow-800", label: "En attente", icon: FaClock },
      prise_en_charge_ramassage: { color: "bg-blue-100 text-blue-800", label: "Prise en charge", icon: FaTruck },
      ramasse: { color: "bg-purple-100 text-purple-800", label: "Ramasse", icon: FaBox },
      en_transit: { color: "bg-indigo-100 text-indigo-800", label: "En transit", icon: FaRoute },
      prise_en_charge_livraison: { color: "bg-orange-100 text-orange-800", label: "En livraison", icon: FaTruck },
      livre: { color: "bg-green-100 text-green-800", label: "Livré", icon: FaCheckCircle },
      annule: { color: "bg-red-100 text-red-800", label: "Annulé", icon: FaExclamationTriangle },
    };
    const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800", label: status?.replace(/_/g, " ") || status, icon: FaExclamationTriangle };
    const Icon = config.icon;
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-2 ${config.color}`}>
        <Icon className="w-3 h-3" /> {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus, isAnnule) => {
    if (isAnnule) return null;
    if (!paymentStatus) {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"><FaCreditCard className="w-3 h-3" /> Non défini</span>;
    }
    const config = PAYMENT_STATUS_CONFIG[paymentStatus];
    if (!config) return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"><FaCreditCard className="w-3 h-3" /> {paymentStatus}</span>;
    const Icon = config.icon;
    return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}><Icon className="w-3 h-3" /> {config.label}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
    } catch { return "-"; }
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return "Non définie";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return "Date invalide"; }
  };

  const extractWilayaFromAddress = (address) => {
    if (!address || typeof address !== "string") return null;
    const wilayas = ["Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane"];
    const addressLower = address.toLowerCase();
    for (const wilaya of wilayas) {
      const wilayaLower = wilaya.toLowerCase();
      if (addressLower.includes(wilayaLower)) return wilaya;
    }
    return null;
  };

  const getLocationDisplay = (livraison) => {
    const wilayaDepart = livraison.demande_livraison?.addresse_depot ? extractWilayaFromAddress(livraison.demande_livraison.addresse_depot) : null;
    const wilayaArrivee = livraison.demande_livraison?.addresse_delivery ? extractWilayaFromAddress(livraison.demande_livraison.addresse_delivery) : livraison.demande_livraison?.wilaya || null;
    const commune = livraison.demande_livraison?.commune;
    if (!wilayaDepart && !wilayaArrivee && !commune) return "-";
    return (
      <div className="space-y-1">
        {wilayaDepart && <div className="flex items-center gap-1 text-xs"><span className="font-medium text-blue-700">{wilayaDepart}</span><span className="text-gray-400">→</span></div>}
        {wilayaArrivee && <div className="text-xs font-medium text-green-700">{wilayaArrivee}</div>}
        {commune && !wilayaDepart && !wilayaArrivee && <div className="text-xs text-gray-700">{commune}</div>}
      </div>
    );
  };

  const getColisDisplay = (livraison) => {
    const colis = livraison.demande_livraison?.colis || {};
    const prixLivraison = livraison?.prix_livraison || livraison.demande_livraison?.prix || 0;
    const prixColis = livraison?.prix_colis || colis.colis_prix || 0;
    const isGratuite = livraison?.livraison_gratuite || false;
    return (
      <div className="space-y-1">
        <div className="text-sm font-medium text-gray-900">{colis.colis_label || "N/A"}</div>
        <div className="flex items-center gap-3 text-sm text-gray-500"><span>{colis.poids || "0"} kg</span><span>•</span><span>{colis.colis_type || "Standard"}</span></div>
        {prixColis > 0 && <div className="flex items-center gap-1 text-xs font-medium text-purple-600"><FaMoneyBillWave className="w-3 h-3" /> Colis: {formatPrice(prixColis)}</div>}
        {prixLivraison > 0 && <div className="flex items-center gap-1 text-xs font-medium text-green-600"><FaTruck className="w-3 h-3" /> Livraison: {isGratuite ? `- ${formatPrice(prixLivraison)}` : formatPrice(prixLivraison)}</div>}
      </div>
    );
  };

  const getTypeDisplay = (livraison) => {
    const type = livraison.demande_livraison?.type_livraison || "Livraison";
    const prestation = livraison.demande_livraison?.prestation || "A domicile";
    const typeConfig = TYPE_LIVRAISON_LABELS[type] || TYPE_LIVRAISON_LABELS.Livraison;
    const prestationConfig = PRESTATION_LABELS[prestation] || PRESTATION_LABELS["A domicile"];
    return (
      <div className="space-y-1">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.color}`}>{type}</span>
        <div className="text-xs text-gray-500">{prestation}</div>
      </div>
    );
  };

  const getCreationDate = (livraison) => {
    if (livraison.created_at) return livraison.created_at;
    if (livraison.demande_livraison?.created_at) return livraison.demande_livraison.created_at;
    return null;
  };

  const canDelete = (livraison) => livraison.status !== "livre";
  const canCancel = (livraison) => livraison.status !== "annule" && livraison.status !== "livre";
  const canChangePaymentStatus = (livraison) => livraison.status === "livre";

  const handleDelete = (e, id) => { e.stopPropagation(); onDelete(id); };
  const handleCancelClick = (e, livraison) => { e.stopPropagation(); setSelectedLivraison(livraison); setCancelModalOpen(true); };
  const handleConfirmCancel = async (returnStatus) => {
    if (!selectedLivraison) return;
    setCancelling(true);
    try {
      await onCancelWithReturn(selectedLivraison.id, returnStatus);
      setCancelModalOpen(false);
      setSelectedLivraison(null);
    } finally {
      setCancelling(false);
    }
  };
  const handleEdit = (e, id) => { e.stopPropagation(); onEdit(id, e); };
  
  // Gestionnaire pour ouvrir le modal de paiement
  const handleOpenPaymentModal = (e, livraison) => {
    e.stopPropagation();
    setSelectedPaymentLivraison(livraison);
    setPaymentModalOpen(true);
  };

  // Gestion des clics
  const handleRowClick = (id, e) => {
    e.stopPropagation();
    setSelectedRowId(selectedRowId === id ? null : id);
  };

  const handleRowDoubleClick = (id, e) => {
    e.stopPropagation();
    onViewDetail(id);
  };

  const sortedLivraisons = [...livraisons].sort((a, b) => {
    const dateA = getCreationDate(a);
    const dateB = getCreationDate(b);
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return new Date(dateB) - new Date(dateA);
  });

  return (
    <div>
      {/* Modal de changement de statut de paiement */}
      <PaymentStatusModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedPaymentLivraison(null);
        }}
        livraison={selectedPaymentLivraison}
        onUpdate={onUpdatePaymentStatus}
      />

      {/* Affichage du total de la livraison sélectionnée en HAUT */}
      {selectedRowId && selectedLivraisonData && (
        <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaCalculator className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Détail de la livraison sélectionnée</h3>
            </div>
            <button onClick={() => setSelectedRowId(null)} className="text-xs text-gray-400 hover:text-gray-600">
              ✕ Fermer
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <FaBox className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-gray-600">Prix du colis</span>
              </div>
              <div className="text-lg font-bold text-purple-700">{formatPrice(selectedPrixColis)}</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <FaTruck className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-600">Prix de la livraison</span>
              </div>
              <div className="text-lg font-bold text-green-700">
                {selectedIsGratuite ? `- ${formatPrice(selectedPrixLivraison)}` : formatPrice(selectedPrixLivraison)}
              </div>
              {selectedIsGratuite && (
                <div className="text-xs text-green-600 mt-1">✓ Livraison gratuite</div>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-3 shadow-sm border border-indigo-200">
              <div className="flex items-center gap-2 mb-1">
                <FaCalculator className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-indigo-700">Total à payer</span>
              </div>
              <div className="text-xl font-bold text-indigo-700">{formatPrice(selectedTotal)}</div>
              <div className="text-xs text-indigo-600 mt-1">
                {selectedIsGratuite 
                  ? `${formatPrice(selectedPrixColis)} - ${formatPrice(selectedPrixLivraison)} = ${formatPrice(selectedTotal)}`
                  : `${formatPrice(selectedPrixColis)} + ${formatPrice(selectedPrixLivraison)} = ${formatPrice(selectedTotal)}`
                }
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"><div className="flex items-center gap-2"><FaCalendarAlt className="w-3 h-3" /> Date création</div></th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"><div className="flex items-center gap-2"><FaMapMarkerAlt className="w-3 h-3" /> Trajet</div></th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"><div className="flex items-center gap-2"><FaUser className="w-3 h-3" /> Client & Destinataire</div></th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"><div className="flex items-center gap-2"><FaBox className="w-3 h-3" /> Colis & Prix</div></th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"><div className="flex items-center gap-2"><FaTag className="w-3 h-3" /> Type / Prestation</div></th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Statut</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"><div className="flex items-center gap-2"><FaUndoAlt className="w-3 h-3" /> Statut Retour</div></th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"><div className="flex items-center gap-2"><FaCreditCard className="w-3 h-3" /> Statut Paiement</div></th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Livreurs</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Type livraison</th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedLivraisons.map((livraison) => {
              const isAnnule = livraison.status === "annule";
              const isLivre = livraison.status === "livre";
              const showDeleteBtn = canDelete(livraison);
              const showCancelBtn = canCancel(livraison);
              const showPaymentBtn = canChangePaymentStatus(livraison);
              const creationDate = getCreationDate(livraison);
              const clientName = clientFullNameFn(livraison);
              const clientPhone = clientTelephoneFn(livraison);
              const destinataireName = destinataireNameFn(livraison);
              const destinatairePhone = destinataireTelephoneFn(livraison);
              const isRowSelected = selectedRowId === livraison.id;
              
              const ramasseur = livraison.livreur_ramasseur;
              const distributeur = livraison.livreur_distributeur;
              const hasRamasseur = ramasseur && ramasseur !== 0 && ramasseur !== "0" && typeof ramasseur === 'object';
              const hasDistributeur = distributeur && distributeur !== 0 && distributeur !== "0" && typeof distributeur === 'object';
              const ramasseurName = hasRamasseur ? `${ramasseur.prenom || ramasseur.user?.prenom || ""} ${ramasseur.nom || ramasseur.user?.nom || ""}`.trim() : null;
              const distributeurName = hasDistributeur ? `${distributeur.prenom || distributeur.user?.prenom || ""} ${distributeur.nom || distributeur.user?.nom || ""}`.trim() : null;
              
              const isDepotClient = livraison?.demande_livraison?.depose_au_depot === true;

              return (
                <tr 
                  key={livraison.id} 
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${isRowSelected ? 'bg-indigo-50' : ''}`} 
                  onClick={(e) => handleRowClick(livraison.id, e)}
                  onDoubleClick={(e) => handleRowDoubleClick(livraison.id, e)}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{livraison.id?.substring(0, 8) || 'N/A'}...</div>
                    <div className="text-sm text-gray-500">PIN: {livraison.code_pin || 'N/A'}</div>
                    {isAnnule && <div className="text-xs text-red-600 mt-1">⚠️ Annulée</div>}
                    {isLivre && <div className="text-xs text-green-600 mt-1">✅ Livrée</div>}
                    {isRowSelected && <div className="text-xs text-indigo-600 mt-1">✓ Sélectionnée</div>}
                   </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    {creationDate ? <span className="text-sm font-medium text-gray-900">{formatFullDate(creationDate)}</span> : <span className="text-sm text-gray-400">-</span>}
                   </td>

                  <td className="px-4 py-4 whitespace-nowrap">{getLocationDisplay(livraison)}</td>
                  <td className="px-4 py-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                            <FaUser className="w-3 h-3 text-blue-600 flex-shrink-0" /> {clientName}
                          </div>
                          {clientPhone && clientPhone !== "Non spécifié" && (
                            <CopyButton text={clientPhone} label="le téléphone client" />
                          )}
                        </div>
                        {clientPhone && clientPhone !== "Non spécifié" && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 ml-5">
                            <FaPhone className="w-3 h-3 text-gray-400" />
                            <span className="font-mono">{clientPhone}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <FaUser className="w-3 h-3 text-green-600 flex-shrink-0" />
                            <span className="font-medium">{destinataireName}</span>
                          </div>
                          {destinatairePhone && destinatairePhone !== "Non spécifié" && (
                            <CopyButton text={destinatairePhone} label="le téléphone destinataire" />
                          )}
                        </div>
                        {destinatairePhone && destinatairePhone !== "Non spécifié" && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 ml-5">
                            <FaPhone className="w-3 h-3 text-gray-400" />
                            <span className="font-mono">{destinatairePhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                   </td>

                  <td className="px-4 py-4">{getColisDisplay(livraison)}</td>
                  <td className="px-4 py-4">{getTypeDisplay(livraison)}</td>

                  <td className="px-4 py-4">
                    {getStatusBadge(livraison.status)}
                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                      <div>Ramassage: {formatDate(livraison.date_ramassage)}</div>
                      <div>Livraison: {formatDate(livraison.date_livraison)}</div>
                    </div>
                   </td>

                  <td className={`px-4 py-4 text-center ${!isAnnule ? 'bg-gray-400' : ''}`}>
                    {isAnnule && livraison.return_status ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        livraison.return_status === 'chez_livreurs' ? 'bg-orange-100 text-orange-800' :
                        livraison.return_status === 'retour_en_traitement' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        <FaUndoAlt className="w-3 h-3" />
                        {livraison.return_status === 'chez_livreurs' && 'Chez livreurs'}
                        {livraison.return_status === 'retour_en_traitement' && 'Retour en traitement'}
                        {livraison.return_status === 'retour_prets' && 'Retour prêts'}
                      </span>
                    ) : (!isAnnule && <span className="text-xs text-gray-500">-</span>)}
                    </td>

                  <td className={`px-4 py-4 ${isAnnule ? 'bg-gray-400' : ''}`}>
                    {!isAnnule && (
                      <>
                        {getPaymentStatusBadge(livraison.payment_status, isAnnule)}
                        {livraison.payment_status === "pending" && <div className="mt-1 text-xs text-yellow-600">En attente de règlement</div>}
                        {livraison.payment_status === "available" && <div className="mt-1 text-xs text-blue-600">Fonds disponibles</div>}
                        {livraison.payment_status === "in_transit" && <div className="mt-1 text-xs text-purple-600">Transfert en cours</div>}
                        {livraison.payment_status === "paid" && <div className="mt-1 text-xs text-green-600">Paiement confirmé</div>}
                        {!livraison.payment_status && <div className="mt-1 text-xs text-gray-400">Non défini</div>}
                      </>
                    )}
                    </td>

                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      {!isDepotClient && (
                        <div>
                          <div className="text-xs text-gray-600">Ramasseur:</div>
                          <div className="text-sm font-medium">
                            {ramasseurName ? ramasseurName : <span className="text-gray-400">Non attribué</span>}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-gray-600">Distributeur:</div>
                        <div className="text-sm font-medium">
                          {distributeurName ? distributeurName : <span className="text-gray-400">Non attribué</span>}
                        </div>
                      </div>
                      {isDepotClient && (
                        <div className="text-xs text-blue-600 mt-1">⚡ Dépôt client - Pas de ramasseur nécessaire</div>
                      )}
                    </div>
                    </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    {getTypeLivraisonModeBadge(livraison)}
                    </td>

                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => onViewDetail(livraison.id)} className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 w-full">
                        <EyeIcon className="w-4 h-4" /> Voir
                      </button>
                      <button onClick={(e) => handleEdit(e, livraison.id)} className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 w-full">
                        <PencilIcon className="w-4 h-4" /> Modifier
                      </button>
                      {showPaymentBtn && (
                        <button onClick={(e) => handleOpenPaymentModal(e, livraison)} className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 w-full">
                          <FaCreditCard className="w-4 h-4" /> Paiement
                        </button>
                      )}
                      {showDeleteBtn && (
                        <button onClick={(e) => handleDelete(e, livraison.id)} className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 w-full">
                          <TrashIcon className="w-4 h-4" /> Supprimer
                        </button>
                      )}
                      {showCancelBtn && (
                        <button onClick={(e) => handleCancelClick(e, livraison)} className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 w-full">
                          <XCircleIcon className="w-4 h-4" /> Annuler
                        </button>
                      )}
                    </div>
                    </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {livraisons.length === 0 && (
        <div className="text-center py-12">
          <FaBox className="w-12 h-12 mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune livraison trouvée</h3>
          <p className="mt-1 text-gray-500">Aucune livraison ne correspond à vos critères.</p>
        </div>
      )}

      <CancelLivraisonModal 
        isOpen={cancelModalOpen} 
        onClose={() => { setCancelModalOpen(false); setSelectedLivraison(null); }} 
        onConfirm={handleConfirmCancel} 
        livraison={selectedLivraison} 
        loading={cancelling} 
      />
    </div>
  );
};

export default LivraisonsTable;