import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import StatCard from "../../components/pro/StatCard";
import { useAuth } from "../../context/AuthContext";
import { getAgendaPro } from "../../config/api";
import { formatTarif } from "../../utils/formatTarif";
import { plageHoraires } from "../../utils/dateSemaine";
import { cleStatut, libelleStatut } from "../../data/statuts";
import "./DashBoard.scss";

// `rendez_vous` ne porte ni prestation ni tarif, et aucune table ne stocke de note
// client ni de mémo : les trois blocs qui affichaient ces données passent en
// « indisponible » au lieu de reprendre les valeurs du mock.
const ECRITURE_INDISPONIBLE =
  "Aucune route d'écriture n'existe encore : rien ne sera modifié en base.";

const ETATS = {
  chargement: {
    classe: "",
    titre: "Chargement du planning…",
  },
  "aucun-compte": {
    classe: "is-error",
    titre: "Aucun compte pro identifié. Reconnecte-toi pour charger ton planning.",
  },
  "sans-fiche": {
    classe: "is-error",
    titre:
      "Ce compte n'a pas de fiche artisan en base : l'agenda reste vide.",
  },
  erreur: {
    classe: "is-error",
    titre: "Planning inaccessible : le serveur n'a pas répondu.",
  },
  ok: {
    classe: "",
    titre:
      "Planning lu en base (tables rendez_vous et devis). Les actions d'écriture ne sont pas encore branchées.",
  },
};

export default function Dashboard() {
  // L'espace pro s'identifie par Id_utilisateur : la seule clé que la réponse de
  // connexion.php laisse au front.
  const { proUser } = useAuth();
  const idUtilisateur = proUser?.Id_utilisateur ?? null;

  const [agenda, setAgenda] = useState(null);
  const [etat, setEtat] = useState("chargement");
  // Les mémos ne vivent que dans cet état : aucune table de notes n'existe.
  const [memos, setMemos] = useState([]);
  const [nouveauMemo, setNouveauMemo] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (idUtilisateur === null) {
      setEtat("aucun-compte");
      return;
    }

    getAgendaPro(idUtilisateur)
      .then((data) => {
        setAgenda(data);
        setEtat("ok");
      })
      .catch((err) => {
        console.warn("⚠️ Planning pro inaccessible :", err.message);
        setAgenda(null);
        setEtat(err.message === "404" ? "sans-fiche" : "erreur");
      });
  }, [idUtilisateur]);

  // « aujourd'hui » vient de la base, pas de l'horloge du navigateur : sinon le
  // fuseau du poste peut décaler la liste d'un jour. Comparer `jour` en chaînes
  // 'AAAA-MM-JJ' est suffisant : l'ordre lexicographique suit l'ordre calendaire.
  const { rdvDuJour, rdvAVenir } = useMemo(() => {
    const tous = agenda?.rendez_vous ?? [];
    const aujourdhui = agenda?.aujourdhui;
    return {
      rdvDuJour: tous.filter((rdv) => rdv.jour === aujourdhui),
      rdvAVenir: tous.filter((rdv) => rdv.jour > aujourdhui),
    };
  }, [agenda]);

  const devis = agenda?.devis ?? [];

  const libelleJour = useMemo(() => {
    if (!agenda?.aujourdhui) return "";
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    }).format(new Date(`${agenda.aujourdhui}T00:00:00Z`));
  }, [agenda]);

  const triggerNotif = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!nouveauMemo.trim()) return;
    setMemos((prev) => [...prev, nouveauMemo.trim()]);
    setNouveauMemo("");
    triggerNotif("Mémo ajouté pour cette page uniquement.");
  };

  const handleDeleteNote = (index) => {
    setMemos((prev) => prev.filter((_, i) => i !== index));
  };

  const bandeau = ETATS[etat];

  return (
    <div className="dashboard-modern">
      {notification && (
        <div className="dashboard-toast">
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      <div className={`etat-carte ${bandeau.classe}`}>
        {etat === "erreur" || etat === "sans-fiche" || etat === "aucun-compte" ? (
          <AlertCircle size={16} />
        ) : (
          <Calendar size={16} />
        )}
        <span>{bandeau.titre}</span>
      </div>

      {/* 1. GRILLE DE STATISTIQUES */}
      <div className="stats-grid">
        <StatCard
          title="Interventions du jour"
          value={`${rdvDuJour.length} RDV`}
          subtitle={libelleJour || "date du jour non chargée"}
          type={rdvDuJour.length > 0 ? "positive" : "neutral"}
        />
        <StatCard
          title="Prochains rendez-vous"
          value={`${rdvAVenir.length} RDV`}
          subtitle="Sur la semaine courante"
          type="neutral"
        />
        <StatCard
          title="Devis reçus"
          value={`${devis.length} devis`}
          subtitle="Aucun statut normalisé en base"
          type={devis.length > 0 ? "warning" : "info"}
        />
        <StatCard
          title="Chiffre d'affaires"
          value="—"
          subtitle="Aucun tarif stocké sur un rendez-vous"
          type="neutral"
        />
      </div>

      {/* 2. DISPOSITION EN 2 COLONNES */}
      <div className="dashboard-main-grid">
        <div className="dashboard-left-col">
          {/* PLANNING DU JOUR */}
          <section className="dash-card">
            <div className="dash-card__header">
              <div className="title-wrap">
                <Calendar size={20} className="icon-blue" />
                <h3>Planning du jour</h3>
              </div>
              <Link to="/pro/planning" className="link-view-all">
                <span>Voir la semaine</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="appointment-list-modern">
              {rdvDuJour.length === 0 ? (
                <p className="empty-quotes">
                  Aucun rendez-vous enregistré pour aujourd'hui.
                </p>
              ) : (
                rdvDuJour.map((rdv) => (
                  <div
                    key={rdv.id_rdv}
                    className={`appointment-row ${cleStatut(rdv.statut) === "termine" ? "is-finished" : ""}`}
                  >
                    <div className="row-time">
                      <Clock size={15} />
                      <span>{plageHoraires(rdv.date_heure_debut, rdv.date_heure_fin)}</span>
                    </div>
                    <div className="row-info">
                      <div className="client-line">
                        <strong>{rdv.nom_client}</strong>
                        <span className="statut-badge" title={rdv.statut}>
                          {libelleStatut(rdv.statut)}
                        </span>
                      </div>
                      <span className="service-name">
                        {rdv.remarque || "Aucune remarque renseignée."}
                      </span>
                    </div>
                    <div className="row-price" title="Aucun tarif n'est stocké sur un rendez-vous">
                      —
                    </div>
                    <div className="row-actions">
                      <span
                        className="btn-call is-disabled"
                        title={`Téléphone client non publié : la route V2 n'a pas d'authentification. ${ECRITURE_INDISPONIBLE}`}
                      >
                        <Phone size={14} />
                      </span>
                      {cleStatut(rdv.statut) === "en_attente" && (
                        <button type="button" className="btn-action-validate" disabled title={ECRITURE_INDISPONIBLE}>
                          Valider
                        </button>
                      )}
                      {cleStatut(rdv.statut) === "confirme" && (
                        <button type="button" className="btn-action-finish" disabled title={ECRITURE_INDISPONIBLE}>
                          Terminer
                        </button>
                      )}
                      {cleStatut(rdv.statut) === "termine" && (
                        <span className="badge-done">
                          <Check size={14} /> Terminé
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* DEMANDES DE DEVIS */}
          <section className="dash-card">
            <div className="dash-card__header">
              <div className="title-wrap">
                <FileText size={20} className="icon-orange" />
                <h3>Devis reçus ({devis.length})</h3>
              </div>
            </div>
            {devis.length === 0 ? (
              <p className="empty-quotes">
                Aucune demande de devis en base pour cet artisan.
              </p>
            ) : (
              <div className="quotes-list-modern">
                {devis.map((quote) => (
                  <div key={quote.id_devis} className="quote-item">
                    <div className="quote-details">
                      <div className="quote-top">
                        <strong>{quote.nom_client}</strong>
                        <span className="quote-date">{quote.date_demande}</span>
                        <span className="statut-badge" title={quote.statut}>
                          {libelleStatut(quote.statut)}
                        </span>
                      </div>
                      <p className="quote-text">{quote.description_demande}</p>
                      <span className="quote-budget">
                        Montant proposé : <strong>{formatTarif(quote.montant_propose)}</strong>
                      </span>
                    </div>
                    <div className="quote-actions">
                      {cleStatut(quote.statut) === "en_attente" ? (
                        <>
                          <button type="button" className="btn-accept" disabled title={ECRITURE_INDISPONIBLE}>
                            Accepter
                          </button>
                          <button type="button" className="btn-decline" disabled title={ECRITURE_INDISPONIBLE}>
                            Décliner
                          </button>
                        </>
                      ) : (
                        <span className="quote-traite">Aucune action sur ce statut</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* COLONNE LATÉRALE */}
        <div className="dashboard-right-col">
          <section className="dash-card">
            <div className="dash-card__header">
              <h3>Mémos &amp; Pense-bête</h3>
            </div>
            <form onSubmit={handleAddNote} className="note-form">
              <input
                type="text"
                placeholder="Ajouter un mémo rapide..."
                value={nouveauMemo}
                onChange={(e) => setNouveauMemo(e.target.value)}
              />
              <button type="submit" className="btn-add-note">
                <Plus size={16} />
              </button>
            </form>
            <p className="mention">
              Aucune table de notes en base : ces mémos restent dans l'onglet et
              disparaissent au rechargement.
            </p>
            <ul className="notes-list">
              {memos.map((note, idx) => (
                <li key={idx} className="note-item">
                  <span>{note}</span>
                  <button
                    type="button"
                    className="btn-del-note"
                    onClick={() => handleDeleteNote(idx)}
                    title="Supprimer le mémo de cette page"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="dash-card shortcuts-card">
            <div className="dash-card__header">
              <h3>Accès rapides</h3>
            </div>
            <div className="shortcuts-links">
              <Link to="/pro/planning" className="shortcut-item">
                <Calendar size={18} />
                <span>Ouvrir l'Agenda complet</span>
                <ChevronRight size={16} className="arrow" />
              </Link>
              <Link to="/pro/prestations" className="shortcut-item">
                <FileText size={18} />
                <span>Modifier mes tarifs &amp; prestations</span>
                <ChevronRight size={16} className="arrow" />
              </Link>
              <Link to="/" target="_blank" className="shortcut-item">
                <ArrowUpRight size={18} />
                <span>Aperçu de mon profil public</span>
                <ChevronRight size={16} className="arrow" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
