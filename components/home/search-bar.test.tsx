import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SearchBar } from './search-bar';

describe('SearchBar', () => {
  it('should render input with default placeholder', () => {
    render(<SearchBar />);

    const input = screen.getByPlaceholderText('Search for tips...');
    expect(input).toBeInTheDocument();
  });

  it('should render input with custom placeholder', () => {
    render(<SearchBar placeholder="Find lifehacks..." />);

    const input = screen.getByPlaceholderText('Find lifehacks...');
    expect(input).toBeInTheDocument();
  });

  it('should render search button', () => {
    render(<SearchBar />);

    const buttons = screen.getAllByRole('button', { name: /search/i });
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should update input value when user types', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    const input = screen.getByRole('textbox', { name: /search/i });
    await user.type(input, 'kitchen tips');

    expect(input).toHaveValue('kitchen tips');
  });

  it('should call onSearch with query when search button is clicked', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByRole('textbox', { name: /search/i });
    const buttons = screen.getAllByRole('button', { name: /search/i });

    await user.type(input, 'cleaning hacks');
    await user.click(buttons[0]);

    expect(handleSearch).toHaveBeenCalledWith('cleaning hacks');
    expect(handleSearch).toHaveBeenCalledTimes(1);
  });

  it('should call onSearch when Enter key is pressed', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByRole('textbox', { name: /search/i });

    await user.type(input, 'cooking tips{Enter}');

    expect(handleSearch).toHaveBeenCalledWith('cooking tips');
  });

  it('should not throw error when onSearch is not provided', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    const input = screen.getByRole('textbox', { name: /search/i });
    const buttons = screen.getAllByRole('button', { name: /search/i });

    await user.type(input, 'test query');
    
    // Should not throw
    await expect(user.click(buttons[0])).resolves.not.toThrow();
  });

  it('should disable input and button when disabled prop is true', () => {
    render(<SearchBar disabled={true} />);

    const input = screen.getByRole('textbox', { name: /search/i });
    const buttons = screen.getAllByRole('button', { name: /search/i });

    expect(input).toBeDisabled();
    buttons.forEach(button => expect(button).toBeDisabled());
  });

  it('should not call onSearch when disabled', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} disabled={true} />);

    const buttons = screen.getAllByRole('button', { name: /search/i });
    await user.click(buttons[0]);

    expect(handleSearch).not.toHaveBeenCalled();
  });

  it('should call onSearch with empty string when button clicked without input', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();
    render(<SearchBar onSearch={handleSearch} />);

    const buttons = screen.getAllByRole('button', { name: /search/i });
    await user.click(buttons[0]);

    expect(handleSearch).toHaveBeenCalledWith('');
  });

  it('should have accessible label for input', () => {
    render(<SearchBar />);

    const input = screen.getByRole('textbox', { name: /search/i });
    expect(input).toHaveAccessibleName();
  });
});

/**
 * Property-Based Tests
 * Feature: home-page-implementation
 */
describe('SearchBar - Property-Based Tests', () => {
  /**
   * Property 14: Search Bar Full Width on Mobile
   * **Validates: Requirements 10.6**
   * 
   * For any viewport width less than 768px, the search bar component
   * should span 100% of its container's width.
   */
  it('Property_14_SearchBar_ShouldSpanFullWidth_WhenViewportIsMobile', () => {
    // Arrange: Render SearchBar in a container with known width
    const { container } = render(
      <div style={{ width: '320px' }} data-testid="container">
        <SearchBar />
      </div>
    );

    const searchBarWrapper = container.querySelector('div[data-testid="container"] > div');
    
    // Assert: The search bar wrapper should have w-full class
    expect(searchBarWrapper).toHaveClass('w-full');
    
    // The computed style should show 100% width
    // Note: In happy-dom, we verify the class is applied
    // In a real browser, this would compute to the container's width
  });

  it('Property_14_SearchBar_ShouldHaveFlexibleWidth_ForAnyContainerSize', () => {
    // Test with various container widths to ensure responsive behavior
    const containerWidths = [300, 375, 414, 600, 767]; // All mobile widths

    containerWidths.forEach(width => {
      const { container } = render(
        <div style={{ width: `${width}px` }} data-testid={`container-${width}`}>
          <SearchBar />
        </div>
      );

      const searchBarWrapper = container.querySelector(`div[data-testid="container-${width}"] > div`);
      
      // Assert: Should always have w-full class for responsive width
      expect(searchBarWrapper).toHaveClass('w-full');
    });
  });
});
