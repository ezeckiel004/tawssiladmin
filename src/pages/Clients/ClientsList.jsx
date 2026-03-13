import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FaSearch,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaEdit,
  FaEye,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaSync,
  FaBan,
  FaUserCheck,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import clientService from "../../services/clientService";

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editForm, setEditForm] = useState({ status: "active" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      console.log("🔄 Chargement des clients...");

      const response = await clientService.getAllClients();
      console.log("📦 Réponse API brute:", response);

      if (response.success && response.data) {
        // Formater les clients depuis la réponse API
        const formattedClients = response.data.map((item) => {
          // item.client contient les données de l'utilisateur
          // item.status vient de la table clients
          const user = item.client || {};

          console.log("📝 Item:", item);
          console.log("👤 User:", user);

          // Créer le nom complet
          const firstName = user.prenom || "";
          const lastName = user.nom || "";
          const fullName = `${firstName} ${lastName}`.trim();

          return {
            id: item.id || user.id, // ID du client (de la table clients)
            user_id: user.id, // ID de l'utilisateur
            name: fullName || user.email || "Non renseigné",
            email: user.email || "Non renseigné",
            telephone: user.telephone || "Non renseigné",
            prenom: user.prenom || "",
            nom: user.nom || "",
            created_at: user.created_at || new Date().toISOString(),
            status: item.status || "active", // Statut de la table clients
            actif: user.actif !== undefined ? user.actif : true,
          };
        });

        console.log("✅ Clients formatés:", formattedClients);
        setClients(formattedClients);
      } else {
        toast.error("Erreur lors du chargement des clients");
      }
    } catch (error) {
      console.error("❌ Erreur API:", error);
      toast.error("Erreur de connexion au serveur");
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId, clientName) => {
    if (!window.confirm(`Supprimer le client "${clientName}" ?`)) return;

    try {
      await clientService.deleteClient(clientId);
      toast.success("Client supprimé avec succès");
      fetchClients();
    } catch (error) {
      console.error("❌ Erreur suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleToggleStatus = async (client) => {
    const currentStatus = client.status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "activer" : "désactiver";

    if (!window.confirm(`${action} le client "${client.name}" ?`)) return;

    try {
      console.log(`🔄 Basculement statut ${client.id} -> ${newStatus}`);

      const response = await clientService.toggleClientStatus(client.id);

      if (response.success) {
        // Mise à jour optimiste locale
        setClients((prev) =>
          prev.map((c) =>
            c.id === client.id ? { ...c, status: newStatus } : c,
          ),
        );
        toast.success(response.message || `Client ${action} avec succès`);
      } else {
        toast.error(response.message || "Erreur lors du changement de statut");
      }
    } catch (error) {
      console.error("❌ Erreur changement statut:", error);
      toast.error("Erreur lors du changement de statut");
      fetchClients();
    }
  };

  const handleOpenEditModal = (client) => {
    setSelectedClient(client);
    setEditForm({ status: client.status || "active" });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedClient(null);
    setEditForm({ status: "active" });
    setIsSubmitting(false);
  };

  const handleSubmitEdit = async () => {
    if (!selectedClient) return;

    try {
      setIsSubmitting(true);

      if (editForm.status === selectedClient.status) {
        toast.info("Aucun changement détecté");
        handleCloseEditModal();
        return;
      }

      const response = await clientService.updateClientStatus(
        selectedClient.id,
        editForm.status,
      );

      if (response.success) {
        setClients((prev) =>
          prev.map((client) =>
            client.id === selectedClient.id
              ? { ...client, status: editForm.status }
              : client,
          ),
        );

        toast.success(response.message || "Statut mis à jour avec succès");
        handleCloseEditModal();
      } else {
        toast.error(response.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      searchTerm === "" ||
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.telephone?.includes(searchTerm) ||
      client.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.nom?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "active").length;
  const inactiveClients = clients.filter((c) => c.status === "inactive").length;

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR");
    } catch {
      return "Date invalide";
    }
  };

  return (
    <div>
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestion des Clients
            </h1>
            <p className="text-gray-600">
              {totalClients} client{totalClients !== 1 ? "s" : ""} enregistré
              {totalClients !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={fetchClients}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-primary-600 border-primary-300 hover:bg-primary-50"
            disabled={loading}
          >
            {loading ? (
              <FaSpinner className="w-4 h-4 animate-spin" />
            ) : (
              <FaSync className="w-4 h-4" />
            )}
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="p-6 mb-6 bg-white shadow rounded-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom, email ou téléphone..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
        <div className="p-6 bg-white shadow rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total clients</p>
              <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <FaUser className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white shadow rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clients actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeClients}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <FaUserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white shadow rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clients inactifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {inactiveClients}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
              <FaBan className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-hidden bg-white shadow rounded-xl">
        {loading ? (
          <div className="p-8 text-center">
            <FaSpinner className="w-12 h-12 mx-auto animate-spin text-primary-600" />
            <p className="mt-4 text-gray-600">Chargement des clients...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-8 text-center">
            <FaUser className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-2 text-gray-500">
              {searchTerm
                ? "Aucun client ne correspond à votre recherche"
                : "Aucun client enregistré"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-primary-600 hover:text-primary-800"
              >
                Réinitialiser la recherche
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Client
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Inscription
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
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100">
                            <FaUser className="w-5 h-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {client.prenom || client.nom
                              ? `${client.prenom} ${client.nom}`.trim()
                              : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <FaEnvelope className="w-4 h-4 mr-2 text-gray-400" />
                          {client.email}
                        </div>
                        {client.telephone &&
                          client.telephone !== "Non renseigné" && (
                            <div className="flex items-center text-sm">
                              <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
                              {client.telephone}
                            </div>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm">
                        <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(client.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(client)}
                        className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 transition-colors ${
                          client.status === "active"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                        title={
                          client.status === "active"
                            ? "Cliquer pour désactiver"
                            : "Cliquer pour activer"
                        }
                      >
                        {client.status === "active" ? (
                          <FaCheckCircle className="w-3 h-3" />
                        ) : (
                          <FaTimesCircle className="w-3 h-3" />
                        )}
                        {client.status === "active" ? "Actif" : "Inactif"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/clients/${client.id}`)}
                          className="p-2 rounded text-primary-600 hover:bg-primary-50"
                          title="Voir détails"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(client)}
                          className="p-2 text-yellow-600 rounded hover:bg-yellow-50"
                          title="Modifier statut"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClient(client.id, client.name)
                          }
                          className="p-2 text-red-600 rounded hover:bg-red-50"
                          title="Supprimer"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pied de table */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {filteredClients.length} client
            {filteredClients.length !== 1 ? "s" : ""} affiché
            {filteredClients.length !== 1 ? "s" : ""}
          </div>
          <div className="text-sm text-gray-500">
            Total: {totalClients} client{totalClients !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Modal d'édition du statut */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
          <div className="relative w-full max-w-md p-6 mx-auto bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Modifier le statut
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedClient.name}
                </p>
              </div>
              <button
                onClick={handleCloseEditModal}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Nouveau statut
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditForm({ status: "active" })}
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-colors ${
                      editForm.status === "active"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-full mb-2 ${editForm.status === "active" ? "bg-green-100" : "bg-gray-100"}`}
                    >
                      <FaCheckCircle
                        className={`w-6 h-6 ${editForm.status === "active" ? "text-green-600" : "text-gray-400"}`}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${editForm.status === "active" ? "text-green-700" : "text-gray-700"}`}
                    >
                      Actif
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditForm({ status: "inactive" })}
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-colors ${
                      editForm.status === "inactive"
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-full mb-2 ${editForm.status === "inactive" ? "bg-red-100" : "bg-gray-100"}`}
                    >
                      <FaTimesCircle
                        className={`w-6 h-6 ${editForm.status === "inactive" ? "text-red-600" : "text-gray-400"}`}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${editForm.status === "inactive" ? "text-red-700" : "text-gray-700"}`}
                    >
                      Inactif
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitEdit}
                  disabled={
                    isSubmitting || editForm.status === selectedClient.status
                  }
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 ${
                    isSubmitting || editForm.status === selectedClient.status
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary-600 hover:bg-primary-700"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      En cours...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" />
                      Confirmer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsList;
