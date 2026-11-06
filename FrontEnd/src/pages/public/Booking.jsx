import { Navigate, useSearchParams, Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  ShieldCheck, 
  MapPin,
  CalendarCheck
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import BookingStepper from "../../components/booking/BookingStepper";
import ServiceSelector from "../../components/booking/ServiceSelector";
import DateTimePicker from "../../components/booking/DateTimePicker";
import BookingSummary from "../../components/booking/BookingSummary";
import { getMetierConfig } from "../../data/metiers";
import { V2_API_URL, rdvDemander } from "../../config/api";
import { formatDuree } from "../../utils/formatDuree";
import { formatTarif } from "../../utils/formatTarif";
import "./Booking.scss";

export default function Booking() {
  const { isClientConnected, clientUser, authCharge } = useAuth();
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
  
  // Les coordonnées affichées à l'étape 3 : celles du compte connecté, en
  // dérivation directe et non en état. Rien ne peut y être saisi puis perdu.
  const clientInfo = useMemo(
    () => ({
      nom: clientUser
        ? `${clientUser.prenom || ""} ${clientUser.nom || ""}`.trim() || clientUser.name || ""
        : "",
      email: clientUser?.email || "",
      telephone: clientUser?.telephone || ""
    }),
    [clientUser]
  );

  // `demande` = la réponse du serveur, donc ce qui est réellement enregistré
  // (numéro, bornes calculées par la base, montant sommé par elle). « envoyée » et
  // non « confirmée » : le rendez-vous naît en attente, la validation reste chez l'artisan.
  const [demande, setDemande] = useState(null);
  const [envoi, setEnvoi] = useState("inactif");
  const [erreur, setErreur] = useState("");

  // Validation par étape
  const canGoNext =
    (step === 1 && service) ||
    (step === 2 && date && heure);

  const handleEnvoyer = async () => {
    // Garde anti-double-clic : deux validations enverraient deux demandes distinctes,
    // la base n'ayant aucune clé naturelle pour les reconnaître.
    if (envoi === "encours" || !service) return;

    setEnvoi("encours");
    setErreur("");

    try {
      const resultat = await rdvDemander({
        id_artisan: artisan.id_artisan,
        date,
        heure,
        prestations: [service.id]
      });
      setDemande(resultat.rendez_vous);
    } catch (err) {
      setErreur(err.message);
      setEnvoi("inactif");
      return;
    }

    setEnvoi("termine");
  };

  // La session se lit chez le serveur, donc après un premier rendu `clientUser` est
  // null. Sans ce garde, rafraîchir la page sur /reservation renverrait vers
  // /connexion avant même que la réponse arrive — le piège est déjà bouché dans
  // ProLayout pour l'espace pro.
  if (!authCharge || loading) {
    return (
      <div className="booking-page">
        <div className="booking-container">
          <div className="booking-card">
            <h3 className="step-title">
              {loading ? "Chargement de l'artisan..." : "Vérification de votre session..."}
            </h3>
          </div>
        </div>
      </div>
    );
  }

  // Redirection vers la connexion si le client n'est pas identifié
  if (!isClientConnected) {
    return <Navigate to="/connexion" replace />;
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

  // "2027-03-04 09:00:00" (format de la base) -> "04/03/2027 09:00". Les secondes
  // ne sont pas un oubli : elles viennent de la colonne DATETIME et n'ont aucun
  // sens pour un client qui choisit un quart d'heure.
  const borne = (horodatage) => {
    const [jour, heures] = horodatage.split(" ");
    return `${jour.split("-").reverse().join("/")} ${heures.slice(0, 5)}`;
  };

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

        {/* DEMANDE ENREGISTRÉE — jamais « rendez-vous confirmé » */}
        {demande ? (
          <div className="booking-envoi-card">
            <div className="envoi-badge-icon">
              <CalendarCheck size={54} />
            </div>
            <h1>Votre demande est enregistrée.</h1>
            <p className="envoi-subtitle">
              Merci {clientInfo.nom}. <strong>{artisan.nom_etablissement}</strong>{" "}
              la voit déjà dans son agenda, en attente : c'est lui qui valide le
              créneau, InfinTime ne réserve rien à sa place.
            </p>
            <div className="recap-ticket">
              <div className="ticket-header">
                <span className="ticket-id">DEMANDE N° {demande.id_rdv}</span>
                <span className="ticket-status">À valider par l'artisan</span>
              </div>
              <div className="ticket-body">
                <div className="ticket-row">
                  <span className="row-label">Prestation :</span>
                  <span className="row-value">
                    {demande.prestations.map((p) => p.libelle).join(", ")}
                  </span>
                </div>
                <div className="ticket-row">
                  <span className="row-label">Créneau proposé :</span>
                  <span className="row-value highlight">
                    {borne(demande.date_heure_debut)} → {borne(demande.date_heure_fin)}
                  </span>
                </div>
                <div className="ticket-row">
                  <span className="row-label">Professionnel :</span>
                  <span className="row-value">
                    {demande.artisan.nom_etablissement} ({demande.artisan.ville})
                  </span>
                </div>
                <div className="ticket-row">
                  <span className="row-label">Montant indiqué :</span>
                  <span className="row-value price">{formatTarif(demande.montant_total)}</span>
                </div>
              </div>
            </div>
            <div className="envoi-actions">
              <Link to={`/artisan/${demande.artisan.id_artisan}`} className="btn-send-mail">
                Voir la fiche de l'artisan
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
                />
              </div>
            )}

            {/* Le refus du serveur est la seule source : il sait, lui, ce qui coince
                (chevauchement, prestation retirée, date passée) et le dit en une phrase. */}
            {erreur && (
              <div className="booking-erreur" role="alert">
                {erreur}
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
                  disabled={envoi === "encours"}
                  onClick={handleEnvoyer}
                >
                  <Send size={18} />
                  <span>
                    {envoi === "encours" ? "Envoi en cours…" : "Envoyer ma demande de rendez-vous"}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* DEUX FAITS VÉRIFIÉS côté serveur : la demande écrit bien une ligne, et
            c'est l'artisan qui la valide. Rien n'est promis au client. */}
        <div className="booking-trust">
          <div className="trust-item">
            <ShieldCheck size={16} />
            <span>Votre demande est enregistrée, l'artisan la voit dans son agenda</span>
          </div>
          <div className="trust-item">
            <CalendarCheck size={16} />
            <span>Le créneau n'est réservé qu'après validation par l'artisan</span>
          </div>
        </div>
      </div>
    </div>
  );
}