import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, SlidersHorizontal, RotateCcw, Frown } from "lucide-react";
import ProCard from "../../components/home/ProCard";
import { mockPros } from "../../data/mockPros";
import "./SearchPro.scss";

// Fonction utilitaire pour ignorer la casse et les accents
const normalizeText = (text = "") =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function SearchPro() {
  const [searchParams, setSearchParams] = useSearchParams();

  const metierParam = searchParams.get("metier") || "";
  const villeParam = searchParams.get("ville") || "";

  const [metierInput, setMetierInput] = useState(metierParam);
  const [villeInput, setVilleInput] = useState(villeParam);

  useEffect(() => {
    setMetierInput(metierParam);
    setVilleInput(villeParam);
  }, [metierParam, villeParam]);

  const [selectedDispo, setSelectedDispo] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (metierInput.trim()) params.set("metier", metierInput.trim());
    if (villeInput.trim()) params.set("ville", villeInput.trim());
    setSearchParams(params);
  };

  const handleQuickTag = (tag) => {
    setMetierInput(tag);
    const params = new URLSearchParams();
    if (tag) params.set("metier", tag);
    if (villeInput.trim()) params.set("ville", villeInput.trim());
    setSearchParams(params);
  };

  const handleReset = () => {
    setMetierInput("");
    setVilleInput("");
    setSelectedDispo("all");
    setMinRating(0);
    setTypeFilter("all");
    setSortBy("default");
    setSearchParams({});
  };

  const filteredPros = useMemo(() => {
    return mockPros
      .filter((pro) => {
        if (metierParam) {
          const query = normalizeText(metierParam);
          const matchMetier = normalizeText(pro.metier).includes(query);
          const matchName = normalizeText(pro.name).includes(query);
          if (!matchMetier && !matchName) return false;
        }

        if (villeParam) {
          const cityQuery = normalizeText(villeParam);
          const matchCity =
            normalizeText(pro.ville).includes(cityQuery) ||
            (pro.codePostal && pro.codePostal.includes(cityQuery));
          if (!matchCity) return false;
        }

        if (minRating > 0 && pro.rating < minRating) return false;
        if (typeFilter === "quote" && pro.startingPrice !== "Sur devis") return false;
        if (typeFilter === "fixed" && pro.startingPrice === "Sur devis") return false;
        if (
          selectedDispo === "today" &&
          !pro.nextSlot?.toLowerCase().includes("aujourd'hui")
        )
          return false;
        if (
          selectedDispo === "tomorrow" &&
          !pro.nextSlot?.toLowerCase().includes("demain")
        )
          return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "price") {
          const priceA = parseInt(a.startingPrice) || 999;
          const priceB = parseInt(b.startingPrice) || 999;
          return priceA - priceB;
        }
        return 0;
      });
  }, [metierParam, villeParam, selectedDispo, minRating, typeFilter, sortBy]);

  return (
    <div className="search-page">
      <div className="search-container">
        
        {/* BARRE DE RECHERCHE SUPÉRIEURE */}
        <div className="search-top-bar">
          <form className="search-inputs-form" onSubmit={handleSearchSubmit}>
            <div className="search-field">
              <Search className="field-icon" size={18} />
              <input
                type="text"
                aria-label="Quel métier ou artisan ?"
                placeholder="Quel métier ou artisan ?"
                value={metierInput}
                onChange={(e) => setMetierInput(e.target.value)}
              />
            </div>
            <div className="search-divider"></div>
            <div className="search-field">
              <MapPin className="field-icon" size={18} />
              <input
                type="text"
                aria-label="Où ? (ex: Toulouse, Blagnac)"
                placeholder="Où ? (ex: Toulouse, Blagnac)"
                value={villeInput}
                onChange={(e) => setVilleInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-search-submit">
              Rechercher
            </button>
          </form>

          {/* Tags d'accès direct */}
          <div className="search-quick-tags">
            <span className="tags-title">Accès direct :</span>
            <button
              type="button"
              className={`tag-btn ${!metierParam ? "active" : ""}`}
              onClick={() => handleQuickTag("")}
            >
              Tous
            </button>
            <button
              type="button"
              className={`tag-btn ${normalizeText(metierParam) === "coiffure" ? "active" : ""}`}
              onClick={() => handleQuickTag("Coiffure")}
            >
              ✂️ Coiffure
            </button>
            <button
              type="button"
              className={`tag-btn ${normalizeText(metierParam) === "plomberie" ? "active" : ""}`}
              onClick={() => handleQuickTag("Plomberie")}
            >
              🔧 Plomberie
            </button>
            <button
              type="button"
              className={`tag-btn ${normalizeText(metierParam) === "terrassement" ? "active" : ""}`}
              onClick={() => handleQuickTag("Terrassement")}
            >
              🚜 Terrassement
            </button>
            <button
              type="button"
              className={`tag-btn ${normalizeText(metierParam) === "informatique" ? "active" : ""}`}
              onClick={() => handleQuickTag("Développeur web")}
            >
              💻 Informatique
            </button>
            <button
              type="button"
              className={`tag-btn ${normalizeText(metierParam) === "electricite" ? "active" : ""}`}
              onClick={() => handleQuickTag("Electricité")}
            >
              🪛 Électricité
            </button>
            <button
              type="button"
              className={`tag-btn ${normalizeText(metierParam) === "maçonnerie générale" ? "active" : ""}`}
              onClick={() => handleQuickTag("maçonnerie générale")}
            >
              🧱 Maçonnerie générale
            </button>
          </div>
        </div>

        {/* LAYOUT PRINCIPAL */}
        <div className="search-layout">
          <aside className="search-filters-sidebar">
            <div className="filters-header">
              <span className="filters-title">
                <SlidersHorizontal size={16} />
                <span>Filtres</span>
              </span>
              {(metierParam || villeParam || minRating > 0 || typeFilter !== "all" || selectedDispo !== "all") && (
                <button type="button" className="btn-reset" onClick={handleReset} title="Réinitialiser">
                  <RotateCcw size={13} />
                  <span>Effacer</span>
                </button>
              )}
            </div>

            {/* GRoupe 1 : Disponibilité */}
            <fieldset className="filter-group">
              <legend>Disponibilité</legend>
              <div className="filter-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="dispo"
                    checked={selectedDispo === "all"}
                    onChange={() => setSelectedDispo("all")}
                  />
                  <span>Toutes disponibilités</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="dispo"
                    checked={selectedDispo === "today"}
                    onChange={() => setSelectedDispo("today")}
                  />
                  <span>🟢 Aujourd'hui</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="dispo"
                    checked={selectedDispo === "tomorrow"}
                    onChange={() => setSelectedDispo("tomorrow")}
                  />
                  <span>Demain</span>
                </label>
              </div>
            </fieldset>

            {/* Groupe 2 : Avis clients */}
            <fieldset className="filter-group">
              <legend>Avis clients</legend>
              <div className="filter-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === 0}
                    onChange={() => setMinRating(0)}
                  />
                  <span>Toutes les notes</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === 4.8}
                    onChange={() => setMinRating(4.8)}
                  />
                  <span>★ 4.8 et plus</span>
                </label>
              </div>
            </fieldset>

            {/* Groupe 3 : Type d'intervention */}
            <fieldset className="filter-group">
              <legend>Type d'intervention</legend>
              <div className="filter-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="type"
                    checked={typeFilter === "all"}
                    onChange={() => setTypeFilter("all")}
                  />
                  <span>Tous</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="type"
                    checked={typeFilter === "fixed"}
                    onChange={() => setTypeFilter("fixed")}
                  />
                  <span>Tarif fixe en ligne</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="type"
                    checked={typeFilter === "quote"}
                    onChange={() => setTypeFilter("quote")}
                  />
                  <span>Sur devis</span>
                </label>
              </div>
            </fieldset>
          </aside>

          <main className="search-results-area">
            <h1 className="sr-only">Rechercher un professionnel ou un artisan</h1> {/* // Titre masqué à titre indicatif pour le lecteur// */}
            <div className="results-header">
              <h2 className="results-count">
                <strong>{filteredPros.length}</strong> professionnel{filteredPros.length > 1 ? "s" : ""} disponible{filteredPros.length > 1 ? "s" : ""}
                {villeParam && ` à ${villeParam}`}
                {metierParam && ` pour "${metierParam}"`}
              </h2>
              <div className="results-sort">
                <label htmlFor="sort-select">Trier par :</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="default">Pertinence</option>
                  <option value="rating">Mieux notés (★)</option>
                  <option value="price">Prix croissant</option>
                </select>
              </div>
            </div>

            {filteredPros.length > 0 ? (
              <div className="results-grid">
                {filteredPros.map((pro) => (
                  <ProCard key={pro.id} pro={pro} />
                ))}
              </div>
            ) : (
              <div className="empty-results">
                <Frown size={44} className="empty-icon" />
                <h3>Aucun professionnel trouvé</h3>
                <p>
                  Nous n'avons trouvé aucun artisan correspondant à vos critères de recherche.
                </p>
                <button type="button" className="btn-reset-search" onClick={handleReset}>
                  Réinitialiser tous les critères
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}