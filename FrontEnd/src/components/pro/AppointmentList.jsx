import "./AppointmentList.scss";

export default function AppointmentList({ rdvs }) {
  return (
    <div className="appointment-list">
      <h3>Prochains RDV</h3>
      <ul>
        {rdvs.map((rdv) => (
          <li key={rdv.id}>
            <span className="appointment-heure">{rdv.heure}</span>
            <span className="appointment-client">{rdv.client}</span>
            <span className="appointment-prestation">{rdv.prestation}</span>
            <span className={`appointment-statut ${rdv.confirme ? "ok" : "non"}`}>
              {rdv.confirme ? "✓" : "✗"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}