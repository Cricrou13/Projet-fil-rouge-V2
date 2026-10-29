import { useState, useEffect } from "react";
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
import { formatTarif } from "../../utils/formatTarif";
import "./Home.scss";

export default function Home() {
  const [topPros, setTopPros] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("http://projet-fil-rouge-v2.test/index.php?route=artisans")
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formattedPros = data.map((artisan) => ({
            id: artisan.id_artisan,
            name: artisan.nom_etablissement,
            nom_etablissement: artisan.nom_etablissement,
            metier: artisan.metier,
            ville: artisan.ville,
            initials: artisan.nom_etablissement.slice(0, 2).toUpperCase(),
            // Aucune table d'avis n'existe en base : null = "on ne sait pas",
            // et ProCard masque alors le bloc.
            rating: null,
            // Tarif reel : MIN() des prestations actives, null = 0 prestation
            // tarifee, donc « sur devis » et plus un fallback.
            startingPrice: formatTarif(artisan.tarif_min ?? null),
          }));
          setTopPros(formattedPros);
        } else {
          console.warn("⚠️ BDD vide ou données non reconnues, utilisation des mocks");
          setTopPros(mockPros);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("⚠️ API BDD inaccessible, bascule sur les données de secours :", err.message);
        setTopPros(mockPros);
        setLoading(false);
      });
  }, []);
  return (
    <div className="home">
      <HeroSearch />
      <StatsBanner />
      <CategoriesGrid />
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
            {loading ? (
              <p>Chargement des artisans...</p>
            ) : topPros.length > 0 ? (
              topPros.map((pro) => <ProCard key={pro.id} pro={pro} />)
            ) : (
              <p>Aucun artisan trouvé pour le moment.</p>
            )}
          </div>
        </div>
      </section>
      <HowItWorks />
      <ProCtaBanner />
      <Testimonials />
    </div>
  );
}