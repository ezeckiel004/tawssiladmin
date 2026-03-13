import React from "react";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";

const UsersTable = ({
  users,
  onToggleActivation,
  onDelete,
  onView,
  onEdit,
}) => {
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "livreur":
        return "bg-blue-100 text-blue-800";
      case "client":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "livreur":
        return "Livreur";
      case "client":
        return "Client";
      default:
        return role;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Utilisateur
            </th>
            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Contact
            </th>
            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Rôle
            </th>
            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Statut
            </th>
            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10">
                    {user.photo ? (
                      <img
                        className="w-10 h-10 rounded-full"
                        src={user.photo_url}
                        alt={`${user.nom} ${user.prenom}`}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100">
                        <UserIcon className="w-5 h-5 text-primary-600" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.nom} {user.prenom}
                    </div>
                    <div className="text-xs text-gray-500">ID: {user.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.email}</div>
                <div className="text-sm text-gray-500">{user.telephone}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                    user.role,
                  )}`}
                >
                  {getRoleLabel(user.role)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onToggleActivation(user.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    user.actif
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }`}
                >
                  {user.actif ? "Actif" : "Inactif"}
                </button>
              </td>
              <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onView(user.id)}
                    className="p-1 transition-colors text-primary-600 hover:text-primary-900"
                    title="Voir détails"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onEdit(user)}
                    className="p-1 text-yellow-600 transition-colors hover:text-yellow-900"
                    title="Modifier"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onToggleActivation(user.id)}
                    className={`p-1 transition-colors ${
                      user.actif
                        ? "text-orange-600 hover:text-orange-900"
                        : "text-green-600 hover:text-green-900"
                    }`}
                    title={
                      user.actif
                        ? "Désactiver l'utilisateur"
                        : "Activer l'utilisateur"
                    }
                  >
                    <NoSymbolIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(user.id)}
                    className="p-1 text-red-600 transition-colors hover:text-red-900"
                    title="Supprimer définitivement"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
