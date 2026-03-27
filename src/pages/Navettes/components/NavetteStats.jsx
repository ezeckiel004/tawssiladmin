// src/pages/Navettes/components/NavetteStats.jsx
import React from 'react';
import {
    FaTruck,
    FaBoxes,
    FaRoad,
    FaClock,
    FaGasPump,
    FaMoneyBillWave,
    FaPercentage,
    FaCalendarAlt,
    FaBuilding,
    FaCheckCircle,
    FaTimesCircle,
    FaSpinner,
    FaChartLine
} from 'react-icons/fa';
import comptabiliteService from '../../../services/comptabiliteService';

const NavetteStats = ({ navette, stats = null }) => {
    if (!navette) return null;

    const formatMontant = (montant) => {
        return comptabiliteService.formatMontant(montant || 0);
    };

    const formatDuree = (minutes) => {
        if (!minutes) return 'N/A';
        const heures = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${heures}h${mins > 0 ? ` ${mins}min` : ''}`;
    };

    const getStatusColor = (status) => {
        const colors = {
            'planifiee': 'bg-blue-100 text-blue-800',
            'en_cours': 'bg-yellow-100 text-yellow-800',
            'terminee': 'bg-green-100 text-green-800',
            'annulee': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'planifiee': return FaClock;
            case 'en_cours': return FaSpinner;
            case 'terminee': return FaCheckCircle;
            case 'annulee': return FaTimesCircle;
            default: return FaClock;
        }
    };

    const StatusIcon = getStatusIcon(navette.status);

    const nbLivraisons = navette.nb_livraisons || navette.livraisons?.length || 0;
    const tauxRemplissage = navette.taux_remplissage || 
        (navette.capacite_max > 0 ? (nbLivraisons / navette.capacite_max) * 100 : 0);
    
    const revenuEstime = (navette.prix_base || 0) + (nbLivraisons * (navette.prix_par_livraison || 0));
    const revenuReel = navette.revenu_reel || revenuEstime;

    const dureeEstimee = navette.duree_estimee || 
        (navette.distance_km ? Math.round(navette.distance_km / 70 * 60) : null);
    
    const dureeReelle = navette.duree_reelle_minutes || null;

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaChartLine className="text-primary-600" />
                    Aperçu général
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FaTruck className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm text-gray-600">Statut</span>
                        </div>
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(navette.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            {navette.status === 'planifiee' ? 'Planifiée' :
                             navette.status === 'en_cours' ? 'En cours' :
                             navette.status === 'terminee' ? 'Terminée' : 'Annulée'}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FaBoxes className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-600">Livraisons</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{nbLivraisons}</p>
                        <p className="text-xs text-gray-500">Capacité: {navette.capacite_max || 0}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <FaRoad className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-sm text-gray-600">Distance</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {navette.distance_km ? `${Math.round(navette.distance_km)} km` : 'N/A'}
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <FaPercentage className="w-5 h-5 text-yellow-600" />
                            </div>
                            <span className="text-sm text-gray-600">Remplissage</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{Math.round(tauxRemplissage)}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div
                                className="bg-primary-600 h-1.5 rounded-full"
                                style={{ width: `${Math.min(tauxRemplissage, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaClock className="text-primary-600" />
                    Chronométrage
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Départ</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm text-gray-600">Date prévue</span>
                                <span className="font-medium">
                                    {navette.date_depart ? new Date(navette.date_depart).toLocaleDateString('fr-FR') : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm text-gray-600">Heure prévue</span>
                                <span className="font-medium">{navette.heure_depart || 'N/A'}</span>
                            </div>
                            {navette.date_depart_reelle && (
                                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                    <span className="text-sm text-green-600">Départ réel</span>
                                    <span className="font-medium text-green-700">
                                        {new Date(navette.date_depart_reelle).toLocaleTimeString('fr-FR')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Arrivée</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm text-gray-600">Date prévue</span>
                                <span className="font-medium">
                                    {navette.date_arrivee_prevue ? new Date(navette.date_arrivee_prevue).toLocaleDateString('fr-FR') : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm text-gray-600">Heure prévue</span>
                                <span className="font-medium">{navette.heure_arrivee || 'N/A'}</span>
                            </div>
                            {navette.date_arrivee_reelle && (
                                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                    <span className="text-sm text-green-600">Arrivée réelle</span>
                                    <span className="font-medium text-green-700">
                                        {new Date(navette.date_arrivee_reelle).toLocaleTimeString('fr-FR')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {(dureeEstimee || dureeReelle) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4">
                            {dureeEstimee && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Durée estimée</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {formatDuree(dureeEstimee)}
                                    </p>
                                </div>
                            )}
                            {dureeReelle && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Durée réelle</p>
                                    <p className="text-lg font-semibold text-green-600">
                                        {formatDuree(dureeReelle)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaMoneyBillWave className="text-primary-600" />
                    Aspects financiers
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Tarification</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm text-gray-600">Prix de base</span>
                                <span className="font-medium">{formatMontant(navette.prix_base)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm text-gray-600">Prix par livraison</span>
                                <span className="font-medium">{formatMontant(navette.prix_par_livraison)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                <span className="text-sm text-blue-600">Total estimé</span>
                                <span className="font-bold text-blue-700">{formatMontant(revenuEstime)}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Coûts</h4>
                        <div className="space-y-2">
                            {navette.carburant_estime && (
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-600">Carburant estimé</span>
                                    <span className="font-medium">{formatMontant(navette.carburant_estime)}</span>
                                </div>
                            )}
                            {navette.peages_estimes && (
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-600">Péages estimés</span>
                                    <span className="font-medium">{formatMontant(navette.peages_estimes)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                                <span className="text-sm text-red-600">Total coûts</span>
                                <span className="font-bold text-red-700">
                                    {formatMontant((navette.carburant_estime || 0) + (navette.peages_estimes || 0))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Marge estimée</span>
                        <span className="text-xl font-bold text-green-600">
                            {formatMontant(revenuEstime - ((navette.carburant_estime || 0) + (navette.peages_estimes || 0)))}
                        </span>
                    </div>
                </div>
            </div>

            {stats && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaChartLine className="text-primary-600" />
                        Statistiques avancées
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.vitesse_moyenne && (
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{stats.vitesse_moyenne} km/h</p>
                                <p className="text-xs text-gray-500">Vitesse moyenne</p>
                            </div>
                        )}
                        {stats.conso_moyenne && (
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{stats.conso_moyenne} L/100km</p>
                                <p className="text-xs text-gray-500">Consommation moyenne</p>
                            </div>
                        )}
                        {stats.nb_arrets && (
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{stats.nb_arrets}</p>
                                <p className="text-xs text-gray-500">Points de livraison</p>
                            </div>
                        )}
                        {stats.temps_chargement && (
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{stats.temps_chargement} min</p>
                                <p className="text-xs text-gray-500">Tps chargement</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaCalendarAlt className="text-primary-600" />
                    Informations
                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Créée par</p>
                        <p className="font-medium">{navette.createur?.nom || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Date de création</p>
                        <p className="font-medium">
                            {navette.created_at ? new Date(navette.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                        </p>
                    </div>
                    {navette.hub && (
                        <div className="col-span-2">
                            <p className="text-gray-500">Hub</p>
                            <p className="font-medium">
                                {navette.hub.nom}
                                {navette.hub.email && ` - ${navette.hub.email}`}
                            </p>
                        </div>
                    )}
                    {navette.vehicule_immatriculation && (
                        <div className="col-span-2">
                            <p className="text-gray-500">Véhicule</p>
                            <p className="font-medium">{navette.vehicule_immatriculation}</p>
                        </div>
                    )}
                    {navette.notes && (
                        <div className="col-span-2">
                            <p className="text-gray-500">Notes</p>
                            <p className="text-gray-700 bg-gray-50 p-2 rounded mt-1">{navette.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NavetteStats;