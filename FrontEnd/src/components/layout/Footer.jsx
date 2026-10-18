import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import "./Footer.scss";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        
        <div className="footer__grid">
          
          {/* Colonne 1 : Marque & Présentation */}
          <div className="footer__brand-col">
            <div className="footer__logo">
              <span className="logo-icon">∞</span>
              <span className="logo-title">
                Infin<span className="logo-accent">Time</span>
              </span>
            </div>
            <p className="footer__desc">
              La solution tout-en-un de mise en relation et de prise de rendez-vous dédiée aux artisans, professionnels indépendants et leurs clients.
            </p>
            <div className="footer__socials">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <FaFacebook size={16} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <FaInstagram size={16} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                <FaTwitter size={16} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <FaLinkedin size={16} />
              </a>
            </div>
          </div>

          {/* Colonne 2 : Pour les clients */}
          <div className="footer__col">
            <h2>Pour les clients</h2>
            <ul>
              <li><Link to="/recherche">Rechercher un entrepreneur</Link></li>
              <li><Link to="/contact">Demander un devis travaux</Link></li>
            </ul>
          </div>

          {/* Colonne 3 : Pour les professionnels */}
          <div className="footer__col">
            <h2>Pour les professionnels</h2>
            <ul>
              <li><Link to="/pro/tableau-de-bord" className="highlight-link">Accéder à l'Espace Pro</Link></li>
              <li><Link to="/contact">Assistance partenaires</Link></li>
            </ul>
          </div>

          {/* Colonne 4 : Notre entreprise & Légal */}
          <div className="footer__col">
            <h2>Entreprise & Légal</h2>
            <ul>
              <li><Link to="/">À propos d'InfinTime</Link></li>
              <li><Link to="/mentions-legales">Mentions légales</Link></li>
              <li><Link to="/politique-donnees">Politique des données</Link></li>
              <li className="legal-info">SIREN : 912 345 678</li>
              <li className="legal-info">Capital : 10 000 €</li>
            </ul>
          </div>

        </div>

        {/* Barre inférieure de copyright */}
        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} InfinTime. Tous droits réservés. Projet Fil Rouge - Développeur Web.</p>
          <div className="footer__bottom-links">
            <button 
              type="button" 
              className="footer-cookie-btn" 
              onClick={() => window.dispatchEvent(new Event("open_cookie_banner"))}
            >
              Gestion des cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}