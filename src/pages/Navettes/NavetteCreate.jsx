// src/pages/Navettes/NavetteCreate.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import navetteService from "../../services/navetteService";
import api from "../../services/api";
import comptabiliteService from "../../services/comptabiliteService";
import {
  FaArrowLeft,
  FaSave,
  FaPlus,
  FaTrash,
  FaSearch,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaBoxes,
  FaMoneyBillWave,
} from "react-icons/fa";

const NavetteCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [livreurs, setLivreurs] = useState([]);
  const [loadingLivreurs, setLoadingLivreurs] = useState(false);
  const [loadingColis, setLoadingColis] = useState(false);
  
  // Liste des wilayas
  const [wilayas] = useState([
    { code: "01", nom: "Adrar" },
    { code: "02", nom: "Chlef" },
    { code: "03", nom: "Laghouat" },
    { code: "04", nom: "Oum El Bouaghi" },
    { code: "05", nom: "Batna" },
    { code: "06", nom: "Béjaïa" },
    { code: "07", nom: "Biskra" },
    { code: "08", nom: "Béchar" },
    { code: "09", nom: "Blida" },
    { code: "10", nom: "Bouira" },
    { code: "11", nom: "Tamanrasset" },
    { code: "12", nom: "Tébessa" },
    { code: "13", nom: "Tlemcen" },
    { code: "14", nom: "Tiaret" },
    { code: "15", nom: "Tizi Ouzou" },
    { code: "16", nom: "Alger" },
    { code: "17", nom: "Djelfa" },
    { code: "18", nom: "Jijel" },
    { code: "19", nom: "Sétif" },
    { code: "20", nom: "Saïda" },
    { code: "21", nom: "Skikda" },
    { code: "22", nom: "Sidi Bel Abbès" },
    { code: "23", nom: "Annaba" },
    { code: "24", nom: "Guelma" },
    { code: "25", nom: "Constantine" },
    { code: "26", nom: "Médéa" },
    { code: "27", nom: "Mostaganem" },
    { code: "28", nom: "M'Sila" },
    { code: "29", nom: "Mascara" },
    { code: "30", nom: "Ouargla" },
    { code: "31", nom: "Oran" },
    { code: "32", nom: "El Bayadh" },
    { code: "33", nom: "Illizi" },
    { code: "34", nom: "Bordj Bou Arréridj" },
    { code: "35", nom: "Boumerdès" },
    { code: "36", nom: "El Tarf" },
    { code: "37", nom: "Tindouf" },
    { code: "38", nom: "Tissemsilt" },
    { code: "39", nom: "El Oued" },
    { code: "40", nom: "Khenchela" },
    { code: "41", nom: "Souk Ahras" },
    { code: "42", nom: "Tipaza" },
    { code: "43", nom: "Mila" },
    { code: "44", nom: "Aïn Defla" },
    { code: "45", nom: "Naâma" },
    { code: "46", nom: "Aïn Témouchent" },
    { code: "47", nom: "Ghardaïa" },
    { code: "48", nom: "Relizane" },
    { code: "49", nom: "Timimoun" },
    { code: "50", nom: "Bordj Badji Mokhtar" },
    { code: "51", nom: "Ouled Djellal" },
    { code: "52", nom: "Béni Abbès" },
    { code: "53", nom: "In Salah" },
    { code: "54", nom: "In Guezzam" },
    { code: "55", nom: "Touggourt" },
    { code: "56", nom: "Djanet" },
    { code: "57", nom: "El M'Ghair" },
    { code: "58", nom: "El Meniaa" },
  ]);

  const [formData, setFormData] = useState({
    wilaya_depart_id: "16",
    wilaya_arrivee_id: "",
    wilaya_transit_id: "",
    date_depart: new Date().toISOString().split("T")[0],
    heure_depart: "08:00",
    livreur_id: "",
    vehicule_immatriculation: "",
    capacite_max: 100,
    prix_base: 300,
    prix_par_colis: 10,
    notes: "",
  });

  const [colisDisponibles, setColisDisponibles] = useState([]);
  const [colisSelectionnes, setColisSelectionnes] = useState([]);
  const [showColisSearch, setShowColisSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLivreurs();
    fetchColisDisponibles();
  }, []);

  // Récupérer les livreurs disponibles
  const fetchLivreurs = async () => {
    try {
      setLoadingLivreurs(true);
      const response = await navetteService.getLivreursDisponibles();
      
      // Adapter selon la structure de la réponse
      let livreursData = [];
      if (response.data?.data) {
        livreursData = response.data.data;
      } else if (response.data) {
        livreursData = response.data;
      } else if (Array.isArray(response)) {
        livreursData = response;
      }
      
      setLivreurs(livreursData);
    } catch (error) {
      console.error("Erreur chargement livreurs:", error);
      toast.error("Erreur lors du chargement des livreurs");
    } finally {
      setLoadingLivreurs(false);
    }
  };

  // Récupérer les colis disponibles - Version robuste
  const fetchColisDisponibles = async () => {
    try {
      setLoadingColis(true);
      
      // Appel API vers le nouveau endpoint
      const response = await api.get('/admin/colis', {
        params: {
          non_assignes: true,
          per_page: 100
        }
      });

      console.log("Réponse API colis:", response.data); // Pour déboguer

      // Extraire les données de la réponse - Gestion de toutes les structures possibles
      let colisData = [];
      
      if (!response.data) {
        console.error("Réponse API vide");
        setColisDisponibles([]);
        return;
      }

      // Cas 1: Structure avec pagination Laravel { data: { data: [...] } }
      if (response.data.data?.data && Array.isArray(response.data.data.data)) {
        colisData = response.data.data.data;
      }
      // Cas 2: Structure simple { data: [...] }
      else if (response.data.data && Array.isArray(response.data.data)) {
        colisData = response.data.data;
      }
      // Cas 3: Réponse directe [...]
      else if (Array.isArray(response.data)) {
        colisData = response.data;
      }
      // Cas 4: Structure avec success { success: true, data: [...] }
      else if (response.data.success && response.data.data) {
        if (Array.isArray(response.data.data)) {
          colisData = response.data.data;
        } else if (response.data.data.data && Array.isArray(response.data.data.data)) {
          colisData = response.data.data.data;
        }
      }
      // Cas 5: Objet avec propriété data qui est un tableau paginé
      else if (response.data.data && typeof response.data.data === 'object') {
        if (response.data.data.data && Array.isArray(response.data.data.data)) {
          colisData = response.data.data.data;
        }
      }

      // Vérifier que colisData est bien un tableau
      if (!Array.isArray(colisData)) {
        console.error("Les données reçues ne sont pas un tableau:", colisData);
        
        // Dernière tentative : chercher un tableau dans l'objet
        for (let key in response.data) {
          if (Array.isArray(response.data[key])) {
            colisData = response.data[key];
            break;
          }
        }
        
        // Si toujours pas de tableau, on utilise un tableau vide
        if (!Array.isArray(colisData)) {
          setColisDisponibles([]);
          toast.error("Format de données invalide pour les colis");
          return;
        }
      }

      // Transformer les données
      const formattedColis = colisData.map(colis => {
        // Gérer les différents formats de données
        return {
          id: colis.id || colis.uuid || '',
          label: colis.colis_label || colis.label || colis.reference || `COLIS-${(colis.id || '').substring(0, 8) || '0000'}`,
          destination: colis.wilaya_destination_nom || colis.destination || colis.wilaya_arrivee_nom || "Non spécifiée",
          wilaya_destination_id: colis.wilaya_destination_id || colis.wilaya_arrivee_id,
          poids: parseFloat(colis.poids) || 0,
          prix: parseFloat(colis.colis_prix || colis.prix) || 0,
          statut: colis.statut || colis.status
        };
      }).filter(colis => colis.id); // Enlever les entrées sans ID

      console.log("Colis formatés:", formattedColis);
      setColisDisponibles(formattedColis);
      
    } catch (error) {
      console.error("Erreur chargement colis:", error);
      toast.error("Impossible de charger les colis disponibles");
      setColisDisponibles([]);
    } finally {
      setLoadingColis(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.wilaya_arrivee_id) {
      toast.error("Veuillez sélectionner une wilaya d'arrivée");
      return;
    }

    if (colisSelectionnes.length === 0) {
      toast.error("Veuillez sélectionner au moins un colis");
      return;
    }

    if (colisSelectionnes.length > formData.capacite_max) {
      toast.error(`La capacité maximale est de ${formData.capacite_max} colis`);
      return;
    }

    try {
      setLoading(true);

      // Préparer les données avec livreur_id
      const dataToSend = {
        wilaya_depart_id: formData.wilaya_depart_id,
        wilaya_arrivee_id: formData.wilaya_arrivee_id,
        wilaya_transit_id: formData.wilaya_transit_id || null,
        date_depart: formData.date_depart,
        heure_depart: formData.heure_depart,
        livreur_id: formData.livreur_id || null,
        vehicule_immatriculation: formData.vehicule_immatriculation || null,
        capacite_max: parseInt(formData.capacite_max),
        prix_base: parseFloat(formData.prix_base),
        prix_par_colis: parseFloat(formData.prix_par_colis),
        notes: formData.notes || null,
        colis_ids: colisSelectionnes.map((c) => c.id),
      };

      console.log("Données envoyées:", dataToSend);

      const response = await navetteService.createNavette(dataToSend);

      toast.success("Navette créée avec succès");
      
      // Rediriger vers la page de détail
      const navetteId = response.data?.id || response?.id;
      if (navetteId) {
        navigate(`/navettes/${navetteId}`);
      } else {
        navigate("/navettes");
      }
    } catch (error) {
      console.error("Erreur création navette:", error);
      
      // Afficher les erreurs de validation détaillées
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          toast.error(`${key}: ${errors[key].join(', ')}`);
        });
      } else {
        toast.error(
          error.response?.data?.message || "Erreur lors de la création",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const addColis = (colis) => {
    if (!colisSelectionnes.find((c) => c.id === colis.id)) {
      // Vérifier la capacité
      if (colisSelectionnes.length >= formData.capacite_max) {
        toast.error(`Capacité maximale (${formData.capacite_max} colis) atteinte`);
        return;
      }
      setColisSelectionnes([...colisSelectionnes, colis]);
      toast.success(`Colis ${colis.label} ajouté`);
    }
    setShowColisSearch(false);
    setSearchTerm("");
  };

  const removeColis = (colisId) => {
    const colis = colisSelectionnes.find(c => c.id === colisId);
    setColisSelectionnes(colisSelectionnes.filter((c) => c.id !== colisId));
    toast.success(`Colis ${colis?.label} retiré`);
  };

  const filteredColis = colisDisponibles.filter(
    (colis) =>
      colis.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (colis.destination && colis.destination.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Calcul du total estimé
  const totalEstime = formData.prix_base + (colisSelectionnes.length * formData.prix_par_colis);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/navettes")}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-4"
        >
          <FaArrowLeft /> Retour aux navettes
        </button>

        <h1 className="text-2xl font-bold text-gray-900">
          Créer une nouvelle navette
        </h1>
        <p className="text-gray-600">Planifiez un nouveau trajet de navette</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale - Infos navette */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations trajet */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-primary-600" />
                Trajet
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Wilaya de transit (optionnel)
                  </label>
                  <select
                    name="wilaya_transit_id"
                    value={formData.wilaya_transit_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Aucun transit</option>
                    {wilayas.map((wilaya) => (
                      <option key={wilaya.code} value={wilaya.code}>
                        {wilaya.code} - {wilaya.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Date et heure */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaClock className="text-primary-600" />
                Date et heure
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Livreur et véhicule */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="text-primary-600" />
                Livreur et véhicule
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Livreur
                  </label>
                  <select
                    name="livreur_id"
                    value={formData.livreur_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    disabled={loadingLivreurs}
                  >
                    <option value="">Sélectionner un livreur</option>
                    {livreurs.map((livreur) => (
                      <option key={livreur.id} value={livreur.id}>
                        {livreur.nom_complet || (livreur.user && `${livreur.user.prenom || ''} ${livreur.user.nom || ''}`) || 'Livreur'}
                        {livreur.type && ` (${livreur.type})`}
                      </option>
                    ))}
                  </select>
                  {loadingLivreurs && (
                    <p className="text-sm text-gray-500 mt-1">Chargement des livreurs...</p>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacité max (colis)
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
                    Prix par colis (DA)
                  </label>
                  <input
                    type="number"
                    name="prix_par_colis"
                    value={formData.prix_par_colis}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Total estimé :</strong>{" "}
                  {comptabiliteService.formatMontant(totalEstime)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {colisSelectionnes.length} colis sélectionnés sur {formData.capacite_max} maximum
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow p-6">
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
          </div>

          {/* Colonne latérale - Sélection des colis */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaBoxes className="text-primary-600" />
                Colis sélectionnés
                <span className="ml-auto bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
                  {colisSelectionnes.length}/{formData.capacite_max}
                </span>
              </h2>

              {colisSelectionnes.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {colisSelectionnes.map((colis) => (
                    <div
                      key={colis.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {colis.label}
                        </p>
                        <p className="text-sm text-gray-600">
                          {colis.destination} • {colis.poids} kg
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-green-600">
                          {comptabiliteService.formatMontant(colis.prix)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeColis(colis.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaBoxes className="mx-auto text-4xl mb-2 text-gray-300" />
                  <p>Aucun colis sélectionné</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowColisSearch(true)}
                disabled={colisSelectionnes.length >= formData.capacite_max}
                className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                  colisSelectionnes.length >= formData.capacite_max
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-primary-600 text-white hover:bg-primary-700"
                }`}
              >
                <FaPlus /> Ajouter des colis
              </button>
            </div>

            {/* Bouton de création */}
            <button
              type="submit"
              disabled={loading || colisSelectionnes.length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  <FaSave /> Créer la navette
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Modal de recherche de colis */}
      {showColisSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Ajouter des colis
              </h2>
              <p className="text-gray-600">
                Sélectionnez les colis à ajouter à la navette
              </p>
            </div>

            <div className="p-6">
              {/* Barre de recherche */}
              <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par référence ou destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Indicateur de chargement */}
              {loadingColis && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Chargement des colis...</p>
                </div>
              )}

              {/* Liste des colis */}
              {!loadingColis && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredColis.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? (
                        <>
                          <FaSearch className="mx-auto text-4xl mb-2 text-gray-300" />
                          <p>Aucun colis trouvé pour "{searchTerm}"</p>
                        </>
                      ) : (
                        <>
                          <FaBoxes className="mx-auto text-4xl mb-2 text-gray-300" />
                          <p>Aucun colis disponible</p>
                        </>
                      )}
                    </div>
                  ) : (
                    filteredColis.map((colis) => (
                      <div
                        key={colis.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {colis.label}
                          </p>
                          <p className="text-sm text-gray-600">
                            {colis.destination} • {colis.poids} kg
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-green-600">
                            {comptabiliteService.formatMontant(colis.prix)}
                          </span>
                          <button
                            onClick={() => addColis(colis)}
                            disabled={colisSelectionnes.find(
                              (c) => c.id === colis.id,
                            )}
                            className={`px-3 py-1 rounded-lg text-sm ${
                              colisSelectionnes.find((c) => c.id === colis.id)
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-primary-600 text-white hover:bg-primary-700"
                            }`}
                          >
                            {colisSelectionnes.find((c) => c.id === colis.id)
                              ? "Ajouté"
                              : "Ajouter"}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowColisSearch(false)}
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

export default NavetteCreate;