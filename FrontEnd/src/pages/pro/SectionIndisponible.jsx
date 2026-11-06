import { Link, useLocation } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import "./SectionIndisponible.scss";

export default function SectionIndisponible() {
  const { pathname } = useLocation();

  return (
    <div className="section-indisponible">
      <div className="section-indisponible__icon">
        <AlertCircle size={22} aria-hidden="true" />
      </div>
      <h1>Cette section n'est pas encore ouverte</h1>
      <p>
        Aucune page n'est branchée sur l'adresse{" "}
        <code className="section-indisponible__url">{pathname}</code>.
      </p>
      <Link className="section-indisponible__retour" to="/pro/tableau-de-bord">
        Retour au tableau de bord
      </Link>
    </div>
  );
}
