import api from './api';

const clientService = {
  // Récupérer tous les clients
  getAllClients: async () => {
    try {
      const response = await api.get('/clients');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      throw error;
    }
  },

  // Récupérer un client par ID
  getClientById: async (id) => {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du client ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouveau client
  createClient: async (clientData) => {
    try {
      const response = await api.post('/clients', clientData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      throw error;
    }
  },

  // Mettre à jour un client
  updateClient: async (id, clientData) => {
    try {
      const response = await api.put(`/clients/${id}`, clientData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du client ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un client
  deleteClient: async (clientId) => {
    try {
      const response = await api.delete(`/clients/${clientId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du client ${clientId}:`, error);
      throw error;
    }
  },

  // Récupérer les statistiques d'un client
  getClientStats: async (clientId) => {
    try {
      const response = await api.get(`/livraisons/${clientId}/statistiques`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des statistiques du client ${clientId}:`, error);
      throw error;
    }
  },

  // Activer/désactiver un client (toggle)
  toggleClientActivation: async (clientId) => {
    try {
      const response = await api.patch(`/admin/clients/${clientId}/toggle-activation`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du toggle activation du client ${clientId}:`, error);
      throw error;
    }
  },

  // Mettre à jour le statut d'un client avec une valeur spécifique
  updateClientStatus: async (clientId, status) => {
    try {
      const response = await api.patch(`/admin/clients/${clientId}/status`, {
        status: status
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut du client ${clientId}:`, error);
      throw error;
    }
  },

  // Rechercher des clients
  searchClients: async (searchTerm) => {
    try {
      const response = await api.get('/clients/search', {
        params: { q: searchTerm }
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la recherche des clients:`, error);
      throw error;
    }
  },

  // Obtenir les statistiques globales des clients
  getClientsStats: async () => {
    try {
      const response = await api.get('/clients/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des clients:', error);
      throw error;
    }
  }
};

export default clientService;