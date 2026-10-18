import { useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle2, User, Briefcase, FileText } from "lucide-react";
import "./ContactPro.scss";
export default function Contact() {
  const location = useLocation();
  // Vérifie si l'URL est /devis
  const isDevis = location.pathname.includes("devis");
  const [userType, setUserType] = useState("particulier");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };
  return (
    <div className="contact-page">
      <div className="contact-container">
        
        {/* En-tête dynamique selon la page */}
        <div className="contact-header">
          <span className="contact-tag">
            {isDevis ? "📄 Demande de devis gratuit" : "Contact"}
          </span>
          <h1 className="contact-title">
            {isDevis
              ? "Un projet de travaux ? Demandez un devis."
              : "Un projet en tête ? Discutons-en."}
          </h1>
          <p className="contact-subtitle">
            {isDevis
              ? "Décrivez votre projet sans engagement, nos artisans partenaires vous répondent sous 24h."
              : "Remplissez ce formulaire, notre équipe vous répond rapidement."}
          </p>
        </div>
        {/* Carte de formulaire */}
        <div className="contact-card">
          {isSubmitted ? (
            <div className="contact-success">
              <CheckCircle2 size={48} className="success-icon" />
              <h3>
                {isDevis
                  ? "Votre demande de devis a bien été envoyée !"
                  : "Message envoyé avec succès !"}
              </h3>
              <p>
                Merci <strong>{formData.name}</strong>, nous vous contacterons à l'adresse <strong>{formData.email}</strong> dans les plus brefs délais.
              </p>
              <button 
                type="button" 
                className="btn-reset" 
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ name: "", email: "", message: "" });
                }}
              >
                {isDevis ? "Faire une autre demande" : "Envoyer un autre message"}
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              
              {/* Sélecteur de profil (masqué si devis particulier, ou accessible) */}
              <div className="contact-type-selector">
                <button
                  type="button"
                  className={`type-btn ${userType === "particulier" ? "active" : ""}`}
                  onClick={() => setUserType("particulier")}
                >
                  <User size={16} />
                  <span>Je suis un particulier</span>
                </button>
                <button
                  type="button"
                  className={`type-btn ${userType === "pro" ? "active" : ""}`}
                  onClick={() => setUserType("pro")}
                >
                  <Briefcase size={16} />
                  <span>Je suis un artisan / pro</span>
                </button>
              </div>
              {/* Ligne 1 : Nom et Email */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Votre nom et prénom</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    required
                    placeholder="Ex: Jean Dupont"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Votre adresse email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    placeholder="Ex: jean@mail.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              {/* Ligne 2 : Message / Description du projet */}
              <div className="form-group">
                <label htmlFor="message">
                  {isDevis ? "Description de vos travaux ou de votre besoin" : "Votre message"}
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder={
                    isDevis
                      ? "Ex: Terrassement pour piscine 8x4m avec évacuation des terres sur Blagnac, délai souhaité dans 2 mois..."
                      : "Ex: Bonjour, j'aimerais des précisions concernant une réservation..."
                  }
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="contact-submit-btn">
                <span>
                  {isDevis ? "🚀 Envoyer ma demande de devis" : "🚀 Envoyer le message"}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}