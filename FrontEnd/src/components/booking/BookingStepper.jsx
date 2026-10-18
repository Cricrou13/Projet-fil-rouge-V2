import "./BookingStepper.scss";

const steps = ["Services", "Date/heure", "Validation"];

export default function BookingStepper({ currentStep }) {
  return (
    <div className="booking-stepper">
      {steps.map((label, i) => (
        <div key={label} className={`step ${i + 1 === currentStep ? "active" : ""} ${i + 1 < currentStep ? "done" : ""}`}>
          <span className="step-number">{i + 1}</span>
          <span className="step-label">{label}</span>
        </div>
      ))}
    </div>
  );
}