// src/pages/Auth/Login.jsx

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
    <div className="flex min-h-screen">
      {/* Section gauche - Image avec texte de bienvenue */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/images/tawsillalger.jpg"
          alt="Tawssil Algérie"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay pour améliorer la lisibilité du texte */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Texte de bienvenue sur l'image */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-5xl font-bold mb-6">Bienvenue sur Tawssil</h1>
          <p className="text-xl mb-4">Panel d'administration</p>
          <p className="text-lg text-white text-opacity-90">
            Gérez efficacement votre plateforme de livraison
          </p>
          <div className="mt-8 space-y-2">
            <p className="flex items-center text-white text-opacity-80">
              <span className="mr-2">✓</span> Gestion des livraisons
            </p>
            <p className="flex items-center text-white text-opacity-80">
              <span className="mr-2">✓</span> Suivi des commandes
            </p>
            <p className="flex items-center text-white text-opacity-80">
              <span className="mr-2">✓</span> Administration complète
            </p>
          </div>
        </div>
      </div>

      {/* Section droite - Formulaire */}
      <div 
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
        style={{ backgroundColor: '#276476' }}
      >
        <div className="w-full max-w-md">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-xl overflow-hidden bg-white">
                <img
                  src="/images/tasswillogo.jpeg"
                  alt="Tawssil Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white">
              Tawssil Admin
            </h2>
            <p className="mt-2 text-white text-opacity-80">
              Panel d'administration de la plateforme de livraison
            </p>
          </div>

          {/* Formulaire */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Champ email */}
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-white"
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
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f54a09] focus:border-transparent outline-none bg-white"
                  placeholder="admin@tawssil.com"
                />
              </div>
            </div>

            {/* Champ mot de passe */}
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-white"
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
                  className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f54a09] focus:border-transparent outline-none bg-white"
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
                  className="w-4 h-4 border-gray-300 rounded text-[#f54a09] focus:ring-[#f54a09]"
                />
                <label
                  htmlFor="remember-me"
                  className="block ml-2 text-sm text-white"
                >
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-white hover:text-[#f54a09] transition-colors"
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
                className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white transition-colors duration-200 border border-transparent rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#f54a09' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e04308'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f54a09'}
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
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white border-opacity-30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-white bg-transparent">
                  Plateforme d'administration
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-white text-opacity-80">
                © {new Date().getFullYear()} Tawssil. Tous droits réservés.
              </p>
              <p className="mt-1 text-xs text-white text-opacity-60">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;