import { useState, useMemo } from "react";
import { 
  Briefcase, 
  Clock, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Edit3, 
  Eye, 
  EyeOff, 
  X,
  Sparkles
} from "lucide-react";
import "./Prestations.scss";
// Données initiales réalistes pour la démo
const initialServices = [
  {
    id: 1,
    nom: "Coupe classique homme",
    categorie: "Coupes",
    duree: "30 min",
    prix: 25,
    description: "Shampoing traitant, coupe aux ciseaux et coiffage structuré.",
    enLigne: true,
  },
  {
    id: 2,
    nom: "Coupe + Taille de barbe",
    categorie: "Forfaits",
    duree: "45 min",
    prix: 35,
    description: "Formule complète : coupe cheveux, rituel barbe à l'ancienne et serviette chaude.",
    enLigne: true,
  },
  {
    id: 3,
    nom: "Taille de barbe sculptée",
    categorie: "Barbe",
    duree: "25 min",
    prix: 18,
    description: "Tracé des contours au rasoir droit, désépaississement et huile nourrissante.",
    enLigne: true,
  },
  {
    id: 4,
    nom: "Coupe + Décoloration / Patine",
    categorie: "Technique",
    duree: "1h30",
    prix: 65,
    description: "Décoloration personnalisée, nuanceur patine et soin réparateur profond.",
    enLigne: true,
  },
  {
    id: 5,
    nom: "Soin détox cuir chevelu",
    categorie: "Soins",
    duree: "20 min",
    prix: 15,
    description: "Gommage exfoliant doux, massage crânien relaxant et sérum tonifiant.",
    enLigne: false,
  },
];
export default function Prestations() {
  const [prestations, setPrestations] = useState(initialServices);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  // Données du formulaire d'ajout
  const [newPresta, setNewPresta] = useState({
    nom: "",
    categorie: "Coupes",
    duree: "30 min",
    prix: "",
    description: "",
  });
  // Liste des catégories uniques
  const categories = ["all", "Coupes", "Barbe", "Forfaits", "Technique", "Soins"];
  // Filtrage combiné (catégorie + texte de recherche)
  const filteredPrestations = useMemo(() => {
    return prestations.filter((p) => {
      const matchCategory = selectedCategory === "all" || p.categorie === selectedCategory;
      const matchSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [prestations, selectedCategory, searchTerm]);
  // Basculer la visibilité d'une prestation en ligne
  const handleToggleOnline = (id) => {
    setPrestations((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enLigne: !p.enLigne } : p))
    );
    showToast("Statut de visibilité mis à jour.");
  };
  // Supprimer une prestation
  const handleDelete = (id, nom) => {
    if (window.confirm(`Voulez-vous vraiment supprimer la prestation "${nom}" ?`)) {
      setPrestations((prev) => prev.filter((p) => p.id !== id));
      showToast(`Prestation "${nom}" supprimée.`);
    }
  };
  // Soumission du formulaire d'ajout
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newPresta.nom || !newPresta.prix) return;
    const created = {
      id: Date.now(),
      nom: newPresta.nom,
      categorie: newPresta.categorie,
      duree: newPresta.duree,
      prix: parseFloat(newPresta.prix),
      description: newPresta.description || "Aucune description renseignée.",
      enLigne: true,
    };
    setPrestations((prev) => [created, ...prev]);
    setIsModalOpen(false);
    setNewPresta({
      nom: "",
      categorie: "Coupes",
      duree: "30 min",
      prix: "",
      description: "",
    });
    showToast(`Prestation "${created.nom}" ajoutée avec succès !`);
  };
  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };
  return (
    <div className="prestations-page">
      
      {/* NOTIFICATION FLOTTANTE */}
      {notification && (
        <div className="toast-notification">
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}
      {/* EN-TÊTE DE LA PAGE */}
      <div className="page-header">
        <div className="header-text">
          <h1>Prestations & Grille Tarifaire</h1>
          <p>Configurez les tarifs et la durée de vos prestations proposées lors de la réservation en ligne.</p>
        </div>
        <button 
          type="button" 
          className="btn-add-presta" 
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          <span>Ajouter une prestation</span>
        </button>
      </div>
      {/* STATS RAPIDES */}
      <div className="presta-stats-row">
        <div className="presta-stat-box">
          <span className="stat-label">Prestations au catalogue</span>
          <strong className="stat-value">{prestations.length}</strong>
        </div>
        <div className="presta-stat-box">
          <span className="stat-label">Visibles en réservation</span>
          <strong className="stat-value text-green">
            {prestations.filter((p) => p.enLigne).length}
          </strong>
        </div>
        <div className="presta-stat-box">
          <span className="stat-label">Tarif moyen calculé</span>
          <strong className="stat-value">
            {Math.round(prestations.reduce((acc, p) => acc + p.prix, 0) / prestations.length || 0)} €
          </strong>
        </div>
      </div>
      {/* BARRE DE RECHERCHE ET ONGLETS CATÉGORIES */}
      <div className="filters-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Rechercher une prestation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`pill-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === "all" ? "Toutes les catégories" : cat}
            </button>
          ))}
        </div>
      </div>
      {/* TABLEAU DES PRESTATIONS */}
      <div className="table-container">
        <table className="prestations-table">
          <thead>
            <tr>
              <th>Désignation</th>
              <th>Catégorie</th>
              <th>Durée</th>
              <th>Tarif TTC</th>
              <th>Statut en ligne</th>
              <th className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrestations.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-table">
                  Aucune prestation ne correspond à vos critères de recherche.
                </td>
              </tr>
            ) : (
              filteredPrestations.map((p) => (
                <tr key={p.id} className={!p.enLigne ? "row-offline" : ""}>
                  <td className="td-name">
                    <strong>{p.nom}</strong>
                    <p className="desc">{p.description}</p>
                  </td>
                  <td>
                    <span className="badge-cat">{p.categorie}</span>
                  </td>
                  <td className="td-duree">
                    <Clock size={15} />
                    <span>{p.duree}</span>
                  </td>
                  <td className="td-price">
                    {p.prix} €
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`status-toggle ${p.enLigne ? "is-online" : "is-offline"}`}
                      onClick={() => handleToggleOnline(p.id)}
                      title={p.enLigne ? "Cliquer pour masquer" : "Cliquer pour afficher"}
                    >
                      {p.enLigne ? <Eye size={14} /> : <EyeOff size={14} />}
                      <span>{p.enLigne ? "En ligne" : "Masqué"}</span>
                    </button>
                  </td>
                  <td className="td-actions">
                    <button 
                      type="button" 
                      className="btn-delete"
                      onClick={() => handleDelete(p.id, p.nom)}
                      title="Supprimer la prestation"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* MODALE D'AJOUT DE PRESTATION */}
      {isModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Sparkles size={20} className="modal-icon" />
                <h3>Ajouter une nouvelle prestation</h3>
              </div>
              <button 
                type="button" 
                className="btn-close-modal" 
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="nom">Nom de la prestation *</label>
                <input 
                  id="nom"
                  type="text" 
                  required 
                  placeholder="Ex: Soin barbe vapeur & serviette chaude"
                  value={newPresta.nom}
                  onChange={(e) => setNewPresta({ ...newPresta, nom: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="categorie">Catégorie</label>
                  <select 
                    id="categorie"
                    value={newPresta.categorie}
                    onChange={(e) => setNewPresta({ ...newPresta, categorie: e.target.value })}
                  >
                    <option value="Coupes">Coupes</option>
                    <option value="Barbe">Barbe</option>
                    <option value="Forfaits">Forfaits</option>
                    <option value="Technique">Technique</option>
                    <option value="Soins">Soins</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="duree">Durée estimée</label>
                  <select 
                    id="duree"
                    value={newPresta.duree}
                    onChange={(e) => setNewPresta({ ...newPresta, duree: e.target.value })}
                  >
                    <option value="15 min">15 min</option>
                    <option value="30 min">30 min</option>
                    <option value="45 min">45 min</option>
                    <option value="1h">1h00</option>
                    <option value="1h30">1h30</option>
                    <option value="2h">2h00</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="prix">Tarif TTC (€) *</label>
                <input 
                  id="prix"
                  type="number" 
                  step="0.5" 
                  min="0"
                  required 
                  placeholder="Ex: 35"
                  value={newPresta.prix}
                  onChange={(e) => setNewPresta({ ...newPresta, prix: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Courte description (visible par le client)</label>
                <textarea 
                  id="description"
                  rows={3} 
                  placeholder="Décrivez brièvement les étapes de cette prestation..."
                  value={newPresta.description}
                  onChange={(e) => setNewPresta({ ...newPresta, description: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-save">
                  Enregistrer la prestation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}