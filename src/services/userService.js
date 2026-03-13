// src/services/userService.js
import api from './api';

// Cache pour éviter les appels redondants
let usersCache = null;
let statsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 secondes

const userService = {
  // ==================== LISTE & RECHERCHE ====================

  /**
   * Récupérer tous les utilisateurs
   */
  getAllUsers: async (forceRefresh = false, silent = true) => {
    try {
      const now = Date.now();

      if (!forceRefresh && usersCache && (now - lastFetchTime) < CACHE_DURATION) {
        return usersCache.filter(user => user.role !== "client_destinataire");
      }

      // Utiliser la route admin pour récupérer tous les utilisateurs
      const response = await api.get('/admin/users');
      const responseData = response.data;

      let users = [];
      if (responseData?.success && Array.isArray(responseData.data)) {
        users = responseData.data;
      } else if (Array.isArray(responseData)) {
        users = responseData;
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        users = responseData.data;
      } else {
        users = responseData || [];
      }

      // Filtrer pour exclure les client_destinataire
      users = users.filter(user => user.role !== "client_destinataire");
      
      usersCache = users;
      lastFetchTime = now;

      return users;
    } catch (error) {
      console.error("Erreur getAllUsers:", error);
      
      // Fallback sur l'ancienne route si la nouvelle échoue
      try {
        const fallbackResponse = await api.get('/all-users');
        const fallbackData = fallbackResponse.data;
        let fallbackUsers = [];
        
        if (fallbackData?.success && Array.isArray(fallbackData.data)) {
          fallbackUsers = fallbackData.data;
        } else if (Array.isArray(fallbackData)) {
          fallbackUsers = fallbackData;
        }
        
        fallbackUsers = fallbackUsers.filter(user => user.role !== "client_destinataire");
        usersCache = fallbackUsers;
        return fallbackUsers;
      } catch (fallbackError) {
        if (usersCache) return usersCache.filter(user => user.role !== "client_destinataire");
        return silent ? [] : [];
      }
    }
  },

  /**
   * Récupérer un utilisateur par son ID
   */
  getUserById: async (userId, silent = true) => {
    try {
      // Utiliser la route admin
      const response = await api.get(`/admin/users/${userId}`);
      const responseData = response.data;

      if (responseData?.success && responseData.data) {
        if (responseData.data.role === "client_destinataire") {
          throw new Error("Accès interdit aux clients destinataires");
        }
        return responseData.data;
      }

      return responseData;
    } catch (error) {
      console.error("Erreur getUserById:", error);
      if (!silent) {
        throw new Error(`Utilisateur ${userId} non trouvé`);
      }
      return null;
    }
  },

  // ==================== CRÉATION ====================

  /**
   * Créer un nouvel utilisateur
   */
  createUser: async (userData) => {
    try {
      if (userData.role === "client_destinataire") {
        throw new Error("La création d'utilisateurs avec le rôle 'client_destinataire' n'est pas autorisée");
      }
      
      console.log("Données envoyées au serveur:", userData);

      // Utiliser la route admin pour créer un utilisateur
      const response = await api.post('/admin/users', userData);
      
      usersCache = null;
      statsCache = null;

      const responseData = response.data;
      return responseData?.success && responseData.data ? responseData.data : responseData;
    } catch (error) {
      console.error("Erreur createUser:", error);
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        const errorMessage = Object.values(validationErrors).flat().join(', ');
        throw new Error(`Erreur de validation: ${errorMessage}`);
      }
      if (error.response?.status === 403) {
        throw new Error('Accès non autorisé. Admin requis.');
      }
      throw new Error(error.response?.data?.message || 'Erreur lors de la création');
    }
  },

  // ==================== MISE À JOUR ====================

  /**
   * Mettre à jour un utilisateur
   */
  updateUser: async (userId, userData) => {
    try {
      // Nettoyer les données (supprimer les champs vides)
      const cleanData = Object.fromEntries(
        Object.entries(userData).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      );

      if (cleanData.role === "client_destinataire") {
        throw new Error("Le rôle 'client_destinataire' n'est pas autorisé");
      }

      // Utiliser la route admin pour la mise à jour
      const response = await api.put(`/admin/users/${userId}`, cleanData);
      
      usersCache = null;
      statsCache = null;

      const responseData = response.data;
      return responseData?.success && responseData.data ? responseData.data : responseData;
    } catch (error) {
      console.error("Erreur updateUser:", error);
      if (error.response?.status === 403) {
        throw new Error('Accès non autorisé. Admin requis.');
      }
      if (error.response?.status === 404) {
        throw new Error('Utilisateur non trouvé');
      }
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        const errorMessage = Object.values(validationErrors).flat().join(', ');
        throw new Error(`Erreur de validation: ${errorMessage}`);
      }
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  },

  // ==================== SUPPRESSION & ACTIVATION ====================

  /**
   * Supprimer un utilisateur (soft delete)
   */
  deleteUser: async (userId) => {
    try {
      // Utiliser la route admin pour suppression
      const response = await api.delete(`/admin/users/${userId}`);
      
      usersCache = null;
      statsCache = null;
      return response.data;
    } catch (error) {
      console.error("Erreur deleteUser:", error);
      if (error.response?.status === 403) {
        throw new Error('Accès non autorisé. Admin requis.');
      }
      if (error.response?.status === 404) {
        throw new Error('Utilisateur non trouvé');
      }
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  },

  /**
   * Supprimer définitivement un utilisateur
   */
  deleteUserForce: async (userId) => {
    try {
      // Utiliser la route admin pour suppression forcée
      const response = await api.delete(`/admin/users/${userId}/force-delete`);
      
      usersCache = null;
      statsCache = null;
      return response.data;
    } catch (error) {
      console.error("Erreur deleteUserForce:", error);
      if (error.response?.status === 403) {
        throw new Error('Accès non autorisé. Admin requis.');
      }
      if (error.response?.status === 404) {
        throw new Error('Utilisateur non trouvé');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Impossible de supprimer cet utilisateur');
      }
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression définitive');
    }
  },

  /**
   * Activer/désactiver un utilisateur
   */
  updateUserStatus: async (userId) => {
    try {
      // Utiliser la route admin pour activer/désactiver
      const response = await api.patch(`/admin/users/${userId}/toggle-activation`);

      usersCache = null;
      statsCache = null;

      return response.data;
    } catch (error) {
      console.error("Erreur updateUserStatus:", error);
      if (error.response?.status === 403) {
        throw new Error('Accès non autorisé. Admin requis.');
      }
      if (error.response?.status === 404) {
        throw new Error('Utilisateur non trouvé');
      }
      throw new Error(error.response?.data?.message || 'Erreur lors de la modification du statut');
    }
  },

  // ==================== STATISTIQUES ====================

  /**
   * Obtenir les statistiques globales
   */
  getStats: async (forceRefresh = false, silent = true) => {
    try {
      const now = Date.now();

      if (!forceRefresh && statsCache && (now - lastFetchTime) < CACHE_DURATION) {
        return statsCache;
      }

      // Utiliser la route admin pour les statistiques
      const response = await api.get('/admin/users/stats');
      const responseData = response.data;

      let stats = {};
      if (responseData?.success && responseData.data) {
        stats = responseData.data;
      } else if (typeof responseData === 'object') {
        stats = responseData;
      } else {
        stats = await userService.calculateLocalStats();
      }

      statsCache = stats;
      lastFetchTime = now;

      return stats;
    } catch (error) {
      console.error("Erreur getStats:", error);
      return await userService.calculateLocalStats();
    }
  },

  /**
   * Calculer les statistiques localement (fallback)
   */
  calculateLocalStats: async () => {
    try {
      const users = await userService.getAllUsers(false, true);

      return {
        success: true,
        total_users: users.length || 0,
        total_clients: users.filter(u => u.role === 'client').length || 0,
        total_livreurs: users.filter(u => u.role === 'livreur').length || 0,
        total_admins: users.filter(u => u.role === 'admin').length || 0,
        total_gestionnaires: users.filter(u => u.role === 'gestionnaire').length || 0,
        active_users: users.filter(u => u.actif).length || 0,
        inactive_users: users.filter(u => !u.actif).length || 0,
        message: 'Statistiques calculées localement'
      };
    } catch {
      return userService.getDefaultStats();
    }
  },

  /**
   * Statistiques par défaut
   */
  getDefaultStats: () => ({
    success: true,
    total_users: 0,
    total_clients: 0,
    total_livreurs: 0,
    total_admins: 0,
    total_gestionnaires: 0,
    active_users: 0,
    inactive_users: 0,
    message: 'Statistiques par défaut'
  }),

  /**
   * Obtenir les statistiques d'un client
   */
  getClientStats: async (clientId) => {
    try {
      const response = await api.get(`/admin/users/${clientId}/stats/client`);
      const responseData = response.data;
      return responseData?.success && responseData.data ? responseData.data : responseData;
    } catch (error) {
      console.error("Erreur getClientStats:", error);
      return {
        total_livraisons: 0,
        livraisons_en_cours: 0,
        livraisons_terminees: 0,
        montant_total: 0,
        derniere_livraison: null
      };
    }
  },

  /**
   * Obtenir les statistiques d'un livreur
   */
  getLivreurStats: async (livreurId) => {
    try {
      const response = await api.get(`/admin/users/${livreurId}/stats/livreur`);
      const responseData = response.data;
      return responseData?.success && responseData.data ? responseData.data : responseData;
    } catch (error) {
      console.error("Erreur getLivreurStats:", error);
      return {
        total_livraisons: 0,
        livraisons_en_attente: 0,
        livraisons_en_cours: 0,
        livraisons_terminees: 0,
        note_moyenne: 0,
        revenu_total: 0
      };
    }
  },

  // ==================== RECHERCHE ====================

  /**
   * Rechercher des utilisateurs
   */
  searchUsers: async (query, role = null) => {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (role) params.append('role', role);

      // Utiliser la route admin pour la recherche
      const response = await api.get(`/admin/users/search?${params.toString()}`);
      const responseData = response.data;

      let users = [];
      if (responseData?.success && responseData.data) {
        users = responseData.data;
      }

      users = users.filter(user => user.role !== "client_destinataire");

      return {
        success: true,
        data: users,
        count: users.length
      };
    } catch (error) {
      console.error("Erreur searchUsers:", error);
      
      // Fallback: recherche locale
      try {
        const allUsers = await userService.getAllUsers();
        let filtered = allUsers;

        if (query) {
          const searchLower = query.toLowerCase();
          filtered = filtered.filter(user =>
            (user.nom?.toLowerCase().includes(searchLower)) ||
            (user.prenom?.toLowerCase().includes(searchLower)) ||
            (user.email?.toLowerCase().includes(searchLower)) ||
            (user.telephone?.includes(query))
          );
        }

        if (role) {
          filtered = filtered.filter(user => user.role === role);
        }

        return {
          success: true,
          data: filtered,
          count: filtered.length
        };
      } catch {
        return { success: true, data: [], count: 0 };
      }
    }
  },

  // ==================== EXPORT ====================

  /**
   * Exporter les utilisateurs (Excel, CSV)
   */
  exportUsersExcel: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);
      if (params.format) queryParams.append('format', params.format);
      if (params.columns && params.columns.length > 0) {
        params.columns.forEach(col => queryParams.append('columns[]', col));
      }

      console.log('Export avec paramètres:', params);

      // Utiliser la route admin d'export
      const response = await api.get(`/admin/users/export/excel?${queryParams.toString()}`, {
        responseType: 'blob'
      });
      
      const filename = `users-export-${new Date().toISOString().slice(0,10)}.${params.format || 'xlsx'}`;
      await userService.downloadFile(response, filename);
      
      return { success: true, message: 'Export téléchargé avec succès' };
    } catch (error) {
      console.error('Erreur exportUsersExcel:', error);
      throw new Error('Erreur lors de l\'export: ' + (error.message || 'Erreur inconnue'));
    }
  },

  /**
   * Exporter les utilisateurs en PDF
   */
  exportUsersPDF: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);
      if (params.columns && params.columns.length > 0) {
        params.columns.forEach(col => queryParams.append('columns[]', col));
      }

      // Utiliser la route admin d'export avec format=pdf
      const response = await api.get(`/admin/users/export/excel?${queryParams.toString()}&format=pdf`, {
        responseType: 'blob'
      });
      
      const filename = `users-export-${new Date().toISOString().slice(0,10)}.pdf`;
      await userService.downloadFile(response, filename);
      
      return { success: true, message: 'PDF téléchargé avec succès' };
    } catch (error) {
      console.error('Erreur exportUsersPDF:', error);
      throw new Error('Erreur lors de la génération du PDF: ' + error.message);
    }
  },

  /**
   * Télécharger un fichier
   */
  downloadFile: async (response, defaultFilename) => {
    try {
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream'
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = defaultFilename;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);

      return true;
    } catch (error) {
      console.error('Erreur downloadFile:', error);
      throw new Error('Erreur lors du téléchargement du fichier');
    }
  },

  /**
   * Télécharger un export avec token
   */
  downloadExport: async (token) => {
    try {
      const response = await api.get(`/admin/users/export/download/${token}`, {
        responseType: 'blob'
      });
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `users-export-${new Date().toISOString().slice(0,10)}.xlsx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      await userService.downloadFile(response, filename);
      
      return { success: true };
    } catch (error) {
      console.error('Erreur downloadExport:', error);
      throw new Error('Erreur lors du téléchargement: ' + error.message);
    }
  },

  // ==================== AUTRES ====================

  /**
   * Mettre à jour la position GPS
   */
  updatePosition: async (latitude, longitude) => {
    try {
      const response = await api.patch('/auth/update-position', {
        latitude,
        longitude
      });
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour de la position');
    }
  },

  /**
   * Mettre à jour le profil
   */
  updateProfile: async (data) => {
    try {
      const response = await api.put('/auth/profile', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  },

  /**
   * Changer le mot de passe
   */
  changePassword: async (data) => {
    try {
      const response = await api.post('/auth/change-password', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    }
  },

  // ==================== UTILITAIRES ====================

  /**
   * Formater un utilisateur pour l'affichage
   */
  formatUserForDisplay: (user) => {
    if (!user) return null;

    return {
      ...user,
      fullName: `${user.prenom || ''} ${user.nom || ''}`.trim(),
      formattedRole: user.role ? userService.getRoleLabel(user.role) : 'Non défini',
      formattedStatus: user.actif ? 'Actif' : 'Inactif',
      statusColor: user.actif ? 'green' : 'red',
      roleColor: userService.getRoleColor(user.role),
      formattedDate: user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'Non défini',
    };
  },

  /**
   * Obtenir la liste des rôles disponibles
   */
  getAvailableRoles: () => [
    { value: 'client', label: 'Client', color: 'green' },
    { value: 'livreur', label: 'Livreur', color: 'blue' },
    { value: 'gestionnaire', label: 'Gestionnaire', color: 'orange' },
    { value: 'admin', label: 'Administrateur', color: 'purple' }
  ],

  /**
   * Obtenir le libellé d'un rôle
   */
  getRoleLabel: (role) => {
    const roles = {
      'client': 'Client',
      'livreur': 'Livreur',
      'gestionnaire': 'Gestionnaire',
      'admin': 'Administrateur'
    };
    return roles[role] || role;
  },

  /**
   * Obtenir la couleur d'un rôle
   */
  getRoleColor: (role) => {
    const colors = {
      'client': 'green',
      'livreur': 'blue',
      'gestionnaire': 'orange',
      'admin': 'purple'
    };
    return colors[role] || 'gray';
  },

  /**
   * Obtenir la classe CSS pour le badge d'un rôle
   */
  getRoleBadgeClass: (role) => {
    const classes = {
      'client': 'bg-green-100 text-green-800',
      'livreur': 'bg-blue-100 text-blue-800',
      'gestionnaire': 'bg-orange-100 text-orange-800',
      'admin': 'bg-purple-100 text-purple-800'
    };
    return classes[role] || 'bg-gray-100 text-gray-800';
  },

  /**
   * Obtenir l'icône d'un rôle
   */
  getRoleIcon: (role) => {
    const icons = {
      'client': 'FaShoppingBag',
      'livreur': 'FaTruck',
      'gestionnaire': 'FaUserTie',
      'admin': 'FaUserShield'
    };
    return icons[role] || 'FaUser';
  },

  /**
   * Obtenir la liste des statuts disponibles
   */
  getAvailableStatuses: () => [
    { value: true, label: 'Actif', color: 'green' },
    { value: false, label: 'Inactif', color: 'red' }
  ],

  /**
   * Invalider le cache
   */
  invalidateCache: () => {
    usersCache = null;
    statsCache = null;
    lastFetchTime = 0;
  }
};

export default userService;