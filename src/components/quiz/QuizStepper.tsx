import { Check } from 'lucide-react';

interface QuizStepperProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

const QuizStepper = ({ currentStep, totalSteps, stepTitles }: QuizStepperProps) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center flex-1">
            {/* Step circle */}
            <div className="relative flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  index < currentStep
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/30'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`absolute -bottom-6 text-xs whitespace-nowrap ${
                  index === currentStep ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {stepTitles[index]}
              </span>
            </div>

            {/* Connector line */}
            {index < totalSteps - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                  index < currentStep ? 'bg-green-500' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizStepper;
