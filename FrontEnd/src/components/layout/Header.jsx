import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.scss';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Récupération dynamique de la session depuis le contexte
  const { 
    clientUser, 
    proUser, 
    isClientConnected, 
    isProConnected, 
    logoutClient, 
    logoutPro 
  } = useAuth();

  // Détermination de l'utilisateur actif (Pro ou Client)
  const currentUser = isProConnected ? proUser : (isClientConnected ? clientUser : null);

  const handleLogout = () => {
    if (isProConnected) {
      logoutPro();
    } else {
      logoutClient();
    }
    setIsMenuOpen(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header__container">
        
        {/* Logo faisant office de retour à l'accueil */}
        <Link to="/" className="header__logo" aria-label="InfinTime - Accueil">
          <div className="logo-box" aria-hidden="true">∞</div>
          <div className="logo-text">
            Infin<span className="blue">Time</span>
          </div>
        </Link>

        {/* Bouton Burger Mobile */}
        <button 
          className="header__burger" 
          onClick={toggleMenu} 
          aria-label="Menu principal"
          aria-expanded={isMenuOpen}
        >
          ☰
        </button>

        {/* Menu & Actions */}
        <div className={`header__menu ${isMenuOpen ? 'is-open' : ''}`}>
          
          <nav className="header__nav">
            <Link to="/recherche" onClick={() => setIsMenuOpen(false)}>
              Rechercher un professionnel
            </Link>
            {currentUser && currentUser.role === 'client' && (
              <Link to="/mes-rendez-vous" onClick={() => setIsMenuOpen(false)}>
                Mes rendez-vous
              </Link>
            )}
          </nav>

          <div className="header__actions">
            {!currentUser ? (
              <>
                <Link to="/connexion" className="btn-pro" onClick={() => setIsMenuOpen(false)}>
                  Espace pro
                </Link>
                <Link to="/connexion" className="btn-primary" onClick={() => setIsMenuOpen(false)}>
                  Connexion
                </Link>
              </>
            ) : (
              <>
                {currentUser.role === 'artisan' && (
                  <Link to="/pro/tableau-de-bord" className="btn-pro" onClick={() => setIsMenuOpen(false)}>
                    Tableau de bord
                  </Link>
                )}
                <span className="user-link">
                  👤 {currentUser.prenom} {currentUser.nom}
                </span>
                <button onClick={handleLogout} className="btn-pro" style={{ color: '#ef4444' }}>
                  Déconnexion
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}