import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { getMetierConfig } from "../../data/metiers";
import { getMesRendezVous } from "../../config/api";
import { formatDuree } from "../../utils/formatDuree";
import { formatTarif } from "../../utils/formatTarif";
import "./MyAppointments.scss";

const ETATS = {
  chargement: { titre: "Chargement de vos rendez-vous…", erreur: false },
  "aucun-compte": {
    titre: "Session expirée : reconnecte-toi pour retrouver tes rendez-vous.",
    erreur: true,
  },
  "sans-espace-client": {
    titre:
      "Ce compte est un espace professionnel : tes rendez-vous sont dans l'agenda de l'espace pro.",
    erreur: true,
  },
  erreur: { titre: "Liste inaccessible : le serveur n'a pas répondu.", erreur: true },
  ok: { titre: "", erreur: false },
};

// Les valeurs que la base sait écrire. Une valeur inconnue s'affiche telle quelle
// plutôt que de faire disparaître la carte.
const STATUTS = {
  en_attente: { classe: "status--pending", libelle: "En attente de l'artisan", icone: Clock },
  confirme: { classe: "status--confirmed", libelle: "Confirmé", icone: CheckCircle2 },
  termine: { classe: "status--past", libelle: "Effectué", icone: null },
  refuse: { classe: "status--cancelled", libelle: "Refusé", icone: X },
};

// Le datetime rendu par MySQL est une heure murale : découper la chaîne plutôt que
// construire un Date évite qu'un poste réglé sur un autre fuseau décale l'affichage.
const badgeDate = (debut) => {
  const [jour, heure] = debut.split(" ");
  const mois = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${jour}T00:00:00Z`));

  return {
    jour: jour.slice(8, 10),
    mois,
    heure: `${heure.slice(0, 5).replace(":", "h")}`,
  };
};

export default function MyAppointments() {
  const [onglet, setOnglet] = useState("a_venir");
  const [rendezVous, setRendezVous] = useState(null);
  const [etat, setEtat] = useState("chargement");

  useEffect(() => {
    getMesRendezVous()
      .then((data) => {
        setRendezVous(data.rendez_vous ?? []);
        setEtat("ok");
      })
      .catch((err) => {
        console.warn("⚠️ Mes rendez-vous inaccessible :", err.message);
        setRendezVous(null);
        if (err.message === "401") setEtat("aucun-compte");
        else if (err.message === "404") setEtat("sans-espace-client");
        else setEtat("erreur");
      });
  }, []);

  const bandeau = ETATS[etat];
  const liste = rendezVous ?? [];
  const aVenir = liste.filter((rdv) => rdv.est_futur);
  const affiches = onglet === "a_venir" ? aVenir : liste.filter((rdv) => !rdv.est_futur);

  return (
    <div className="my-appointments-page">
      <div className="appointments-container">
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

        {bandeau.titre && (
          <div className={`appointments-bandeau ${bandeau.erreur ? "is-error" : ""}`}>
            {bandeau.erreur ? <AlertCircle size={16} /> : <Calendar size={16} />}
            <span>{bandeau.titre}</span>
          </div>
        )}

        {etat === "ok" && (
          <>
            <div className="appointments-tabs">
              <button
                type="button"
                className={`tab-btn ${onglet === "a_venir" ? "active" : ""}`}
                onClick={() => setOnglet("a_venir")}
              >
                <Calendar size={18} />
                <span>À venir</span>
                <span className="count-badge">{aVenir.length}</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${onglet === "passes" ? "active" : ""}`}
                onClick={() => setOnglet("passes")}
              >
                <RotateCcw size={18} />
                <span>Historique &amp; Passés</span>
                <span className="count-badge">{liste.length - aVenir.length}</span>
              </button>
            </div>

            <div className="appointments-list">
              {affiches.length === 0 ? (
                <div className="empty-appointments">
                  <div className="empty-icon">
                    <Calendar size={48} />
                  </div>
                  <h3>
                    Aucun rendez-vous {onglet === "a_venir" ? "à venir" : "dans l'historique"}
                  </h3>
                  <p>Besoin d'un artisan qualifié pour vos travaux ou votre quotidien ?</p>
                  <Link to="/recherche" className="btn-browse-pros">
                    Rechercher un professionnel
                  </Link>
                </div>
              ) : (
                affiches.map((rdv) => {
                  const config = getMetierConfig(rdv.metier);
                  const date = badgeDate(rdv.date_heure_debut);
                  const statut = STATUTS[rdv.statut] ?? {
                    classe: "status--past",
                    libelle: rdv.statut,
                    icone: null,
                  };
                  const IconeStatut = statut.icone;
                  const ville = [rdv.code_postal, rdv.ville].filter(Boolean).join(" ");
                  const adresse = [rdv.adresse_etablissement, ville].filter(Boolean).join(", ");

                  return (
                    <div
                      key={rdv.id_rdv}
                      className={`appointment-card ${rdv.statut === "refuse" ? "is-cancelled" : ""}`}
                    >
                      <div className="card-date-badge">
                        <span className="date-day">{date.jour}</span>
                        <span className="date-month">{date.mois}</span>
                        <span className="date-time">{date.heure}</span>
                      </div>

                      <div className="card-main-info">
                        <div className="pro-heading">
                          <div
                            className="pro-avatar"
                            style={{ backgroundColor: config.color }}
                          >
                            {rdv.nom_etablissement.charAt(0)}
                          </div>
                          <div className="pro-details">
                            <h4>{rdv.nom_etablissement}</h4>
                            <span
                              className="metier-tag"
                              style={{ color: config.color, backgroundColor: config.bgLight }}
                            >
                              {config.label}
                            </span>
                          </div>
                        </div>

                        <div className="service-details">
                          {rdv.prestations.length > 1 ? (
                            <ul className="prestations-liste">
                              {rdv.prestations.map((prestation) => (
                                <li key={prestation.id_prestation}>
                                  <span>{prestation.libelle}</span>
                                  <span>{formatTarif(prestation.prix_applique)}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <h3 className="prestation-name">
                              {rdv.prestations[0]?.libelle ?? "Prestation non détaillée"}
                            </h3>
                          )}

                          <div className="service-meta">
                            <span className="meta-item">
                              <Clock size={15} /> {formatDuree(rdv.duree_min)}
                            </span>
                            <span className="meta-item price-item">
                              Tarif : <strong>{formatTarif(rdv.montant_total) ?? "non communiqué"}</strong>
                            </span>
                            {adresse && (
                              <span className="meta-item address-item">
                                <MapPin size={15} /> {adresse}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="card-actions-col">
                        <span className={`status-badge ${statut.classe}`}>
                          {IconeStatut && <IconeStatut size={15} />} {statut.libelle}
                        </span>

                        <div className="action-buttons-group">
                          {rdv.telephone && (
                            <a
                              href={`tel:${rdv.telephone.replace(/\s+/g, "")}`}
                              className="btn-contact-pro"
                              title="Appeler l'artisan"
                            >
                              <Phone size={15} />
                              <span>{rdv.telephone}</span>
                            </a>
                          )}
                          {rdv.est_futur && rdv.statut !== "refuse" && (
                            <button
                              type="button"
                              className="btn-cancel-rdv"
                              disabled
                              title="Le serveur ne sait pas encore annuler un rendez-vous."
                            >
                              <X size={15} />
                              <span>Annuler</span>
                            </button>
                          )}
                          {!rdv.est_futur && (
                            <Link to="/reservation" className="btn-rebook">
                              <RotateCcw size={15} />
                              <span>Reprendre RDV</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
