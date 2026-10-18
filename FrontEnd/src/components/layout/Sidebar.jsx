import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./Sidebar.scss";
export default function Sidebar() {
  // Gestion du menu burger sur mobile
  const [menuOpen, setMenuOpen] = useState(false);
  // Gestion de la sidebar rétractable sur desktop
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { logoutPro} = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutPro();
    navigate("/");
  };

    return (
    <>
      {/* Bouton burger visible uniquement sur mobile */}
      <button
        type="button"
        className="sidebar-burger"
        aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <aside className={`sidebar ${menuOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
        
        {/* En-tête de la sidebar avec Logo et Bouton Toggle */}
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo" onClick={() => setMenuOpen(false)} title="Retour au site public">
            <div className="logo-badge">∞</div>
            {!isCollapsed && (
              <div className="logo-text">
                <span className="logo-brand">Infin<span className="logo-accent">Time</span></span>
                <span className="logo-pro">Espace Pro</span>
              </div>
            )}
          </Link>
          {/* Bouton flèche pour réduire / agrandir la sidebar */}
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Déplier le menu" : "Réduire le menu"}
            aria-label={isCollapsed ? "Déplier le menu" : "Réduire le menu"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        {/* Liens de navigation */}
        <nav className="sidebar-nav" aria-label="Navigation professionnelle">
          <NavLink
            to="/pro/tableau-de-bord"
            end
            onClick={() => setMenuOpen(false)}
            title="Tableau de bord"
          >
            <span className="icon-badge icon-badge--indigo">
            <LayoutDashboard size={20} aria-hidden="true" />
            </span>
            {!isCollapsed && <span className="sidebar-label">Tableau de bord</span>}
          </NavLink>
          <NavLink
            to="/pro/planning"
            onClick={() => setMenuOpen(false)}
            title="Planning / Agenda"
          >
            <span className="icon-badge icon-badge--emerald">
            <Calendar size={20} aria-hidden="true" />
            </span>
            {!isCollapsed && <span className="sidebar-label">Planning</span>}
          </NavLink>
          <NavLink
            to="/pro/prestations"
            onClick={() => setMenuOpen(false)}
            title="Prestations & Tarifs"
          >
            <span className="icon-badge icon-badge--blue">
            <Briefcase size={20} aria-hidden="true" />
            </span>
            {!isCollapsed && <span className="sidebar-label">Prestations</span>}
          </NavLink>
          <NavLink
            to="/pro/clientele"
            onClick={() => setMenuOpen(false)}
            title="Fichier Clientèle"
          >
            <span className="icon-badge icon-badge--amber">
            <Users size={20} aria-hidden="true" />
            </span>
            {!isCollapsed && <span className="sidebar-label">Clientèle</span>}
          </NavLink>
          <NavLink
            to="/pro/parametres"
            onClick={() => setMenuOpen(false)}
            title="Paramètres du compte"
          >
            <span className="icon-badge icon-badge--slate">
            <Settings size={20} aria-hidden="true" />
            </span>
            {!isCollapsed && <span className="sidebar-label">Paramètres</span>}
          </NavLink>
        </nav>
        {/* Bas de la sidebar : Déconnexion */}
          <div className="sidebar-footer">
            <button type="button" className="sidebar-logout" onClick={handleLogout} title="Déconnexion">
              <span className="icon-badge icon-badge--red">
                <LogOut size={20} aria-hidden="true" />
              </span>
              {!isCollapsed && <span className="sidebar-label">Déconnexion</span>}
            </button>
          </div>
      </aside>
    </>
  );
}