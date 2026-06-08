// src/pages/Livraisons/LivraisonsCreate.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  FaCreditCard,
  FaInfoCircle,
  FaTag,
  FaSyncAlt,
  FaUserPlus,
  FaStore,
  FaHome,
  FaCopy,
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

const LivraisonsCreate = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [livreurs, setLivreurs] = useState([]);
  
  // États pour les listes déroulantes des wilayas
  const [wilayas, setWilayas] = useState([]);
  
  // États pour les communes du point de dépôt
  const [communesDepot, setCommunesDepot] = useState([]);
  const [loadingCommunesDepot, setLoadingCommunesDepot] = useState(false);
  
  // États pour les communes du point de livraison
  const [communesLivraison, setCommunesLivraison] = useState([]);
  const [loadingCommunesLivraison, setLoadingCommunesLivraison] = useState(false);
  
  const [loadingWilayas, setLoadingWilayas] = useState(false);
  
  // Formulaire
  const [formData, setFormData] = useState({
    client_id: "",
    livreur_ramasseur_id: "",
    livreur_distributeur_id: "",
    status: "en_attente",
    payment_status: "pending",
    date_ramassage: "",
    date_livraison: "",
    destinataire_nom: "",
    destinataire_email: "",
    destinataire_telephone: "",
    addresse_depot: "",
    addresse_delivery: "",
    wilaya_depot: "",
    commune_depot: "",
    wilaya: "",
    commune: "",
    colis_label: "",
    colis_poids: "",
    colis_type: "",
    colis_prix: "",
    prix: "",
    depose_au_depot: false,
    type_livraison: "Livraison",
    prestation: "A domicile",
    info_additionnel: "",
    code_pin: "",
    livraison_gratuite: false,
  });
  
  useEffect(() => {
    fetchFormData();
    loadWilayas();
  }, []);
  
  // Charger la liste des wilayas avec normalisation
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
      toast.error("Erreur lors du chargement des wilayas");
    } finally {
      setLoadingWilayas(false);
    }
  };
  
  // Charger les communes du point de dépôt
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
  
  // Charger les communes du point de livraison
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
  
  // Gérer le changement de wilaya pour le point de dépôt
  const handleWilayaDepotChange = (e) => {
    const wilayaCode = e.target.value;
    setFormData(prev => ({ ...prev, wilaya_depot: wilayaCode, commune_depot: "" }));
    if (wilayaCode) {
      loadCommunesDepot(wilayaCode);
    } else {
      setCommunesDepot([]);
    }
  };
  
  // Gérer le changement de wilaya pour le point de livraison
  const handleWilayaLivraisonChange = (e) => {
    const wilayaCode = e.target.value;
    setFormData(prev => ({ ...prev, wilaya: wilayaCode, commune: "" }));
    if (wilayaCode) {
      loadCommunesLivraison(wilayaCode);
    } else {
      setCommunesLivraison([]);
    }
  };
  
  const fetchFormData = async () => {
    try {
      setLoading(true);
      const data = await livraisonService.getCreateFormData();
      setClients(data.clients || []);
      setLivreurs(data.livreurs || []);
    } catch (error) {
      console.error("Erreur chargement données:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.client_id) {
      toast.error("Veuillez sélectionner un client");
      return;
    }
    
    if (!formData.destinataire_nom) {
      toast.error("Veuillez saisir le nom du destinataire");
      return;
    }
    
    if (!formData.destinataire_telephone) {
      toast.error("Veuillez saisir le téléphone du destinataire");
      return;
    }
    
    if (!formData.addresse_delivery) {
      toast.error("Veuillez saisir l'adresse de livraison");
      return;
    }
    
    if (!formData.wilaya) {
      toast.error("Veuillez sélectionner la wilaya de livraison");
      return;
    }
    
    if (!formData.commune) {
      toast.error("Veuillez sélectionner la commune de livraison");
      return;
    }
    
    if (!formData.colis_poids || formData.colis_poids <= 0) {
      toast.error("Veuillez saisir un poids valide pour le colis");
      return;
    }
    
    if (!formData.prix || formData.prix <= 0) {
      toast.error("Veuillez saisir un prix de livraison valide");
      return;
    }
    
    try {
      setSaving(true);
      
      const submitData = {
        ...formData,
        colis_poids: parseFloat(formData.colis_poids),
        colis_prix: parseFloat(formData.colis_prix) || 0,
        prix: parseFloat(formData.prix), // Le prix garde sa valeur réelle
      };
      
      const response = await livraisonService.createLivraisonAdmin(submitData);
      
      if (response.success) {
        toast.success("Livraison créée avec succès !");
        navigate("/livraisons");
      } else {
        toast.error(response.message || "Erreur lors de la création");
      }
    } catch (error) {
      console.error("Erreur création:", error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.values(errors).forEach(err => {
          toast.error(err[0]);
        });
      } else {
        toast.error(error.response?.data?.message || "Erreur lors de la création de la livraison");
      }
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* En-tête */}
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
              Nouvelle livraison
            </h1>
            <span className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-full">
              Création admin
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Créez une nouvelle livraison en remplissant le formulaire ci-dessous.
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
            {saving ? "Création..." : "Créer la livraison"}
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Mode de livraison */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
            <FaTruck className="text-primary-600" />
            Mode de livraison
          </h2>
          
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="depose_au_depot"
                checked={formData.depose_au_depot}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm text-gray-700">
                <FaStore className="inline mr-1" />
                Dépôt client (le client dépose lui-même le colis)
              </span>
            </label>
            {formData.depose_au_depot && (
              <span className="text-xs text-blue-600">
                ⚡ Mode dépôt activé - Pas de ramasseur nécessaire
              </span>
            )}
          </div>
        </div>
        
        {/* Section 2: Client */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
            <FaUser className="text-primary-600" />
            Client
          </h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          </div>
        </div>
        
        {/* Section 3: Destinataire */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
            <FaUserPlus className="text-primary-600" />
            Destinataire
          </h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="destinataire_nom"
                value={formData.destinataire_nom}
                onChange={handleChange}
                className="w-full mt-1 input-field"
                placeholder="Jean Dupont"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="tel"
                  name="destinataire_telephone"
                  value={formData.destinataire_telephone}
                  onChange={handleChange}
                  className="flex-1 input-field"
                  placeholder="+213 XX XX XX XX"
                  required
                />
                {formData.destinataire_telephone && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(formData.destinataire_telephone, "Téléphone")}
                    className="p-2 text-gray-500 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                    title="Copier le numéro"
                  >
                    <FaCopy className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="destinataire_email"
                value={formData.destinataire_email}
                onChange={handleChange}
                className="w-full mt-1 input-field"
                placeholder="email@exemple.com"
              />
            </div>
          </div>
        </div>
        
        {/* Section 4: Type de livraison et Prestation */}
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
        
        {/* Section 5: Adresses */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
            <FaMapMarkerAlt className="text-primary-600" />
            Adresses
          </h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Point de dépôt */}
            {!formData.depose_au_depot && (
              <div className="p-4 rounded-lg bg-blue-50">
                <h3 className="flex items-center gap-2 mb-3 font-medium text-blue-800">
                  <FaHome /> Point de dépôt
                </h3>
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
            )}
            
            {/* Point de livraison */}
            <div className={`p-4 rounded-lg ${formData.depose_au_depot ? 'bg-green-50 w-full' : 'bg-green-50'}`}>
              <h3 className="flex items-center gap-2 mb-3 font-medium text-green-800">
                <FaTruck /> Point de livraison <span className="text-red-500">*</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-green-700">
                    Wilaya <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="wilaya"
                    value={formData.wilaya}
                    onChange={handleWilayaLivraisonChange}
                    className="w-full mt-1 input-field"
                    disabled={loadingWilayas}
                    required
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
                  <label className="block text-sm text-green-700">
                    Commune <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="commune"
                    value={formData.commune}
                    onChange={handleChange}
                    className="w-full mt-1 input-field"
                    disabled={!formData.wilaya || loadingCommunesLivraison}
                    required
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
                  <label className="block text-sm text-green-700">
                    Adresse complète <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="addresse_delivery"
                    value={formData.addresse_delivery}
                    onChange={handleChange}
                    rows={2}
                    className="w-full mt-1 input-field"
                    placeholder="Adresse détaillée de livraison (rue, numéro, code postal...)"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Section 6: Colis */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
            <FaBox className="text-primary-600" />
            Informations du colis
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
                placeholder="COLIS-XXXXX (auto)"
              />
              <p className="mt-1 text-xs text-gray-400">Laissez vide pour auto-génération</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaWeightHanging className="inline mr-1" /> Poids (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="colis_poids"
                value={formData.colis_poids}
                onChange={handleChange}
                step="0.1"
                min="0.1"
                className="w-full mt-1 input-field"
                placeholder="0.0"
                required
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
        </div>
        
        {/* Section 7: Prix et statuts */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
            <FaMoneyBillWave className="text-primary-600" />
            Prix et statuts
          </h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prix livraison (DA) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                step="1"
                min="0"
                className="w-full mt-1 input-field"
                placeholder="0"
              />
            </div>
            
            {/* Checkbox livraison gratuite - n'affecte que le calcul du total */}
            <div className="flex items-center">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FaCalendarAlt className="inline mr-1" /> Date ramassage
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
                <FaCalendarAlt className="inline mr-1" /> Date livraison
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
        </div>
        
        {/* Section 8: Livreurs */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
            <FaUser className="text-primary-600" />
            Livreurs assignés (optionnel)
          </h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Livreur ramasseur
                {formData.depose_au_depot && (
                  <span className="ml-2 text-xs text-blue-600">(Non requis en mode dépôt)</span>
                )}
              </label>
              <select
                name="livreur_ramasseur_id"
                value={formData.livreur_ramasseur_id}
                onChange={handleChange}
                className="w-full mt-1 input-field"
                disabled={formData.depose_au_depot}
              >
                <option value="">Non assigné</option>
                {livreurs.map(livreur => (
                  <option key={livreur.id} value={livreur.id}>
                    {livreur.label} - {livreur.telephone} ({livreur.type === 1 ? 'Ramasseur' : livreur.type === 2 ? 'Distributeur' : 'Livreur'})
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
                    {livreur.label} - {livreur.telephone} ({livreur.type === 1 ? 'Ramasseur' : livreur.type === 2 ? 'Distributeur' : 'Livreur'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Section 9: Informations supplémentaires */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
            <FaInfoCircle className="text-primary-600" />
            Informations supplémentaires
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Instructions spéciales
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
    </div>
  );
};

export default LivraisonsCreate;