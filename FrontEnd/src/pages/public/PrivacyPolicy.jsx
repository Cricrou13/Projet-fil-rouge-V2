import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Database, 
  Lock, 
  UserCheck, 
  Clock, 
  Mail, 
  FileText, 
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import "./PrivacyPolicy.scss";
export default function PrivacyPolicy() {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        {/* LIEN RETOUR & EN-TÊTE */}
        <div className="privacy-top-bar">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            <span>Retour à l'accueil</span>
          </Link>
          <span className="last-updated">Dernière mise à jour : Septembre 2026</span>
        </div>
        <header className="privacy-header">
          <div className="privacy-header-badge">
            <ShieldCheck size={28} />
          </div>
          <h1>Politique de Protection des Données Personnelles</h1>
          <p>
            Chez <strong>InfinTime</strong>, la protection de votre vie privée et la sécurité de vos données personnelles sont au cœur de nos engagements, conformément au RGPD (Règlement UE 2016/679) et à la loi Informatique et Libertés.
          </p>
        </header>
        {/* SOMMAIRE RAPIDE */}
        <nav className="privacy-toc" aria-label="Sommaire">
          <h3>Sommaire rapide</h3>
          <div className="toc-grid">
            <a href="#responsable">1. Responsable de traitement</a>
            <a href="#collecte">2. Données collectées</a>
            <a href="#finalites">3. Finalités des données</a>
            <a href="#conservation">4. Durées de conservation</a>
            <a href="#droits">5. Vos droits (RGPD)</a>
            <a href="#securite">6. Sécurité & Hébergement</a>
          </div>
        </nav>
        {/* CONTENU PRINCIPAL */}
        <div className="privacy-content">
          {/* SECTION 1 */}
          <section id="responsable" className="privacy-section">
            <div className="section-title">
              <span className="section-number">1</span>
              <h2>Responsable du traitement</h2>
            </div>
            <p>
              Les données personnelles collectées sur la plateforme <strong>InfinTime</strong> sont traitées par la société éditrice :
            </p>
            <div className="info-box">
              <p><strong>InfinTime SAS</strong> (Société par Actions Simplifiée)</p>
              <p>Capital social : 10 000 € · SIREN : 912 345 678</p>
              <p>Siège social : 12 Avenue des Métiers, 31000 Toulouse, France</p>
              <p>Délégué à la Protection des Données (DPO) : <code>dpo@inftime.fr</code></p>
            </div>
          </section>
          {/* SECTION 2 */}
          <section id="collecte" className="privacy-section">
            <div className="section-title">
              <span className="section-number">2</span>
              <h2>Quelles données collectons-nous ?</h2>
            </div>
            <p>
              Nous veillons à appliquer le principe de <strong>minimisation des données</strong> : seules les informations strictement nécessaires à la réservation ou à la gestion d'activité sont demandées.
            </p>
            <div className="data-cards-grid">
              <div className="data-card">
                <div className="card-badge client-badge">Espace Clients</div>
                <h4>Pour les particuliers</h4>
                <ul>
                  <li><strong>Identité :</strong> Nom, prénom.</li>
                  <li><strong>Contact :</strong> Adresse email, numéro de téléphone.</li>
                  <li><strong>Réservations :</strong> Date, heure, prestation choisie, nom de l'artisan.</li>
                  <li><strong>Interventions à domicile :</strong> Adresse postale (si demandée par la prestation).</li>
                  <li><strong>Avis :</strong> Notes et commentaires laissés après prestation.</li>
                </ul>
              </div>
              <div className="data-card">
                <div className="card-badge pro-badge">Espace Professionnels</div>
                <h4>Pour les artisans & indépendants</h4>
                <ul>
                  <li><strong>Entreprise :</strong> Raison sociale, SIRET, métier / catégorie.</li>
                  <li><strong>Gérant :</strong> Nom, prénom, email, téléphone professionnel.</li>
                  <li><strong>Activité :</strong> Prestations proposées, grille tarifaire, planning de disponibilité.</li>
                  <li><strong>Devis :</strong> Détails des devis émis et échanges clients.</li>
                </ul>
              </div>
            </div>
          </section>
          {/* SECTION 3 */}
          <section id="finalites" className="privacy-section">
            <div className="section-title">
              <span className="section-number">3</span>
              <h2>Finalités et bases légales</h2>
            </div>
            <p>Vos données sont traitées pour des objectifs précis et justifiés :</p>
            <div className="table-responsive">
              <table className="privacy-table">
                <thead>
                  <tr>
                    <th>Finalité</th>
                    <th>Données concernées</th>
                    <th>Base légale</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Prise de RDV & Mise en relation</strong></td>
                    <td>Identité, contact, prestation choisie</td>
                    <td>Exécution du contrat / service</td>
                  </tr>
                  <tr>
                    <td><strong>Rappels de rendez-vous (SMS / Email)</strong></td>
                    <td>Email, numéro de mobile</td>
                    <td>Intérêt légitime (réduction des oublis)</td>
                  </tr>
                  <tr>
                    <td><strong>Demande de devis travaux</strong></td>
                    <td>Coordonnées, description du projet</td>
                    <td>Exécution de mesures précontractuelles</td>
                  </tr>
                  <tr>
                    <td><strong>Sécurité des comptes & Facturation</strong></td>
                    <td>Mots de passe chiffrés, SIRET, factures</td>
                    <td>Obligation légale & comptable</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          {/* SECTION 4 */}
          <section id="conservation" className="privacy-section">
            <div className="section-title">
              <span className="section-number">4</span>
              <h2>Durée de conservation des données</h2>
            </div>
            <p>
              Vos données ne sont jamais conservées au-delà de la durée nécessaire aux finalités pour lesquelles elles ont été collectées :
            </p>
            <div className="timeline-list">
              <div className="timeline-item">
                <Clock size={20} className="timeline-icon" />
                <div className="timeline-text">
                  <strong>Comptes clients inactifs :</strong>
                  <p>Suppression automatique 3 ans après la dernière activité ou réservation.</p>
                </div>
              </div>
              <div className="timeline-item">
                <Clock size={20} className="timeline-icon" />
                <div className="timeline-text">
                  <strong>Historique des rendez-vous :</strong>
                  <p>Conservé 2 ans dans l'espace client à des fins d'historique et de facturation.</p>
                </div>
              </div>
              <div className="timeline-item">
                <Clock size={20} className="timeline-icon" />
                <div className="timeline-text">
                  <strong>Documents légaux et devis :</strong>
                  <p>Conservés 5 à 10 ans selon les obligations comptables et fiscales françaises.</p>
                </div>
              </div>
            </div>
          </section>
          {/* SECTION 5 */}
          <section id="droits" className="privacy-section">
            <div className="section-title">
              <span className="section-number">5</span>
              <h2>Vos droits et comment les exercer</h2>
            </div>
            <p>Conformément au RGPD, vous disposez des droits suivants sur vos données :</p>
            <div className="rights-grid">
              <div className="right-item">
                <UserCheck size={20} />
                <div>
                  <strong>Droit d'accès & de rectification</strong>
                  <p>Consultez ou modifiez vos données à tout moment depuis votre compte.</p>
                </div>
              </div>
              <div className="right-item">
                <FileText size={20} />
                <div>
                  <strong>Droit à l'effacement (droit à l'oubli)</strong>
                  <p>Demandez la suppression complète de vos données personnelles.</p>
                </div>
              </div>
              <div className="right-item">
                <Database size={20} />
                <div>
                  <strong>Droit à la portabilité</strong>
                  <p>Exportez vos rendez-vous et données dans un format standard (JSON/CSV).</p>
                </div>
              </div>
              <div className="right-item">
                <Lock size={20} />
                <div>
                  <strong>Droit d'opposition</strong>
                  <p>Refusez les communications de service non obligatoires à tout instant.</p>
                </div>
              </div>
            </div>
            {/* ENCART CONTACT DPO */}
            <div className="contact-dpo-box">
              <h4>Exercer vos droits auprès de notre DPO</h4>
              <p>Pour toute question ou demande de suppression, écrivez-nous simplement :</p>
              <div className="dpo-contact-links">
                <a href="mailto:dpo@inftime.fr" className="btn-dpo-email">
                  <Mail size={16} />
                  <span>Contacter le DPO (dpo@inftime.fr)</span>
                </a>
                <a 
                  href="https://www.cnil.fr" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="cnil-link"
                >
                  <span>En savoir plus sur cnil.fr</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </section>
          {/* SECTION 6 */}
          <section id="securite" className="privacy-section">
            <div className="section-title">
              <span className="section-number">6</span>
              <h2>Sécurité et Hébergement</h2>
            </div>
            <p>
              Nous appliquons des mesures techniques rigoureuses pour garantir la sécurité et la confidentialité de vos échanges :
            </p>
            <ul className="security-list">
              <li>🔒 <strong>Chiffrement TLS / HTTPS :</strong> Toutes les communications entre votre navigateur et notre plateforme sont chiffrées en SSL 256 bits.</li>
              <li>🔑 <strong>Hachage des mots de passe :</strong> Aucun mot de passe n'est stocké en clair (utilisation d'algorithmes sécurisés comme bcrypt).</li>
              <li>🇪🇺 <strong>Hébergement 100% Union Européenne :</strong> Nos serveurs et bases de données sont situés en France et en Allemagne, soumis à la juridiction stricte de l'UE (aucun transfert hors UE non encadré).</li>
              <li>🚫 <strong>Aucune revente de données :</strong> Vos données ne sont jamais vendues, louées ni cédées à des régies publicitaires tierces.</li>
            </ul>
          </section>
        </div>
        {/* PIED DE PAGE INTERNE */}
        <div className="privacy-footer-cta">
          <p>Une question spécifique sur la gestion de vos données ?</p>
          <Link to="/contact" className="btn-contact-us">
            Nous envoyer un message
          </Link>
        </div>
      </div>
    </div>
  );
}