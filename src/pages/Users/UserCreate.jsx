// src/pages/Users/UserCreate.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import UserForm from "../../components/Forms/UserForm";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const UserCreate = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/users");
  };

  const handleCancel = () => {
    navigate("/users");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate("/users")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Retour à la liste
        </button>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Créer un nouvel utilisateur
        </h1>
      </div>

      <div className="p-6 bg-white shadow rounded-xl">
        <UserForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default UserCreate;
