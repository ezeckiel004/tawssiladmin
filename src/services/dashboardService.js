// src/services/dashboardService.js
import api from './api';

const dashboardService = {
    // Récupérer toutes les stats du dashboard
    getDashboardStats: async () => {
        try {
            console.log('📡 Appel API /admin/dashboard...');
            const response = await api.get('/admin/dashboard');
            console.log('✅ Réponse reçue:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur dashboardService.getDashboardStats:', error);
            if (error.response) {
                console.error('📦 Données de l\'erreur:', error.response.data);
                console.error('📊 Status:', error.response.status);
            }
            throw error;
        }
    },

    // Récupérer les données pour les graphiques
    getChartData: async (period = 'week') => {
        try {
            const response = await api.get('/admin/dashboard/charts', { 
                params: { period } 
            });
            return response.data;
        } catch (error) {
            console.error('Erreur dashboardService.getChartData:', error);
            throw error;
        }
    },

    // Formater les montants
    formatMontant: (montant) => {
        if (montant === null || montant === undefined) return '0 DA';
        return new Intl.NumberFormat('fr-DZ', {
            style: 'currency',
            currency: 'DZD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(montant).replace('DZD', 'DA').trim();
    },

    // Formater les dates
    formatDate: (dateString) => {
        if (!dateString) return '—';
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '—';
        }
    },

    // Formater le temps écoulé
    formatTimeAgo: (dateString) => {
        if (!dateString) return '';
        try {
            const diffMs = Date.now() - new Date(dateString).getTime();
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 1) return "À l'instant";
            if (diffMins < 60) return `Il y a ${diffMins} min`;
            if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)} h`;
            return `Il y a ${Math.floor(diffMins / 1440)} j`;
        } catch {
            return '';
        }
    },

    // Obtenir la couleur selon le statut
    getStatusColor: (status) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        const s = status.toLowerCase();
        if (s.includes('termine') || s.includes('livre'))
            return 'bg-green-100 text-green-800';
        if (s.includes('cours') || s.includes('pending'))
            return 'bg-yellow-100 text-yellow-800';
        if (s.includes('annule'))
            return 'bg-red-100 text-red-800';
        if (s.includes('attente'))
            return 'bg-blue-100 text-blue-800';
        return 'bg-gray-100 text-gray-800';
    },

    // Obtenir le libellé du statut
    getStatusLabel: (status) => {
        if (!status) return 'Inconnu';
        const s = status.toLowerCase();
        if (s.includes('termine') || s.includes('livre')) return 'Terminée';
        if (s.includes('cours') || s.includes('pending')) return 'En cours';
        if (s.includes('annule')) return 'Annulée';
        if (s.includes('attente')) return 'En attente';
        return status;
    }
};

export default dashboardService;