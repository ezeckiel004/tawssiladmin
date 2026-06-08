// src/components/Modals/CancelLivraisonModal.jsx
import React, { useState } from "react";
import { XCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const RETURN_STATUS_OPTIONS = [
  { value: "chez_livreurs", label: "Chez Livreurs", description: "Le colis est actuellement chez un livreur", color: "bg-orange-100 text-orange-800" },
  { value: "retour_en_traitement", label: "Retour en traitement", description: "Le retour est en cours de traitement", color: "bg-yellow-100 text-yellow-800" },
  { value: "retour_prets", label: "Retour prêts", description: "Les colis sont prêts pour le retour", color: "bg-green-100 text-green-800" },
];

const CancelLivraisonModal = ({ isOpen, onClose, onConfirm, livraison, loading }) => {
  const [selectedReturnStatus, setSelectedReturnStatus] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedReturnStatus) {
      alert("Veuillez sélectionner un statut de retour");
      return;
    }
    onConfirm(selectedReturnStatus);
  };

  // Obtenir les informations de la livraison
  const getLivraisonInfo = () => {
    if (!livraison) return {};
    
    return {
      id: livraison.id?.substring(0, 8) || "N/A",
      codePin: livraison.code_pin || "N/A",
      client: livraison.client_name || "Non spécifié",
      status: livraison.status || "Inconnu"
    };
  };

  const info = getLivraisonInfo();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* En-tête */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Annulation de livraison
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Vous êtes sur le point d'annuler cette livraison.
                </p>
              </div>
            </div>
          </div>

          {/* Corps */}
          <div className="px-6 py-4">
            {/* Informations livraison */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Livraison concernée :</p>
              <div className="mt-2 space-y-1 text-sm">
                <p><span className="text-gray-500">ID :</span> <span className="font-mono font-medium">{info.id}...</span></p>
                <p><span className="text-gray-500">Code PIN :</span> <span className="font-mono font-medium">{info.codePin}</span></p>
                <p><span className="text-gray-500">Client :</span> <span className="font-medium">{info.client}</span></p>
                <p><span className="text-gray-500">Statut actuel :</span> 
                  <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    {info.status}
                  </span>
                </p>
              </div>
            </div>

            {/* Sélection du statut de retour */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut de retour <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Veuillez préciser où se trouve le colis pour le retour :
              </p>
              
              <div className="space-y-3">
                {RETURN_STATUS_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedReturnStatus === option.value
                        ? "border-red-500 bg-red-50 ring-2 ring-red-200"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="returnStatus"
                      value={option.value}
                      checked={selectedReturnStatus === option.value}
                      onChange={(e) => setSelectedReturnStatus(e.target.value)}
                      className="mt-1 mr-3 text-red-600 focus:ring-red-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {option.label}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${option.color}`}>
                          {option.value === "chez_livreurs" && "📦 Chez livreur"}
                          {option.value === "retour_en_traitement" && "⚙️ En traitement"}
                          {option.value === "retour_prets" && "✅ Prêts"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {option.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Avertissement */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Attention :</strong> Cette action est irréversible. 
                La livraison sera marquée comme annulée et ne pourra plus être reprise.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedReturnStatus || loading}
              className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Annulation en cours...
                </>
              ) : (
                <>
                  <XCircleIcon className="w-5 h-5" />
                  Confirmer l'annulation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelLivraisonModal;