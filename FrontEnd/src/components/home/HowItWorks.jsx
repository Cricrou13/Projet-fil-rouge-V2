import { Search, Calendar, MailOpen } from "lucide-react";
import "./HowItWorks.scss";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: <Search size={28} />,
      title: "Recherchez le bon pro",
      description: "Filtrez selon le corps de métier et la localisation, puis consultez les prestations publiées par le professionnel.",
    },
    {
      num: "02",
      icon: <Calendar size={28} />,
      title: "Choisissez votre créneau",
      description: "Indiquez la date et l'horaire souhaités dans le tunnel. Les créneaux proposés sont des exemples : l'agenda réel n'est pas encore connecté.",
    },
    {
      num: "03",
      icon: <MailOpen size={28} />,
      title: "Envoyez votre demande",
      description: "Rien n'est enregistré : InfinTime rédige la demande et l'ouvre dans votre messagerie, à vous de l'envoyer.",
    },
  ];

  return (
    <section className="how-it-works">
      <div className="how-it-works__header">
        <span className="section-tag">Simplicité & Rapidité</span>
        <h2>Demander un artisan en 3 étapes</h2>
        <p>InfinTime modernise et simplifie vos démarches avec les professionnels et artisans.</p>
      </div>

      <div className="how-it-works__grid">
        {steps.map((step, idx) => (
          <div key={idx} className="step-card">
            <span className="step-card__number">{step.num}</span>
            <div className="step-card__icon">{step.icon}</div>
            <h3 className="step-card__title">{step.title}</h3>
            <p className="step-card__description">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
