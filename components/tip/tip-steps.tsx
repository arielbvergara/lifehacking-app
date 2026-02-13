import type { TipStep } from '@/lib/types/api';

/**
 * TipStepsProps Interface
 * 
 * Props for the TipSteps component.
 */
interface TipStepsProps {
  steps: TipStep[];
}

/**
 * TipSteps Component
 * 
 * Displays step-by-step instructions for a tip with numbered badges.
 * Each step is rendered in a card with hover effects.
 * 
 * Features:
 * - Section heading with icon ("Easy Steps")
 * - Numbered circular badges for each step
 * - Card layout with border and shadow
 * - Hover effects (border color change)
 * - Responsive padding and spacing
 * - Returns null if no steps provided
 * 
 * @example
 * <TipSteps
 *   steps={[
 *     { stepNumber: 1, description: "First, gather your materials" },
 *     { stepNumber: 2, description: "Next, follow these instructions" }
 *   ]}
 * />
 */

export function TipSteps({ steps }: TipStepsProps) {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 mb-16">
      <div className="flex items-center gap-3 mb-6">
        {/* <span className="material-icons text-primary text-3xl">list_alt</span> */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Easy Steps
        </h2>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.stepNumber}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 transition-colors hover:border-primary/50"
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg transition-colors group-hover:bg-primary group-hover:text-white">
                  {step.stepNumber}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
