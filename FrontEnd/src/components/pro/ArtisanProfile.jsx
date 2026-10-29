import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatTarif } from '../../utils/formatTarif';
import './ArtisanProfile.scss';

export default function ArtisanProfile() {
  const { id } = useParams(); // id_artisan : la cle de la table artisans
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `http://projet-fil-rouge-v2.test/index.php?route=artisan&id=${encodeURIComponent(id)}`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setArtisan(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("⚠️ Fiche artisan inaccessible :", err.message);
        setArtisan(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="loading">Chargement du profil...</div>;
  if (!artisan) return <div className="error">Artisan introuvable.</div>;

  return (
    <main className="artisan-profile-page">
      {/* 1. EN-TÊTE DU PROFIL */}
      <section className="profile-header">
        <div className="header-info">
          <div className="text-details">
            <h1>{artisan.nom_etablissement}</h1>
            <p className="specialite">🛠️ {artisan.metier}</p>
            <p className="adresse">
              📍 {artisan.ville} ({artisan.code_postal})
            </p>
            {artisan.tarif_min !== null && (
              <p className="tarif-min">
                À partir de <strong>{formatTarif(artisan.tarif_min)}</strong>
              </p>
            )}
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
            {artisan.adresse_etablissement && (
              <p className="adresse-postale">{artisan.adresse_etablissement}</p>
            )}
          </section>

          {/* Prestations & Tarifs */}
          <section className="profile-section">
            <h2>Prestations et tarifs</h2>
            <div className="services-list">
              {artisan.prestations && artisan.prestations.length > 0 ? (
                artisan.prestations.map((service) => (
                  <div key={service.id_prestation} className="service-card">
                    <div className="service-info">
                      <h3>{service.libelle}</h3>
                      <p>{service.description}</p>
                      <span className="duration">⏱️ {service.duree_estimee} min</span>
                    </div>
                    <div className="service-action">
                      <span className="price">{formatTarif(service.tarif)}</span>
                      <Link
                        to={`/reservation?pro=${artisan.id_artisan}&service=${service.id_prestation}`}
                        className="btn-select"
                      >
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

        </div>

        {/* COLONNE DROITE (STICKY) */}
        <aside className="sidebar">
          <div className="booking-card">
            <h3>Prendre rendez-vous</h3>
            <p>Réservez une prestation en quelques clics.</p>
            <Link to={`/reservation?pro=${artisan.id_artisan}`} className="btn-primary-large">
              Prendre RDV
            </Link>
          </div>
        </aside>

      </div>
    </main>
  );
}
