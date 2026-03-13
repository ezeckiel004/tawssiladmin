import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FaSearch,
  FaFileAlt,
  FaUser,
  FaSignature,
  FaCalendarAlt,
  FaDownload,
  FaPrint,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCheckCircle,
  FaClock,
  FaStar,
  FaFilter,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import bordereauService from "../../services/bordereauService";

const BordereauxList = () => {
  const [bordereaux, setBordereaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchBordereaux();
  }, []);

  const fetchBordereaux = async () => {
    try {
      setLoading(true);
      // Données simulées
      const mockBordereaux = [
        {
          id: 1,
          numero: "BORD-2024-001",
          client: {
            id: 101,
            user: {
              nom: "Dupont",
              prenom: "Jean",
              email: "jean.dupont@example.com",
              telephone: "+212 6 12 34 56 78",
            },
          },
          photo_reception_url: null,
          signed_by: "Jean Dupont",
          commentaire: "Livraison conforme, colis en bon état",
          note: 5,
          created_at: "2024-01-25T14:30:00Z",
          statut: "signé",
        },
        {
          id: 2,
          numero: "BORD-2024-002",
          client: {
            id: 102,
            user: {
              nom: "Martin",
              prenom: "Sophie",
              email: "sophie.martin@example.com",
              telephone: "+212 6 98 76 54 32",
            },
          },
          photo_reception_url: null,
          signed_by: null,
          commentaire: "En attente de signature",
          note: null,
          created_at: "2024-01-24T11:20:00Z",
          statut: "en attente",
        },
        {
          id: 3,
          numero: "BORD-2024-003",
          client: {
            id: 103,
            user: {
              nom: "Bernard",
              prenom: "Pierre",
              email: "pierre.bernard@example.com",
              telephone: "+212 6 33 44 55 66",
            },
          },
          photo_reception_url: null,
          signed_by: "Pierre Bernard",
          commentaire: "Petit retard mais bonne communication",
          note: 4,
          created_at: "2024-01-23T09:45:00Z",
          statut: "signé",
        },
      ];
      setBordereaux(mockBordereaux);
    } catch (error) {
      toast.error("Erreur lors du chargement des bordereaux");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBordereau = async (bordereauId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce bordereau ?")) {
      try {
        await bordereauService.deleteBordereau(bordereauId);
        toast.success("Bordereau supprimé");
        fetchBordereaux();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const filteredBordereaux = bordereaux.filter((bordereau) => {
    return (
      bordereau.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bordereau.client.user.nom
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      bordereau.client.user.prenom
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      bordereau.commentaire?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bordereaux de Livraison
        </h1>
        <p className="text-gray-600">
          Gérez les bordereaux de livraison signés par les clients
        </p>
      </div>

      {/* Filtres et actions */}
      <div className="p-6 mb-6 bg-white shadow rounded-xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Rechercher par numéro, client, commentaire..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700">
              <FaPlus /> Nouveau bordereau
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-white shadow rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total bordereaux</p>
              <p className="text-2xl font-bold text-gray-900">
                {bordereaux.length}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <FaFileAlt className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white shadow rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Signés</p>
              <p className="text-2xl font-bold text-gray-900">
                {bordereaux.filter((b) => b.statut === "signé").length}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <FaCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white shadow rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">
                {bordereaux.filter((b) => b.statut === "en attente").length}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
              <FaClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white shadow rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Note moyenne</p>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">4.5</span>
                <div className="ml-2">{renderStars(4)}</div>
              </div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <FaStar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des bordereaux */}
      <div className="overflow-hidden bg-white shadow rounded-xl">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
            <p className="mt-4 text-gray-600">Chargement des bordereaux...</p>
          </div>
        ) : filteredBordereaux.length === 0 ? (
          <div className="p-8 text-center">
            <FaFileAlt className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-2 text-gray-500">Aucun bordereau trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Numéro
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Client
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Signature
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Commentaire
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Note
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBordereaux.map((bordereau) => (
                  <tr key={bordereau.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 mr-3 bg-blue-100 rounded-lg">
                          <FaFileAlt className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {bordereau.numero}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {bordereau.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 mr-2 bg-green-100 rounded-full">
                          <FaUser className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {bordereau.client.user.nom}{" "}
                            {bordereau.client.user.prenom}
                          </div>
                          <div className="text-xs text-gray-500">
                            {bordereau.client.user.telephone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                            bordereau.signed_by
                              ? "bg-green-100"
                              : "bg-yellow-100"
                          }`}
                        >
                          <FaSignature
                            className={`h-4 w-4 ${
                              bordereau.signed_by
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {bordereau.signed_by || "Non signé"}
                          </div>
                          <div
                            className={`text-xs ${
                              bordereau.signed_by
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {bordereau.signed_by ? "Signé" : "En attente"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs text-sm text-gray-900 truncate">
                        {bordereau.commentaire || "Aucun commentaire"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {renderStars(bordereau.note)}
                        {bordereau.note && (
                          <span className="ml-2 text-sm font-medium">
                            {bordereau.note}/5
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm">
                        <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(bordereau.created_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          className="p-1 text-primary-600 hover:text-primary-900"
                          title="Voir détails"
                        >
                          <FaEye className="w-5 h-5" />
                        </button>
                        <button
                          className="p-1 text-yellow-600 hover:text-yellow-900"
                          title="Modifier"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          className="p-1 text-blue-600 hover:text-blue-900"
                          title="Télécharger"
                        >
                          <FaDownload className="w-5 h-5" />
                        </button>
                        <button
                          className="p-1 text-green-600 hover:text-green-900"
                          title="Imprimer"
                        >
                          <FaPrint className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteBordereau(bordereau.id)}
                          className="p-1 text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pied de table */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {filteredBordereaux.length} bordereau
            {filteredBordereaux.length !== 1 ? "x" : ""}
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Précédent
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-6 mt-8 border border-blue-200 bg-blue-50 rounded-xl">
        <h3 className="mb-3 text-lg font-semibold text-blue-800">
          À propos des bordereaux
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <h4 className="mb-2 font-medium text-blue-900">
              Qu'est-ce qu'un bordereau ?
            </h4>
            <p className="text-sm text-blue-700">
              Document officiel qui sert de preuve de livraison et de réception
              par le client.
            </p>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-blue-900">
              Signature électronique
            </h4>
            <p className="text-sm text-blue-700">
              Les bordereaux peuvent être signés électroniquement par le client
              via l'application.
            </p>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-blue-900">Valeur légale</h4>
            <p className="text-sm text-blue-700">
              Ces documents ont une valeur légale et servent de preuve en cas de
              litige.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BordereauxList;
