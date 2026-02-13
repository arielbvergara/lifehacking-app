'use client';

export interface CategoryTagsProps {
  tags: string[];
  onTagClick?: (tag: string) => void;
}

/**
 * CategoryTags Component
 * 
 * Displays popular category hashtags. Currently non-functional
 * placeholders for future filtering implementation.
 * 
 * @example
 * <CategoryTags tags={['kitchenhacks', 'organization', 'wellness']} />
 */
export function CategoryTags({ tags, onTagClick }: CategoryTagsProps) {
  const handleTagClick = (tag: string) => {
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-sm md:text-base">
      <span className="text-gray-600 font-medium">Popular:</span>
      {tags.map((tag, index) => (
        <button
          key={`${tag}-${index}`}
          onClick={() => handleTagClick(tag)}
          className="text-gray-600 hover:text-primary transition-colors focus:outline-none focus:underline"
          type="button"
        >
          #{tag.toLowerCase().replace(/\s+/g, '')}
        </button>
      ))}
    </div>
  );
}
