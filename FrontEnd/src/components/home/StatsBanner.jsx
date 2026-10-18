import "./StatsBanner.scss";

export default function StatsBanner() {
  const stats = [
    { value: "+1 200", label: "Entrepreneurs inscrits" },
    { value: "24h / 7j", label: "Réservation en ligne instantanée" },
    { value: "4.9 / 5", label: "Note moyenne certifiée" },
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
