import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import "./CookieBanner.scss";
export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    // 1. Vérifie si l'utilisateur a déjà fait son choix
    const consent = localStorage.getItem("inftime_cookie_consent");
    
    // Si aucun choix enregistré, on affiche le bandeau après 600ms
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 600);
      return () => clearTimeout(timer);
    }
    // 2. Écouteur pour rouvrir le bandeau si l'utilisateur clique sur "Cookies" dans le footer
    const handleOpen = () => setIsVisible(true);
    window.addEventListener("open_cookie_banner", handleOpen);
    return () => window.removeEventListener("open_cookie_banner", handleOpen);
  }, []);
  const handleAccept = () => {
    localStorage.setItem("inftime_cookie_consent", "accepted");
    setIsVisible(false);
  };
  const handleRefuse = () => {
    localStorage.setItem("inftime_cookie_consent", "essential_only");
    setIsVisible(false);
  };
  if (!isVisible) return null;
  return (
    <aside 
      className="cookie-banner" 
      role="dialog" 
      aria-live="polite" 
      aria-label="Gestion des cookies"
    >
      <div className="cookie-banner__content">
        
        {/* EN-TÊTE DU BANDEAU */}
        <div className="cookie-banner__header">
          <div className="cookie-icon-wrapper">
            <Cookie size={20} />
          </div>
          <h4>Respect de votre vie privée</h4>
          <button 
            type="button" 
            className="cookie-banner__close" 
            onClick={handleRefuse}
            title="Continuer avec les essentiels uniquement"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>
        {/* TEXTE EXPLICATIF */}
        <p className="cookie-banner__text">
          InfinTime utilise des cookies techniques strictement nécessaires au fonctionnement de la plateforme (session de connexion, sécurité, gestion du panier de réservation). Aucun traceur publicitaire intrusif n'est utilisé.
        </p>
        {/* ACTIONS */}
        <div className="cookie-banner__actions">
          <button type="button" className="btn-cookie-accept" onClick={handleAccept}>
            Accepter
          </button>
          <button type="button" className="btn-cookie-refuse" onClick={handleRefuse}>
            Essentiels uniquement
          </button>
          <Link to="/politique-donnees" className="cookie-banner__link" onClick={() => setIsVisible(false)}>
            En savoir plus
          </Link>
        </div>
      </div>
    </aside>
  );
}