// src/App.jsx
import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layout
import Layout from "./components/Layout/Layout";

// Pages Auth
import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";

// Pages Utilisateurs
import UsersList from "./pages/Users/UsersList";
import UserDetail from "./pages/Users/UserDetail";
import UserCreate from "./pages/Users/UserCreate";
import UserEdit from "./pages/Users/UserEdit";

// Pages Livraisons
import LivraisonsList from "./pages/Livraisons/LivraisonsList";
import LivraisonDetail from "./pages/Livraisons/LivraisonDetail";

// Pages Livreurs
import LivreursList from "./pages/Livreurs/LivreursList";
import LivreurDetail from "./pages/Livreurs/LivreurDetail";

// Pages Clients
import ClientsList from "./pages/Clients/ClientsList";
import ClientDetail from "./pages/Clients/ClientDetail";

// Pages Demandes d'adhésion
import DemandesAdhesionList from "./pages/DemandesAdhesion/DemandesList";
import DemandeAdhesionDetail from "./pages/DemandesAdhesion/DemandeDetail";

// Pages Avis
import AvisList from "./pages/Avis/AvisList";

// Pages Bordereaux
import BordereauxList from "./pages/Bordereaux/BordereauxList";

// Pages Profil
import Profile from "./pages/Profile/Profile";

// Page Dashboard
import Dashboard from "./pages/Dashboard";

// Pages Navettes
import NavettesList from "./pages/Navettes/NavettesList";
import NavetteDetail from "./pages/Navettes/NavetteDetail";
import NavetteCreate from "./pages/Navettes/NavetteCreate";
import NavetteEdit from "./pages/Navettes/NavetteEdit";

// Pages Comptabilité
import ComptabiliteDashboard from "./pages/Comptabilite/ComptabiliteDashboard";
import RapportGains from "./pages/Comptabilite/RapportGains";
import ImpayesList from "./pages/Comptabilite/ImpayesList";
import HistoriqueGains from "./pages/Comptabilite/HistoriqueGains";

// NOUVELLES PAGES COMMISSIONS
import CommissionConfig from "./pages/Comptabilite/CommissionConfig";
import GainsGestionnaire from "./pages/Comptabilite/GainsGestionnaire";

// NOUVELLES PAGES GAINS NAVETTE
import GainsNavetteList from "./pages/Comptabilite/GainsNavetteList";
import NavetteGains from "./pages/Comptabilite/NavetteGains";

/* ================= ROUTES PROTÉGÉES ================= */

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              style: {
                background: "#10B981",
              },
            },
            error: {
              duration: 4000,
              style: {
                background: "#EF4444",
              },
            },
          }}
        />

        <Routes>
          {/* ROUTES PUBLIQUES */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ROUTES PROTÉGÉES */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />

            {/* UTILISATEURS */}
            <Route path="users" element={<UsersList />} />
            <Route path="users/create" element={<UserCreate />} />
            <Route path="users/:id" element={<UserDetail />} />
            <Route path="users/edit/:id" element={<UserEdit />} />

            {/* LIVRAISONS */}
            <Route path="livraisons" element={<LivraisonsList />} />
            <Route path="livraisons/:id" element={<LivraisonDetail />} />

            {/* LIVREURS */}
            <Route path="livreurs" element={<LivreursList />} />
            <Route path="livreurs/:id" element={<LivreurDetail />} />

            {/* CLIENTS */}
            <Route path="clients" element={<ClientsList />} />
            <Route path="clients/:id" element={<ClientDetail />} />

            {/* DEMANDES D'ADHÉSION */}
            <Route
              path="demandes-adhesion"
              element={<DemandesAdhesionList />}
            />
            <Route
              path="demandes-adhesion/:id"
              element={<DemandeAdhesionDetail />}
            />

            {/* AVIS */}
            <Route path="avis" element={<AvisList />} />

            {/* BORDEREAUX */}
            <Route path="bordereaux" element={<BordereauxList />} />

            {/* NAVETTES */}
            <Route path="navettes" element={<NavettesList />} />
            <Route path="navettes/create" element={<NavetteCreate />} />
            <Route path="navettes/:id" element={<NavetteDetail />} />
            <Route path="navettes/edit/:id" element={<NavetteEdit />} />

            {/* COMPTABILITÉ */}
            <Route path="comptabilite" element={<ComptabiliteDashboard />} />
            <Route path="comptabilite/rapport" element={<RapportGains />} />
            <Route path="comptabilite/impayes" element={<ImpayesList />} />
            <Route path="comptabilite/historique" element={<HistoriqueGains />} />
            
            {/* ROUTES COMMISSIONS */}
            <Route path="comptabilite/commissions/config" element={<CommissionConfig />} />
            <Route path="comptabilite/commissions/gestionnaire/:id" element={<GainsGestionnaire />} />
            
            {/* ROUTES GAINS NAVETTE */}
            <Route path="comptabilite/gains-navette" element={<GainsNavetteList />} />
            <Route path="comptabilite/navette/:id/gains" element={<NavetteGains />} />

            {/* PROFIL */}
            <Route path="profile" element={<Profile />} />

            {/* 404 - REDIRECTION */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;