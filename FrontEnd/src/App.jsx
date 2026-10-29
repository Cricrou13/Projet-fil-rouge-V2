import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import SectionIndisponible from "./pages/pro/SectionIndisponible";
import ProLogin from "./pages/pro/ProLogin";
import Devis from "./pages/public/Devis";
import Login from "./pages/public/Login";
import MyAppointments from "./pages/public/MyAppointments";
import PageIntrouvable from "./pages/public/PageIntrouvable";
import PageContact from "./pages/public/PageContact";
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
            <Route path="/devis" element={<Devis />} />
            <Route path="/contact" element={<PageContact />} />
            <Route path="/mes-rendez-vous" element={<MyAppointments/>} />
            <Route path="/connexion" element={<Auth/>} />
            <Route path="/politique-donnees" element={<PrivacyPolicy/>} />
            <Route path="/mentions-legales" element={<LegalNotice />} />
            <Route path="/inscription" element={<Auth />} />
            <Route path="/artisan/:id" element={<ArtisanProfile />} />
            {/* Le `*` public est classé après la branche /pro (préfixe statique
                mieux noté), il ne peut donc pas voler une URL de l'espace pro. */}
            <Route path="*" element={<PageIntrouvable />} />
          </Route>

          {/* Route de Connexion Pro */}

          <Route path="/pro/connexion" element={<ProLogin />} />

          {/* Partie Pro */}

          <Route path="/pro" element={<ProLayout />}>
            {/* /pro nu n'est pas un segment vide pour `path="*"` : sans index,
                <main> resterait vide même avec la sidebar. */}
            <Route index element={<Navigate to="/pro/tableau-de-bord" replace />} />
            <Route path="tableau-de-bord" element={<DashBoard />} />
            <Route path="planning" element={<Planning />} />
            <Route path="prestations" element={<Prestations />} />
            {/* Les liens « Clientèle » et « Paramètres » de la sidebar pointent ici
                en attendant leur page : sans cette ligne, aucun match ne remonte et
                c'est tout #root qui se vide, pas seulement <main>. */}
            <Route path="*" element={<SectionIndisponible />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>

  );

} 