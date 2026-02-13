import Link from 'next/link';

/**
 * BreadcrumbItem Interface
 * 
 * Represents a single item in the breadcrumb navigation.
 * Items without href are treated as the current page.
 */
export interface BreadcrumbItem {
  label: string;
  href?: string; // undefined for current page
}

/**
 * BreadcrumbProps Interface
 * 
 * Props for the Breadcrumb component.
 */
export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb Component
 * 
 * Provides hierarchical navigation showing user's current location.
 * Uses semantic HTML with proper ARIA labels for accessibility.
 * Responsive design with truncation on mobile devices.
 * 
 * @example
 * <Breadcrumb
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Kitchen', href: '/category/kitchen-id' },
 *     { label: 'Peel Garlic in 10 Seconds' } // current page
 *   ]}
 * />
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="w-full">
      <ol className="flex items-center flex-wrap gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-center">
              {/* Separator (chevron) - not shown before first item */}
              {!isFirst && (
                <span className="material-icons-round text-gray-400 mx-2 text-lg">
                  chevron_right
                </span>
              )}

              {/* Breadcrumb item */}
              {isLast ? (
                // Current page - not clickable
                <span
                  aria-current="page"
                  className="text-gray-800 font-medium truncate max-w-[150px] md:max-w-none"
                >
                  {item.label}
                </span>
              ) : (
                // Clickable link
                <Link
                  href={item.href || '#'}
                  className="text-gray-600 hover:text-primary transition-colors truncate max-w-[100px] md:max-w-none"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
