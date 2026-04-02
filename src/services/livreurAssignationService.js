// ==================== PROJET ADMIN ====================
// src/services/livreurAssignationService.js

import api from './api';

const livreurAssignationService = {
    // ==================== MÉTHODES PRINCIPALES ====================
    
    /**
     * Récupérer toutes les assignations
     * @param {Object} params - { status, livreur_id, gestionnaire_id, wilaya_cible }
     */
    getAllAssignations: async (params = {}) => {
        try {
            const response = await api.get('/admin/livreur-assignations', { params });
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('❌ Erreur getAllAssignations:', error);
            return [];
        }
    },
    
    /**
     * Récupérer une assignation par son ID
     * @param {string} id - ID de l'assignation
     */
    getAssignationById: async (id) => {
        try {
            const response = await api.get(`/admin/livreur-assignations/${id}`);
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('❌ Erreur getAssignationById:', error);
            throw error;
        }
    },
    
    /**
     * Créer une assignation
     * @param {Object} data - { livreur_id, gestionnaire_id, date_debut, date_fin, motif }
     */
    createAssignation: async (data) => {
        try {
            const response = await api.post('/admin/livreur-assignations', data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur createAssignation:', error);
            throw error;
        }
    },
    
    /**
     * Mettre à jour une assignation
     * @param {string} id - ID de l'assignation
     * @param {Object} data - { date_fin, status, motif }
     */
    updateAssignation: async (id, data) => {
        try {
            const response = await api.put(`/admin/livreur-assignations/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur updateAssignation:', error);
            throw error;
        }
    },
    
    /**
     * Supprimer une assignation
     * @param {string} id - ID de l'assignation
     */
    deleteAssignation: async (id) => {
        try {
            const response = await api.delete(`/admin/livreur-assignations/${id}`);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur deleteAssignation:', error);
            throw error;
        }
    },
    
    /**
     * Terminer une assignation (sans supprimer)
     * @param {string} id - ID de l'assignation
     */
    terminerAssignation: async (id) => {
        try {
            const response = await api.post(`/admin/livreur-assignations/${id}/terminer`);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur terminerAssignation:', error);
            throw error;
        }
    },
    
    /**
     * Récupérer les livreurs disponibles pour assignation à un gestionnaire
     * @param {string} gestionnaireId - ID du gestionnaire
     */
    getLivreursDisponibles: async (gestionnaireId) => {
        try {
            const response = await api.get('/admin/livreur-assignations/disponibles', {
                params: { gestionnaire_id: gestionnaireId }
            });
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return { natifs: [], autres: [], deja_assignes: [] };
        } catch (error) {
            console.error('❌ Erreur getLivreursDisponibles:', error);
            return { natifs: [], autres: [], deja_assignes: [] };
        }
    },
    
    // ==================== MÉTHODES UTILITAIRES ====================
    
    /**
     * Formatter une assignation pour l'affichage
     */
    formatAssignation: (assignation) => {
        if (!assignation) return null;
        
        return {
            id: assignation.id,
            livreur_id: assignation.livreur_id,
            livreur_nom: assignation.livreur?.user?.prenom + ' ' + assignation.livreur?.user?.nom || 'Inconnu',
            livreur_wilaya: assignation.livreur?.wilaya_id,
            gestionnaire_id: assignation.gestionnaire_id,
            gestionnaire_nom: assignation.gestionnaire?.user?.prenom + ' ' + assignation.gestionnaire?.user?.nom || 'Inconnu',
            wilaya_cible: assignation.wilaya_cible,
            date_debut: assignation.date_debut,
            date_fin: assignation.date_fin,
            status: assignation.status,
            motif: assignation.motif,
            created_by: assignation.created_by,
            createur_nom: assignation.createur?.prenom + ' ' + assignation.createur?.nom,
            created_at: assignation.created_at,
            updated_at: assignation.updated_at
        };
    },
    
    /**
     * Obtenir le libellé du statut
     */
    getStatusLabel: (status) => {
        const labels = {
            'active': 'Active',
            'terminee': 'Terminée',
            'annulee': 'Annulée'
        };
        return labels[status] || status;
    },
    
    /**
     * Obtenir la couleur du statut
     */
    getStatusColor: (status) => {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'terminee': 'bg-gray-100 text-gray-800',
            'annulee': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }
};

export default livreurAssignationService;