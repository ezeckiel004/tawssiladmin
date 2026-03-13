import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaUserShield,
  FaTruck,
  FaShoppingBag,
  FaCheckCircle,
  FaTimesCircle,
  FaLock,
  FaUnlock,
  FaHistory,
  FaSpinner,
  FaUserTie,
} from "react-icons/fa";
import userService from "../../services/userService";
import wilayaService from "../../services/wilayaService";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchUser();
  }, [id, refreshTrigger]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await userService.getUserById(id);
      setUser(userData);

      if (userData.role === "client") {
        try {
          const stats = await userService.getClientStats(id);
          setUserStats(stats);
        } catch (statsError) {
          console.warn(
            "Erreur lors du chargement des stats client:",
            statsError,
          );
          setUserStats({
            total_livraisons: 0,
            livraisons_en_cours: 0,
            livraisons_terminees: 0,
          });
        }
      } else if (userData.role === "livreur") {
        try {
          const stats = await userService.getLivreurStats(id);
          setUserStats(stats);
        } catch (statsError) {
          console.warn(
            "Erreur lors du chargement des stats livreur:",
            statsError,
          );
          setUserStats({
            total_livraisons: 0,
            livraisons_en_attente: 0,
            livraisons_en_cours: 0,
            livraisons_terminees: 0,
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast.error("Erreur lors du chargement des données de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;

    try {
      setTogglingStatus(true);

      const willBeActive = !user.actif;

      console.log(`🔄 Tentative de changement de statut utilisateur ${id} :`, {
        actuel: user.actif,
        futur: willBeActive,
      });

      await userService.updateUserStatus(id);

      console.log("✅ Statut modifié avec succès");

      setUser((prevUser) => ({
        ...prevUser,
        actif: !prevUser.actif,
      }));

      toast.success(
        willBeActive
          ? "✅ Utilisateur activé avec succès"
          : "✅ Utilisateur désactivé avec succès",
      );
    } catch (error) {
      console.error("❌ Erreur lors du changement de statut:", error);

      let errorMessage = "Erreur lors du changement de statut";
      if (error?.response?.status === 403) {
        errorMessage =
          "Accès refusé : seuls les administrateurs peuvent modifier le statut";
      } else if (error?.response?.status === 404) {
        errorMessage = "Utilisateur non trouvé";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`❌ ${errorMessage}`);

      fetchUser();
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) {
      toast.error("Utilisateur non trouvé");
      return;
    }

    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT l'utilisateur ${user.nom} ${user.prenom} ?\n\nCette action est irréversible et supprimera toutes les données associées de la base de données.`,
      )
    ) {
      try {
        setDeleting(true);
        await userService.deleteUserForce(id);
        toast.success("Utilisateur supprimé définitivement avec succès");
        navigate("/users");
      } catch (error) {
        toast.error(error.message || "Erreur lors de la suppression");
      } finally {
        setDeleting(false);
      }
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <FaUserShield className="w-5 h-5 text-purple-600" />;
      case "livreur":
        return <FaTruck className="w-5 h-5 text-blue-600" />;
      case "client":
        return <FaShoppingBag className="w-5 h-5 text-green-600" />;
      case "gestionnaire":
        return <FaUserTie className="w-5 h-5 text-orange-600" />;
      default:
        return <FaUser className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "livreur":
        return "bg-blue-100 text-blue-800";
      case "client":
        return "bg-green-100 text-green-800";
      case "gestionnaire":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (actif) => {
    if (actif) {
      return (
        <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
          <FaCheckCircle className="w-4 h-4 mr-1" />
          Actif
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">
        <FaTimesCircle className="w-4 h-4 mr-1" />
        Inactif
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non défini";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    toast.success("✅ Données rafraîchies");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FaSpinner className="w-12 h-12 text-primary-600 animate-spin" />
        <p className="mt-4 text-gray-600">Chargement de l'utilisateur...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-8 text-center">
        <FaUser className="w-12 h-12 mx-auto text-gray-300" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          Utilisateur non trouvé
        </h3>
        <p className="mt-1 text-gray-600">
          L'utilisateur demandé n'existe pas.
        </p>
        <button
          onClick={() => navigate("/users")}
          className="px-4 py-2 mt-4 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <button
              onClick={() => navigate("/users")}
              className="flex items-center mb-2 text-primary-600 hover:text-primary-900"
            >
              <FaArrowLeft className="mr-2" /> Retour à la liste
            </button>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.nom} {user.prenom}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                    user.role,
                  )} flex items-center`}
                >
                  {getRoleIcon(user.role)}
                  <span className="ml-1 capitalize">
                    {user.role === "gestionnaire" ? "Gestionnaire" : user.role}
                  </span>
                </span>
                {getStatusBadge(user.actif)}
              </div>
            </div>
            <p className="mt-1 text-gray-600">ID: {user.id}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/users/edit/${id}`)}
              className="flex items-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
            >
              <FaEdit className="mr-2" /> Modifier
            </button>

            <button
              onClick={handleToggleStatus}
              disabled={togglingStatus || loading}
              className={`flex items-center px-4 py-2 rounded-lg ${
                user.actif
                  ? "text-red-700 bg-red-100 hover:bg-red-200 border border-red-200"
                  : "text-green-700 bg-green-100 hover:bg-green-200 border border-green-200"
              } disabled:opacity-50`}
            >
              {togglingStatus ? (
                <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
              ) : user.actif ? (
                <>
                  <FaLock className="mr-2" /> Désactiver
                </>
              ) : (
                <>
                  <FaUnlock className="mr-2" /> Activer
                </>
              )}
            </button>

            <button
              onClick={handleDeleteUser}
              disabled={deleting || loading}
              className="flex items-center px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? (
                <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FaTrash className="mr-2" />
              )}
              {deleting ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Informations personnelles */}
        <div className="space-y-6 lg:col-span-2">
          <div className="p-6 bg-white shadow rounded-xl">
            <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
              <FaUser className="mr-2 text-primary-600" /> Informations
              personnelles
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {user.nom}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {user.prenom}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="flex items-center mt-1">
                  <FaEnvelope className="w-4 h-4 mr-2 text-gray-400" />
                  <p className="text-lg font-medium text-gray-900 break-all">
                    {user.email}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <div className="flex items-center mt-1">
                  <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                  <p className="text-lg font-medium text-gray-900">
                    {user.telephone || "Non renseigné"}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rôle
                </label>
                <div className="flex items-center mt-1">
                  {getRoleIcon(user.role)}
                  <span className="ml-2 text-lg font-medium text-gray-900 capitalize">
                    {user.role === "gestionnaire" ? "Gestionnaire" : user.role}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Statut
                </label>
                <div className="mt-1">
                  <div className="flex items-center">
                    {getStatusBadge(user.actif)}
                    <span className="ml-2 text-sm text-gray-500">
                      ({user.actif ? "Activé" : "Désactivé"})
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date de création
                </label>
                <div className="flex items-center mt-1">
                  <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-400" />
                  <p className="text-gray-900">{formatDate(user.created_at)}</p>
                </div>
              </div>
              {user.adresse && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Adresse
                  </label>
                  <div className="flex items-start mt-1">
                    <FaMapMarkerAlt className="flex-shrink-0 w-4 h-4 mt-1 mr-2 text-gray-400" />
                    <p className="text-gray-900 break-words">{user.adresse}</p>
                  </div>
                </div>
              )}
              {user.lat && user.lng && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Position GPS
                  </label>
                  <div className="flex items-center mt-1 space-x-4">
                    <span className="text-sm text-gray-600">
                      Lat: {user.lat}
                    </span>
                    <span className="text-sm text-gray-600">
                      Lng: {user.lng}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informations spécifiques au rôle (livreur) */}
          {user.role === "livreur" && user.livreur && (
            <div className="p-6 bg-white shadow rounded-xl">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <FaTruck className="mr-2 text-primary-600" /> Informations
                livreur
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type de livreur
                  </label>
                  <div className="mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.livreur.type === "distributeur"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.livreur.type || "Non spécifié"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Disponibilité
                  </label>
                  <div className="mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.livreur.desactiver
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.livreur.desactiver
                        ? "Non disponible"
                        : "Disponible"}
                    </span>
                  </div>
                </div>
                {user.livreur.demande_adhesions && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Demande d'adhésion
                    </label>
                    <div className="p-3 mt-2 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-600">
                        Date de demande :{" "}
                        {formatDate(user.livreur.demande_adhesions.created_at)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Statut :{" "}
                        {user.livreur.demande_adhesions.status ||
                          "Non spécifié"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informations spécifiques au rôle (gestionnaire) */}
          {user.role === "gestionnaire" && user.gestionnaire && (
            <div className="p-6 bg-white shadow rounded-xl">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <FaUserTie className="mr-2 text-primary-600" /> Informations
                gestionnaire
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Wilaya
                  </label>
                  <div className="flex items-center mt-1">
                    <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                    <p className="text-lg font-medium text-gray-900">
                      {user.gestionnaire.wilaya_id} -{" "}
                      {wilayaService.getWilayaName(user.gestionnaire.wilaya_id)}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Statut
                  </label>
                  <div className="mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.gestionnaire.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.gestionnaire.status === "active"
                        ? "Actif"
                        : "Inactif"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Historique des activités */}
          <div className="p-6 bg-white shadow rounded-xl">
            <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
              <FaHistory className="mr-2 text-primary-600" /> Dernières
              activités
            </h2>
            <div className="py-8 text-center">
              <FaHistory className="w-12 h-12 mx-auto text-gray-300" />
              <p className="mt-4 text-gray-500">Aucune activité récente</p>
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Statistiques */}
          {userStats && (
            <div className="p-6 bg-white shadow rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                {user.role === "client"
                  ? "Statistiques client"
                  : user.role === "livreur"
                    ? "Statistiques livreur"
                    : "Statistiques"}
              </h3>
              <div className="space-y-4">
                {user.role === "client" ? (
                  <>
                    <div className="p-4 rounded-lg bg-blue-50">
                      <p className="text-sm font-medium text-gray-700">
                        Total des livraisons
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {userStats.total_livraisons || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-50">
                      <p className="text-sm font-medium text-gray-700">
                        Livraisons en cours
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {userStats.livraisons_en_cours || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50">
                      <p className="text-sm font-medium text-gray-700">
                        Livraisons terminées
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {userStats.livraisons_terminees || 0}
                      </p>
                    </div>
                  </>
                ) : user.role === "livreur" ? (
                  <>
                    <div className="p-4 rounded-lg bg-blue-50">
                      <p className="text-sm font-medium text-gray-700">
                        Total des courses
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {userStats.total_livraisons || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-50">
                      <p className="text-sm font-medium text-gray-700">
                        Courses en attente
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {userStats.livraisons_en_attente || 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50">
                      <p className="text-sm font-medium text-gray-700">
                        Courses terminées
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {userStats.livraisons_terminees || 0}
                      </p>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {/* Informations système */}
          <div className="p-6 bg-white shadow rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Informations système
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ID
                </label>
                <p className="mt-1 font-mono text-sm text-gray-900 break-all">
                  {user.id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dernière connexion
                </label>
                <p className="mt-1 text-gray-900">
                  {formatDate(user.last_login_at) || "Jamais"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Créé le
                </label>
                <p className="mt-1 text-gray-900">
                  {formatDate(user.created_at)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mis à jour le
                </label>
                <p className="mt-1 text-gray-900">
                  {formatDate(user.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
