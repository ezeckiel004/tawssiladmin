// src/components/Forms/UserForm.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  KeyIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import userService from "../../services/userService";
import wilayaService from "../../services/wilayaService";

const UserForm = ({ user = null, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [wilayas, setWilayas] = useState([]);
  const [formData, setFormData] = useState({
    nom: "", // Changé de 'name' à 'nom' pour correspondre à la base de données
    prenom: "",
    email: "",
    telephone: "", // Changé de 'phone' à 'telephone' pour correspondre à la base de données
    password: "",
    role: "client",
    wilaya_id: "",
    latitude: "",
    longitude: "",
    password_confirmation: "",
  });

  useEffect(() => {
    loadWilayas();
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadWilayas = async () => {
    try {
      const wilayasList = wilayaService.formatForSelect();
      setWilayas(wilayasList);
    } catch (error) {
      console.error("Erreur chargement wilayas:", error);
    }
  };

  const loadUserData = () => {
    if (user) {
      setFormData({
        nom: user.nom || "",
        prenom: user.prenom || "",
        email: user.email || "",
        telephone: user.telephone || "",
        password: "",
        role: user.role || "client",
        wilaya_id: user.gestionnaire?.wilaya_id || "",
        latitude: user.latitude || "",
        longitude: user.longitude || "",
        password_confirmation: "",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Validation du nom
    if (!formData.nom || formData.nom.trim() === "") {
      toast.error("Le nom est requis");
      return false;
    }

    // Validation du prénom
    if (!formData.prenom || formData.prenom.trim() === "") {
      toast.error("Le prénom est requis");
      return false;
    }

    // Validation de l'email
    if (!formData.email || formData.email.trim() === "") {
      toast.error("L'email est requis");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Format d'email invalide");
      return false;
    }

    // Validation du téléphone
    if (!formData.telephone || formData.telephone.trim() === "") {
      toast.error("Le téléphone est requis");
      return false;
    }

    // Validation du mot de passe pour la création
    if (!user && (!formData.password || formData.password.length < 8)) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }

    // Validation de la confirmation du mot de passe
    if (
      formData.password &&
      formData.password !== formData.password_confirmation
    ) {
      toast.error("Les mots de passe ne correspondent pas");
      return false;
    }

    // Validation de la wilaya pour les gestionnaires
    if (formData.role === "gestionnaire" && !formData.wilaya_id) {
      toast.error("La wilaya est requise pour un gestionnaire");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Préparer les données pour l'envoi - AVEC LES BONS NOMS DE CHAMPS
      const dataToSend = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        role: formData.role,
      };

      // Ajouter le mot de passe seulement si fourni
      if (formData.password) {
        dataToSend.password = formData.password;
      }

      // Ajouter la wilaya pour les gestionnaires
      if (formData.role === "gestionnaire" && formData.wilaya_id) {
        dataToSend.wilaya_id = formData.wilaya_id;
      }

      // Ajouter les coordonnées si fournies
      if (formData.latitude) dataToSend.latitude = formData.latitude;
      if (formData.longitude) dataToSend.longitude = formData.longitude;

      // Pour la mise à jour, ne pas envoyer les champs vides
      if (user) {
        Object.keys(dataToSend).forEach((key) => {
          if (
            dataToSend[key] === "" ||
            dataToSend[key] === null ||
            dataToSend[key] === undefined
          ) {
            delete dataToSend[key];
          }
        });
        delete dataToSend.password; // Ne pas envoyer le mot de passe vide
      }

      console.log("Données envoyées au serveur:", dataToSend);

      if (user) {
        await userService.updateUser(user.id, dataToSend);
        toast.success("Utilisateur mis à jour avec succès");
      } else {
        await userService.createUser(dataToSend);
        toast.success("Utilisateur créé avec succès");
      }

      onSuccess();
    } catch (error) {
      console.error("Error:", error);

      if (error.message.includes("validation")) {
        const errorMessage = error.message.replace(
          "Erreur de validation: ",
          "",
        );
        toast.error(errorMessage);
      } else {
        toast.error(error.message || "Une erreur est survenue");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nom <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <UserIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              placeholder="Ex: Dupont"
              className="w-full pl-10 pr-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Nom de famille</p>
        </div>

        {/* Prénom */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Prénom <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <UserIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              required
              placeholder="Ex: Jean"
              className="w-full pl-10 pr-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <EnvelopeIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="exemple@email.com"
              className="w-full pl-10 pr-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Téléphone <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <PhoneIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              required
              placeholder="06 12 34 56 78"
              className="w-full pl-10 pr-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mot de passe {!user && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <KeyIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!user}
              minLength="8"
              placeholder={
                user
                  ? "Laisser vide pour ne pas modifier"
                  : "Minimum 8 caractères"
              }
              className="w-full pl-10 pr-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Confirmation mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Confirmer le mot de passe{" "}
            {!user && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <KeyIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              required={!user}
              placeholder="Confirmez le mot de passe"
              className="w-full pl-10 pr-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Rôle */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Rôle <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <UserGroupIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="client">Client</option>
              <option value="livreur">Livreur</option>
              <option value="gestionnaire">Gestionnaire</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
        </div>

        {/* Wilaya (visible seulement pour gestionnaire) */}
        {formData.role === "gestionnaire" && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Wilaya <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPinIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <select
                name="wilaya_id"
                value={formData.wilaya_id}
                onChange={handleChange}
                required={formData.role === "gestionnaire"}
                className="w-full pl-10 pr-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Sélectionnez une wilaya</option>
                {wilayas.map((wilaya) => (
                  <option key={wilaya.value} value={wilaya.value}>
                    {wilaya.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Le gestionnaire sera responsable de cette wilaya
            </p>
          </div>
        )}

        {/* Coordonnées GPS */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="Ex: 36.7538"
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400"
          />
          <p className="mt-1 text-xs text-gray-500">Optionnel</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="Ex: 3.0588"
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400"
          />
          <p className="mt-1 text-xs text-gray-500">Optionnel</p>
        </div>
      </div>

      {/* Message d'information */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <span className="font-medium">ℹ️ Information :</span> Les champs
          marqués d'un astérisque (*) sont obligatoires.
        </p>
      </div>

      {/* Boutons */}
      <div className="flex justify-end pt-4 space-x-3 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              Enregistrement...
            </div>
          ) : user ? (
            "Mettre à jour"
          ) : (
            "Créer l'utilisateur"
          )}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
