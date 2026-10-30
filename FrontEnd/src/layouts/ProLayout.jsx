import { Outlet, Navigate, useNavigate } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import Sidebar from "../components/layout/Sidebar";
import { getMetierConfig } from "../data/metiers";
import { useAuth } from "../context/AuthContext";
import "./ProLayout.scss";

export default function ProLayout() {
  const { proUser, logoutPro, authCharge } = useAuth(); 
  const navigate = useNavigate();

  // La session se probe en une requête asynchrone : rediriger avant la réponse
  // éjecterait de son espace un artisan qui rafraîchit simplement la page.
  if (!authCharge) {
    return null;
  }

  // 🔒 PROTECTION : Redirection vers la connexion pro dédiée
  if (!proUser) {
    return <Navigate to="/pro/connexion" replace />;
  }

  // Fonction de déconnexion
  const handleLogout = () => {
    if (logoutPro) logoutPro();
    navigate("/pro/connexion", { replace: true });
  };

  const currentMetier = proUser?.metier || "default";
  const config = getMetierConfig(currentMetier) || { color: '#007bff', bgLight: '#f8f9fa' };

  return (
    <div
      className="pro-layout"
      style={{
        "--color-accent": config.color,
        "--color-accent-bg": config.bgLight,
      }}
    >
      <div className="pro-body">
        <Sidebar onLogout={handleLogout} />
        <div className="pro-content">
          <Topbar nom={proUser?.nom || "Pro"} onLogout={handleLogout} />
          <main>
            <Outlet context={{ metier: currentMetier }} />
          </main>
        </div>
      </div>
    </div>
  );
}