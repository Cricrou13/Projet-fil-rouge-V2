import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/api';
import { METIERS_SELECT } from '../../data/metiers';
import './Auth.scss';

export default function Auth() {
  const { loginClient, loginPro } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // L'onglet est DERIVE de l'URL et non stocké : `/connexion` et `/inscription`
  // montent le même composant, donc React ne le remonte pas en passant de l'un à
  // l'autre — un `useState('login')` ne se relancerait jamais et `/inscription`
  // afficherait le formulaire de connexion sous un titre « Connexion ».
  const activeTab = pathname === '/inscription' ? 'register' : 'login';

  // États pour le formulaire de connexion
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  
  // États pour le formulaire d'inscription
  const [registerData, setRegisterData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    role: 'client',
    metier: '',
    adresse_facturation: '',
    code_postal: '',
    ville: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Gestion des changements pour la connexion
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // Gestion des changements pour l'inscription
  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  // Soumission de la connexion (UNIQUE DECLARATION)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/connexion.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const textData = await response.text();
      let data;

      try {
        data = JSON.parse(textData);
      } catch (parseError) {
        setError("La réponse du serveur est invalide.");
        return;
      }

      if (data.success) {
        setMessage('Connexion réussie ! Redirection en cours...');

        if (data.user.role === 'artisan') {
          loginPro(data.user);
          setTimeout(() => navigate('/pro/tableau-de-bord'), 1000);
        } else {
          loginClient(data.user);
          setTimeout(() => navigate('/'), 1000);
        }
      } else {
        setError(data.message || "Identifiants incorrects.");
      }

    } catch (err) {
      setError('Erreur de communication avec l’API.');
    }
  };

  // Soumission de l'inscription
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Inscription réussie ! Vous pouvez vous connecter.');
        setTimeout(() => {
          navigate('/connexion');
          setMessage('');
        }, 1500);
      } else {
        setError(data.message || "Erreur lors de l'inscription.");
      }
    } catch (err) {
      setError('Erreur de communication avec l’API.');
    }
  };

  return (
    // <div> et non <main> : PublicLayout fournit déjà le <main> de la page.
    // ProLogin garde son <main> à lui, lui est monté hors de tout layout.
    <div className="auth-page">
      <div className="auth-card">
        {/* En-tête avec les onglets */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { navigate('/connexion'); setMessage(''); setError(''); }}
          >
            Connexion
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { navigate('/inscription'); setMessage(''); setError(''); }}
          >
            Inscription
          </button>
        </div>

        <div className="auth-content">
          <h1>InfinTime - <span>{activeTab === 'login' ? 'Connexion' : 'Inscription'}</span></h1>

          {message && <div className="alert-message success">{message}</div>}
          {error && <div className="alert-message error">{error}</div>}

          {/* Formulaire de Connexion */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <input
                type="email"
                name="email"
                aria-label="Adresse email"
                placeholder="Adresse email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />
              <input
                type="password"
                name="password"
                aria-label="Mot de passe"
                placeholder="Mot de passe"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
              <button type="submit" className="btn-submit">Se connecter</button>
            </form>
          )}

          {/* Formulaire d'Inscription */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <input
                type="text"
                name="nom"
                aria-label="Nom"
                placeholder="Nom"
                value={registerData.nom}
                onChange={handleRegisterChange}
                required
              />
              <input
                type="text"
                name="prenom"
                aria-label="Prénom"
                placeholder="Prénom"
                value={registerData.prenom}
                onChange={handleRegisterChange}
                required
              />
              <input
                type="email"
                name="email"
                aria-label="Email"
                placeholder="Email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
              />
              <input
                type="password"
                name="password"
                aria-label="Mot de passe"
                placeholder="Mot de passe"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
              />
              <input
                type="tel"
                name="telephone"
                aria-label="Téléphone"
                placeholder="Téléphone"
                value={registerData.telephone}
                onChange={handleRegisterChange}
              />
              <select
                name="role"
                aria-label="Rôle"
                value={registerData.role}
                onChange={handleRegisterChange}
              >
                <option value="client">Client</option>
                <option value="artisan">Artisan</option>
              </select>
              {registerData.role === 'artisan' && (
                <select
                  name="metier"
                  aria-label="Métier"
                  value={registerData.metier}
                  onChange={handleRegisterChange}
                  required
                >
                  <option value="" disabled>Votre métier</option>
                  {METIERS_SELECT.map((metier) => (
                    <option key={metier.value} value={metier.value}>
                      {metier.label}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="text"
                name="adresse_facturation"
                aria-label="Adresse"
                placeholder="Adresse"
                value={registerData.adresse_facturation}
                onChange={handleRegisterChange}
              />
              <input
                type="text"
                name="code_postal"
                aria-label="Code postal"
                placeholder="Code postal"
                value={registerData.code_postal}
                onChange={handleRegisterChange}
              />
              <input
                type="text"
                name="ville"
                aria-label="Ville"
                placeholder="Ville"
                value={registerData.ville}
                onChange={handleRegisterChange}
              />
              <button type="submit" className="btn-submit">S'inscrire</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}