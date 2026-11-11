import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import HeroSearch from "../../components/home/HeroSearch";
import StatsBanner from "../../components/home/StatsBanner";
import CategoriesGrid from "../../components/home/CategoriesGrid";
import ProCard from "../../components/home/ProCard";
import HowItWorks from "../../components/home/HowItWorks";
import ProCtaBanner from "../../components/home/ProCtaBanner";
import Testimonials from "../../components/home/Testimonials";
import { versCarteArtisan } from "../../utils/versCarteArtisan";
import { getArtisans } from "../../config/api";
import "./Home.scss";

export default function Home() {
  const [topPros, setTopPros] = useState([]);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(true);

  const chargerAnnuaire = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const data = await getArtisans();
      setTopPros(Array.isArray(data) ? data.map(versCarteArtisan) : []);
    } catch (err) {
      console.warn("⚠️ Annuaire des artisans inaccessible :", err.message);
      setTopPros([]);
      setErreur("Le serveur n'a pas répondu, la liste des artisans n'a pas pu être chargée.");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    chargerAnnuaire();
  }, [chargerAnnuaire]);
  return (
    <div className="home">
      <HeroSearch />
      <StatsBanner />
      <CategoriesGrid />
      <section className="home-pros-section">
        <div className="home-pros-section__container">
          <div className="home-pros-section__header">
            <div>
              <span className="section-tag">Artisans enregistrés sur InfinTime</span>
              <h2>Nos entrepreneurs à la une</h2>
              <p>Consultez leur métier, leur ville et leur tarif indicatif, puis préparez votre demande : elle part par email.</p>
            </div>
            <Link to="/recherche" className="link-all">
              <span>Voir tous les professionnels</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="home-pros-grid">
            {chargement ? (
              <p className="home-pros-state">Chargement des artisans…</p>
            ) : erreur ? (
              <p className="home-pros-state is-error">
                <span>{erreur}</span>
                <button type="button" onClick={chargerAnnuaire}>
                  Réessayer
                </button>
              </p>
            ) : topPros.length > 0 ? (
              topPros.map((pro) => <ProCard key={pro.id} pro={pro} />)
            ) : (
              <p className="home-pros-state">Aucun artisan n'est encore enregistré.</p>
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