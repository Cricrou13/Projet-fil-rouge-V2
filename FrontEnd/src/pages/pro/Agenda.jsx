import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { getMetierConfig } from "../../data/metiers";
import { mockPlanning } from "../../data/mockPlanning";
import "./Agenda.scss";

export default function Planning() {
  const { metier = "default" } = useOutletContext() || {};
  const config = getMetierConfig(metier);
  const appointments = mockPlanning[metier] || mockPlanning.default;

  const days = ["Lun 1", "Mar 2", "Mer 3", "Jeu 4", "Ven 5", "Sam 6"];

  return (
    <div className="planning-container">
      {/* HEADER */}
      <div className="planning-header">
        <div className="planning-header__title">
          <h2>Planning des rendez-vous</h2>
          <p>Semaine en cours</p>
        </div>

        <div className="planning-header__actions">
          <div className="date-nav">
            <button className="btn-nav"><ChevronLeft size={16} /> Précédent</button>
            <button className="btn-today">Aujourd'hui</button>
            <button className="btn-nav">Suivant <ChevronRight size={16} /></button>
          </div>
          <button className="btn-add-rdv">
            <Plus size={18} />
            <span>Bloquer un créneau</span>
          </button>
        </div>
      </div>

      {/* GRILLE DES JOURS */}
      <div className="agenda-grid">
        {days.map((day) => (
          <div key={day} className={`agenda-column ${day === "Jeu 4" ? "is-today" : ""}`}>
            <div className="day-header">
              {day} {day === "Jeu 4" && "(Auj)"}
            </div>
            
            <div className="day-content">
              {appointments
                .filter((app) => app.day === day)
                .map((app) => (
                  <div 
                    key={app.id} 
                    className="event-card"
                    style={{ borderLeftColor: config.color }}
                  >
                    <span className="event-time">{app.time}:</span>
                    <span className="event-client">{app.client}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}