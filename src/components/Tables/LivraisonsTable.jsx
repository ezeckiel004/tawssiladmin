// src/components/Tables/LivraisonsTable.jsx
import React from "react";
import { EyeIcon, TrashIcon, XCircleIcon } from "@heroicons/react/24/outline";
import {
  FaClock,
  FaTruck,
  FaBox,
  FaRoute,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
} from "react-icons/fa";

const LivraisonsTable = ({
  livraisons,
  onViewDetail,
  onDelete,
  onCancel,
  getClientFullName,
  getClientTelephone,
  getDestinataireName,
  getDestinataireTelephone,
}) => {
  // Vérifier si une livraison est en mode dépôt client
  const isDepotClient = (livraison) => {
    return livraison?.demande_livraison?.depose_au_depot === true;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      en_attente: {
        color: "bg-yellow-100 text-yellow-800",
        label: "En attente",
        icon: FaClock,
      },
      prise_en_charge_ramassage: {
        color: "bg-blue-100 text-blue-800",
        label: "Prise en charge",
        icon: FaTruck,
      },
      ramasse: {
        color: "bg-purple-100 text-purple-800",
        label: "Ramasse",
        icon: FaBox,
      },
      en_transit: {
        color: "bg-indigo-100 text-indigo-800",
        label: "En transit",
        icon: FaRoute,
      },
      prise_en_charge_livraison: {
        color: "bg-orange-100 text-orange-800",
        label: "En livraison",
        icon: FaTruck,
      },
      livre: {
        color: "bg-green-100 text-green-800",
        label: "Livré",
        icon: FaCheckCircle,
      },
      annule: {
        color: "bg-red-100 text-red-800",
        label: "Annulé",
        icon: FaExclamationTriangle,
      },
    };

    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      label: status.replace(/_/g, " "),
      icon: FaExclamationTriangle,
    };

    const Icon = config.icon;

    return (
      <div className="flex items-center gap-2">
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-2 ${config.color}`}
        >
          <Icon className="w-3 h-3" />
          {config.label}
        </span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      });
    } catch {
      return "-";
    }
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return "Non définie";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date invalide";
    }
  };

  // Fonction pour extraire la wilaya d'une adresse
  const extractWilayaFromAddress = (address) => {
    if (!address || typeof address !== "string") return null;

    const wilayas = [
      "Adrar",
      "Chlef",
      "Laghouat",
      "Oum El Bouaghi",
      "Batna",
      "Béjaïa",
      "Biskra",
      "Béchar",
      "Blida",
      "Bouira",
      "Tamanrasset",
      "Tébessa",
      "Tlemcen",
      "Tiaret",
      "Tizi Ouzou",
      "Alger",
      "Djelfa",
      "Jijel",
      "Sétif",
      "Saïda",
      "Skikda",
      "Sidi Bel Abbès",
      "Annaba",
      "Guelma",
      "Constantine",
      "Médéa",
      "Mostaganem",
      "M'Sila",
      "Mascara",
      "Ouargla",
      "Oran",
      "El Bayadh",
      "Illizi",
      "Bordj Bou Arréridj",
      "Boumerdès",
      "El Tarf",
      "Tindouf",
      "Tissemsilt",
      "El Oued",
      "Khenchela",
      "Souk Ahras",
      "Tipaza",
      "Mila",
      "Aïn Defla",
      "Naâma",
      "Aïn Témouchent",
      "Ghardaïa",
      "Relizane",
    ];

    const addressLower = address.toLowerCase();

    for (const wilaya of wilayas) {
      const wilayaLower = wilaya.toLowerCase();
      const regex = new RegExp(`\\b${wilayaLower}\\b`, "i");
      if (regex.test(addressLower)) {
        return wilaya;
      }

      const wilayaNoAccents = wilayaLower
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const regexNoAccents = new RegExp(`\\b${wilayaNoAccents}\\b`, "i");
      if (regexNoAccents.test(addressLower)) {
        return wilaya;
      }
    }

    return null;
  };

  // Fonction pour afficher la localisation
  const getLocationDisplay = (livraison) => {
    const wilayaDepart = livraison.demande_livraison?.addresse_depot
      ? extractWilayaFromAddress(livraison.demande_livraison.addresse_depot)
      : null;

    const wilayaArrivee = livraison.demande_livraison?.addresse_delivery
      ? extractWilayaFromAddress(livraison.demande_livraison.addresse_delivery)
      : livraison.demande_livraison?.wilaya || null;

    const commune = livraison.demande_livraison?.commune;

    if (!wilayaDepart && !wilayaArrivee && !commune) return "-";

    return (
      <div className="space-y-1">
        {wilayaDepart && (
          <div className="flex items-center gap-1 text-xs">
            <span className="font-medium text-blue-700">{wilayaDepart}</span>
            <span className="text-gray-400">→</span>
          </div>
        )}
        {wilayaArrivee && (
          <div className="text-xs font-medium text-green-700">
            {wilayaArrivee}
          </div>
        )}
        {commune && !wilayaDepart && !wilayaArrivee && (
          <div className="text-xs text-gray-700">{commune}</div>
        )}
      </div>
    );
  };

  // Fonction pour obtenir les informations du colis
  const getColisDisplay = (livraison) => {
    const colis = livraison.demande_livraison?.colis || {};
    const prixLivraison = livraison.demande_livraison?.prix;
    const prixColis = colis.colis_prix;

    return (
      <div className="space-y-1">
        <div className="text-sm font-medium text-gray-900">
          {colis.colis_label || "N/A"}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>{colis.poids || "0"} kg</span>
          <span>•</span>
          <span>{colis.colis_type || "Standard"}</span>
        </div>
        {prixColis && (
          <div className="flex items-center gap-1 text-xs font-medium text-purple-600">
            <FaMoneyBillWave className="w-3 h-3" />
            <span>Colis: {prixColis} DA</span>
          </div>
        )}
        {prixLivraison && (
          <div className="flex items-center gap-1 text-xs font-medium text-green-600">
            <FaTruck className="w-3 h-3" />
            <span>Livraison: {prixLivraison} DA</span>
          </div>
        )}
      </div>
    );
  };

  const getCreationDate = (livraison) => {
    const dateFields = [
      "created_at",
      "createdAt",
      "created_date",
      "date_creation",
    ];

    for (const field of dateFields) {
      if (livraison[field]) {
        return livraison[field];
      }
    }

    if (livraison.demande_livraison) {
      for (const field of dateFields) {
        if (livraison.demande_livraison[field]) {
          return livraison.demande_livraison[field];
        }
      }
    }

    return null;
  };

  const canDelete = (livraison) => {
    return livraison.status !== "livre";
  };

  const canCancel = (livraison) => {
    return livraison.status !== "annule" && livraison.status !== "livre";
  };

  const handleDelete = (e, id, status) => {
    e.stopPropagation();
    onDelete(id);
  };

  const handleCancel = (e, id, status) => {
    e.stopPropagation();
    onCancel(id);
  };

  const sortedLivraisons = [...livraisons].sort((a, b) => {
    const dateA = getCreationDate(a);
    const dateB = getCreationDate(b);

    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    return new Date(dateB) - new Date(dateA);
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              ID / Mode
            </th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="w-3 h-3" />
                <span>Date création</span>
              </div>
            </th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="w-3 h-3" />
                <span>Trajet</span>
              </div>
            </th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              <div className="flex items-center gap-2">
                <FaUser className="w-3 h-3" />
                <span>Client & Destinataire</span>
              </div>
            </th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              <div className="flex items-center gap-2">
                <FaBox className="w-3 h-3" />
                <span>Colis & Prix</span>
              </div>
            </th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Statut
            </th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Livreurs
            </th>
            <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedLivraisons.map((livraison) => {
            const isAnnule = livraison.status === "annule";
            const isLivre = livraison.status === "livre";
            const showDeleteBtn = canDelete(livraison);
            const showCancelBtn = canCancel(livraison);
            const creationDate = getCreationDate(livraison);
            const depotClient = isDepotClient(livraison);

            // Obtenir les informations via les fonctions passées en props
            const clientName = getClientFullName(livraison);
            const clientPhone = getClientTelephone(livraison);
            const destinataireName = getDestinataireName(livraison);
            const destinatairePhone = getDestinataireTelephone(livraison);

            return (
              <tr
                key={livraison.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onViewDetail(livraison.id)}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    #{livraison.id.substring(0, 8)}...
                  </div>
                  <div className="text-sm text-gray-500">
                    PIN: {livraison.code_pin}
                  </div>
                  {/* Badge Dépôt client */}
                  {depotClient && (
                    <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <FaBox className="w-3 h-3 mr-1" />
                      Dépôt client
                    </span>
                  )}
                  {isAnnule && (
                    <div className="text-xs text-red-600 mt-1">⚠️ Annulée</div>
                  )}
                  {isLivre && (
                    <div className="text-xs text-green-600 mt-1">✅ Livrée</div>
                  )}
                 </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    {creationDate ? (
                      <span className="text-sm font-medium text-gray-900">
                        {formatFullDate(creationDate)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </div>
                 </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getLocationDisplay(livraison)}
                 </td>
                <td className="px-4 py-4">
                  <div className="space-y-3">
                    {/* Client */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <FaUser className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        <span>{clientName}</span>
                      </div>
                      {clientPhone && clientPhone !== "Non spécifié" && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 ml-5">
                          <FaPhone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="font-mono">{clientPhone}</span>
                        </div>
                      )}
                    </div>

                    {/* Destinataire */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FaUser className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <span className="font-medium">{destinataireName}</span>
                      </div>
                      {destinatairePhone &&
                        destinatairePhone !== "Non spécifié" && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 ml-5">
                            <FaPhone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="font-mono">
                              {destinatairePhone}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                 </td>
                <td className="px-4 py-4">{getColisDisplay(livraison)}</td>
                <td className="px-4 py-4">
                  {getStatusBadge(livraison.status)}
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <div>Ramassage: {formatDate(livraison.date_ramassage)}</div>
                    <div>Livraison: {formatDate(livraison.date_livraison)}</div>
                  </div>
                 </td>
                <td className="px-4 py-4">
                  <div className="space-y-2">
                    {/* Ramasseur - caché si dépôt client */}
                    {!depotClient && (
                      <div>
                        <div className="text-xs text-gray-600">Ramasseur:</div>
                        <div className="text-sm font-medium">
                          {livraison.livreur_ramasseur ? (
                            `${livraison.livreur_ramasseur.prenom || ""} ${livraison.livreur_ramasseur.nom || ""}`.trim()
                          ) : (
                            <span className="text-gray-400">Non attribué</span>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Distributeur */}
                    <div>
                      <div className="text-xs text-gray-600">Distributeur:</div>
                      <div className="text-sm font-medium">
                        {livraison.livreur_distributeur ? (
                          `${livraison.livreur_distributeur.prenom || ""} ${livraison.livreur_distributeur.nom || ""}`.trim()
                        ) : (
                          <span className="text-gray-400">Non attribué</span>
                        )}
                      </div>
                    </div>
                    {/* Indicateur dépôt client pour les livreurs */}
                    {depotClient && (
                      <div className="text-xs text-blue-600 mt-1">
                        ⚡ Pas de ramasseur nécessaire
                      </div>
                    )}
                  </div>
                 </td>
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onViewDetail(livraison.id)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 w-full"
                      title="Voir les détails"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Voir
                    </button>
                    {showDeleteBtn && (
                      <button
                        onClick={(e) =>
                          handleDelete(e, livraison.id, livraison.status)
                        }
                        className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 w-full"
                        title="Supprimer la livraison"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Supprimer
                      </button>
                    )}
                    {showCancelBtn && (
                      <button
                        onClick={(e) =>
                          handleCancel(e, livraison.id, livraison.status)
                        }
                        className="flex items-center justify-center gap-1 px-3 py-1.5 text-sm text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 w-full"
                        title="Annuler la livraison"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        Annuler
                      </button>
                    )}
                  </div>
                 </td>
               </tr>
            );
          })}
        </tbody>
      </table>

      {livraisons.length === 0 && (
        <div className="text-center py-12">
          <FaBox className="w-12 h-12 mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Aucune livraison trouvée
          </h3>
          <p className="mt-1 text-gray-500">
            Aucune livraison ne correspond à vos critères.
          </p>
        </div>
      )}
    </div>
  );
};

export default LivraisonsTable;