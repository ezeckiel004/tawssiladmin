import api from './api';

const demandeAdhesionService = {
  // Récupérer toutes les demandes d'adhésion
  getAllDemandes: async () => {
    const response = await api.get('/demandes-adhesion');
    return response.data;
  },

  // Récupérer une demande par ID
  getDemandeById: async (id) => {
    const response = await api.get(`/demandes-adhesion/${id}`);
    return response.data;
  },

  // Récupérer les demandes par statut
  getDemandesByStatus: async (status) => {
    const response = await api.get(`/demandes-adhesion/by-status/${status}`);
    return response.data;
  },

  // Mettre à jour le statut d'une demande
  updateStatus: async (demandeId, status, userId) => {
    const response = await api.patch(`/demandes-adhesion/${demandeId}/status`, {
      status,
      user_id: userId
    });
    return response.data;
  },

  // Mettre à jour une demande
  updateDemande: async (demandeId, demandeData) => {
    const response = await api.put(`/demandes-adhesion/${demandeId}`, demandeData);
    return response.data;
  },

  // Supprimer une demande
  deleteDemande: async (demandeId) => {
    const response = await api.delete(`/demandes-adhesion/${demandeId}`);
    return response.data;
  },

  // Créer une demande
  createDemande: async (demandeData) => {
    const response = await api.post('/demandes-adhesion', demandeData);
    return response.data;
  },
};

export default demandeAdhesionService;