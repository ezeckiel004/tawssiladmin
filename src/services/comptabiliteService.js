// src/services/comptabiliteService.js
import api from './api';

// Fonction utilitaire pour télécharger un fichier
const downloadFile = (response, filename) => {
    const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }, 100);
};

const comptabiliteService = {
    // ==================== BILAN GLOBAL (Admin) ====================
    
    /**
     * Récupérer le bilan global de toute la plateforme
     * @param {Object} params - { periode, date, date_debut, date_fin }
     */
    getBilanGlobal: async (params = {}) => {
        try {
            const response = await api.get('/admin/comptabilite/bilan-global', { params });
            return response.data;
        } catch (error) {
            console.error('Erreur getBilanGlobal:', error);
            throw error;
        }
    },

    /**
     * Exporter le bilan global
     * @param {Object} params - { periode, date_debut, date_fin, format }
     */
    exportBilanGlobal: async (params = {}) => {
        try {
            const format = params.format || 'excel';
            const response = await api.get('/admin/comptabilite/bilan-global/export', {
                params,
                responseType: 'blob'
            });
            
            const date = new Date().toISOString().slice(0, 10);
            const filename = `bilan-global-${date}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
            
            downloadFile(response, filename);
            return { success: true };
        } catch (error) {
            console.error('Erreur exportBilanGlobal:', error);
            throw error;
        }
    },

    // ==================== BILAN GESTIONNAIRE ====================
    
    /**
     * Récupérer le bilan du gestionnaire connecté (sa wilaya)
     * @param {Object} params - { periode, date, date_debut, date_fin }
     */
    getBilanGestionnaire: async (params = {}) => {
        try {
            const response = await api.get('/admin/comptabilite/bilan-gestionnaire', { params });
            return response.data;
        } catch (error) {
            console.error('Erreur getBilanGestionnaire:', error);
            throw error;
        }
    },

    /**
     * Exporter le bilan du gestionnaire
     * @param {Object} params - { periode, date_debut, date_fin, format }
     */
    exportBilanGestionnaire: async (params = {}) => {
        try {
            const format = params.format || 'excel';
            const response = await api.get('/admin/comptabilite/bilan-gestionnaire/export', {
                params,
                responseType: 'blob'
            });
            
            const date = new Date().toISOString().slice(0, 10);
            const filename = `bilan-gestionnaire-${date}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
            
            downloadFile(response, filename);
            return { success: true };
        } catch (error) {
            console.error('Erreur exportBilanGestionnaire:', error);
            throw error;
        }
    },

    /**
     * Récupérer le bilan d'une wilaya spécifique (admin uniquement)
     * @param {string} wilayaId - Code de la wilaya (ex: '16')
     * @param {Object} params - { periode, date, date_debut, date_fin }
     */
    getBilanWilaya: async (wilayaId, params = {}) => {
        try {
            const response = await api.get(`/admin/comptabilite/bilan-wilaya/${wilayaId}`, { params });
            return response.data;
        } catch (error) {
            console.error('Erreur getBilanWilaya:', error);
            throw error;
        }
    },

    /**
     * Exporter le bilan d'une wilaya spécifique (admin uniquement)
     * @param {string} wilayaId - Code de la wilaya
     * @param {Object} params - { periode, date_debut, date_fin, format }
     */
    exportBilanWilaya: async (wilayaId, params = {}) => {
        try {
            const format = params.format || 'excel';
            const response = await api.get(`/admin/comptabilite/bilan-wilaya/${wilayaId}/export`, {
                params,
                responseType: 'blob'
            });
            
            const date = new Date().toISOString().slice(0, 10);
            const nomWilaya = params.nomWilaya || wilayaId;
            const filename = `bilan-${nomWilaya}-${date}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
            
            downloadFile(response, filename);
            return { success: true };
        } catch (error) {
            console.error('Erreur exportBilanWilaya:', error);
            throw error;
        }
    },

    // ==================== MÉTHODES UTILITAIRES ====================

    /**
     * Formater un montant en DA
     */
    formatMontant: (montant) => {
        if (montant === null || montant === undefined) return '0 DA';
        return new Intl.NumberFormat('fr-DZ', {
            style: 'currency',
            currency: 'DZD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(montant).replace('DZD', 'DA').trim();
    },

    /**
     * Formater un nombre
     */
    formatNombre: (nombre) => {
        if (nombre === null || nombre === undefined) return '0';
        return new Intl.NumberFormat('fr-FR').format(nombre);
    },

    /**
     * Formater un pourcentage
     */
    formatPourcentage: (valeur) => {
        if (valeur === null || valeur === undefined) return '0%';
        return valeur + '%';
    },

    /**
     * Formater une date
     */
    formatDate: (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return '-';
        }
    },

    /**
     * Obtenir la couleur selon la tendance
     */
    getTendanceColor: (evolution) => {
        if (evolution > 0) return 'text-green-600';
        if (evolution < 0) return 'text-red-600';
        return 'text-gray-600';
    },

    /**
     * Obtenir l'icône selon la tendance
     */
    getTendanceIcon: (evolution) => {
        if (evolution > 0) return '↑';
        if (evolution < 0) return '↓';
        return '→';
    }
};

export default comptabiliteService;