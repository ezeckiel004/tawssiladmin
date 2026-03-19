// src/services/commissionService.js
import api from './api';

// Réutiliser la fonction downloadFile du service existant
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

const commissionService = {
    // ==================== CONFIGURATION ====================
    
    /**
     * Récupérer la configuration des commissions
     */
    getConfig: async () => {
        try {
            const response = await api.get('/admin/commissions/config');
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getConfig:', error);
            throw error;
        }
    },

    /**
     * Mettre à jour la configuration des commissions
     * @param {Object} data - { depart, arrivee }
     */
    updateConfig: async (data) => {
        try {
            const response = await api.put('/admin/commissions/config', data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur updateConfig:', error);
            throw error;
        }
    },

    /**
     * Simuler un changement de configuration
     * @param {Object} data - { depart, arrivee }
     */
    simulerConfig: async (data) => {
        try {
            const response = await api.post('/admin/commissions/simuler', data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur simulerConfig:', error);
            throw error;
        }
    },

    /**
     * Récupérer l'historique des modifications
     */
    getHistoriqueConfig: async () => {
        try {
            const response = await api.get('/admin/commissions/historique');
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getHistoriqueConfig:', error);
            throw error;
        }
    },

    // ==================== GAINS DES GESTIONNAIRES ====================

    /**
     * Récupérer les gains d'un gestionnaire
     * @param {string} gestionnaireId - ID du gestionnaire
     * @param {Object} params - { date_debut, date_fin }
     */
    getGainsGestionnaire: async (gestionnaireId, params = {}) => {
        try {
            const response = await api.get(`/admin/commissions/gestionnaires/${gestionnaireId}/gains`, { params });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getGainsGestionnaire:', error);
            throw error;
        }
    },

    /**
     * Récupérer les statistiques globales des commissions
     * @param {Object} params - { periode, date_debut, date_fin }
     */
    getStatistiquesGlobales: async (params = {}) => {
        try {
            const response = await api.get('/admin/commissions/statistiques', { params });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getStatistiquesGlobales:', error);
            throw error;
        }
    },

    /**
     * Exporter les statistiques des commissions
     * @param {Object} params - { periode, date_debut, date_fin, format }
     */
    exportStatistiques: async (params = {}) => {
        try {
            const format = params.format || 'excel';
            const response = await api.get('/admin/commissions/export', {
                params,
                responseType: 'blob'
            });
            
            const date = new Date().toISOString().slice(0, 10);
            const filename = `commissions-${date}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
            
            downloadFile(response, filename);
            return { success: true };
        } catch (error) {
            console.error('❌ Erreur exportStatistiques:', error);
            throw error;
        }
    },

    // ==================== GESTION DES PAIEMENTS ====================

    /**
     * Marquer plusieurs gains comme payés (admin)
     * @param {Array} gainIds - Liste des IDs des gains à marquer
     * @param {string} note - Note optionnelle
     */
    marquerPayes: async (gainIds, note = null) => {
        try {
            const response = await api.post('/admin/traitement-commissions/payer-multiple', { 
                gain_ids: gainIds,
                note: note 
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur marquerPayes:', error);
            throw error;
        }
    },

    /**
     * Marquer un gain spécifique comme payé (admin)
     * @param {string} gainId - ID du gain
     * @param {string} note - Note optionnelle
     */
    marquerPaye: async (gainId, note = null) => {
        try {
            const response = await api.post(`/admin/traitement-commissions/payer/${gainId}`, { 
                note: note 
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur marquerPaye:', error);
            throw error;
        }
    },

    /**
     * Annuler un gain (admin)
     * @param {string} gainId - ID du gain
     * @param {string} note - Note optionnelle
     */
    annulerGain: async (gainId, note = null) => {
        try {
            const response = await api.post(`/admin/traitement-commissions/annuler/${gainId}`, { 
                note: note 
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur annulerGain:', error);
            throw error;
        }
    },

    /**
     * Récupérer les statistiques des paiements
     */
    getStatistiquesPaiements: async () => {
        try {
            const response = await api.get('/admin/traitement-commissions/statistiques');
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getStatistiquesPaiements:', error);
            throw error;
        }
    },

    // ==================== DEMANDES DE PAIEMENT (Gestionnaire) ====================

    /**
     * Récupérer les gains en attente du gestionnaire connecté
     */
    getMesGainsEnAttente: async () => {
        try {
            const response = await api.get('/manager/gains/en-attente');
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getMesGainsEnAttente:', error);
            throw error;
        }
    },

    /**
     * Demander le paiement d'un gain spécifique (gestionnaire)
     * @param {string} gainId - ID du gain
     */
    demanderPaiement: async (gainId) => {
        try {
            const response = await api.post(`/manager/gains/demander/${gainId}`);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur demanderPaiement:', error);
            throw error;
        }
    },

    /**
     * Demander le paiement de plusieurs gains (gestionnaire)
     * @param {Array} gainIds - Liste des IDs des gains
     */
    demanderPaiementMultiple: async (gainIds) => {
        try {
            const response = await api.post('/manager/gains/demander-multiple', { 
                gain_ids: gainIds 
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur demanderPaiementMultiple:', error);
            throw error;
        }
    },

    /**
     * Récupérer l'historique des gains du gestionnaire connecté
     * @param {Object} params - { periode, date_debut, date_fin }
     */
    getHistoriqueGains: async (params = {}) => {
        try {
            const response = await api.get('/manager/gains', { params });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getHistoriqueGains:', error);
            throw error;
        }
    },

    // ==================== UTILITAIRES ====================

    /**
     * Formater un montant de commission
     * @param {number} montant
     * @returns {string}
     */
    formatCommission: (montant) => {
        if (montant === null || montant === undefined) return '0 DA';
        return new Intl.NumberFormat('fr-DZ', {
            style: 'currency',
            currency: 'DZD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(montant).replace('DZD', 'DA').trim();
    },

    /**
     * Formater un pourcentage
     * @param {number} valeur
     * @returns {string}
     */
    formatPourcentage: (valeur) => {
        if (valeur === null || valeur === undefined) return '0%';
        return valeur + '%';
    },

    /**
     * Calculer la part admin automatiquement
     * @param {number} depart
     * @param {number} arrivee
     * @returns {number}
     */
    calculerPartAdmin: (depart, arrivee) => {
        return 100 - (depart + arrivee);
    },

    /**
     * Valider les pourcentages
     * @param {number} depart
     * @param {number} arrivee
     * @returns {Object}
     */
    validerPourcentages: (depart, arrivee) => {
        const total = depart + arrivee;
        return {
            valide: total <= 100,
            total,
            admin: 100 - total,
            erreurs: total > 100 ? ['La somme des commissions ne peut pas dépasser 100%'] : []
        };
    },

    /**
     * Obtenir le libellé d'un statut de gain
     * @param {string} statut
     * @returns {string}
     */
    getStatutLibelle: (statut) => {
        const libelles = {
            'en_attente': 'En attente',
            'demande_envoyee': 'Demande envoyée',
            'paye': 'Payé',
            'annule': 'Annulé'
        };
        return libelles[statut] || statut;
    },

    /**
     * Obtenir la couleur CSS d'un statut
     * @param {string} statut
     * @returns {string}
     */
    getStatutCouleur: (statut) => {
        const couleurs = {
            'en_attente': 'bg-yellow-100 text-yellow-800',
            'demande_envoyee': 'bg-blue-100 text-blue-800',
            'paye': 'bg-green-100 text-green-800',
            'annule': 'bg-red-100 text-red-800'
        };
        return couleurs[statut] || 'bg-gray-100 text-gray-800';
    }
};

export default commissionService;