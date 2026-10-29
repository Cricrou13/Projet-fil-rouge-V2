import { useState, useMemo, useEffect } from "react";
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
import "./Prestationtable.scss";
import { useAuth } from "../../context/AuthContext";
import { V2_API_URL } from "../../config/api";
import { formatDuree } from "../../utils/formatDuree";

export default function Prestations() {

  // L'espace pro s'identifie par Id_utilisateur : c'est la seule clé que la
  // réponse de connexion.php met à disposition du front.
  const { proUser } = useAuth();
  const idUtilisateur = proUser?.Id_utilisateur ?? null;

  // `categorie` n'existe dans aucune table : la colonne reste affichee mais
  // vide, et les onglets se rempliraient d'eux-memes le jour ou la colonne arrive.
  const toLigne = (p) => ({
    id: p.id_prestation,
    nom: p.libelle,
    categorie: null,
    duree: formatDuree(p.duree_estimee),
    prix: Number(p.tarif),
    description: p.description || "Aucune description renseignée.",
    // actif = 1 seulement : coté client, une prestation actif = null est deja
    // exclue par le SQL, donc « masquee » est le seul affichage coherent.
    enLigne: p.actif === true,
  });

  const [prestations, setPrestations] = useState([]);
  const [etat, setEtat] = useState("chargement");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  // Données du formulaire d'ajout
  const [newPresta, setNewPresta] = useState({
    nom: "",
    categorie: "",
    duree: "30 min",
    prix: "",
    description: "",
  });

  useEffect(() => {
    if (idUtilisateur === null) {
      setEtat("aucun-compte");
      return;
    }
    fetch(`${V2_API_URL}?route=pro&id_utilisateur=${encodeURIComponent(idUtilisateur)}`)
      .then((res) => {
        // 404 = le compte existe mais n'a pas de ligne dans `artisans`
        // (connexion.php ne filtre pas le role).
        if (res.status === 404) throw new Error("404");
        if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setPrestations((data.prestations ?? []).map(toLigne));
        setEtat("ok");
      })
      .catch((err) => {
        console.warn("⚠️ Catalogue pro inaccessible :", err.message);
        setPrestations([]);
        setEtat(err.message === "404" ? "sans-fiche" : "erreur");
      });
  }, [idUtilisateur]);

  // Les catégories dépendent des données : aucune colonne en base aujourd'hui.
  const categories = ["all", ...new Set(prestations.map((p) => p.categorie).filter(Boolean))];
  // Filtrage combiné (catégorie + texte de recherche)
  const filteredPrestations = useMemo(() => {
    return prestations.filter((p) => {
      const matchCategory = selectedCategory === "all" || p.categorie === selectedCategory;
      const matchSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [prestations, selectedCategory, searchTerm]);
  // Basculer la visibilité d'une prestation en ligne
  const handleToggleOnline = (id) => {
    setPrestations((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enLigne: !p.enLigne } : p))
    );
    showToast("Visibilité modifiée à l'écran seulement : rien n'est écrit en base.");
  };
  // Supprimer une prestation
  const handleDelete = (id, nom) => {
    if (window.confirm(`Voulez-vous vraiment supprimer la prestation "${nom}" ?`)) {
      setPrestations((prev) => prev.filter((p) => p.id !== id));
      showToast(`"${nom}" retirée de l'affichage : la ligne en base est toujours là.`);
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
      categorie: "",
      duree: "30 min",
      prix: "",
      description: "",
    });
    showToast(`"${created.nom}" ajoutée à l'affichage : non enregistrée en base.`);
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
      {/* ETAT DU CATALOGUE */}
      {etat === "chargement" && (
        <div className="readonly-banner">Chargement du catalogue depuis la base…</div>
      )}
      {etat === "aucun-compte" && (
        <div className="readonly-banner is-error">
          Aucun compte artisan identifié : reconnecte-toi pour charger ton catalogue.
        </div>
      )}
      {etat === "erreur" && (
        <div className="readonly-banner is-error">
          Catalogue inaccessible : le backend V2 ne répond pas sur la route « pro ».
        </div>
      )}
      {etat === "sans-fiche" && (
        <div className="readonly-banner is-error">
          Ce compte n’a pas de fiche artisan associée : il n’a pas de catalogue à gérer.
        </div>
      )}
      {etat === "ok" && (
        <div className="readonly-banner">
          Catalogue chargé depuis la base. Les actions d’écriture ne sont pas encore
          branchées : elles modifient l’affichage, pas la table prestations.
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
          disabled
          title="Écriture en base non disponible : la route d'ajout reste à créer"
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
                  {prestations.length > 0
                    ? "Aucune prestation ne correspond à vos critères de recherche."
                    : "Aucune prestation enregistrée pour ce compte artisan."}
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
                    <span className="badge-cat">{p.categorie ?? "—"}</span>
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
                      disabled
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
                      disabled
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
                    {categories.filter((cat) => cat !== "all").map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
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
                <button type="submit" className="btn-save" disabled>
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