// src/pages/Navettes/NavetteEdit.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import navetteService from "../../services/navetteService";
import comptabiliteService from "../../services/comptabiliteService";
import {
  FaArrowLeft,
  FaSave,
  FaTruck,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaBoxes,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";

const NavetteEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    wilaya_depart_id: "",
    wilaya_arrivee_id: "",
    wilaya_transit_id: "",
    date_depart: "",
    heure_depart: "",
    chauffeur_id: "",
    vehicule_immatriculation: "",
    capacite_max: 100,
    prix_base: 300,
    prix_par_colis: 10,
    notes: "",
    status: "",
  });

  useEffect(() => {
    fetchNavette();
    fetchChauffeurs();
  }, [id]);

  const fetchNavette = async () => {
    try {
      setLoading(true);
      const response = await navetteService.getNavetteById(id);
      const navette = response.data;

      setFormData({
        wilaya_depart_id: navette.wilaya_depart_id || "",
        wilaya_arrivee_id: navette.wilaya_arrivee_id || "",
        wilaya_transit_id: navette.wilaya_transit_id || "",
        date_depart: navette.date_depart
          ? navette.date_depart.split("T")[0]
          : "",
        heure_depart: navette.heure_depart || "08:00",
        chauffeur_id: navette.chauffeur_id || "",
        vehicule_immatriculation: navette.vehicule_immatriculation || "",
        capacite_max: navette.capacite_max || 100,
        prix_base: navette.prix_base || 300,
        prix_par_colis: navette.prix_par_colis || 10,
        notes: navette.notes || "",
        status: navette.status || "planifiee",
      });
    } catch (error) {
      console.error("Erreur chargement navette:", error);
      toast.error("Erreur lors du chargement de la navette");
      navigate("/navettes");
    } finally {
      setLoading(false);
    }
  };

  const fetchChauffeurs = async () => {
    try {
      const response = await navetteService.getChauffeursDisponibles();
      setChauffeurs(response.data?.data || []);
    } catch (error) {
      console.error("Erreur chargement chauffeurs:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.wilaya_arrivee_id) {
      toast.error("Veuillez sélectionner une wilaya d'arrivée");
      return;
    }

    try {
      setSaving(true);

      const response = await navetteService.updateNavette(id, formData);

      toast.success("Navette mise à jour avec succès");
      navigate(`/navettes/${id}`);
    } catch (error) {
      console.error("Erreur mise à jour navette:", error);
      toast.error(
        error.response?.data?.message || "Erreur lors de la mise à jour",
      );
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

  // Vérifier si la navette peut être modifiée
  const canEdit = ["planifiee"].includes(formData.status);

  if (!canEdit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <FaExclamationTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Modification impossible
          </h2>
          <p className="text-gray-600 mb-4">
            Cette navette ne peut pas être modifiée car elle est{" "}
            {formData.status === "en_cours"
              ? "en cours"
              : formData.status === "terminee"
                ? "terminée"
                : "annulée"}
            .
          </p>
          <button
            onClick={() => navigate(`/navettes/${id}`)}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Retour aux détails
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/navettes/${id}`)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-4"
        >
          <FaArrowLeft /> Retour à la navette
        </button>

        <h1 className="text-2xl font-bold text-gray-900">
          Modifier la navette
        </h1>
        <p className="text-gray-600">Modifiez les informations de la navette</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations trajet */}
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

            <div className="space-y-4">
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

            <div className="space-y-4">
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
          </div>

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

export default NavetteEdit; // ← LIGNE CRUCIALE
