import "./Topbar.scss";

export default function Topbar({ nom = "Utilisateur", enLigne = true, notifications = 0 }) {
  return (
    <div className="topbar">
      <div className="topbar__left">
        <span className="topbar__greeting">
          Bonjour, <strong>{nom}</strong> 👋
        </span>
        {enLigne && (
          <span className="topbar__status">
            <span className="topbar__status-dot"></span>
            En ligne
          </span>
        )}
      </div>

      <div className="topbar__right">
        <button className="topbar__btn-rdv">+ Nouveau RDV</button>
        <button className="topbar__notif">
          🔔
          {notifications > 0 && (
            <span className="topbar__notif-badge">{notifications}</span>
          )}
        </button>
      </div>
    </div>
  );
}