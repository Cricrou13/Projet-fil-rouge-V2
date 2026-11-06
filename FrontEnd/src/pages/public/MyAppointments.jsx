import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  RotateCcw, 
  X, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  ChevronRight
} from "lucide-react";
import { getMetierConfig } from "../../data/metiers";
import "./MyAppointments.scss";
// Données fictives réalistes pour la démonstration
const initialAppointments = [
  {
    id: 1,
    artisan: "Marc Avaro",
    metier: "Coiffure & Barbier",
    prestation: "Coupe classique homme + Barbe",
    date: "Jeudi 18 Septembre 2026",
    heure: "14h30",
    duree: "45 min",
    prix: "35 €",
    adresse: "12 Rue des Artisans, 31000 Toulouse",
    telephone: "06 78 90 12 34",
    statut: "confirme", // "confirme" | "en_attente" | "annule" | "passe"
    isPast: false,
  },
  {
    id: 2,
    artisan: "Thomas Edouard",
    metier: "Électricité générale",
    prestation: "Diagnostic tableau électrique & remise aux normes",
    date: "Lundi 22 Septembre 2026",
    heure: "09h00",
    duree: "1h30",
    prix: "90 €",
    adresse: "Intervention à domicile",
    telephone: "06 12 34 56 78",
    statut: "en_attente",
    isPast: false,
  },
  {
    id: 3,
    artisan: "Bernard Jacquot",
    metier: "Terrassement & BTP",
    prestation: "Visite technique & métrage piscine",
    date: "Mardi 2 Septembre 2026",
    heure: "11h00",
    duree: "1h00",
    prix: "Sur devis",
    adresse: "Intervention à domicile",
    telephone: "06 45 67 89 01",
    statut: "passe",
    isPast: true,
    rating: 5,
    avis: "Artisan ponctuel, excellent contact et devis reçu très rapidement.",
  },
  {
    id: 4,
    artisan: "Sophie Laurent",
    metier: "Coiffure & Barbier",
    prestation: "Brushing & Soin éclat profond",
    date: "Vendredi 15 Août 2026",
    heure: "16h00",
    duree: "35 min",
    prix: "28 €",
    adresse: "8 Allée des Fleurs, 31000 Toulouse",
    telephone: "06 33 22 11 00",
    statut: "passe",
    isPast: true,
    rating: null, // Pas encore d'avis
    avis: null,
  }
];
export default function MyAppointments() {
  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" | "past"
  const [appointments, setAppointments] = useState(initialAppointments);
  const [notification, setNotification] = useState(null);
  // Annuler un rendez-vous
  const handleCancel = (id, artisan) => {
    if (window.confirm(`Confirmez-vous l'annulation du rendez-vous avec ${artisan} ?`)) {
      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? { ...app, statut: "annule" } : app))
      );
      setNotification(`Le rendez-vous avec ${artisan} a été annulé.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };
  // Filtrer selon l'onglet actif
  const displayedAppointments = appointments.filter((app) =>
    activeTab === "upcoming" ? !app.isPast : app.isPast
  );
  const upcomingCount = appointments.filter((app) => !app.isPast && app.statut !== "annule").length;
  const pastCount = appointments.filter((app) => app.isPast).length;
  return (
    <div className="my-appointments-page">
      <div className="appointments-container">
        {/* EN-TÊTE DE LA PAGE */}
        <div className="appointments-header">
          <div className="header-text">
            <h1>Mes rendez-vous</h1>
            <p>Consultez, gérez ou reprenez vos rendez-vous avec vos artisans partenaires.</p>
          </div>
          <Link to="/recherche" className="btn-new-rdv">
            <Search size={18} />
            <span>Prendre un nouveau RDV</span>
          </Link>
        </div>
        {/* NOTIFICATION D'ACTION */}
        {notification && (
          <div className="action-notification">
            <AlertCircle size={18} />
            <span>{notification}</span>
          </div>
        )}
        {/* BARRE D'ONGLETS */}
        <div className="appointments-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            <Calendar size={18} />
            <span>À venir</span>
            <span className="count-badge">{upcomingCount}</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "past" ? "active" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            <RotateCcw size={18} />
            <span>Historique & Passés</span>
            <span className="count-badge">{pastCount}</span>
          </button>
        </div>
        {/* LISTE DES RENDEZ-VOUS */}
        <div className="appointments-list">
          {displayedAppointments.length === 0 ? (
            /* ÉTAT VIDE */
            <div className="empty-appointments">
              <div className="empty-icon">
                <Calendar size={48} />
              </div>
              <h3>Aucun rendez-vous {activeTab === "upcoming" ? "à venir" : "dans l'historique"}</h3>
              <p>Besoin d'un artisan qualifié pour vos travaux ou votre quotidien ?</p>
              <Link to="/recherche" className="btn-browse-pros">
                Rechercher un professionnel
              </Link>
            </div>
          ) : (
            displayedAppointments.map((app) => {
              const config = getMetierConfig(app.metier);
              return (
                <div 
                  key={app.id} 
                  className={`appointment-card ${app.statut === "annule" ? "is-cancelled" : ""}`}
                >
                  
                  {/* COLONNE GAUCHE : DATE & HEURE */}
                  <div className="card-date-badge">
                    <span className="date-day">{app.date.split(" ")[1]}</span>
                    <span className="date-month">{app.date.split(" ")[2]}</span>
                    <span className="date-time">{app.heure}</span>
                  </div>
                  {/* COLONNE CENTRALE : DÉTAILS DE LA PRESTATION */}
                  <div className="card-main-info">
                    
                    {/* EN-TÊTE PRO */}
                    <div className="pro-heading">
                      <div className="pro-avatar" style={{ backgroundColor: config.color }}>
                        {app.artisan.charAt(0)}
                      </div>
                      <div className="pro-details">
                        <h4>{app.artisan}</h4>
                        <span 
                          className="metier-tag" 
                          style={{ color: config.color, backgroundColor: config.bgLight }}
                        >
                          {app.metier}
                        </span>
                      </div>
                    </div>
                    {/* DÉTAIL DU SERVICE */}
                    <div className="service-details">
                      <h3 className="prestation-name">{app.prestation}</h3>
                      <div className="service-meta">
                        <span className="meta-item">
                          <Clock size={15} /> {app.duree}
                        </span>
                        <span className="meta-item price-item">
                          Tarif : <strong>{app.prix}</strong>
                        </span>
                        <span className="meta-item address-item">
                          <MapPin size={15} /> {app.adresse}
                        </span>
                      </div>
                    </div>
                    {/* AVIS SI DÉJÀ LAISSÉ */}
                    {app.isPast && app.rating && (
                      <div className="client-review-box">
                        <div className="stars">
                          {[...Array(app.rating)].map((_, i) => (
                            <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                          ))}
                        </div>
                        <p>« {app.avis} »</p>
                      </div>
                    )}
                  </div>
                  {/* COLONNE DROITE : STATUT & ACTIONS */}
                  <div className="card-actions-col">
                    
                    {/* BADGES DE STATUT */}
                    {app.statut === "confirme" && (
                      <span className="status-badge status--confirmed">
                        <CheckCircle2 size={15} /> Confirmé
                      </span>
                    )}
                    {app.statut === "en_attente" && (
                      <span className="status-badge status--pending">
                        <Clock size={15} /> En attente de l'artisan
                      </span>
                    )}
                    {app.statut === "annule" && (
                      <span className="status-badge status--cancelled">
                        <X size={15} /> Annulé
                      </span>
                    )}
                    {app.statut === "passe" && (
                      <span className="status-badge status--past">
                        Effectué
                      </span>
                    )}
                    {/* BOUTONS D'ACTION */}
                    <div className="action-buttons-group">
                      
                      {/* ACTIONS POUR RDV À VENIR */}
                      {!app.isPast && app.statut !== "annule" && (
                        <>
                          <a href={`tel:${app.telephone.replace(/\s+/g, '')}`} className="btn-contact-pro" title="Appeler l'artisan">
                            <Phone size={15} />
                            <span>{app.telephone}</span>
                          </a>
                          <button
                            type="button"
                            className="btn-cancel-rdv"
                            onClick={() => handleCancel(app.id, app.artisan)}
                          >
                            <X size={15} />
                            <span>Annuler</span>
                          </button>
                        </>
                      )}
                      {/* ACTIONS POUR HISTORIQUE */}
                      {app.isPast && (
                        <>
                          <Link to="/reservation" className="btn-rebook">
                            <RotateCcw size={15} />
                            <span>Reprendre RDV</span>
                          </Link>
                          {!app.rating && (
                            <button
                              type="button"
                              className="btn-leave-review"
                              onClick={() => alert("Formulaire d'évaluation ouvert (démo soutenance).")}
                            >
                              <Star size={15} />
                              <span>Donner mon avis</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}