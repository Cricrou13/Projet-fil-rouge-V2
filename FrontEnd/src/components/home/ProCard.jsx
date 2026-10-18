import React from "react";
import { Star, MapPin, Calendar, CheckCircle2, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { getMetierConfig } from "../../data/metiers";
import "./ProCard.scss";

export default function ProCard({ pro }) {
  const initials = pro.initials || (pro.name ? pro.name.split(" ").map((n) => n[0]).join("") : "PRO");
  
  // Récupération de la couleur du métier (Rose, Cyan, Ocre...)
  const config = getMetierConfig(pro.metier);

  // Identification dynamique de l'ID (gère pro.id ou pro.Id_utilisateur)
  const proId = pro.id || pro.Id_utilisateur || pro.id_utilisateur;

  return (
    <article 
      className="pro-card"
      style={{ "--card-hover-color": config.color }}
    >
      <div className="pro-card__header">
        <div className="pro-card__identity">
          
          {/* Avatar avec la couleur du métier */}
          <div 
            className="pro-card__avatar"
            style={{
              backgroundColor: config.bgLight,
              color: config.color,
              borderColor: `${config.color}30`
            }}
          >
            {initials}
          </div>
          <div className="pro-card__info">
            <div className="pro-card__name-wrap">
              <h3 className="pro-card__name">{pro.name}</h3>
              <CheckCircle2 size={15} className="verified-badge" />
            </div>
            {/* Badge métier coloré */}
            <span 
              className="pro-card__badge"
              style={{
                backgroundColor: config.bgLight,
                color: config.color
              }}
            >
              {pro.badge && <span className="badge-emoji">{pro.badge}</span>} {pro.metier}
            </span>
          </div>
        </div>
        {pro.rating && (
          <div className="pro-card__rating">
            <Star size={13} fill="#F59E0B" color="#F59E0B" />
            <span>{pro.rating}</span>
            <small>({pro.reviewsCount || 0})</small>
          </div>
        )}
      </div>
      <div className="pro-card__meta">
        <span className="pro-card__location">
          <MapPin size={13} />
          {pro.ville}
        </span>
        {pro.startingPrice && (
          <span className="pro-card__price">
            Dès <strong>{pro.startingPrice}</strong>
          </span>
        )}
      </div>
      {pro.prestations && pro.prestations.length > 0 && (
        <ul className="pro-card__prestations">
          {pro.prestations.map((p, idx) => (
            <li key={idx}>
              <span className="presta-name">{p.name}</span>
              <span className="presta-price">{p.price}</span>
            </li>
          ))}
        </ul>
      )}
      {pro.nextSlot && (
        <div className="pro-card__slot">
          <span className="slot-dot"></span>
          <span className="slot-text">
            Prochain RDV : <strong>{pro.nextSlot}</strong>
          </span>
        </div>
      )}
      
      <div className="pro-card__actions">
        {pro.startingPrice === "Sur devis" ? (
          <Link to="/devis" className="btn-book">
            <FileText size={14} />
            <span>Demander un devis</span>
          </Link>
        ) : (
          <Link to={`/reservation?pro=${proId}`} className="btn-book">
            <Calendar size={14} />
            <span>Prendre RDV</span>
          </Link>
        )}
        
        {/* Remplacement de artisan.id par proId */}
        <Link to={`/artisan/${proId}`} className="btn-profile">
          Profil
        </Link>
      </div>
    </article>
  );
}