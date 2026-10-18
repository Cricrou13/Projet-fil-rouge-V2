import { Navigate, useSearchParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { 
  Calendar, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Star, 
  MapPin,
  Clock
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import BookingStepper from "../../components/booking/BookingStepper";
import ServiceSelector from "../../components/booking/ServiceSelector";
import DateTimePicker from "../../components/booking/DateTimePicker";
import BookingSummary from "../../components/booking/BookingSummary";
import { mockPros } from "../../data/mockPros";
import { mockServices } from "../../data/mockServices";
import { getMetierConfig } from "../../data/metiers";
import "./Booking.scss";

export default function Booking() {
  const { isClientConnected, clientUser } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Récupération de l'artisan (priorité à l'état passe via navigate, puis query param ?pro=X)
  const proFromState = location.state?.pro;
  const proId = Number(searchParams.get("pro")) || 1;

  const currentPro = useMemo(() => {
    if (proFromState) return proFromState;
    return mockPros.find((p) => p.id === proId) || mockPros[0];
  }, [proFromState, proId]);

  const metierConfig = getMetierConfig(currentPro.metier);

  // 2. Services adaptés à l'artisan
  const services = useMemo(() => {
    if (currentPro.prestations && currentPro.prestations.length > 0) {
      return currentPro.prestations.map((p, idx) => ({
        id: idx + 1,
        nom: p.name,
        duree: p.duration || "30 min",
        prix: parseInt(p.price) || 30
      }));
    }
    return mockServices;
  }, [currentPro]);

  // États du tunnel
  const [step, setStep] = useState(1);
  const [service, setService] = useState(null);
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");
  
  // Remplissage automatique avec les données réelles du client connecté
  const [clientInfo, setClientInfo] = useState({
    nom: clientUser ? `${clientUser.prenom || ''} ${clientUser.nom || ''}`.trim() : "",
    email: clientUser?.email || "",
    telephone: clientUser?.telephone || ""
  });

  // Mise à jour de clientInfo si le composant monte avant la récupération de clientUser
  useEffect(() => {
    if (clientUser) {
      setClientInfo({
        nom: `${clientUser.prenom || ''} ${clientUser.nom || ''}`.trim() || clientUser.name || "",
        email: clientUser.email || "",
        telephone: clientUser.telephone || ""
      });
    }
  }, [clientUser]);

  const [isConfirmed, setIsConfirmed] = useState(false);

  // Validation par étape
  const canGoNext =
    (step === 1 && service) ||
    (step === 2 && date && heure);

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  // Redirection vers la connexion si le client n'est pas identifié
  if (!isClientConnected) {
    return <Navigate to="/connexion" replace />;
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        {/* EN-TÊTE PRO SÉLECTIONNÉ */}
        <div className="booking-pro-header">
          <div 
            className="pro-avatar"
            style={{ 
              backgroundColor: metierConfig.bgLight, 
              color: metierConfig.color,
              borderColor: `${metierConfig.color}40`
            }}
          >
            {currentPro.initials || currentPro.name.charAt(0)}
          </div>
          <div className="pro-info">
            <div className="pro-title-line">
              <h2>{currentPro.name}</h2>
              <span 
                className="pro-tag"
                style={{ backgroundColor: metierConfig.bgLight, color: metierConfig.color }}
              >
                {currentPro.metier}
              </span>
            </div>
            <div className="pro-meta-line">
              <span><MapPin size={14} /> {currentPro.ville}</span>
              {currentPro.rating && (
                <span><Star size={14} fill="#F59E0B" color="#F59E0B" /> {currentPro.rating} ({currentPro.reviewsCount || 24} avis)</span>
              )}
            </div>
          </div>
        </div>

        {/* ÉCRAN DE SUCCÈS APRÈS CONFIRMATION */}
        {isConfirmed ? (
          <div className="booking-success-card">
            <div className="success-badge-icon">
              <CheckCircle2 size={54} />
            </div>
            <h1>Rendez-vous confirmé !</h1>
            <p className="success-subtitle">
              Votre réservation a bien été enregistrée et transmise à <strong>{currentPro.name}</strong>.
            </p>
            <div className="confirmation-ticket">
              <div className="ticket-header">
                <span className="ticket-id">RÉSERVATION #RDV-{Math.floor(1000 + Math.random() * 9000)}</span>
                <span className="ticket-status">✓ Confirmé</span>
              </div>
              <div className="ticket-body">
                <div className="ticket-row">
                  <span className="row-label">Prestation :</span>
                  <span className="row-value">{service?.nom}</span>
                </div>
                <div className="ticket-row">
                  <span className="row-label">Date & Heure :</span>
                  <span className="row-value highlight">{date} à {heure}</span>
                </div>
                <div className="ticket-row">
                  <span className="row-label">Professionnel :</span>
                  <span className="row-value">{currentPro.name} ({currentPro.ville})</span>
                </div>
                <div className="ticket-row">
                  <span className="row-label">Tarif indicatif :</span>
                  <span className="row-value price">{service?.prix} € TTC</span>
                </div>
              </div>
            </div>
            <div className="success-actions">
              <Link to="/mes-rendez-vous" className="btn-go-appointments">
                Voir dans Mes rendez-vous
              </Link>
              <Link to="/" className="btn-back-home">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        ) : (
          /* FORMULAIRE MULTI-ÉTAPES */
          <div className="booking-card">
            
            <BookingStepper currentStep={step} />

            {/* ÉTAPE 1 : CHOIX DU SERVICE */}
            {step === 1 && (
              <div className="step-content">
                <h3 className="step-title">1. Choisissez votre prestation</h3>
                <ServiceSelector 
                  services={services} 
                  selected={service} 
                  onSelect={setService} 
                />
              </div>
            )}

            {/* ÉTAPE 2 : DATE & HEURE */}
            {step === 2 && (
              <div className="step-content">
                <h3 className="step-title">2. Sélectionnez une date et un horaire</h3>
                <DateTimePicker 
                  date={date} 
                  setDate={setDate} 
                  heure={heure} 
                  setHeure={setHeure} 
                />
              </div>
            )}

            {/* ÉTAPE 3 : RÉCAPITULATIF */}
            {step === 3 && (
              <div className="step-content">
                <h3 className="step-title">3. Récapitulatif et coordonnées</h3>
                <BookingSummary 
                  service={service} 
                  date={date} 
                  heure={heure} 
                  pro={currentPro}
                  clientInfo={clientInfo}
                  setClientInfo={setClientInfo}
                />
              </div>
            )}

            {/* BOUTONS DE NAVIGATION DU TUNNEL */}
            <div className="booking-actions">
              {step > 1 ? (
                <button 
                  type="button" 
                  className="btn-prev" 
                  onClick={() => setStep(step - 1)}
                >
                  <ArrowLeft size={16} />
                  <span>Précédent</span>
                </button>
              ) : (
                <div></div>
              )}
              {step < 3 ? (
                <button 
                  type="button"
                  className="btn-next" 
                  disabled={!canGoNext} 
                  onClick={() => setStep(step + 1)}
                >
                  <span>Étape suivante</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  type="button"
                  className="btn-confirm" 
                  onClick={handleConfirm}
                >
                  <CheckCircle2 size={18} />
                  <span>Confirmer mon rendez-vous</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* RÉASSURANCE */}
        <div className="booking-trust">
          <div className="trust-item">
            <ShieldCheck size={16} />
            <span>Annulation gratuite jusqu'à 2h avant</span>
          </div>
          <div className="trust-item">
            <Clock size={16} />
            <span>Rappel automatique par SMS & Email</span>
          </div>
        </div>
      </div>
    </div>
  );
}