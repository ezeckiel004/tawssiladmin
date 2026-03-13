import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaStar,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
  FaSpinner,
  FaExclamationTriangle,
  FaChartLine,
  FaMoneyBillWave,
  FaUserCircle,
  FaAddressCard,
  FaCity,
} from "react-icons/fa";
import clientService from "../../services/clientService";

const ClientDetail = () => {
  const { id } = useParams(); // id est maintenant l'ID utilisateur
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("informations");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClientDetails();
  }, [id]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔄 Chargement du client via user ID: ${id}`);

      // Utiliser la nouvelle méthode qui utilise l'ID utilisateur
      const response = await clientService.getClientByUserId(id);
      console.log("✅ Données client reçues:", response);

      if (response.success && response.data) {
        // Formater avec le service
        const formattedClient = clientService.formatClientData(response.data);
        console.log("📊 Client formaté:", formattedClient);
        setClient(formattedClient);

        // Charger les statistiques (utiliser l'ID utilisateur pour les stats aussi)
        fetchClientStats(id);
      } else {
        throw new Error("Client non trouvé");
      }
    } catch (error) {
      console.error("❌ Erreur détaillée:", error);
      setError(error.message || "Erreur de chargement du client");
      toast.error("Erreur lors du chargement du client");
      setClient(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientStats = async (userId) => {
    try {
      setStatsLoading(true);
      const statsData = await clientService.getClientStats(userId);
      setStats(statsData.data || statsData);
    } catch (error) {
      console.warn("⚠️ Statistiques non disponibles:", error);
      setStats({
        total_livraisons: 0,
        livraisons_terminees: 0,
        livraisons_en_cours: 0,
        montant_total: 0,
        moyenne_notes: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!client) return;

    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir supprimer définitivement le client "${client.name}" ? Cette action est irréversible.`,
      )
    ) {
      return;
    }

    try {
      const response = await clientService.deleteClient(client.user_id);

      if (response.success) {
        toast.success("Client supprimé avec succès");
        navigate("/clients");
      } else {
        toast.error(response.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleToggleStatus = async () => {
    if (!client) return;

    const currentStatus = client.status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "activer" : "désactiver";

    if (!window.confirm(`Êtes-vous sûr de vouloir ${action} ce client ?`)) {
      return;
    }

    try {
      const response = await clientService.toggleClientStatus(client.user_id);

      if (response.success) {
        toast.success(`Client ${action} avec succès`);

        // Mettre à jour l'état local
        setClient({
          ...client,
          status: newStatus,
          actif: newStatus === "active",
        });

        // Rafraîchir les données
        fetchClientDetails();
      } else {
        toast.error(response.message || `Erreur lors de la ${action}`);
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      toast.error(`Erreur lors de la ${action}`);
    }
  };

  // Fonctions utilitaires
  const formatDate = (dateString) => {
    if (!dateString) return "Non disponible";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date invalide";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Non disponible";
    try {
      return new Date(dateString).toLocaleString("fr-FR");
    } catch {
      return "Date invalide";
    }
  };

  const renderStars = (rating) => {
    const numRating = Number(rating) || 0;
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`h-5 w-5 ${
              star <= Math.floor(numRating)
                ? "text-yellow-400"
                : star === Math.ceil(numRating) && numRating % 1 > 0
                  ? "text-yellow-300"
                  : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {numRating.toFixed(1)}/5
        </span>
      </div>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0,00 DH";
    return (
      new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount) + " DH"
    );
  };

  // États de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 mx-auto animate-spin text-primary-600" />
          <p className="mt-4 text-gray-600">Chargement du client...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-8 text-center">
        <FaExclamationTriangle className="w-16 h-16 mx-auto text-red-300" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          Client non trouvé
        </h2>
        <p className="mt-2 text-gray-600">
          {error || "Le client que vous recherchez n'existe pas."}
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate("/clients")}
            className="inline-flex items-center px-4 py-2 text-primary-600 hover:text-primary-800"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const isActive = client.status === "active";

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <div>
          <button
            onClick={() => navigate("/clients")}
            className="flex items-center mb-4 text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Retour aux clients
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Détails du Client
          </h1>
          <p className="text-gray-600">User ID: {id.substring(0, 8)}...</p>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              isActive
                ? "text-red-600 border-red-300 hover:bg-red-50"
                : "text-green-600 border-green-300 hover:bg-green-50"
            }`}
          >
            {isActive ? <FaTimesCircle /> : <FaCheckCircle />}
            {isActive ? "Désactiver" : "Activer"}
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-600 transition-colors border border-red-300 rounded-lg hover:bg-red-50"
          >
            <FaTrash /> Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne de gauche */}
        <div className="space-y-6 lg:col-span-2">
          <div className="bg-white shadow rounded-xl">
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-3 text-center font-medium transition-colors ${
                  activeTab === "informations"
                    ? "text-primary-600 border-b-2 border-primary-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("informations")}
              >
                Informations
              </button>
              <button
                className={`flex-1 py-3 text-center font-medium transition-colors ${
                  activeTab === "livraisons"
                    ? "text-primary-600 border-b-2 border-primary-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("livraisons")}
              >
                Livraisons
              </button>
            </div>

            <div className="p-6">
              {activeTab === "informations" && (
                <div className="space-y-6">
                  {/* Photo et nom */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary-100">
                        <FaUserCircle className="w-12 h-12 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">
                        {client.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isActive ? "Actif" : "Inactif"}
                        </span>
                        <span className="px-3 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                          Client
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Informations détaillées */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center mb-2 text-gray-600">
                        <FaEnvelope className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <p className="font-medium text-gray-900">
                        {client.email || "Non spécifié"}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center mb-2 text-gray-600">
                        <FaPhone className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Téléphone</span>
                      </div>
                      <p className="font-medium text-gray-900">
                        {client.telephone || "Non spécifié"}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center mb-2 text-gray-600">
                        <FaCalendarAlt className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Inscription</span>
                      </div>
                      <p className="font-medium text-gray-900">
                        {formatDate(client.created_at)}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center mb-2 text-gray-600">
                        <FaUser className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">
                          ID Utilisateur
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {client.user_id || id}
                      </p>
                    </div>
                  </div>

                  {/* Adresse si disponible */}
                  <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
                    <div className="flex items-center mb-3 text-blue-700">
                      <FaMapMarkerAlt className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">
                        Adresse de livraison
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="flex items-center">
                        <FaAddressCard className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-sm text-gray-600">Adresse: </span>
                        <span className="ml-2 text-gray-900">
                          Non spécifiée
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FaCity className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-sm text-gray-600">Ville: </span>
                        <span className="ml-2 text-gray-900">
                          Non spécifiée
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "livraisons" && (
                <div className="space-y-4">
                  {statsLoading ? (
                    <div className="py-8 text-center">
                      <FaSpinner className="w-8 h-8 mx-auto animate-spin text-primary-600" />
                      <p className="mt-2 text-gray-600">
                        Chargement des statistiques...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 text-center bg-white border rounded-lg shadow-sm">
                          <div className="flex items-center justify-center mb-2">
                            <FaChartLine className="w-6 h-6 text-blue-500" />
                          </div>
                          <p className="text-sm text-gray-600">
                            Total livraisons
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {stats?.total_livraisons || 0}
                          </p>
                        </div>
                        <div className="p-4 text-center bg-white border rounded-lg shadow-sm">
                          <div className="flex items-center justify-center mb-2">
                            <FaCheckCircle className="w-6 h-6 text-green-500" />
                          </div>
                          <p className="text-sm text-gray-600">Terminées</p>
                          <p className="text-2xl font-bold text-green-600">
                            {stats?.livraisons_terminees || 0}
                          </p>
                        </div>
                        <div className="p-4 text-center bg-white border rounded-lg shadow-sm">
                          <div className="flex items-center justify-center mb-2">
                            <FaSpinner className="w-6 h-6 text-yellow-500" />
                          </div>
                          <p className="text-sm text-gray-600">En cours</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {stats?.livraisons_en_cours || 0}
                          </p>
                        </div>
                        <div className="p-4 text-center bg-white border rounded-lg shadow-sm">
                          <div className="flex items-center justify-center mb-2">
                            <FaMoneyBillWave className="w-6 h-6 text-blue-600" />
                          </div>
                          <p className="text-sm text-gray-600">Montant total</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(stats?.montant_total || 0)}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 mt-4 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <FaStar className="w-5 h-5 mr-2 text-yellow-500" />
                            <span className="font-medium text-gray-700">
                              Satisfaction client
                            </span>
                          </div>
                          {renderStars(stats?.moyenne_notes || 0)}
                        </div>
                        <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
                          <div
                            className="h-full transition-all duration-500 bg-yellow-500 rounded-full"
                            style={{
                              width: `${((stats?.moyenne_notes || 0) / 5) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <p className="mt-2 text-xs text-center text-gray-500">
                          Basé sur les avis des livreurs
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne de droite */}
        <div className="space-y-6">
          {/* Dernières activités */}
          <div className="p-6 bg-white shadow rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Dernières activités
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <FaHistory className="w-4 h-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Inscription</p>
                    <p className="text-xs text-gray-600">
                      {formatDate(client.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <FaCheckCircle
                    className={`w-4 h-4 mr-3 ${isActive ? "text-green-400" : "text-red-400"}`}
                  />
                  <div>
                    <p className="text-sm font-medium">Statut actuel</p>
                    <p className="text-xs text-gray-600">
                      {isActive
                        ? "Actif depuis l'inscription"
                        : "Compte désactivé"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 border border-blue-100 rounded-lg bg-blue-50">
                <div className="flex items-center mb-2">
                  <FaChartLine className="w-4 h-4 mr-2 text-blue-500" />
                  <p className="text-sm font-medium text-blue-700">
                    Statistiques
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Livraisons totales:</span>
                    <span className="font-medium">
                      {stats?.total_livraisons || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Taux de réussite:</span>
                    <span className="font-medium">
                      {stats?.total_livraisons
                        ? `${Math.round(((stats?.livraisons_terminees || 0) / stats.total_livraisons) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations système */}
          <div className="p-6 bg-white shadow rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Informations système
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ID Utilisateur:</span>
                <span className="font-mono text-xs">
                  {id.substring(0, 12)}...
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Statut:</span>
                <span
                  className={`font-medium ${isActive ? "text-green-600" : "text-red-600"}`}
                >
                  {isActive ? "Actif" : "Inactif"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dernière mise à jour:</span>
                <span className="text-gray-900">
                  {client.updated_at
                    ? formatDateTime(client.updated_at)
                    : "Inconnue"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
