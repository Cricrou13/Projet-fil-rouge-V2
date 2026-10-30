import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ProLogin.scss';

export default function ProLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData.email, formData.password);

      // Pas de test de role ici : ProLayout garde la page tant que la session
      // ne designe pas une fiche artisan, sur la meme reponse serveur que les
      // autres pages.
      navigate('/pro/tableau-de-bord');
    } catch (err) {
      // Le serveur ne dit qu'une chose a la fois : 'Identifiants incorrects'.
      setError(err.message || 'Connexion impossible.');
    }
  };

  return (
    <main className="pro-login-page">
      <div className="pro-login-container">
        {/* Côté gauche : Illustration / Valeur pour les pros */}
        <div className="pro-info-side">
          <div className="info-content">
            <span className="badge-pro">Espace Partenaire</span>
            <h1>Développez votre activité avec <span>InfinTime</span></h1>
            <p>Gérez votre planning, vos prestations et vos rendez-vous clients en toute simplicité depuis votre tableau de bord dédié.</p>
            <ul className="pro-benefits">
              <li>✔ Agenda en ligne synchronisé</li>
              <li>✔ Visibilité accrue auprès de nouveaux clients</li>
              <li>✔ Suivi de vos revenus et prestations</li>
            </ul>
          </div>
        </div>

        {/* Côté droit : Formulaire de connexion */}
        <div className="pro-form-side">
          <div className="form-wrapper">
            <h2>Connexion Pro</h2>
            <p className="subtitle">Accédez à votre espace professionnel</p>

            {error && <div className="alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="pro-form">
              <div className="input-group">
                <label htmlFor="pro-email">Email professionnel</label>
                <input
                  id="pro-email"
                  type="email"
                  name="email"
                  placeholder="artisan@exemple.fr"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="pro-password">Mot de passe</label>
                <input
                  id="pro-password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn-pro-submit">
                Se connecter à mon espace
              </button>
            </form>

            <div className="pro-footer-links">
              <p>Pas encore de compte artisan ? <Link to="/inscription">Inscrivez-vous ici</Link></p>
              <Link to="/" className="back-home">← Retourner à l'accueil</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}