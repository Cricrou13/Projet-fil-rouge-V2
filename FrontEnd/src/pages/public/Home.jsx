import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import HeroSearch from "../../components/home/HeroSearch";
import StatsBanner from "../../components/home/StatsBanner";
import CategoriesGrid from "../../components/home/CategoriesGrid";
import ProCard from "../../components/home/ProCard";
import HowItWorks from "../../components/home/HowItWorks";
import ProCtaBanner from "../../components/home/ProCtaBanner";
import Testimonials from "../../components/home/Testimonials";
import { mockPros } from "../../data/mockPros";
import "./Home.scss";

export default function Home() {
  // Sélectionne et trie les artisans par note décroissante, puis garde les 3 premiers
  const topPros = [...mockPros]
    .sort((a, b) => (b.note || 0) - (a.note || 0))
    .slice(0, 3);

  return (
    <div className="home">
      {/* 1. Hero avec recherche multi-critères */}
      <HeroSearch />

      {/* 2. Chiffres clés de réassurance */}
      <StatsBanner />

      {/* 3. Grille des métiers & catégories */}
      <CategoriesGrid />

      {/* 4. Entrepreneurs recommandés */}
      <section className="home-pros-section">
        <div className="home-pros-section__container">
          <div className="home-pros-section__header">
            <div>
              <span className="section-tag">Disponibilités vérifiées</span>
              <h2>Nos entrepreneurs à la une</h2>
              <p>Prenez rendez-vous en direct avec des artisans certifiés de votre région</p>
            </div>
            <Link to="/recherche" className="link-all">
              <span>Voir tous les professionnels</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="home-pros-grid">
            {topPros.map((pro) => (
              <ProCard key={pro.id} pro={pro} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Comment ça marche en 3 étapes */}
      <HowItWorks />

      {/* 6. Espace Pro / Artisans */}
      <ProCtaBanner />

      {/* 7. Témoignages clients & pros */}
      <Testimonials />
    </div>
  );
}