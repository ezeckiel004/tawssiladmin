import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaArrowLeft,
  FaUser,
  FaTruck,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaIdCard,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaTrash,
  FaShippingFast,
  FaBoxOpen,
  FaChartLine,
  FaHandPaper,
  FaMotorcycle,
  FaCar,
  FaTruckLoading,
} from "react-icons/fa";
import api from "../../services/api";

const LivreurDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [livreur, setLivreur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_courses: 0,
    courses_livrees: 0,
    courses_en_cours: 0,
    taux_reussite: 0,
    total_colis: 0,
  });
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchLivreurDetails();
  }, [id]);

  // Nouvelle fonction : récupérer le type depuis l'API livreurs
  const fetchLivreurType = async () => {
    try {
      // Récupérer tous les livreurs pour trouver le type
      const response = await api.get("/livreurs");
      if (response.data?.success && Array.isArray(response.data.data)) {
        const livreurComplet = response.data.data.find(
          (l) => l.id === id || (l.user && l.user.id === id),
        );

        if (livreurComplet) {
          return livreurComplet.type || "distributeur"; // Par défaut distributeur
        }
      }
      return "distributeur"; // Type par défaut
    } catch (error) {
      console.error("Erreur récupération type:", error);
      return "distributeur";
    }
  };

  const fetchLivreurDetails = async () => {
    try {
      setLoading(true);

      // Récupérer les détails du livreur
      const response = await api.get(`/livreurs/${id}`);

      if (!response.data || !response.data.success) {
        toast.error("Livreur non trouvé");
        return;
      }

      const user = response.data.data?.livreur || {};
      const demandeAdhesion = response.data.data?.demande_adhesions || null;
      const desactiver = response.data.data?.desactiver || false;

      // Récupérer le type depuis l'API livreurs
      const type = await fetchLivreurType();

      const fullName =
        user.nom && user.prenom
          ? `${user.prenom} ${user.nom}`.trim()
          : user.nom || user.prenom || "Nom inconnu";

      const formattedData = {
        id: id,
        user: user,
        type: type, // Utiliser le type récupéré
        desactiver: desactiver,
        demandeAdhesion: demandeAdhesion,
        nom: user.nom || "",
        prenom: user.prenom || "",
        telephone: user.telephone || "",
        email: user.email || "",
        photo_url: user.photo_url || null,
        actif: user.actif !== undefined ? user.actif : true,
        created_at: user.created_at,
        updated_at: user.updated_at,
        fullName: fullName,
      };

      setLivreur(formattedData);

      // Récupérer les statistiques et courses
      await Promise.all([fetchLivreurStatistics(), fetchLivreurCourses()]);
    } catch (error) {
      toast.error("Erreur lors du chargement des détails du livreur");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLivreurStatistics = async () => {
    try {
      const response = await api.get(`/livraisons/getByLivreur/${id}`);

      const allCourses = response.data?.success
        ? response.data.data
        : response.data || [];

      const totalCourses = allCourses.length;
      const coursesLivrees = allCourses.filter(
        (course) => course.status === "livre" || course.status === "livré",
      ).length;
      const coursesEnCours = allCourses.filter(
        (course) =>
          !["livre", "livré", "annule", "annulé"].includes(course.status),
      ).length;

      const tauxReussite =
        totalCourses > 0
          ? Math.round((coursesLivrees / totalCourses) * 100)
          : 0;

      const newStats = {
        total_courses: totalCourses,
        courses_livrees: coursesLivrees,
        courses_en_cours: coursesEnCours,
        taux_reussite: tauxReussite,
        total_colis: allCourses.length,
      };

      setStats(newStats);
    } catch (error) {
      console.error("Erreur dans fetchLivreurStatistics:", error);
    }
  };

  const fetchLivreurCourses = async () => {
    try {
      const response = await api.get(`/livraisons/getByLivreur/${id}`);
      const coursesData = response.data?.success
        ? response.data.data
        : response.data || [];
      setCourses(coursesData);
    } catch (error) {
      console.error("Erreur dans fetchLivreurCourses:", error);
      setCourses([]);
    }
  };

  const handleToggleActivation = async () => {
    if (!livreur) return;

    try {
      const newStatus = !livreur.desactiver;

      const response = await api.patch(`/livreurs/${id}/toggle-activation`, {
        desactiver: newStatus,
      });

      if (response.data?.success) {
        setLivreur((prev) => ({ ...prev, desactiver: newStatus }));
        toast.success(
          `Livreur ${newStatus ? "désactivé" : "activé"} avec succès`,
        );
      } else {
        toast.error("Erreur lors de la mise à jour du statut");
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce livreur ? Cette action est irréversible.",
      )
    ) {
      try {
        const response = await api.delete(`/livreurs/${id}`);

        if (response.data?.success) {
          toast.success("Livreur supprimé avec succès");
          navigate("/livreurs");
        } else {
          toast.error("Erreur lors de la suppression");
        }
      } catch (error) {
        toast.error("Erreur lors de la suppression");
        console.error(error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      en_attente: {
        color: "bg-yellow-100 text-yellow-800",
        label: "En attente",
      },
      "en attente": {
        color: "bg-yellow-100 text-yellow-800",
        label: "En attente",
      },
      prise_en_charge_ramassage: {
        color: "bg-blue-100 text-blue-800",
        label: "Prise en charge",
      },
      ramasse: { color: "bg-green-100 text-green-800", label: "Ramasse" },
      en_transit: {
        color: "bg-purple-100 text-purple-800",
        label: "En transit",
      },
      "en transit": {
        color: "bg-purple-100 text-purple-800",
        label: "En transit",
      },
      prise_en_charge_livraison: {
        color: "bg-indigo-100 text-indigo-800",
        label: "En livraison",
      },
      livre: { color: "bg-green-100 text-green-800", label: "Livré" },
      livré: { color: "bg-green-100 text-green-800", label: "Livré" },
      annule: { color: "bg-red-100 text-red-800", label: "Annulé" },
      annulé: { color: "bg-red-100 text-red-800", label: "Annulé" },
      reporte: { color: "bg-orange-100 text-orange-800", label: "Reporté" },
      incident: { color: "bg-red-100 text-red-800", label: "Incident" },
    };

    return (
      statusConfig[status] || {
        color: "bg-gray-100 text-gray-800",
        label: status || "Inconnu",
      }
    );
  };

  // Fonction pour obtenir les détails du type de livreur
  const getLivreurTypeDetails = (type) => {
    const types = {
      distributeur: {
        label: "Distributeur",
        description: "Livraison des colis aux destinataires finaux",
        icon: <FaTruck className="w-5 h-5 text-blue-600" />,
        color: "bg-blue-100 text-blue-800 border-blue-300",
        fullColor: "bg-blue-50",
        iconBg: "bg-blue-200",
      },
      ramasseur: {
        label: "Ramasseur",
        description: "Collecte des colis chez les expéditeurs",
        icon: <FaHandPaper className="w-5 h-5 text-orange-600" />,
        color: "bg-orange-100 text-orange-800 border-orange-300",
        fullColor: "bg-orange-50",
        iconBg: "bg-orange-200",
      },
    };

    return types[type] || types.distributeur; // Par défaut distributeur
  };

  const getVehicleIcon = (vehiculeType) => {
    if (!vehiculeType) return null;

    const vehicleIcons = {
      moto: <FaMotorcycle className="w-4 h-4" />,
      "moto 125cc": <FaMotorcycle className="w-4 h-4" />,
      "moto 250cc": <FaMotorcycle className="w-4 h-4" />,
      voiture: <FaCar className="w-4 h-4" />,
      camionnette: <FaTruck className="w-4 h-4" />,
      camion: <FaTruck className="w-4 h-4" />,
      utilitaire: <FaTruck className="w-4 h-4" />,
    };

    const normalizedType = vehiculeType.toLowerCase();
    return vehicleIcons[normalizedType] || <FaCar className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary-600"></div>
        <p className="mt-4 text-gray-600">
          Chargement des détails du livreur...
        </p>
      </div>
    );
  }

  if (!livreur) {
    return (
      <div className="py-12 text-center">
        <FaUser className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="mb-2 text-xl font-semibold text-gray-700">
          Livreur non trouvé
        </h2>
        <p className="mb-6 text-gray-500">
          Le livreur avec l'ID {id} n'existe pas ou a été supprimé.
        </p>
        <button
          onClick={() => navigate("/livreurs")}
          className="inline-flex items-center gap-2 px-6 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
        >
          <FaArrowLeft /> Retour à la liste
        </button>
      </div>
    );
  }

  const user = livreur.user || {};
  const fullName = livreur.fullName || "Nom inconnu";
  const email = livreur.email || user.email || "Non renseigné";
  const telephone = livreur.telephone || user.telephone || "Non renseigné";
  const photoUrl = livreur.photo_url || user.photo_url;
  const createdAt = livreur.created_at || user.created_at;
  const type = livreur.type || "distributeur";

  const typeDetails = getLivreurTypeDetails(type);
  const vehiculeInfo = livreur.demandeAdhesion?.vehicule_type || null;
  const vehicleIcon = vehiculeInfo ? getVehicleIcon(vehiculeInfo) : null;
  const cinNumber = livreur.demandeAdhesion?.id_card_number || null;

  return (
    <div className="space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/livreurs")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft /> Retour
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/livreurs/${id}/modifier`)}
            className="flex items-center gap-2 px-4 py-2 text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200"
          >
            <FaEdit /> Modifier
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
          >
            <FaTrash /> Supprimer
          </button>
        </div>
      </div>

      <div className="overflow-hidden bg-white shadow rounded-xl">
        <div className="p-6 bg-gradient-to-r from-primary-50 to-blue-50">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-20 h-20 bg-white border-4 border-white rounded-full shadow">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={fullName}
                    className="object-cover w-full h-full rounded-full"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `
                        <div class="h-full w-full bg-primary-100 rounded-full flex items-center justify-center">
                          <svg class="h-10 w-10 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full rounded-full bg-primary-100">
                    <FaUser className="w-10 h-10 text-primary-600" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${typeDetails.color} border flex items-center gap-2`}
                  >
                    {typeDetails.icon}
                    <span>{typeDetails.label}</span>
                  </div>
                  {vehicleIcon && (
                    <div className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-300 flex items-center gap-2">
                      {vehicleIcon}
                      <span>{vehiculeInfo}</span>
                    </div>
                  )}
                  <button
                    onClick={handleToggleActivation}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${
                      !livreur.desactiver
                        ? "bg-green-100 text-green-800 hover:bg-green-200 border border-green-300"
                        : "bg-red-100 text-red-800 hover:bg-red-200 border border-red-300"
                    }`}
                  >
                    {!livreur.desactiver ? (
                      <>
                        <FaCheckCircle className="h-3.5 w-3.5" /> Actif
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="h-3.5 w-3.5" /> Inactif
                      </>
                    )}
                  </button>
                </div>
                {typeDetails.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {typeDetails.description}
                  </p>
                )}
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center gap-1 md:justify-end">
                <FaChartLine className="w-6 h-6 text-primary-600" />
                <span className="ml-2 text-lg font-semibold text-gray-900">
                  {stats.taux_reussite}%
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">Taux de réussite</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      <FaEnvelope className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900 break-all">
                        {email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                      <FaPhone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="font-medium text-gray-900">{telephone}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                      <FaIdCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Carte d'identité</p>
                      <p className="font-medium text-gray-900">
                        {cinNumber || "Non renseignée"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg">
                      <FaCalendarAlt className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Membre depuis</p>
                      <p className="font-medium text-gray-900">
                        {createdAt
                          ? new Date(createdAt).toLocaleDateString("fr-FR")
                          : "Date inconnue"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`${typeDetails.fullColor} border ${typeDetails.color.split(" ")[2]} rounded-lg p-6`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`h-12 w-12 ${typeDetails.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    {typeDetails.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      Rôle et responsabilités
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {type === "distributeur" && (
                        <>
                          <li className="flex items-start gap-2">
                            <FaCheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>
                              Assigne uniquement aux livraisons de distribution
                              (livreur_distributeur_id)
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <FaCheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>
                              Livraison des colis aux destinataires finaux
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <FaCheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>
                              Gestion des preuves de livraison et contact avec
                              clients
                            </span>
                          </li>
                        </>
                      )}
                      {type === "ramasseur" && (
                        <>
                          <li className="flex items-start gap-2">
                            <FaCheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>
                              Assigne uniquement aux collectes
                              (livreur_ramasseur_id)
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <FaCheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Collecte des colis chez les expéditeurs</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <FaCheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>
                              Vérification des documents et transport vers
                              centre de tri
                            </span>
                          </li>
                        </>
                      )}
                      {vehiculeInfo && (
                        <li className="flex items-start gap-2">
                          <FaCheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>
                            Véhicule utilisé :{" "}
                            <span className="font-medium">{vehiculeInfo}</span>
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border border-gray-200 rounded-lg">
                <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
                  <FaShippingFast className="w-5 h-5 text-primary-600" />
                  Statistiques de livraison
                </h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="p-4 text-center rounded-lg bg-blue-50">
                    <p className="text-2xl font-bold text-blue-700">
                      {stats.total_courses}
                    </p>
                    <p className="text-sm text-blue-600">Total courses</p>
                  </div>
                  <div className="p-4 text-center rounded-lg bg-green-50">
                    <p className="text-2xl font-bold text-green-700">
                      {stats.courses_livrees}
                    </p>
                    <p className="text-sm text-green-600">Livrées</p>
                  </div>
                  <div className="p-4 text-center rounded-lg bg-yellow-50">
                    <p className="text-2xl font-bold text-yellow-700">
                      {stats.courses_en_cours}
                    </p>
                    <p className="text-sm text-yellow-600">En cours</p>
                  </div>
                  <div className="p-4 text-center rounded-lg bg-purple-50">
                    <p className="text-2xl font-bold text-purple-700">
                      {stats.taux_reussite}%
                    </p>
                    <p className="text-sm text-purple-600">Taux réussite</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    {stats.total_colis} colis traités
                  </p>
                </div>
              </div>

              {courses.length > 0 ? (
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
                    <FaBoxOpen className="w-5 h-5 text-primary-600" />
                    Dernières courses
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                            ID
                          </th>
                          <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                            Statut
                          </th>
                          <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {courses.slice(0, 5).map((course, index) => {
                          const statusBadge = getStatusBadge(course.status);
                          return (
                            <tr key={course.id || index}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                #{course.id || "N/A"}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}
                                >
                                  {statusBadge.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {course.created_at
                                  ? new Date(
                                      course.created_at,
                                    ).toLocaleDateString("fr-FR")
                                  : "Date inconnue"}
                              </td>
                              <td className="px-4 py-3">
                                {course.id && (
                                  <button
                                    onClick={() =>
                                      navigate(`/livraisons/${course.id}`)
                                    }
                                    className="text-sm text-primary-600 hover:text-primary-900"
                                  >
                                    Voir détails
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {courses.length > 5 && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => navigate(`/livraisons?livreur=${id}`)}
                        className="text-sm text-primary-600 hover:text-primary-900"
                      >
                        Voir toutes les courses ({courses.length})
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center bg-white border border-gray-200 rounded-lg">
                  <FaBoxOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">
                    Aucune course enregistrée pour ce livreur
                  </p>
                </div>
              )}
            </div>

            {/* <div className="space-y-6">
              <div className="p-6 bg-white border border-gray-200 rounded-lg">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Actions rapides
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() =>
                      navigate(`/livraisons/nouveau?livreur=${id}`)
                    }
                    className="flex items-center justify-center w-full gap-2 px-4 py-3 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100"
                  >
                    <FaShippingFast /> Assigner une livraison
                  </button>
                  {telephone !== "Non renseigné" && telephone !== "N/A" && (
                    <a
                      href={`tel:${telephone}`}
                      className="flex items-center justify-center w-full gap-2 px-4 py-3 text-green-700 rounded-lg bg-green-50 hover:bg-green-100"
                    >
                      <FaPhone /> Appeler
                    </a>
                  )}
                  {email !== "Non renseigné" && email !== "N/A" && (
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center justify-center w-full gap-2 px-4 py-3 text-blue-700 rounded-lg bg-blue-50 hover:bg-blue-100"
                    >
                      <FaEnvelope /> Envoyer email
                    </a>
                  )}
                  <button
                    onClick={() => navigate(`/livreurs/${id}/statistiques`)}
                    className="flex items-center justify-center w-full gap-2 px-4 py-3 text-purple-700 rounded-lg bg-purple-50 hover:bg-purple-100"
                  >
                    <FaChartLine /> Statistiques détaillées
                  </button>
                </div>
              </div>

              <div className="p-6 bg-white border border-gray-200 rounded-lg">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Informations
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Type de livreur</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${typeDetails.color.split(" ")[0]} ${typeDetails.color.split(" ")[1]}`}
                      >
                        {typeDetails.label}
                      </span>
                      {vehicleIcon && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          {vehicleIcon}
                          <span>{vehiculeInfo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Statut actuel</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          !livreur.desactiver
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {!livreur.desactiver ? "Actif" : "Inactif"}
                      </span>
                      {livreur.demandeAdhesion?.status === "approved" && (
                        <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                          Validé
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ID dans le système</p>
                    <p className="font-mono text-sm font-medium text-gray-900">
                      {livreur.id || id}
                    </p>
                  </div>
                  {cinNumber && (
                    <div>
                      <p className="text-sm text-gray-600">Carte d'identité</p>
                      <p className="font-medium text-gray-900">{cinNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivreurDetail;
