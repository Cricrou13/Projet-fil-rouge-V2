import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import "./ProCtaBanner.scss";

export default function ProCtaBanner() {
  const benefits = [
    "Un planning hebdomadaire alimenté par vos rendez-vous enregistrés",
    "Vos prestations et vos tarifs publiés, visibles par les clients",
    "Les devis enregistrés pour votre établissement, regroupés dans un tableau de bord",
    "Une fiche d'établissement reprise dans la recherche par métier et par ville",
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
            Vos clients préparent leur demande — prestation, créneau souhaité, coordonnées — et vous l'envoient par email. L'espace pro, lui, lit les rendez-vous et les devis enregistrés pour votre établissement.
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
