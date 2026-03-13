// src/pages/Comptabilite/components/ExportModal.jsx
import React, { useState } from "react";
import { FaFileExcel, FaFilePdf, FaFileCsv, FaTimes } from "react-icons/fa";
import comptabiliteService from "../../../services/comptabiliteService";

const ExportModal = ({ isOpen, onClose, onExport }) => {
  const [exportParams, setExportParams] = useState({
    type_periode: "mois",
    date: new Date().toISOString().split("T")[0],
    date_debut: "",
    date_fin: "",
    format: "excel",
    livreur_id: "",
  });

  const [loading, setLoading] = useState(false);

  const handlePeriodChange = (type) => {
    setExportParams({
      ...exportParams,
      type_periode: type,
      date:
        type === "personnalise" ? "" : new Date().toISOString().split("T")[0],
    });
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      await onExport(exportParams);
      onClose();
    } catch (error) {
      console.error("Erreur export:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Exporter les gains
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Période */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handlePeriodChange("jour")}
                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                  exportParams.type_periode === "jour"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Jour
              </button>
              <button
                onClick={() => handlePeriodChange("semaine")}
                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                  exportParams.type_periode === "semaine"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Semaine
              </button>
              <button
                onClick={() => handlePeriodChange("mois")}
                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                  exportParams.type_periode === "mois"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Mois
              </button>
              <button
                onClick={() => handlePeriodChange("personnalise")}
                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                  exportParams.type_periode === "personnalise"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Perso
              </button>
            </div>
          </div>

          {/* Date */}
          {exportParams.type_periode !== "personnalise" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={exportParams.date}
                onChange={(e) =>
                  setExportParams({ ...exportParams, date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date début
                </label>
                <input
                  type="date"
                  value={exportParams.date_debut}
                  onChange={(e) =>
                    setExportParams({
                      ...exportParams,
                      date_debut: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date fin
                </label>
                <input
                  type="date"
                  value={exportParams.date_fin}
                  onChange={(e) =>
                    setExportParams({
                      ...exportParams,
                      date_fin: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          )}

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format d'export
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() =>
                  setExportParams({ ...exportParams, format: "excel" })
                }
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border ${
                  exportParams.format === "excel"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <FaFileExcel
                  className={`w-6 h-6 ${exportParams.format === "excel" ? "text-green-600" : "text-gray-600"}`}
                />
                <span
                  className={`text-xs ${exportParams.format === "excel" ? "text-green-600 font-medium" : "text-gray-600"}`}
                >
                  Excel
                </span>
              </button>
              <button
                onClick={() =>
                  setExportParams({ ...exportParams, format: "pdf" })
                }
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border ${
                  exportParams.format === "pdf"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <FaFilePdf
                  className={`w-6 h-6 ${exportParams.format === "pdf" ? "text-red-600" : "text-gray-600"}`}
                />
                <span
                  className={`text-xs ${exportParams.format === "pdf" ? "text-red-600 font-medium" : "text-gray-600"}`}
                >
                  PDF
                </span>
              </button>
              <button
                onClick={() =>
                  setExportParams({ ...exportParams, format: "csv" })
                }
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border ${
                  exportParams.format === "csv"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <FaFileCsv
                  className={`w-6 h-6 ${exportParams.format === "csv" ? "text-blue-600" : "text-gray-600"}`}
                />
                <span
                  className={`text-xs ${exportParams.format === "csv" ? "text-blue-600 font-medium" : "text-gray-600"}`}
                >
                  CSV
                </span>
              </button>
            </div>
          </div>

          {/* Livreur (optionnel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par livreur (optionnel)
            </label>
            <select
              value={exportParams.livreur_id}
              onChange={(e) =>
                setExportParams({ ...exportParams, livreur_id: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Tous les livreurs</option>
              {/* Options livreurs à charger dynamiquement */}
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? "Export..." : "Exporter"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
