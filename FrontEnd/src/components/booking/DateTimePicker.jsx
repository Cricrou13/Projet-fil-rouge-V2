import { Calendar as CalendarIcon, Sun, Sunset, Check } from "lucide-react";
import "./DateTimePicker.scss";
const morningSlots = ["09:00", "09:45", "10:30", "11:15"];
const afternoonSlots = ["14:00", "14:45", "15:30", "16:15", "17:00"];
export default function DateTimePicker({ date, setDate, heure, setHeure }) {
  // Date minimale = aujourd'hui
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="datetime-picker">
      
      {/* 1. SÉLECTION DU JOUR */}
      <div className="date-selection-box">
        <label htmlFor="booking-date">
          <CalendarIcon size={18} className="picker-icon" />
          <span>Choisissez une date :</span>
        </label>
        <input 
          id="booking-date"
          type="date" 
          min={today}
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          required
        />
      </div>
      {/* 2. SÉLECTION DU CRÉNEAU HORAIRE */}
      {date ? (
        <div className="slots-container">
          
          {/* CRÉNEAUX MATIN */}
          <div className="slots-group">
            <div className="group-title">
              <Sun size={16} className="sun-icon" />
              <span>Matinée</span>
            </div>
            <div className="slots-grid">
              {morningSlots.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`slot-btn ${heure === c ? "selected" : ""}`}
                  onClick={() => setHeure(c)}
                >
                  <span>{c}</span>
                  {heure === c && <Check size={14} className="check-icon" />}
                </button>
              ))}
            </div>
          </div>
          {/* CRÉNEAUX APRÈS-MIDI */}
          <div className="slots-group">
            <div className="group-title">
              <Sunset size={16} className="sunset-icon" />
              <span>Après-midi</span>
            </div>
            <div className="slots-grid">
              {afternoonSlots.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`slot-btn ${heure === c ? "selected" : ""}`}
                  onClick={() => setHeure(c)}
                >
                  <span>{c}</span>
                  {heure === c && <Check size={14} className="check-icon" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="choose-date-first">
          <CalendarIcon size={24} />
          <p>Veuillez choisir une date ci-dessus pour afficher les créneaux disponibles.</p>
        </div>
      )}
    </div>
  );
}