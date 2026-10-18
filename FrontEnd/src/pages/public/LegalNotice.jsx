import { Link } from "react-router-dom";
import { 
  Building2, 
  Server, 
  Copyright, 
  Scale, 
  Mail, 
  ArrowLeft,
  ShieldCheck
} from "lucide-react";
import "./LegalNotice.scss";
export default function LegalNotice() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        {/* LIEN RETOUR & EN-TÊTE */}
        <div className="legal-top-bar">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            <span>Retour à l'accueil</span>
          </Link>
          <span className="last-updated">Dernière révision : Septembre 2026</span>
        </div>
        <header className="legal-header">
          <div className="legal-header-badge">
            <Scale size={28} />
          </div>
          <h1>Mentions Légales</h1>
          <p>
            Conformément aux dispositions de l'article 6 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'Économie Numérique (LCEN), voici les informations légales de la plateforme InfinTime.
          </p>
        </header>
        {/* CONTENU */}
        <div className="legal-content">
          {/* 1. ÉDITEUR DU SITE */}
          <section className="legal-card">
            <div className="card-title">
              <div className="card-icon">
                <Building2 size={20} />
              </div>
              <h2>1. Éditeur de la plateforme</h2>
            </div>
            <div className="card-body">
              <p>Le site internet <strong>InfinTime</strong> est édité et exploité par :</p>
              <div className="info-block">
                <p><strong>Raison sociale :</strong> InfinTime SAS</p>
                <p><strong>Forme juridique :</strong> Société par Actions Simplifiée au capital de 10 000 €</p>
                <p><strong>SIREN :</strong> 912 345 678 · <strong>RCS :</strong> Toulouse B 912 345 678</p>
                <p><strong>Siège social :</strong> 12 Avenue des Métiers, 31000 Toulouse, France</p>
                <p><strong>Numéro de TVA intracommunautaire :</strong> FR 82 912345678</p>
                <p><strong>Directeur de la publication :</strong> Christophe R. (Projet Fil Rouge Développeur Web)</p>
                <p><strong>Contact électronique :</strong> <code>contact@inftime.fr</code></p>
              </div>
            </div>
          </section>
          {/* 2. HÉBERGEMENT */}
          <section className="legal-card">
            <div className="card-title">
              <div className="card-icon">
                <Server size={20} />
              </div>
              <h2>2. Hébergement</h2>
            </div>
            <div className="card-body">
              <p>Le site et la base de données d'InfinTime sont hébergés par :</p>
              <div className="info-block">
                <p><strong>Hébergeur :</strong> Vercel Inc. / OVHcloud SAS</p>
                <p><strong>Adresse :</strong> 2 Rue Kellermann, 59100 Roubaix, France</p>
                <p><strong>Localisation des centres de données :</strong> Paris & Francfort (Union Européenne)</p>
                <p><strong>Site web hébergeur :</strong> <a href="https://www.ovhcloud.com" target="_blank" rel="noreferrer">www.ovhcloud.com</a></p>
              </div>
            </div>
          </section>
          {/* 3. PROPRIÉTÉ INTELLECTUELLE */}
          <section className="legal-card">
            <div className="card-title">
              <div className="card-icon">
                <Copyright size={20} />
              </div>
              <h2>3. Propriété intellectuelle</h2>
            </div>
            <div className="card-body">
              <p>
                L'ensemble des éléments constituant la plateforme InfinTime (structure générale, code source, graphismes, logo « ∞ InfinTime », textes, icônes et charte graphique) sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle.
              </p>
              <p>
                Toute reproduction, représentation, modification ou diffusion totale ou partielle, sans l'accord préalable écrit de l'éditeur, est strictement interdite et sanctionnée au titre de la contrefaçon (articles L.335-2 et suivants du Code de la propriété intellectuelle).
              </p>
            </div>
          </section>
          {/* 4. DONNÉES PERSONNELLES & COOKIES */}
          <section className="legal-card highlight-card">
            <div className="card-title">
              <div className="card-icon">
                <ShieldCheck size={20} />
              </div>
              <h2>4. Données personnelles et cookies</h2>
            </div>
            <div className="card-body">
              <p>
                Le traitement de vos données personnelles est régi par notre politique stricte de conformité RGPD. Pour en savoir plus sur vos droits (accès, rectification, suppression) et les cookies utilisés :
              </p>
              <Link to="/politique-donnees" className="btn-link-privacy">
                Consulter notre Politique de protection des données &rarr;
              </Link>
            </div>
          </section>
          {/* 5. DROIT APPLICABLE */}
          <section className="legal-card">
            <div className="card-title">
              <div className="card-icon">
                <Scale size={20} />
              </div>
              <h2>5. Droit applicable et juridiction</h2>
            </div>
            <div className="card-body">
              <p>
                Les présentes mentions légales sont régies par le droit français. En cas de litige relatif à l'interprétation ou à l'exécution de ces mentions, les tribunaux compétents de Toulouse seront seuls habilités, après échec de toute tentative de médiation amiable.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}