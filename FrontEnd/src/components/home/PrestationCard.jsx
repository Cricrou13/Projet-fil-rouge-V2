import "./PrestationCard.scss";

export default function PrestationCard({ prestation }) {
  return (
    <div className="prestation-card">
      <h4>{prestation.nom}</h4>
      <p>{prestation.duree}</p>
      <span>{prestation.prix}</span>
    </div>
  );
}