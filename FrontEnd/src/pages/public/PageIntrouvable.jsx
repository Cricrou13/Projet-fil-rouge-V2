import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import "./PageIntrouvable.scss";

// Filet de sécurité public, même rôle que SectionIndisponible côté pro : sans
// route `path="*"`, une URL inconnue ne rend aucun match et vide tout #root,
// Header et Footer compris. Le texte reste client : on ne parle pas d'« adresse
// non branchée » à quelqu'un qui cherche un artisan.
export default function PageIntrouvable() {
  return (
    <div className="page-introuvable">
      <div className="page-introuvable__icon">
        <Compass size={24} aria-hidden="true" />
      </div>
      <h1>Page introuvable</h1>
      <p>
        Ce lien n'existe pas ou n'existe plus. Tu peux repartir de l'accueil ou
        chercher directement un professionnel près de chez toi.
      </p>
      <div className="page-introuvable__actions">
        <Link className="page-introuvable__lien page-introuvable__lien--principal" to="/">
          Retour à l'accueil
        </Link>
        <Link className="page-introuvable__lien" to="/recherche">
          Trouver un professionnel
        </Link>
      </div>
    </div>
  );
}
