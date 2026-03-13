// src/pages/Comptabilite/ImpayesList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import comptabiliteService from "../../services/comptabiliteService";
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaUser,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaDownload,
  FaFilter,
  FaFileExport,
  FaSearch,
  FaCheckDouble,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";

const ImpayesList = () => {
  const navigate = useNavigate();
  const [impayes, setImpayes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGains, setSelectedGains] = useState([]);
  const [filters, setFilters] = useState({
    livreur: "",
    periode: "",
    search: "",
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAll, setPayAll] = useState(false);

  useEffect(() => {
    fetchImpayes();
  }, []);

  const fetchImpayes = async () => {
    try {
      setLoading(true);
      const response = await comptabiliteService.getImpayes();
      setImpayes(response.data);
    } catch (error) {
      console.error("Erreur chargement impayés:", error);
      toast.error("Erreur lors du chargement des impayés");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedGains.length === getFilteredGains().length) {
      setSelectedGains([]);
    } else {
      setSelectedGains(getFilteredGains().map((g) => g.id));
    }
  };

  const handleSelectGain = (gainId) => {
    if (selectedGains.includes(gainId)) {
      setSelectedGains(selectedGains.filter((id) => id !== gainId));
    } else {
      setSelectedGains([...selectedGains, gainId]);
    }
  };

  const handleMarquerPayes = async () => {
    if (selectedGains.length === 0) {
      toast.error("Veuillez sélectionner au moins un gain");
      return;
    }

    try {
      const response = await comptabiliteService.marquerPayes(selectedGains);
      toast.success(
        response.message || `${selectedGains.length} gains marqués comme payés`,
      );
      setSelectedGains([]);
      setShowPayModal(false);
      fetchImpayes();
    } catch (error) {
      toast.error("Erreur lors du marquage des paiements");
    }
  };

  const handleMarquerPeriodePayee = async () => {
    try {
      const periode = filters.periode || new Date().toISOString().slice(0, 7);
      const livreurId = filters.livreur || null;

      const response = await comptabiliteService.marquerPeriodePayee(
        periode,
        livreurId,
      );
      toast.success(
        response.message || `Gains de ${periode} marqués comme payés`,
      );
      setShowPayModal(false);
      setPayAll(false);
      fetchImpayes();
    } catch (error) {
      toast.error("Erreur lors du marquage des paiements");
    }
  };

  const handleExport = async (format = "excel") => {
    try {
      await comptabiliteService.exportRapport(
        {
          type_periode: "personnalise",
          date_debut: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          date_fin: new Date().toISOString().split("T")[0],
          statut: "en_attente",
          livreur_id: filters.livreur || undefined,
        },
        format,
      );

      toast.success("Export lancé avec succès");
      setShowExportModal(false);
    } catch (error) {
      toast.error("Erreur lors de l'export");
    }
  };

  const getFilteredGains = () => {
    if (!impayes?.par_livreur) return [];

    let gains = [];
    impayes.par_livreur.forEach((livreur) => {
      // Simulation de gains individuels (à remplacer par vraies données)
      for (let i = 0; i < livreur.nb_livraisons; i++) {
        gains.push({
          id: `${livreur.livreur_id}-${i}`,
          livreur_id: livreur.livreur_id,
          livreur_nom: livreur.nom,
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          montant: livreur.montant_total / livreur.nb_livraisons,
          livraison_id: `LIV-${Math.floor(Math.random() * 10000)}`,
          periode: new Date().toISOString().slice(0, 7),
        });
      }
    });

    // Appliquer les filtres
    return gains.filter((gain) => {
      if (filters.livreur && gain.livreur_id.toString() !== filters.livreur)
        return false;
      if (filters.periode && gain.periode !== filters.periode) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          gain.livreur_nom.toLowerCase().includes(searchLower) ||
          gain.livraison_id.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  };

  const formatMontant = (montant) => {
    return comptabiliteService.formatMontant(montant || 0);
  };

  const getPeriodes = () => {
    const periodes = [];
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      periodes.push(date.toISOString().slice(0, 7));
    }
    return periodes;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const filteredGains = getFilteredGains();
  const totalSelectionne = selectedGains.reduce((sum, id) => {
    const gain = filteredGains.find((g) => g.id === id);
    return sum + (gain?.montant || 0);
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/comptabilite")}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-4"
        >
          <FaArrowLeft /> Retour au dashboard
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestion des impayés
            </h1>
            <p className="text-gray-600">
              Total impayés : {formatMontant(impayes?.total_impaye)} (
              {impayes?.nb_total || 0} gains)
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FaFileExport /> Exporter
            </button>
            {selectedGains.length > 0 && (
              <button
                onClick={() => setShowPayModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <FaCheckCircle /> Marquer comme payés ({selectedGains.length})
              </button>
            )}
            <button
              onClick={() => setPayAll(true) || setShowPayModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <FaCheckDouble /> Tout payer (période)
            </button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Livreur
            </label>
            <select
              value={filters.livreur}
              onChange={(e) =>
                setFilters({ ...filters, livreur: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Tous les livreurs</option>
              {impayes?.par_livreur?.map((livreur) => (
                <option key={livreur.livreur_id} value={livreur.livreur_id}>
                  {livreur.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période
            </label>
            <select
              value={filters.periode}
              onChange={(e) =>
                setFilters({ ...filters, periode: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Toutes les périodes</option>
              {getPeriodes().map((periode) => (
                <option key={periode} value={periode}>
                  {new Date(periode + "-01").toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recherche
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par livreur ou livraison..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => setFilters({ livreur: "", periode: "", search: "" })}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            <FaFilter /> Réinitialiser
          </button>
        </div>
      </div>

      {/* Résumé par livreur */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {impayes?.par_livreur?.map((livreur) => (
          <div
            key={livreur.livreur_id}
            className="bg-white rounded-lg shadow p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaUser className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{livreur.nom}</p>
                <p className="text-sm text-gray-600">
                  {livreur.nb_livraisons} livraisons
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total impayé</span>
              <span className="font-bold text-red-600">
                {formatMontant(livreur.montant_total)}
              </span>
            </div>
            <div className="mt-2">
              <button
                onClick={() => {
                  setFilters({
                    ...filters,
                    livreur: livreur.livreur_id.toString(),
                  });
                }}
                className="text-xs text-primary-600 hover:text-primary-800"
              >
                Voir les détails
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tableau des gains impayés */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Détail des impayés{" "}
            {filteredGains.length > 0 && `(${filteredGains.length})`}
          </h2>
          {filteredGains.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              {selectedGains.length === filteredGains.length
                ? "Tout désélectionner"
                : "Tout sélectionner"}
            </button>
          )}
        </div>

        {filteredGains.length === 0 ? (
          <div className="text-center py-12">
            <FaExclamationTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun impayé trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={
                        selectedGains.length === filteredGains.length &&
                        filteredGains.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Livreur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Livraison
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGains.map((gain, index) => (
                  <tr key={gain.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedGains.includes(gain.id)}
                        onChange={() => handleSelectGain(gain.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <FaUser className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {gain.livreur_nom}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-600">
                        {gain.livraison_id}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400 w-3 h-3" />
                        <span className="text-sm text-gray-600">
                          {new Date(gain.date).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        {gain.periode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-red-600">
                        {formatMontant(gain.montant)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs flex items-center gap-1 w-fit">
                        <FaClock className="w-3 h-3" />
                        En attente
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pied de tableau avec total */}
        {filteredGains.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  {selectedGains.length} gain(s) sélectionné(s)
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total sélectionné</p>
                <p className="text-xl font-bold text-primary-600">
                  {formatMontant(totalSelectionne)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmation de paiement */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {payAll
                  ? "Marquer une période comme payée"
                  : "Confirmer le paiement"}
              </h2>
            </div>

            <div className="p-6">
              {payAll ? (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Vous allez marquer tous les gains comme payés pour :
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Période
                    </label>
                    <select
                      value={
                        filters.periode || new Date().toISOString().slice(0, 7)
                      }
                      onChange={(e) =>
                        setFilters({ ...filters, periode: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      {getPeriodes().map((periode) => (
                        <option key={periode} value={periode}>
                          {new Date(periode + "-01").toLocaleDateString(
                            "fr-FR",
                            { month: "long", year: "numeric" },
                          )}
                        </option>
                      ))}
                    </select>
                  </div>
                  {filters.livreur && (
                    <p className="text-sm text-gray-600">
                      Livreur:{" "}
                      {
                        impayes?.par_livreur?.find(
                          (l) => l.livreur_id.toString() === filters.livreur,
                        )?.nom
                      }
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Vous êtes sur le point de marquer {selectedGains.length}{" "}
                    gain(s) comme payés pour un montant total de{" "}
                    {formatMontant(totalSelectionne)}.
                  </p>
                  <p className="text-sm text-gray-500">
                    Cette action est irréversible. Les livreurs concernés seront
                    notifiés.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPayModal(false);
                  setPayAll(false);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Annuler
              </button>
              <button
                onClick={
                  payAll ? handleMarquerPeriodePayee : handleMarquerPayes
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Confirmer le paiement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'export */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Exporter les impayés
              </h2>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format d'export
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleExport("excel")}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      <FaFileExcel className="w-6 h-6 text-green-600" />
                      <span className="text-xs text-gray-600">Excel</span>
                    </button>
                    <button
                      onClick={() => handleExport("pdf")}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      <FaFilePdf className="w-6 h-6 text-red-600" />
                      <span className="text-xs text-gray-600">PDF</span>
                    </button>
                    <button
                      onClick={() => handleExport("csv")}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      <FaFileCsv className="w-6 h-6 text-blue-600" />
                      <span className="text-xs text-gray-600">CSV</span>
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  L'export inclura {filteredGains.length} gains impayés
                  {filters.livreur && " pour le livreur sélectionné"}
                  {filters.periode && ` pour la période ${filters.periode}`}.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpayesList;
