// src/pages/Livraisons/LivraisonDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaArrowLeft,
  FaTruck,
  FaBox,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaWeightHanging,
  FaBarcode,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaTimesCircle,
  FaRoute,
  FaPrint,
  FaDownload,
  FaQrcode,
  FaInfoCircle,
  FaTag,
  FaUserPlus,
  FaSyncAlt,
  FaTrashAlt,
  FaBan,
  FaShieldAlt,
  FaGlobeAfrica,
  FaCity,
  FaSignOutAlt,
  FaSignInAlt,
} from "react-icons/fa";
import livraisonService from "../../services/livraisonService";
import livreurService from "../../services/livreurService";

// Fonction pour extraire la wilaya d'une adresse
const extractWilayaFromAddress = (address) => {
  if (!address || typeof address !== "string") return null;

  // Liste complète des wilayas algériennes
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

  // Normaliser l'adresse pour la recherche
  const addressLower = address.toLowerCase();

  // Chercher une wilaya dans l'adresse (recherche exacte du mot)
  for (const wilaya of wilayas) {
    const wilayaLower = wilaya.toLowerCase();

    // Rechercher la wilaya comme mot complet
    const regex = new RegExp(`\\b${wilayaLower}\\b`, "i");
    if (regex.test(addressLower)) {
      return wilaya;
    }

    // Rechercher aussi sans accents pour 'Béjaïa', 'Béchar', etc.
    const wilayaNoAccents = wilayaLower
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const regexNoAccents = new RegExp(`\\b${wilayaNoAccents}\\b`, "i");
    if (regexNoAccents.test(addressLower)) {
      return wilaya;
    }
  }

  // Si pas trouvé, essayer par code postal
  const postalCodeRegex = /\b(0[1-9]|[1-4][0-9]|5[0-8])\d{3}\b/g;
  const postalCodes = address.match(postalCodeRegex);

  if (postalCodes && postalCodes.length > 0) {
    const firstTwoDigits = postalCodes[0].substring(0, 2);

    // Mapper les codes de wilaya
    const wilayaCodes = {
      "01": "Adrar",
      "02": "Chlef",
      "03": "Laghouat",
      "04": "Oum El Bouaghi",
      "05": "Batna",
      "06": "Béjaïa",
      "07": "Biskra",
      "08": "Béchar",
      "09": "Blida",
      10: "Bouira",
      11: "Tamanrasset",
      12: "Tébessa",
      13: "Tlemcen",
      14: "Tiaret",
      15: "Tizi Ouzou",
      16: "Alger",
      17: "Djelfa",
      18: "Jijel",
      19: "Sétif",
      20: "Saïda",
      21: "Skikda",
      22: "Sidi Bel Abbès",
      23: "Annaba",
      24: "Guelma",
      25: "Constantine",
      26: "Médéa",
      27: "Mostaganem",
      28: "M'Sila",
      29: "Mascara",
      30: "Ouargla",
      31: "Oran",
      32: "El Bayadh",
      33: "Illizi",
      34: "Bordj Bou Arréridj",
      35: "Boumerdès",
      36: "El Tarf",
      37: "Tindouf",
      38: "Tissemsilt",
      39: "El Oued",
      40: "Khenchela",
      41: "Souk Ahras",
      42: "Tipaza",
      43: "Mila",
      44: "Aïn Defla",
      45: "Naâma",
      46: "Aïn Témouchent",
      47: "Ghardaïa",
      48: "Relizane",
    };

    return wilayaCodes[firstTwoDigits] || null;
  }

  return null;
};

const LivraisonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [livraison, setLivraison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [livreurs, setLivreurs] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignType, setAssignType] = useState(null);
  const [selectedLivreur, setSelectedLivreur] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    fetchLivraison();
  }, [id]);

  const fetchLivraison = async () => {
    try {
      setLoading(true);
      const data = await livraisonService.smartGetLivraisonById(id);
      setLivraison(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des données de la livraison");
      console.error(error);
      navigate("/livraisons");
    } finally {
      setLoading(false);
    }
  };

  const fetchLivreurs = async () => {
    try {
      const livreursData = await livreurService.getLivreurOptions();
      setLivreurs(livreursData);
    } catch (error) {
      console.error("Erreur chargement livreurs:", error);
      toast.error("Erreur lors du chargement des livreurs");
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await livraisonService.smartUpdateStatus(id, newStatus);
      toast.success("Statut mis à jour avec succès");
      fetchLivraison();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const assignLivreur = async () => {
    if (!selectedLivreur) {
      toast.error("Veuillez sélectionner un livreur");
      return;
    }

    try {
      const typeCode = assignType === "ramasseur" ? 1 : 2;

      await livraisonService.smartAssignLivreur(id, selectedLivreur, typeCode);
      toast.success("Livreur attribué avec succès");
      setShowAssignModal(false);
      setSelectedLivreur("");
      fetchLivraison();
    } catch (error) {
      let errorMessage = "Erreur lors de l'attribution du livreur";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;

        if (errorMessage.includes("en transit")) {
          errorMessage =
            "Le distributeur ne peut être assigné que lorsque la livraison est en transit";
        } else if (errorMessage.includes("déjà été ramassé")) {
          errorMessage =
            "Le colis a déjà été ramassé, vous ne pouvez plus attribuer un autre ramasseur";
        } else if (errorMessage.includes("pas autorisé")) {
          errorMessage =
            "Seuls les administrateurs peuvent attribuer des livreurs";
        }
      }

      toast.error(errorMessage);
    }
  };

  const openAssignModal = async (type) => {
    if (!livraisonService.isAdmin()) {
      toast.error("Seuls les administrateurs peuvent attribuer des livreurs");
      return;
    }

    setAssignType(type);
    await fetchLivreurs();
    setShowAssignModal(true);
  };

  const deleteLivraison = async () => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer cette livraison ?")
    ) {
      return;
    }

    try {
      await livraisonService.smartDeleteLivraison(id);
      toast.success("Livraison supprimée avec succès");
      navigate("/livraisons");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleDownloadPDF = async () => {
    if (!livraison) {
      toast.error("Aucune donnée de livraison disponible");
      return;
    }

    setIsPrinting(true);

    try {
      await livraisonService.downloadPDF(id);
      toast.success("PDF téléchargé avec succès");
    } catch (error) {
      console.error("Erreur téléchargement PDF backend:", error);
      toast.error("Erreur lors du téléchargement du PDF.");
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrint = async () => {
    if (!livraison) {
      toast.error("Aucune donnée de livraison disponible");
      return;
    }

    setIsPrinting(true);

    try {
      const response = await livraisonService.smartGetPrintHTML(id);

      if (response.success && response.html) {
        const printContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Bordereau Livraison #${livraison.id}</title>
              <meta charset="UTF-8">
              <style>
                @page {
                  size: 100mm 150mm; /* 10cm x 15cm */
                  margin: 0;
                }
                @media print {
                  body {
                    margin: 0;
                    padding: 0;
                    width: 100mm;
                    height: 150mm;
                    overflow: hidden;
                  }
                  * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                  }
                }
                body {
                  margin: 0;
                  padding: 0;
                  width: 100mm;
                  height: 150mm;
                  font-family: Arial, sans-serif;
                  font-size: 9pt;
                  box-sizing: border-box;
                }
                .print-container {
                  width: 100mm;
                  height: 150mm;
                  position: relative;
                  page-break-inside: avoid;
                }
                /* Désactiver la mise à l'échelle automatique */
                img {
                  max-width: 100% !important;
                  height: auto !important;
                }
              </style>
            </head>
            <body onload="window.print(); window.close();">
              ${response.html}
            </body>
          </html>
        `;

        const printWindow = window.open(
          "",
          "_blank",
          `width=${window.innerWidth},height=${window.innerHeight},scrollbars=yes,resizable=yes`,
        );

        if (!printWindow) {
          throw new Error("Impossible d'ouvrir la fenêtre d'impression");
        }

        printWindow.document.write(printContent);
        printWindow.document.close();

        // Attendre que tout soit chargé avant d'imprimer
        printWindow.onload = function () {
          setTimeout(() => {
            printWindow.focus();

            // Option 1: Déclencher l'impression automatiquement
            printWindow.print();

            // Option 2: Laisser l'utilisateur déclencher manuellement (décommentez si besoin)
            // printWindow.document.body.innerHTML += `
            //   <div style="position:fixed;top:10px;right:10px;z-index:9999;">
            //     <button onclick="window.print()" style="padding:8px 16px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;">
            //       Imprimer
            //     </button>
            //   </div>
            // `;
          }, 500);
        };

        // Fermer la fenêtre après impression (si l'impression est automatique)
        printWindow.onafterprint = function () {
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        };
      } else {
        throw new Error("HTML d'impression non disponible");
      }
    } catch (error) {
      console.error("Erreur impression:", error);

      // Fallback: Ouvrir le PDF directement
      try {
        await livraisonService.downloadPDF(id);
      } catch (pdfError) {
        console.error("Erreur fallback PDF:", pdfError);
        toast.error(
          "Erreur lors de l'impression. Veuillez essayer le téléchargement PDF.",
        );
      }
    } finally {
      setTimeout(() => {
        setIsPrinting(false);
      }, 2000);
    }
  };

  const getStatusInfo = (status) => {
    const statusConfig = {
      en_attente: {
        icon: FaClock,
        color: "text-yellow-600 bg-yellow-100",
        label: "En attente",
        description: "En attente de traitement",
      },
      prise_en_charge_ramassage: {
        icon: FaTruck,
        color: "text-blue-600 bg-blue-100",
        label: "Prise en charge ramassage",
        description: "Prise en charge par le ramasseur",
      },
      ramasse: {
        icon: FaBox,
        color: "text-purple-600 bg-purple-100",
        label: "Ramasse",
        description: "Colis ramassé avec succès",
      },
      en_transit: {
        icon: FaRoute,
        color: "text-indigo-600 bg-indigo-100",
        label: "En transit",
        description: "En route vers la destination",
      },
      prise_en_charge_livraison: {
        icon: FaTruck,
        color: "text-orange-600 bg-orange-100",
        label: "Prise en charge livraison",
        description: "Prise en charge par le livreur",
      },
      livre: {
        icon: FaCheckCircle,
        color: "text-green-600 bg-green-100",
        label: "Livré",
        description: "Livraison terminée",
      },
      annule: {
        icon: FaTimesCircle,
        color: "text-red-600 bg-red-100",
        label: "Annulé",
        description: "Livraison annulée",
      },
    };

    return (
      statusConfig[status] || {
        icon: FaExclamationTriangle,
        color: "text-gray-600 bg-gray-100",
        label: status.replace(/_/g, " "),
        description: "Statut inconnu",
      }
    );
  };

  const getNextAvailableStatuses = (currentStatus) => {
    const statusFlow = {
      en_attente: ["prise_en_charge_ramassage", "annule"],
      prise_en_charge_ramassage: ["ramasse", "annule"],
      ramasse: ["en_transit", "annule"],
      en_transit: ["prise_en_charge_livraison", "annule"],
      prise_en_charge_livraison: ["livre", "annule"],
      livre: [],
      annule: [],
    };

    return statusFlow[currentStatus] || [];
  };

  const canAssignLivreur = (livraison, type) => {
    if (!livraison) return false;

    if (livraison.status === "annule" || livraison.status === "livre") {
      return false;
    }

    if (type === "distributeur") {
      // NOUVELLE LOGIQUE :
      // - Si statut = "en_transit", on peut attribuer OU CHANGER le distributeur
      // - Vérifier aussi si c'est un admin
      return livraison.status === "en_transit" && isAdmin;
    } else if (type === "ramasseur") {
      // Pour le ramasseur : peut être attribué si le statut n'est pas "ramasse"
      // (on peut changer le ramasseur tant que le colis n'est pas ramassé)
      return livraison.status !== "ramasse" && isAdmin;
    }

    return false;
  };

  const canDeleteLivraison = (livraison) => {
    if (!livraison) return false;
    return livraison.status !== "livre";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isAdmin = livraisonService.isAdmin();

  // Extraire les wilayas des adresses
  const wilayaDepart = livraison?.demande_livraison?.addresse_depot
    ? extractWilayaFromAddress(livraison.demande_livraison.addresse_depot)
    : null;

  const wilayaArrivee = livraison?.demande_livraison?.addresse_delivery
    ? extractWilayaFromAddress(livraison.demande_livraison.addresse_delivery)
    : null;

  // Wilaya d'arrivée (si stockée séparément)
  const wilaya = livraison?.demande_livraison?.wilaya;
  const commune = livraison?.demande_livraison?.commune;
  const hasLocation = wilayaDepart || wilayaArrivee || wilaya || commune;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary-600"></div>
      </div>
    );
  }

  if (!livraison) {
    return (
      <div className="py-8 text-center">
        <FaBox className="w-12 h-12 mx-auto text-gray-300" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Livraison non trouvée
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          La livraison demandée n'existe pas ou a été supprimée.
        </p>
        <button
          onClick={() => navigate("/livraisons")}
          className="px-4 py-2 mt-4 text-primary-600 hover:text-primary-800"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(livraison.status);
  const nextStatuses = getNextAvailableStatuses(livraison.status);
  const isAnnule = livraison.status === "annule";
  const isLivre = livraison.status === "livre";

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate("/livraisons")}
            className="flex items-center mb-4 text-primary-600 hover:text-primary-800"
          >
            <FaArrowLeft className="mr-2" /> Retour aux livraisons
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Livraison #{livraison.id}
            </h1>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${statusInfo.color}`}
            >
              <statusInfo.icon className="w-4 h-4" />
              {statusInfo.label}
            </div>
            <div className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
              <FaQrcode className="w-4 h-4" />
              PIN: {livraison.code_pin}
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-white bg-purple-600 rounded-full">
                <FaShieldAlt className="w-3 h-3" />
                Administrateur
              </div>
            )}
          </div>

          <p className="mt-2 text-gray-600">
            {livraison.demande_livraison?.colis?.colis_label ||
              "Sans référence"}
          </p>

          {/* Trajet wilayas */}
          {(wilayaDepart || wilayaArrivee) && (
            <div className="flex items-center gap-3 mt-3 text-sm text-gray-700">
              <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
              <div className="flex items-center gap-2">
                {wilayaDepart && (
                  <span className="font-medium text-blue-600">
                    {wilayaDepart}
                  </span>
                )}
                {wilayaDepart && wilayaArrivee && (
                  <FaArrowLeft className="w-3 h-3 text-gray-400 rotate-180" />
                )}
                {wilayaArrivee && (
                  <span className="font-medium text-green-600">
                    {wilayaArrivee}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Boutons impression */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={isPrinting}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaDownload /> {isPrinting ? "Génération..." : "Télécharger PDF"}
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex items-center gap-2 px-4 py-2 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPrint /> {isPrinting ? "Impression..." : "Imprimer"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-6 lg:col-span-2">
          {/* Section Attribution livreurs */}
          {isAdmin && !["annule", "livre"].includes(livraison.status) && (
            <div className="p-6 bg-white shadow-sm rounded-xl">
              <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
                <FaUserPlus /> Attribution des livreurs
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Livreur ramasseur */}
                <div className="p-4 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <FaUser className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Livreur Ramasseur
                        </p>
                        <p className="text-sm text-gray-600">
                          {livraison.livreur_ramasseur
                            ? `${livraison.livreur_ramasseur.user?.nom || ""} ${livraison.livreur_ramasseur.user?.prenom || ""}`.trim()
                            : "Non attribué"}
                        </p>
                      </div>
                    </div>
                    {canAssignLivreur(livraison, "ramasseur") && (
                      <button
                        onClick={() => openAssignModal("ramasseur")}
                        className="px-3 py-1 text-sm text-blue-600 transition-colors bg-blue-100 rounded hover:bg-blue-200"
                        title={
                          livraison.livreur_ramasseur
                            ? "Changer le ramasseur"
                            : "Attribuer un ramasseur"
                        }
                      >
                        {livraison.livreur_ramasseur ? "Changer" : "Attribuer"}
                      </button>
                    )}
                  </div>
                  {livraison.livreur_ramasseur?.user?.telephone && (
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaPhone className="w-3 h-3" />
                        {livraison.livreur_ramasseur.user.telephone}
                      </div>
                    </div>
                  )}
                </div>

                {/* Livreur distributeur */}
                <div className="p-4 rounded-lg bg-green-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <FaTruck className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Livreur Distributeur
                        </p>
                        <p className="text-sm text-gray-600">
                          {livraison.livreur_distributeur
                            ? `${livraison.livreur_distributeur.user?.nom || ""} ${livraison.livreur_distributeur.user?.prenom || ""}`.trim()
                            : "Non attribué"}
                        </p>
                      </div>
                    </div>
                    {canAssignLivreur(livraison, "distributeur") && (
                      <button
                        onClick={() => openAssignModal("distributeur")}
                        className="px-3 py-1 text-sm text-green-600 transition-colors bg-green-100 rounded hover:bg-green-200"
                        title={
                          livraison.livreur_distributeur
                            ? "Changer le distributeur"
                            : "Attribuer un distributeur"
                        }
                      >
                        {livraison.livreur_distributeur
                          ? "Changer"
                          : "Attribuer"}
                      </button>
                    )}
                  </div>
                  {livraison.livreur_distributeur?.user?.telephone && (
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaPhone className="w-3 h-3" />
                        {livraison.livreur_distributeur.user.telephone}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Info nouvelle logique */}
              <div className="p-3 mt-4 text-sm bg-gray-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <FaInfoCircle className="flex-shrink-0 w-4 h-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-700">
                      Nouvelle logique d'attribution :
                    </p>
                    <ul className="mt-1 ml-4 text-gray-600 list-disc">
                      <li>
                        <strong>Tous les livreurs</strong> peuvent être
                        attribués comme ramasseur ou distributeur
                      </li>
                      <li>
                        <strong>Le même livreur</strong> peut être à la fois
                        ramasseur et distributeur
                      </li>
                      <li>
                        Ramasseur : attribuable et changeable seulement si
                        statut ≠ "ramasse"
                      </li>
                      <li>
                        Distributeur : attribuable et changeable seulement si
                        statut = "en_transit"
                      </li>
                      <li>
                        L'attribution d'un ramasseur change automatiquement le
                        statut en "prise_en_charge_ramassage"
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section Statut */}
          <div className="p-6 bg-white shadow-sm rounded-xl">
            <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
              <FaSyncAlt /> Gestion du statut
            </h2>

            {/* Statut actuel */}
            <div className={`p-4 rounded-lg mb-6 ${statusInfo.color}`}>
              <div className="flex items-center">
                <statusInfo.icon className="w-8 h-8 mr-3" />
                <div>
                  <p className="text-lg font-bold capitalize">
                    {statusInfo.label}
                  </p>
                  <p className="text-sm opacity-75">
                    {statusInfo.description}
                    {isAnnule && " - Plus aucune modification possible"}
                    {isLivre && " - Livraison terminée"}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions de statut - SEULEMENT LE BOUTON ANNULATION */}
            {!isAnnule && nextStatuses.includes("annule") && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-gray-900">
                  Actions disponibles
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Êtes-vous sûr de vouloir annuler cette livraison ?",
                        )
                      ) {
                        updateStatus("annule");
                      }
                    }}
                    className="px-4 py-2 rounded-lg flex items-center gap-2 bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    <FaTimesCircle className="w-4 h-4" />
                    Marquer comme annulé
                  </button>
                </div>
              </div>
            )}

            {/* Message si annulé */}
            {isAnnule && (
              <div className="p-4 rounded-lg bg-red-50">
                <div className="flex items-center gap-3">
                  <FaBan className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">
                      Livraison annulée
                    </p>
                    <p className="text-sm text-red-600">
                      Cette livraison a été annulée. Aucune modification
                      supplémentaire n'est possible.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Message si livré */}
            {isLivre && (
              <div className="p-4 rounded-lg bg-green-50">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      Livraison terminée
                    </p>
                    <p className="text-sm text-green-600">
                      Cette livraison a été livrée avec succès. Aucune
                      modification supplémentaire n'est possible.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Informations du colis */}
          <div className="p-6 bg-white shadow-sm rounded-xl">
            <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
              <FaBox className="text-blue-600" /> Informations du colis
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <FaBarcode className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">
                    Référence
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {livraison.demande_livraison?.colis?.colis_label || "N/A"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <FaTag className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">
                    Type
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {livraison.demande_livraison?.colis?.colis_type || "Standard"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <FaWeightHanging className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">
                    Poids
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {livraison.demande_livraison?.colis?.poids
                    ? `${livraison.demande_livraison.colis.poids} kg`
                    : "N/A"}
                </p>
              </div>

              {/* CORRECTION : Section Prix avec deux lignes */}
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <FaMoneyBillWave className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">
                    Prix
                  </span>
                </div>
                <div className="space-y-1">
                  {/* Prix du colis */}
                  {livraison.demande_livraison?.colis?.colis_prix && (
                    <p className="font-semibold text-purple-700">
                      Colis: {livraison.demande_livraison.colis.colis_prix} DA
                    </p>
                  )}
                  {/* Prix de la livraison */}
                  {livraison.demande_livraison?.prix && (
                    <p className="font-semibold text-green-700">
                      Livraison: {livraison.demande_livraison.prix} DA
                    </p>
                  )}
                  {/* Si aucun prix */}
                  {!livraison.demande_livraison?.colis?.colis_prix &&
                    !livraison.demande_livraison?.prix && (
                      <p className="font-semibold text-gray-900">N/A</p>
                    )}
                </div>
              </div>
            </div>

            {livraison.demande_livraison?.info_additionnel && (
              <div className="p-3 mt-4 rounded-lg bg-yellow-50">
                <div className="flex items-center gap-2 mb-1">
                  <FaInfoCircle className="text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Instructions spéciales
                  </span>
                </div>
                <p className="text-yellow-900">
                  {livraison.demande_livraison.info_additionnel}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Dates importantes */}
          <div className="p-6 bg-white shadow-sm rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Dates importantes
            </h3>

            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <FaCalendarAlt className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">
                    Date de création
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {formatDate(livraison.created_at)}
                </p>
              </div>

              {livraison.date_ramassage && (
                <div className="p-3 rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2 mb-1">
                    <FaCalendarAlt className="text-blue-400" />
                    <span className="text-sm font-medium text-blue-600">
                      Date de ramassage
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatDate(livraison.date_ramassage)}
                  </p>
                </div>
              )}

              {livraison.date_livraison && (
                <div className="p-3 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 mb-1">
                    <FaCalendarAlt className="text-green-400" />
                    <span className="text-sm font-medium text-green-600">
                      Date de livraison
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatDate(livraison.date_livraison)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* NOUVELLE SECTION : Trajet et wilayas */}
          <div className="p-6 bg-white shadow-sm rounded-xl">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
              <FaMapMarkerAlt className="text-primary-600" /> Trajet et wilayas
            </h3>

            <div className="space-y-4">
              {/* Carte du trajet */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">
                    Trajet de livraison
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaSignOutAlt className="w-3 h-3 text-blue-600" />
                    <FaArrowLeft className="w-3 h-3 text-gray-400" />
                    <FaSignInAlt className="w-3 h-3 text-green-600" />
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Wilaya de départ */}
                  {wilayaDepart && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          <FaSignOutAlt className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Wilaya de départ
                          </p>
                          <p className="font-semibold text-gray-900">
                            {wilayaDepart}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                        Départ
                      </span>
                    </div>
                  )}

                  {/* Wilaya d'arrivée (stockée séparément) */}
                  {wilaya && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                          <FaSignInAlt className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Wilaya d'arrivée
                          </p>
                          <p className="font-semibold text-gray-900">
                            {wilaya}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                        Arrivée
                      </span>
                    </div>
                  )}

                  {/* Wilaya d'arrivée extraite de l'adresse (si différente) */}
                  {wilayaArrivee && wilayaArrivee !== wilaya && (
                    <div className="p-3 rounded-lg bg-yellow-50">
                      <div className="flex items-center gap-2 mb-2">
                        <FaMapMarkerAlt className="w-4 h-4 text-yellow-600" />
                        <h5 className="text-sm font-medium text-gray-700">
                          Wilaya d'arrivée (adresse)
                        </h5>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {wilayaArrivee}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Extraite de l'adresse de livraison
                      </p>
                    </div>
                  )}

                  {/* Commune (si disponible) */}
                  {commune && (
                    <div className="p-3 rounded-lg bg-purple-50">
                      <div className="flex items-center gap-2 mb-2">
                        <FaCity className="w-4 h-4 text-purple-600" />
                        <h5 className="text-sm font-medium text-gray-700">
                          Commune
                        </h5>
                      </div>
                      <p className="font-semibold text-gray-900">{commune}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Adresses détaillées */}
              <div className="space-y-4">
                {/* Point de départ avec wilaya extraite */}
                <div className="p-3 rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMapMarkerAlt className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-gray-900">
                      Point de départ
                      {wilayaDepart && (
                        <span className="ml-2 text-sm font-normal text-blue-700">
                          ({wilayaDepart})
                        </span>
                      )}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    {livraison.demande_livraison?.addresse_depot ||
                      "Non spécifiée"}
                  </p>
                </div>

                {/* Point d'arrivée avec wilaya */}
                <div className="p-3 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMapMarkerAlt className="w-4 h-4 text-green-600" />
                    <h4 className="font-medium text-gray-900">
                      Point de livraison
                      {(wilaya || wilayaArrivee) && (
                        <span className="ml-2 text-sm font-normal text-green-700">
                          ({wilaya || wilayaArrivee})
                        </span>
                      )}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    {livraison.demande_livraison?.addresse_delivery ||
                      "Non spécifiée"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Code PIN */}
          <div className="p-6 bg-white shadow-sm rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Code de sécurité
            </h3>

            <div className="p-4 text-center rounded-lg bg-primary-50">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-primary-100">
                <FaQrcode className="w-6 h-6 text-primary-600" />
              </div>
              <p className="mb-2 text-sm text-gray-600">
                Code PIN pour la livraison
              </p>
              <div className="font-mono text-3xl font-bold tracking-wider text-primary-700">
                {livraison.code_pin}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                À communiquer au livreur pour vérification
              </p>
            </div>
          </div>

          {/* Actions rapides */}
          {isAdmin && (
            <div className="p-6 bg-white shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Actions administrateur
              </h3>

              <div className="space-y-3">
                {/* Bouton Supprimer */}
                {canDeleteLivraison(livraison) && (
                  <button
                    onClick={deleteLivraison}
                    className="flex items-center w-full gap-3 px-4 py-3 text-left text-red-700 transition-colors rounded-lg bg-red-50 hover:bg-red-100"
                  >
                    <FaTrashAlt className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Supprimer la livraison</p>
                      <p className="text-sm">Action irréversible</p>
                    </div>
                  </button>
                )}

                {/* Message si annulé */}
                {isAnnule && (
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-center text-gray-600">
                      Livraison annulée - Aucune action disponible
                    </p>
                  </div>
                )}

                {/* Message si livré */}
                {isLivre && (
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-center text-gray-600">
                      Livraison terminée - Aucune action disponible
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'attribution de livreur */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowAssignModal(false)}
            ></div>

            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-blue-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                    <FaUserPlus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      {livraison[`livreur_${assignType}`]
                        ? `Changer le livreur ${assignType}`
                        : `Attribuer un livreur ${assignType}`}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {assignType === "distributeur"
                        ? "Le distributeur ne peut être attribué ou changé que lorsque la livraison est en transit"
                        : "Le ramasseur ne peut être attribué ou changé que si le colis n'a pas encore été ramassé"}
                    </p>
                    <div className="mt-4">
                      {livreurs.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 bg-gray-100 rounded-lg">
                          Aucun livreur disponible
                        </div>
                      ) : (
                        <select
                          value={selectedLivreur}
                          onChange={(e) => setSelectedLivreur(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">
                            Sélectionner un livreur {assignType}
                          </option>
                          {livreurs.map((livreur) => (
                            <option key={livreur.value} value={livreur.value}>
                              {livreur.label} - {livreur.telephone}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={assignLivreur}
                  disabled={!selectedLivreur || livreurs.length === 0}
                  className={`inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm ${
                    !selectedLivreur || livreurs.length === 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-primary-600 hover:bg-primary-700"
                  }`}
                >
                  {livraison[`livreur_${assignType}`] ? "Changer" : "Attribuer"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedLivreur("");
                  }}
                  className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivraisonDetail;
