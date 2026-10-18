import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PublicLayout from "./layouts/PublicLayout";
import ProLayout from "./layouts/ProLayout";

import Home from "./pages/public/Home";
import SearchPro from "./pages/public/SearchPro";
import Booking from "./pages/public/Booking";
import Auth from "./pages/public/Auth";

import DashBoard from "./pages/pro/DashBoard";
import Planning from "./pages/pro/Agenda"; 
import Prestations from "./components/pro/PrestationTable";
import ProLogin from "./pages/pro/ProLogin";

import ContactPro from "./pages/public/ContactPro";
import Login from "./pages/public/Login";
import MyAppointments from "./pages/public/MyAppointments";
import Register from "./pages/public/Register";
import ArtisanProfile from './components/pro/ArtisanProfile';

import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import LegalNotice from "./pages/public/LegalNotice";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Partie publique */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/recherche" element={<SearchPro />} />
            <Route path="/reservation" element={<Booking />} />
            <Route path="/devis" element={<ContactPro />} />
            <Route path="/mes-rendez-vous" element={<MyAppointments/>} />
            <Route path="/connexion" element={<Auth/>} />
            <Route path="/politique-donnees" element={<PrivacyPolicy/>} />
            <Route path="/mentions-legales" element={<LegalNotice />} />
            <Route path="/inscription" element={<Auth />} />
            {/* Déplacé ici dans le layout public */}
            <Route path="/artisan/:id" element={<ArtisanProfile />} />
          </Route>

          {/* Route de Connexion Pro */}
          <Route path="/pro/connexion" element={<ProLogin />} />

          {/* Partie Pro */}
          <Route path="/pro" element={<ProLayout />}>
            <Route path="tableau-de-bord" element={<DashBoard />} />
            <Route path="planning" element={<Planning />} />
            <Route path="prestations" element={<Prestations />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}