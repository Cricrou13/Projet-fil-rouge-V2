import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AlertCircle, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { getMetierConfig } from "../../data/metiers";
import { getAgendaPro } from "../../config/api";
import { decaleJours, labelJour, plageHoraires, semaineDe } from "../../utils/dateSemaine";
import { libelleStatut } from "../../data/statuts";
import "./Agenda.scss";

const ECRITURE_INDISPONIBLE =
  "Aucune route d'écriture n'existe encore : rien ne sera modifié en base.";

const ETATS = {
  chargement: { classe: "", titre: "Chargement de la semaine…" },
  "aucun-compte": { classe: "is-error", titre: "Aucun compte pro identifié. Reconnecte-toi pour charger ton planning." },
  "sans-fiche": { classe: "is-error", titre: "Ce compte n'a pas de fiche artisan en base : l'agenda reste vide." },
  erreur: { classe: "is-error", titre: "Planning inaccessible : le serveur n'a pas répondu." },
  ok: { classe: "", titre: "Rendez-vous lus en base (table rendez_vous), semaine ISO du lundi au dimanche." },
};

export default function Planning() {
  const { metier = "default" } = useOutletContext() || {};
  const config = getMetierConfig(metier);

  // null = « semaine courante », laissée au calcul de la base. Un lundi demandé
  // est normalisé côté serveur : le front n'a jamais à connaître l'heure UTC.
  const [lundiDemande, setLundiDemande] = useState(null);
  const [agenda, setAgenda] = useState(null);
  const [etat, setEtat] = useState("chargement");

  useEffect(() => {
    getAgendaPro(lundiDemande)
      .then((data) => {
        setAgenda(data);
        setEtat("ok");
      })
      .catch((err) => {
        console.warn("⚠️ Semaine inaccessible :", err.message);
        setAgenda(null);
        if (err.message === "404") setEtat("sans-fiche");
        else if (err.message === "401") setEtat("aucun-compte");
        else setEtat("erreur");
      });
  }, [lundiDemande]);

  const debut = agenda?.semaine?.debut ?? null;
  const jours = debut === null ? [] : semaineDe(debut);
  const rendezVous = agenda?.rendez_vous ?? [];
  const bandeau = ETATS[etat];

  return (
    <div className="planning-container">
      <div className={`etat-carte ${bandeau.classe}`}>
        {etat === "erreur" || etat === "sans-fiche" || etat === "aucun-compte" ? (
          <AlertCircle size={16} />
        ) : (
          <ChevronRight size={16} />
        )}
        <span>{bandeau.titre}</span>
      </div>

      {/* HEADER */}
      <div className="planning-header">
        <div className="planning-header__title">
          <h2>Planning des rendez-vous</h2>
          <p>
            {debut === null
              ? "Semaine non chargée"
              : `Du ${labelJour(debut)} au ${labelJour(decaleJours(debut, 6))}`}
          </p>
        </div>

        <div className="planning-header__actions">
          <div className="date-nav">
            <button
              type="button"
              className="btn-nav"
              onClick={() => setLundiDemande(decaleJours(debut, -7))}
              disabled={debut === null}
            >
              <ChevronLeft size={16} /> Précédent
            </button>
            <button type="button" className="btn-today" onClick={() => setLundiDemande(null)}>
              Aujourd'hui
            </button>
            <button
              type="button"
              className="btn-nav"
              onClick={() => setLundiDemande(decaleJours(debut, 7))}
              disabled={debut === null}
            >
              Suivant <ChevronRight size={16} />
            </button>
          </div>
          <button type="button" className="btn-add-rdv" disabled title={ECRITURE_INDISPONIBLE}>
            <Plus size={18} />
            <span>Bloquer un créneau</span>
          </button>
        </div>
      </div>

      {/* GRILLE DES JOURS */}
      <div className="agenda-grid">
        {jours.map((jour) => {
          const estAujourdhui = jour === agenda?.aujourdhui;
          const evenements = rendezVous.filter((rdv) => rdv.jour === jour);

          return (
            <div key={jour} className={`agenda-column ${estAujourdhui ? "is-today" : ""}`}>
              <div className="day-header">
                {labelJour(jour)} {estAujourdhui && "(Auj)"}
              </div>

              <div className="day-content">
                {evenements.map((rdv) => (
                  <div
                    key={rdv.id_rdv}
                    className="event-card"
                    style={{ borderLeftColor: config.color }}
                    title={libelleStatut(rdv.statut)}
                  >
                    <span className="event-time">{plageHoraires(rdv.date_heure_debut, rdv.date_heure_fin)}</span>
                    <span className="event-client">{rdv.nom_client}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {etat === "ok" && rendezVous.length === 0 && (
        <p className="mention">
          Aucun rendez-vous cette semaine en base. La table <code>disponibilites</code>{" "}
          n'est pas non plus interrogée : aucun créneau n'y est enregistré.
        </p>
      )}
    </div>
  );
}
