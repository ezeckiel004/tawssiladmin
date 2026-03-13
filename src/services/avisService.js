import api from './api';

const avisService = {
  // Récupérer tous les avis
  getAllAvis: async () => {
    const response = await api.get('/avis');
    return response.data;
  },

  // Récupérer un avis par ID
  getAvisById: async (id) => {
    const response = await api.get(`/avis/${id}`);
    return response.data;
  },

  // Créer un avis
  createAvis: async (avisData) => {
    const response = await api.post('/avis', avisData);
    return response.data;
  },

  // Mettre à jour un avis
  updateAvis: async (avisId, avisData) => {
    const response = await api.put(`/avis/${avisId}`, avisData);
    return response.data;
  },

  // Supprimer un avis
  deleteAvis: async (avisId) => {
    const response = await api.delete(`/avis/${avisId}`);
    return response.data;
  },
};

export default avisService;