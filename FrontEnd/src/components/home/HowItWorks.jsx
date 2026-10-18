import { Search, Calendar, CheckCircle2 } from "lucide-react";
import "./HowItWorks.scss";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: <Search size={28} />,
      title: "Recherchez le bon pro",
      description: "Filtrez selon le corps de métier, votre localisation et consultez les avis certifiés laissés par les clients.",
    },
    {
      num: "02",
      icon: <Calendar size={28} />,
      title: "Choisissez votre créneau",
      description: "Accédez en temps réel au calendrier de l'artisan et réservez l'horaire précis qui s'adapte à votre emploi du temps.",
    },
    {
      num: "03",
      icon: <CheckCircle2 size={28} />,
      title: "Confirmation & Rappels",
      description: "Votre réservation est confirmée immédiatement. Vous recevez des rappels pour ne pas oublier votre rendez-vous.",
    },
  ];

  return (
    <section className="how-it-works">
      <div className="how-it-works__header">
        <span className="section-tag">Simplicité & Rapidité</span>
        <h2>La prise de rendez-vous en 3 étapes simples</h2>
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
