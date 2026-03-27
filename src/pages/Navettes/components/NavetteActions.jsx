// src/pages/Navettes/components/NavetteActions.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import navetteService from "../../../services/navetteService";
import {
  FaPlay,
  FaStop,
  FaBan,
  FaEdit,
  FaTrash,
  FaPrint,
  FaDownload,
  FaCopy,
  FaPlus,
  FaMinus,
  FaBoxes,
  FaBuilding,
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaSpinner,
  FaTimesCircle,
} from "react-icons/fa";

const NavetteActions = ({ navette, onActionComplete }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);

  const handleAction = async (action, options = {}) => {
    setLoading(true);
    try {
      let response;
      switch (action) {
        case "start":
          response = await navetteService.demarrerNavette(navette.id);
          toast.success("Navette démarrée avec succès");
          break;
        case "complete":
          response = await navetteService.terminerNavette(navette.id);
          toast.success("Navette terminée avec succès");
          break;
        case "cancel":
          response = await navetteService.annulerNavette(navette.id);
          toast.success("Navette annulée");
          break;
        case "delete":
          if (navette.status !== "planifiee") {
            toast.error(
              "Seules les navettes planifiées peuvent être supprimées",
            );
            return;
          }
          await navetteService.deleteNavette(navette.id);
          toast.success("Navette supprimée");
          navigate("/navettes");
          return;
        case "duplicate":
          toast.success("Navette dupliquée");
          break;
        case "export-pdf":
          await navetteService.exportPDF({ navette_id: navette.id });
          toast.success("PDF généré");
          break;
        case "notify":
          toast.success("Notification envoyée au hub");
          break;
        default:
          break;
      }

      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      console.error(`Erreur action ${action}:`, error);
      toast.error(
        error.response?.data?.message || `Erreur lors de l'action ${action}`,
      );
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
      setActionToConfirm(null);
    }
  };

  const confirmAction = (action) => {
    setActionToConfirm(action);
    setShowConfirmModal(true);
  };

  const getConfirmMessage = () => {
    switch (actionToConfirm) {
      case "start":
        return {
          title: "Démarrer la navette",
          message:
            "Êtes-vous sûr de vouloir démarrer cette navette ? Le hub sera notifié.",
          icon: FaPlay,
          color: "yellow",
        };
      case "complete":
        return {
          title: "Terminer la navette",
          message:
            "Confirmez-vous que la navette est bien arrivée à destination ? Toutes les livraisons seront marquées comme livrées.",
          icon: FaStop,
          color: "green",
        };
      case "cancel":
        return {
          title: "Annuler la navette",
          message:
            "Êtes-vous sûr de vouloir annuler cette navette ? Cette action est irréversible.",
          icon: FaBan,
          color: "red",
        };
      case "delete":
        return {
          title: "Supprimer la navette",
          message:
            "Êtes-vous sûr de vouloir supprimer définitivement cette navette ? Cette action est irréversible.",
          icon: FaTrash,
          color: "red",
        };
      default:
        return null;
    }
  };

  const getAvailableActions = () => {
    const actions = [];

    switch (navette?.status) {
      case "planifiee":
        actions.push(
          {
            key: "start",
            label: "Démarrer",
            icon: FaPlay,
            color: "yellow",
            primary: true,
          },
          { key: "edit", label: "Modifier", icon: FaEdit, color: "blue" },
          {
            key: "duplicate",
            label: "Dupliquer",
            icon: FaCopy,
            color: "purple",
          },
          { key: "delete", label: "Supprimer", icon: FaTrash, color: "red" },
        );
        break;
      case "en_cours":
        actions.push(
          {
            key: "complete",
            label: "Terminer",
            icon: FaStop,
            color: "green",
            primary: true,
          },
          { key: "cancel", label: "Annuler", icon: FaBan, color: "red" },
        );
        break;
      case "terminee":
        actions.push({
          key: "duplicate",
          label: "Dupliquer",
          icon: FaCopy,
          color: "purple",
        });
        break;
      case "annulee":
        actions.push(
          {
            key: "duplicate",
            label: "Dupliquer",
            icon: FaCopy,
            color: "purple",
          },
          { key: "delete", label: "Supprimer", icon: FaTrash, color: "red" },
        );
        break;
    }

    actions.push(
      {
        key: "export-pdf",
        label: "Exporter PDF",
        icon: FaDownload,
        color: "green",
      },
      { key: "print", label: "Imprimer", icon: FaPrint, color: "gray" },
    );

    if (navette?.hub_id) {
      actions.push({
        key: "notify",
        label: "Notifier",
        icon: FaBell,
        color: "blue",
      });
    }

    return actions;
  };

  const getStatusIcon = () => {
    switch (navette?.status) {
      case "planifiee":
        return FaClock;
      case "en_cours":
        return FaSpinner;
      case "terminee":
        return FaCheckCircle;
      case "annulee":
        return FaTimesCircle;
      default:
        return FaClock;
    }
  };

  const StatusIcon = getStatusIcon();

  const getStatusColor = () => {
    switch (navette?.status) {
      case "planifiee":
        return "text-blue-600 bg-blue-100";
      case "en_cours":
        return "text-yellow-600 bg-yellow-100";
      case "terminee":
        return "text-green-600 bg-green-100";
      case "annulee":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusLabel = () => {
    switch (navette?.status) {
      case "planifiee":
        return "Planifiée";
      case "en_cours":
        return "En cours";
      case "terminee":
        return "Terminée";
      case "annulee":
        return "Annulée";
      default:
        return "Inconnu";
    }
  };

  const availableActions = getAvailableActions();

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${getStatusColor()}`}>
              <StatusIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Statut actuel</p>
              <p className="text-lg font-semibold">{getStatusLabel()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Référence</p>
            <p className="font-mono text-sm font-medium">
              {navette?.reference}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <FaPlay className="w-4 h-4 text-primary-600" />
          Actions disponibles
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {availableActions.map((action) => {
            const Icon = action.icon;
            const isPrimary = action.primary;

            const colorClasses = {
              yellow: "bg-yellow-600 hover:bg-yellow-700 text-white",
              green: "bg-green-600 hover:bg-green-700 text-white",
              red: "bg-red-600 hover:bg-red-700 text-white",
              blue: "bg-blue-600 hover:bg-blue-700 text-white",
              purple: "bg-purple-600 hover:bg-purple-700 text-white",
              gray: "bg-gray-600 hover:bg-gray-700 text-white",
            };

            const outlineClasses = {
              yellow:
                "border border-yellow-300 text-yellow-700 hover:bg-yellow-50",
              green: "border border-green-300 text-green-700 hover:bg-green-50",
              red: "border border-red-300 text-red-700 hover:bg-red-50",
              blue: "border border-blue-300 text-blue-700 hover:bg-blue-50",
              purple:
                "border border-purple-300 text-purple-700 hover:bg-purple-50",
              gray: "border border-gray-300 text-gray-700 hover:bg-gray-50",
            };

            return (
              <button
                key={action.key}
                onClick={() => {
                  if (
                    ["start", "complete", "cancel", "delete"].includes(
                      action.key,
                    )
                  ) {
                    confirmAction(action.key);
                  } else {
                    handleAction(action.key);
                  }
                }}
                disabled={loading}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
                  isPrimary
                    ? colorClasses[action.color]
                    : outlineClasses[action.color]
                }`}
              >
                <Icon className="w-4 h-4" />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <FaBoxes className="w-4 h-4 text-primary-600" />
          Gestion des livraisons
        </h3>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate(`/navettes/${navette?.id}/ajouter-livraisons`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition text-sm"
          >
            <FaPlus /> Ajouter des livraisons
          </button>
          <button
            onClick={() => navigate(`/navettes/${navette?.id}/retirer-livraisons`)}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
          >
            <FaMinus /> Retirer des livraisons
          </button>
          <button
            onClick={() => navigate(`/navettes/${navette?.id}/livraisons`)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
          >
            <FaBoxes /> Voir toutes les livraisons
          </button>
        </div>
      </div>

      {navette?.hub_id && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <FaBuilding className="w-4 h-4 text-primary-600" />
            Actions hub
          </h3>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleAction("notify")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
            >
              <FaBell /> Notifier le hub
            </button>
            <button
              onClick={() => navigate(`/hubs/${navette.hub_id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
            >
              <FaBuilding /> Voir détails hub
            </button>
          </div>
        </div>
      )}

      {showConfirmModal && actionToConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {(() => {
              const confirm = getConfirmMessage();
              const Icon = confirm.icon;

              const colorClasses = {
                yellow: "bg-yellow-100 text-yellow-600",
                green: "bg-green-100 text-green-600",
                red: "bg-red-100 text-red-600",
              };

              return (
                <>
                  <div className="p-6 text-center">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${colorClasses[confirm.color]}`}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {confirm.title}
                    </h2>
                    <p className="text-gray-600">{confirm.message}</p>

                    {actionToConfirm === "complete" && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg text-left">
                        <p className="text-sm text-green-700">
                          <strong>Conséquences :</strong>
                        </p>
                        <ul className="mt-2 text-sm text-green-600 list-disc list-inside">
                          <li>La navette sera marquée comme terminée</li>
                          <li>Toutes les livraisons seront marquées comme livrées</li>
                          <li>Les gains seront calculés automatiquement</li>
                          <li>Le hub recevra une notification</li>
                        </ul>
                      </div>
                    )}

                    {actionToConfirm === "cancel" && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg text-left">
                        <p className="text-sm text-red-700">
                          <strong>Attention :</strong>
                        </p>
                        <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                          <li>Toutes les livraisons seront remises en attente</li>
                          <li>Le hub sera notifié</li>
                          <li>Cette action est irréversible</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowConfirmModal(false);
                        setActionToConfirm(null);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleAction(actionToConfirm)}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg transition text-white flex items-center gap-2 ${
                        confirm.color === "yellow"
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : confirm.color === "green"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="w-4 h-4 animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        "Confirmer"
                      )}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavetteActions;