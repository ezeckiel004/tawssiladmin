import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FaSearch,
  FaFilter,
  FaUser,
  FaIdCard,
  FaCar,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaCheck,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaFileAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import demandeAdhesionService from "../../services/demandeAdhesionService";

const DemandesList = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDemandes();
  }, [statusFilter]);

  const fetchDemandes = async () => {
    try {
      setLoading(true);

      let response;
      if (statusFilter) {
        // Utiliser l'endpoint par statut si un filtre est sélectionné
        response =
          await demandeAdhesionService.getDemandesByStatus(statusFilter);
      } else {
        // Sinon, récupérer toutes les demandes
        response = await demandeAdhesionService.getAllDemandes();
      }

      setDemandes(response.data || response);
    } catch (error) {
      console.error("Erreur API:", error);
      toast.error("Erreur lors du chargement des demandes");
      // Garder les données mockées en fallback pour le développement
      setDemandes([]);
    } finally {
      setLoading(false);
    }
  };

  const updateDemandeStatus = async (demandeId, status) => {
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir ${status === "approved" ? "approuver" : "rejeter"} cette demande ?`,
      )
    ) {
      return;
    }

    try {
      // Trouver la demande pour récupérer l'ID utilisateur
      const demande = demandes.find((d) => d.id === demandeId);
      if (!demande) {
        toast.error("Demande introuvable");
        return;
      }

      // Utiliser l'ID utilisateur depuis la demande
      const userId = demande.user_id || demande.user?.id;
      if (!userId) {
        toast.error("ID utilisateur manquant");
        return;
      }

      await demandeAdhesionService.updateStatus(
        demandeId,
        status,
        userId.toString(), // Convertir en string comme attendu par l'API
      );

      toast.success(
        `Demande ${status === "approved" ? "approuvée" : "rejetée"}`,
      );

      // Rafraîchir la liste
      fetchDemandes();
    } catch (error) {
      console.error("Erreur API:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleViewDetails = (demandeId) => {
    navigate(`/demandes-adhesion/${demandeId}`);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          icon: FaClock,
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          label: "En attente",
        };
      case "approved":
        return {
          icon: FaCheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-100",
          label: "Approuvée",
        };
      case "rejected":
        return {
          icon: FaTimesCircle,
          color: "text-red-600",
          bgColor: "bg-red-100",
          label: "Rejetée",
        };
      default:
        return {
          icon: FaClock,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          label: status,
        };
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const filteredDemandes = demandes.filter((demande) => {
    if (!demande) return false;

    const user = demande.user || {};
    const matchesSearch =
      searchTerm === "" ||
      (user.nom && user.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.prenom &&
        user.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email &&
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.telephone && user.telephone.includes(searchTerm)) ||
      (demande.id_card_number && demande.id_card_number.includes(searchTerm));

    return matchesSearch;
  });

  // Obtenir le nombre de demandes par statut
  const pendingCount = demandes.filter((d) => d.status === "pending").length;
  const approvedCount = demandes.filter((d) => d.status === "approved").length;
  const rejectedCount = demandes.filter((d) => d.status === "rejected").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Demandes d'Adhésion
        </h1>
        <p className="text-gray-600">Gérez les demandes de devenir livreur</p>
      </div>

      {/* Filtres */}
      <div className="p-6 mb-6 bg-white shadow rounded-xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, téléphone, CIN..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <FaFilter className="mr-2 text-gray-400" />
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvées</option>
                <option value="rejected">Rejetées</option>
              </select>
            </div>
            <button
              onClick={fetchDemandes}
              className="px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
            >
              Rafraîchir
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
        <div className="p-6 bg-white shadow rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
              <FaClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white shadow rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approuvées</p>
              <p className="text-2xl font-bold text-gray-900">
                {approvedCount}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <FaCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white shadow rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejetées</p>
              <p className="text-2xl font-bold text-gray-900">
                {rejectedCount}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
              <FaTimesCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des demandes */}
      <div className="overflow-hidden bg-white shadow rounded-xl">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
            <p className="mt-4 text-gray-600">Chargement des demandes...</p>
          </div>
        ) : filteredDemandes.length === 0 ? (
          <div className="p-8 text-center">
            <FaUser className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-2 text-gray-500">Aucune demande trouvée</p>
            <button
              onClick={fetchDemandes}
              className="px-4 py-2 mt-4 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Candidat
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Informations
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDemandes.map((demande) => {
                  if (!demande) return null;

                  const user = demande.user || {};
                  const StatusIcon = getStatusConfig(demande.status).icon;
                  const statusColor = getStatusConfig(demande.status).color;
                  const statusBgColor = getStatusConfig(demande.status).bgColor;
                  const statusLabel = getStatusConfig(demande.status).label;

                  return (
                    <tr key={demande.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            {user.photo_url ? (
                              <img
                                className="w-10 h-10 rounded-full"
                                src={user.photo_url}
                                alt={`${user.nom} ${user.prenom}`}
                              />
                            ) : (
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100">
                                <FaUser className="w-5 h-5 text-primary-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.nom} {user.prenom}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {demande.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <FaEnvelope className="w-4 h-4 mr-2 text-gray-400" />
                            {user.email || "N/A"}
                          </div>
                          <div className="flex items-center text-sm">
                            <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                            {user.telephone || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <FaIdCard className="w-4 h-4 mr-2 text-gray-400" />
                            {demande.id_card_type || "CIN"}:{" "}
                            {demande.id_card_number || "N/A"}
                          </div>
                          <div className="flex items-center text-sm">
                            <FaCar className="w-4 h-4 mr-2 text-gray-400" />
                            {demande.vehicule_type || "Non spécifié"}
                          </div>
                          {demande.message && (
                            <div className="max-w-xs text-xs text-gray-500 truncate">
                              "{demande.message}"
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm">
                          <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(demande.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${statusBgColor}`}
                        >
                          <StatusIcon
                            className={`h-4 w-4 mr-2 ${statusColor}`}
                          />
                          <span className="font-medium">{statusLabel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(demande.id)}
                            className="p-1 text-primary-600 hover:text-primary-900"
                            title="Voir détails"
                          >
                            <FaEye className="w-5 h-5" />
                          </button>

                          {demande.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  updateDemandeStatus(demande.id, "approved")
                                }
                                className="p-1 text-green-600 hover:text-green-900"
                                title="Approuver"
                              >
                                <FaCheck className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() =>
                                  updateDemandeStatus(demande.id, "rejected")
                                }
                                className="p-1 text-red-600 hover:text-red-900"
                                title="Rejeter"
                              >
                                <FaTimes className="w-5 h-5" />
                              </button>
                            </>
                          )}

                          {(demande.id_card_image_url ||
                            demande.drivers_license_url ||
                            demande.vehicule_url) && (
                            <button
                              className="p-1 text-blue-600 hover:text-blue-900"
                              title="Documents"
                              onClick={() => {
                                // Ouvrir une fenêtre modale ou rediriger vers une page de documents
                                const urls = [];
                                if (demande.id_card_image_url)
                                  urls.push({
                                    name: "Carte d'identité",
                                    url: demande.id_card_image_url,
                                  });
                                if (demande.drivers_license_url)
                                  urls.push({
                                    name: "Permis de conduire",
                                    url: demande.drivers_license_url,
                                  });
                                if (demande.vehicule_url)
                                  urls.push({
                                    name: "Véhicule",
                                    url: demande.vehicule_url,
                                  });

                                // Ouvrir chaque URL dans un nouvel onglet
                                urls.forEach((doc) => {
                                  window.open(doc.url, "_blank");
                                });
                              }}
                            >
                              <FaFileAlt className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pied de table */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {filteredDemandes.length} demande
            {filteredDemandes.length !== 1 ? "s" : ""}
          </div>
          <div className="text-sm text-gray-500">
            Total: {demandes.length} demande{demandes.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-6 mt-8 border border-blue-200 bg-blue-50 rounded-xl">
        <h3 className="mb-3 text-lg font-semibold text-blue-800">
          Processus de validation
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-start">
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-3 bg-blue-100 rounded-full">
              <span className="font-bold text-blue-600">1</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">
                Vérifier les documents
              </h4>
              <p className="mt-1 text-sm text-blue-700">
                Assurez-vous que tous les documents requis sont fournis et
                valides.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-3 bg-blue-100 rounded-full">
              <span className="font-bold text-blue-600">2</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">
                Valider les informations
              </h4>
              <p className="mt-1 text-sm text-blue-700">
                Vérifiez l'authenticité des informations personnelles et
                professionnelles.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-3 bg-blue-100 rounded-full">
              <span className="font-bold text-blue-600">3</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">
                Prendre une décision
              </h4>
              <p className="mt-1 text-sm text-blue-700">
                Approuvez ou rejetez la demande en fonction des critères
                d'éligibilité.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandesList;
