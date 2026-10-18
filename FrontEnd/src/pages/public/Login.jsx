import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/api';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { loginPro, loginClient } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("1. Formulaire soumis avec :", formData); // <-- VÉRIFICATION DE CLIC
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/connexion.php`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
});

const data = await response.json();

if (response.ok && data.success) {
  if (data.user.role === 'artisan' || data.user.role === 'pro') {
    loginPro(data.user);
    navigate('/pro/tableau-de-bord');
  } else {
    loginClient(data.user);
    navigate('/mes-rendez-vous');
  }
} else {
  // Affiche le message de mon API PHP (ex: "Mot de passe incorrect")
  setError(data.message || 'Identifiants incorrects.');

      }
    } catch (err) {
      console.error("Erreur Fetch :", err);
      setError('Erreur de connexion au serveur.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h2>Connexion</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email :</label>
          <input
            type="email"
            name="email"
            autoComplete="email" 
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>
        <div>
          <label>Mot de passe :</label>
          <input
            type="password"
            name="password"
            autoComplete="current-password" 
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: '100%', marginBottom: '10px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          Se connecter
        </button>
      </form>
    </div>
  );
}

export default Login;