import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCamera,
  FaSave,
  FaLock,
  FaCalendarAlt,
  FaShieldAlt,
  FaBell,
  FaGlobe,
  FaMoon,
  FaSignOutAlt,
  FaEdit,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    photo: null,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || "",
        prenom: user.prenom || "",
        email: user.email || "",
        telephone: user.telephone || "",
        photo: user.photo || null,
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success("Profil mis à jour avec succès");
        setIsEditing(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const result = await authService.changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        new_password_confirmation: passwordData.confirmPassword,
      });

      if (result.success) {
        toast.success("Mot de passe changé avec succès");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erreur lors du changement de mot de passe");
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    try {
      const result = await authService.updatePhoto(file);
      if (result.success) {
        toast.success("Photo de profil mise à jour");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de la photo");
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600">
          Gérez vos informations personnelles et paramètres
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="p-6 bg-white shadow rounded-xl">
            <div className="mb-6 text-center">
              <div className="relative inline-block">
                <div className="flex items-center justify-center w-32 h-32 mx-auto rounded-full bg-primary-100">
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt=""
                      className="object-cover w-32 h-32 rounded-full"
                    />
                  ) : (
                    <FaUser className="w-16 h-16 text-primary-600" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 text-white rounded-full cursor-pointer bg-primary-600 hover:bg-primary-700">
                  <FaCamera className="w-4 h-4" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </label>
              </div>

              <h2 className="mt-4 text-xl font-bold text-gray-900">
                {user.nom} {user.prenom}
              </h2>
              <p className="text-gray-600 capitalize">{user.role}</p>

              <div className="flex items-center justify-center mt-4">
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    user.actif
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.actif ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setActiveTab("personal")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                  activeTab === "personal"
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaUser className="w-5 h-5 mr-3" />
                Informations personnelles
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                  activeTab === "security"
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaLock className="w-5 h-5 mr-3" />
                Sécurité
              </button>

              <button
                onClick={() => setActiveTab("preferences")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                  activeTab === "preferences"
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaBell className="w-5 h-5 mr-3" />
                Préférences
              </button>

              <button
                onClick={() => setActiveTab("account")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                  activeTab === "account"
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FaShieldAlt className="w-5 h-5 mr-3" />
                Compte
              </button>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={logout}
                  className="flex items-center w-full px-4 py-3 text-left text-red-600 rounded-lg hover:bg-red-50"
                >
                  <FaSignOutAlt className="w-5 h-5 mr-3" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="p-6 mt-6 bg-white shadow rounded-xl">
            <h3 className="mb-4 font-medium text-gray-900">Statistiques</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Membre depuis</span>
                <span className="text-sm font-medium">
                  {new Date(user.created_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Dernière connexion
                </span>
                <span className="text-sm font-medium">Aujourd'hui</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sessions actives</span>
                <span className="text-sm font-medium">2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-3">
          {activeTab === "personal" && (
            <div className="p-6 bg-white shadow rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Informations personnelles
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                >
                  {isEditing ? (
                    <>
                      <FaSave className="mr-2" /> Enregistrer
                    </>
                  ) : (
                    <>
                      <FaEdit className="mr-2" /> Modifier
                    </>
                  )}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={formData.nom}
                        onChange={(e) =>
                          setFormData({ ...formData, nom: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={formData.prenom}
                        onChange={(e) =>
                          setFormData({ ...formData, prenom: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) =>
                        setFormData({ ...formData, telephone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-12 h-12 mr-4 bg-blue-100 rounded-lg">
                        <FaUser className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Nom complet</p>
                        <p className="font-medium text-gray-900">
                          {user.nom} {user.prenom}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-12 h-12 mr-4 bg-green-100 rounded-lg">
                        <FaEnvelope className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-12 h-12 mr-4 bg-purple-100 rounded-lg">
                        <FaPhone className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Téléphone</p>
                        <p className="font-medium text-gray-900">
                          {user.telephone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-12 h-12 mr-4 bg-orange-100 rounded-lg">
                        <FaCalendarAlt className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Date d'inscription
                        </p>
                        <p className="font-medium text-gray-900">
                          {new Date(user.created_at).toLocaleDateString(
                            "fr-FR"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-12 h-12 mr-4 bg-red-100 rounded-lg">
                      <FaShieldAlt className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Rôle</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "security" && (
            <div className="p-6 bg-white shadow rounded-xl">
              <h3 className="mb-6 text-lg font-semibold text-gray-900">
                Sécurité du compte
              </h3>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center px-6 py-3 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                >
                  <FaLock className="mr-2" /> Changer le mot de passe
                </button>
              </form>

              <div className="pt-8 mt-8 border-t border-gray-200">
                <h4 className="mb-4 font-medium text-gray-900">
                  Sessions actives
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">
                        Chrome - Windows
                      </p>
                      <p className="text-sm text-gray-600">
                        Dernière activité: Il y a 2 heures
                      </p>
                    </div>
                    <button className="text-sm text-red-600 hover:text-red-900">
                      Déconnecter
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">
                        Safari - iPhone
                      </p>
                      <p className="text-sm text-gray-600">
                        Dernière activité: Hier
                      </p>
                    </div>
                    <button className="text-sm text-red-600 hover:text-red-900">
                      Déconnecter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="p-6 bg-white shadow rounded-xl">
              <h3 className="mb-6 text-lg font-semibold text-gray-900">
                Préférences
              </h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Notifications par email
                    </p>
                    <p className="text-sm text-gray-600">
                      Recevez des notifications par email
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Notifications push
                    </p>
                    <p className="text-sm text-gray-600">
                      Recevez des notifications push
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Mode sombre</p>
                    <p className="text-sm text-gray-600">
                      Activez le mode sombre pour l'interface
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Langue</p>
                    <p className="text-sm text-gray-600">
                      Choisissez la langue de l'interface
                    </p>
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg">
                    <option>Français</option>
                    <option>Anglais</option>
                    <option>Arabe</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Fuseau horaire</p>
                    <p className="text-sm text-gray-600">
                      Définissez votre fuseau horaire
                    </p>
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg">
                    <option>UTC+1 (Europe/Paris)</option>
                    <option>UTC+0 (Europe/London)</option>
                    <option>UTC-5 (America/New_York)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="p-6 bg-white shadow rounded-xl">
              <h3 className="mb-6 text-lg font-semibold text-gray-900">
                Paramètres du compte
              </h3>

              <div className="space-y-6">
                <div className="p-6 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="mb-2 font-medium text-red-800">
                    Zone de danger
                  </h4>
                  <p className="mb-4 text-sm text-red-700">
                    Ces actions sont irréversibles. Soyez certain de ce que vous
                    faites.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Désactiver le compte
                        </p>
                        <p className="text-sm text-gray-600">
                          Votre compte sera désactivé mais pas supprimé
                        </p>
                      </div>
                      <button className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50">
                        Désactiver
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Supprimer le compte
                        </p>
                        <p className="text-sm text-gray-600">
                          Toutes vos données seront définitivement supprimées
                        </p>
                      </div>
                      <button className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700">
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 border border-blue-200 rounded-lg bg-blue-50">
                  <h4 className="mb-2 font-medium text-blue-800">
                    Export de données
                  </h4>
                  <p className="mb-4 text-sm text-blue-700">
                    Téléchargez une copie de toutes vos données personnelles
                  </p>
                  <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    Exporter mes données
                  </button>
                </div>

                <div className="p-6 border border-green-200 rounded-lg bg-green-50">
                  <h4 className="mb-2 font-medium text-green-800">Support</h4>
                  <p className="mb-4 text-sm text-green-700">
                    Besoin d'aide ? Contactez notre équipe de support
                  </p>
                  <button className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">
                    Contacter le support
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
