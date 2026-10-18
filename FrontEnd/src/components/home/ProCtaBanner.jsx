import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import "./ProCtaBanner.scss";

export default function ProCtaBanner() {
  const benefits = [
    "Agenda synchronisé sans double réservation",
    "Moins de rendez-vous manqués grâce aux rappels",
    "Fiches clients et suivi des devis centralisés",
    "Visibilité locale renforcée sur votre région",
  ];

  return (
    <section className="pro-cta-banner">
      <div className="pro-cta-banner__container">
        <div className="pro-cta-banner__content">
          <span className="pro-tag">Espace Artisans & Entreprises</span>
          <h2>
            Vous êtes entrepreneur ? <br />
            <span>Gagnez du temps et développez votre clientèle</span>
          </h2>
          <p>
            InfinTime vous libère des contraintes administratives. Vos clients réservent leurs créneaux en ligne, vous vous concentrez sur votre savoir-faire.
          </p>

          <ul className="pro-cta-banner__list">
            {benefits.map((b, idx) => (
              <li key={idx}>
                <span className="check-icon"><Check size={14} /></span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="pro-cta-banner__actions">
            <Link to="/pro/tableau-de-bord" className="btn-pro-primary">
              <span>Accéder à l'Espace Pro</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
