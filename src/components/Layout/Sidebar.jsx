// src/components/Layout/Sidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaTruck,
  FaUserFriends,
  FaBars,
  FaTimes,
  FaBoxes,
  FaChartLine,
  FaMoneyBillWave,
  FaClipboardList,
  FaStar,
  FaFileAlt,
  FaUserPlus,
  FaPercentage,
  FaChevronDown,
  FaChevronUp,
  FaHistory,
} from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [comptaOpen, setComptaOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: FaHome },
    { name: "Utilisateurs", href: "/users", icon: FaUsers },
    { name: "Livraisons", href: "/livraisons", icon: FaTruck },
    { name: "Livreurs", href: "/livreurs", icon: FaUserFriends },
    // { name: "Clients", href: "/clients", icon: FaUserFriends },
    { name: "Navettes", href: "/navettes", icon: FaBoxes },
    {
      name: "Comptabilité",
      icon: FaChartLine,
      submenu: [
        { name: "Dashboard", href: "/comptabilite", icon: FaChartLine },
        { name: "Rapport gains", href: "/comptabilite/rapport", icon: FaMoneyBillWave },
        { name: "Impayés", href: "/comptabilite/impayes", icon: FaClipboardList },
        { name: "Historique", href: "/comptabilite/historique", icon: FaHistory },
        { name: "Commissions", href: "/comptabilite/commissions/config", icon: FaPercentage },
      ],
      hasSubmenu: true,
    },
    // { name: "Bordereaux", href: "/bordereaux", icon: FaClipboardList },
    {
      name: "Demandes d'adhésion",
      href: "/demandes-adhesion",
      icon: FaUserPlus,
    },
    // { name: "Avis", href: "/avis", icon: FaStar },
  ];

  const handleComptaClick = (e) => {
    e.preventDefault();
    setComptaOpen(!comptaOpen);
  };

  return (
    <>
      {/* Bouton hamburger pour mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed z-50 p-2 bg-white rounded-lg shadow-md top-4 left-4 lg:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <FaTimes className="w-6 h-6 text-gray-700" />
        ) : (
          <FaBars className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative z-40 h-full bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:w-64 overflow-y-auto ${
          isOpen ? "translate-x-0 w-64" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6">
          <h2 className="text-lg font-semibold text-gray-800">Tawssil Admin</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 lg:hidden"
            aria-label="Close menu"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="px-4 space-y-1 pb-20">
          {navigation.map((item) => {
            if (item.hasSubmenu) {
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={handleComptaClick}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </div>
                    {comptaOpen ? (
                      <FaChevronUp className="w-4 h-4" />
                    ) : (
                      <FaChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  
                  {comptaOpen && (
                    <div className="ml-4 space-y-1">
                      {item.submenu.map((subItem) => (
                        <NavLink
                          key={subItem.name}
                          to={subItem.href}
                          onClick={() => setIsOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                              isActive
                                ? "bg-primary-50 text-primary-700"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`
                          }
                        >
                          <subItem.icon className="w-4 h-4 mr-3" />
                          {subItem.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100">
              <span className="font-medium text-primary-700">TA</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Tawssil Go</p>
              <p className="text-xs text-gray-500">Version 2.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;