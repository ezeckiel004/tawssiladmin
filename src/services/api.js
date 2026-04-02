import axios from 'axios';
import { toast } from 'react-hot-toast';

// Créer une instance axios avec la configuration de base
const api = axios.create({
  baseURL: 'https://api.tawssilgo.com/api',
  // baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Pour FormData, supprimer le Content-Type pour laisser axios le gérer
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globales
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('❌ Erreur API:', error.response?.status, error.message);

    // Gestion des erreurs HTTP
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Token expiré ou invalide
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          toast.error('Session expirée. Veuillez vous reconnecter.');
          break;
          
        case 403:
          // Accès interdit
          toast.error('Vous n\'avez pas les permissions nécessaires.');
          break;
          
        case 404:
          // Ressource non trouvée
          toast.error('La ressource demandée n\'existe pas.');
          break;
          
        case 422:
          // Erreur de validation
          if (data.errors) {
            const errorMessages = Object.values(data.errors).flat().join(', ');
            toast.error(`Erreurs de validation: ${errorMessages}`);
          } else {
            toast.error(data.message || 'Erreur de validation.');
          }
          break;
          
        case 500:
          // Erreur serveur
          toast.error('Une erreur serveur est survenue. Veuillez réessayer plus tard.');
          break;
          
        default:
          // Autres erreurs
          toast.error(data?.message || 'Une erreur est survenue.');
      }
    } else if (error.request) {
      // Pas de réponse du serveur
      toast.error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
    } else {
      // Erreur lors de la configuration de la requête
      toast.error('Erreur de configuration de la requête.');
    }

    return Promise.reject(error);
  }
);

export default api;