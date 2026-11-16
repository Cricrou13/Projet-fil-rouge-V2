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
  X,
} from "lucide-react";
import StatCard from "../../components/pro/StatCard";
import { getAgendaPro, proRdvStatut } from "../../config/api";
import { formatTarif } from "../../utils/formatTarif";
import { plageHoraires } from "../../utils/dateSemaine";
import { cleStatut, libelleStatut } from "../../data/statuts";
import "./DashBoard.scss";

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
      "Planning lu en base. Vous pouvez désormais valider ou modifier le statut de vos rendez-vous.",
  },
};

const formatDateCourt = (dateStr) => {
  if (!dateStr) return "";
  const [jour] = dateStr.split(" ");
  const [annee, mois, j] = jour.split("-");
  return `${j}/${mois}/${annee}`;
};

export default function Dashboard() {
  const [agenda, setAgenda] = useState(null);
  const [etat, setEtat] = useState("chargement");
  const [memos, setMemos] = useState([]);
  const [nouveauMemo, setNouveauMemo] = useState("");
  const [notification, setNotification] = useState(null);
  const [ongletRdv, setOngletRdv] = useState("a_venir");
  const [actionEnCours, setActionEnCours] = useState(false);

  const chargerAgenda = () => {
    return getAgendaPro()
      .then((data) => {
        setAgenda(data);
        setEtat("ok");
      })
      .catch((err) => {
        console.warn("⚠️ Planning pro inaccessible :", err.message);
        setAgenda(null);
        if (err.message === "404") setEtat("sans-fiche");
        else if (err.message === "401") setEtat("aucun-compte");
        else setEtat("erreur");
      });
  };

  useEffect(() => {
    chargerAgenda();
  }, []);

  const triggerNotif = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleChangerStatut = async (idRdv, nouveauStatut) => {
    setActionEnCours(true);
    try {
      await proRdvStatut(idRdv, nouveauStatut);
      triggerNotif(`Rendez-vous mis à jour (${libelleStatut(nouveauStatut) || nouveauStatut}).`);
      await chargerAgenda();
    } catch (err) {
      triggerNotif(err.message || "Erreur lors de la mise à jour du rendez-vous.");
    } finally {
      setActionEnCours(false);
    }
  };

  const tousRdv = useMemo(() => {
    // Si a_venir est renvoyé par l'API, on l'utilise pour avoir tous les RDV futurs
    return agenda?.a_venir ?? agenda?.rendez_vous ?? [];
  }, [agenda]);

  const aujourdhui = agenda?.aujourdhui;

  const { rdvDuJour, rdvFuturs, rdvEnAttente, rdvAnnules } = useMemo(() => {
    const duJour = [];
    const futurs = [];
    const enAttente = [];
    const annules = [];

    tousRdv.forEach((rdv) => {
      const isAnnule = rdv.statut === "annule" || rdv.statut === "refuse";
      if (isAnnule) {
        annules.push(rdv);
      } else {
        if (rdv.statut === "en_attente") {
          enAttente.push(rdv);
        }
        if (rdv.jour === aujourdhui) {
          duJour.push(rdv);
        } else if (rdv.jour > aujourdhui) {
          futurs.push(rdv);
        }
      }
    });

    return {
      rdvDuJour: duJour,
      rdvFuturs: futurs,
      rdvEnAttente: enAttente,
      rdvAnnules: annules,
    };
  }, [tousRdv, aujourdhui]);

  const rdvAffiches = useMemo(() => {
    if (ongletRdv === "du_jour") return rdvDuJour;
    if (ongletRdv === "en_attente") return rdvEnAttente;
    if (ongletRdv === "annules") return rdvAnnules;
    return rdvFuturs;
  }, [ongletRdv, rdvDuJour, rdvFuturs, rdvEnAttente, rdvAnnules]);

  const chiffreAffaires = useMemo(() => {
    let total = 0;
    tousRdv.forEach((rdv) => {
      if (rdv.statut === "confirme" || rdv.statut === "termine") {
        total += Number(rdv.montant_total || 0);
      }
    });
    return total > 0 ? formatTarif(total) : "—";
  }, [tousRdv]);

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
          value={`${rdvFuturs.length} RDV`}
          subtitle="À venir (toutes semaines)"
          type="neutral"
        />
        <StatCard
          title="Demandes en attente"
          value={`${rdvEnAttente.length} RDV`}
          subtitle="À valider par vous"
          type={rdvEnAttente.length > 0 ? "warning" : "info"}
        />
        <StatCard
          title="CA Confirmé"
          value={chiffreAffaires}
          subtitle="Rendez-vous confirmés/effectués"
          type="positive"
        />
      </div>

      {/* 2. DISPOSITION EN 2 COLONNES */}
      <div className="dashboard-main-grid">
        <div className="dashboard-left-col">
          {/* GESTION DES RENDEZ-VOUS */}
          <section className="dash-card">
            <div className="dash-card__header">
              <div className="title-wrap">
                <Calendar size={20} className="icon-blue" />
                <h3>Rendez-vous clients</h3>
              </div>
              <Link to="/pro/planning" className="link-view-all">
                <span>Voir le planning complet</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* ONGLETS DES RENDEZ-VOUS */}
            <div className="dash-tabs">
              <button
                type="button"
                className={`dash-tab-btn ${ongletRdv === "du_jour" ? "active" : ""}`}
                onClick={() => setOngletRdv("du_jour")}
              >
                <span>Aujourd'hui</span>
                <span className="count-pill">{rdvDuJour.length}</span>
              </button>
              <button
                type="button"
                className={`dash-tab-btn ${ongletRdv === "a_venir" ? "active" : ""}`}
                onClick={() => setOngletRdv("a_venir")}
              >
                <span>À venir</span>
                <span className="count-pill">{rdvFuturs.length}</span>
              </button>
              <button
                type="button"
                className={`dash-tab-btn ${ongletRdv === "en_attente" ? "active" : ""}`}
                onClick={() => setOngletRdv("en_attente")}
              >
                <span>En attente</span>
                <span className="count-pill">{rdvEnAttente.length}</span>
              </button>
              <button
                type="button"
                className={`dash-tab-btn ${ongletRdv === "annules" ? "active" : ""}`}
                onClick={() => setOngletRdv("annules")}
              >
                <span>Annulés</span>
                <span className="count-pill">{rdvAnnules.length}</span>
              </button>
            </div>

            <div className="appointment-list-modern">
              {rdvAffiches.length === 0 ? (
                <p className="empty-quotes">
                  {ongletRdv === "du_jour" && "Aucun rendez-vous prévu pour aujourd'hui."}
                  {ongletRdv === "a_venir" && "Aucun rendez-vous futur planifié pour le moment."}
                  {ongletRdv === "en_attente" && "Aucune nouvelle demande en attente de confirmation."}
                  {ongletRdv === "annules" && "Aucun rendez-vous annulé."}
                </p>
              ) : (
                rdvAffiches.map((rdv) => {
                  const prestationLabel =
                    rdv.prestations && rdv.prestations.length > 0
                      ? rdv.prestations.map((p) => p.libelle).join(", ")
                      : rdv.remarque || "Prestation standard";

                  const isFinished = cleStatut(rdv.statut) === "termine";
                  const isPending = cleStatut(rdv.statut) === "en_attente";
                  const isConfirmed = cleStatut(rdv.statut) === "confirme";
                  const isCancelled = cleStatut(rdv.statut) === "annule" || cleStatut(rdv.statut) === "refuse";

                  return (
                    <div
                      key={rdv.id_rdv}
                      className={`appointment-row ${isFinished ? "is-finished" : ""} ${isCancelled ? "is-cancelled" : ""}`}
                    >
                      <div className="row-time">
                        <Clock size={15} />
                        <div>
                          <strong>{formatDateCourt(rdv.date_heure_debut)}</strong>
                          <span>{plageHoraires(rdv.date_heure_debut, rdv.date_heure_fin)}</span>
                        </div>
                      </div>

                      <div className="row-info">
                        <div className="client-line">
                          <strong>{rdv.nom_client}</strong>
                          <span className="statut-badge" title={rdv.statut}>
                            {libelleStatut(rdv.statut)}
                          </span>
                        </div>
                        <span className="service-name">{prestationLabel}</span>
                      </div>

                      <div className="row-price">
                        {rdv.montant_total ? formatTarif(rdv.montant_total) : "—"}
                      </div>

                      <div className="row-actions">
                        {rdv.telephone ? (
                          <a
                            href={`tel:${rdv.telephone.replace(/\s+/g, "")}`}
                            className="btn-call"
                            title={`Appeler ${rdv.nom_client} au ${rdv.telephone}`}
                          >
                            <Phone size={14} />
                          </a>
                        ) : (
                          <span className="btn-call is-disabled" title="Numéro de téléphone non renseigné">
                            <Phone size={14} />
                          </span>
                        )}

                        {isPending && (
                          <>
                            <button
                              type="button"
                              className="btn-action-validate"
                              disabled={actionEnCours}
                              onClick={() => handleChangerStatut(rdv.id_rdv, "confirme")}
                              title="Confirmer la demande du client"
                            >
                              Valider
                            </button>
                            <button
                              type="button"
                              className="btn-action-decline"
                              disabled={actionEnCours}
                              onClick={() => handleChangerStatut(rdv.id_rdv, "refuse")}
                              title="Décliner ce rendez-vous"
                            >
                              Refuser
                            </button>
                          </>
                        )}

                        {isConfirmed && (
                          <>
                            <button
                              type="button"
                              className="btn-action-finish"
                              disabled={actionEnCours}
                              onClick={() => handleChangerStatut(rdv.id_rdv, "termine")}
                              title="Marquer comme intervention terminée"
                            >
                              Terminer
                            </button>
                            <button
                              type="button"
                              className="btn-action-decline"
                              disabled={actionEnCours}
                              onClick={() => handleChangerStatut(rdv.id_rdv, "annule")}
                              title="Annuler ce rendez-vous"
                            >
                              Annuler
                            </button>
                          </>
                        )}

                        {isFinished && (
                          <span className="badge-done">
                            <Check size={14} /> Effectué
                          </span>
                        )}

                        {isCancelled && (
                          <span className="badge-done text-red">
                            <X size={14} /> {rdv.statut === "refuse" ? "Refusé" : "Annulé"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
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
              Ces mémos restent dans l'onglet et disparaissent au rechargement.
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
