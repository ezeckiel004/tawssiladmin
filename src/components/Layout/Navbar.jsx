import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleProfileClick = () => {
    if (user?.id) {
      navigate(`/users/${user.id}`);
    }
    setIsDropdownOpen(false);
  };

  return (
    <nav className="px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            Dashboard Admin
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100">
                <span className="font-medium text-primary-700">
                  {user?.nom?.[0]}
                  {user?.prenom?.[0]}
                </span>
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-gray-700">
                  {user?.nom} {user?.prenom}
                </p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <FaChevronDown className="w-5 h-5 text-gray-400" />
            </button>

            {isDropdownOpen && (
              <div
                className="absolute right-0 z-50 w-48 py-2 mt-2 bg-white rounded-lg shadow-lg"
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button
                  onClick={handleProfileClick}
                  className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                >
                  Mon profil
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
