import api from './api';

const bordereauService = {
  // Récupérer tous les bordereaux
  getAllBordereaux: async () => {
    const response = await api.get('/bordereaux');
    return response.data;
  },

  // Récupérer un bordereau par ID
  getBordereauById: async (id) => {
    const response = await api.get(`/bordereaux/${id}`);
    return response.data;
  },

  // Créer un bordereau
  createBordereau: async (bordereauData) => {
    const response = await api.post('/bordereaux', bordereauData);
    return response.data;
  },

  // Mettre à jour un bordereau
  updateBordereau: async (bordereauId, bordereauData) => {
    const response = await api.put(`/bordereaux/${bordereauId}`, bordereauData);
    return response.data;
  },

  // Supprimer un bordereau
  deleteBordereau: async (bordereauId) => {
    const response = await api.delete(`/bordereaux/${bordereauId}`);
    return response.data;
  },
};

export default bordereauService;