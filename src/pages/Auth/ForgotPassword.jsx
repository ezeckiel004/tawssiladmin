import React, { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulation d'envoi
    setTimeout(() => {
      setMessage(
        "Si cet email existe, vous recevrez un lien de réinitialisation."
      );
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-3xl font-bold text-center text-gray-900">
          Mot de passe oublié
        </h2>
        <p className="mt-2 text-sm text-center text-gray-600">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Adresse email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {message && (
              <div className="p-3 border border-green-200 rounded-lg bg-green-50">
                <p className="text-sm text-green-800">{message}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? "Envoi en cours..." : "Envoyer le lien"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
