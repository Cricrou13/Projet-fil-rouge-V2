import { useNavigate, Link } from "react-router-dom";
import { 
  ArrowRight, 
  Scissors, 
  Wrench, 
  Tractor, 
  Zap, 
  Paintbrush, 
  Trees, 
  Sparkles, 
  Hammer, 
  Computer,
  HelpCircle,

} from "lucide-react";
import { mockCategories } from "../../data/mockCategories";
import { getMetierConfig } from "../../data/metiers";
import "./CategoriesGrid.scss";

// Mapping basique
const ICON_MAP = {
  coiffure: Scissors,
  plomberie: Wrench,
  terrassement: Tractor,
  electricite: Zap,
  peinture: Paintbrush,
  "espaces-verts": Trees,
  nettoyage: Sparkles,
  menuiserie: Hammer,
  informatique: Computer,
};

export default function CategoriesGrid() {
  const navigate = useNavigate();

  return (
    <section className="categories-section">
      <div className="categories-section__header">
        <div>
          <span className="section-tag">Explorer les métiers</span>
          <h2>Trouvez un spécialiste selon vos besoins</h2>
        </div>
        <Link to="/recherche" className="link-all">
          <span>Voir toutes les catégories</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="categories-grid">
        {mockCategories.map((cat) => {
          const config = getMetierConfig(cat.query || cat.name);
          const IconComponent = ICON_MAP[cat.query?.toLowerCase()] || HelpCircle;

          return (
            <div
              key={cat.id}
              className="category-card"
              onClick={() => navigate(`/recherche?metier=${encodeURIComponent(cat.query)}`)}
              role="button"
              tabIndex={0}
              style={{
                "--card-accent-color": config.color
              }}
            >
              <div 
                className="category-card__icon"
                style={{ 
                  backgroundColor: config.bgLight, 
                  color: config.color 
                }}
              >
                <IconComponent size={24} />
              </div>
              <h3 className="category-card__name">{cat.name}</h3>
              <span className="category-card__count">{cat.count} professionnels</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}