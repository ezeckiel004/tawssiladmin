// src/services/livreurService.js
import api from './api';

const livreurService = {
  // ==================== MÉTHODES PRINCIPALES ====================

  // Récupérer tous les livreurs
  getAllLivreurs: async () => {
    try {
      const response = await api.get('/livreurs');
      
      // Votre API retourne directement un tableau formaté
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Format { data: [...] }
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // Format { success: true, data: [...] }
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ Erreur getAllLivreurs:', error.message);
      return [];
    }
  },

  // Récupérer un livreur par ID
  getLivreurById: async (id) => {
    try {
      const response = await api.get(`/livreurs/${id}`);
      
      // Format direct { id, user, type, ... }
      if (response.data && response.data.id) {
        return response.data;
      }
      
      // Format { success: true, data: { ... } }
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      // Format retourné par votre backend
      if (response.data && response.data.success && response.data.data && response.data.data.livreur) {
        return response.data.data.livreur;
      }
      
      return response.data || {};
      
    } catch (error) {
      console.error(`❌ Erreur getLivreurById ${id}:`, error.message);
      throw error;
    }
  },

  // Créer un nouveau livreur
  createLivreur: async (livreurData) => {
    try {
      const response = await api.post('/livreurs', livreurData);
      
      if (response.data && response.data.success) {
        return response.data.data || response.data;
      }
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Erreur createLivreur:', error.message);
      throw error;
    }
  },

  // Mettre à jour un livreur
  updateLivreur: async (id, livreurData) => {
    try {
      const response = await api.put(`/livreurs/${id}`, livreurData);
      
      if (response.data && response.data.success) {
        return response.data.data || response.data;
      }
      
      return response.data;
      
    } catch (error) {
      console.error(`❌ Erreur updateLivreur ${id}:`, error.message);
      throw error;
    }
  },

  // Supprimer un livreur
  deleteLivreur: async (id) => {
    try {
      const response = await api.delete(`/livreurs/${id}`);
      
      if (response.data && response.data.success) {
        return response.data;
      }
      
      return response.data;
      
    } catch (error) {
      console.error(`❌ Erreur deleteLivreur ${id}:`, error.message);
      throw error;
    }
  },

  // Activer/désactiver un livreur
  toggleActivation: async (id, desactiver) => {
    try {
      const response = await api.patch(`/livreurs/${id}/toggle-activation`, {
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

  // ==================== STATISTIQUES ET COURSES ====================

  // Récupérer les statistiques d'un livreur
  getLivreurStats: async (livreurId) => {
    try {
      // Note: Cette route nécessite que l'utilisateur soit connecté en tant que livreur
      // Pour l'admin, on peut créer une autre route ou adapter
      const response = await api.get(`/livreur/stats/dashboard`);
      
      return response.data || {
        total_courses: 0,
        courses_livrees: 0,
        courses_en_cours: 0,
        taux_reussite: 0,
        total_colis: 0,
      };
      
    } catch (error) {
      console.error(`❌ Erreur getLivreurStats ${livreurId}:`, error.message);
      
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        total_courses: 0,
        courses_livrees: 0,
        courses_en_cours: 0,
        taux_reussite: 0,
        total_colis: 0,
      };
    }
  },

  // Récupérer les statistiques détaillées d'un livreur
  getDetailedStats: async (livreurId, days = 30) => {
    try {
      const response = await api.get(`/livreur/stats/detailed?days=${days}`);
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      
      return response.data || {};
      
    } catch (error) {
      console.error(`❌ Erreur getDetailedStats ${livreurId}:`, error.message);
      return {};
    }
  },

  // Récupérer les courses d'un livreur
  getLivreurCourses: async (livreurId) => {
    try {
      const response = await api.get(`/livraisons/getByLivreur/${livreurId}`);
      
      if (response.data && response.data.success) {
        return response.data.data || [];
      }
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
      
    } catch (error) {
      console.error(`❌ Erreur getLivreurCourses ${livreurId}:`, error.message);
      return [];
    }
  },

  // Récupérer les courses en cours d'un livreur
  getLivreurCoursesEnCours: async (livreurId) => {
    try {
      const response = await api.get(`/livraisons/livreur/${livreurId}/en-cours`);
      
      if (response.data && response.data.success) {
        return response.data.data || [];
      }
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
      
    } catch (error) {
      console.error(`❌ Erreur getLivreurCoursesEnCours ${livreurId}:`, error.message);
      return [];
    }
  },

  // Récupérer les colis d'un livreur
  getLivreurColis: async (livreurId) => {
    try {
      const response = await api.get(`/livreur/courses/colis`);
      
      if (response.data && response.data.success) {
        return response.data.data || [];
      }
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
      
    } catch (error) {
      console.error(`❌ Erreur getLivreurColis ${livreurId}:`, error.message);
      return [];
    }
  },

  // ==================== MÉTHODES UTILITAIRES ====================

  // Formatter un livreur pour l'affichage
  formatLivreur: (livreur) => {
    if (!livreur) return null;
    
    // Structure 1: Retournée par votre backend (avec livreur object)
    if (livreur.livreur) {
      const l = livreur.livreur;
      const user = l.user || {};
      
      return {
        id: l.id,
        user: user,
        type: l.type || 'livreur',
        desactiver: l.desactiver || false,
        demandeAdhesion: livreur.demande_adhesions || null,
        nom: user.nom || '',
        prenom: user.prenom || '',
        telephone: user.telephone || '',
        email: user.email || '',
        photo_url: user.photo_url || null,
        actif: user.actif || true,
        fullName: `${user.prenom || ''} ${user.nom || ''}`.trim(),
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    }
    
    // Structure 2: { id, user: { nom, prenom, ... }, type, desactiver, ... }
    if (livreur.user) {
      return {
        id: livreur.id,
        user: livreur.user,
        type: livreur.type || 'livreur',
        desactiver: livreur.desactiver || false,
        demandeAdhesion: livreur.demandeAdhesion || null,
        nom: livreur.user.nom || '',
        prenom: livreur.user.prenom || '',
        telephone: livreur.user.telephone || '',
        email: livreur.user.email || '',
        photo_url: livreur.user.photo_url || null,
        actif: livreur.user.actif || true,
        fullName: `${livreur.user.prenom || ''} ${livreur.user.nom || ''}`.trim(),
        created_at: livreur.user.created_at,
        updated_at: livreur.user.updated_at
      };
    }
    
    // Structure 3: Flat structure { id, nom, prenom, type, desactiver, ... }
    return {
      id: livreur.id,
      user: {
        nom: livreur.nom || '',
        prenom: livreur.prenom || '',
        telephone: livreur.telephone || '',
        email: livreur.email || '',
        photo_url: livreur.photo_url || null,
        actif: livreur.actif || true,
        created_at: livreur.created_at,
        updated_at: livreur.updated_at
      },
      type: livreur.type || 'livreur',
      desactiver: livreur.desactiver || false,
      demandeAdhesion: livreur.demandeAdhesion || null,
      nom: livreur.nom || '',
      prenom: livreur.prenom || '',
      telephone: livreur.telephone || '',
      email: livreur.email || '',
      fullName: `${livreur.prenom || ''} ${livreur.nom || ''}`.trim(),
      photo_url: livreur.photo_url || null,
      actif: livreur.actif || true,
      created_at: livreur.created_at,
      updated_at: livreur.updated_at
    };
  },

  // Transformer un tableau de livreurs
  transformLivreurs: (livreurs) => {
    if (!livreurs) return [];
    
    if (!Array.isArray(livreurs)) {
      if (livreurs && typeof livreurs === 'object' && livreurs.id) {
        return [livreurService.formatLivreur(livreurs)];
      }
      
      return [];
    }
    
    return livreurs
      .map(livreur => livreurService.formatLivreur(livreur))
      .filter(l => l !== null);
  },

  // Récupérer les livreurs actifs seulement
  getActiveLivreurs: async () => {
    try {
      const allLivreurs = await livreurService.getAllLivreurs();
      const transformed = livreurService.transformLivreurs(allLivreurs);
      return transformed.filter(livreur => !livreur.desactiver);
    } catch (error) {
      console.error('❌ Erreur getActiveLivreurs:', error);
      return [];
    }
  },

  // Récupérer les livreurs par type (avec la NOUVELLE LOGIQUE: retourne tous les livreurs)
  getLivreursByType: async (type) => {
    try {
      const allLivreurs = await livreurService.getAllLivreurs();
      const transformed = livreurService.transformLivreurs(allLivreurs);
      
      // NOUVELLE LOGIQUE: Retourne tous les livreurs actifs, peu importe le type
      // (puisque maintenant tous les livreurs peuvent être ramasseurs ET distributeurs)
      return transformed.filter(livreur => !livreur.desactiver);
    } catch (error) {
      console.error(`❌ Erreur getLivreursByType (${type}):`, error);
      return [];
    }
  },

  // Obtenir les options pour les selects (avec la NOUVELLE LOGIQUE)
  getLivreurOptions: async (type = null) => {
    try {
      // NOUVELLE LOGIQUE: Peu importe le type demandé, on retourne TOUS les livreurs actifs
      const livreurs = await livreurService.getActiveLivreurs();
      
      return livreurs.map(livreur => ({
        value: livreur.id,
        label: livreur.fullName || `${livreur.prenom} ${livreur.nom}`,
        telephone: livreur.telephone || '',
        email: livreur.email || '',
        type: livreur.type,
        ...livreur
      }));
    } catch (error) {
      console.error('❌ Erreur getLivreurOptions:', error);
      return [];
    }
  },

  // ==================== RECHERCHE ET FILTRES ====================

  // Rechercher des livreurs
  searchLivreurs: async (searchTerm) => {
    try {
      const response = await api.get(`/users/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (response.data && Array.isArray(response.data)) {
        const livreurs = response.data.filter(user => user.livreur !== null);
        return livreurService.transformLivreurs(livreurs);
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ Erreur searchLivreurs:', error.message);
      return [];
    }
  },

  // Récupérer les statistiques globales des livreurs
  getGlobalStats: async () => {
    try {
      // Note: Vous devrez peut-être créer cette route dans votre backend
      const response = await api.get('/users/stats');
      
      if (response.data) {
        return response.data;
      }
      
      return {
        total: 0,
        actifs: 0,
        inactifs: 0,
        distributeurs: 0,
        ramasseurs: 0,
      };
      
    } catch (error) {
      console.error('❌ Erreur getGlobalStats:', error.message);
      return {
        total: 0,
        actifs: 0,
        inactifs: 0,
        distributeurs: 0,
        ramasseurs: 0,
      };
    }
  },

  // ==================== DEMANDES D'ADHÉSION ====================

  // Récupérer les demandes d'adhésion d'un livreur
  getDemandesAdhesion: async (livreurId = null) => {
    try {
      let url = '/demandes-adhesion';
      if (livreurId) {
        url = `/livreurs/${livreurId}/demandes-adhesion`;
      }
      
      const response = await api.get(url);
      
      if (response.data && response.data.success) {
        return response.data.data || [];
      }
      
      return [];
      
    } catch (error) {
      console.error(`❌ Erreur getDemandesAdhesion ${livreurId}:`, error.message);
      return [];
    }
  },

  // Mettre à jour le statut d'une demande d'adhésion
  updateDemandeAdhesionStatus: async (demandeId, status) => {
    try {
      const response = await api.patch(`/demandes-adhesion/${demandeId}/status`, {
        status: status,
      });
      
      if (response.data && response.data.success) {
        return response.data.data || response.data;
      }
      
      return response.data;
      
    } catch (error) {
      console.error(`❌ Erreur updateDemandeAdhesionStatus ${demandeId}:`, error.message);
      throw error;
    }
  },

  // ==================== VALIDATION ====================

  // Valider les données d'un livreur avant création/mise à jour
  validateLivreurData: (data) => {
    const errors = {};
    
    if (!data.user_id && !data.email) {
      errors.email = 'L\'email est requis';
    }
    
    if (!data.user_id && !data.telephone) {
      errors.telephone = 'Le téléphone est requis';
    }
    
    if (!data.type) {
      errors.type = 'Le type de livreur est requis';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

export default livreurService;