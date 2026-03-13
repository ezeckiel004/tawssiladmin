import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FaSearch,
  FaStar,
  FaUser,
  FaCalendarAlt,
  FaComment,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaReply,
  FaTrash,
  FaFilter,
} from "react-icons/fa";
import avisService from "../../services/avisService";

const AvisList = () => {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  useEffect(() => {
    fetchAvis();
  }, []);

  const fetchAvis = async () => {
    try {
      setLoading(true);
      // Données simulées
      const mockAvis = [
        {
          id: 1,
          user: {
            id: 401,
            nom: "Dupont",
            prenom: "Jean",
            photo_url: null,
          },
          note: 5,
          message:
            "Service exceptionnel ! Livraison rapide et livreur très professionnel.",
          created_at: "2024-01-25T14:30:00Z",
          responses: [
            {
              id: 1,
              admin: {
                nom: "Admin",
                prenom: "System",
              },
              message: "Merci pour votre confiance !",
              created_at: "2024-01-25T15:00:00Z",
            },
          ],
        },
        {
          id: 2,
          user: {
            id: 402,
            nom: "Martin",
            prenom: "Sophie",
            photo_url: null,
          },
          note: 3,
          message: "Livraison un peu en retard mais correcte dans l'ensemble.",
          created_at: "2024-01-24T11:20:00Z",
          responses: [],
        },
        {
          id: 3,
          user: {
            id: 403,
            nom: "Bernard",
            prenom: "Pierre",
            photo_url: null,
          },
          note: 1,
          message:
            "Très déçu, colis endommagé et pas de réponse du service client.",
          created_at: "2024-01-23T09:45:00Z",
          responses: [],
        },
      ];
      setAvis(mockAvis);
    } catch (error) {
      toast.error("Erreur lors du chargement des avis");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAvis = async (avisId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) {
      try {
        await avisService.deleteAvis(avisId);
        toast.success("Avis supprimé");
        fetchAvis();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const filteredAvis = avis.filter((avisItem) => {
    const matchesSearch =
      avisItem.user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      avisItem.user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      avisItem.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating =
      !ratingFilter || avisItem.note === parseInt(ratingFilter);

    return matchesSearch && matchesRating;
  });

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`h-4 w-4 ${
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
          Avis des utilisateurs
        </h1>
        <p className="text-gray-600">
          Consultez et gérez les avis laissés par les utilisateurs
        </p>
      </div>

      {/* Filtres et statistiques */}
      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="p-6 bg-white shadow rounded-xl">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, prénom, contenu..."
                    className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                >
                  <option value="">Toutes les notes</option>
                  <option value="5">⭐ 5 étoiles</option>
                  <option value="4">⭐ 4 étoiles</option>
                  <option value="3">⭐ 3 étoiles</option>
                  <option value="2">⭐ 2 étoiles</option>
                  <option value="1">⭐ 1 étoile</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white shadow rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Note moyenne</p>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">4.3</span>
                <div className="ml-2">{renderStars(4)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution des notes */}
      <div className="p-6 mb-6 bg-white shadow rounded-xl">
        <h3 className="mb-4 font-medium text-gray-900">
          Distribution des notes
        </h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = avis.filter((a) => a.note === rating).length;
            const percentage =
              avis.length > 0 ? (count / avis.length) * 100 : 0;

            return (
              <div key={rating} className="flex items-center">
                <div className="w-16 text-sm text-gray-600">
                  {rating} étoiles
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-sm font-medium text-right">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste des avis */}
      <div className="overflow-hidden bg-white shadow rounded-xl">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
            <p className="mt-4 text-gray-600">Chargement des avis...</p>
          </div>
        ) : filteredAvis.length === 0 ? (
          <div className="p-8 text-center">
            <FaComment className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-2 text-gray-500">Aucun avis trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAvis.map((avisItem) => (
              <div key={avisItem.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12">
                      {avisItem.user.photo_url ? (
                        <img
                          className="w-12 h-12 rounded-full"
                          src={avisItem.user.photo_url}
                          alt=""
                        />
                      ) : (
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100">
                          <FaUser className="w-6 h-6 text-primary-600" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium text-gray-900">
                          {avisItem.user.nom} {avisItem.user.prenom}
                        </h4>
                        <div className="flex items-center ml-3">
                          {renderStars(avisItem.note)}
                          <span className="ml-2 text-sm text-gray-600">
                            {new Date(avisItem.created_at).toLocaleDateString(
                              "fr-FR"
                            )}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-gray-700">{avisItem.message}</p>

                      {/* Réponses */}
                      {avisItem.responses.map((response) => (
                        <div
                          key={response.id}
                          className="p-4 mt-4 ml-8 rounded-lg bg-blue-50"
                        >
                          <div className="flex items-center">
                            <div className="flex items-center justify-center w-8 h-8 mr-2 bg-blue-100 rounded-full">
                              <FaUser className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {response.admin.prenom} {response.admin.nom}
                                <span className="ml-2 text-xs text-blue-600">
                                  (Administrateur)
                                </span>
                              </div>
                              <p className="mt-1 text-gray-700">
                                {response.message}
                              </p>
                              <div className="mt-1 text-xs text-gray-500">
                                {new Date(
                                  response.created_at
                                ).toLocaleDateString("fr-FR")}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Formulaire de réponse */}
                      <div className="mt-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            placeholder="Répondre à cet avis..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                          <button className="flex items-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700">
                            <FaReply className="mr-2" /> Répondre
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-primary-600 hover:text-primary-900">
                      <FaEye className="w-5 h-5" />
                    </button>
                    <button className="p-1 text-green-600 hover:text-green-900">
                      <FaCheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteAvis(avisItem.id)}
                      className="p-1 text-red-600 hover:text-red-900"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pied de page */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {filteredAvis.length} avis
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
    </div>
  );
};

export default AvisList;
