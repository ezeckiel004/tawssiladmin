import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaArrowLeft,
  FaUser,
  FaIdCard,
  FaCar,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaFileAlt,
  FaDownload,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaExternalLinkAlt,
  FaEye,
} from "react-icons/fa";
import demandeAdhesionService from "../../services/demandeAdhesionService";

const DemandeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [decisionComment, setDecisionComment] = useState("");
  const [imagePreview, setImagePreview] = useState({
    open: false,
    url: null,
    title: null,
  });

  useEffect(() => {
    fetchDemande();
  }, [id]);

  const fetchDemande = async () => {
    try {
      setLoading(true);
      const response = await demandeAdhesionService.getDemandeById(id);
      console.log("Détails demande API:", response); // Debug
      setDemande(response.data || response);
    } catch (error) {
      console.error("Erreur API:", error);
      toast.error("Erreur lors du chargement de la demande");
      navigate("/demandes-adhesion");
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (status) => {
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir ${
          status === "approved" ? "approuver" : "rejeter"
        } cette demande ?`,
      )
    ) {
      return;
    }

    try {
      setUpdating(true);

      if (!demande || !demande.user) {
        toast.error("Données de la demande incomplètes");
        return;
      }

      const userId = demande.user_id || demande.user.id;

      await demandeAdhesionService.updateStatus(id, status, userId.toString());

      toast.success(
        `Demande ${status === "approved" ? "approuvée" : "rejetée"}`,
      );

      fetchDemande();
    } catch (error) {
      console.error("Erreur API:", error);
      toast.error("Erreur lors de la prise de décision");
    } finally {
      setUpdating(false);
    }
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
          label: status || "Inconnu",
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("fr-FR");
  };

  // Fonction améliorée pour gérer le téléchargement
  const handleDocumentAction = (url, filename, type = "view") => {
    if (!url) {
      toast.error("Document non disponible");
      return;
    }

    console.log(`Tentative ${type} document:`, url); // Debug

    if (type === "view") {
      // Pour les images, utiliser l'aperçu
      if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        setImagePreview({
          open: true,
          url: url,
          title: filename,
        });
      } else {
        // Pour les PDF, ouvrir dans un nouvel onglet
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } else if (type === "download") {
      // Téléchargement direct
      try {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename || "document";

        // Essayer différentes méthodes
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Téléchargement démarré");
      } catch (error) {
        console.error("Erreur téléchargement:", error);
        // Fallback: ouvrir dans un nouvel onglet
        window.open(url, "_blank");
        toast("Le document s'ouvre dans un nouvel onglet");
      }
    }
  };

  // Fonction pour construire les URLs correctement
  const buildDocumentUrl = (path) => {
    if (!path) return null;

    // Si c'est déjà une URL complète, la retourner
    if (path.startsWith("http")) return path;

    // Sinon, construire l'URL relative
    const baseUrl = window.location.origin;
    return `${baseUrl}/storage/${path.replace(/^public\//, "")}`;
  };

  const closePreview = () => {
    setImagePreview({
      open: false,
      url: null,
      title: null,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary-600"></div>
        <p className="mt-4 text-gray-600">Chargement de la demande...</p>
      </div>
    );
  }

  if (!demande) {
    return (
      <div className="py-8 text-center">
        <FaUser className="w-12 h-12 mx-auto text-gray-300" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Demande non trouvée
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          La demande demandée n'existe pas.
        </p>
        <button
          onClick={() => navigate("/demandes-adhesion")}
          className="px-4 py-2 mt-4 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  const user = demande.user || {};
  const StatusIcon = getStatusConfig(demande.status).icon;
  const statusColor = getStatusConfig(demande.status).color;
  const statusBgColor = getStatusConfig(demande.status).bgColor;
  const statusLabel = getStatusConfig(demande.status).label;

  // URLs des documents avec fallback
  const idCardUrl =
    demande.id_card_image_url || buildDocumentUrl(demande.id_card_image);
  const licenseUrl =
    demande.drivers_license_url || buildDocumentUrl(demande.drivers_license);
  const vehiculeUrl =
    demande.vehicule_url || buildDocumentUrl(demande.vehicule);

  return (
    <div>
      {/* Modal d'aperçu d'image */}
      {imagePreview.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{imagePreview.title}</h3>
              <button
                onClick={closePreview}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[80vh]">
              <img
                src={imagePreview.url}
                alt={imagePreview.title}
                className="max-w-full mx-auto rounded"
              />
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() =>
                  handleDocumentAction(
                    imagePreview.url,
                    imagePreview.title,
                    "download",
                  )
                }
                className="flex items-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                <FaDownload className="mr-2" />
                Télécharger
              </button>
              <button
                onClick={closePreview}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/demandes-adhesion")}
              className="flex items-center mb-2 text-primary-600 hover:text-primary-900"
            >
              <FaArrowLeft className="mr-2" /> Retour à la liste
            </button>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Demande d'Adhésion #{demande.id}
              </h1>
              <span
                className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${statusBgColor}`}
              >
                <StatusIcon className={`inline h-4 w-4 mr-1 ${statusColor}`} />
                {statusLabel}
              </span>
            </div>
            <p className="text-gray-600">
              Candidat: {user.nom} {user.prenom}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchDemande}
              className="flex items-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
            >
              <FaSpinner className="mr-2" /> Rafraîchir
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-6 lg:col-span-2">
          {/* Informations personnelles */}
          <div className="p-6 bg-white shadow rounded-xl">
            <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
              <FaUser className="mr-2 text-primary-600" /> Informations
              personnelles
            </h2>

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
                    {user.email || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 mr-4 bg-purple-100 rounded-lg">
                  <FaPhone className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium text-gray-900">
                    {user.telephone || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 mr-4 bg-orange-100 rounded-lg">
                  <FaCalendarAlt className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date d'inscription</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents d'identité */}
          <div className="p-6 bg-white shadow rounded-xl">
            <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
              <FaIdCard className="mr-2 text-primary-600" /> Documents
              d'identité
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Type de pièce
                </label>
                <div className="flex items-center">
                  <FaIdCard className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="font-medium">
                    {demande.id_card_type || "CIN"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Numéro
                </label>
                <p className="font-mono font-medium">
                  {demande.id_card_number || "N/A"}
                </p>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Date d'expiration
                </label>
                <div className="flex items-center">
                  <FaCalendarAlt className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="font-medium">
                    {formatDate(demande.id_card_expiry_date)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Image de la pièce
                </label>
                {idCardUrl ? (
                  <div className="mt-2">
                    <img
                      src={idCardUrl}
                      alt="Carte d'identité"
                      className="w-auto h-32 border border-gray-200 rounded-lg cursor-pointer hover:opacity-90"
                      onClick={() =>
                        handleDocumentAction(
                          idCardUrl,
                          `carte_identite_${demande.id_card_number}`,
                          "view",
                        )
                      }
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() =>
                          handleDocumentAction(
                            idCardUrl,
                            `carte_identite_${demande.id_card_number}`,
                            "view",
                          )
                        }
                        className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <FaEye className="w-3 h-3 mr-1" /> Aperçu
                      </button>
                      <button
                        onClick={() =>
                          handleDocumentAction(
                            idCardUrl,
                            `carte_identite_${demande.id_card_number}.jpg`,
                            "download",
                          )
                        }
                        className="flex items-center px-3 py-1 text-sm text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                      >
                        <FaDownload className="w-3 h-3 mr-1" /> Télécharger
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Non fournie</p>
                )}
              </div>
            </div>
          </div>

          {/* Véhicule */}
          <div className="p-6 bg-white shadow rounded-xl">
            <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
              <FaCar className="mr-2 text-primary-600" /> Informations du
              véhicule
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Type de véhicule
                </label>
                <div className="flex items-center">
                  <FaCar className="w-5 h-5 mr-2 text-gray-400" />
                  <span className="font-medium">
                    {demande.vehicule_type || "Non spécifié"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Permis de conduire
                </label>
                {licenseUrl ? (
                  <div className="mt-2">
                    <img
                      src={licenseUrl}
                      alt="Permis de conduire"
                      className="w-auto h-32 border border-gray-200 rounded-lg cursor-pointer hover:opacity-90"
                      onClick={() =>
                        handleDocumentAction(
                          licenseUrl,
                          `permis_conduire_${user.nom}_${user.prenom}`,
                          "view",
                        )
                      }
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() =>
                          handleDocumentAction(
                            licenseUrl,
                            `permis_conduire_${user.nom}_${user.prenom}`,
                            "view",
                          )
                        }
                        className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <FaEye className="w-3 h-3 mr-1" /> Aperçu
                      </button>
                      <button
                        onClick={() =>
                          handleDocumentAction(
                            licenseUrl,
                            `permis_conduire_${user.nom}_${user.prenom}.jpg`,
                            "download",
                          )
                        }
                        className="flex items-center px-3 py-1 text-sm text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                      >
                        <FaDownload className="w-3 h-3 mr-1" /> Télécharger
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Non fourni</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Photo du véhicule
                </label>
                {vehiculeUrl ? (
                  <div className="mt-2">
                    <img
                      src={vehiculeUrl}
                      alt="Véhicule"
                      className="w-auto h-48 border border-gray-200 rounded-lg cursor-pointer hover:opacity-90"
                      onClick={() =>
                        handleDocumentAction(
                          vehiculeUrl,
                          `vehicule_${demande.vehicule_type}_${user.nom}`,
                          "view",
                        )
                      }
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() =>
                          handleDocumentAction(
                            vehiculeUrl,
                            `vehicule_${demande.vehicule_type}_${user.nom}`,
                            "view",
                          )
                        }
                        className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <FaEye className="w-3 h-3 mr-1" /> Aperçu
                      </button>
                      <button
                        onClick={() =>
                          handleDocumentAction(
                            vehiculeUrl,
                            `vehicule_${demande.vehicule_type}_${user.nom}.jpg`,
                            "download",
                          )
                        }
                        className="flex items-center px-3 py-1 text-sm text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                      >
                        <FaDownload className="w-3 h-3 mr-1" /> Télécharger
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Non fournie</p>
                )}
              </div>
            </div>
          </div>

          {/* Message du candidat */}
          {(demande.message || demande.info) && (
            <div className="p-6 bg-white shadow rounded-xl">
              <h2 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <FaFileAlt className="mr-2 text-primary-600" /> Informations
                supplémentaires
              </h2>

              {demande.message && (
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Message du candidat
                  </label>
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="text-gray-700 whitespace-pre-line">
                      {demande.message}
                    </p>
                  </div>
                </div>
              )}

              {demande.info && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Informations supplémentaires
                  </label>
                  <p className="text-gray-600">{demande.info}</p>
                </div>
              )}

              <div className="flex items-center mt-6 text-sm text-gray-500">
                <FaCalendarAlt className="w-4 h-4 mr-2" />
                Soumise le {formatDateTime(demande.created_at)}
              </div>
            </div>
          )}
        </div>

        {/* Colonne latérale - Actions admin */}
        <div className="space-y-6">
          {/* Décision */}
          <div className="p-6 bg-white shadow rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Prendre une décision
            </h3>

            {demande.status === "pending" ? (
              <div className="space-y-3">
                <button
                  onClick={() => handleDecision("approved")}
                  disabled={updating}
                  className="flex items-center justify-center w-full px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FaCheck className="mr-2" />
                  )}
                  Approuver la demande
                </button>

                <button
                  onClick={() => handleDecision("rejected")}
                  disabled={updating}
                  className="flex items-center justify-center w-full px-4 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FaTimes className="mr-2" />
                  )}
                  Rejeter la demande
                </button>

                <div className="mt-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows="3"
                    placeholder="Ajoutez un commentaire pour le candidat..."
                    value={decisionComment}
                    onChange={(e) => setDecisionComment(e.target.value)}
                  ></textarea>
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-lg ${statusBgColor}`}>
                <div className="flex items-center">
                  <StatusIcon className={`h-8 w-8 ${statusColor} mr-3`} />
                  <div>
                    <p className="text-lg font-bold">
                      Demande {statusLabel.toLowerCase()}
                    </p>
                    <p className="text-sm opacity-75">
                      {demande.status === "approved"
                        ? "Le candidat a été accepté comme livreur."
                        : "La demande a été rejetée."}
                    </p>
                    <p className="mt-2 text-xs">
                      Décision prise le: {formatDate(demande.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Critères d'évaluation */}
          <div className="p-6 bg-white shadow rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Évaluation des documents
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Carte d'identité</span>
                {idCardUrl ? (
                  <FaCheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <FaTimesCircle className="w-5 h-5 text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  Permis de conduire
                </span>
                {licenseUrl ? (
                  <FaCheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <FaTimesCircle className="w-5 h-5 text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Photo du véhicule</span>
                {vehiculeUrl ? (
                  <FaCheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <FaTimesCircle className="w-5 h-5 text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  Informations complètes
                </span>
                {demande.vehicule_type &&
                demande.id_card_type &&
                demande.id_card_number ? (
                  <FaCheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <FaTimesCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Documents fournis
                </span>
                <span
                  className={`text-lg font-bold ${
                    [idCardUrl, licenseUrl, vehiculeUrl].filter(Boolean)
                      .length === 3
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {[idCardUrl, licenseUrl, vehiculeUrl].filter(Boolean).length}
                  /3
                </span>
              </div>
            </div>
          </div>

          {/* Statut */}
          <div className="p-6 bg-white shadow rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Suivi de la demande
            </h3>

            <div className="space-y-4">
              <div className="flex items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${statusBgColor}`}
                >
                  <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                </div>
                <div>
                  <p className="font-medium">{statusLabel}</p>
                  <p className="text-sm text-gray-600">
                    {demande.status === "pending" && "En attente de décision"}
                    {demande.status === "approved" && "Demande approuvée"}
                    {demande.status === "rejected" && "Demande rejetée"}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>
                  <strong>Date de soumission:</strong>{" "}
                  {formatDateTime(demande.created_at)}
                </p>
                <p className="mt-1">
                  <strong>Dernière mise à jour:</strong>{" "}
                  {formatDateTime(demande.updated_at)}
                </p>
                <p className="mt-1 text-yellow-600">
                  <strong>Délai de traitement:</strong> 48 heures maximum
                </p>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="p-6 bg-white shadow rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Actions rapides
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => window.open(`mailto:${user.email}`, "_blank")}
                className="flex items-center w-full px-3 py-2 text-left text-blue-700 rounded-lg bg-blue-50 hover:bg-blue-100"
              >
                <FaEnvelope className="mr-2" /> Envoyer un email
              </button>
              <button
                onClick={() => window.open(`tel:${user.telephone}`, "_blank")}
                className="flex items-center w-full px-3 py-2 text-left text-green-700 rounded-lg bg-green-50 hover:bg-green-100"
              >
                <FaPhone className="mr-2" /> Appeler le candidat
              </button>
              <button
                onClick={fetchDemande}
                className="flex items-center w-full px-3 py-2 text-left text-purple-700 rounded-lg bg-purple-50 hover:bg-purple-100"
              >
                <FaSpinner className="mr-2" /> Rafraîchir les données
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandeDetail;
