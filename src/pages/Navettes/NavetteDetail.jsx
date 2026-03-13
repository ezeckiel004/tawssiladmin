// src/pages/Navettes/NavetteDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import navetteService from "../../services/navetteService";
import comptabiliteService from "../../services/comptabiliteService";
import {
  FaArrowLeft,
  FaTruck,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaBoxes,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaEdit,
  FaTrash,
  FaPlay,
  FaStop,
  FaBan,
  FaPlus,
  FaMinus,
  FaBarcode,
  FaWeightHanging,
  FaMoneyBillWave,
  FaRoad,
  FaGasPump,
  FaTachometerAlt,
  FaPercentage,
  FaPrint,
  FaDownload,
} from "react-icons/fa";
import NavetteColisList from "./components/NavetteColisList";

const NavetteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [navette, setNavette] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddColisModal, setShowAddColisModal] = useState(false);
  const [colisDisponibles, setColisDisponibles] = useState([]);
  const [selectedColis, setSelectedColis] = useState([]);

  useEffect(() => {
    fetchNavette();
  }, [id]);

  const fetchNavette = async () => {
    try {
      setLoading(true);
      const response = await navetteService.getNavetteById(id);
      console.log("Navette chargée:", response.data);
      setNavette(response.data);
    } catch (error) {
      console.error("Erreur chargement navette:", error);
      toast.error("Erreur lors du chargement de la navette");
      navigate("/navettes");
    } finally {
      setLoading(false);
    }
  };

  const fetchColisDisponibles = async () => {
    try {
      // Simuler l'appel API pour les colis disponibles dans la même wilaya
      const response = await navetteService.getSuggestions({
        wilaya_depart: navette?.wilaya_depart_id || "16",
      });
      // Extraire les colis des suggestions
      const colis = response.data?.flatMap((s) => s.colis_exemples || []) || [];
      console.log("Colis disponibles:", colis);
      setColisDisponibles(colis);
    } catch (error) {
      console.error("Erreur chargement colis:", error);
      toast.error("Erreur lors du chargement des colis disponibles");
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      let response;
      switch (newStatus) {
        case "en_cours":
          response = await navetteService.demarrerNavette(id);
          break;
        case "terminee":
          response = await navetteService.terminerNavette(id);
          break;
        case "annulee":
          response = await navetteService.annulerNavette(id);
          break;
        default:
          return;
      }
      toast.success(response.message || "Statut mis à jour");
      fetchNavette();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors du changement de statut",
      );
    }
  };

  const handleAddColis = async () => {
    if (selectedColis.length === 0) {
      toast.error("Veuillez sélectionner au moins un colis");
      return;
    }

    console.log("Colis à ajouter (IDs):", selectedColis);

    try {
      const response = await navetteService.ajouterColis(id, selectedColis);
      toast.success(response.message || "Colis ajoutés avec succès");
      setShowAddColisModal(false);
      setSelectedColis([]);
      fetchNavette();
    } catch (error) {
      console.error("Erreur ajout colis:", error);
      console.error("Détails erreur:", error.response);

      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        console.error("Erreurs de validation:", errors);

        let errorMsg = "Erreur de validation: ";
        if (errors["colis_ids"]) {
          errorMsg += errors["colis_ids"].join(", ");
        } else if (errors["colis_ids.0"]) {
          errorMsg += "Le premier colis sélectionné n'existe pas";
        } else {
          errorMsg = Object.values(errors).flat().join(", ");
        }
        toast.error(errorMsg);
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Requête invalide");
      } else {
        toast.error(
          error.response?.data?.message || "Erreur lors de l'ajout des colis",
        );
      }
    }
  };

  const handleRemoveColis = async (colisId) => {
    if (!window.confirm("Retirer ce colis de la navette ?")) {
      return;
    }

    try {
      const response = await navetteService.retirerColis(id, [colisId]);
      toast.success(response.message || "Colis retiré");
      fetchNavette();
    } catch (error) {
      toast.error("Erreur lors du retrait du colis");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette navette ?")) {
      return;
    }

    try {
      await navetteService.deleteNavette(id);
      toast.success("Navette supprimée avec succès");
      navigate("/navettes");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleExportPDF = async () => {
    try {
      await navetteService.exportPDF({ navette_id: id });
      toast.success("PDF généré avec succès");
    } catch (error) {
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      planifiee: {
        color: "bg-blue-100 text-blue-800",
        icon: FaClock,
        label: "Planifiée",
      },
      en_cours: {
        color: "bg-yellow-100 text-yellow-800",
        icon: FaSpinner,
        label: "En cours",
      },
      terminee: {
        color: "bg-green-100 text-green-800",
        icon: FaCheckCircle,
        label: "Terminée",
      },
      annulee: {
        color: "bg-red-100 text-red-800",
        icon: FaTimesCircle,
        label: "Annulée",
      },
    };
    return badges[status] || badges.planifiee;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!navette) return null;

  const status = getStatusBadge(navette.status);
  const StatusIcon = status.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/navettes")}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-4"
        >
          <FaArrowLeft /> Retour aux navettes
        </button>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Navette {navette.reference}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${status.color}`}
              >
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>
            </div>
            <p className="text-gray-600">
              Créée le{" "}
              {new Date(navette.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FaDownload /> PDF
            </button>
            {navette.status === "planifiee" && (
              <>
                <button
                  onClick={() => navigate(`/navettes/edit/${id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <FaEdit /> Modifier
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <FaTrash /> Supprimer
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      {navette.status === "planifiee" && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Actions rapides
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => handleStatusChange("en_cours")}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
            >
              <FaPlay /> Démarrer la navette
            </button>
            <button
              onClick={() => handleStatusChange("annulee")}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <FaBan /> Annuler la navette
            </button>
          </div>
        </div>
      )}

      {navette.status === "en_cours" && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Actions rapides
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => handleStatusChange("terminee")}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FaStop /> Terminer la navette
            </button>
            <button
              onClick={() => handleStatusChange("annulee")}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <FaBan /> Annuler la navette
            </button>
          </div>
        </div>
      )}

      {/* Informations principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Carte infos trajet */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="text-primary-600" />
            Trajet
          </h2>

          <div className="relative mb-8">
            {/* Timeline du trajet */}
            <div className="flex items-center justify-between">
              {/* Départ */}
              <div className="text-center flex-1">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaMapMarkerAlt className="text-blue-600" />
                </div>
                <div className="font-semibold">{navette.wilaya_depart_id}</div>
                <div className="text-sm text-gray-600">
                  {new Date(navette.date_depart).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {/* Ligne de progression */}
              <div className="flex-1 relative">
                <div className="h-1 bg-gray-200 rounded-full">
                  <div
                    className="h-1 bg-primary-600 rounded-full"
                    style={{
                      width: navette.status === "terminee" ? "100%" : "50%",
                    }}
                  ></div>
                </div>
              </div>

              {/* Transit (optionnel) */}
              {navette.wilaya_transit_id && (
                <>
                  <div className="text-center flex-1">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <FaMapMarkerAlt className="text-purple-600" />
                    </div>
                    <div className="font-semibold">
                      {navette.wilaya_transit_id}
                    </div>
                    <div className="text-sm text-gray-600">Transit</div>
                  </div>
                  <div className="flex-1 relative">
                    <div className="h-1 bg-gray-200 rounded-full"></div>
                  </div>
                </>
              )}

              {/* Arrivée */}
              <div className="text-center flex-1">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaMapMarkerAlt className="text-green-600" />
                </div>
                <div className="font-semibold">{navette.wilaya_arrivee_id}</div>
                <div className="text-sm text-gray-600">
                  {new Date(navette.date_arrivee_prevue).toLocaleTimeString(
                    "fr-FR",
                    { hour: "2-digit", minute: "2-digit" },
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Détails du trajet */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <FaRoad className="w-4 h-4" />
                <span className="text-xs">Distance</span>
              </div>
              <p className="font-semibold">{navette.distance_km || 0} km</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <FaClock className="w-4 h-4" />
                <span className="text-xs">Durée estimée</span>
              </div>
              <p className="font-semibold">
                {navette.distance_km ? Math.round(navette.distance_km / 70) : 0}{" "}
                h
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <FaGasPump className="w-4 h-4" />
                <span className="text-xs">Carburant</span>
              </div>
              <p className="font-semibold">
                {comptabiliteService.formatMontant(
                  navette.carburant_estime || 0,
                )}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <FaMoneyBillWave className="w-4 h-4" />
                <span className="text-xs">Péages</span>
              </div>
              <p className="font-semibold">
                {comptabiliteService.formatMontant(navette.peages_estimes || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Carte statistiques */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaTachometerAlt className="text-primary-600" />
            Statistiques
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Taux de remplissage</span>
                <span className="font-semibold">
                  {navette.taux_remplissage || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${navette.taux_remplissage || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Colis chargés</span>
                <span className="font-semibold text-lg">
                  {navette.nb_colis || 0}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Capacité max</span>
                <span className="font-semibold">{navette.capacite_max}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Poids total</span>
                <span className="font-semibold">
                  {navette.poids_total || 0} kg
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Prix base</span>
                <span className="font-semibold text-green-600">
                  {comptabiliteService.formatMontant(navette.prix_base)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Prix par colis</span>
                <span className="font-semibold text-green-600">
                  {comptabiliteService.formatMontant(navette.prix_par_colis)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">
                  Total estimé
                </span>
                <span className="font-semibold text-lg text-green-700">
                  {comptabiliteService.formatMontant(
                    navette.prix_base +
                      navette.nb_colis * navette.prix_par_colis,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations chauffeur */}
      {navette.chauffeur && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaUser className="text-primary-600" />
            Chauffeur assigné
          </h2>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <FaUser className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-lg">
                {navette.chauffeur.user?.nom} {navette.chauffeur.user?.prenom}
              </p>
              <p className="text-gray-600">{navette.chauffeur.user?.email}</p>
              <p className="text-gray-600">
                {navette.chauffeur.user?.telephone}
              </p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {navette.chauffeur.type === "chauffeur"
                  ? "Chauffeur"
                  : "Livreur"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Liste des colis */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaBoxes className="text-primary-600" />
            Colis dans la navette ({navette.nb_colis || 0})
          </h2>

          {navette.status === "planifiee" && (
            <button
              onClick={() => {
                fetchColisDisponibles();
                setShowAddColisModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <FaPlus /> Ajouter des colis
            </button>
          )}
        </div>

        <NavetteColisList
          colis={navette.colis || []}
          onRemove={handleRemoveColis}
          canRemove={navette.status === "planifiee"}
        />
      </div>

      {/* Modal d'ajout de colis */}
      {showAddColisModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Ajouter des colis
              </h2>
              <p className="text-gray-600">
                Sélectionnez les colis à ajouter à la navette
              </p>
            </div>
            <div className="p-6">
              {colisDisponibles.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Aucun colis disponible dans cette wilaya
                </p>
              ) : (
                <div className="space-y-4">
                  {colisDisponibles.map((colis) => (
                    <div
                      key={colis.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedColis.includes(colis.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedColis([...selectedColis, colis.id]);
                            } else {
                              setSelectedColis(
                                selectedColis.filter((id) => id !== colis.id),
                              );
                            }
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-semibold">{colis.label}</p>
                              <p className="text-sm text-gray-600">
                                Destination: {colis.destination}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">
                                {comptabiliteService.formatMontant(colis.prix)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {colis.poids} kg
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowAddColisModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleAddColis}
                disabled={selectedColis.length === 0}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedColis.length > 0
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Ajouter {selectedColis.length} colis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavetteDetail;
