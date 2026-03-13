// src/services/navetteService.js
import api from './api';

const navetteService = {
    // Récupérer toutes les navettes avec filtres
    getAllNavettes: async (params = {}) => {
        const response = await api.get('/admin/navettes', { params });
        return response.data;
    },

    // Récupérer une navette par ID
    getNavetteById: async (id) => {
        const response = await api.get(`/admin/navettes/${id}`);
        return response.data;
    },

    // Créer une nouvelle navette
    createNavette: async (navetteData) => {
        const response = await api.post('/admin/navettes', navetteData);
        return response.data;
    },

    // Mettre à jour une navette
    updateNavette: async (id, navetteData) => {
        const response = await api.put(`/admin/navettes/${id}`, navetteData);
        return response.data;
    },

    // Supprimer une navette
    deleteNavette: async (id) => {
        const response = await api.delete(`/admin/navettes/${id}`);
        return response.data;
    },

    // Démarrer une navette
    demarrerNavette: async (id) => {
        const response = await api.post(`/admin/navettes/${id}/demarrer`);
        return response.data;
    },

    // Terminer une navette
    terminerNavette: async (id) => {
        const response = await api.post(`/admin/navettes/${id}/terminer`);
        return response.data;
    },

    // Annuler une navette
    annulerNavette: async (id) => {
        const response = await api.post(`/admin/navettes/${id}/annuler`);
        return response.data;
    },

    // Ajouter des colis à une navette
    ajouterColis: async (id, colisIds) => {
        const response = await api.post(`/admin/navettes/${id}/colis`, { colis_ids: colisIds });
        return response.data;
    },

    // Retirer des colis d'une navette
    retirerColis: async (id, colisIds) => {
        const response = await api.delete(`/admin/navettes/${id}/colis`, {
            data: { colis_ids: colisIds }
        });
        return response.data;
    },

    // Obtenir des suggestions de navettes optimisées
    getSuggestions: async (params) => {
        const response = await api.get('/admin/navettes/suggestions', { params });
        return response.data;
    },

    // Créer une navette optimisée automatiquement
    creerNavetteOptimisee: async (params) => {
        const response = await api.post('/admin/navettes/creer-optimisee', params);
        return response.data;
    },

    // Obtenir les statistiques des navettes
    getStatistiques: async (params = {}) => {
        const response = await api.get('/admin/navettes/statistiques', { params });
        return response.data;
    },

    // Exporter les navettes en PDF
    exportPDF: async (params = {}) => {
        const response = await api.get('/admin/navettes/export-pdf', {
            params,
            responseType: 'blob'
        });
        
        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `navettes-${new Date().toISOString().slice(0,10)}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    // Obtenir la liste des chauffeurs disponibles
    getChauffeursDisponibles: async () => {
        const response = await api.get('/livreurs', {
            params: {
                type: 'chauffeur',
                desactiver: false
            }
        });
        return response.data;
    }
};

export default navetteService;