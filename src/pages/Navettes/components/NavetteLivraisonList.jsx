// src/pages/Navettes/components/NavetteLivraisonList.jsx
import React from "react";
import {
  FaTrash,
  FaMapMarkerAlt,
  FaWeightHanging,
  FaMoneyBillWave,
  FaUser,
  FaQrcode,
  FaTruck,
  FaCalendarAlt
} from "react-icons/fa";
import comptabiliteService from "../../../services/comptabiliteService";

const NavetteLivraisonList = ({ livraisons = [], onRemove, canRemove = false }) => {
  if (!livraisons || livraisons.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <FaTruck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Aucune livraison dans cette navette</p>
        <p className="text-xs text-gray-400 mt-1">Ajoutez des livraisons pour commencer</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Livraison</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poids</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordre</th>
            {canRemove && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {livraisons.map((item, index) => {
            // Récupérer la demande de livraison
            const demande = item.demande_livraison || item.demandeLivraison;
            
            // Récupérer le client depuis la demande (c'est celui qui a fait la commande)
            const client = demande?.client?.user;
            
            // Récupérer le colis
            const colis = demande?.colis;

            // Référence de la demande
            const reference = demande?.reference || item.reference || `LIV-${item.id?.substring(0, 8)}`;

            // Client (celui qui a fait la demande)
            const clientNom = client?.prenom && client?.nom 
              ? `${client.prenom} ${client.nom}` 
              : client?.nom || 'Client inconnu';

            // Destination (adresse de livraison)
            const destination = demande?.addresse_delivery || item.destination || 'Non spécifiée';

            // Informations de la livraison
            const livraisonDate = item.date_livraison 
              ? new Date(item.date_livraison).toLocaleDateString('fr-FR') 
              : demande?.date_livraison_prevue 
                ? new Date(demande.date_livraison_prevue).toLocaleDateString('fr-FR')
                : 'Non planifiée';
            
            const livraisonStatus = item.status || 'en_attente';
            
            // Traduction du statut
            const getStatusLabel = (status) => {
              const statusMap = {
                'en_attente': 'En attente',
                'prise_en_charge_ramassage': 'Prise en charge',
                'ramasse': 'Ramasse',
                'en_transit': 'En transit',
                'prise_en_charge_livraison': 'En livraison',
                'livre': 'Livrée',
                'annule': 'Annulée'
              };
              return statusMap[status] || status;
            };

            const getStatusColor = (status) => {
              const colorMap = {
                'en_attente': 'bg-gray-100 text-gray-800',
                'prise_en_charge_ramassage': 'bg-blue-100 text-blue-800',
                'ramasse': 'bg-indigo-100 text-indigo-800',
                'en_transit': 'bg-yellow-100 text-yellow-800',
                'prise_en_charge_livraison': 'bg-orange-100 text-orange-800',
                'livre': 'bg-green-100 text-green-800',
                'annule': 'bg-red-100 text-red-800'
              };
              return colorMap[status] || 'bg-gray-100 text-gray-800';
            };

            // Poids
            const poids = colis?.poids || 0;

            // Prix
            const prix = colis?.colis_prix || 0;

            // Ordre de chargement
            const ordre = item.pivot?.ordre_chargement || index + 1;

            return (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FaQrcode className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {reference}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {item.id?.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <FaUser className="text-gray-400 w-3 h-3" />
                    <span className="text-sm text-gray-900">
                      {clientNom}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-gray-400 w-3 h-3 flex-shrink-0" />
                    <span className="text-sm text-gray-900 break-words max-w-xs">
                      {destination}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="text-gray-400 w-3 h-3" />
                      <span className="text-sm text-gray-600">
                        {livraisonDate}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(livraisonStatus)}`}>
                      {getStatusLabel(livraisonStatus)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <FaWeightHanging className="text-gray-400 w-3 h-3" />
                    <span className="text-sm text-gray-900">
                      {poids} kg
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <FaMoneyBillWave className="text-gray-400 w-3 h-3" />
                    <span className="text-sm font-semibold text-green-600">
                      {comptabiliteService.formatMontant(prix)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    #{ordre}
                  </span>
                </td>
                {canRemove && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
                      title="Retirer de la navette"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default NavetteLivraisonList;