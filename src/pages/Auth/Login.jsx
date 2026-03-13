import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import {
  LockClosedIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!credentials.email) {
      toast.error("Veuillez entrer votre email");
      return;
    }

    if (!credentials.password) {
      toast.error("Veuillez entrer votre mot de passe");
      return;
    }

    setLoading(true);

    try {
      // Préparer les données pour l'API
      const loginData = {
        email: credentials.email,
        password: credentials.password,
      };

      const result = await login(loginData);

      if (result.success) {
        toast.success("Connexion réussie !");
      } else {
        toast.error(result.message || "Erreur de connexion");
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-gradient-to-br from-primary-50 to-gray-100 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          {/* Logo Tawssil */}
          <div className="flex items-center justify-center w-16 h-16 shadow-lg bg-primary-600 rounded-xl overflow-hidden">
            <img
              src="/images/tasswillogo.jpeg"
              alt="Tawssil Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h2 className="mt-8 text-3xl font-bold text-center text-gray-900">
          Tawssil Admin
        </h2>
        <p className="mt-2 text-sm text-center text-gray-600">
          Panel d'administration de la plateforme de livraison
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 bg-white border border-gray-100 shadow-xl sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Champ email */}
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Adresse email
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  className="pl-10 input-field"
                  placeholder="admin@tawssil.com"
                />
              </div>
            </div>

            {/* Champ mot de passe */}
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Mot de passe
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="pl-10 pr-10 input-field"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute transform -translate-y-1/2 right-3 top-1/2"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="w-4 h-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
                />
                <label
                  htmlFor="remember-me"
                  className="block ml-2 text-sm text-gray-900"
                >
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {/* Bouton de connexion */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white transition-colors duration-200 border border-transparent rounded-lg shadow-sm bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </div>
          </form>

          {/* Informations supplémentaires */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 bg-white">
                  Plateforme d'administration
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} Tawssil Go. Tous droits réservés.
              </p>
              <p className="mt-1 text-xs text-gray-500">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
