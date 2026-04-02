// src/pages/Navettes/NavetteDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import navetteService from "../../services/navetteService";
import comptabiliteService from "../../services/comptabiliteService";
import {
  FaArrowLeft, FaTruck, FaMapMarkerAlt, FaCalendarAlt, FaBuilding, FaBoxes,
  FaClock, FaCheckCircle, FaTimesCircle, FaSpinner, FaEdit, FaTrash,
  FaPlay, FaStop, FaBan, FaPlus, FaMinus, FaWeightHanging, FaMoneyBillWave,
  FaRoad, FaGasPump, FaTachometerAlt, FaPercentage, FaDownload, FaQrcode,
  FaUsers, FaUserTie, FaChartLine
} from "react-icons/fa";
import NavetteLivraisonList from "./components/NavetteLivraisonList";

// Fonction utilitaire pour extraire le code d'une wilaya
const getWilayaCode = (item) => {
  if (!item) return null;
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item.code) return item.code;
  return null;
};

const NavetteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [navette, setNavette] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddLivraisonModal, setShowAddLivraisonModal] = useState(false);
  const [livraisonsDisponibles, setLivraisonsDisponibles] = useState([]);
  const [selectedLivraisons, setSelectedLivraisons] = useState([]);
  const [loadingLivraisons, setLoadingLivraisons] = useState(false);

  useEffect(() => {
    fetchNavette();
  }, [id]);

  const fetchNavette = async () => {
    try {
      setLoading(true);
      const response = await navetteService.getNavetteById(id);
      setNavette(response.data);
    } catch (error) {
      console.error("Erreur chargement navette:", error);
      toast.error("Erreur lors du chargement de la navette");
      navigate("/navettes");
    } finally {
      setLoading(false);
    }
  };

  const fetchLivraisonsDisponibles = async () => {
    try {
      setLoadingLivraisons(true);
      const response = await navetteService.getLivraisonsDisponibles({
        wilaya_depart: navette?.wilaya_depart_id,
        non_assignees: true
      });
      let livraisons = response.data?.data || response.data || [];
      
      const existingIds = navette?.livraisons?.map(l => l.id) || [];
      livraisons = livraisons.filter(l => !existingIds.includes(l.id));
      
      setLivraisonsDisponibles(livraisons);
    } catch (error) {
      console.error("Erreur chargement livraisons:", error);
      toast.error("Erreur lors du chargement des livraisons disponibles");
    } finally {
      setLoadingLivraisons(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      let response;
      switch (newStatus) {
        case "en_cours":
          response = await navetteService.demarrerNavette(id);
          toast.success(response.message || "Navette démarrée");
          break;
        case "terminee":
          response = await navetteService.terminerNavette(id);
          toast.success(response.message || "Navette terminée");
          break;
        case "annulee":
          response = await navetteService.annulerNavette(id);
          toast.success(response.message || "Navette annulée");
          break;
        default: return;
      }
      fetchNavette();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors du changement de statut");
    }
  };

  const handleAddLivraisons = async () => {
    if (selectedLivraisons.length === 0) {
      toast.error("Veuillez sélectionner au moins une livraison");
      return;
    }

    try {
      const response = await navetteService.ajouterLivraisons(id, selectedLivraisons);
      toast.success(response.message || "Livraisons ajoutées avec succès");
      setShowAddLivraisonModal(false);
      setSelectedLivraisons([]);
      fetchNavette();
    } catch (error) {
      console.error("Erreur ajout livraisons:", error);
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        let errorMsg = "Erreur de validation: ";
        if (errors["livraison_ids"]) errorMsg += errors["livraison_ids"].join(", ");
        else errorMsg = Object.values(errors).flat().join(", ");
        toast.error(errorMsg);
      } else {
        toast.error(error.response?.data?.message || "Erreur lors de l'ajout des livraisons");
      }
    }
  };

  const handleRemoveLivraison = async (livraisonId) => {
    if (!window.confirm("Retirer cette livraison de la navette ?")) return;

    try {
      const response = await navetteService.retirerLivraisons(id, [livraisonId]);
      toast.success(response.message || "Livraison retirée");
      fetchNavette();
    } catch (error) {
      toast.error("Erreur lors du retrait de la livraison");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette navette ?")) return;

    try {
      await navetteService.deleteNavette(id);
      toast.success("Navette supprimée avec succès");
      navigate("/navettes");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleExportPDF = async () => {
    try {
      await navetteService.exportPDF({ navette_id: id });
      toast.success("PDF généré avec succès");
    } catch (error) {
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  const handleViewGains = () => {
    navigate(`/comptabilite/navette/${id}/gains`);
  };

  const getStatusBadge = (status) => {
    const badges = {
      planifiee: { color: "bg-blue-100 text-blue-800", icon: FaClock, label: "Planifiée" },
      en_cours: { color: "bg-yellow-100 text-yellow-800", icon: FaSpinner, label: "En cours" },
      terminee: { color: "bg-green-100 text-green-800", icon: FaCheckCircle, label: "Terminée" },
      annulee: { color: "bg-red-100 text-red-800", icon: FaTimesCircle, label: "Annulée" },
    };
    return badges[status] || badges.planifiee;
  };

  // Fonction pour extraire les codes des wilayas de transit
  const getTransitCodes = () => {
    if (!navette?.wilayas_transit) return [];
    return navette.wilayas_transit.map(item => getWilayaCode(item)).filter(code => code);
  };

  // Construire la liste des étapes du trajet
  const buildEtapeList = () => {
    const etapes = [];
    if (!navette) return etapes;
    
    // Étape 1: Départ
    etapes.push({ 
      type: 'depart', 
      code: navette.wilaya_depart_id,
      time: navette.heure_depart
    });
    
    // Étapes: Wilayas de transit
    const transitCodes = getTransitCodes();
    transitCodes.forEach((code, idx) => {
      etapes.push({ 
        type: 'transit', 
        code: code,
        ordre: idx + 1
      });
    });
    
    // Étape finale: Arrivée
    etapes.push({ 
      type: 'arrivee', 
      code: navette.wilaya_arrivee_id,
      time: navette.heure_arrivee
    });
    
    return etapes;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!navette) return null;

  const status = getStatusBadge(navette.status);
  const StatusIcon = status.icon;
  const nbLivraisons = navette.nb_livraisons || navette.livraisons?.length || 0;
  const etapes = buildEtapeList();
  const totalEtapes = etapes.length;
  // Permettre l'ajout/retrait de livraisons pour planifiée ET en_cours
  const canEditLivraisons = ["planifiee", "en_cours"].includes(navette.status);
  // Permettre la modification des informations pour planifiée uniquement
  const canEditInfos = navette.status === "planifiee";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-6">
        <button onClick={() => navigate("/navettes")} className="flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-4">
          <FaArrowLeft /> Retour aux navettes
        </button>
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">Navette {navette.reference}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${status.color}`}>
                <StatusIcon className="w-4 h-4" /> {status.label}
              </span>
            </div>
            <p className="text-gray-600">Créée le {new Date(navette.created_at).toLocaleDateString("fr-FR")}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <FaDownload /> PDF
            </button>
            {/* Bouton Modifier - visible pour planifiée ET en_cours */}
            {canEditLivraisons && (
              <button onClick={() => navigate(`/navettes/edit/${id}`)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <FaEdit /> Modifier
              </button>
            )}
            {canEditInfos && (
              <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                <FaTrash /> Supprimer
              </button>
            )}
            {navette.status === "terminee" && (
              <button onClick={handleViewGains} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <FaChartLine /> Voir les gains
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      {navette.status === "planifiee" && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Actions rapides</h2>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => handleStatusChange("en_cours")} className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
              <FaPlay /> Démarrer la navette
            </button>
            <button onClick={() => handleStatusChange("annulee")} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <FaBan /> Annuler la navette
            </button>
          </div>
        </div>
      )}

      {navette.status === "en_cours" && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Actions rapides</h2>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => handleStatusChange("terminee")} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <FaStop /> Terminer la navette
            </button>
            <button onClick={() => handleStatusChange("annulee")} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <FaBan /> Annuler la navette
            </button>
          </div>
        </div>
      )}

      {/* Informations principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Carte trajet avec timeline */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="text-primary-600" /> Trajet
          </h2>
          
          {/* Timeline avec toutes les étapes */}
          <div className="relative mb-8">
            <div className="flex items-center justify-between">
              {etapes.map((etape, idx) => {
                const isLast = idx === totalEtapes - 1;
                const bgColor = {
                  depart: "bg-blue-100",
                  transit: "bg-purple-100",
                  arrivee: "bg-green-100"
                }[etape.type];
                
                const iconColor = {
                  depart: "text-blue-600",
                  transit: "text-purple-600",
                  arrivee: "text-green-600"
                }[etape.type];
                
                return (
                  <React.Fragment key={idx}>
                    {/* Étape */}
                    <div className="text-center flex-1">
                      <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
                        <FaMapMarkerAlt className={`${iconColor}`} />
                      </div>
                      <div className="font-semibold">{etape.code}</div>
                      <div className="text-xs text-gray-500">
                        {etape.type === 'depart' ? 'Départ' : 
                         etape.type === 'transit' ? `Transit ${etape.ordre}` : 
                         'Arrivée'}
                      </div>
                      {etape.time && (
                        <div className="text-xs text-gray-400 mt-1">
                          {etape.time}
                        </div>
                      )}
                    </div>
                    
                    {/* Ligne entre les étapes (sauf après la dernière) */}
                    {!isLast && (
                      <div className="flex-1 relative">
                        <div className="h-1 bg-gray-200 rounded-full">
                          {navette.status === 'terminee' && (
                            <div 
                              className="h-1 bg-primary-600 rounded-full" 
                              style={{ width: '100%' }}
                            ></div>
                          )}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Détails du trajet */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <FaRoad className="w-4 h-4" />
                <span className="text-xs">Distance</span>
              </div>
              <p className="font-semibold">{navette.distance_km || 0} km</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <FaClock className="w-4 h-4" />
                <span className="text-xs">Durée estimée</span>
              </div>
              <p className="font-semibold">{navette.distance_km ? Math.round(navette.distance_km / 70) : 0} h</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <FaGasPump className="w-4 h-4" />
                <span className="text-xs">Carburant</span>
              </div>
              <p className="font-semibold">{comptabiliteService.formatMontant(navette.carburant_estime || 0)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <FaMoneyBillWave className="w-4 h-4" />
                <span className="text-xs">Péages</span>
              </div>
              <p className="font-semibold">{comptabiliteService.formatMontant(navette.peages_estimes || 0)}</p>
            </div>
          </div>
        </div>

        {/* Carte statistiques */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaTachometerAlt className="text-primary-600" /> Statistiques
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Taux de remplissage</span>
                <span className="font-semibold">{navette.taux_remplissage || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${navette.taux_remplissage || 0}%` }}></div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Livraisons</span>
                <span className="font-semibold text-lg">{nbLivraisons}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Capacité max</span>
                <span className="font-semibold">{navette.capacite_max}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Poids total</span>
                <span className="font-semibold">{navette.poids_total || 0} kg</span>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Prix base</span>
                <span className="font-semibold text-green-600">{comptabiliteService.formatMontant(navette.prix_base)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Prix par livraison</span>
                <span className="font-semibold text-green-600">{comptabiliteService.formatMontant(navette.prix_par_livraison)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total estimé</span>
                <span className="font-semibold text-lg text-green-700">
                  {comptabiliteService.formatMontant(navette.prix_base + nbLivraisons * navette.prix_par_livraison)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hub assigné */}
      {navette.hub && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaBuilding className="text-primary-600" /> Hub assigné
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <FaBuilding className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-lg">{navette.hub.nom}</p>
              <p className="text-gray-600">{navette.hub.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Répartition des gains */}
      {navette.repartition && navette.repartition.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaUsers className="text-primary-600" />
            Répartition des gains
          </h2>
          
          <div className="space-y-4">
            {navette.repartition.map((acteur, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    acteur.type === 'gestionnaire' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {acteur.type === 'gestionnaire' ? (
                      <FaUserTie className="text-blue-600" />
                    ) : (
                      <FaBuilding className="text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{acteur.nom}</p>
                    <p className="text-xs text-gray-500">
                      {acteur.type === 'gestionnaire' 
                        ? `Gestionnaire de la wilaya ${acteur.wilaya}`
                        : 'Hub logistique'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">
                    {acteur.part}%
                  </p>
                  <p className="text-xs text-gray-500">du prix de chaque livraison</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total acteurs</span>
              <span className="text-sm font-bold text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
                {navette.repartition.length} acteur(s)
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-semibold text-gray-700">Part par acteur</span>
              <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                {navette.repartition.length > 0 ? (100 / navette.repartition.length).toFixed(2) : 0}%
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-3 flex items-center gap-1">
              <FaCheckCircle className="w-3 h-3" />
              À la terminaison de la navette, chaque acteur recevra automatiquement sa part du prix de chaque livraison.
            </p>
          </div>
        </div>
      )}

      {/* Liste des livraisons */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaBoxes className="text-primary-600" /> Livraisons ({nbLivraisons})
          </h2>
          {/* Bouton ajouter des livraisons - visible pour planifiée ET en_cours */}
          {canEditLivraisons && (
            <button 
              onClick={() => { fetchLivraisonsDisponibles(); setShowAddLivraisonModal(true); }} 
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <FaPlus /> Ajouter des livraisons
            </button>
          )}
        </div>
        <NavetteLivraisonList 
          livraisons={navette.livraisons || []} 
          onRemove={handleRemoveLivraison} 
          canRemove={canEditLivraisons}
        />
      </div>

      {/* Modal d'ajout de livraisons */}
      {showAddLivraisonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Ajouter des livraisons</h2>
              <p className="text-gray-600">Sélectionnez les livraisons à ajouter à la navette</p>
            </div>
            <div className="p-6">
              {loadingLivraisons ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Chargement...</p>
                </div>
              ) : livraisonsDisponibles.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Aucune livraison disponible</p>
              ) : (
                <div className="space-y-4">
                  {livraisonsDisponibles.map((livraison) => (
                    <div key={livraison.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <input 
                          type="checkbox" 
                          checked={selectedLivraisons.includes(livraison.id)} 
                          onChange={(e) => {
                            if (e.target.checked) setSelectedLivraisons([...selectedLivraisons, livraison.id]);
                            else setSelectedLivraisons(selectedLivraisons.filter(id => id !== livraison.id));
                          }} 
                          className="mt-1" 
                        />
                        <div className="flex-1">
                          <div className="flex justify-between flex-wrap gap-2">
                            <div>
                              <p className="font-semibold">{livraison.reference}</p>
                              <p className="text-sm text-gray-600">Client: {livraison.client}</p>
                              <p className="text-sm text-gray-600">Destination: {livraison.destination}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">{comptabiliteService.formatMontant(livraison.prix)}</p>
                              <p className="text-sm text-gray-600">{livraison.poids} kg</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowAddLivraisonModal(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                Annuler
              </button>
              <button 
                onClick={handleAddLivraisons} 
                disabled={selectedLivraisons.length === 0} 
                className={`px-4 py-2 rounded-lg transition ${
                  selectedLivraisons.length > 0 
                    ? "bg-primary-600 text-white hover:bg-primary-700" 
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Ajouter {selectedLivraisons.length} livraison(s)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavetteDetail;