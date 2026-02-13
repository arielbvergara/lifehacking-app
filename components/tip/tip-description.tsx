/**
 * TipDescriptionProps Interface
 * 
 * Props for the TipDescription component.
 */
interface TipDescriptionProps {
  description: string;
}

/**
 * TipDescription Component
 * 
 * Displays the tip description with proper typography and formatting.
 * Preserves line breaks from the API and handles long text gracefully.
 * 
 * Features:
 * - Responsive text sizing (xl on desktop)
 * - Relaxed line height for readability
 * - Max width constraint (prose) for optimal reading
 * - Preserves whitespace and line breaks
 * 
 * @example
 * <TipDescription
 *   description="This is a simple life hack that will save you time in the kitchen."
 * />
 */

export function TipDescription({ description }: TipDescriptionProps) {
  return (
    <section className="mt-8 mb-12">
      <p className="text-xl leading-relaxed text-gray-600 max-w-prose whitespace-pre-wrap">
        {description}
      </p>
    </section>
  );
}
