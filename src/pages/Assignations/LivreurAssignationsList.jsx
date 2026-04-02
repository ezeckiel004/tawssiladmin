// ==================== PROJET ADMIN ====================
// src/pages/Assignations/LivreurAssignationsList.jsx

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FaPlus,
  FaTrash,
  FaEye,
  FaPowerOff,
  FaSearch,
  FaUser,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTimes,
  FaCheckCircle,
  FaTruck,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaUserCircle,
  FaExchangeAlt,
  FaClock,
  FaInfoCircle,  // <-- AJOUT DE CET IMPORT MANQUANT
} from "react-icons/fa";
import livreurAssignationService from "../../services/livreurAssignationService";
import gestionnaireService from "../../services/gestionnaireService";
import livreurService from "../../services/livreurService";

const LivreurAssignationsList = () => {
  const [assignations, setAssignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAssignation, setSelectedAssignation] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    wilaya_cible: "",
  });
  
  // Formulaire de création
  const [formData, setFormData] = useState({
    livreur_id: "",
    gestionnaire_id: "",
    date_debut: new Date().toISOString().split("T")[0],
    date_fin: "",
    motif: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Listes réelles depuis le backend
  const [gestionnaires, setGestionnaires] = useState([]);
  const [tousLivreurs, setTousLivreurs] = useState([]);
  const [selectedGestionnaire, setSelectedGestionnaire] = useState("");
  const [livreursDisponibles, setLivreursDisponibles] = useState([]);
  const [loadingLivreurs, setLoadingLivreurs] = useState(false);

  useEffect(() => {
    fetchAssignations();
    fetchGestionnaires();
    fetchAllLivreurs();
  }, [filters]);

  // Récupérer tous les livreurs depuis le backend
  const fetchAllLivreurs = async () => {
    try {
      setLoadingLivreurs(true);
      const data = await livreurService.getAllLivreurs();
      const transformed = livreurService.transformLivreurs(data);
      setTousLivreurs(transformed);
      console.log("📦 Tous les livreurs chargés:", transformed.length);
      transformed.forEach(l => {
        console.log(`  - ${l.fullName}: wilaya_id = ${l.wilaya_id}, type = ${l.type}`);
      });
    } catch (error) {
      console.error("Erreur chargement livreurs:", error);
      toast.error("Erreur lors du chargement des livreurs");
    } finally {
      setLoadingLivreurs(false);
    }
  };

  const fetchAssignations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.wilaya_cible) params.wilaya_cible = filters.wilaya_cible;
      
      const data = await livreurAssignationService.getAllAssignations(params);
      setAssignations(data.map(a => livreurAssignationService.formatAssignation(a)));
    } catch (error) {
      toast.error("Erreur lors du chargement des assignations");
    } finally {
      setLoading(false);
    }
  };

  const fetchGestionnaires = async () => {
    try {
      const data = await gestionnaireService.getAllGestionnaires({ status: "active" });
      setGestionnaires(gestionnaireService.transformGestionnaires(data));
    } catch (error) {
      console.error("Erreur chargement gestionnaires:", error);
    }
  };

  // Filtrer les livreurs disponibles pour un gestionnaire
  const getLivreursDisponiblesPourGestionnaire = (gestionnaireId) => {
    if (!gestionnaireId || !tousLivreurs.length) return [];
    
    const gestionnaire = gestionnaires.find(g => g.id === gestionnaireId);
    if (!gestionnaire) return [];
    
    const wilayaGestionnaire = gestionnaire.wilaya_id;
    
    // Récupérer les IDs des livreurs déjà assignés activement à ce gestionnaire
    const assignationsExistantes = assignations.filter(
      a => a.gestionnaire_id === gestionnaireId && a.status === 'active'
    );
    const livreursDejaAssignesIds = assignationsExistantes.map(a => a.livreur_id);
    
    // Filtrer les livreurs disponibles
    const disponibles = tousLivreurs.filter(livreur => {
      // Si le livreur est natif de la wilaya, il est toujours disponible
      if (livreur.wilaya_id === wilayaGestionnaire) {
        return true;
      }
      // Sinon, il est disponible s'il n'est pas déjà assigné à ce gestionnaire
      return !livreursDejaAssignesIds.includes(livreur.id);
    });
    
    return disponibles;
  };

  const handleGestionnaireChange = (gestionnaireId) => {
    setSelectedGestionnaire(gestionnaireId);
    setFormData({ ...formData, gestionnaire_id: gestionnaireId, livreur_id: "" });
    
    const disponibles = getLivreursDisponiblesPourGestionnaire(gestionnaireId);
    setLivreursDisponibles(disponibles);
  };

  const handleCreateAssignation = async (e) => {
    e.preventDefault();
    
    if (!formData.livreur_id || !formData.gestionnaire_id || !formData.date_debut) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await livreurAssignationService.createAssignation(formData);
      if (response.success) {
        toast.success("Assignation créée avec succès");
        setShowCreateModal(false);
        resetForm();
        fetchAssignations();
        fetchAllLivreurs();
      } else {
        toast.error(response.message || "Erreur lors de la création");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTerminerAssignation = async (assignation) => {
    if (!window.confirm(`Voulez-vous vraiment terminer l'assignation du livreur ${assignation.livreur_nom} ?`)) {
      return;
    }
    
    try {
      const response = await livreurAssignationService.terminerAssignation(assignation.id);
      if (response.success) {
        toast.success("Assignation terminée avec succès");
        fetchAssignations();
        fetchAllLivreurs();
      } else {
        toast.error(response.message || "Erreur lors de la fin de l'assignation");
      }
    } catch (error) {
      toast.error("Erreur lors de la fin de l'assignation");
    }
  };

  const handleDeleteAssignation = async (assignation) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer l'assignation du livreur ${assignation.livreur_nom} ? Cette action est irréversible.`)) {
      return;
    }
    
    try {
      const response = await livreurAssignationService.deleteAssignation(assignation.id);
      if (response.success) {
        toast.success("Assignation supprimée avec succès");
        fetchAssignations();
        fetchAllLivreurs();
      } else {
        toast.error(response.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({
      livreur_id: "",
      gestionnaire_id: "",
      date_debut: new Date().toISOString().split("T")[0],
      date_fin: "",
      motif: "",
    });
    setSelectedGestionnaire("");
    setLivreursDisponibles([]);
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { color: "bg-green-100 text-green-800", label: "Active", icon: <FaCheckCircle className="w-3 h-3 mr-1" /> },
      terminee: { color: "bg-gray-100 text-gray-800", label: "Terminée", icon: <FaClock className="w-3 h-3 mr-1" /> },
      annulee: { color: "bg-red-100 text-red-800", label: "Annulée", icon: <FaTimes className="w-3 h-3 mr-1" /> },
    };
    const c = config[status] || config.terminee;
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${c.color}`}>
        {c.icon}
        {c.label}
      </span>
    );
  };

  // Obtenir le libellé du type de livreur
  const getTypeLabel = (type) => {
    return type === "distributeur" ? "Distributeur" : "Ramasseur";
  };

  // Obtenir la couleur du badge de type
  const getTypeColor = (type) => {
    return type === "distributeur" 
      ? "bg-blue-100 text-blue-800" 
      : "bg-orange-100 text-orange-800";
  };

  // Obtenir le nom de la wilaya à partir du code
  const getWilayaNom = (code) => {
    const wilayas = {
      "01": "Adrar", "02": "Chlef", "03": "Laghouat", "04": "Oum El Bouaghi",
      "05": "Batna", "06": "Béjaïa", "07": "Biskra", "08": "Béchar",
      "09": "Blida", "10": "Bouira", "11": "Tamanrasset", "12": "Tébessa",
      "13": "Tlemcen", "14": "Tiaret", "15": "Tizi Ouzou", "16": "Alger",
      "17": "Djelfa", "18": "Jijel", "19": "Sétif", "20": "Saïda",
      "21": "Skikda", "22": "Sidi Bel Abbès", "23": "Annaba", "24": "Guelma",
      "25": "Constantine", "26": "Médéa", "27": "Mostaganem", "28": "M'Sila",
      "29": "Mascara", "30": "Ouargla", "31": "Oran", "32": "El Bayadh",
      "33": "Illizi", "34": "Bordj Bou Arréridj", "35": "Boumerdès",
      "36": "El Tarf", "37": "Tindouf", "38": "Tissemsilt", "39": "El Oued",
      "40": "Khenchela", "41": "Souk Ahras", "42": "Tipaza", "43": "Mila",
      "44": "Aïn Defla", "45": "Naâma", "46": "Aïn Témouchent", "47": "Ghardaïa",
      "48": "Relizane", "49": "Timimoun", "50": "Bordj Badji Mokhtar",
      "51": "Ouled Djellal", "52": "Béni Abbès", "53": "In Salah",
      "54": "In Guezzam", "55": "Touggourt", "56": "Djanet",
      "57": "El M'Ghair", "58": "El Meniaa"
    };
    return wilayas[code] || code;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignations des livreurs</h1>
          <p className="text-gray-600">
            Gérez les assignations temporaires de livreurs vers d'autres wilayas
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
        >
          <FaPlus /> Nouvelle assignation
        </button>
      </div>

      {/* Filtres */}
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Active</option>
              <option value="terminee">Terminée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Wilaya cible</label>
            <input
              type="text"
              placeholder="Code wilaya (ex: 16)"
              value={filters.wilaya_cible}
              onChange={(e) => setFilters({ ...filters, wilaya_cible: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={fetchAssignations}
              className="px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
            >
              <FaSearch />
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Total assignations</p>
          <p className="text-2xl font-bold text-gray-900">{assignations.length}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Actives</p>
          <p className="text-2xl font-bold text-green-600">
            {assignations.filter(a => a.status === 'active').length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Terminées</p>
          <p className="text-2xl font-bold text-gray-600">
            {assignations.filter(a => a.status === 'terminee').length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Total livreurs</p>
          <p className="text-2xl font-bold text-blue-600">{tousLivreurs.length}</p>
        </div>
      </div>

      {/* Tableau des assignations */}
      <div className="overflow-hidden bg-white shadow rounded-xl">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
            <p className="mt-4 text-gray-600">Chargement des assignations...</p>
          </div>
        ) : assignations.length === 0 ? (
          <div className="p-8 text-center">
            <FaExchangeAlt className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-2 text-gray-500">Aucune assignation trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Livreur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wilaya native</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gestionnaire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wilaya cible</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assignations.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <FaUserCircle className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{a.livreur_nom}</p>
                          <p className="text-xs text-gray-500">ID: {a.livreur_id?.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <FaMapMarkerAlt className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {getWilayaNom(a.livreur_wilaya)} ({a.livreur_wilaya})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{a.gestionnaire_nom}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {getWilayaNom(a.wilaya_cible)} ({a.wilaya_cible})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="flex items-center gap-1">
                          <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                          {new Date(a.date_debut).toLocaleDateString()}
                        </p>
                        {a.date_fin && (
                          <p className="text-gray-500 text-xs mt-1">
                            → {new Date(a.date_fin).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(a.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAssignation(a);
                            setShowDetailModal(true);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-900"
                          title="Voir détails"
                        >
                          <FaEye />
                        </button>
                        {a.status === 'active' && (
                          <button
                            onClick={() => handleTerminerAssignation(a)}
                            className="p-1 text-yellow-600 hover:text-yellow-900"
                            title="Terminer"
                          >
                            <FaPowerOff />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAssignation(a)}
                          className="p-1 text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
          <div className="relative w-full max-w-2xl p-6 mx-auto bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Nouvelle assignation</h3>
                <p className="text-sm text-gray-600">Assigner un livreur à un gestionnaire</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateAssignation} className="space-y-6">
              {/* Sélection du gestionnaire */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  <FaUser className="inline mr-2 w-4 h-4" />
                  Gestionnaire cible *
                </label>
                <select
                  value={formData.gestionnaire_id}
                  onChange={(e) => handleGestionnaireChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Sélectionner un gestionnaire</option>
                  {gestionnaires.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.fullName} - {getWilayaNom(g.wilaya_id)} ({g.wilaya_id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sélection du livreur */}
              {selectedGestionnaire && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    <FaTruck className="inline mr-2 w-4 h-4" />
                    Livreur à assigner *
                  </label>
                  
                  {loadingLivreurs ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary-600"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500 mb-3">
                        {livreursDisponibles.length} livreur(s) disponible(s) sur {tousLivreurs.length} au total
                      </p>
                      
                      <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                        {livreursDisponibles.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <FaTruck className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                            Aucun livreur disponible pour assignation
                          </div>
                        ) : (
                          livreursDisponibles.map(livreur => {
                            const gestionnaire = gestionnaires.find(g => g.id === selectedGestionnaire);
                            const estNatif = livreur.wilaya_id === gestionnaire?.wilaya_id;
                            const wilayaNom = getWilayaNom(livreur.wilaya_id);
                            
                            return (
                              <label
                                key={livreur.id}
                                className={`flex items-start p-4 cursor-pointer hover:bg-gray-50 transition ${
                                  formData.livreur_id === livreur.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="livreur"
                                  value={livreur.id}
                                  checked={formData.livreur_id === livreur.id}
                                  onChange={(e) => setFormData({ ...formData, livreur_id: e.target.value })}
                                  className="mt-1 mr-3"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center flex-wrap gap-2">
                                    <p className="font-medium text-gray-900">{livreur.fullName}</p>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(livreur.type)}`}>
                                      {getTypeLabel(livreur.type)}
                                    </span>
                                    {estNatif && (
                                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                                        Natif
                                      </span>
                                    )}
                                    {livreur.desactiver && (
                                      <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                                        Inactif
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <FaEnvelope className="w-3 h-3 text-gray-400" />
                                      <span>{livreur.email || "Email non renseigné"}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <FaPhone className="w-3 h-3 text-gray-400" />
                                      <span>{livreur.telephone || "Tél non renseigné"}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <FaMapMarkerAlt className="w-3 h-3 text-gray-400" />
                                      <span>
                                        Wilaya native: {wilayaNom} ({livreur.wilaya_id || "?"})
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <FaIdCard className="w-3 h-3 text-gray-400" />
                                      <span>ID: {livreur.id?.substring(0, 8)}</span>
                                    </div>
                                  </div>
                                </div>
                              </label>
                            );
                          })
                        )}
                      </div>
                      
                      {livreursDisponibles.length > 0 && (
                        <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                          <FaInfoCircle className="w-3 h-3" />
                          Les livreurs natifs de la wilaya sont toujours disponibles. 
                          Les livreurs d'autres wilayas ne peuvent être assignés qu'une seule fois.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    <FaCalendarAlt className="inline mr-2 w-4 h-4" />
                    Date de début *
                  </label>
                  <input
                    type="date"
                    value={formData.date_debut}
                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    <FaCalendarAlt className="inline mr-2 w-4 h-4" />
                    Date de fin (optionnelle)
                  </label>
                  <input
                    type="date"
                    value={formData.date_fin}
                    min={formData.date_debut}
                    onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Motif */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Motif (optionnel)
                </label>
                <textarea
                  value={formData.motif}
                  onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Raison de l'assignation..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.livreur_id || !formData.gestionnaire_id}
                  className="px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <FaExchangeAlt /> Créer l'assignation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showDetailModal && selectedAssignation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Détails de l'assignation</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <FaUser className="w-4 h-4" /> Livreur
                </p>
                <p className="font-medium text-lg">{selectedAssignation.livreur_nom}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <p><span className="text-gray-500">ID:</span> {selectedAssignation.livreur_id}</p>
                  <p><span className="text-gray-500">Wilaya native:</span> {getWilayaNom(selectedAssignation.livreur_wilaya)} ({selectedAssignation.livreur_wilaya})</p>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <FaUser className="w-4 h-4" /> Gestionnaire
                </p>
                <p className="font-medium">{selectedAssignation.gestionnaire_nom}</p>
                <p className="text-sm mt-1">Wilaya cible: {getWilayaNom(selectedAssignation.wilaya_cible)} ({selectedAssignation.wilaya_cible})</p>
              </div>
              
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <FaCalendarAlt className="w-4 h-4" /> Période
                </p>
                <div className="mt-1">
                  <p>Début: {new Date(selectedAssignation.date_debut).toLocaleDateString()}</p>
                  {selectedAssignation.date_fin && (
                    <p>Fin: {new Date(selectedAssignation.date_fin).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              
              {selectedAssignation.motif && (
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">Motif</p>
                  <p className="mt-1">{selectedAssignation.motif}</p>
                </div>
              )}
              
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Informations</p>
                <div className="mt-1 space-y-1">
                  <p>Statut: {getStatusBadge(selectedAssignation.status)}</p>
                  <p>Créé par: {selectedAssignation.createur_nom || "Admin"}</p>
                  <p>Créé le: {new Date(selectedAssignation.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
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

export default LivreurAssignationsList;