import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SearchBar } from './search-bar';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

/**
 * Styling Consistency and Accessibility Tests
 * Task 7: Verify styling consistency and accessibility
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
describe('SearchBar - Styling and Accessibility', () => {
  describe('Compact Variant Styling', () => {
    it('SearchBar_ShouldApplyCompactStyling_WhenVariantIsCompact', () => {
      const { container } = render(<SearchBar variant="compact" />);
      
      const input = container.querySelector('input');
      
      // Verify compact-specific classes are applied
      expect(input?.className).toContain('md:py-2');
      expect(input?.className).toContain('md:shadow-sm');
      expect(input?.className).toContain('md:border');
      expect(input?.className).toContain('md:border-gray-200');
    });

    it('SearchBar_ShouldApplyDefaultStyling_WhenVariantIsDefault', () => {
      const { container } = render(<SearchBar variant="default" />);
      
      const input = container.querySelector('input');
      
      // Verify default styling (not compact)
      expect(input?.className).toContain('md:py-3');
      expect(input?.className).toContain('md:shadow-none');
    });
  });

  describe('Color Palette Usage', () => {
    it('SearchBar_ShouldUsePrimaryColors_WhenRendered', () => {
      const { container } = render(<SearchBar />);
      
      // Check search icon uses primary color
      const searchIcon = container.querySelector('svg');
      expect(searchIcon?.className).toContain('text-primary');
      
      // Check mobile button uses primary background
      const mobileButton = container.querySelector('button');
      expect(mobileButton?.className).toContain('bg-primary');
      expect(mobileButton?.className).toContain('hover:bg-primary-dark');
    });

    it('SearchBar_ShouldUseGrayScales_WhenRendered', () => {
      const { container } = render(<SearchBar />);
      
      const input = container.querySelector('input');
      
      // Verify gray scale usage
      expect(input?.className).toContain('text-gray-900');
      expect(input?.className).toContain('placeholder-gray-400');
      expect(input?.className).toContain('border-gray-200');
    });
  });

  describe('Border Radius and Shadows', () => {
    it('SearchBar_ShouldUseRoundedFull_OnMobile', () => {
      const { container } = render(<SearchBar />);
      
      const input = container.querySelector('input');
      
      // Mobile uses rounded-full
      expect(input?.className).toContain('rounded-full');
    });

    it('SearchBar_ShouldUseRoundedXl_OnDesktop', () => {
      const { container } = render(<SearchBar />);
      
      const input = container.querySelector('input');
      
      // Desktop uses rounded-xl
      expect(input?.className).toContain('md:rounded-xl');
    });

    it('SearchBar_ShouldUseShadowLg_OnMobile', () => {
      const { container } = render(<SearchBar />);
      
      const input = container.querySelector('input');
      
      // Mobile uses shadow-lg
      expect(input?.className).toContain('shadow-lg');
    });

    it('SearchBar_ShouldUseMinimalShadow_WhenCompactVariant', () => {
      const { container } = render(<SearchBar variant="compact" />);
      
      const input = container.querySelector('input');
      
      // Compact variant uses shadow-sm on desktop
      expect(input?.className).toContain('md:shadow-sm');
    });
  });

  describe('Spacing Consistency', () => {
    it('SearchBar_ShouldUseConsistentPadding_WhenRendered', () => {
      const { container } = render(<SearchBar />);
      
      const input = container.querySelector('input');
      
      // Verify consistent padding
      expect(input?.className).toContain('pl-12'); // Left padding for icon
      expect(input?.className).toContain('pr-16'); // Right padding for mobile button
      expect(input?.className).toContain('py-4'); // Vertical padding mobile
      expect(input?.className).toContain('md:pr-4'); // Desktop right padding
    });

    it('SearchBar_ShouldUseReducedPadding_WhenCompactVariant', () => {
      const { container } = render(<SearchBar variant="compact" />);
      
      const input = container.querySelector('input');
      
      // Compact variant has reduced vertical padding on desktop
      expect(input?.className).toContain('md:py-2');
    });
  });

  describe('Aria-label Attributes', () => {
    it('SearchBar_ShouldHaveAriaLabel_OnSearchInput', () => {
      render(<SearchBar />);
      
      const input = screen.getByRole('textbox', { name: /search/i });
      expect(input).toHaveAttribute('aria-label', 'Search');
    });

    it('SearchBar_ShouldHaveAriaLabel_OnMobileSearchButton', () => {
      render(<SearchBar />);
      
      const buttons = screen.getAllByRole('button', { name: /search/i });
      
      // Mobile button (first button in the array) should have aria-label
      expect(buttons[0]).toHaveAttribute('aria-label', 'Search');
    });

    it('SearchBar_ShouldHaveAriaLabel_OnDesktopSearchButton', () => {
      render(<SearchBar variant="default" />);
      
      const buttons = screen.getAllByRole('button');
      
      // Desktop button should be present for default variant
      expect(buttons.length).toBeGreaterThan(0);
      
      // All buttons should have accessible names
      buttons.forEach(button => {
        expect(button.textContent || button.getAttribute('aria-label')).toBeTruthy();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('SearchBar_ShouldTriggerSearch_WhenEnterKeyPressed', async () => {
      const user = userEvent.setup();
      const handleSearch = vi.fn();
      
      render(<SearchBar onSearch={handleSearch} />);
      
      const input = screen.getByRole('textbox', { name: /search/i });
      
      await user.type(input, 'test query{Enter}');
      
      expect(handleSearch).toHaveBeenCalledWith('test query');
    });

    it('SearchBar_ShouldHaveFocusStates_OnInput', () => {
      const { container } = render(<SearchBar />);
      
      const input = container.querySelector('input');
      
      // Verify focus states are defined
      expect(input?.className).toContain('focus:shadow-xl');
      expect(input?.className).toContain('md:focus:border-primary');
      expect(input?.className).toContain('md:focus:ring-2');
      expect(input?.className).toContain('md:focus:ring-primary');
    });

    it('SearchBar_ShouldHaveFocusStates_OnButtons', () => {
      const { container } = render(<SearchBar />);
      
      const buttons = container.querySelectorAll('button');
      
      buttons.forEach(button => {
        // All buttons should have focus states
        expect(button.className).toContain('focus:outline-none');
        expect(button.className).toContain('focus:ring-2');
        expect(button.className).toContain('focus:ring-primary');
      });
    });

    it('SearchBar_ShouldBeKeyboardAccessible_WhenDisabled', () => {
      const { container } = render(<SearchBar disabled={true} />);
      
      const input = container.querySelector('input');
      const buttons = container.querySelectorAll('button');
      
      // Disabled elements should have proper attributes
      expect(input).toHaveAttribute('disabled');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('disabled');
      });
      
      // Disabled styling should be applied
      expect(input?.className).toContain('disabled:opacity-50');
      expect(input?.className).toContain('disabled:cursor-not-allowed');
    });

    it('SearchBar_ShouldMaintainFocus_AfterSearch', async () => {
      const user = userEvent.setup();
      const handleSearch = vi.fn();
      
      render(<SearchBar onSearch={handleSearch} />);
      
      const input = screen.getByRole('textbox', { name: /search/i });
      
      await user.type(input, 'test{Enter}');
      
      // Input should maintain focus after search
      expect(input).toHaveFocus();
    });

    it('SearchBar_ShouldAllowTabNavigation_BetweenElements', async () => {
      const user = userEvent.setup();
      
      render(<SearchBar variant="default" />);
      
      const input = screen.getByRole('textbox', { name: /search/i });
      
      // Focus input
      await user.click(input);
      expect(input).toHaveFocus();
      
      // Tab to next element (button)
      await user.tab();
      
      const buttons = screen.getAllByRole('button');
      // One of the buttons should now have focus
      const hasFocusedButton = buttons.some(button => button === document.activeElement);
      expect(hasFocusedButton).toBe(true);
    });
  });

  describe('Hover States', () => {
    it('SearchBar_ShouldHaveHoverStates_OnButtons', () => {
      const { container } = render(<SearchBar />);
      
      const buttons = container.querySelectorAll('button');
      
      buttons.forEach(button => {
        // All buttons should have hover states
        expect(button.className).toContain('hover:bg-primary-dark');
        expect(button.className).toContain('transition-colors');
      });
    });
  });

  describe('Disabled State Styling', () => {
    it('SearchBar_ShouldApplyDisabledStyling_WhenDisabled', () => {
      const { container } = render(<SearchBar disabled={true} />);
      
      const input = container.querySelector('input');
      const buttons = container.querySelectorAll('button');
      
      // Verify disabled styling
      expect(input?.className).toContain('disabled:opacity-50');
      expect(input?.className).toContain('disabled:cursor-not-allowed');
      
      buttons.forEach(button => {
        expect(button.className).toContain('disabled:opacity-50');
        expect(button.className).toContain('disabled:cursor-not-allowed');
      });
    });
  });
});
