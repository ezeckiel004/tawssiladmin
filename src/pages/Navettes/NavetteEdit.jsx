// src/pages/Navettes/NavetteEdit.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import navetteService from "../../services/navetteService";
import comptabiliteService from "../../services/comptabiliteService";
import {
  FaArrowLeft,
  FaSave,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaBuilding,
  FaBoxes,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaSpinner,
  FaPlusCircle,
  FaMinusCircle,
  FaUsers,
  FaUserTie,
} from "react-icons/fa";

// Fonction utilitaire pour extraire le code d'une wilaya
const getWilayaCode = (item) => {
  if (!item) return null;
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item.code) return item.code;
  return null;
};

const NavetteEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hubs, setHubs] = useState([]);
  const [loadingHubs, setLoadingHubs] = useState(false);
  const [livraisonsDeLaNavette, setLivraisonsDeLaNavette] = useState([]);
  const [selectedTransitWilaya, setSelectedTransitWilaya] = useState("");
  const [acteurs, setActeurs] = useState([]);

  const [wilayas] = useState([
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
    { code: "58", nom: "El Meniaa" },
  ]);

  const [formData, setFormData] = useState({
    wilaya_depart_id: "",
    wilaya_arrivee_id: "",
    wilayas_transit: [],
    date_depart: "",
    heure_depart: "",
    hub_id: "",
    vehicule_immatriculation: "",
    capacite_max: 100,
    prix_base: 300,
    prix_par_livraison: 10,
    notes: "",
    status: "",
  });

  useEffect(() => {
    fetchNavette();
    fetchHubs();
  }, [id]);

  const fetchNavette = async () => {
    try {
      setLoading(true);
      const response = await navetteService.getNavetteById(id);
      const navette = response.data?.data || response.data || response;

      // Extraire les codes des wilayas de transit
      let transitCodes = [];
      if (navette.wilayas_transit && Array.isArray(navette.wilayas_transit)) {
        transitCodes = navette.wilayas_transit.map(item => getWilayaCode(item)).filter(code => code);
      }

      setFormData({
        wilaya_depart_id: navette.wilaya_depart_id || "",
        wilaya_arrivee_id: navette.wilaya_arrivee_id || "",
        wilayas_transit: transitCodes,
        date_depart: navette.date_depart ? navette.date_depart.split("T")[0] : "",
        heure_depart: navette.heure_depart || "08:00",
        hub_id: navette.hub_id || "",
        vehicule_immatriculation: navette.vehicule_immatriculation || "",
        capacite_max: navette.capacite_max || 100,
        prix_base: navette.prix_base || 300,
        prix_par_livraison: navette.prix_par_livraison || 10,
        notes: navette.notes || "",
        status: navette.status || "planifiee",
      });

      // Récupérer les acteurs pour la répartition
      if (navette.repartition) {
        setActeurs(navette.repartition);
      } else if (navette.acteurs) {
        setActeurs(navette.acteurs);
      }

      // Formater les livraisons avec le prix
      if (navette.livraisons && Array.isArray(navette.livraisons)) {
        const formattedLivraisons = navette.livraisons.map(livraison => {
          // Récupérer le prix de différentes manières
          let prix = 0;
          if (livraison.demande_livraison?.colis?.colis_prix) {
            prix = livraison.demande_livraison.colis.colis_prix;
          } else if (livraison.demande_livraison?.prix) {
            prix = livraison.demande_livraison.prix;
          } else if (livraison.colis?.colis_prix) {
            prix = livraison.colis.colis_prix;
          }
          
          return {
            ...livraison,
            prix: prix,
            reference: livraison.demande_livraison?.reference || livraison.reference || 'N/A',
            client: livraison.client?.user?.nom || livraison.client?.nom || 'Client inconnu',
            wilaya_depart: livraison.demande_livraison?.wilaya_depot || 'Non spécifiée',
            wilaya_arrivee: livraison.demande_livraison?.wilaya || 'Non spécifiée',
          };
        });
        setLivraisonsDeLaNavette(formattedLivraisons);
      }
    } catch (error) {
      console.error("Erreur chargement navette:", error);
      toast.error("Erreur lors du chargement de la navette");
      navigate("/navettes");
    } finally {
      setLoading(false);
    }
  };

  const fetchHubs = async () => {
    try {
      setLoadingHubs(true);
      const response = await navetteService.getHubsDisponibles();
      let hubsData = [];
      if (response.data?.data) hubsData = response.data.data;
      else if (response.data) hubsData = response.data;
      else if (Array.isArray(response)) hubsData = response;
      setHubs(hubsData);
    } catch (error) {
      console.error("Erreur chargement hubs:", error);
    } finally {
      setLoadingHubs(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addTransitWilaya = () => {
    if (!selectedTransitWilaya) {
      toast.error("Veuillez sélectionner une wilaya");
      return;
    }
    if (formData.wilayas_transit.includes(selectedTransitWilaya)) {
      toast.error("Cette wilaya est déjà dans la liste");
      return;
    }
    setFormData(prev => ({
      ...prev,
      wilayas_transit: [...prev.wilayas_transit, selectedTransitWilaya]
    }));
    setSelectedTransitWilaya("");
  };

  const removeTransitWilaya = (code) => {
    setFormData(prev => ({
      ...prev,
      wilayas_transit: prev.wilayas_transit.filter(c => c !== code)
    }));
  };

  const getWilayaName = (code) => {
    const wilaya = wilayas.find(w => w.code === code);
    return wilaya ? `${wilaya.code} - ${wilaya.nom}` : code;
  };

  // Calculer le nombre d'acteurs et la part équitable
  const getNbActeurs = () => {
    const acteursSet = new Set();
    
    if (formData.wilaya_depart_id) {
      acteursSet.add(`gestionnaire_${formData.wilaya_depart_id}`);
    }
    
    formData.wilayas_transit.forEach(code => {
      acteursSet.add(`gestionnaire_${code}`);
    });
    
    if (formData.wilaya_arrivee_id && formData.wilaya_arrivee_id !== formData.wilaya_depart_id) {
      acteursSet.add(`gestionnaire_${formData.wilaya_arrivee_id}`);
    }
    
    if (formData.hub_id) {
      acteursSet.add(`hub_${formData.hub_id}`);
    }
    
    return acteursSet.size;
  };

  const nbActeurs = getNbActeurs();
  const partEquitable = nbActeurs > 0 ? (100 / nbActeurs).toFixed(2) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.wilaya_arrivee_id) {
      toast.error("Veuillez sélectionner une wilaya d'arrivée");
      return;
    }

    try {
      setSaving(true);

      const dataToSend = {
        wilaya_depart_id: formData.wilaya_depart_id,
        wilaya_arrivee_id: formData.wilaya_arrivee_id,
        wilayas_transit: formData.wilayas_transit,
        date_depart: formData.date_depart,
        heure_depart: formData.heure_depart,
        hub_id: formData.hub_id || null,
        vehicule_immatriculation: formData.vehicule_immatriculation || null,
        capacite_max: parseInt(formData.capacite_max),
        prix_base: parseFloat(formData.prix_base),
        prix_par_livraison: parseFloat(formData.prix_par_livraison),
        notes: formData.notes || null,
        status: formData.status,
      };

      await navetteService.updateNavette(id, dataToSend);
      toast.success("Navette mise à jour avec succès");
      navigate(`/navettes/${id}`);
    } catch (error) {
      console.error("Erreur mise à jour navette:", error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          toast.error(`${key}: ${errors[key].join(', ')}`);
        });
      } else {
        toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin h-12 w-12 text-primary-600" />
      </div>
    );
  }

  const canEdit = ["planifiee"].includes(formData.status);

  if (!canEdit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <FaExclamationTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Modification impossible</h2>
          <p className="text-gray-600 mb-4">
            Cette navette ne peut pas être modifiée car elle est{" "}
            {formData.status === "en_cours"
              ? "en cours"
              : formData.status === "terminee"
              ? "terminée"
              : "annulée"}.
          </p>
          <button
            onClick={() => navigate(`/navettes/${id}`)}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retour aux détails
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/navettes/${id}`)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-4"
        >
          <FaArrowLeft /> Retour à la navette
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Modifier la navette</h1>
        <p className="text-gray-600">Modifiez les informations de la navette</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trajet */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-primary-600" />
              Trajet
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wilaya de départ *
                </label>
                <select
                  name="wilaya_depart_id"
                  value={formData.wilaya_depart_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  {wilayas.map((wilaya) => (
                    <option key={wilaya.code} value={wilaya.code}>
                      {wilaya.code} - {wilaya.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wilaya d'arrivée *
                </label>
                <select
                  name="wilaya_arrivee_id"
                  value={formData.wilaya_arrivee_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Sélectionner</option>
                  {wilayas.map((wilaya) => (
                    <option key={wilaya.code} value={wilaya.code}>
                      {wilaya.code} - {wilaya.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wilayas de transit (optionnel, multiples)
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedTransitWilaya}
                    onChange={(e) => setSelectedTransitWilaya(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Sélectionner une wilaya</option>
                    {wilayas.map((wilaya) => (
                      <option key={wilaya.code} value={wilaya.code}>
                        {wilaya.code} - {wilaya.nom}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addTransitWilaya}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-1"
                  >
                    <FaPlusCircle className="w-4 h-4" /> Ajouter
                  </button>
                </div>

                {formData.wilayas_transit.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {formData.wilayas_transit.map((code) => {
                        const wilaya = wilayas.find(w => w.code === code);
                        const wilayaName = wilaya ? `${wilaya.code} - ${wilaya.nom}` : code;
                        return (
                          <span
                            key={code}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            <FaMapMarkerAlt className="w-3 h-3" />
                            {wilayaName}
                            <button
                              type="button"
                              onClick={() => removeTransitWilaya(code)}
                              className="ml-1 hover:text-blue-600 focus:outline-none"
                            >
                              <FaMinusCircle className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date et heure */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaClock className="text-primary-600" />
              Date et heure
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de départ *
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="date_depart"
                    value={formData.date_depart}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de départ *
                </label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="time"
                    name="heure_depart"
                    value={formData.heure_depart}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hub et véhicule */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaBuilding className="text-primary-600" />
              Hub et véhicule
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hub
                </label>
                <select
                  name="hub_id"
                  value={formData.hub_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  disabled={loadingHubs}
                >
                  <option value="">Sélectionner un hub</option>
                  {hubs.map((hub) => (
                    <option key={hub.id} value={hub.id}>
                      {hub.nom}
                    </option>
                  ))}
                </select>
                {loadingHubs && (
                  <p className="text-sm text-gray-500 mt-1">Chargement des hubs...</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Immatriculation véhicule
                </label>
                <input
                  type="text"
                  name="vehicule_immatriculation"
                  value={formData.vehicule_immatriculation}
                  onChange={handleChange}
                  placeholder="ex: 1234 ABC 16"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Tarification */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaMoneyBillWave className="text-primary-600" />
              Tarification
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacité max (livraisons)
                </label>
                <input
                  type="number"
                  name="capacite_max"
                  value={formData.capacite_max}
                  onChange={handleChange}
                  min="1"
                  max="500"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix de base (DA)
                </label>
                <input
                  type="number"
                  name="prix_base"
                  value={formData.prix_base}
                  onChange={handleChange}
                  min="0"
                  step="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix par livraison (DA)
                </label>
                <input
                  type="number"
                  name="prix_par_livraison"
                  value={formData.prix_par_livraison}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {livraisonsDeLaNavette.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <FaBoxes />
                    <h3 className="font-medium">Livraisons dans cette navette</h3>
                    <span className="ml-auto bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {livraisonsDeLaNavette.length}/{formData.capacite_max}
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {livraisonsDeLaNavette.map((livraison) => (
                      <div key={livraison.id} className="flex justify-between items-center text-sm p-2 bg-white rounded">
                        <div>
                          <p className="font-medium">{livraison.reference}</p>
                          <p className="text-xs text-gray-500">
                            {livraison.wilaya_depart} → {livraison.wilaya_arrivee}
                          </p>
                        </div>
                        <span className="font-semibold text-green-600">
                          {comptabiliteService.formatMontant(livraison.prix)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-blue-500 mt-2">
                    (La gestion des livraisons se fait depuis la page de détail)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Répartition équitable */}
          {nbActeurs > 0 && (
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUsers className="text-primary-600" />
                Répartition équitable des gains
              </h2>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <p className="text-sm text-blue-700 mb-3 flex items-center gap-2">
                  <FaUserTie className="text-blue-600" />
                  Les gains des livraisons seront répartis équitablement entre :
                </p>
                
                <div className="space-y-2">
                  {formData.wilaya_depart_id && (
                    <div className="flex items-center justify-between py-2 border-b border-blue-100">
                      <span className="text-sm flex items-center gap-2">
                        <FaMapMarkerAlt className="text-blue-500" />
                        Gestionnaire wilaya départ ({formData.wilaya_depart_id})
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {partEquitable}%
                      </span>
                    </div>
                  )}
                  
                  {formData.wilayas_transit.map((code) => (
                    <div key={code} className="flex items-center justify-between py-2 border-b border-blue-100">
                      <span className="text-sm flex items-center gap-2">
                        <FaMapMarkerAlt className="text-purple-500" />
                        Gestionnaire wilaya transit ({code})
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {partEquitable}%
                      </span>
                    </div>
                  ))}
                  
                  {formData.wilaya_arrivee_id && formData.wilaya_arrivee_id !== formData.wilaya_depart_id && (
                    <div className="flex items-center justify-between py-2 border-b border-blue-100">
                      <span className="text-sm flex items-center gap-2">
                        <FaMapMarkerAlt className="text-green-500" />
                        Gestionnaire wilaya arrivée ({formData.wilaya_arrivee_id})
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {partEquitable}%
                      </span>
                    </div>
                  )}
                  
                  {formData.hub_id && (
                    <div className="flex items-center justify-between py-2 border-b border-blue-100">
                      <span className="text-sm flex items-center gap-2">
                        <FaBuilding className="text-orange-500" />
                        Hub ({hubs.find(h => h.id === formData.hub_id)?.nom || 'Hub'})
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {partEquitable}%
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Nombre d'acteurs</span>
                    <span className="text-sm font-bold text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
                      {nbActeurs} acteur(s)
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold text-gray-700">Part par acteur</span>
                    <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      {partEquitable}%
                    </span>
                  </div>
                  <p className="text-xs text-blue-500 mt-3">
                    * La répartition sera recalculée automatiquement après modification.
                    Chaque acteur recevra {partEquitable}% du prix de chaque livraison.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Informations complémentaires..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Boutons */}
          <div className="lg:col-span-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/navettes/${id}`)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <FaSave /> Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NavetteEdit;