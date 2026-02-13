import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb, BreadcrumbItem } from './breadcrumb';

describe('Breadcrumb', () => {
  const mockItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Kitchen', href: '/category/kitchen-id' },
    { label: 'Peel Garlic in 10 Seconds' },
  ];

  describe('Rendering', () => {
    it('Breadcrumb_ShouldRenderAllItems_WhenItemsProvided', () => {
      render(<Breadcrumb items={mockItems} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Kitchen')).toBeInTheDocument();
      expect(screen.getByText('Peel Garlic in 10 Seconds')).toBeInTheDocument();
    });

    it('Breadcrumb_ShouldRenderEmptyNav_WhenNoItems', () => {
      const { container } = render(<Breadcrumb items={[]} />);

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
      
      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(0);
    });

    it('Breadcrumb_ShouldRenderSingleItem_WhenOnlyOneItem', () => {
      const singleItem: BreadcrumbItem[] = [{ label: 'Home' }];
      render(<Breadcrumb items={singleItem} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  describe('Links', () => {
    it('Breadcrumb_ShouldRenderClickableLinks_WhenHrefProvided', () => {
      render(<Breadcrumb items={mockItems} />);

      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');

      const kitchenLink = screen.getByRole('link', { name: /kitchen/i });
      expect(kitchenLink).toBeInTheDocument();
      expect(kitchenLink).toHaveAttribute('href', '/category/kitchen-id');
    });

    it('Breadcrumb_ShouldNotRenderLink_WhenLastItem', () => {
      render(<Breadcrumb items={mockItems} />);

      const lastItem = screen.getByText('Peel Garlic in 10 Seconds');
      expect(lastItem.tagName).toBe('SPAN');
      expect(lastItem).not.toHaveAttribute('href');
    });

    it('Breadcrumb_ShouldHaveCorrectHoverStyles_WhenLinkRendered', () => {
      render(<Breadcrumb items={mockItems} />);

      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toHaveClass('hover:text-primary');
      expect(homeLink).toHaveClass('transition-colors');
    });
  });

  describe('Accessibility', () => {
    it('Breadcrumb_ShouldHaveAriaLabel_WhenRendered', () => {
      render(<Breadcrumb items={mockItems} />);

      const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
    });

    it('Breadcrumb_ShouldHaveAriaCurrentPage_WhenLastItem', () => {
      render(<Breadcrumb items={mockItems} />);

      const lastItem = screen.getByText('Peel Garlic in 10 Seconds');
      expect(lastItem).toHaveAttribute('aria-current', 'page');
    });

    it('Breadcrumb_ShouldNotHaveAriaCurrent_WhenNotLastItem', () => {
      render(<Breadcrumb items={mockItems} />);

      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).not.toHaveAttribute('aria-current');

      const kitchenLink = screen.getByRole('link', { name: /kitchen/i });
      expect(kitchenLink).not.toHaveAttribute('aria-current');
    });

    it('Breadcrumb_ShouldUseSemanticHTML_WhenRendered', () => {
      const { container } = render(<Breadcrumb items={mockItems} />);

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

      const ol = container.querySelector('ol');
      expect(ol).toBeInTheDocument();

      const listItems = container.querySelectorAll('li');
      expect(listItems.length).toBeGreaterThan(0);
    });
  });

  describe('Separators', () => {
    it('Breadcrumb_ShouldRenderChevronSeparators_WhenMultipleItems', () => {
      const { container } = render(<Breadcrumb items={mockItems} />);

      const chevrons = container.querySelectorAll('.material-icons-round');
      // Should have 2 chevrons for 3 items (no chevron before first item)
      expect(chevrons).toHaveLength(2);
      
      chevrons.forEach(chevron => {
        expect(chevron.textContent?.trim()).toBe('chevron_right');
      });
    });

    it('Breadcrumb_ShouldNotRenderChevron_WhenFirstItem', () => {
      const { container } = render(<Breadcrumb items={mockItems} />);

      const firstListItem = container.querySelector('li:first-child');
      const chevronInFirst = firstListItem?.querySelector('.material-icons-round');
      expect(chevronInFirst).toBeNull();
    });

    it('Breadcrumb_ShouldNotRenderSeparators_WhenSingleItem', () => {
      const { container } = render(<Breadcrumb items={[{ label: 'Home' }]} />);

      const chevrons = container.querySelectorAll('.material-icons-round');
      expect(chevrons).toHaveLength(0);
    });

    it('Breadcrumb_ShouldHaveCorrectChevronStyling_WhenRendered', () => {
      const { container } = render(<Breadcrumb items={mockItems} />);

      const chevrons = container.querySelectorAll('.material-icons-round');
      chevrons.forEach(chevron => {
        expect(chevron).toHaveClass('text-gray-400');
        expect(chevron).toHaveClass('mx-2');
        expect(chevron).toHaveClass('text-lg');
      });
    });
  });

  describe('Responsive Truncation', () => {
    it('Breadcrumb_ShouldHaveTruncationClasses_WhenLastItem', () => {
      render(<Breadcrumb items={mockItems} />);

      const lastItem = screen.getByText('Peel Garlic in 10 Seconds');
      expect(lastItem).toHaveClass('truncate');
      expect(lastItem).toHaveClass('max-w-[150px]');
      expect(lastItem).toHaveClass('md:max-w-none');
    });

    it('Breadcrumb_ShouldHaveTruncationClasses_WhenLinkItem', () => {
      render(<Breadcrumb items={mockItems} />);

      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toHaveClass('truncate');
      expect(homeLink).toHaveClass('max-w-[100px]');
      expect(homeLink).toHaveClass('md:max-w-none');
    });

    it('Breadcrumb_ShouldHandleLongLabels_WhenRendered', () => {
      const longLabelItems: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'This is a very long category name that should be truncated on mobile devices' },
      ];

      render(<Breadcrumb items={longLabelItems} />);

      const longLabel = screen.getByText(/this is a very long category name/i);
      expect(longLabel).toBeInTheDocument();
      expect(longLabel).toHaveClass('truncate');
    });
  });

  describe('Styling', () => {
    it('Breadcrumb_ShouldHaveCorrectNavStyling_WhenRendered', () => {
      const { container } = render(<Breadcrumb items={mockItems} />);

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('w-full');
    });

    it('Breadcrumb_ShouldHaveCorrectListStyling_WhenRendered', () => {
      const { container } = render(<Breadcrumb items={mockItems} />);

      const ol = container.querySelector('ol');
      expect(ol).toHaveClass('flex');
      expect(ol).toHaveClass('items-center');
      expect(ol).toHaveClass('flex-wrap');
      expect(ol).toHaveClass('gap-2');
      expect(ol).toHaveClass('text-sm');
    });

    it('Breadcrumb_ShouldHaveCorrectLastItemStyling_WhenRendered', () => {
      render(<Breadcrumb items={mockItems} />);

      const lastItem = screen.getByText('Peel Garlic in 10 Seconds');
      expect(lastItem).toHaveClass('text-gray-800');
      expect(lastItem).toHaveClass('font-medium');
    });

    it('Breadcrumb_ShouldHaveCorrectLinkStyling_WhenRendered', () => {
      render(<Breadcrumb items={mockItems} />);

      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toHaveClass('text-gray-600');
    });
  });

  describe('Edge Cases', () => {
    it('Breadcrumb_ShouldHandleItemWithoutHref_WhenNotLastItem', () => {
      const itemsWithMissingHref: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Kitchen' }, // Missing href but not last
        { label: 'Recipe' },
      ];

      render(<Breadcrumb items={itemsWithMissingHref} />);

      // Kitchen should render as link with fallback href="#"
      const kitchenItem = screen.getByText('Kitchen');
      expect(kitchenItem.tagName).toBe('A');
      expect(kitchenItem).toHaveAttribute('href', '#');
    });

    it('Breadcrumb_ShouldHandleEmptyLabels_WhenProvided', () => {
      const itemsWithEmptyLabel: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: '', href: '/empty' },
        { label: 'End' },
      ];

      const { container } = render(<Breadcrumb items={itemsWithEmptyLabel} />);

      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(3);
    });

    it('Breadcrumb_ShouldHandleSpecialCharacters_WhenInLabels', () => {
      const specialItems: BreadcrumbItem[] = [
        { label: 'Home & Garden', href: '/' },
        { label: 'Tips & Tricks' },
      ];

      render(<Breadcrumb items={specialItems} />);

      expect(screen.getByText('Home & Garden')).toBeInTheDocument();
      expect(screen.getByText('Tips & Tricks')).toBeInTheDocument();
    });
  });

  describe('Structure', () => {
    it('Breadcrumb_ShouldHaveCorrectNumberOfListItems_WhenRendered', () => {
      const { container } = render(<Breadcrumb items={mockItems} />);

      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(mockItems.length);
    });

    it('Breadcrumb_ShouldMaintainOrder_WhenItemsProvided', () => {
      const { container } = render(<Breadcrumb items={mockItems} />);

      const listItems = container.querySelectorAll('li');
      const labels = Array.from(listItems).map(li => li.textContent?.replace('chevron_right', '').trim());

      expect(labels[0]).toBe('Home');
      expect(labels[1]).toBe('Kitchen');
      expect(labels[2]).toBe('Peel Garlic in 10 Seconds');
    });

    it('Breadcrumb_ShouldWrapItems_WhenFlexWrapApplied', () => {
      const { container } = render(<Breadcrumb items={mockItems} />);

      const ol = container.querySelector('ol');
      expect(ol).toHaveClass('flex-wrap');
    });
  });
});
