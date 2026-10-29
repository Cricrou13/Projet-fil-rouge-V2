import { Navigate, useSearchParams, Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin,
  Clock
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import BookingStepper from "../../components/booking/BookingStepper";
import ServiceSelector from "../../components/booking/ServiceSelector";
import DateTimePicker from "../../components/booking/DateTimePicker";
import BookingSummary from "../../components/booking/BookingSummary";
import { getMetierConfig } from "../../data/metiers";
import { formatDuree } from "../../utils/formatDuree";
import "./Booking.scss";

export default function Booking() {
  const { isClientConnected, clientUser } = useAuth();
  const [searchParams] = useSearchParams();

  // 1. L'artisan vient de la base : ?pro= est un id_artisan, plus un index de mockPros.
  const proId = Number(searchParams.get("pro")) || null;
  const serviceId = Number(searchParams.get("service")) || null;

  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (proId === null) {
      setLoading(false);
      return;
    }
    fetch(
      `http://projet-fil-rouge-v2.test/index.php?route=artisan&id=${encodeURIComponent(proId)}`
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
        console.warn("⚠️ Artisan du tunnel inaccessible :", err.message);
        setArtisan(null);
        setLoading(false);
      });
  }, [proId]);

  // 2. Prestations reelles de l'artisan, au format attendu par le tunnel.
  const services = useMemo(
    () =>
      (artisan?.prestations ?? []).map((prestation) => ({
        id: prestation.id_prestation,
        nom: prestation.libelle,
        duree: formatDuree(prestation.duree_estimee),
        prix: Number(prestation.tarif)
      })),
    [artisan]
  );

  // États du tunnel
  const [step, setStep] = useState(1);
  const [service, setService] = useState(null);
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");

  // ?service= (lien "Choisir" de la fiche profil) préselectionne la prestation.
  useEffect(() => {
    const preset = services.find((s) => s.id === serviceId);
    if (preset) setService(preset);
  }, [services, serviceId]);
  
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

  if (loading) {
    return (
      <div className="booking-page">
        <div className="booking-container">
          <div className="booking-card">
            <h3 className="step-title">Chargement de l'artisan...</h3>
          </div>
        </div>
      </div>
    );
  }

  // Sans ?pro= valide ou sans réponse de la base, on n'invente aucun artisan.
  if (!artisan || !artisan.nom_etablissement) {
    return (
      <div className="booking-page">
        <div className="booking-container">
          <div className="booking-card">
            <h3 className="step-title">Artisan introuvable</h3>
            <p>Choisissez un professionnel pour démarrer une réservation.</p>
            <Link to="/recherche">Retour à la recherche</Link>
          </div>
        </div>
      </div>
    );
  }

  const metierConfig = getMetierConfig(artisan.metier);

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
            {artisan.nom_etablissement.charAt(0)}
          </div>
          <div className="pro-info">
            <div className="pro-title-line">
              <h2>{artisan.nom_etablissement}</h2>
              <span 
                className="pro-tag"
                style={{ backgroundColor: metierConfig.bgLight, color: metierConfig.color }}
              >
                {metierConfig.label}
              </span>
            </div>
            <div className="pro-meta-line">
              <span><MapPin size={14} /> {artisan.ville}</span>
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
              Votre réservation a bien été enregistrée et transmise à <strong>{artisan.nom_etablissement}</strong>.
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
                  <span className="row-value">{artisan.nom_etablissement} ({artisan.ville})</span>
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
                {services.length > 0 ? (
                  <ServiceSelector 
                    services={services} 
                    selected={service} 
                    onSelect={setService} 
                  />
                ) : (
                  <p>
                    Cet artisan n'a publié aucune prestation.{" "}
                    <Link to={`/artisan/${artisan.id_artisan}`}>Voir sa fiche</Link>
                  </p>
                )}
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
                  pro={artisan}
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