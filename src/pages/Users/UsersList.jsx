import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaUser,
  FaPlus,
  FaUserCheck,
  FaUserSlash,
  FaChartLine,
  FaSpinner,
  FaFileExcel,
  FaFileExport,
  FaDownload,
  FaFilePdf,
  FaUserTie,
} from "react-icons/fa";
import userService from "../../services/userService";
import UsersTable from "../../components/Tables/UsersTable";
import UserForm from "../../components/Forms/UserForm";

const UsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({
    total_users: 0,
    total_clients: 0,
    total_livreurs: 0,
    total_admins: 0,
    total_gestionnaires: 0,
    active_users: 0,
    inactive_users: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");
  const isFetchingRef = useRef(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      setLoading(true);

      const usersData = await userService.getAllUsers();

      // Filtrer pour exclure les clients avec rôle "client_destinataire"
      const filteredUsers =
        usersData?.filter((user) => user.role !== "client_destinataire") || [];

      console.log(
        "Utilisateurs chargés (hors client_destinataire):",
        filteredUsers,
      );

      setUsers(filteredUsers);

      const calculatedStats = {
        total_users: filteredUsers.length || 0,
        total_clients:
          filteredUsers.filter((u) => u.role === "client").length || 0,
        total_livreurs:
          filteredUsers.filter((u) => u.role === "livreur").length || 0,
        total_admins:
          filteredUsers.filter((u) => u.role === "admin").length || 0,
        total_gestionnaires:
          filteredUsers.filter((u) => u.role === "gestionnaire").length || 0,
        active_users: filteredUsers.filter((u) => u.actif).length || 0,
        inactive_users: filteredUsers.filter((u) => !u.actif).length || 0,
      };

      setStats(calculatedStats);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  };

  const handleRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);
    userService.invalidateCache();

    await fetchData();
    toast.success("Liste rafraîchie avec succès");
  };

  const handleViewUser = (userId) => {
    navigate(`/users/${userId}`);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleToggleActivation = async (userId) => {
    try {
      const userToUpdate = users.find((u) => u.id === userId);
      if (!userToUpdate) {
        toast.error("Utilisateur non trouvé");
        return;
      }

      console.log("Changement de statut pour:", userToUpdate);

      await userService.updateUserStatus(userId);

      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === userId ? { ...u, actif: !u.actif } : u)),
      );

      setStats((prevStats) => ({
        ...prevStats,
        active_users: userToUpdate.actif
          ? prevStats.active_users - 1
          : prevStats.active_users + 1,
        inactive_users: userToUpdate.actif
          ? prevStats.inactive_users + 1
          : prevStats.inactive_users - 1,
      }));

      toast.success(
        !userToUpdate.actif
          ? "Utilisateur activé avec succès"
          : "Utilisateur désactivé avec succès",
      );

      setTimeout(() => {
        userService.invalidateCache();
        fetchData();
      }, 1000);
    } catch (error) {
      console.error("Erreur toggle activation:", error);
      toast.error(error.message || "Erreur lors de la mise à jour du statut");
    }
  };

  const handleDeleteUser = async (userId) => {
    const userToDelete = users.find((u) => u.id === userId);
    if (!userToDelete) {
      toast.error("Utilisateur non trouvé");
      return;
    }

    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT l'utilisateur ${userToDelete.nom} ${userToDelete.prenom} ?\n\nCette action est irréversible et supprimera toutes les données associées de la base de données.`,
      )
    ) {
      try {
        await userService.deleteUserForce(userId);
        toast.success("Utilisateur supprimé définitivement avec succès");

        // Rafraîchir les données
        fetchData();
      } catch (error) {
        toast.error(error.message || "Erreur lors de la suppression");
      }
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    toast.success("Utilisateur créé avec succès");
    fetchData();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    toast.success("Utilisateur mis à jour avec succès");
    fetchData();
  };

  const handleSearch = async () => {
    if (!searchTerm.trim() && !roleFilter) {
      fetchData();
      return;
    }

    try {
      setLoading(true);
      const response = await userService.searchUsers(searchTerm, roleFilter);
      console.log("Résultats de recherche:", response);

      let searchResults = [];
      if (response && response.data) {
        searchResults = response.data;
      } else if (Array.isArray(response)) {
        searchResults = response;
      }

      // Filtrer pour exclure les client_destinataire des résultats de recherche
      searchResults = searchResults.filter(
        (user) => user.role !== "client_destinataire",
      );

      setUsers(searchResults);

      const filteredStats = {
        total_users: searchResults.length || 0,
        total_clients:
          searchResults.filter((u) => u.role === "client").length || 0,
        total_livreurs:
          searchResults.filter((u) => u.role === "livreur").length || 0,
        total_admins:
          searchResults.filter((u) => u.role === "admin").length || 0,
        total_gestionnaires:
          searchResults.filter((u) => u.role === "gestionnaire").length || 0,
        active_users: searchResults.filter((u) => u.actif).length || 0,
        inactive_users: searchResults.filter((u) => !u.actif).length || 0,
      };

      setStats(filteredStats);
    } catch (error) {
      toast.error("Erreur lors de la recherche");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    fetchData();
  };

  const handleExport = async (format = "pdf") => {
    try {
      setExportLoading(true);

      console.log("Début de l'export au format:", format);

      await userService.exportUsersExcel({
        search: searchTerm,
        role: roleFilter,
        format: format,
      });

      toast.success(`Export ${format.toUpperCase()} terminé avec succès`);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      toast.error(error.message || "Erreur lors de l'export");
    } finally {
      setExportLoading(false);
    }
  };

  const handleAdvancedExport = async () => {
    try {
      setExportLoading(true);

      console.log("Export avancé avec paramètres:", {
        search: searchTerm,
        role: roleFilter,
        format: exportFormat,
      });

      await userService.exportUsersExcel({
        search: searchTerm,
        role: roleFilter,
        format: exportFormat,
      });

      toast.success(`Export ${exportFormat.toUpperCase()} terminé avec succès`);
      setShowExportModal(false);
    } catch (error) {
      console.error("Erreur handleAdvancedExport:", error);
      toast.error(error.message || "Erreur lors de l'export");
    } finally {
      setExportLoading(false);
    }
  };

  const handleQuickExport = async (format) => {
    try {
      setExportLoading(true);
      console.log("Export rapide au format:", format);
      await handleExport(format);
    } catch (error) {
      console.error("Erreur handleQuickExport:", error);
      toast.error(error.message || "Erreur lors de l'export");
    } finally {
      setExportLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchTerm && !roleFilter) return true;

    const matchesSearch = searchTerm
      ? user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.telephone?.includes(searchTerm)
      : true;

    const matchesRole = roleFilter ? user.role === roleFilter : true;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* En-tête principal */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des Utilisateurs
        </h1>
        <p className="text-gray-600">
          Liste de tous les utilisateurs du système (
          {stats.total_users || users.length} utilisateurs)
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">
                {stats.total_users || users.length}
              </p>
            </div>
            <FaUser className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active_users !== undefined
                  ? stats.active_users
                  : users.filter((u) => u.actif).length}
              </p>
            </div>
            <FaUserCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactifs</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.inactive_users !== undefined
                  ? stats.inactive_users
                  : users.filter((u) => !u.actif).length}
              </p>
            </div>
            <FaUserSlash className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clients</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.total_clients ||
                  users.filter((u) => u.role === "client").length}
              </p>
            </div>
            <FaChartLine className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Deuxième ligne de statistiques */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Administrateurs</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.total_admins ||
                  users.filter((u) => u.role === "admin").length}
              </p>
            </div>
            <FaUser className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Livreurs</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.total_livreurs ||
                  users.filter((u) => u.role === "livreur").length}
              </p>
            </div>
            <FaUser className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gestionnaires</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.total_gestionnaires ||
                  users.filter((u) => u.role === "gestionnaire").length}
              </p>
            </div>
            <FaUserTie className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col justify-between gap-4 p-4 bg-white rounded-lg shadow md:flex-row md:items-center">
        <div className="flex-1">
          <div className="relative">
            <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, téléphone..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tous les rôles</option>
            <option value="admin">Administrateurs</option>
            <option value="gestionnaire">Gestionnaires</option>
            <option value="client">Clients</option>
            <option value="livreur">Livreurs</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {refreshing || loading ? (
              <FaSpinner className="mr-2 animate-spin" />
            ) : (
              <FaSearch className="mr-2" />
            )}
            {refreshing ? "Rafraîchissement..." : "Rafraîchir"}
          </button>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
          >
            Rechercher
          </button>

          {(searchTerm || roleFilter) && (
            <button
              onClick={handleResetFilters}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Réinitialiser
            </button>
          )}

          {/* Bouton Export avec dropdown */}
          <div className="relative group">
            <button
              onClick={() => setShowExportModal(true)}
              disabled={loading || users.length === 0 || exportLoading}
              className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {exportLoading ? (
                <FaSpinner className="animate-spin" />
              ) : exportFormat === "pdf" ? (
                <FaFilePdf />
              ) : exportFormat === "xlsx" ? (
                <FaFileExcel />
              ) : (
                <FaFileExport />
              )}
              Exporter ({exportFormat.toUpperCase()})
            </button>

            {/* Menu déroulant pour export rapide */}
            <div className="absolute right-0 z-10 hidden mt-2 bg-white rounded-lg shadow-lg w-48 group-hover:block">
              <div className="py-1">
                <button
                  onClick={() => handleQuickExport("pdf")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaFilePdf className="mr-2 text-red-600" />
                  Export PDF
                  <span className="ml-auto text-xs text-gray-400">
                    Recommandé
                  </span>
                </button>
                <button
                  onClick={() => handleQuickExport("xlsx")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaFileExcel className="mr-2 text-green-600" />
                  Export Excel
                </button>
                <button
                  onClick={() => handleQuickExport("csv")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaFileExport className="mr-2 text-blue-600" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
          >
            <FaPlus /> Nouvel utilisateur
          </button>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="overflow-hidden bg-white shadow rounded-xl">
        {loading && !users.length ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
            <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <FaUser className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-2 text-gray-500">Aucun utilisateur trouvé</p>
            {searchTerm || roleFilter ? (
              <button
                onClick={handleResetFilters}
                className="mt-4 text-primary-600 hover:text-primary-700"
              >
                Réinitialiser les filtres
              </button>
            ) : null}
          </div>
        ) : (
          <UsersTable
            users={filteredUsers}
            onToggleActivation={handleToggleActivation}
            onDelete={handleDeleteUser}
            onView={handleViewUser}
            onEdit={handleEditUser}
          />
        )}

        {/* Pied de tableau */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {filteredUsers.length} utilisateur
            {filteredUsers.length !== 1 ? "s" : ""} sur {users.length}
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Précédent
            </button>
            <span className="px-3 py-1 text-sm">1</span>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Modale de création */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowCreateModal(false)}
            ></div>

            <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="px-6 pt-6 pb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Créer un nouvel utilisateur
                </h3>
              </div>

              <div className="px-6 py-4">
                <UserForm
                  onSuccess={handleCreateSuccess}
                  onCancel={() => setShowCreateModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'édition */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => {
                setShowEditModal(false);
                setSelectedUser(null);
              }}
            ></div>

            <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="px-6 pt-6 pb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Modifier l'utilisateur : {selectedUser.nom}{" "}
                  {selectedUser.prenom}
                </h3>
              </div>

              <div className="px-6 py-4">
                <UserForm
                  user={selectedUser}
                  onSuccess={handleEditSuccess}
                  onCancel={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'export simplifiée */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowExportModal(false)}
            ></div>

            <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="px-6 pt-6 pb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Exporter les utilisateurs
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filteredUsers.length} utilisateur(s) à exporter
                </p>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-6">
                  {/* Format d'export */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Format d'export
                    </label>
                    <div className="grid grid-cols-1 gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => setExportFormat("pdf")}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          exportFormat === "pdf"
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center">
                          <FaFilePdf className="w-5 h-5 mr-3 text-red-600" />
                          <div className="text-left">
                            <p className="font-medium">PDF</p>
                            <p className="text-sm text-gray-500">
                              Format recommandé pour l'impression
                            </p>
                          </div>
                        </div>
                        {exportFormat === "pdf" && (
                          <span className="text-primary-600">✓</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setExportFormat("xlsx")}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          exportFormat === "xlsx"
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center">
                          <FaFileExcel className="w-5 h-5 mr-3 text-green-600" />
                          <div className="text-left">
                            <p className="font-medium">Excel (XLSX)</p>
                            <p className="text-sm text-gray-500">
                              Pour l'analyse et le tri des données
                            </p>
                          </div>
                        </div>
                        {exportFormat === "xlsx" && (
                          <span className="text-primary-600">✓</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setExportFormat("csv")}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          exportFormat === "csv"
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center">
                          <FaFileExport className="w-5 h-5 mr-3 text-blue-600" />
                          <div className="text-left">
                            <p className="font-medium">CSV</p>
                            <p className="text-sm text-gray-500">
                              Pour l'importation dans d'autres applications
                            </p>
                          </div>
                        </div>
                        {exportFormat === "csv" && (
                          <span className="text-primary-600">✓</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Options de filtrage */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">
                      Filtres appliqués :
                    </p>
                    <ul className="mt-2 text-sm text-gray-600">
                      {searchTerm && <li>• Recherche : "{searchTerm}"</li>}
                      {roleFilter && <li>• Rôle : {roleFilter}</li>}
                      <li>• Nombre : {filteredUsers.length} utilisateur(s)</li>
                      <li>• Toutes les colonnes seront exportées</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAdvancedExport}
                    disabled={exportLoading || filteredUsers.length === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {exportLoading ? (
                      <FaSpinner className="inline w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <FaDownload className="inline w-4 h-4 mr-2" />
                    )}
                    Exporter ({exportFormat.toUpperCase()})
                  </button>
                </div>
                {exportLoading && (
                  <div className="mt-3 text-xs text-gray-500">
                    Le téléchargement peut prendre quelques secondes...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
