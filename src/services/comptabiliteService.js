// src/services/comptabiliteService.js
import api from './api';

// Fonction utilitaire pour télécharger un fichier
const downloadFile = (response, filename) => {
    // Déterminer le type MIME à partir de l'extension
    const extension = filename.split('.').pop().toLowerCase();
    let mimeType = 'application/octet-stream';
    
    if (extension === 'pdf') {
        mimeType = 'application/pdf';
    } else if (extension === 'csv') {
        mimeType = 'text/csv';
    } else if (extension === 'xlsx') {
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }
    
    const blob = new Blob([response.data], { type: mimeType });
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
            console.error('❌ Erreur getBilanGlobal:', error);
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
            console.error('❌ Erreur exportBilanGlobal:', error);
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
            console.error('❌ Erreur getBilanGestionnaire:', error);
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
            console.error('❌ Erreur exportBilanGestionnaire:', error);
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
            console.error('❌ Erreur getBilanWilaya:', error);
            throw error;
        }
    },

    /**
     * Exporter le bilan d'une wilaya spécifique (admin uniquement)
     * @param {string} wilayaId - Code de la wilaya
     * @param {Object} params - { periode, date_debut, date_fin, format, nomWilaya }
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
            console.error('❌ Erreur exportBilanWilaya:', error);
            throw error;
        }
    },

    // ==================== WILAYAS ====================

    /**
     * Récupérer la liste des wilayas
     */
    getWilayas: async () => {
        try {
            const response = await api.get('/wilayas');
            console.log("📦 Réponse wilayas brute:", response.data);
            
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                return response.data.data;
            }
            
            if (Array.isArray(response.data)) {
                return response.data;
            }
            
            if (response.data && Array.isArray(response.data.data)) {
                return response.data.data;
            }
            
            console.warn("Format de réponse wilayas non reconnu:", response.data);
            return [];
            
        } catch (error) {
            console.error('❌ Erreur getWilayas:', error);
            throw error;
        }
    },

    // ==================== RAPPORTS ET GAINS ====================

    /**
     * Récupérer le rapport détaillé des gains
     * @param {Object} params - { periode, date, date_debut, date_fin }
     */
    getRapport: async (params = {}) => {
        try {
            const response = await api.get('/admin/comptabilite/rapport', { params });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getRapport:', error);
            throw error;
        }
    },

    /**
     * Récupérer le rapport des gains pour les gestionnaires
     * @param {Object} params - { periode, date, date_debut, date_fin, gestionnaire_id, wilaya_id }
     */
    getRapportGestionnaires: async (params = {}) => {
        try {
            const response = await api.get('/admin/comptabilite/rapport-gestionnaires', { params });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getRapportGestionnaires:', error);
            throw error;
        }
    },

    /**
     * Exporter le rapport des gestionnaires
     * @param {Object} params - { periode, date_debut, date_fin, format, gestionnaire_id, wilaya_id }
     */
    exportRapportGestionnaires: async (params = {}) => {
        try {
            const format = params.format || 'excel';
            
            // Créer une copie des paramètres sans le format pour éviter les doublons
            const { format: f, ...queryParams } = params;
            
            console.log(`📤 Export ${format} avec params:`, queryParams);
            
            const response = await api.get('/admin/comptabilite/rapport-gestionnaires/export', {
                params: {
                    ...queryParams,
                    format: format
                },
                responseType: 'blob'
            });
            
            // Vérifier le type de contenu de la réponse
            const contentType = response.headers['content-type'];
            console.log(`📥 Type de contenu reçu:`, contentType);
            
            // Déterminer l'extension et le type MIME corrects
            let extension = format;
            let mimeType = 'application/octet-stream';
            
            if (contentType.includes('pdf') || format === 'pdf') {
                extension = 'pdf';
                mimeType = 'application/pdf';
            } else if (contentType.includes('csv') || format === 'csv') {
                extension = 'csv';
                mimeType = 'text/csv';
            } else if (contentType.includes('spreadsheetml') || format === 'excel') {
                extension = 'xlsx';
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            }
            
            const date = new Date().toISOString().slice(0, 10);
            const filename = `rapport-gestionnaires-${date}.${extension}`;
            
            console.log(`💾 Téléchargement: ${filename} (${mimeType})`);
            
            // Créer un blob avec le bon type MIME
            const blob = new Blob([response.data], { type: mimeType });
            
            // Créer un lien de téléchargement
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
            
            return { success: true };
        } catch (error) {
            console.error('❌ Erreur exportRapportGestionnaires:', error);
            throw error;
        }
    },

    /**
     * Récupérer les gains détaillés par livraison
     * @param {Object} params - { periode, date_debut, date_fin, gestionnaire_id }
     */
    getGainsDetails: async (params = {}) => {
        try {
            const response = await api.get('/admin/comptabilite/gains', { params });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getGainsDetails:', error);
            throw error;
        }
    },

    /**
     * Exporter le rapport des gains
     * @param {Object} params - { periode, date_debut, date_fin, format }
     */
    exportRapport: async (params = {}) => {
        try {
            const format = params.format || 'excel';
            const response = await api.get('/admin/comptabilite/rapport/export', {
                params,
                responseType: 'blob'
            });
            
            const date = new Date().toISOString().slice(0, 10);
            const filename = `rapport-gains-${date}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
            
            downloadFile(response, filename);
            return { success: true };
        } catch (error) {
            console.error('❌ Erreur exportRapport:', error);
            throw error;
        }
    },

    /**
     * Récupérer les gains par gestionnaire
     * @param {string} gestionnaireId - ID du gestionnaire
     * @param {Object} params - { periode, date_debut, date_fin }
     */
    getGainsGestionnaire: async (gestionnaireId, params = {}) => {
        try {
            const response = await api.get(`/admin/comptabilite/gestionnaire/${gestionnaireId}/gains`, { params });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getGainsGestionnaire:', error);
            throw error;
        }
    },

    // ==================== GESTION DES PAIEMENTS ====================

    /**
     * Récupérer les impayés (gains en attente)
     * @param {Object} params - { periode, date_debut, date_fin }
     */
    getImpayes: async (params = {}) => {
        try {
            const response = await api.get('/admin/comptabilite/impayes', { params });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getImpayes:', error);
            throw error;
        }
    },

    /**
     * Marquer plusieurs gains comme payés
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
     * Marquer un gain spécifique comme payé
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
     * Annuler un gain
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

    // ==================== STATISTIQUES ====================

    /**
     * Récupérer les statistiques mensuelles
     * @param {Object} params - { annee }
     */
    getStatistiquesMensuelles: async (params = {}) => {
        try {
            const response = await api.get('/admin/comptabilite/statistiques-mensuelles', { params });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getStatistiquesMensuelles:', error);
            throw error;
        }
    },

    /**
     * Récupérer l'évolution mensuelle
     * @param {Object} params - { periode, date_debut, date_fin }
     */
    getEvolutionMensuelle: async (params = {}) => {
        try {
            const response = await api.get('/admin/comptabilite/evolution-mensuelle', { params });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getEvolutionMensuelle:', error);
            throw error;
        }
    },

    // ==================== MÉTHODES UTILITAIRES ====================

    /**
     * Formater un montant en DA
     * @param {number} montant
     * @returns {string}
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
     * @param {number} nombre
     * @returns {string}
     */
    formatNombre: (nombre) => {
        if (nombre === null || nombre === undefined) return '0';
        return new Intl.NumberFormat('fr-FR').format(nombre);
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
     * Formater une date
     * @param {string} dateString
     * @returns {string}
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
     * Formater une date avec heure
     * @param {string} dateString
     * @returns {string}
     */
    formatDateTime: (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '-';
        }
    },

    /**
     * Obtenir la couleur selon la tendance
     * @param {number} evolution
     * @returns {string}
     */
    getTendanceColor: (evolution) => {
        if (evolution > 0) return 'text-green-600';
        if (evolution < 0) return 'text-red-600';
        return 'text-gray-600';
    },

    /**
     * Obtenir la classe CSS pour le badge de statut
     * @param {string} status
     * @returns {string}
     */
    getStatusBadgeClass: (status) => {
        const badges = {
            'en_attente': 'bg-yellow-100 text-yellow-800',
            'demande_envoyee': 'bg-blue-100 text-blue-800',
            'paye': 'bg-green-100 text-green-800',
            'annule': 'bg-red-100 text-red-800',
            'prise_en_charge_ramassage': 'bg-blue-100 text-blue-800',
            'ramasse': 'bg-indigo-100 text-indigo-800',
            'en_transit': 'bg-purple-100 text-purple-800',
            'prise_en_charge_livraison': 'bg-orange-100 text-orange-800',
            'livre': 'bg-green-100 text-green-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    },

    /**
     * Obtenir le libellé du statut
     * @param {string} status
     * @returns {string}
     */
    getStatusLabel: (status) => {
        const labels = {
            'en_attente': 'En attente',
            'demande_envoyee': 'Demande envoyée',
            'paye': 'Payé',
            'annule': 'Annulé',
            'prise_en_charge_ramassage': 'Prise en charge ramassage',
            'ramasse': 'Ramasse',
            'en_transit': 'En transit',
            'prise_en_charge_livraison': 'Prise en charge livraison',
            'livre': 'Livré',
        };
        return labels[status] || status;
    },

    /**
     * Obtenir l'icône selon la tendance
     * @param {number} evolution
     * @returns {string}
     */
    getTendanceIcon: (evolution) => {
        if (evolution > 0) return '↑';
        if (evolution < 0) return '↓';
        return '→';
    },

    /**
     * Calculer le pourcentage
     * @param {number} valeur
     * @param {number} total
     * @returns {number}
     */
    calculerPourcentage: (valeur, total) => {
        if (!total || total === 0) return 0;
        return Math.round((valeur / total) * 100);
    },

    /**
     * Grouper un tableau par propriété
     * @param {Array} array
     * @param {string} key
     * @returns {Object}
     */
    groupBy: (array, key) => {
        return array.reduce((result, item) => {
            (result[item[key]] = result[item[key]] || []).push(item);
            return result;
        }, {});
    },

    /**
     * Trier les données par date
     * @param {Array} data
     * @param {string} dateField
     * @param {boolean} ascending
     * @returns {Array}
     */
    sortByDate: (data, dateField = 'date', ascending = false) => {
        return [...data].sort((a, b) => {
            const dateA = new Date(a[dateField]);
            const dateB = new Date(b[dateField]);
            return ascending ? dateA - dateB : dateB - dateA;
        });
    },

    /**
     * Filtrer les données par période
     * @param {Array} data
     * @param {string} dateField
     * @param {Date} debut
     * @param {Date} fin
     * @returns {Array}
     */
    filterByPeriod: (data, dateField = 'date', debut, fin) => {
        return data.filter(item => {
            const date = new Date(item[dateField]);
            return date >= debut && date <= fin;
        });
    }
};

export default comptabiliteService;