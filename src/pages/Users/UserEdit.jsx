import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeftIcon,
  PencilIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import userService from "../../services/userService";

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    role: "client",
    latitude: "",
    longitude: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      console.log(`📝 Fetching user ${id} for editing...`);

      const data = await userService.getUserById(id);
      console.log("📋 User data received:", data);

      // Extraire les données utilisateur selon le format de réponse
      let userData = data;
      if (data && data.data) {
        userData = data.data;
      } else if (data && data.success && data.data) {
        userData = data.data;
      }

      if (!userData) {
        throw new Error("Données utilisateur non disponibles");
      }

      setUser(userData);

      // Remplir le formulaire
      setFormData({
        nom: userData.nom || "",
        prenom: userData.prenom || "",
        email: userData.email || "",
        telephone: userData.telephone || "",
        role: userData.role || "client",
        latitude: userData.latitude || "",
        longitude: userData.longitude || "",
      });
    } catch (error) {
      console.error("❌ Error fetching user for edit:", {
        message: error.message,
        id: id,
      });

      toast.error(`Erreur: ${error.message}`);
      navigate("/users");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = "Le téléphone est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    try {
      setSaving(true);
      console.log("💾 Saving user data:", formData);

      // Nettoyer les données (enlever les champs vides)
      const cleanData = {};
      Object.keys(formData).forEach((key) => {
        if (
          formData[key] !== "" &&
          formData[key] !== null &&
          formData[key] !== undefined
        ) {
          cleanData[key] = formData[key];
        }
      });

      console.log("🧹 Cleaned data:", cleanData);

      await userService.updateUser(id, cleanData);

      toast.success("✅ Utilisateur mis à jour avec succès");

      // Rediriger après un délai
      setTimeout(() => {
        navigate(`/users/${id}`);
      }, 1500);
    } catch (error) {
      console.error("❌ Update error:", {
        message: error.message,
        response: error.response?.data,
      });

      // Gérer les erreurs de validation du backend
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        setErrors(validationErrors);

        // Afficher le premier message d'erreur
        const firstError = Object.values(validationErrors)[0]?.[0];
        if (firstError) {
          toast.error(`Erreur de validation: ${firstError}`);
        }
      } else {
        toast.error(
          `Erreur: ${error.message || "Impossible de mettre à jour l'utilisateur"}`,
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Voulez-vous vraiment annuler ? Les modifications ne seront pas enregistrées.",
      )
    ) {
      navigate(`/users/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 rounded-full border-primary-600 border-t-transparent animate-spin"></div>
        <p className="mt-4 text-gray-600">Chargement des informations...</p>
        <p className="text-sm text-gray-400">ID: {id}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl p-8 mx-auto text-center">
        <ExclamationTriangleIcon className="w-20 h-20 mx-auto text-yellow-500" />
        <h2 className="mt-4 text-xl font-semibold text-gray-700">
          Utilisateur non trouvé
        </h2>
        <p className="mt-2 text-gray-500">
          Impossible de charger les informations pour l'édition.
        </p>
        <button
          onClick={() => navigate("/users")}
          className="inline-flex items-center gap-2 px-4 py-2 mt-6 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/users/${id}`)}
          className="inline-flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-900 group"
        >
          <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span>Retour au détail</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {user.photo_url ? (
              <img
                src={user.photo_url}
                alt={`${user.nom} ${user.prenom}`}
                className="w-16 h-16 rounded-full shadow ring-4 ring-white"
              />
            ) : (
              <div className="flex items-center justify-center w-16 h-16 rounded-full shadow bg-primary-100 ring-4 ring-white">
                <UserIcon className="w-8 h-8 text-primary-600" />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Modifier l'utilisateur
            </h1>
            <p className="text-gray-600">
              {user.nom} {user.prenom} • ID: {id}
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="p-6 bg-white shadow rounded-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Nom */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.nom ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Nom de famille"
              />
              {errors.nom && (
                <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
              )}
            </div>

            {/* Prénom */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.prenom ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Prénom"
              />
              {errors.prenom && (
                <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="email@exemple.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.telephone
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="0600000000"
              />
              {errors.telephone && (
                <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>
              )}
            </div>

            {/* Rôle */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Rôle <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="client">Client</option>
                <option value="livreur">Livreur</option>
                <option value="admin">Administrateur</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Statut (readonly) */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Statut du compte
              </label>
              <div
                className={`px-4 py-2 rounded-lg ${
                  user.actif
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {user.actif ? "✅ Actif" : "❌ Inactif"}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Pour changer le statut, utilisez le bouton dans la page de
                détail
              </p>
            </div>

            {/* Coordonnées optionnelles */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ex: 48.8566"
              />
              {errors.latitude && (
                <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ex: 2.3522"
              />
              {errors.longitude && (
                <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>
              )}
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="mb-2 font-medium text-gray-700">
              Informations système
            </h3>
            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              <div>
                <span className="text-gray-500">ID: </span>
                <span className="font-medium">{id}</span>
              </div>
              <div>
                <span className="text-gray-500">Créé le: </span>
                <span className="font-medium">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString("fr-FR")
                    : "Date inconnue"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Dernière modification: </span>
                <span className="font-medium">
                  {user.updated_at
                    ? new Date(user.updated_at).toLocaleDateString("fr-FR")
                    : "Date inconnue"}
                </span>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex flex-col justify-between gap-4 pt-6 border-t md:flex-row">
            <div className="flex items-center text-sm text-gray-500">
              <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
              Tous les champs marqués d'un * sont obligatoires
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-6 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 min-w-[120px]"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Avertissements */}
      {formData.role !== user.role && (
        <div className="p-4 mt-6 border border-yellow-200 bg-yellow-50 rounded-xl">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">
                Changement de rôle
              </h4>
              <p className="mt-1 text-sm text-yellow-700">
                Vous êtes sur le point de changer le rôle de l'utilisateur de "
                {user.role}" à "{formData.role}". Cela peut affecter ses
                permissions et accès dans le système.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Debug info (seulement en développement) */}
      {import.meta.env.DEV && (
        <div className="p-4 mt-6 text-sm bg-gray-100 border border-gray-300 rounded-lg">
          <details>
            <summary className="font-medium text-gray-700 cursor-pointer">
              Informations de débogage
            </summary>
            <div className="mt-2 space-y-4">
              <div>
                <h4 className="font-medium">User data:</h4>
                <pre className="p-2 mt-1 overflow-auto text-xs text-gray-100 bg-gray-900 rounded">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium">Form data:</h4>
                <pre className="p-2 mt-1 overflow-auto text-xs text-gray-100 bg-gray-900 rounded">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </div>
              <button
                onClick={() =>
                  console.log("Current state:", { user, formData, errors })
                }
                className="px-3 py-1 text-xs bg-gray-200 rounded"
              >
                Log to console
              </button>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default UserEdit;
