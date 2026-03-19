// src/pages/Comptabilite/components/ExportModal.jsx
import React, { useState, useEffect } from "react";
import { FaFileExcel, FaFilePdf, FaFileCsv, FaTimes, FaUserTie, FaCity } from "react-icons/fa";
import comptabiliteService from "../../../services/comptabiliteService";
import gestionnaireService from "../../../services/gestionnaireService";

const ExportModal = ({ isOpen, onClose, onExport }) => {
  const [exportParams, setExportParams] = useState({
    type_periode: "mois",
    date: new Date().toISOString().split("T")[0],
    date_debut: "",
    date_fin: "",
    format: "excel",
    gestionnaire_id: "",
    wilaya_id: "",
  });

  const [gestionnaireOptions, setGestionnaireOptions] = useState([]);
  const [wilayas, setWilayas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Liste statique des wilayas (fallback)
  const wilayasStatiques = [
    { code: "01", nom: "Adrar" }, { code: "02", nom: "Chlef" }, { code: "03", nom: "Laghouat" },
    { code: "04", nom: "Oum El Bouaghi" }, { code: "05", nom: "Batna" }, { code: "06", nom: "Béjaïa" },
    { code: "07", nom: "Biskra" }, { code: "08", nom: "Béchar" }, { code: "09", nom: "Blida" },
    { code: "10", nom: "Bouira" }, { code: "11", nom: "Tamanrasset" }, { code: "12", nom: "Tébessa" },
    { code: "13", nom: "Tlemcen" }, { code: "14", nom: "Tiaret" }, { code: "15", nom: "Tizi Ouzou" },
    { code: "16", nom: "Alger" }, { code: "17", nom: "Djelfa" }, { code: "18", nom: "Jijel" },
    { code: "19", nom: "Sétif" }, { code: "20", nom: "Saïda" }, { code: "21", nom: "Skikda" },
    { code: "22", nom: "Sidi Bel Abbès" }, { code: "23", nom: "Annaba" }, { code: "24", nom: "Guelma" },
    { code: "25", nom: "Constantine" }, { code: "26", nom: "Médéa" }, { code: "27", nom: "Mostaganem" },
    { code: "28", nom: "M'Sila" }, { code: "29", nom: "Mascara" }, { code: "30", nom: "Ouargla" },
    { code: "31", nom: "Oran" }, { code: "32", nom: "El Bayadh" }, { code: "33", nom: "Illizi" },
    { code: "34", nom: "Bordj Bou Arréridj" }, { code: "35", nom: "Boumerdès" }, { code: "36", nom: "El Tarf" },
    { code: "37", nom: "Tindouf" }, { code: "38", nom: "Tissemsilt" }, { code: "39", nom: "El Oued" },
    { code: "40", nom: "Khenchela" }, { code: "41", nom: "Souk Ahras" }, { code: "42", nom: "Tipaza" },
    { code: "43", nom: "Mila" }, { code: "44", nom: "Aïn Defla" }, { code: "45", nom: "Naâma" },
    { code: "46", nom: "Aïn Témouchent" }, { code: "47", nom: "Ghardaïa" }, { code: "48", nom: "Relizane" },
    { code: "49", nom: "Timimoun" }, { code: "50", nom: "Bordj Badji Mokhtar" }, { code: "51", nom: "Ouled Djellal" },
    { code: "52", nom: "Béni Abbès" }, { code: "53", nom: "In Salah" }, { code: "54", nom: "In Guezzam" },
    { code: "55", nom: "Touggourt" }, { code: "56", nom: "Djanet" }, { code: "57", nom: "El M'Ghair" },
    { code: "58", nom: "El Meniaa" }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchGestionnaireOptions();
      fetchWilayas();
    }
  }, [isOpen]);

  const fetchGestionnaireOptions = async () => {
    try {
      const options = await gestionnaireService.getGestionnaireOptions();
      setGestionnaireOptions(options || []);
    } catch (error) {
      console.error("Erreur chargement gestionnaires:", error);
    }
  };

  const fetchWilayas = async () => {
    try {
      const response = await comptabiliteService.getWilayas();
      
      if (Array.isArray(response) && response.length > 0) {
        const wilayasData = response
          .map(w => ({
            code: String(w.code || '').padStart(2, '0'),
            nom: w.name || w.nom || `Wilaya ${w.code}`
          }))
          .filter(w => w.code)
          .sort((a, b) => a.code.localeCompare(b.code));
        
        setWilayas(wilayasData);
      } else {
        setWilayas(wilayasStatiques);
      }
    } catch (error) {
      console.error("Erreur chargement wilayas:", error);
      setWilayas(wilayasStatiques);
    }
  };

  const handlePeriodChange = (type) => {
    setExportParams({
      ...exportParams,
      type_periode: type,
      date: type === "personnalise" ? "" : new Date().toISOString().split("T")[0],
    });
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      // Appeler la fonction d'export avec les paramètres adaptés aux gestionnaires
      await onExport({
        ...exportParams,
        gestionnaire_id: exportParams.gestionnaire_id || undefined,
        wilaya_id: exportParams.wilaya_id || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Erreur export:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWilayaName = (code) => {
    if (!code) return "";
    const wilaya = wilayas.find(w => w && w.code === code);
    return wilaya ? wilaya.nom : `Wilaya ${code}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            Exporter les gains des gestionnaires
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

          {/* Filtre par wilaya */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FaCity className="text-gray-500" />
              Filtrer par wilaya (optionnel)
            </label>
            <select
              value={exportParams.wilaya_id}
              onChange={(e) =>
                setExportParams({ ...exportParams, wilaya_id: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Toutes les wilayas</option>
              {wilayas.map((wilaya) => (
                <option key={wilaya.code} value={wilaya.code}>
                  {wilaya.code} - {wilaya.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par gestionnaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FaUserTie className="text-gray-500" />
              Filtrer par gestionnaire (optionnel)
            </label>
            <select
              value={exportParams.gestionnaire_id}
              onChange={(e) =>
                setExportParams({ ...exportParams, gestionnaire_id: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Tous les gestionnaires</option>
              {gestionnaireOptions.map((gestionnaire) => (
                <option key={gestionnaire.value} value={gestionnaire.value}>
                  {gestionnaire.label} - {getWilayaName(gestionnaire.wilaya_id)}
                </option>
              ))}
            </select>
          </div>

          {/* Résumé des filtres */}
          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
            <p className="font-medium mb-1">Récapitulatif :</p>
            <ul className="list-disc list-inside text-xs space-y-1">
              <li>Période : {
                exportParams.type_periode === "personnalise"
                  ? `du ${exportParams.date_debut} au ${exportParams.date_fin}`
                  : `${exportParams.type_periode} du ${exportParams.date}`
              }</li>
              <li>Format : {exportParams.format.toUpperCase()}</li>
              {exportParams.wilaya_id && (
                <li>Wilaya : {getWilayaName(exportParams.wilaya_id)} ({exportParams.wilaya_id})</li>
              )}
              {exportParams.gestionnaire_id && (
                <li>Gestionnaire : {gestionnaireOptions.find(g => g.value === exportParams.gestionnaire_id)?.label}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Export en cours..." : "Exporter"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;