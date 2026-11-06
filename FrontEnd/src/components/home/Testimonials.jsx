import "./Testimonials.scss";

export default function Testimonials() {
  const reviews = [
    {
      stars: "★★★★★",
      text: "« J'ai cherché un plombier près de chez moi, rempli la demande — prestation, créneau souhaité, coordonnées — puis je l'ai envoyée par email depuis ma messagerie. »",
      author: "Claire P.",
      role: "Particulier (Toulouse)",
      initials: "CP",
    },
    {
      stars: "★★★★★",
      text: "« Côté atelier, je publie mes prestations et mes tarifs, et mon tableau de bord lit les rendez-vous et les devis enregistrés pour mon établissement. »",
      author: "M. Avaro",
      role: "Artisan Coiffeur Barbier",
      initials: "MA",
    },
    {
      stars: "★★★★★",
      text: "« L'interface est claire et fluide : on choisit la prestation, le créneau, puis la demande part par email en quelques minutes. »",
      author: "Jean-Luc J.",
      role: "Entrepreneur BTP (Blagnac)",
      initials: "JL",
    },
  ];

  return (
    <section className="testimonials-section">
      <div className="testimonials-section__container">
        <div className="testimonials-section__header">
          <span className="section-tag">Témoignages — exemples de démonstration</span>
          <h2>Ce que l'on veut vous simplifier</h2>
          <p>
            Trois retours fictifs, écrits pour illustrer l'usage : InfinTime n'a
            pas encore de client ni d'artisan utilisateur réel.
          </p>
        </div>

        <div className="testimonials-grid">
          {reviews.map((rev, idx) => (
            <div key={idx} className="testimonial-card">
              <div className="testimonial-card__stars">{rev.stars}</div>
              <p className="testimonial-card__quote">{rev.text}</p>
              <div className="testimonial-card__author">
                <div className="author-avatar">{rev.initials}</div>
                <div>
                  <h2 className="author-name">{rev.author}</h2>
                  <span className="author-role">{rev.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
