import "./StatsBanner.scss";

export default function StatsBanner() {
  const stats = [
    { value: "Par métier", label: "Recherche dans les fiches publiées" },
    { value: "Par email", label: "Votre demande transmise" },
    { value: "Aucun avis", label: "Aucune note publiée pour l'instant" },
    { value: "100%", label: "Gratuit pour les clients" },
  ];

  return (
    <section className="stats-banner">
      <div className="stats-banner__container">
        {stats.map((stat, idx) => (
          <div key={idx} className="stats-banner__item">
            <span className="stats-banner__value">{stat.value}</span>
            <span className="stats-banner__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
