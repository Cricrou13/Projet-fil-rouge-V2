import "./Testimonials.scss";

export default function Testimonials() {
  const reviews = [
    {
      stars: "★★★★★",
      text: "« J'ai pu réserver un artisan en 2 minutes un dimanche soir pour une intervention le lendemain. Tout s'est déroulé à la perfection ! »",
      author: "Claire P.",
      role: "Particulier (Toulouse)",
      initials: "CP",
    },
    {
      stars: "★★★★★",
      text: "« En tant qu'artisan, je n'ai plus besoin de gérer mon agenda le soir au téléphone. Mes clients réservent en direct, un gain de temps inestimable. »",
      author: "M. Avaro",
      role: "Artisan Coiffeur Barbier",
      initials: "MA",
    },
    {
      stars: "★★★★★",
      text: "« Les rappels par SMS et email ont réduit de 80% les rendez-vous oubliés. Une interface claire, fluide et indispensable. »",
      author: "Jean-Luc J.",
      role: "Entrepreneur BTP (Blagnac)",
      initials: "JL",
    },
  ];

  return (
    <section className="testimonials-section">
      <div className="testimonials-section__container">
        <div className="testimonials-section__header">
          <span className="section-tag">Témoignages</span>
          <h1>Ils utilisent InfinTime au quotidien</h1>
          <p>Découvrez les retours de nos clients particuliers et de nos entrepreneurs partenaires.</p>
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
