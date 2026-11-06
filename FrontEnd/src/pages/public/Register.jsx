import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import './Register.scss';

function Register() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    role: 'client',
    adresse_facturation: '',
    code_postal: '',
    ville: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/register.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Compte créé avec succès ! Tu peux maintenant te connecter.');
      } else {
        setError(data.message || 'Erreur lors de l’inscription.');
      }
    } catch (err) {
      setError('Erreur de communication avec l’API.');
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Inscription à <span>InfinTime</span></h2>
        
        {message && <div className="alert-message success">{message}</div>}
        {error && <div className="alert-message error">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="telephone"
            placeholder="Téléphone"
            onChange={handleChange}
          />
          
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="client">Client</option>
            <option value="artisan">Artisan</option>
          </select>

          <input
            type="text"
            name="adresse_facturation"
            placeholder="Adresse"
            onChange={handleChange}
          />
          <input
            type="text"
            name="code_postal"
            placeholder="Code postal"
            onChange={handleChange}
          />
          <input
            type="text"
            name="ville"
            placeholder="Ville"
            onChange={handleChange}
          />

          <button type="submit" className="btn-submit">
            S'inscrire
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;