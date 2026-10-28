import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import './ArtisanProfile.scss';

export default function ArtisanProfile() {
  const { id } = useParams(); // Récupère l'ID de l'artisan depuis l'URL
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("ID récupéré", id);
    // Récupération des données de l'artisan
    fetch(`${API_BASE_URL}/artisan.php?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setArtisan(data.artisan);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="loading">Chargement du profil...</div>;
  if (!artisan) return <div className="error">Artisan introuvable.</div>;

  return (
    <main className="artisan-profile-page">
      {/* 1. BANIÈRE / EN-TÊTE DU PROFIL */}
      <section className="profile-header">
        <div className="banner">
          <img 
            src={artisan.photo_couverture || '/assets/default-banner.jpg'} 
            alt="Couverture" 
          />
        </div>
        <div className="header-info">
          <img 
            className="avatar" 
            src={artisan.photo_profil || '/assets/default-avatar.png'} 
            alt={artisan.nom_entreprise} 
          />
          <div className="text-details">
            <h1>{artisan.nom_entreprise || `${artisan.prenom} ${artisan.nom}`}</h1>
            <p className="specialite">🛠️ {artisan.specialite || 'Artisan'}</p>
            <p className="adresse">📍 {artisan.ville} ({artisan.code_postal})</p>
            <div className="note-globale">
              ⭐ <strong>{artisan.note_moyenne || '5.0'}</strong> ({artisan.nombre_avis || 0} avis)
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONTENU PRINCIPAL EN 2 COLONNES */}
      <div className="profile-container">
        
        {/* COLONNE GAUCHE */}
        <div className="main-content">
          
          {/* À propos */}
          <section className="profile-section">
            <h2>À propos</h2>
            <p>{artisan.description || "Aucune description renseignée pour le moment."}</p>
          </section>

          {/* Prestations & Tarifs */}
          <section className="profile-section">
            <h2>Prestations et tarifs</h2>
            <div className="services-list">
              {artisan.prestations && artisan.prestations.length > 0 ? (
                artisan.prestations.map((service) => (
                  <div key={service.id} className="service-card">
                    <div className="service-info">
                      <h3>{service.nom}</h3>
                      <p>{service.description}</p>
                      <span className="duration">⏱️ {service.duree} min</span>
                    </div>
                    <div className="service-action">
                      <span className="price">{service.prix} €</span>
                      <Link to={`/reservation?pro=${artisan.id}&service=${service.id}`} className="btn-select">
                        Choisir
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p>Aucune prestation disponible pour le moment.</p>
              )}
            </div>
          </section>

          {/* Galerie de réalisations */}
          <section className="profile-section">
            <h2>Réalisations</h2>
            <div className="gallery-grid">
              {artisan.photos && artisan.photos.map((photo, index) => (
                <img key={index} src={photo.url} alt={`Réalisation ${index + 1}`} />
              ))}
            </div>
          </section>

          {/* Avis clients */}
          <section className="profile-section">
            <h2>Avis clients</h2>
            <div className="reviews-list">
              {/* Boucle sur les avis */}
            </div>
          </section>

        </div>

        {/* COLONNE DROITE (STICKY) */}
        <aside className="sidebar">
          <div className="booking-card">
            <h3>Prendre rendez-vous</h3>
            <p>Réservez une prestation en quelques clics.</p>
            <Link to={`/reservation?pro=${artisan.id}`} className="btn-primary-large">
              Prendre RDV
            </Link>

            <hr />

            <div className="business-hours">
              <h4>Horaires d'ouverture</h4>
              <ul>
                <li><span>Lundi - Vendredi :</span> 08:00 - 18:00</li>
                <li><span>Samedi :</span> 09:00 - 12:00</li>
                <li><span>Dimanche :</span> Fermé</li>
              </ul>
            </div>
          </div>
        </aside>

      </div>
    </main>
  );
}