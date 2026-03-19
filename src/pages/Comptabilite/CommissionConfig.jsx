// src/pages/Comptabilite/CommissionConfig.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import commissionService from "../../services/commissionService";
import {
  FaPercentage,
  FaMoneyBillWave,
  FaChartPie,
  FaSave,
  FaHistory,
  FaCalculator,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const CommissionConfig = () => {
  const [config, setConfig] = useState({
    depart: 25,
    arrivee: 25,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [showHistorique, setShowHistorique] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadConfig();
    loadHistorique();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await commissionService.getConfig();
      setConfig({
        depart: response.data.pourcentages.depart,
        arrivee: response.data.pourcentages.arrivee,
      });
    } catch (error) {
      console.error("Erreur chargement config:", error);
      toast.error("Erreur lors du chargement de la configuration");
    } finally {
      setLoading(false);
    }
  };

  const loadHistorique = async () => {
    try {
      const response = await commissionService.getHistoriqueConfig();
      setHistorique(response.data);
    } catch (error) {
      console.error("Erreur chargement historique:", error);
    }
  };

  const validateConfig = (depart, arrivee) => {
    const newErrors = {};

    if (depart < 0 || depart > 100) {
      newErrors.depart = "Le pourcentage doit être entre 0 et 100";
    }
    if (arrivee < 0 || arrivee > 100) {
      newErrors.arrivee = "Le pourcentage doit être entre 0 et 100";
    }

    const total = (depart || 0) + (arrivee || 0);
    if (total > 100) {
      newErrors.total = "La somme des commissions ne peut pas dépasser 100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    const newConfig = { ...config, [field]: numValue };
    setConfig(newConfig);
    validateConfig(newConfig.depart, newConfig.arrivee);
    
    // Simuler automatiquement après validation
    if (validateConfig(newConfig.depart, newConfig.arrivee)) {
      simulateConfig(newConfig.depart, newConfig.arrivee);
    }
  };

  const simulateConfig = async (depart, arrivee) => {
    try {
      const response = await commissionService.simulerConfig({
        depart,
        arrivee,
      });
      setSimulation(response.data);
    } catch (error) {
      console.error("Erreur simulation:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateConfig(config.depart, config.arrivee)) {
      toast.error("Veuillez corriger les erreurs avant de sauvegarder");
      return;
    }

    try {
      setSaving(true);
      await commissionService.updateConfig(config);
      toast.success("Configuration mise à jour avec succès");
      await loadHistorique(); // Recharger l'historique
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const total = config.depart + config.arrivee;
  const adminPart = 100 - total;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FaArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Configuration des Commissions
          </h1>
        </div>
        <p className="text-gray-600">
          Définissez les pourcentages de commission pour les gestionnaires
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire de configuration */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Commission Départ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Wilaya de Départ (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={config.depart}
                      onChange={(e) => handleChange("depart", e.target.value)}
                      min="0"
                      max="100"
                      step="0.5"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${
                        errors.depart ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <FaPercentage className="absolute right-3 top-3 text-gray-400" />
                  </div>
                  {errors.depart && (
                    <p className="mt-1 text-sm text-red-600">{errors.depart}</p>
                  )}
                </div>

                {/* Commission Arrivée */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Wilaya d'Arrivée (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={config.arrivee}
                      onChange={(e) => handleChange("arrivee", e.target.value)}
                      min="0"
                      max="100"
                      step="0.5"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 ${
                        errors.arrivee ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <FaPercentage className="absolute right-3 top-3 text-gray-400" />
                  </div>
                  {errors.arrivee && (
                    <p className="mt-1 text-sm text-red-600">{errors.arrivee}</p>
                  )}
                </div>

                {/* Résumé */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FaChartPie className="text-primary-600" />
                    Répartition
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Départ</span>
                      <span className="font-medium">{config.depart}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Arrivée</span>
                      <span className="font-medium">{config.arrivee}%</span>
                    </div>
                    <div className="border-t border-gray-200 my-2 pt-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-900">Total Gestionnaires</span>
                        <span className={total > 100 ? "text-red-600" : "text-green-600"}>
                          {total}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Part Admin</span>
                        <span className="font-medium text-blue-600">{adminPart}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {errors.total && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-700">
                      <FaExclamationTriangle />
                      <span className="text-sm font-medium">{errors.total}</span>
                    </div>
                  </div>
                )}

                {/* Barre de progression */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Départ ({config.depart}%)</span>
                    <span>Arrivée ({config.arrivee}%)</span>
                    <span>Admin ({adminPart}%)</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
                    <div
                      className="bg-blue-500 h-3"
                      style={{ width: `${config.depart}%` }}
                    ></div>
                    <div
                      className="bg-purple-500 h-3"
                      style={{ width: `${config.arrivee}%` }}
                    ></div>
                    <div
                      className="bg-green-500 h-3"
                      style={{ width: `${adminPart}%` }}
                    ></div>
                  </div>
                </div>

                {/* Bouton sauvegarder */}
                <button
                  type="submit"
                  disabled={saving || Object.keys(errors).length > 0}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sauvegarde en cours...</span>
                    </>
                  ) : (
                    <>
                      <FaSave />
                      <span>Enregistrer la configuration</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Panneau latéral : Simulation et Historique */}
        <div className="space-y-6">
          {/* Simulation */}
          {simulation && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FaCalculator className="text-primary-600" />
                Simulation d'impact
              </h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 mb-1">Prix moyen estimé</p>
                  <p className="text-lg font-bold text-blue-900">
                    {new Intl.NumberFormat('fr-DZ', {
                      style: 'currency',
                      currency: 'DZD',
                      minimumFractionDigits: 0,
                    }).format(simulation.impact_estime.prix_moyen_estime)}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs text-gray-500 mb-2">
                    Projection sur 100 livraisons
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Commissions départ</span>
                      <span className="font-medium text-blue-600">
                        {new Intl.NumberFormat('fr-DZ', {
                          style: 'currency',
                          currency: 'DZD',
                          minimumFractionDigits: 0,
                        }).format(simulation.impact_estime.simulation_sur_100_livraisons.commissions_depart)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Commissions arrivée</span>
                      <span className="font-medium text-purple-600">
                        {new Intl.NumberFormat('fr-DZ', {
                          style: 'currency',
                          currency: 'DZD',
                          minimumFractionDigits: 0,
                        }).format(simulation.impact_estime.simulation_sur_100_livraisons.commissions_arrivee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-medium border-t border-gray-200 pt-2 mt-2">
                      <span className="text-gray-900">Part admin</span>
                      <span className="text-green-600">
                        {new Intl.NumberFormat('fr-DZ', {
                          style: 'currency',
                          currency: 'DZD',
                          minimumFractionDigits: 0,
                        }).format(simulation.impact_estime.simulation_sur_100_livraisons.part_admin)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Historique */}
          <div className="bg-white rounded-lg shadow p-6">
            <button
              onClick={() => setShowHistorique(!showHistorique)}
              className="w-full flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <FaHistory className="text-primary-600" />
                <h3 className="font-medium text-gray-900">Historique</h3>
              </div>
              <span className="text-sm text-gray-500">
                {showHistorique ? "Cacher" : "Voir"}
              </span>
            </button>

            {showHistorique && (
              <div className="mt-4 space-y-3">
                {historique.depart && (
                  <div className="border-l-4 border-blue-500 pl-3 py-2">
                    <p className="text-xs text-gray-500">Commission Départ</p>
                    <p className="text-sm font-medium">
                      Actuelle : {historique.depart.valeur_actuelle}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Dernière modif : {historique.depart.derniere_modification}
                    </p>
                  </div>
                )}
                {historique.arrivee && (
                  <div className="border-l-4 border-purple-500 pl-3 py-2">
                    <p className="text-xs text-gray-500">Commission Arrivée</p>
                    <p className="text-sm font-medium">
                      Actuelle : {historique.arrivee.valeur_actuelle}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Dernière modif : {historique.arrivee.derniere_modification}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <FaCheckCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 mb-1">
                  Important
                </h4>
                <p className="text-xs text-yellow-700">
                  Les modifications s'appliquent uniquement aux nouvelles
                  livraisons terminées. Les livraisons déjà effectuées
                  conservent leurs commissions historiques.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionConfig;