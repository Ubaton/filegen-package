import { Check } from "lucide-react";

interface StepsProps {
  currentStep: number;
}

const steps = [
  { number: 1, title: "Choose Service" },
  { number: 2, title: "Select Time" },
  { number: 3, title: "Confirm Booking" },
];

export function Steps({ currentStep }: StepsProps) {
  return (
    <div className="flex justify-center">
      <ol className="flex items-center w-full max-w-2xl">
        {steps.map((step, i) => (
          <li
            key={step.number}
            className={`flex items-center ${
              i < steps.length - 1
                ? "w-full"
                : "flex-1"
            }`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step.number <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {step.number < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <span className="text-sm mt-2">{step.title}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-full h-0.5 mx-2 ${
                  step.number < currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}