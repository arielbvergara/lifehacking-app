import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CategoryTags } from './category-tags';

describe('CategoryTags', () => {
  const defaultTags = ['Popular', 'Recommended', 'Automotive', 'Fashion'];

  it('should render all provided tags', () => {
    render(<CategoryTags tags={defaultTags} />);

    defaultTags.forEach(tag => {
      expect(screen.getByRole('button', { name: tag })).toBeInTheDocument();
    });
  });

  it('should render empty when no tags provided', () => {
    const { container } = render(<CategoryTags tags={[]} />);

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(0);
  });

  it('should render single tag', () => {
    render(<CategoryTags tags={['Kitchen']} />);

    expect(screen.getByRole('button', { name: 'Kitchen' })).toBeInTheDocument();
  });

  it('should call onTagClick with correct tag when clicked', async () => {
    const user = userEvent.setup();
    const handleTagClick = vi.fn();
    render(<CategoryTags tags={defaultTags} onTagClick={handleTagClick} />);

    const popularButton = screen.getByRole('button', { name: 'Popular' });
    await user.click(popularButton);

    expect(handleTagClick).toHaveBeenCalledWith('Popular');
    expect(handleTagClick).toHaveBeenCalledTimes(1);
  });

  it('should call onTagClick for each different tag clicked', async () => {
    const user = userEvent.setup();
    const handleTagClick = vi.fn();
    render(<CategoryTags tags={defaultTags} onTagClick={handleTagClick} />);

    await user.click(screen.getByRole('button', { name: 'Popular' }));
    await user.click(screen.getByRole('button', { name: 'Automotive' }));

    expect(handleTagClick).toHaveBeenCalledTimes(2);
    expect(handleTagClick).toHaveBeenNthCalledWith(1, 'Popular');
    expect(handleTagClick).toHaveBeenNthCalledWith(2, 'Automotive');
  });

  it('should not throw error when onTagClick is not provided', async () => {
    const user = userEvent.setup();
    render(<CategoryTags tags={defaultTags} />);

    const button = screen.getByRole('button', { name: 'Popular' });
    
    // Should not throw
    await expect(user.click(button)).resolves.not.toThrow();
  });

  it('should render tags as button elements', () => {
    render(<CategoryTags tags={defaultTags} />);

    defaultTags.forEach(tag => {
      const button = screen.getByRole('button', { name: tag });
      expect(button.tagName).toBe('BUTTON');
    });
  });

  it('should apply correct styling classes to tags', () => {
    render(<CategoryTags tags={['Test Tag']} />);

    const button = screen.getByRole('button', { name: 'Test Tag' });
    expect(button).toHaveClass('rounded-full');
    expect(button).toHaveClass('bg-white');
    expect(button).toHaveClass('border');
  });

  it('should handle tags with special characters', () => {
    const specialTags = ['DIY & Crafts', 'Tech-Help', 'Home/Garden'];
    render(<CategoryTags tags={specialTags} />);

    specialTags.forEach(tag => {
      expect(screen.getByRole('button', { name: tag })).toBeInTheDocument();
    });
  });

  it('should handle duplicate tags by rendering each instance', () => {
    const tagsWithDuplicates = ['Popular', 'Popular', 'Recommended'];
    render(<CategoryTags tags={tagsWithDuplicates} />);

    const popularButtons = screen.getAllByRole('button', { name: 'Popular' });
    expect(popularButtons).toHaveLength(2);
  });

  it('should maintain tag order as provided', () => {
    const orderedTags = ['Zebra', 'Apple', 'Mango', 'Banana'];
    render(<CategoryTags tags={orderedTags} />);

    const buttons = screen.getAllByRole('button');
    const buttonTexts = buttons.map(btn => btn.textContent);

    expect(buttonTexts).toEqual(orderedTags);
  });
});
