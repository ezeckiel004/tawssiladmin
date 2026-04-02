// src/services/gestionnaireService.js
import api from './api';

const gestionnaireService = {
  // ==================== MÉTHODES PRINCIPALES ====================

  /**
   * Récupérer tous les gestionnaires
   * @param {Object} params - { status, wilaya_id, search }
   */
  getAllGestionnaires: async (params = {}) => {
    try {
      const response = await api.get('/admin/gestionnaires', { params });
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ Erreur getAllGestionnaires:', error.message);
      return [];
    }
  },

  /**
   * Récupérer un gestionnaire par ID
   * @param {string} id - ID du gestionnaire
   */
  getGestionnaireById: async (id) => {
    try {
      const response = await api.get(`/admin/gestionnaires/${id}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return response.data || null;
      
    } catch (error) {
      console.error(`❌ Erreur getGestionnaireById ${id}:`, error.message);
      throw error;
    }
  },

  /**
   * Récupérer les gestionnaires par wilaya
   * @param {string} wilayaId - Code de la wilaya
   */
  getGestionnairesByWilaya: async (wilayaId) => {
    try {
      const response = await api.get('/admin/gestionnaires', { 
        params: { wilaya_id: wilayaId } 
      });
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return [];
      
    } catch (error) {
      console.error(`❌ Erreur getGestionnairesByWilaya ${wilayaId}:`, error.message);
      return [];
    }
  },

  /**
   * Créer un nouveau gestionnaire
   * @param {Object} gestionnaireData - { user_id, wilaya_id, status }
   */
  createGestionnaire: async (gestionnaireData) => {
    try {
      const response = await api.post('/admin/gestionnaires', gestionnaireData);
      
      if (response.data && response.data.success) {
        return response.data.data || response.data;
      }
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Erreur createGestionnaire:', error.message);
      throw error;
    }
  },

  /**
   * Mettre à jour un gestionnaire
   * @param {string} id - ID du gestionnaire
   * @param {Object} gestionnaireData - Données à mettre à jour
   */
  updateGestionnaire: async (id, gestionnaireData) => {
    try {
      const response = await api.put(`/admin/gestionnaires/${id}`, gestionnaireData);
      
      if (response.data && response.data.success) {
        return response.data.data || response.data;
      }
      
      return response.data;
      
    } catch (error) {
      console.error(`❌ Erreur updateGestionnaire ${id}:`, error.message);
      throw error;
    }
  },

  /**
   * Supprimer un gestionnaire
   * @param {string} id - ID du gestionnaire
   */
  deleteGestionnaire: async (id) => {
    try {
      const response = await api.delete(`/admin/gestionnaires/${id}`);
      
      if (response.data && response.data.success) {
        return response.data;
      }
      
      return response.data;
      
    } catch (error) {
      console.error(`❌ Erreur deleteGestionnaire ${id}:`, error.message);
      throw error;
    }
  },

  /**
   * Activer/désactiver un gestionnaire
   * @param {string} id - ID du gestionnaire
   * @param {boolean} desactiver - true pour désactiver, false pour activer
   */
  toggleActivation: async (id, desactiver) => {
    try {
      const response = await api.patch(`/admin/gestionnaires/${id}/toggle-activation`, {
        desactiver: desactiver,
      });
      
      if (response.data && response.data.success) {
        return response.data.data || response.data;
      }
      
      return response.data;
      
    } catch (error) {
      console.error(`❌ Erreur toggleActivation ${id}:`, error.message);
      throw error;
    }
  },

  // ==================== GESTION DES LIVREURS POUR GESTIONNAIRE ====================

  /**
   * Récupérer tous les livreurs disponibles pour un gestionnaire
   * (natif de sa wilaya + assignés)
   * @param {string} gestionnaireId - ID du gestionnaire
   */
  getLivreursDisponibles: async (gestionnaireId) => {
    try {
      const response = await api.get(`/manager/livreurs`);
      
      // La route /manager/livreurs retourne déjà les livreurs natifs + assignés
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          stats: response.data.stats
        };
      }
      
      return { success: false, data: [], stats: {} };
      
    } catch (error) {
      console.error(`❌ Erreur getLivreursDisponibles ${gestionnaireId}:`, error.message);
      return { success: false, data: [], stats: {} };
    }
  },

  /**
   * Récupérer les livreurs natifs d'un gestionnaire (ceux de sa wilaya)
   * @param {string} gestionnaireId - ID du gestionnaire
   */
  getLivreursNatifs: async (gestionnaireId) => {
    try {
      const response = await api.get(`/manager/livreurs`);
      
      if (response.data && response.data.success) {
        // Filtrer les livreurs natifs (ceux avec origine = 'natif')
        const livreursNatifs = response.data.data.filter(l => l.origine === 'natif');
        return livreursNatifs;
      }
      
      return [];
      
    } catch (error) {
      console.error(`❌ Erreur getLivreursNatifs ${gestionnaireId}:`, error.message);
      return [];
    }
  },

  /**
   * Récupérer les livreurs assignés (invités) d'un gestionnaire
   * @param {string} gestionnaireId - ID du gestionnaire
   */
  getLivreursAssignes: async (gestionnaireId) => {
    try {
      const response = await api.get(`/manager/livreurs`);
      
      if (response.data && response.data.success) {
        // Filtrer les livreurs assignés (ceux avec origine = 'assigne')
        const livreursAssignes = response.data.data.filter(l => l.origine === 'assigne');
        return livreursAssignes;
      }
      
      return [];
      
    } catch (error) {
      console.error(`❌ Erreur getLivreursAssignes ${gestionnaireId}:`, error.message);
      return [];
    }
  },

  /**
   * Récupérer un livreur spécifique avec son origine
   * @param {string} gestionnaireId - ID du gestionnaire
   * @param {string} livreurId - ID du livreur
   */
  getLivreurAvecOrigine: async (gestionnaireId, livreurId) => {
    try {
      const response = await api.get(`/manager/livreurs/${livreurId}`);
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      
      return null;
      
    } catch (error) {
      console.error(`❌ Erreur getLivreurAvecOrigine:`, error.message);
      return null;
    }
  },

  /**
   * Activer/désactiver un livreur (pour le gestionnaire)
   * @param {string} livreurId - ID du livreur
   * @param {boolean} desactiver - true pour désactiver
   */
  toggleLivreurActivation: async (livreurId, desactiver) => {
    try {
      const response = await api.patch(`/manager/livreurs/${livreurId}/toggle-activation`, {
        desactiver: desactiver,
      });
      
      if (response.data && response.data.success) {
        return response.data;
      }
      
      return response.data;
      
    } catch (error) {
      console.error(`❌ Erreur toggleLivreurActivation:`, error.message);
      throw error;
    }
  },

  // ==================== STATISTIQUES ET GAINS ====================

  /**
   * Récupérer les statistiques d'un gestionnaire
   * @param {string} gestionnaireId - ID du gestionnaire
   * @param {Object} params - { periode, date_debut, date_fin }
   */
  getGestionnaireStats: async (gestionnaireId, params = {}) => {
    try {
      const response = await api.get(`/admin/gestionnaires/${gestionnaireId}/stats`, { params });
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      
      return {
        total_gains: 0,
        nb_livraisons: 0,
        moyenne_par_livraison: 0,
        gains_par_mois: [],
      };
      
    } catch (error) {
      console.error(`❌ Erreur getGestionnaireStats ${gestionnaireId}:`, error.message);
      return {
        total_gains: 0,
        nb_livraisons: 0,
        moyenne_par_livraison: 0,
        gains_par_mois: [],
      };
    }
  },

  /**
   * Récupérer les gains détaillés d'un gestionnaire
   * @param {string} gestionnaireId - ID du gestionnaire
   * @param {Object} params - { periode, date_debut, date_fin }
   */
  getGainsDetails: async (gestionnaireId, params = {}) => {
    try {
      const response = await api.get(`/admin/gestionnaires/${gestionnaireId}/gains`, { params });
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      
      return [];
      
    } catch (error) {
      console.error(`❌ Erreur getGainsDetails ${gestionnaireId}:`, error.message);
      return [];
    }
  },

  /**
   * Récupérer l'historique des gains d'un gestionnaire
   * @param {string} gestionnaireId - ID du gestionnaire
   * @param {number} annee - Année
   */
  getHistoriqueGains: async (gestionnaireId, annee) => {
    try {
      const response = await api.get(`/admin/gestionnaires/${gestionnaireId}/historique/${annee}`);
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      
      return [];
      
    } catch (error) {
      console.error(`❌ Erreur getHistoriqueGains ${gestionnaireId}:`, error.message);
      return [];
    }
  },

  // ==================== MÉTHODES UTILITAIRES ====================

  /**
   * Formatter un gestionnaire pour l'affichage
   * @param {Object} gestionnaire
   * @returns {Object|null}
   */
  formatGestionnaire: (gestionnaire) => {
    if (!gestionnaire) return null;
    
    // Structure avec user
    if (gestionnaire.user) {
      return {
        id: gestionnaire.id,
        user: gestionnaire.user,
        wilaya_id: gestionnaire.wilaya_id,
        wilaya_nom: gestionnaire.wilaya_nom || `Wilaya ${gestionnaire.wilaya_id}`,
        status: gestionnaire.status || 'active',
        nom: gestionnaire.user.nom || '',
        prenom: gestionnaire.user.prenom || '',
        telephone: gestionnaire.user.telephone || '',
        email: gestionnaire.user.email || '',
        photo_url: gestionnaire.user.photo_url || null,
        actif: gestionnaire.user.actif || true,
        fullName: `${gestionnaire.user.prenom || ''} ${gestionnaire.user.nom || ''}`.trim() || 'Gestionnaire',
        created_at: gestionnaire.user.created_at,
        updated_at: gestionnaire.user.updated_at
      };
    }
    
    // Structure plate
    return {
      id: gestionnaire.id,
      user: {
        nom: gestionnaire.nom || '',
        prenom: gestionnaire.prenom || '',
        telephone: gestionnaire.telephone || '',
        email: gestionnaire.email || '',
        photo_url: gestionnaire.photo_url || null,
        actif: gestionnaire.actif || true,
      },
      wilaya_id: gestionnaire.wilaya_id,
      wilaya_nom: gestionnaire.wilaya_nom || `Wilaya ${gestionnaire.wilaya_id}`,
      status: gestionnaire.status || 'active',
      nom: gestionnaire.nom || '',
      prenom: gestionnaire.prenom || '',
      telephone: gestionnaire.telephone || '',
      email: gestionnaire.email || '',
      fullName: `${gestionnaire.prenom || ''} ${gestionnaire.nom || ''}`.trim() || 'Gestionnaire',
      photo_url: gestionnaire.photo_url || null,
      actif: gestionnaire.actif || true,
      created_at: gestionnaire.created_at,
      updated_at: gestionnaire.updated_at
    };
  },

  /**
   * Transformer un tableau de gestionnaires
   * @param {Array} gestionnaires
   * @returns {Array}
   */
  transformGestionnaires: (gestionnaires) => {
    if (!gestionnaires) return [];
    
    if (!Array.isArray(gestionnaires)) {
      if (gestionnaires && typeof gestionnaires === 'object' && gestionnaires.id) {
        return [gestionnaireService.formatGestionnaire(gestionnaires)];
      }
      return [];
    }
    
    return gestionnaires
      .map(g => gestionnaireService.formatGestionnaire(g))
      .filter(g => g !== null);
  },

  /**
   * Récupérer les gestionnaires actifs seulement
   * @returns {Promise<Array>}
   */
  getActiveGestionnaires: async () => {
    try {
      const allGestionnaires = await gestionnaireService.getAllGestionnaires({ 
        status: 'active' 
      });
      const transformed = gestionnaireService.transformGestionnaires(allGestionnaires);
      return transformed.filter(g => g.status === 'active');
    } catch (error) {
      console.error('❌ Erreur getActiveGestionnaires:', error);
      return [];
    }
  },

  /**
   * Obtenir les options pour les selects
   * @returns {Promise<Array>}
   */
  getGestionnaireOptions: async () => {
    try {
      const gestionnaires = await gestionnaireService.getActiveGestionnaires();
      
      return gestionnaires.map(g => ({
        value: g.id,
        label: g.fullName,
        wilaya_id: g.wilaya_id,
        wilaya_nom: g.wilaya_nom,
        email: g.email || '',
        telephone: g.telephone || '',
      }));
    } catch (error) {
      console.error('❌ Erreur getGestionnaireOptions:', error);
      return [];
    }
  },

  // ==================== RECHERCHE ET FILTRES ====================

  /**
   * Rechercher des gestionnaires
   * @param {string} searchTerm - Terme de recherche
   * @returns {Promise<Array>}
   */
  searchGestionnaires: async (searchTerm) => {
    try {
      const response = await api.get('/admin/gestionnaires/search', { 
        params: { q: encodeURIComponent(searchTerm) } 
      });
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return gestionnaireService.transformGestionnaires(response.data.data);
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ Erreur searchGestionnaires:', error.message);
      return [];
    }
  },

  /**
   * Récupérer les statistiques globales des gestionnaires
   * @param {Object} params - { periode, date_debut, date_fin }
   * @returns {Promise<Object>}
   */
  getGlobalStats: async (params = {}) => {
    try {
      const response = await api.get('/admin/gestionnaires/stats', { params });
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      
      return {
        total: 0,
        actifs: 0,
        inactifs: 0,
        total_gains: 0,
        moyenne_gains: 0,
      };
      
    } catch (error) {
      console.error('❌ Erreur getGlobalStats:', error.message);
      return {
        total: 0,
        actifs: 0,
        inactifs: 0,
        total_gains: 0,
        moyenne_gains: 0,
      };
    }
  },

  // ==================== RAPPORTS ====================

  /**
   * Exporter les données des gestionnaires
   * @param {Object} params - { format, ...filtres }
   * @returns {Promise}
   */
  exportGestionnaires: async (params = {}) => {
    try {
      const response = await api.get('/admin/gestionnaires/export', {
        params,
        responseType: 'blob'
      });
      
      return response;
    } catch (error) {
      console.error('❌ Erreur exportGestionnaires:', error.message);
      throw error;
    }
  },

  /**
   * Exporter les gains d'un gestionnaire
   * @param {string} gestionnaireId - ID du gestionnaire
   * @param {Object} params - { format, date_debut, date_fin }
   */
  exportGains: async (gestionnaireId, params = {}) => {
    try {
      const response = await api.get(`/admin/gestionnaires/${gestionnaireId}/gains/export`, {
        params,
        responseType: 'blob'
      });
      
      return response;
    } catch (error) {
      console.error('❌ Erreur exportGains:', error.message);
      throw error;
    }
  },

  // ==================== VALIDATION ====================

  /**
   * Valider les données d'un gestionnaire
   * @param {Object} data - Données à valider
   * @returns {Object} { isValid, errors }
   */
  validateGestionnaireData: (data) => {
    const errors = {};
    
    if (!data.user_id && !data.email) {
      errors.email = 'L\'email est requis';
    }
    
    if (!data.user_id && !data.telephone) {
      errors.telephone = 'Le téléphone est requis';
    }
    
    if (!data.wilaya_id) {
      errors.wilaya_id = 'La wilaya est requise';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // ==================== TABLEAU DE BORD (DASHBOARD) ====================

  /**
   * Récupérer les données du tableau de bord pour un gestionnaire
   * @param {string} gestionnaireId - ID du gestionnaire
   * @returns {Promise<Object>}
   */
  getDashboardData: async (gestionnaireId) => {
    try {
      const response = await api.get('/manager/dashboard');
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      
      return {
        stats: {
          total_livraisons: 0,
          livraisons_en_cours: 0,
          livraisons_terminees: 0,
          total_gains: 0,
          gains_mois: 0,
          nombre_livreurs: 0,
          taux_satisfaction: 0
        },
        livraisons_recentes: [],
        gains_par_mois: [],
        livreurs_top: []
      };
      
    } catch (error) {
      console.error(`❌ Erreur getDashboardData ${gestionnaireId}:`, error.message);
      return {
        stats: {
          total_livraisons: 0,
          livraisons_en_cours: 0,
          livraisons_terminees: 0,
          total_gains: 0,
          gains_mois: 0,
          nombre_livreurs: 0,
          taux_satisfaction: 0
        },
        livraisons_recentes: [],
        gains_par_mois: [],
        livreurs_top: []
      };
    }
  },

  // ==================== PROFIL GESTIONNAIRE ====================

  /**
   * Récupérer le profil du gestionnaire connecté
   * @returns {Promise<Object>}
   */
  getMonProfil: async () => {
    try {
      const response = await api.get('/manager/profile');
      
      if (response.data && response.data.success) {
        return gestionnaireService.formatGestionnaire(response.data.data);
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Erreur getMonProfil:', error.message);
      throw error;
    }
  },

  /**
   * Mettre à jour le profil du gestionnaire
   * @param {Object} profileData - Données du profil
   */
  updateMonProfil: async (profileData) => {
    try {
      const response = await api.put('/manager/profile', profileData);
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Erreur updateMonProfil:', error.message);
      throw error;
    }
  },

  /**
   * Changer le mot de passe du gestionnaire
   * @param {Object} passwordData - { current_password, new_password, new_password_confirmation }
   */
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/manager/profile/change-password', passwordData);
      
      if (response.data && response.data.success) {
        return response.data;
      }
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Erreur changePassword:', error.message);
      throw error;
    }
  },

  // ==================== STATISTIQUES DÉTAILLÉES ====================

  /**
   * Récupérer les statistiques de livraisons par statut
   * @param {string} gestionnaireId - ID du gestionnaire
   * @returns {Promise<Object>}
   */
  getStatistiquesLivraisons: async (gestionnaireId) => {
    try {
      const response = await api.get('/manager/livraisons/statistiques');
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      
      return {
        par_statut: {},
        par_jour: [],
        par_mois: []
      };
      
    } catch (error) {
      console.error(`❌ Erreur getStatistiquesLivraisons:`, error.message);
      return {
        par_statut: {},
        par_jour: [],
        par_mois: []
      };
    }
  },

  /**
   * Récupérer l'évolution des gains sur une période
   * @param {string} gestionnaireId - ID du gestionnaire
   * @param {string} periode - 'jour', 'semaine', 'mois', 'annee'
   */
  getEvolutionGains: async (gestionnaireId, periode = 'mois') => {
    try {
      const response = await api.get(`/manager/gains/evolution`, {
        params: { periode }
      });
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      
      return [];
      
    } catch (error) {
      console.error(`❌ Erreur getEvolutionGains:`, error.message);
      return [];
    }
  }
};

export default gestionnaireService;