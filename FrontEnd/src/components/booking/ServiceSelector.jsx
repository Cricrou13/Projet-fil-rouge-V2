import "./ServiceSelector.scss";

export default function ServiceSelector({ services, selected, onSelect }) {
  return (
    <div className="service-selector" role="radiogroup" aria-label="Choisir une prestation">
      {services.map((service) => (
        <label
          key={service.id}
          className={`service-option ${selected?.id === service.id ? "selected" : ""}`}
        >
          <input
            type="radio"
            name="service"
            checked={selected?.id === service.id}
            onChange={() => onSelect(service)}
          />
          <span className="service-option-radio" aria-hidden="true"></span>
          <span className="service-option-name">{service.nom}</span>
          <span className="service-option-duree">{service.duree}</span>
          <span className="service-option-prix">{service.prix}€</span>
        </label>
      ))}
    </div>
  );
}