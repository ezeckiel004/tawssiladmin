// src/pages/Comptabilite/ComptabiliteDashboard.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import comptabiliteService from "../../services/comptabiliteService";
import {
  FaChartLine,
  FaMoneyBillWave,
  FaBoxes,
  FaTruck,
  FaCalendarAlt,
  FaDownload,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaShoppingBag,
  FaRoad,
  FaGlobe,
  FaCity,
  FaFileExport,
} from "react-icons/fa";

const ComptabiliteDashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWilaya, setSelectedWilaya] = useState("16");
  const [period, setPeriod] = useState("mois");
  const [customDate, setCustomDate] = useState({
    debut: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    fin: new Date().toISOString().split("T")[0],
  });

  // Liste des wilayas pour le select admin
  const wilayas = [
    { code: "01", nom: "Adrar" },
    { code: "02", nom: "Chlef" },
    { code: "03", nom: "Laghouat" },
    { code: "04", nom: "Oum El Bouaghi" },
    { code: "05", nom: "Batna" },
    { code: "06", nom: "Béjaïa" },
    { code: "07", nom: "Biskra" },
    { code: "08", nom: "Béchar" },
    { code: "09", nom: "Blida" },
    { code: "10", nom: "Bouira" },
    { code: "11", nom: "Tamanrasset" },
    { code: "12", nom: "Tébessa" },
    { code: "13", nom: "Tlemcen" },
    { code: "14", nom: "Tiaret" },
    { code: "15", nom: "Tizi Ouzou" },
    { code: "16", nom: "Alger" },
    { code: "17", nom: "Djelfa" },
    { code: "18", nom: "Jijel" },
    { code: "19", nom: "Sétif" },
    { code: "20", nom: "Saïda" },
    { code: "21", nom: "Skikda" },
    { code: "22", nom: "Sidi Bel Abbès" },
    { code: "23", nom: "Annaba" },
    { code: "24", nom: "Guelma" },
    { code: "25", nom: "Constantine" },
    { code: "26", nom: "Médéa" },
    { code: "27", nom: "Mostaganem" },
    { code: "28", nom: "M'Sila" },
    { code: "29", nom: "Mascara" },
    { code: "30", nom: "Ouargla" },
    { code: "31", nom: "Oran" },
    { code: "32", nom: "El Bayadh" },
    { code: "33", nom: "Illizi" },
    { code: "34", nom: "Bordj Bou Arréridj" },
    { code: "35", nom: "Boumerdès" },
    { code: "36", nom: "El Tarf" },
    { code: "37", nom: "Tindouf" },
    { code: "38", nom: "Tissemsilt" },
    { code: "39", nom: "El Oued" },
    { code: "40", nom: "Khenchela" },
    { code: "41", nom: "Souk Ahras" },
    { code: "42", nom: "Tipaza" },
    { code: "43", nom: "Mila" },
    { code: "44", nom: "Aïn Defla" },
    { code: "45", nom: "Naâma" },
    { code: "46", nom: "Aïn Témouchent" },
    { code: "47", nom: "Ghardaïa" },
    { code: "48", nom: "Relizane" },
    { code: "49", nom: "Timimoun" },
    { code: "50", nom: "Bordj Badji Mokhtar" },
    { code: "51", nom: "Ouled Djellal" },
    { code: "52", nom: "Béni Abbès" },
    { code: "53", nom: "In Salah" },
    { code: "54", nom: "In Guezzam" },
    { code: "55", nom: "Touggourt" },
    { code: "56", nom: "Djanet" },
    { code: "57", nom: "El M'Ghair" },
    { code: "58", nom: "El Meniaa" },
  ];

  useEffect(() => {
    fetchData();
  }, [period, customDate, selectedWilaya]);

  const fetchData = async () => {
    try {
      setLoading(true);

      let params = { periode: period };

      if (period === "personnalise") {
        params.date_debut = customDate.debut;
        params.date_fin = customDate.fin;
      }

      let response;

      if (isAdmin) {
        if (selectedWilaya === "global") {
          response = await comptabiliteService.getBilanGlobal(params);
        } else {
          response = await comptabiliteService.getBilanWilaya(
            selectedWilaya,
            params,
          );
        }
      } else {
        response = await comptabiliteService.getBilanGestionnaire(params);
      }

      setStats(response.data);
    } catch (error) {
      console.error("Erreur chargement données:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = "excel") => {
    try {
      let params = {
        periode: period,
        format,
      };

      if (period === "personnalise") {
        params.date_debut = customDate.debut;
        params.date_fin = customDate.fin;
      }

      if (isAdmin) {
        if (selectedWilaya === "global") {
          await comptabiliteService.exportBilanGlobal(params);
          toast.success("Bilan global exporté avec succès");
        } else {
          await comptabiliteService.exportBilanWilaya(selectedWilaya, {
            ...params,
            nomWilaya: stats?.gestionnaire?.wilaya_nom || selectedWilaya,
          });
          toast.success(`Bilan de la wilaya exporté avec succès`);
        }
      } else {
        await comptabiliteService.exportBilanGestionnaire(params);
        toast.success("Bilan exporté avec succès");
      }
    } catch (error) {
      toast.error("Erreur lors de l'export");
    }
  };

  const formatMontant = (montant) => {
    return comptabiliteService.formatMontant(montant);
  };

  const formatNombre = (nombre) => {
    return comptabiliteService.formatNombre(nombre);
  };

  const getTendanceColor = (evolution) => {
    return comptabiliteService.getTendanceColor(evolution);
  };

  const getTendanceIcon = (evolution) => {
    return comptabiliteService.getTendanceIcon(evolution);
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    evolution,
    subValue,
    suffix = "",
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {evolution !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm ${getTendanceColor(evolution)}`}
          >
            {getTendanceIcon(evolution)}
            <span>{Math.abs(evolution)}%</span>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">
        {value}
        {suffix}
      </p>
      {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
    </div>
  );

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? "Tableau de bord financier" : "Mon bilan financier"}
          </h1>
          <p className="text-gray-600">
            {stats?.periode?.libelle || "Sélectionnez une période"}
          </p>
          {stats?.gestionnaire && (
            <p className="text-sm font-medium text-primary-600 mt-1">
              Wilaya : {stats.gestionnaire.wilaya_nom} (
              {stats.gestionnaire.wilaya_id})
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          {/* Sélecteur de wilaya pour admin */}
          {isAdmin && (
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="global">🌍 Toutes les wilayas</option>
              {wilayas.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code} - {w.nom}
                </option>
              ))}
            </select>
          )}

          {/* Filtres de période */}
          <button
            onClick={() => setPeriod("jour")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              period === "jour"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Jour
          </button>
          <button
            onClick={() => setPeriod("semaine")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              period === "semaine"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setPeriod("mois")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              period === "mois"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Mois
          </button>
          <button
            onClick={() => setPeriod("annee")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              period === "annee"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Année
          </button>
          <button
            onClick={() => setPeriod("personnalise")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              period === "personnalise"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Perso
          </button>

          {/* Boutons d'export */}
          <button
            onClick={() => handleExport("excel")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            title="Exporter en Excel"
          >
            <FaFileExport />
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
            title="Exporter en PDF"
          >
            <FaDownload />
          </button>
        </div>
      </div>

      {/* Période personnalisée */}
      {period === "personnalise" && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date début
              </label>
              <input
                type="date"
                value={customDate.debut}
                onChange={(e) =>
                  setCustomDate({ ...customDate, debut: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date fin
              </label>
              <input
                type="date"
                value={customDate.fin}
                onChange={(e) =>
                  setCustomDate({ ...customDate, fin: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              onClick={fetchData}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}

      {stats && (
        <>
          {/* Cartes principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Chiffre d'affaires total"
              value={formatMontant(stats.finances?.chiffre_affaires_total)}
              icon={FaMoneyBillWave}
              color="bg-green-500"
              evolution={stats.evolution?.chiffre_affaires?.evolution}
            />
            <StatCard
              title="Valeur des colis"
              value={formatMontant(stats.finances?.valeur_colis)}
              icon={FaShoppingBag}
              color="bg-blue-500"
            />
            <StatCard
              title="Revenus livraisons"
              value={formatMontant(stats.finances?.revenus_livraisons)}
              icon={FaTruck}
              color="bg-purple-500"
            />
            <StatCard
              title="Revenus navettes"
              value={formatMontant(stats.finances?.revenus_navettes)}
              icon={FaRoad}
              color="bg-orange-500"
            />
          </div>

          {/* Statistiques détaillées */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Détail des colis */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaBoxes className="text-primary-600" />
                Statistiques des colis
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Nombre total de colis</span>
                  <span className="font-semibold text-lg">
                    {formatNombre(stats.colis?.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">
                    Valeur moyenne par colis
                  </span>
                  <span className="font-semibold text-lg">
                    {formatMontant(stats.colis?.valeur_moyenne)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Poids total</span>
                  <span className="font-semibold text-lg">
                    {stats.colis?.poids_total || 0} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Détail des livraisons */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaTruck className="text-primary-600" />
                Statistiques des livraisons
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">
                    Nombre total de livraisons
                  </span>
                  <span className="font-semibold text-lg">
                    {formatNombre(stats.livraisons?.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Livraisons terminées</span>
                  <span className="font-semibold text-green-600">
                    {formatNombre(stats.livraisons?.terminees)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Livraisons en cours</span>
                  <span className="font-semibold text-yellow-600">
                    {formatNombre(stats.livraisons?.en_cours)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Prix moyen de livraison</span>
                  <span className="font-semibold text-lg">
                    {formatMontant(stats.livraisons?.prix_moyen)}
                  </span>
                </div>
              </div>
            </div>

            {/* Détail des navettes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaRoad className="text-primary-600" />
                Statistiques des navettes
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">
                    Nombre total de navettes
                  </span>
                  <span className="font-semibold text-lg">
                    {formatNombre(stats.navettes?.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Navettes en cours</span>
                  <span className="font-semibold text-yellow-600">
                    {formatNombre(stats.navettes?.en_cours)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Navettes terminées</span>
                  <span className="font-semibold text-green-600">
                    {formatNombre(stats.navettes?.terminees)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Distance totale</span>
                  <span className="font-semibold text-lg">
                    {stats.navettes?.distance_totale || 0} km
                  </span>
                </div>
              </div>
            </div>

            {/* Répartition des revenus */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaChartLine className="text-primary-600" />
                Répartition des revenus
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Colis</span>
                    <span className="font-semibold">
                      {formatMontant(
                        stats.finances?.repartition?.colis?.montant,
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${stats.finances?.repartition?.colis?.pourcentage || 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Livraisons</span>
                    <span className="font-semibold">
                      {formatMontant(
                        stats.finances?.repartition?.livraisons?.montant,
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${stats.finances?.repartition?.livraisons?.pourcentage || 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Navettes</span>
                    <span className="font-semibold">
                      {formatMontant(
                        stats.finances?.repartition?.navettes?.montant,
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{
                        width: `${stats.finances?.repartition?.navettes?.pourcentage || 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="font-bold text-lg text-green-600">
                      {formatMontant(stats.finances?.chiffre_affaires_total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top wilayas pour admin */}
          {isAdmin && selectedWilaya === "global" && stats.top_wilayas && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaGlobe className="text-primary-600" />
                  Top 5 wilayas de départ
                </h3>
                <div className="space-y-3">
                  {stats.top_wilayas.departs?.map((wilaya, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="font-medium">
                        {wilaya.nom} ({wilaya.wilaya})
                      </span>
                      <span className="text-primary-600 font-semibold">
                        {formatNombre(wilaya.total)} colis
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaCity className="text-primary-600" />
                  Top 5 wilayas de destination
                </h3>
                <div className="space-y-3">
                  {stats.top_wilayas.arrivees?.map((wilaya, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="font-medium">
                        {wilaya.nom} ({wilaya.wilaya})
                      </span>
                      <span className="text-primary-600 font-semibold">
                        {formatNombre(wilaya.total)} colis
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ComptabiliteDashboard;
