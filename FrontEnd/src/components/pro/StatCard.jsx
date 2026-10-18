export default function StatCard({ title, value, subtitle, type }) {

  const renderIcon = () => {
    if (type === "positive" && title === "Clients") return "🟢 ";
    if (type === "positive") return "▲ ";
    if (type === "warning") return "★ ";
    return "";
  };

  return (
    <div className="stat-card">
      <span className="stat-card__title">{title}</span>
      <span className="stat-card__value">{value}</span>
      <div className={`stat-card__subtitle stat-card__subtitle--${type}`}>
        {renderIcon()}
        {subtitle}
      </div>
    </div>
  );
}