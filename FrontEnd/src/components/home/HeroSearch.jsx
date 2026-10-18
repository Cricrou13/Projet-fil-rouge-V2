import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ArrowRight } from "lucide-react";
import "./HeroSearch.scss";

export default function HeroSearch() {
  const [metier, setMetier] = useState("");
  const [ville, setVille] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (metier.trim()) params.append("metier", metier.trim());
    if (ville.trim()) params.append("ville", ville.trim());
    navigate(`/recherche?${params.toString()}`);
  };

  const handleQuickTag = (tag) => {
    navigate(`/recherche?metier=${encodeURIComponent(tag)}`);
  };

  return (
    <section className="hero-search">
      <div className="hero-search__container">
        <div className="hero-search__badge">
          <span className="badge-pulse"></span>
          Prise de rendez-vous en ligne 24/7
        </div>

        <h1 className="hero-search__title">
          Trouvez et réservez votre entrepreneur{" "}
          <span className="hero-search__highlight">en quelques clics</span>
        </h1>

        <p className="hero-search__subtitle">
          Consultez les disponibilités réelles, réservez instantanément ou demandez un devis sans engagement.
        </p>

        <form className="hero-search__form" onSubmit={handleSubmit}>
          <div className="hero-search__field">
            <Search className="hero-search__icon" size={20} />
            <div className="hero-search__input-wrap">
              <label htmlFor="metier-input">Quel métier ou prestation ?</label>
              <input
                id="metier-input"
                type="text"
                placeholder="Ex: Plombier, Coiffure, Peintre..."
                value={metier}
                onChange={(e) => setMetier(e.target.value)}
              />
            </div>
          </div>

          <div className="hero-search__divider"></div>

          <div className="hero-search__field">
            <MapPin className="hero-search__icon" size={20} />
            <div className="hero-search__input-wrap">
              <label htmlFor="ville-input">Où ?</label>
              <input
                id="ville-input"
                type="text"
                placeholder="Toulouse, Blagnac, 31000..."
                value={ville}
                onChange={(e) => setVille(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="hero-search__btn">
            <span>Rechercher</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="hero-search__tags">
          <span className="tags-label">Suggestions :</span>
          <button type="button" onClick={() => handleQuickTag("Coiffure")}>✂️ Coiffure</button>
          <button type="button" onClick={() => handleQuickTag("Plomberie")}>🔧 Plomberie</button>
          <button type="button" onClick={() => handleQuickTag("Terrassement")}>🚜 Terrassement</button>
          <button type="button" onClick={() => handleQuickTag("Électricité")}>⚡ Électricité</button>
        </div>
      </div>
    </section>
  );
}
