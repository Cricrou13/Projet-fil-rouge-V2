import { useState } from "react";
import { MailOpen, User, Briefcase } from "lucide-react";
import "./Devis.scss";

// Adresse publiée dans les mentions légales (LegalNotice.jsx:52).
const EMAIL_CONTACT = "contact@inftime.fr";

export default function Devis() {
  const [userType, setUserType] = useState("particulier");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  // « prêt » et non « envoyé » : le BackEnd V2 n'a aucune route d'écriture pour
  // les devis, donc cette étape rédige la demande, elle ne la transmet pas.
  const [resumePret, setResumePret] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = (e) => {
    // Le navigateur n'appelle cet handler que si les trois champs `required`
    // sont remplis : le résumé est donc toujours bâti sur une demande complète.
    e.preventDefault();
    setResumePret(true);
  };
  const profil = userType === "pro" ? "Artisan / professionnel" : "Particulier";
  const hrefEnvoi =
    `mailto:${EMAIL_CONTACT}` +
    `?subject=${encodeURIComponent(`Demande de devis — ${formData.name}`)}` +
    `&body=${encodeURIComponent(
      `Profil : ${profil}\n\n${formData.message}\n\n—\n${formData.name} (${formData.email})`,
    )}`;
  return (
    <div className="devis-page">
      <div className="devis-container">
        <div className="devis-header">
          <span className="devis-tag">📄 Demande de devis gratuit</span>
          <h1 className="devis-title">
            Un projet de travaux ? Demandez un devis.
          </h1>
          <p className="devis-subtitle">
            Décrivez votre projet sans engagement, nos artisans partenaires vous
            répondent sous 24h.
          </p>
        </div>
        <div className="devis-card">
          {resumePret ? (
            <div className="devis-envoi">
              <MailOpen size={48} className="devis-envoi__icon" />
              <h3>Votre demande est prête : il reste à l'envoyer.</h3>
              <p>
                Merci <strong>{formData.name}</strong>. Rien n'a encore été
                transmis ni enregistré : InfinTime n'a pas de serveur qui
                stocke ces demandes. Le bouton ci-dessous ouvre votre logiciel
                de messagerie avec le message déjà rédigé pour{" "}
                <strong>{EMAIL_CONTACT}</strong>.
              </p>
              <div className="devis-envoi__actions">
                <a className="devis-submit-btn" href={hrefEnvoi}>
                  <span>Ouvrir ma messagerie</span>
                </a>
                <button
                  type="button"
                  className="btn-reset"
                  onClick={() => setResumePret(false)}
                >
                  Modifier ma demande
                </button>
              </div>
            </div>
          ) : (
            <form className="devis-form" onSubmit={handleSubmit}>
              <div className="devis-type-selector">
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
              {/* Ligne 2 : Description du projet */}
              <div className="form-group">
                <label htmlFor="message">
                  Description de vos travaux ou de votre besoin
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Ex: Terrassement pour piscine 8x4m avec évacuation des terres sur Blagnac, délai souhaité dans 2 mois..."
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="devis-submit-btn">
                <span>Préparer ma demande de devis</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}