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
        status: gestionnaire.status || 'actif',
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
      status: gestionnaire.status || 'actif',
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
  }
};

export default gestionnaireService;