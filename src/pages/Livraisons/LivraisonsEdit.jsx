// src/pages/Livraisons/LivraisonsEdit.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaTruck,
  FaBox,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaMoneyBillWave,
  FaWeightHanging,
  FaBarcode,
  FaCalendarAlt,
  FaClock,
  FaCreditCard,
  FaInfoCircle,
  FaTag,
  FaSyncAlt,
  FaQrcode,
  FaExchangeAlt,
  FaHome,
  FaStore,
  FaCopy,
  FaUndoAlt,
  FaChevronDown,
  FaCheckCircle,
} from "react-icons/fa";
import livraisonService from "../../services/livraisonService";
import wilayaService from "../../services/wilayaService";

// Configuration des statuts
const STATUSES = [
  { value: "en_attente", label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  { value: "prise_en_charge_ramassage", label: "Prise en charge ramassage", color: "bg-blue-100 text-blue-800" },
  { value: "ramasse", label: "Ramasse", color: "bg-purple-100 text-purple-800" },
  { value: "en_transit", label: "En transit", color: "bg-indigo-100 text-indigo-800" },
  { value: "prise_en_charge_livraison", label: "Prise en charge livraison", color: "bg-orange-100 text-orange-800" },
  { value: "livre", label: "Livré", color: "bg-green-100 text-green-800" },
  { value: "annule", label: "Annulé", color: "bg-red-100 text-red-800" },
];

// Configuration des statuts de paiement
const PAYMENT_STATUSES = [
  { value: "pending", label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  { value: "available", label: "Disponible", color: "bg-blue-100 text-blue-800" },
  { value: "in_transit", label: "En transit", color: "bg-purple-100 text-purple-800" },
  { value: "paid", label: "Payé", color: "bg-green-100 text-green-800" },
];

// Configuration des statuts de retour
const RETURN_STATUSES = [
  { value: "chez_livreurs", label: "Chez livreurs", color: "bg-orange-100 text-orange-800", icon: FaTruck },
  { value: "retour_en_traitement", label: "Retour en traitement", color: "bg-yellow-100 text-yellow-800", icon: FaClock },
  { value: "retour_prets", label: "Retour prêts", color: "bg-green-100 text-green-800", icon: FaCheckCircle },
];

// Configuration des types de livraison
const TYPE_LIVRAISON_OPTIONS = [
  { value: "Livraison", label: "Livraison", color: "bg-blue-100 text-blue-800" },
  { value: "Échange", label: "Échange", color: "bg-purple-100 text-purple-800" },
  { value: "Pick-up", label: "Pick-up", color: "bg-green-100 text-green-800" },
];

// Configuration des prestations
const PRESTATION_OPTIONS = [
  { value: "A domicile", label: "À domicile", color: "bg-green-100 text-green-800" },
  { value: "Stop Desk", label: "Stop Desk", color: "bg-orange-100 text-orange-800" },
];

// Fonction pour copier du texte
const copyToClipboard = (text, label) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  toast.success(`${label} copié !`);
};

const LivraisonsEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingReturnStatus, setUpdatingReturnStatus] = useState(false);
  const [clients, setClients] = useState([]);
  const [livreurs, setLivreurs] = useState([]);
  
  const [wilayas, setWilayas] = useState([]);
  const [loadingWilayas, setLoadingWilayas] = useState(false);
  
  const [communesDepot, setCommunesDepot] = useState([]);
  const [loadingCommunesDepot, setLoadingCommunesDepot] = useState(false);
  
  const [communesLivraison, setCommunesLivraison] = useState([]);
  const [loadingCommunesLivraison, setLoadingCommunesLivraison] = useState(false);
  
  const [formData, setFormData] = useState({
    client_id: "",
    livreur_ramasseur_id: "",
    livreur_distributeur_id: "",
    code_pin: "",
    date_ramassage: "",
    date_livraison: "",
    status: "en_attente",
    payment_status: "pending",
    return_status: "",
    addresse_depot: "",
    addresse_delivery: "",
    info_additionnel: "",
    prix: "",
    wilaya_depot: "",
    commune_depot: "",
    wilaya: "",
    commune: "",
    type_livraison: "Livraison",
    prestation: "A domicile",
    colis_label: "",
    colis_poids: "",
    colis_type: "",
    colis_prix: "",
    livraison_gratuite: false,
  });
  
  const [originalData, setOriginalData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  useEffect(() => {
    fetchData();
    fetchSelectOptions();
    loadWilayas();
  }, [id]);
  
  const loadWilayas = async () => {
    try {
      setLoadingWilayas(true);
      const response = await wilayaService.getAllWilayas();
      
      let rawData = [];
      if (Array.isArray(response)) {
        rawData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response && response.wilayas && Array.isArray(response.wilayas)) {
        rawData = response.wilayas;
      } else {
        rawData = wilayaService.getWilayasList();
      }
      
      const normalizedWilayas = rawData.map(item => {
        if (item.code && item.nom) {
          return { code: item.code, nom: item.nom };
        }
        if (item.id && item.name) {
          return { code: item.id, nom: item.name };
        }
        if (item.id && item.nom) {
          return { code: item.id, nom: item.nom };
        }
        if (item.code && item.name) {
          return { code: item.code, nom: item.name };
        }
        return { code: item.code || item.id || '??', nom: item.nom || item.name || 'Inconnu' };
      });
      
      setWilayas(normalizedWilayas);
    } catch (error) {
      console.error("Erreur chargement wilayas:", error);
      setWilayas(wilayaService.getWilayasList());
    } finally {
      setLoadingWilayas(false);
    }
  };
  
  const loadCommunesDepot = async (wilayaCode) => {
    if (!wilayaCode) {
      setCommunesDepot([]);
      return;
    }
    try {
      setLoadingCommunesDepot(true);
      const response = await wilayaService.getCommunes(wilayaCode);
      
      let communesData = [];
      if (Array.isArray(response)) {
        communesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        communesData = response.data;
      } else if (response && response.communes && Array.isArray(response.communes)) {
        communesData = response.communes;
      }
      
      setCommunesDepot(communesData);
    } catch (error) {
      console.error("Erreur chargement communes dépôt:", error);
      setCommunesDepot([]);
    } finally {
      setLoadingCommunesDepot(false);
    }
  };
  
  const loadCommunesLivraison = async (wilayaCode) => {
    if (!wilayaCode) {
      setCommunesLivraison([]);
      return;
    }
    try {
      setLoadingCommunesLivraison(true);
      const response = await wilayaService.getCommunes(wilayaCode);
      
      let communesData = [];
      if (Array.isArray(response)) {
        communesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        communesData = response.data;
      } else if (response && response.communes && Array.isArray(response.communes)) {
        communesData = response.communes;
      }
      
      setCommunesLivraison(communesData);
    } catch (error) {
      console.error("Erreur chargement communes livraison:", error);
      setCommunesLivraison([]);
    } finally {
      setLoadingCommunesLivraison(false);
    }
  };
  
  const handleWilayaDepotChange = (e) => {
    const wilayaCode = e.target.value;
    setFormData(prev => ({ ...prev, wilaya_depot: wilayaCode, commune_depot: "" }));
    if (wilayaCode) {
      loadCommunesDepot(wilayaCode);
    } else {
      setCommunesDepot([]);
    }
  };
  
  const handleWilayaLivraisonChange = (e) => {
    const wilayaCode = e.target.value;
    setFormData(prev => ({ ...prev, wilaya: wilayaCode, commune: "" }));
    if (wilayaCode) {
      loadCommunesLivraison(wilayaCode);
    } else {
      setCommunesLivraison([]);
    }
  };
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await livraisonService.getLivraisonForEdit(id);
      
      if (response.success && response.data) {
        const { livraison, demande_livraison, colis, livreur_ramasseur, livreur_distributeur } = response.data;
        
        setFormData({
          client_id: livraison.client_id || "",
          livreur_ramasseur_id: livreur_ramasseur?.id || "",
          livreur_distributeur_id: livreur_distributeur?.id || "",
          code_pin: livraison.code_pin || "",
          date_ramassage: livraison.date_ramassage ? formatDateForInput(livraison.date_ramassage) : "",
          date_livraison: livraison.date_livraison ? formatDateForInput(livraison.date_livraison) : "",
          status: livraison.status || "en_attente",
          payment_status: livraison.payment_status || "pending",
          return_status: livraison.return_status || "",
          addresse_depot: demande_livraison?.addresse_depot || "",
          addresse_delivery: demande_livraison?.addresse_delivery || "",
          info_additionnel: demande_livraison?.info_additionnel || "",
          prix: demande_livraison?.prix || "",
          wilaya_depot: demande_livraison?.wilaya_depot || "",
          commune_depot: demande_livraison?.commune_depot || "",
          wilaya: demande_livraison?.wilaya || "",
          commune: demande_livraison?.commune || "",
          type_livraison: demande_livraison?.type_livraison || "Livraison",
          prestation: demande_livraison?.prestation || "A domicile",
          colis_label: colis?.colis_label || "",
          colis_poids: colis?.poids || "",
          colis_type: colis?.colis_type || "",
          colis_prix: colis?.colis_prix || "",
          livraison_gratuite: demande_livraison?.livraison_gratuite || false,
        });
        
        if (demande_livraison?.wilaya_depot) {
          await loadCommunesDepot(demande_livraison.wilaya_depot);
        }
        
        if (demande_livraison?.wilaya) {
          await loadCommunesLivraison(demande_livraison.wilaya);
        }
        
        setOriginalData(response.data);
      }
    } catch (error) {
      console.error("Erreur chargement données:", error);
      toast.error("Erreur lors du chargement des données de la livraison");
      navigate("/livraisons");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSelectOptions = async () => {
    try {
      const [clientsList, livreursList] = await Promise.all([
        livraisonService.getClientsForSelect(),
        livraisonService.getLivreursForSelect()
      ]);
      setClients(clientsList || []);
      setLivreurs(livreursList || []);
    } catch (error) {
      console.error("Erreur chargement options:", error);
    }
  };
  
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleUpdateReturnStatus = async (newReturnStatus) => {
    try {
      setUpdatingReturnStatus(true);
      await livraisonService.updateReturnStatus(id, newReturnStatus);
      setFormData(prev => ({ ...prev, return_status: newReturnStatus }));
      toast.success("Statut de retour mis à jour avec succès");
      
      if (originalData) {
        setOriginalData({
          ...originalData,
          livraison: { ...originalData.livraison, return_status: newReturnStatus }
        });
      }
    } catch (error) {
      console.error("Erreur mise à jour statut retour:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du statut de retour");
    } finally {
      setUpdatingReturnStatus(false);
    }
  };
  
  const hasChanges = () => {
    if (!originalData) return false;
    
    if (formData.status === "annule" && formData.return_status !== originalData.livraison?.return_status) {
      return true;
    }
    
    if (formData.livraison_gratuite !== originalData.demande_livraison?.livraison_gratuite) {
      return true;
    }
    
    for (const key in formData) {
      if (key === "return_status" || key === "livraison_gratuite") continue;
      if (formData[key] !== originalData.livraison?.[key] && 
          formData[key] !== originalData.demande_livraison?.[key] &&
          formData[key] !== originalData.colis?.[key]) {
        return true;
      }
    }
    return false;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasChanges()) {
      toast.info("Aucune modification détectée");
      return;
    }
    
    setShowConfirmModal(true);
  };
  
  const confirmSubmit = async () => {
    try {
      setSaving(true);
      setShowConfirmModal(false);
      
      const updateData = {};
      
      if (formData.client_id !== originalData?.livraison?.client_id) updateData.client_id = formData.client_id;
      if (formData.livreur_ramasseur_id !== originalData?.livreur_ramasseur?.id) updateData.livreur_ramasseur_id = formData.livreur_ramasseur_id;
      if (formData.livreur_distributeur_id !== originalData?.livreur_distributeur?.id) updateData.livreur_distributeur_id = formData.livreur_distributeur_id;
      if (formData.code_pin !== originalData?.livraison?.code_pin) updateData.code_pin = formData.code_pin;
      if (formData.date_ramassage !== originalData?.livraison?.date_ramassage) updateData.date_ramassage = formData.date_ramassage;
      if (formData.date_livraison !== originalData?.livraison?.date_livraison) updateData.date_livraison = formData.date_livraison;
      if (formData.status !== originalData?.livraison?.status) updateData.status = formData.status;
      if (formData.payment_status !== originalData?.livraison?.payment_status) updateData.payment_status = formData.payment_status;
      
      if (formData.status === "annule" && formData.return_status !== originalData?.livraison?.return_status) {
        updateData.return_status = formData.return_status;
      }
      
      if (formData.livraison_gratuite !== originalData?.demande_livraison?.livraison_gratuite) {
        updateData.livraison_gratuite = formData.livraison_gratuite;
      }
      
      if (formData.addresse_depot !== originalData?.demande_livraison?.addresse_depot) updateData.addresse_depot = formData.addresse_depot;
      if (formData.addresse_delivery !== originalData?.demande_livraison?.addresse_delivery) updateData.addresse_delivery = formData.addresse_delivery;
      if (formData.info_additionnel !== originalData?.demande_livraison?.info_additionnel) updateData.info_additionnel = formData.info_additionnel;
      if (parseFloat(formData.prix) !== parseFloat(originalData?.demande_livraison?.prix || 0)) {
        updateData.prix = formData.prix;
      }
      if (formData.wilaya_depot !== originalData?.demande_livraison?.wilaya_depot) updateData.wilaya_depot = formData.wilaya_depot;
      if (formData.commune_depot !== originalData?.demande_livraison?.commune_depot) updateData.commune_depot = formData.commune_depot;
      if (formData.wilaya !== originalData?.demande_livraison?.wilaya) updateData.wilaya = formData.wilaya;
      if (formData.commune !== originalData?.demande_livraison?.commune) updateData.commune = formData.commune;
      if (formData.type_livraison !== originalData?.demande_livraison?.type_livraison) updateData.type_livraison = formData.type_livraison;
      if (formData.prestation !== originalData?.demande_livraison?.prestation) updateData.prestation = formData.prestation;
      
      if (formData.colis_label !== originalData?.colis?.colis_label) updateData.colis_label = formData.colis_label;
      if (parseFloat(formData.colis_poids) !== parseFloat(originalData?.colis?.poids || 0)) updateData.colis_poids = formData.colis_poids;
      if (formData.colis_type !== originalData?.colis?.colis_type) updateData.colis_type = formData.colis_type;
      if (parseFloat(formData.colis_prix) !== parseFloat(originalData?.colis?.colis_prix || 0)) updateData.colis_prix = formData.colis_prix;
      
      await livraisonService.updateLivraisonAdmin(id, updateData);
      
      toast.success("Livraison mise à jour avec succès !");
      navigate("/livraisons");
      
    } catch (error) {
      console.error("Erreur mise à jour:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };
  
  const getStatusBadge = (status) => {
    const config = STATUSES.find(s => s.value === status);
    if (!config) return null;
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>{config.label}</span>;
  };
  
  const getReturnStatusBadge = (returnStatus) => {
    if (!returnStatus) return null;
    const config = RETURN_STATUSES.find(r => r.value === returnStatus);
    if (!config) return null;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };
  
  const isAnnule = formData.status === "annule";
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/livraisons")}
            className="flex items-center mb-4 text-primary-600 hover:text-primary-800"
          >
            <FaArrowLeft className="mr-2" /> Retour aux livraisons
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Modifier la livraison #{id.substring(0, 8)}...
            </h1>
            {getStatusBadge(formData.status)}
            {formData.livraison_gratuite && (
              <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                Livraison gratuite
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Vous pouvez modifier tous les champs ci-dessous, quel que soit le statut actuel.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/livraisons")}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FaTimes /> Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? <FaSyncAlt className="animate-spin" /> : <FaSave />}
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Informations générales */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
            <FaInfoCircle className="text-primary-600" />
            Informations générales
          </h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                className="w-full mt-1 input-field"
                required
              >
                <option value="">Sélectionner un client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.label} - {client.telephone}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaQrcode className="inline mr-1" /> Code PIN
              </label>
              <input
                type="text"
                name="code_pin"
                value={formData.code_pin}
                onChange={handleChange}
                maxLength={5}
                pattern="[0-9]{5}"
                className="w-full mt-1 font-mono input-field"
                placeholder="12345"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaTruck className="inline mr-1" /> Statut
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full mt-1 input-field"
              >
                {STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaCreditCard className="inline mr-1" /> Statut paiement
              </label>
              <select
                name="payment_status"
                value={formData.payment_status}
                onChange={handleChange}
                className="w-full mt-1 input-field"
              >
                {PAYMENT_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            
            {isAnnule && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <FaUndoAlt className="inline mr-1" /> Statut de retour
                </label>
                <div className="relative mt-1">
                  <select
                    value={formData.return_status}
                    onChange={(e) => handleUpdateReturnStatus(e.target.value)}
                    disabled={updatingReturnStatus}
                    className="w-full input-field"
                  >
                    <option value="">Sélectionner un statut de retour</option>
                    {RETURN_STATUSES.map(returnStatus => (
                      <option key={returnStatus.value} value={returnStatus.value}>
                        {returnStatus.label}
                      </option>
                    ))}
                  </select>
                  {updatingReturnStatus && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <FaSyncAlt className="w-4 h-4 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Le statut de retour permet de suivre l'état du colis retourné
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaCalendarAlt className="inline mr-1" /> Date de ramassage
              </label>
              <input
                type="datetime-local"
                name="date_ramassage"
                value={formData.date_ramassage}
                onChange={handleChange}
                className="w-full mt-1 input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaCalendarAlt className="inline mr-1" /> Date de livraison
              </label>
              <input
                type="datetime-local"
                name="date_livraison"
                value={formData.date_livraison}
                onChange={handleChange}
                className="w-full mt-1 input-field"
              />
            </div>
          </div>
          
          {isAnnule && formData.return_status && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Statut de retour actuel :</span>
                {getReturnStatusBadge(formData.return_status)}
              </div>
            </div>
          )}
        </div>
        
        {/* Section 2: Type de livraison et Prestation */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
            <FaTruck className="text-primary-600" />
            Type de prestation
          </h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type de livraison
              </label>
              <select
                name="type_livraison"
                value={formData.type_livraison}
                onChange={handleChange}
                className="w-full mt-1 input-field"
              >
                {TYPE_LIVRAISON_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type de prestation
              </label>
              <select
                name="prestation"
                value={formData.prestation}
                onChange={handleChange}
                className="w-full mt-1 input-field"
              >
                {PRESTATION_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Section 3: Livreurs */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
            <FaUser className="text-primary-600" />
            Livreurs assignés
          </h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Livreur ramasseur
              </label>
              <select
                name="livreur_ramasseur_id"
                value={formData.livreur_ramasseur_id}
                onChange={handleChange}
                className="w-full mt-1 input-field"
              >
                <option value="">Non assigné</option>
                {livreurs.map(livreur => (
                  <option key={livreur.id} value={livreur.id}>
                    {livreur.label} - {livreur.telephone}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Livreur distributeur
              </label>
              <select
                name="livreur_distributeur_id"
                value={formData.livreur_distributeur_id}
                onChange={handleChange}
                className="w-full mt-1 input-field"
              >
                <option value="">Non assigné</option>
                {livreurs.map(livreur => (
                  <option key={livreur.id} value={livreur.id}>
                    {livreur.label} - {livreur.telephone}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Section 4: Adresses */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
            <FaMapMarkerAlt className="text-primary-600" />
            Adresses et localisation
          </h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-blue-50">
              <h3 className="mb-3 font-medium text-blue-800">Point de dépôt</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-blue-700">Wilaya</label>
                  <select
                    name="wilaya_depot"
                    value={formData.wilaya_depot}
                    onChange={handleWilayaDepotChange}
                    className="w-full mt-1 input-field"
                    disabled={loadingWilayas}
                  >
                    <option value="">Sélectionner une wilaya</option>
                    {Array.isArray(wilayas) && wilayas.map((wilaya) => (
                      <option key={wilaya.code} value={wilaya.code}>
                        {wilaya.code} - {wilaya.nom}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-blue-700">Commune</label>
                  <select
                    name="commune_depot"
                    value={formData.commune_depot}
                    onChange={handleChange}
                    className="w-full mt-1 input-field"
                    disabled={!formData.wilaya_depot || loadingCommunesDepot}
                  >
                    <option value="">
                      {!formData.wilaya_depot 
                        ? "Sélectionnez d'abord une wilaya" 
                        : loadingCommunesDepot 
                          ? "Chargement des communes..." 
                          : "Sélectionner une commune"}
                    </option>
                    {Array.isArray(communesDepot) && communesDepot.map((commune) => (
                      <option key={commune} value={commune}>
                        {commune}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-blue-700">Adresse complète</label>
                  <textarea
                    name="addresse_depot"
                    value={formData.addresse_depot}
                    onChange={handleChange}
                    rows={2}
                    className="w-full mt-1 input-field"
                    placeholder="Adresse détaillée du point de dépôt"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-green-50">
              <h3 className="mb-3 font-medium text-green-800">Point de livraison</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-green-700">Wilaya</label>
                  <select
                    name="wilaya"
                    value={formData.wilaya}
                    onChange={handleWilayaLivraisonChange}
                    className="w-full mt-1 input-field"
                    disabled={loadingWilayas}
                  >
                    <option value="">Sélectionner une wilaya</option>
                    {Array.isArray(wilayas) && wilayas.map((wilaya) => (
                      <option key={wilaya.code} value={wilaya.code}>
                        {wilaya.code} - {wilaya.nom}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-green-700">Commune</label>
                  <select
                    name="commune"
                    value={formData.commune}
                    onChange={handleChange}
                    className="w-full mt-1 input-field"
                    disabled={!formData.wilaya || loadingCommunesLivraison}
                  >
                    <option value="">
                      {!formData.wilaya 
                        ? "Sélectionnez d'abord une wilaya" 
                        : loadingCommunesLivraison 
                          ? "Chargement des communes..." 
                          : "Sélectionner une commune"}
                    </option>
                    {Array.isArray(communesLivraison) && communesLivraison.map((commune) => (
                      <option key={commune} value={commune}>
                        {commune}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-green-700">Adresse complète</label>
                  <textarea
                    name="addresse_delivery"
                    value={formData.addresse_delivery}
                    onChange={handleChange}
                    rows={2}
                    className="w-full mt-1 input-field"
                    placeholder="Adresse détaillée de livraison"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Section 5: Colis et prix */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
            <FaBox className="text-primary-600" />
            Informations du colis et prix
          </h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaBarcode className="inline mr-1" /> Référence
              </label>
              <input
                type="text"
                name="colis_label"
                value={formData.colis_label}
                onChange={handleChange}
                className="w-full mt-1 input-field"
                placeholder="COLIS-XXXXX"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaWeightHanging className="inline mr-1" /> Poids (kg)
              </label>
              <input
                type="number"
                name="colis_poids"
                value={formData.colis_poids}
                onChange={handleChange}
                step="0.1"
                min="0"
                className="w-full mt-1 input-field"
                placeholder="0.0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaTag className="inline mr-1" /> Type de colis
              </label>
              <input
                type="text"
                name="colis_type"
                value={formData.colis_type}
                onChange={handleChange}
                className="w-full mt-1 input-field"
                placeholder="Ex: Standard, Fragile, Document, etc."
              />
              <p className="mt-1 text-xs text-gray-400">Entrez le type de colis librement</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaMoneyBillWave className="inline mr-1" /> Prix du colis (DA)
              </label>
              <input
                type="number"
                name="colis_prix"
                value={formData.colis_prix}
                onChange={handleChange}
                step="1"
                min="0"
                className="w-full mt-1 input-field"
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              <FaMoneyBillWave className="inline mr-1" /> Prix de livraison (DA)
            </label>
            <input
              type="number"
              name="prix"
              value={formData.prix}
              onChange={handleChange}
              step="1"
              min="0"
              className="w-full mt-1 input-field md:w-1/3"
              placeholder="Prix de la livraison"
            />
            
            <div className="flex items-center mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="livraison_gratuite"
                  checked={formData.livraison_gratuite || false}
                  onChange={(e) => {
                    const isGratuite = e.target.checked;
                    setFormData(prev => ({
                      ...prev,
                      livraison_gratuite: isGratuite,
                    }));
                  }}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  <FaMoneyBillWave className="inline mr-1 text-green-600" />
                  Livraison gratuite (remise sur le colis)
                </span>
              </label>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              <FaInfoCircle className="inline mr-1" /> Instructions spéciales
            </label>
            <textarea
              name="info_additionnel"
              value={formData.info_additionnel}
              onChange={handleChange}
              rows={3}
              className="w-full mt-1 input-field"
              placeholder="Informations supplémentaires pour le livreur..."
            />
          </div>
        </div>
      </form>
      
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowConfirmModal(false)}></div>
            
            <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-100">
                  <FaInfoCircle className="w-6 h-6 text-yellow-600" />
                </div>
                
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Confirmer la modification
                </h3>
                
                <p className="text-sm text-gray-500">
                  Êtes-vous sûr de vouloir enregistrer ces modifications ?
                </p>
                
                {formData.livraison_gratuite && (
                  <div className="mt-3 p-2 text-xs text-green-700 bg-green-50 rounded">
                    ⚡ La livraison est gratuite - le prix sera déduit du total
                  </div>
                )}
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmSubmit}
                    disabled={saving}
                    className="flex-1 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                  >
                    {saving ? "Enregistrement..." : "Confirmer"}
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

export default LivraisonsEdit;