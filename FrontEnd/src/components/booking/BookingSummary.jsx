import { Calendar, Clock, MapPin, User, Mail, Phone } from "lucide-react";
import "./BookingSummary.scss";

// Coordonnées affichées, pas modifiables ici : la route d'écriture ne lit ni nom,
// ni e-mail, ni téléphone dans la requête. L'artisan verra le prénom et le nom du
// compte connecté, ceux que la session désigne. Laisser éditer ces champs donnerait
// une demande qui n'enregistre pas la modification.
export default function BookingSummary({ service, date, heure, pro, clientInfo }) {
  return (
    <div className="booking-summary-step">
      
      {/* RÉCAP DU RENDEZ-VOUS */}
      <div className="summary-overview-card">
        <h4>Détails de la réservation</h4>
        <div className="overview-grid">
          <div className="overview-item">
            <span className="label">Prestation :</span>
            <span className="val bold">{service?.nom}</span>
          </div>
          <div className="overview-item">
            <span className="label">Durée estimée :</span>
            <span className="val"><Clock size={14} /> {service?.duree}</span>
          </div>
          <div className="overview-item">
            <span className="label">Date & Heure :</span>
            <span className="val highlight"><Calendar size={14} /> {date} à {heure}</span>
          </div>
          <div className="overview-item">
            <span className="label">Lieu de RDV :</span>
            <span className="val"><MapPin size={14} /> {pro?.ville}</span>
          </div>
        </div>
        <div className="overview-price-bar">
          <span>Montant à régler sur place :</span>
          <span className="total-amount">{service?.prix} € TTC</span>
        </div>
      </div>

      {/* COORDONNEES DU COMPTE, telles que la session les transmet */}
      <div className="client-fields-card">
        <h4>Les coordonnées transmises à l'artisan</h4>
        <p className="fields-subtitle">
          Ce sont celles de votre compte. La demande n'envoie que le créneau et la
          prestation : c'est votre compte qui parle, pas un formulaire. Pour changer
          un nom ou un téléphone, passez par votre profil.
        </p>

        <div className="fields-grid">
          <div className="field-group">
            <span className="field-label">
              <User size={15} aria-hidden="true" /> Nom &amp; Prénom
            </span>
            <p className="field-valeur">{clientInfo?.nom || "—"}</p>
          </div>

          <div className="field-group">
            <span className="field-label">
              <Phone size={15} aria-hidden="true" /> Téléphone
            </span>
            <p className="field-valeur">{clientInfo?.telephone || "—"}</p>
          </div>

          <div className="field-group full">
            <span className="field-label">
              <Mail size={15} aria-hidden="true" /> Adresse e-mail
            </span>
            <p className="field-valeur">{clientInfo?.email || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}