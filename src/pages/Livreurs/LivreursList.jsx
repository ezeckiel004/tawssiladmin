import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FaSearch,
  FaTruck,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaEye,
  FaTrash,
  FaSave,
  FaTimes,
  FaPowerOff,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import livreurService from "../../services/livreurService";

const LivreursList = () => {
  const [livreurs, setLivreurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLivreur, setSelectedLivreur] = useState(null);
  const [editForm, setEditForm] = useState({
    type: "",
    desactiver: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLivreurs();
  }, []);

  const fetchLivreurs = async () => {
    try {
      setLoading(true);
      const data = await livreurService.getAllLivreurs();
      const transformedData = livreurService.transformLivreurs(data);
      setLivreurs(transformedData);
    } catch (error) {
      toast.error("Erreur lors du chargement des livreurs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivation = async (livreurId) => {
    try {
      const livreur = livreurs.find((l) => l.id === livreurId);
      if (!livreur) return;

      const newStatus = !livreur.desactiver;

      // Appel API pour toggle activation
      await livreurService.toggleActivation(livreurId, newStatus);

      // Mise à jour locale
      setLivreurs((prev) =>
        prev.map((livreur) =>
          livreur.id === livreurId
            ? { ...livreur, desactiver: newStatus }
            : livreur,
        ),
      );

      toast.success(
        `Livreur ${newStatus ? "désactivé" : "activé"} avec succès`,
      );
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
      console.error(error);
    }
  };

  const handleDeleteLivreur = async (livreurId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce livreur ?")) {
      try {
        await livreurService.deleteLivreur(livreurId);
        setLivreurs((prev) =>
          prev.filter((livreur) => livreur.id !== livreurId),
        );
        toast.success("Livreur supprimé avec succès");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
        console.error(error);
      }
    }
  };

  // Ouvrir le modal d'édition
  const handleOpenEditModal = (livreur) => {
    setSelectedLivreur(livreur);
    setEditForm({
      type: livreur.type || "distributeur",
      desactiver: livreur.desactiver || false,
    });
    setShowEditModal(true);
  };

  // Fermer le modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedLivreur(null);
    setEditForm({ type: "", desactiver: false });
    setIsSubmitting(false);
  };

  // Soumettre la modification
  const handleSubmitEdit = async () => {
    if (!selectedLivreur) return;

    try {
      setIsSubmitting(true);

      // Préparer les données de mise à jour
      const updateData = {
        type: editForm.type,
        desactiver: editForm.desactiver,
      };

      // Mettre à jour le type
      if (editForm.type !== selectedLivreur.type) {
        await livreurService.updateLivreur(selectedLivreur.id, {
          type: editForm.type,
        });
      }

      // Mettre à jour le statut si nécessaire
      if (editForm.desactiver !== selectedLivreur.desactiver) {
        await livreurService.toggleActivation(
          selectedLivreur.id,
          editForm.desactiver,
        );
      }

      // Mise à jour locale
      setLivreurs((prev) =>
        prev.map((livreur) =>
          livreur.id === selectedLivreur.id
            ? {
                ...livreur,
                type: editForm.type,
                desactiver: editForm.desactiver,
              }
            : livreur,
        ),
      );

      toast.success("Livreur mis à jour avec succès");
      handleCloseEditModal();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLivreurs = livreurs.filter((livreur) => {
    const matchesSearch =
      (livreur.user?.nom?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) ||
      (livreur.user?.prenom?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) ||
      (livreur.user?.email?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) ||
      (livreur.user?.telephone || "").includes(searchTerm) ||
      (livreur.nom?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (livreur.prenom?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) ||
      (livreur.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (livreur.telephone || "").includes(searchTerm);

    const matchesType = !typeFilter || livreur.type === typeFilter;
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "actif" ? !livreur.desactiver : livreur.desactiver);

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Livreurs
          </h1>
          <p className="text-gray-600">
            Liste de tous les livreurs de la plateforme
          </p>
        </div>

        {/* Filtres et actions */}
        <div className="p-6 mb-6 bg-white shadow rounded-xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, téléphone..."
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">Tous types</option>
                <option value="distributeur">Distributeurs</option>
                <option value="ramasseur">Ramasseurs</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tous statuts</option>
                <option value="actif">Actifs</option>
                <option value="inactif">Inactifs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white shadow rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total livreurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {livreurs.length}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <FaTruck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white shadow rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {livreurs.filter((l) => !l.desactiver).length}
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
                <p className="text-sm text-gray-600">Distributeurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {livreurs.filter((l) => l.type === "distributeur").length}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                <FaTruck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white shadow rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ramasseurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {livreurs.filter((l) => l.type === "ramasseur").length}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
                <FaTruck className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des livreurs */}
        <div className="overflow-hidden bg-white shadow rounded-xl">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
              <p className="mt-4 text-gray-600">Chargement des livreurs...</p>
            </div>
          ) : filteredLivreurs.length === 0 ? (
            <div className="p-8 text-center">
              <FaTruck className="w-12 h-12 mx-auto text-gray-300" />
              <p className="mt-2 text-gray-500">Aucun livreur trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Livreur
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Type
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
                  {filteredLivreurs.map((livreur) => (
                    <tr key={livreur.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            {livreur.user?.photo_url ? (
                              <img
                                className="w-10 h-10 rounded-full"
                                src={livreur.user.photo_url}
                                alt={`${livreur.user.prenom} ${livreur.user.nom}`}
                              />
                            ) : (
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100">
                                <FaUser className="w-5 h-5 text-primary-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {livreur.user?.prenom || livreur.prenom}{" "}
                              {livreur.user?.nom || livreur.nom}
                            </div>
                            <div className="text-sm text-gray-500">
                              {livreur.user?.email || livreur.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {livreur.user?.email || livreur.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {livreur.user?.telephone ||
                            livreur.telephone ||
                            "Non renseigné"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            livreur.type === "distributeur"
                              ? "bg-blue-100 text-blue-800"
                              : livreur.type === "ramasseur"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {livreur.type === "distributeur"
                            ? "Distributeur"
                            : livreur.type === "ramasseur"
                              ? "Ramasseur"
                              : "Non défini"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActivation(livreur.id)}
                          className={`px-3 py-1 text-xs font-medium rounded-full flex items-center ${
                            !livreur.desactiver
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {!livreur.desactiver ? (
                            <>
                              <FaCheckCircle className="w-3 h-3 mr-1" /> Actif
                            </>
                          ) : (
                            <>
                              <FaTimesCircle className="w-3 h-3 mr-1" /> Inactif
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/livreurs/${livreur.id}`)}
                            className="p-1 text-primary-600 hover:text-primary-900"
                            title="Voir détails"
                          >
                            <FaEye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(livreur)}
                            className="p-1 text-yellow-600 hover:text-yellow-900"
                            title="Modifier le livreur"
                          >
                            <FaEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLivreur(livreur.id)}
                            className="p-1 text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <FaTrash className="w-5 h-5" />
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
              {filteredLivreurs.length} livreur
              {filteredLivreurs.length !== 1 ? "s" : ""} sur {livreurs.length}
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Précédent
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Suivant
              </button>
            </div>
          </div>
        </div>

        {/* Section informations */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Informations
            </h2>
          </div>

          <div className="p-6 border border-blue-200 bg-blue-50 rounded-xl">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <FaUser className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">
                  Gestion des livreurs
                </p>
                <p className="text-sm text-gray-600">
                  Gérez les livreurs existants, modifiez leur type ou statut
                  selon les besoins
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      {showEditModal && selectedLivreur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
          <div className="relative w-full max-w-md p-6 mx-auto bg-white rounded-lg shadow-lg">
            {/* En-tête du modal */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Modifier le livreur
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedLivreur.user?.prenom || selectedLivreur.prenom}{" "}
                  {selectedLivreur.user?.nom || selectedLivreur.nom}
                </p>
              </div>
              <button
                onClick={handleCloseEditModal}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu du modal */}
            <div className="space-y-6">
              {/* Type de livreur */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Type de livreur
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setEditForm({ ...editForm, type: "distributeur" })
                    }
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-colors ${
                      editForm.type === "distributeur"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-full mb-2 ${
                        editForm.type === "distributeur"
                          ? "bg-blue-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <FaTruck
                        className={`w-6 h-6 ${
                          editForm.type === "distributeur"
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        editForm.type === "distributeur"
                          ? "text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      Distributeur
                    </span>
                    <p className="mt-1 text-xs text-center text-gray-500">
                      Livraison aux destinataires
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditForm({ ...editForm, type: "ramasseur" })
                    }
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-colors ${
                      editForm.type === "ramasseur"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-full mb-2 ${
                        editForm.type === "ramasseur"
                          ? "bg-orange-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <FaTruck
                        className={`w-6 h-6 ${
                          editForm.type === "ramasseur"
                            ? "text-orange-600"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        editForm.type === "ramasseur"
                          ? "text-orange-700"
                          : "text-gray-700"
                      }`}
                    >
                      Ramasseur
                    </span>
                    <p className="mt-1 text-xs text-center text-gray-500">
                      Collecte chez expéditeurs
                    </p>
                  </button>
                </div>
              </div>

              {/* Statut du livreur */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Statut du livreur
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setEditForm({ ...editForm, desactiver: false })
                    }
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-colors ${
                      !editForm.desactiver
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-full mb-2 ${
                        !editForm.desactiver ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      <FaCheckCircle
                        className={`w-6 h-6 ${
                          !editForm.desactiver
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        !editForm.desactiver
                          ? "text-green-700"
                          : "text-gray-700"
                      }`}
                    >
                      Actif
                    </span>
                    <p className="mt-1 text-xs text-center text-gray-500">
                      Peut recevoir des courses
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditForm({ ...editForm, desactiver: true })
                    }
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-colors ${
                      editForm.desactiver
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-full mb-2 ${
                        editForm.desactiver ? "bg-red-100" : "bg-gray-100"
                      }`}
                    >
                      <FaTimesCircle
                        className={`w-6 h-6 ${
                          editForm.desactiver ? "text-red-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        editForm.desactiver ? "text-red-700" : "text-gray-700"
                      }`}
                    >
                      Inactif
                    </span>
                    <p className="mt-1 text-xs text-center text-gray-500">
                      Ne peut pas recevoir de courses
                    </p>
                  </button>
                </div>
              </div>

              {/* Informations sur les types */}
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="mb-1 text-xs font-medium text-gray-600">
                  Informations :
                </p>
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Distributeur:</span> Livraison
                  des colis aux destinataires finaux
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  <span className="font-medium">Ramasseur:</span> Collecte des
                  colis chez les expéditeurs
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <FaPowerOff className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-600">
                    Un livreur inactif ne pourra pas être assigné à de nouvelles
                    livraisons
                  </p>
                </div>
              </div>

              {/* Résumé des modifications */}
              {(editForm.type !== selectedLivreur.type ||
                editForm.desactiver !== selectedLivreur.desactiver) && (
                <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                  <p className="mb-1 text-xs font-medium text-yellow-800">
                    Modifications à appliquer :
                  </p>
                  <ul className="space-y-1 text-xs text-yellow-700">
                    {editForm.type !== selectedLivreur.type && (
                      <li>
                        Type :{" "}
                        {selectedLivreur.type === "distributeur"
                          ? "Distributeur"
                          : "Ramasseur"}{" "}
                        →{" "}
                        {editForm.type === "distributeur"
                          ? "Distributeur"
                          : "Ramasseur"}
                      </li>
                    )}
                    {editForm.desactiver !== selectedLivreur.desactiver && (
                      <li>
                        Statut :{" "}
                        {selectedLivreur.desactiver ? "Inactif" : "Actif"} →{" "}
                        {editForm.desactiver ? "Inactif" : "Actif"}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Actions */}
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
                    isSubmitting ||
                    (editForm.type === selectedLivreur.type &&
                      editForm.desactiver === selectedLivreur.desactiver)
                  }
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 ${
                    isSubmitting ||
                    (editForm.type === selectedLivreur.type &&
                      editForm.desactiver === selectedLivreur.desactiver)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary-600 hover:bg-primary-700"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LivreursList;
