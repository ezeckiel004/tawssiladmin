// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  FaChartBar,
  FaUsers,
  FaTruck,
  FaShoppingBag,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaUserCheck,
  FaSync,
} from "react-icons/fa";
import StatCard from "../components/Cards/StatCard";
import StatsChart from "../components/Charts/StatsChart";
import { toast } from "react-hot-toast";
import userService from "../services/userService";
import livraisonService from "../services/livraisonService";
import livreurService from "../services/livreurService";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    totalLivreurs: 0,
    totalAdmins: 0,
    activeUsers: 0,
    inactiveUsers: 0,

    totalLivraisons: 0,
    livraisonsEnCours: 0,
    livraisonsTerminees: 0,
    livraisonsAnnulees: 0,
    livraisonsEnAttente: 0,

    livreursActifs: 0,
    livreursInactifs: 0,
  });

  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fonctions de statut
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800 border border-gray-200";
    const s = status.toLowerCase();
    if (s.includes("termine") || s.includes("livre"))
      return "bg-green-100 text-green-800 border border-green-200";
    if (s.includes("cours") || s.includes("pending"))
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    if (s.includes("annule"))
      return "bg-red-100 text-red-800 border border-red-200";
    if (s.includes("attente"))
      return "bg-blue-100 text-blue-800 border border-blue-200";
    return "bg-gray-100 text-gray-800 border border-gray-200";
  };

  const getStatusLabel = (status) => {
    if (!status) return "Inconnu";
    const s = status.toLowerCase();
    if (s.includes("termine") || s.includes("livre")) return "Terminée";
    if (s.includes("cours") || s.includes("pending")) return "En cours";
    if (s.includes("annule")) return "Annulée";
    if (s.includes("attente")) return "En attente";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusIcon = (status) => {
    if (!status) return null;
    const s = status.toLowerCase();
    if (s.includes("termine") || s.includes("livre"))
      return <FaCheckCircle className="inline w-3 h-3 mr-1" />;
    if (s.includes("annule"))
      return <FaTimesCircle className="inline w-3 h-3 mr-1" />;
    if (s.includes("cours") || s.includes("pending"))
      return <FaClock className="inline w-3 h-3 mr-1" />;
    return null;
  };

  const fetchDashboardData = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      setErrorMessage(null);

      if (showToast) {
        toast.loading("Chargement des données...");
      }

      console.log("📊 Chargement des données du dashboard...");

      // Récupérer toutes les données en parallèle
      const [allUsersResult, allLivreursResult, allLivraisonsResult] =
        await Promise.allSettled([
          userService.getAllUsers(true, true),
          livreurService.getAllLivreurs(true),
          livraisonService.getAllLivraisons(),
        ]);

      console.log("✅ Données récupérées:", {
        users:
          allUsersResult.status === "fulfilled"
            ? allUsersResult.value?.length || 0
            : 0,
        livreurs:
          allLivreursResult.status === "fulfilled"
            ? allLivreursResult.value?.length || 0
            : 0,
        livraisons:
          allLivraisonsResult.status === "fulfilled"
            ? allLivraisonsResult.value?.length || 0
            : 0,
      });

      // Gestion des erreurs et données fallback
      const users =
        allUsersResult.status === "fulfilled" ? allUsersResult.value || [] : [];
      const livreurs =
        allLivreursResult.status === "fulfilled"
          ? allLivreursResult.value || []
          : [];
      const livraisons =
        allLivraisonsResult.status === "fulfilled"
          ? allLivraisonsResult.value || []
          : [];

      // Calculer les stats des utilisateurs
      const activeUsers = users.filter((u) => u.actif !== false).length;
      const inactiveUsers = users.filter((u) => u.actif === false).length;

      const userStats = {
        total: users.length,
        clients: users.filter((u) => u.role === "client").length,
        livreurs: users.filter((u) => u.role === "livreur").length,
        admins: users.filter((u) => u.role === "admin").length,
        actifs: activeUsers,
        inactifs: inactiveUsers,
      };

      console.log("📈 Stats utilisateurs:", userStats);

      // Calculer les stats des livraisons
      const statusStats = {
        total: livraisons.length,
        enCours: livraisons.filter((l) => {
          const status = (l.status || "").toLowerCase();
          return !["en_attente", "livre", "termine", "annule"].includes(status);
        }).length,
        terminees: livraisons.filter((l) => {
          const status = (l.status || "").toLowerCase();
          return status.includes("livre") || status.includes("termine");
        }).length,
        annulees: livraisons.filter((l) => {
          const status = (l.status || "").toLowerCase();
          return status.includes("annule");
        }).length,
        enAttente: livraisons.filter((l) => {
          const status = (l.status || "").toLowerCase();
          return status.includes("en_attente") || status.includes("attente");
        }).length,
      };

      console.log("📦 Stats livraisons:", statusStats);

      // Livreurs actifs/inactifs
      const livreurStats = {
        actifs: livreurs.filter((l) => l.actif !== false).length,
        inactifs: livreurs.filter((l) => l.actif === false).length,
      };

      // Mettre à jour les stats globales
      setStats({
        totalUsers: userStats.total || 0,
        totalClients: userStats.clients || 0,
        totalLivreurs: userStats.livreurs || 0,
        totalAdmins: userStats.admins || 0,
        activeUsers: userStats.actifs || 0,
        inactiveUsers: userStats.inactifs || 0,

        totalLivraisons: statusStats.total,
        livraisonsEnCours: statusStats.enCours,
        livraisonsTerminees: statusStats.terminees,
        livraisonsAnnulees: statusStats.annulees,
        livraisonsEnAttente: statusStats.enAttente,

        livreursActifs: livreurStats.actifs,
        livreursInactifs: livreurStats.inactifs,
      });

      // Préparer les activités récentes
      const activities = livraisons
        .sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at || 0) -
            new Date(a.updated_at || a.created_at || 0),
        )
        .slice(0, 10)
        .map((l) => ({
          id: l.id,
          numero: l.code_pin || `#${l.id}`,
          status: l.status || "inconnu",
          client: l.client
            ? `${l.client.prenom || ""} ${l.client.nom || ""}`.trim()
            : l.client_nom || "Client inconnu",
          livreur:
            l.livreur_ramasseur || l.livreur_distributeur
              ? `${l.livreur_ramasseur?.prenom || l.livreur_distributeur?.prenom || ""} ${l.livreur_ramasseur?.nom || l.livreur_distributeur?.nom || ""}`.trim()
              : "Non attribué",
          date: l.updated_at || l.created_at || null,
        }));

      setRecentActivities(activities);
      setChartData(prepareChartData(activities));
      setLastUpdate(new Date());

      console.log("✅ Dashboard chargé avec succès");

      if (showToast) {
        toast.dismiss();
        toast.success("Données mises à jour");
      }
    } catch (error) {
      console.error("❌ Erreur dans fetchDashboardData:", error);
      setErrorMessage(
        "Impossible de charger les données. Vérifiez votre connexion ou vos permissions.",
      );
      if (showToast) {
        toast.dismiss();
        toast.error("Erreur de chargement");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    fetchDashboardData(true);
  };

  const prepareChartData = (activities) => {
    if (!Array.isArray(activities) || activities.length === 0) {
      // Retourner des données par défaut pour le graphique
      const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
      return {
        labels: days,
        datasets: [
          {
            label: "Activités",
            data: [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "#3b82f6",
            borderWidth: 2,
            fill: true,
          },
        ],
        trend: {
          value: 0,
          color: "text-gray-600",
          icon: "→",
        },
      };
    }

    // Créer les 7 derniers jours
    const days = Array(7)
      .fill(0)
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          day: d.toLocaleDateString("fr-FR", { weekday: "short" }),
          date: d.toISOString().split("T")[0],
          count: 0,
        };
      });

    // Compter les activités par jour
    activities.forEach((act) => {
      if (act.date) {
        try {
          const actDate = new Date(act.date).toISOString().split("T")[0];
          const dayIndex = days.findIndex((d) => d.date === actDate);
          if (dayIndex !== -1) {
            days[dayIndex].count++;
          }
        } catch (e) {
          console.warn("Date invalide:", act.date);
        }
      }
    });

    // Calculer la tendance
    const yesterday = days[days.length - 2]?.count || 0;
    const today = days[days.length - 1]?.count || 0;
    const trend = yesterday > 0 ? ((today - yesterday) / yesterday) * 100 : 0;

    return {
      labels: days.map((d) => d.day),
      datasets: [
        {
          label: "Activités",
          data: days.map((d) => d.count),
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderColor: "#3b82f6",
          borderWidth: 2,
          fill: true,
        },
      ],
      trend: {
        value: Math.round(trend),
        color:
          trend > 0
            ? "text-green-600"
            : trend < 0
              ? "text-red-600"
              : "text-gray-600",
        icon: trend > 0 ? "↑" : trend < 0 ? "↓" : "→",
      },
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateString));
    } catch {
      return "—";
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    try {
      const diffMs = Date.now() - new Date(dateString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "À l'instant";
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)} h`;
      return `Il y a ${Math.floor(diffMins / 1440)} j`;
    } catch {
      return "";
    }
  };

  // Composant de chargement
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="inline-block w-16 h-16 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">
          Chargement des données...
        </p>
      </div>
    </div>
  );

  if (loading && recentActivities.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="pb-8 space-y-8">
      {errorMessage && (
        <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center">
            <FaTimesCircle className="flex-shrink-0 w-5 h-5 mr-3" />
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* En-tête avec bouton de rafraîchissement */}
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="mt-1 text-gray-600">
            Vue d'ensemble de la plateforme Tawssil
            {lastUpdate && (
              <span className="ml-2 text-sm text-gray-500">
                • Dernière mise à jour: {formatTimeAgo(lastUpdate)}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <FaSync className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Chargement..." : "Actualiser"}
        </button>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Utilisateurs"
          value={stats.totalUsers}
          icon={FaUsers}
          iconColor="bg-blue-100 text-blue-600"
          trend={`${stats.activeUsers} actifs`}
          trendColor="text-green-600"
          subtitle={`${stats.inactiveUsers} inactifs`}
          loading={loading}
        />

        <StatCard
          title="Clients"
          value={stats.totalClients}
          icon={FaShoppingBag}
          iconColor="bg-green-100 text-green-600"
          percentage={
            stats.totalUsers > 0
              ? Math.round((stats.totalClients / stats.totalUsers) * 100)
              : 0
          }
          trendColor="text-green-600"
          subtitle={`${stats.totalClients > 0 ? Math.round((stats.activeUsers / stats.totalClients) * 100) : 0}% actifs`}
          loading={loading}
        />

        <StatCard
          title="Livreurs"
          value={stats.totalLivreurs}
          icon={FaTruck}
          iconColor="bg-purple-100 text-purple-600"
          trend={`${stats.livreursActifs} actifs`}
          trendColor="text-green-600"
          subtitle={`${stats.totalLivreurs > 0 ? Math.round((stats.livreursActifs / stats.totalLivreurs) * 100) : 0}% actifs`}
          loading={loading}
        />

        <StatCard
          title="Livraisons"
          value={stats.totalLivraisons}
          icon={FaChartBar}
          iconColor="bg-orange-100 text-orange-600"
          trend={`${stats.livraisonsEnCours} en cours`}
          trendColor="text-orange-600"
          subtitle={`${stats.livraisonsTerminees} terminées`}
          loading={loading}
        />
      </div>

      {/* Deuxième ligne de statistiques */}
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-full bg-emerald-100">
              <FaCheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Livraisons terminées
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.livraisonsTerminees}
              </p>
              <p className="text-xs text-gray-500">
                {stats.totalLivraisons > 0
                  ? Math.round(
                      (stats.livraisonsTerminees / stats.totalLivraisons) * 100,
                    )
                  : 0}
                % du total
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 mr-3 bg-yellow-100 rounded-full">
              <FaClock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.livraisonsEnAttente}
              </p>
              <p className="text-xs text-gray-500">
                {stats.totalLivraisons > 0
                  ? Math.round(
                      (stats.livraisonsEnAttente / stats.totalLivraisons) * 100,
                    )
                  : 0}
                % du total
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 mr-3 bg-red-100 rounded-full">
              <FaTimesCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Annulées</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.livraisonsAnnulees}
              </p>
              <p className="text-xs text-gray-500">
                {stats.totalLivraisons > 0
                  ? Math.round(
                      (stats.livraisonsAnnulees / stats.totalLivraisons) * 100,
                    )
                  : 0}
                % du total
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 mr-3 bg-indigo-100 rounded-full">
              <FaUserCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Administrateurs
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalAdmins}
              </p>
              <p className="text-xs text-gray-500">
                {stats.totalUsers > 0
                  ? Math.round((stats.totalAdmins / stats.totalUsers) * 100)
                  : 0}
                % des utilisateurs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et activités */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Activités récentes */}
        <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Activités récentes
              </h3>
              <p className="text-sm text-gray-500">
                Dernières livraisons et mises à jour
              </p>
            </div>
            <span className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
              {recentActivities.length} activité
              {recentActivities.length > 1 ? "s" : ""}
            </span>
          </div>

          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="p-4 transition-colors bg-gray-50 hover:bg-gray-100 rounded-xl"
                >
                  <div className="flex items-start">
                    <div className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-full">
                      <FaTruck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          Livraison {activity.numero}
                        </p>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            activity.status,
                          )}`}
                        >
                          {getStatusIcon(activity.status)}
                          {getStatusLabel(activity.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {activity.client}
                        {activity.livreur &&
                          activity.livreur !== "Non attribué" &&
                          ` • Livré par ${activity.livreur}`}
                      </p>
                      {activity.date && (
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(activity.date)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <FaFileAlt className="w-12 h-12 mx-auto text-gray-300" />
              <p className="mt-4 font-medium text-gray-500">
                Aucune activité récente
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Les nouvelles activités apparaîtront ici
              </p>
            </div>
          )}
        </div>

        {/* Graphique */}
        <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Activités des 7 derniers jours
              </h3>
              <p className="text-sm text-gray-500">
                Tendances d'activité quotidiennes
              </p>
            </div>
            {chartData?.trend && (
              <div
                className={`flex items-center text-sm font-medium ${chartData.trend.color}`}
              >
                <span>{Math.abs(chartData.trend.value)}%</span>
                <span className="ml-1">{chartData.trend.icon}</span>
              </div>
            )}
          </div>

          {chartData && (
            <div className="h-64">
              <StatsChart
                data={chartData.datasets[0].data}
                labels={chartData.labels}
                title="Activités quotidiennes"
                height={250}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm font-medium text-gray-700">
                Taux de complétion
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {stats.totalLivraisons > 0
                  ? Math.round(
                      (stats.livraisonsTerminees / stats.totalLivraisons) * 100,
                    )
                  : 0}
                %
              </p>
              <p className="text-xs text-gray-500">
                {stats.livraisonsTerminees} sur {stats.totalLivraisons}{" "}
                livraisons
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-sm font-medium text-gray-700">
                Utilisateurs actifs
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {stats.totalUsers > 0
                  ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
                  : 0}
                %
              </p>
              <p className="text-xs text-gray-500">
                {stats.activeUsers} sur {stats.totalUsers} utilisateurs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-3">
        {/* Répartition des rôles */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl">
          <h4 className="mb-4 text-lg font-semibold text-gray-900">
            Répartition des rôles
          </h4>
          <div className="space-y-4">
            {[
              {
                role: "Clients",
                value: stats.totalClients,
                color: "bg-green-500",
              },
              {
                role: "Livreurs",
                value: stats.totalLivreurs,
                color: "bg-blue-500",
              },
              {
                role: "Admins",
                value: stats.totalAdmins,
                color: "bg-purple-500",
              },
            ].map((item) => (
              <div key={item.role} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {item.role}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {item.value}
                  </span>
                </div>
                <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{
                      width: `${
                        stats.totalUsers > 0
                          ? (item.value / stats.totalUsers) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {stats.totalUsers > 0
                    ? Math.round((item.value / stats.totalUsers) * 100)
                    : 0}
                  % des utilisateurs
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Taux d'activité */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl">
          <h4 className="mb-4 text-lg font-semibold text-gray-900">
            Taux d'activité
          </h4>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Utilisateurs
                </span>
                <span className="font-semibold text-gray-900">
                  {stats.activeUsers}/{stats.totalUsers}
                </span>
              </div>
              <div className="h-3 overflow-hidden bg-gray-200 rounded-full">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${
                      stats.totalUsers > 0
                        ? (stats.activeUsers / stats.totalUsers) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {stats.totalUsers > 0
                  ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
                  : 0}
                % d'utilisateurs actifs
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Livreurs
                </span>
                <span className="font-semibold text-gray-900">
                  {stats.livreursActifs}/{stats.totalLivreurs}
                </span>
              </div>
              <div className="h-3 overflow-hidden bg-gray-200 rounded-full">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${
                      stats.totalLivreurs > 0
                        ? (stats.livreursActifs / stats.totalLivreurs) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {stats.totalLivreurs > 0
                  ? Math.round(
                      (stats.livreursActifs / stats.totalLivreurs) * 100,
                    )
                  : 0}
                % de livreurs actifs
              </p>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl">
          <h4 className="mb-4 text-lg font-semibold text-gray-900">
            Performance
          </h4>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Taux de livraison
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {stats.totalLivraisons > 0
                      ? Math.round(
                          (stats.livraisonsTerminees / stats.totalLivraisons) *
                            100,
                        )
                      : 0}
                    %
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaCheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {stats.livraisonsTerminees} livraisons réussies
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">En cours</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {stats.livraisonsEnCours}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FaClock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Livraisons actuellement en traitement
              </p>
            </div>

            <div className="flex items-center justify-between p-3 text-sm bg-blue-50 rounded-xl">
              <span className="font-medium text-gray-700">Temps moyen</span>
              <span className="font-semibold text-blue-600">24-48h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé */}
      <div className="p-6 mt-8 bg-white border border-gray-200 rounded-xl">
        <h4 className="mb-4 text-lg font-semibold text-gray-900">
          Résumé du tableau de bord
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Total transactions
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalLivraisons}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Valeur totale</p>
            <p className="text-2xl font-bold text-gray-900">N/A</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">
              Satisfaction client
            </p>
            <p className="text-2xl font-bold text-gray-900">N/A</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">
              Nouveaux utilisateurs (7j)
            </p>
            <p className="text-2xl font-bold text-gray-900">N/A</p>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Dashboard Tawssil • Mis à jour automatiquement
        </p>
        {lastUpdate && (
          <p className="mt-1 text-xs text-gray-400">
            Dernière mise à jour: {formatDate(lastUpdate)}
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
