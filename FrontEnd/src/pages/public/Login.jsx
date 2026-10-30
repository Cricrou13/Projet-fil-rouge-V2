import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Login() {
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
      const connecte = await login(formData.email, formData.password);

      if (connecte.role === 'artisan') {
        navigate('/pro/tableau-de-bord');
      } else {
        navigate('/mes-rendez-vous');
      }
    } catch (err) {
      setError(err.message || 'Identifiants incorrects.');
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