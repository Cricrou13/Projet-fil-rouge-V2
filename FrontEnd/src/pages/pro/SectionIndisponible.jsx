import { Link, useLocation } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import "./SectionIndisponible.scss";

// Filet de sécurité déclaré en `path="*"` sous /pro. Sans lui, une URL sans route
// enfant (« /pro/clientele » et « /pro/parametres » de la sidebar, ou une adresse
// tapée à la main) ne vide pas seulement <main> : React Router ne trouve aucun
// match, donc l'arborescence entière ne rend rien, sidebar et Topbar comprises.
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
