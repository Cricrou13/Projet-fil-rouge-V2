import { Navigate, useSearchParams, Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  MailOpen, 
  ShieldCheck, 
  MapPin
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import BookingStepper from "../../components/booking/BookingStepper";
import ServiceSelector from "../../components/booking/ServiceSelector";
import DateTimePicker from "../../components/booking/DateTimePicker";
import BookingSummary from "../../components/booking/BookingSummary";
import { getMetierConfig } from "../../data/metiers";
import { V2_API_URL } from "../../config/api";
import { formatDuree } from "../../utils/formatDuree";
import "./Booking.scss";

// Adresse publiée dans les mentions légales (LegalNotice.jsx:52).
const EMAIL_CONTACT = "contact@inftime.fr";

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
    fetch(`${V2_API_URL}?route=artisan&id=${encodeURIComponent(proId)}`)
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

  // « prête » et non « confirmée » : aucune route d'écriture n'enregistre un
  // rendez-vous, donc cette étape rédige la demande, elle ne la réserve pas.
  const [demandePrete, setDemandePrete] = useState(false);

  // Validation par étape
  const canGoNext =
    (step === 1 && service) ||
    (step === 2 && date && heure);

  const handlePrepare = () => {
    setDemandePrete(true);
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

  // Le corps est construit ligne par ligne : un champ client vide (téléphone
  // facultatif dans `utilisateurs`) ne doit pas laisser de ligne orpheline.
  const lignesDemande = [
    "Nouvelle demande de rendez-vous",
    "",
    `Professionnel : ${artisan.nom_etablissement} (${artisan.ville})`,
    `Prestation : ${service?.nom ?? "à préciser"}`,
    date && heure ? `Créneau souhaité : ${date} à ${heure}` : null,
    service?.prix != null ? `Tarif indicatif : ${service.prix} € TTC` : null,
    "",
    `Client : ${clientInfo.nom || "nom non renseigné"} (${clientInfo.email})`,
    clientInfo.telephone ? `Téléphone : ${clientInfo.telephone}` : null,
    "",
    "Rédigé depuis le tunnel de réservation InfinTime. Ce message n'a pas encore été envoyé.",
  ].filter((ligne) => ligne !== null);

  const hrefEnvoi =
    `mailto:${EMAIL_CONTACT}` +
    `?subject=${encodeURIComponent(
      `Demande de rendez-vous — ${artisan.nom_etablissement}`,
    )}` +
    `&body=${encodeURIComponent(lignesDemande.join("\n"))}`;

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

        {/* DEMANDE RÉDIGÉE — jamais « rendez-vous réservé » */}
        {demandePrete ? (
          <div className="booking-envoi-card">
            <div className="envoi-badge-icon">
              <MailOpen size={54} />
            </div>
            <h1>Votre demande est prête : il reste à l'envoyer.</h1>
            <p className="envoi-subtitle">
              Merci {clientInfo.nom || "à vous"}. Rien n'a été réservé ni
              transmis à <strong>{artisan.nom_etablissement}</strong> : InfinTime
              n'a pas de serveur qui enregistre les rendez-vous. Le bouton
              ci-dessous ouvre votre messagerie avec la demande déjà rédigée pour{" "}
              <strong>{EMAIL_CONTACT}</strong>.
            </p>
            <div className="recap-ticket">
              <div className="ticket-header">
                <span className="ticket-id">BROUILLON — AUCUN NUMÉRO ATTRIBUÉ</span>
                <span className="ticket-status">À envoyer</span>
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
            <div className="envoi-actions">
              <a className="btn-send-mail" href={hrefEnvoi}>
                Ouvrir ma messagerie
              </a>
              <button
                type="button"
                className="btn-back-home"
                onClick={() => setDemandePrete(false)}
              >
                Modifier ma demande
              </button>
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
                  onClick={handlePrepare}
                >
                  <MailOpen size={18} />
                  <span>Préparer ma demande de rendez-vous</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* DEUX FAITS VÉRIFIABLES, pas des promesses de service :
            aucune écriture en base, et le `mailto:` part vers la plateforme. */}
        <div className="booking-trust">
          <div className="trust-item">
            <ShieldCheck size={16} />
            <span>Aucune réservation n'est enregistrée sur InfinTime</span>
          </div>
          <div className="trust-item">
            <MailOpen size={16} />
            <span>Votre demande part vers {EMAIL_CONTACT}, pas vers l'artisan</span>
          </div>
        </div>
      </div>
    </div>
  );
}