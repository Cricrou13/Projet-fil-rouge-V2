import { Calendar, Clock, MapPin, User, Mail, Phone, ShieldCheck } from "lucide-react";
import "./BookingSummary.scss";

export default function BookingSummary({ service, date, heure, pro, clientInfo, setClientInfo }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientInfo((prev) => ({ ...prev, [name]: value }));
  };

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
            <span className="val"><MapPin size={14} /> {pro?.ville} (Salon ou Domicile)</span>
          </div>
        </div>
        <div className="overview-price-bar">
          <span>Montant à régler sur place :</span>
          <span className="total-amount">{service?.prix} € TTC</span>
        </div>
      </div>

      {/* COORDONNÉES CLIENT POUR RAPPEL */}
      <div className="client-fields-card">
        <h4>Vos coordonnées pour la confirmation</h4>
        <p className="fields-subtitle">Ces informations permettent à l'artisan de vous contacter si nécessaire.</p>
        
        <div className="fields-grid">
          
          {/* Nom & Prénom */}
          <div className="field-group">
            <div className="label-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <User size={15} aria-hidden="true" />
              <label htmlFor="client-nom">Nom & Prénom</label>
            </div>
            <input 
              id="client-nom"
              type="text" 
              name="nom" 
              aria-label="Nom & Prénom"
              value={clientInfo?.nom || ''} 
              onChange={handleChange}
              required 
            />
          </div>

          {/* Téléphone */}
          <div className="field-group">
            <div className="label-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Phone size={15} aria-hidden="true" />
              <label htmlFor="client-tel">Téléphone</label>
            </div>
            <input 
              id="client-tel"
              type="tel" 
              name="telephone" 
              aria-label="Téléphone (rappel SMS)"
              value={clientInfo?.telephone || ''} 
              onChange={handleChange}
              required 
            />
          </div>

          {/* E-mail */}
          <div className="field-group full">
            <div className="label-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Mail size={15} aria-hidden="true" />
              <label htmlFor="client-email">Adresse e-mail</label>
            </div>
            <input 
              id="client-email"
              type="email" 
              name="email" 
              aria-label="Adresse e-mail"
              value={clientInfo?.email || ''} 
              onChange={handleChange}
              required 
            />
          </div>

        </div>
      </div>
    </div>
  );
}