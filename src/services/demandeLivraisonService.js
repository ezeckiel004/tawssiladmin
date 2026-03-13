import api from './api';

const demandeLivraisonService = {
  // Récupérer toutes les demandes de livraison
  getAllDemandes: async () => {
    const response = await api.get('/demandes-livraison');
    return response.data;
  },

  // Récupérer une demande par ID
  getDemandeById: async (id) => {
    const response = await api.get(`/demandes-livraison/${id}`);
    return response.data;
  },

  // Créer une demande de livraison
  createDemande: async (demandeData) => {
    const response = await api.post('/demandes-livraison', demandeData);
    return response.data;
  },

  // Mettre à jour une demande
  updateDemande: async (demandeId, demandeData) => {
    const response = await api.put(`/demandes-livraison/${demandeId}`, demandeData);
    return response.data;
  },

  // Supprimer une demande
  deleteDemande: async (demandeId) => {
    const response = await api.delete(`/demandes-livraison/${demandeId}`);
    return response.data;
  },
};

export default demandeLivraisonService;