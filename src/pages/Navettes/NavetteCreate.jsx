// src/pages/Navettes/NavetteCreate.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import navetteService from "../../services/navetteService";
import comptabiliteService from "../../services/comptabiliteService";
import {
  FaArrowLeft,
  FaSave,
  FaPlus,
  FaTrash,
  FaSearch,
  FaTruck,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaBoxes,
  FaMoneyBillWave,
  FaRoad,
} from "react-icons/fa";

const NavetteCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [chauffeurs, setChauffeurs] = useState([]);
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
    chauffeur_id: "",
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
    fetchChauffeurs();
    fetchColisDisponibles();
  }, []);

  const fetchChauffeurs = async () => {
    try {
      const response = await navetteService.getChauffeursDisponibles();
      setChauffeurs(response.data?.data || []);
    } catch (error) {
      console.error("Erreur chargement chauffeurs:", error);
    }
  };

  const fetchColisDisponibles = async () => {
    try {
      // Simuler des colis disponibles (à remplacer par un vrai appel API)
      const mockColis = [
        {
          id: "1",
          label: "COLIS-001",
          destination: "Alger",
          poids: 2.5,
          prix: 1500,
        },
        {
          id: "2",
          label: "COLIS-002",
          destination: "Oran",
          poids: 1.8,
          prix: 1200,
        },
        {
          id: "3",
          label: "COLIS-003",
          destination: "Constantine",
          poids: 3.2,
          prix: 1800,
        },
        {
          id: "4",
          label: "COLIS-004",
          destination: "Blida",
          poids: 1.2,
          prix: 900,
        },
        {
          id: "5",
          label: "COLIS-005",
          destination: "Tizi Ouzou",
          poids: 2.0,
          prix: 1300,
        },
      ];
      setColisDisponibles(mockColis);
    } catch (error) {
      console.error("Erreur chargement colis:", error);
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

    try {
      setLoading(true);

      const dataToSend = {
        ...formData,
        colis_ids: colisSelectionnes.map((c) => c.id),
      };

      const response = await navetteService.createNavette(dataToSend);

      toast.success("Navette créée avec succès");
      navigate(`/navettes/${response.data.id}`);
    } catch (error) {
      console.error("Erreur création navette:", error);
      toast.error(
        error.response?.data?.message || "Erreur lors de la création",
      );
    } finally {
      setLoading(false);
    }
  };

  const addColis = (colis) => {
    if (!colisSelectionnes.find((c) => c.id === colis.id)) {
      setColisSelectionnes([...colisSelectionnes, colis]);
    }
    setShowColisSearch(false);
    setSearchTerm("");
  };

  const removeColis = (colisId) => {
    setColisSelectionnes(colisSelectionnes.filter((c) => c.id !== colisId));
  };

  const filteredColis = colisDisponibles.filter(
    (colis) =>
      colis.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colis.destination.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

            {/* Chauffeur et véhicule */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="text-primary-600" />
                Chauffeur et véhicule
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chauffeur
                  </label>
                  <select
                    name="chauffeur_id"
                    value={formData.chauffeur_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Sélectionner un chauffeur</option>
                    {chauffeurs.map((chauffeur) => (
                      <option key={chauffeur.id} value={chauffeur.id}>
                        {chauffeur.user?.nom} {chauffeur.user?.prenom}
                      </option>
                    ))}
                  </select>
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
                  {comptabiliteService.formatMontant(
                    formData.prix_base +
                      colisSelectionnes.length * formData.prix_par_colis,
                  )}
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
                  {colisSelectionnes.length}
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
                  Aucun colis sélectionné
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowColisSearch(true)}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
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

              {/* Liste des colis */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredColis.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Aucun colis disponible
                  </p>
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
