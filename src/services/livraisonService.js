// src/services/livraisonService.js
import api from './api';
import userService from './userService';

const livraisonService = {
  // ==================== ADMIN METHODS ====================
  
  // Récupérer toutes les livraisons (admin)
  getAllLivraisonsAdmin: async () => {
    try {
      const response = await api.get('/admin/livraisons');
      return response.data;
    } catch (error) {
      console.error('Erreur getAllLivraisonsAdmin:', error);
      return await livraisonService.getAllLivraisons();
    }
  },

  // Récupérer une livraison par ID (admin)
  getLivraisonByIdAdmin: async (id) => {
    try {
      const response = await api.get(`/admin/livraisons/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getLivraisonByIdAdmin:', error);
      return await livraisonService.getLivraisonById(id);
    }
  },

  // Mettre à jour le statut d'une livraison (admin)
  updateStatusAdmin: async (livraisonId, status) => {
    try {
      const response = await api.patch(`/admin/livraisons/${livraisonId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Erreur updateStatusAdmin:', error);
      return await livraisonService.updateStatus(livraisonId, status);
    }
  },

  // Attribuer un livreur à une livraison (admin)
  assignLivreurAdmin: async (livraisonId, livreurId, type) => {
    try {
      const response = await api.patch(`/admin/livraisons/${livraisonId}/assign-livreur`, {
        livreur_id: livreurId,
        type: type
      });
      return response.data;
    } catch (error) {
      console.error('Erreur assignLivreurAdmin:', error);
      return await livraisonService.assignLivreur(livraisonId, livreurId, type);
    }
  },

  // Supprimer une livraison (admin)
  deleteLivraisonAdmin: async (livraisonId) => {
    try {
      const response = await api.delete(`/admin/livraisons/${livraisonId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur deleteLivraisonAdmin:', error);
      return await livraisonService.deleteLivraison(livraisonId);
    }
  },

  // ==================== EXPORT DES LIVRAISONS ====================

  exportLivraisonsExcel: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.format) queryParams.append('format', params.format);

      console.log('Export livraisons avec paramètres:', {
        search: params.search,
        status: params.status,
        startDate: params.startDate,
        endDate: params.endDate,
        format: params.format,
        count: params.filteredLivraisonsCount
      });
      
      if (params.filteredLivraisonsCount > 5000) {
        const confirm = window.confirm(
          `⚠️ ATTENTION : Gros export détecté\n\n` +
          `Vous allez exporter ${params.filteredLivraisonsCount} livraisons.\n` +
          `Cette opération peut prendre du temps et utiliser beaucoup de mémoire.\n\n` +
          `Conseil : Appliquez des filtres (dates, statuts) pour réduire le volume.\n\n` +
          `Voulez-vous continuer ?`
        );
        
        if (!confirm) {
          throw new Error('Export annulé par l\'utilisateur');
        }
      }
      
      const baseUrl = '/admin/livraisons/export/excel';
      const queryString = queryParams.toString();
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      
      console.log('URL appelée:', url);
      
      const response = await api.get(url, {
        responseType: 'blob',
        timeout: 180000,
      });
      
      console.log('Réponse reçue, content-type:', response.headers['content-type']);
      console.log('Taille du fichier:', response.data.size, 'bytes');
      
      const extension = params.format || 'xlsx';
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const filename = `livraisons_export_${dateStr}.${extension}`;
      
      await userService.downloadFile(response, filename);
      
      return { 
        success: true, 
        message: 'Export téléchargé avec succès',
        filename: filename 
      };
    } catch (error) {
      console.error('Erreur exportLivraisonsExcel:', error);
      
      let errorMessage = 'Erreur lors de l\'export';
      
      if (error.message === 'Export annulé par l\'utilisateur') {
        throw error;
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Trop de données à exporter. Appliquez des filtres plus restrictifs.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Route d\'export non trouvée. Vérifiez la configuration backend.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Accès non autorisé. Admin requis.';
      } else if (error.response?.status === 500) {
        const serverError = error.response?.data?.message || 'Erreur serveur';
        if (serverError.includes('mémoire') || serverError.includes('memory')) {
          errorMessage = 'Erreur de mémoire serveur. Réduisez le nombre de livraisons à exporter.';
        } else {
          errorMessage = `Erreur serveur: ${serverError}`;
        }
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Le temps d\'attente a expiré. L\'export est trop volumineux. Réduisez le nombre de livraisons.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // ==================== USER METHODS ====================

  getAllLivraisons: async () => {
    try {
      const response = await api.get('/livraisons');
      return response.data;
    } catch (error) {
      console.error('Erreur getAllLivraisons:', error);
      return [];
    }
  },

  getLivraisonById: async (id) => {
    try {
      const response = await api.get(`/livraisons/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getLivraisonById:', error);
      return null;
    }
  },

  getLivraisonsByClient: async (clientId) => {
    try {
      const response = await api.get(`/livraisons/getByClient/${clientId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getLivraisonsByClient:', error);
      return [];
    }
  },

  getLivraisonsByLivreur: async (livreurId) => {
    try {
      const response = await api.get(`/livraisons/getByLivreur/${livreurId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getLivraisonsByLivreur:', error);
      return [];
    }
  },

  updateStatus: async (livraisonId, status) => {
    try {
      const response = await api.patch(`/livraisons/${livraisonId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Erreur updateStatus:', error);
      throw error;
    }
  },

  assignLivreur: async (livraisonId, livreurId, type) => {
    try {
      const response = await api.patch(`/livraisons/${livraisonId}/assign-livreur`, {
        livreur_id: livreurId,
        type: type
      });
      return response.data;
    } catch (error) {
      console.error('Erreur assignLivreur:', error);
      throw error;
    }
  },

  getClientStats: async (clientId) => {
    try {
      const response = await api.get(`/livraisons/${clientId}/statistiques`);
      return response.data;
    } catch (error) {
      console.error('Erreur getClientStats:', error);
      return null;
    }
  },

  getLivraisonsEnCours: async () => {
    try {
      const response = await api.get('/livraisons/en-cours');
      return response.data;
    } catch (error) {
      console.error('Erreur getLivraisonsEnCours:', error);
      return [];
    }
  },

  deleteLivraison: async (livraisonId) => {
    try {
      const response = await api.delete(`/livraisons/${livraisonId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur deleteLivraison:', error);
      throw error;
    }
  },

  deleteLivraisonByClient: async (livraisonId) => {
    try {
      const response = await api.patch(`/livraisons/${livraisonId}/destroy_by_client`);
      return response.data;
    } catch (error) {
      console.error('Erreur deleteLivraisonByClient:', error);
      throw error;
    }
  },

  // ==================== PDF & IMPRESSION ====================

  downloadBordereauPDF: async (livraisonId) => {
    try {
      const response = await api.get(`/livraisons/${livraisonId}/bordereau-pdf`, {
        responseType: 'blob',
        timeout: 30000,
      });
      return response;
    } catch (error) {
      console.error('Erreur téléchargement PDF backend:', error);
      throw error;
    }
  },

  getPrintHTML: async (livraisonId) => {
    try {
      const response = await api.get(`/livraisons/${livraisonId}/print-html`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération HTML backend:', error);
      throw error;
    }
  },

  // ==================== NOUVELLES MÉTHODES POUR DEPOSE_AU_DEPOT ====================

  /**
   * Récupérer les détails complets d'une livraison (avec workflow)
   * @param {string} id - ID de la livraison
   */
  getLivraisonDetails: async (id) => {
    try {
      const isAdmin = livraisonService.isAdmin();
      const baseUrl = isAdmin ? '/admin/livraisons' : '/livraisons';
      const response = await api.get(`${baseUrl}/${id}/details`);
      return response.data;
    } catch (error) {
      console.error('Erreur getLivraisonDetails:', error);
      return await livraisonService.smartGetLivraisonById(id);
    }
  },

  /**
   * Passer une livraison en transit (spécial dépôt client)
   * @param {string} id - ID de la livraison
   */
  passerEnTransit: async (id) => {
    try {
      const response = await api.post(`/admin/livraisons/${id}/passer-en-transit`);
      return response.data;
    } catch (error) {
      console.error('Erreur passerEnTransit:', error);
      throw error;
    }
  },

  /**
   * Vérifier si une livraison est en mode dépôt client
   * @param {object} livraison - Objet livraison
   */
  isDepotClient: (livraison) => {
    return livraison?.demande_livraison?.depose_au_depot === true ||
           livraison?.depose_au_depot === true;
  },

  /**
   * Obtenir le workflow d'une livraison
   * @param {object} livraison - Objet livraison
   */
  getWorkflowType: (livraison) => {
    const isDepot = livraisonService.isDepotClient(livraison);
    return isDepot ? 'depot_client' : 'ramassage_domicile';
  },

  /**
   * Obtenir les actions possibles pour une livraison
   * @param {object} livraison - Objet livraison
   */
  getActionsPossibles: (livraison) => {
    if (!livraison) return {};
    
    const status = livraison.status;
    const isDepot = livraisonService.isDepotClient(livraison);
    const isAdmin = livraisonService.isAdmin();
    
    if (isDepot) {
      return {
        peutAssignerDistributeur: isAdmin && ['en_attente', 'en_transit'].includes(status),
        peutPasserEnTransit: isAdmin && status === 'en_attente',
        peutMarquerLivre: isAdmin && ['prise_en_charge_livraison', 'en_transit'].includes(status),
        peutAnnuler: isAdmin && !['livre', 'annule'].includes(status),
      };
    } else {
      return {
        peutAssignerRamasseur: isAdmin && ['en_attente', 'prise_en_charge_ramassage'].includes(status),
        peutAssignerDistributeur: isAdmin && status === 'en_transit',
        peutMarquerRamasse: isAdmin && status === 'prise_en_charge_ramassage',
        peutMettreEnTransit: isAdmin && status === 'ramasse',
        peutMarquerLivre: isAdmin && status === 'prise_en_charge_livraison',
        peutAnnuler: isAdmin && !['livre', 'annule'].includes(status),
      };
    }
  },

  /**
   * Obtenir les prochaines étapes recommandées
   * @param {object} livraison - Objet livraison
   */
  getProchainesEtapes: (livraison) => {
    if (!livraison) return [];
    
    const status = livraison.status;
    const isDepot = livraisonService.isDepotClient(livraison);
    
    if (isDepot) {
      switch (status) {
        case 'en_attente':
          return [
            '1. Assigner un distributeur (le colis est déjà au dépôt)',
            '2. Le distributeur prend en charge et livre'
          ];
        case 'en_transit':
          return [
            '1. Le colis est en transit vers le destinataire',
            '2. Assigner un distributeur si ce n\'est pas déjà fait'
          ];
        case 'prise_en_charge_livraison':
          return [
            '1. Le distributeur a pris en charge la livraison',
            '2. Attendre la confirmation de livraison'
          ];
        default:
          return [];
      }
    } else {
      switch (status) {
        case 'en_attente':
          return [
            '1. Assigner un ramasseur',
            '2. Le ramasseur va chercher le colis',
            '3. Assigner un distributeur pour la livraison'
          ];
        case 'prise_en_charge_ramassage':
          return [
            '1. Le ramasseur a été assigné',
            '2. Valider le ramassage quand le colis est récupéré'
          ];
        case 'ramasse':
          return [
            '1. Le colis a été ramassé',
            '2. Mettre en transit vers le hub',
            '3. Assigner un distributeur'
          ];
        case 'en_transit':
          return [
            '1. Le colis est en transit',
            '2. Assigner un distributeur'
          ];
        default:
          return [];
      }
    }
  },

  // ==================== UTILITY METHODS ====================

  isAdmin: () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage non disponible');
        return false;
      }

      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        console.warn('Aucun utilisateur trouvé dans localStorage');
        return false;
      }

      const user = JSON.parse(userStr);
      return user && (user.role === 'admin' || user.isAdmin === true);
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle admin:', error);
      return false;
    }
  },

  smartGetLivraisonById: async (id) => {
    try {
      const isAdmin = livraisonService.isAdmin();
      
      if (isAdmin) {
        try {
          return await livraisonService.getLivraisonByIdAdmin(id);
        } catch (adminError) {
          console.warn('Route admin échouée, fallback sur route normale:', adminError.message);
          return await livraisonService.getLivraisonById(id);
        }
      } else {
        return await livraisonService.getLivraisonById(id);
      }
    } catch (error) {
      console.error('Erreur dans smartGetLivraisonById:', error);
      throw error;
    }
  },

  smartUpdateStatus: async (livraisonId, status) => {
    try {
      const isAdmin = livraisonService.isAdmin();
      
      if (isAdmin) {
        try {
          return await livraisonService.updateStatusAdmin(livraisonId, status);
        } catch (error) {
          console.warn('Route admin échouée, fallback sur route normale:', error);
          return await livraisonService.updateStatus(livraisonId, status);
        }
      } else {
        return await livraisonService.updateStatus(livraisonId, status);
      }
    } catch (error) {
      console.error('Erreur dans smartUpdateStatus:', error);
      throw error;
    }
  },

  smartAssignLivreur: async (livraisonId, livreurId, type) => {
    try {
      const isAdmin = livraisonService.isAdmin();
      
      if (isAdmin) {
        try {
          return await livraisonService.assignLivreurAdmin(livraisonId, livreurId, type);
        } catch (error) {
          console.warn('Route admin échouée, fallback sur route normale:', error);
          return await livraisonService.assignLivreur(livraisonId, livreurId, type);
        }
      } else {
        return await livraisonService.assignLivreur(livraisonId, livreurId, type);
      }
    } catch (error) {
      console.error('Erreur dans smartAssignLivreur:', error);
      throw error;
    }
  },

  smartDeleteLivraison: async (livraisonId) => {
    try {
      const isAdmin = livraisonService.isAdmin();
      
      if (isAdmin) {
        try {
          return await livraisonService.deleteLivraisonAdmin(livraisonId);
        } catch (error) {
          console.warn('Route admin échouée, fallback sur route normale:', error);
          return await livraisonService.deleteLivraison(livraisonId);
        }
      } else {
        return await livraisonService.deleteLivraison(livraisonId);
      }
    } catch (error) {
      console.error('Erreur dans smartDeleteLivraison:', error);
      throw error;
    }
  },

  smartDownloadBordereauPDF: async (livraisonId) => {
    try {
      const isAdmin = livraisonService.isAdmin();
      
      if (isAdmin) {
        try {
          const response = await api.get(`/admin/livraisons/${livraisonId}/bordereau-pdf`, {
            responseType: 'blob',
            timeout: 30000,
          });
          return response;
        } catch (error) {
          console.warn('Route admin échouée, fallback sur route normale:', error);
          return await livraisonService.downloadBordereauPDF(livraisonId);
        }
      } else {
        return await livraisonService.downloadBordereauPDF(livraisonId);
      }
    } catch (error) {
      console.error('Erreur dans smartDownloadBordereauPDF:', error);
      throw error;
    }
  },

  smartGetPrintHTML: async (livraisonId) => {
    try {
      const isAdmin = livraisonService.isAdmin();
      
      if (isAdmin) {
        try {
          const response = await api.get(`/admin/livraisons/${livraisonId}/print-html`);
          return response.data;
        } catch (error) {
          console.warn('Route admin échouée, fallback sur route normale:', error);
          return await livraisonService.getPrintHTML(livraisonId);
        }
      } else {
        return await livraisonService.getPrintHTML(livraisonId);
      }
    } catch (error) {
      console.error('Erreur dans smartGetPrintHTML:', error);
      throw error;
    }
  },

  downloadBlob: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  downloadPDF: async (livraisonId) => {
    try {
      const response = await livraisonService.smartDownloadBordereauPDF(livraisonId);
      const filename = `bordereau_livraison_${livraisonId}.pdf`;
      livraisonService.downloadBlob(response.data, filename);
      return { success: true };
    } catch (error) {
      console.error('Erreur downloadPDF:', error);
      throw error;
    }
  }
};

export default livraisonService;