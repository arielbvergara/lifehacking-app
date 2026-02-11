'use client';

export interface CategoryTagsProps {
  tags: string[];
  onTagClick?: (tag: string) => void;
}

/**
 * CategoryTags Component
 * 
 * Displays a collection of category filter badges. Currently non-functional
 * placeholders for future filtering implementation.
 * 
 * @example
 * <CategoryTags tags={['Popular', 'Recommended', 'Automotive']} />
 */
export function CategoryTags({ tags, onTagClick }: CategoryTagsProps) {
  const handleTagClick = (tag: string) => {
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <button
          key={`${tag}-${index}`}
          onClick={() => handleTagClick(tag)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-primary hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          type="button"
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
