import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, ShieldCheck, MessageSquare } from "lucide-react";
import "./PageContact.scss";

// Adresses déjà publiées dans les mentions légales et la politique de
// confidentialité : rien ici n'est inventé.
const EMAIL_CONTACT = "contact@inftime.fr";
const EMAIL_DPO = "dpo@inftime.fr";

export default function PageContact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const estComplet =
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.message.trim() !== "";

  // Le BackEnd V2 n'a aucune route d'écriture pour les messages libres. Un
  // `onSubmit` qui afficherait « Message envoyé avec succès ! » serait donc une
  // confirmation mensongère : le lien mailto remet le message au logiciel de
  // messagerie de l'utilisateur et rien n'est prétendu parti du site.
  const hrefMessage =
    `mailto:${EMAIL_CONTACT}` +
    `?subject=${encodeURIComponent(`Demande de contact — ${form.name.trim()}`)}` +
    `&body=${encodeURIComponent(
      `${form.message.trim()}\n\n—\n${form.name.trim()} (${form.email.trim()})`,
    )}`;

  return (
    <div className="page-contact">
      <div className="page-contact__container">
        <div className="page-contact__header">
          <span className="page-contact__tag">Contact</span>
          <h1 className="page-contact__title">Une question ? Écrivez-nous.</h1>
          <p className="page-contact__subtitle">
            Compte, réservation, partenaire à signaler : cette page est le bon
            point d'entrée. Un projet de travaux à chiffrer se passe sur le
            formulaire de devis.
          </p>
        </div>

        <div className="page-contact__coordonnees">
          <a className="page-contact__carte" href={`mailto:${EMAIL_CONTACT}`}>
            <Mail size={18} aria-hidden="true" />
            <span className="page-contact__carte-label">Équipe InfinTime</span>
            <span className="page-contact__carte-valeur">{EMAIL_CONTACT}</span>
          </a>
          <a className="page-contact__carte" href={`mailto:${EMAIL_DPO}`}>
            <ShieldCheck size={18} aria-hidden="true" />
            <span className="page-contact__carte-label">Données personnelles</span>
            <span className="page-contact__carte-valeur">{EMAIL_DPO}</span>
          </a>
          <div className="page-contact__carte page-contact__carte--statique">
            <MapPin size={18} aria-hidden="true" />
            <span className="page-contact__carte-label">Siège social</span>
            <span className="page-contact__carte-valeur">
              12 Avenue des Métiers, 31000 Toulouse
            </span>
          </div>
        </div>

        <div className="page-contact__card">
          <div className="page-contact__form">
            <div className="page-contact__row">
              <div className="page-contact__group">
                <label htmlFor="name">Votre nom et prénom</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Ex : Jean Dupont"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div className="page-contact__group">
                <label htmlFor="email">Votre adresse email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Ex : jean@mail.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="page-contact__group">
              <label htmlFor="message">Votre message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Ex : Bonjour, je n'arrive pas à annuler un rendez-vous confirmé la semaine dernière."
                value={form.message}
                onChange={handleChange}
              />
            </div>
            {estComplet ? (
              <a className="page-contact__envoi" href={hrefMessage}>
                <MessageSquare size={16} aria-hidden="true" />
                <span>Envoyer avec ma messagerie</span>
              </a>
            ) : (
              <div className="page-contact__action">
                <button
                  type="button"
                  className="page-contact__envoi page-contact__envoi--inerte"
                  disabled
                >
                  <MessageSquare size={16} aria-hidden="true" />
                  <span>Envoyer avec ma messagerie</span>
                </button>
                <p className="page-contact__aide">
                  Renseignez les trois champs ci-dessus pour activer l'envoi.
                </p>
              </div>
            )}
            <p className="page-contact__mention">
              Votre logiciel de messagerie s'ouvre avec le message pré-rempli :
              InfinTime n'envoie encore rien depuis son serveur, aucune route
              d'écriture de message n'existe à ce jour.
            </p>
          </div>
        </div>

        <p className="page-contact__devis">
          Un projet de travaux ?{" "}
          <Link to="/devis">Demander un devis gratuit</Link>
        </p>
      </div>
    </div>
  );
}
