import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UsersSearch } from './users-search';

describe('UsersSearch', () => {
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('UsersSearch_Should_DisplaySearchInput_When_Rendered', () => {
    it('should display search input with placeholder', () => {
      render(<UsersSearch onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Search by email, name, or ID...');
      expect(input).toBeInTheDocument();
    });

    it('should display search icon', () => {
      const { container } = render(<UsersSearch onSearch={mockOnSearch} />);

      const searchIcon = container.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });

    it('should display initial query value', () => {
      render(<UsersSearch initialQuery="test query" onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Search by email, name, or ID...') as HTMLInputElement;
      expect(input.value).toBe('test query');
    });
  });

  describe('UsersSearch_Should_HandleUserInput_When_UserTypes', () => {
    it('should update input value when user types', async () => {
      const user = userEvent.setup();
      render(<UsersSearch onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Search by email, name, or ID...');
      await user.type(input, 'test');

      expect(input).toHaveValue('test');
    });

    it('should call onSearch after debounce delay', async () => {
      const user = userEvent.setup();
      render(<UsersSearch onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Search by email, name, or ID...');
      await user.type(input, 'test');

      // Wait for debounce to complete
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('test');
      }, { timeout: 1000 });
    });

    it('should debounce multiple rapid inputs', async () => {
      const user = userEvent.setup();
      render(<UsersSearch onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Search by email, name, or ID...');
      
      await user.type(input, 'test');

      // Wait for debounce to complete
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('test');
      }, { timeout: 1000 });

      // Should only be called once due to debouncing
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe('UsersSearch_Should_DisplayClearButton_When_QueryIsNotEmpty', () => {
    it('should not display clear button when query is empty', () => {
      render(<UsersSearch onSearch={mockOnSearch} />);

      const clearButton = screen.queryByLabelText('Clear search');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should display clear button when query is not empty', async () => {
      const user = userEvent.setup();
      render(<UsersSearch onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText('Search by email, name, or ID...');
      await user.type(input, 'test');

      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toBeInTheDocument();
    });

    it('should clear input when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<UsersSearch initialQuery="test query" onSearch={mockOnSearch} />);

      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      const input = screen.getByPlaceholderText('Search by email, name, or ID...') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should call onSearch with empty string after clearing', async () => {
      const user = userEvent.setup();
      render(<UsersSearch initialQuery="test query" onSearch={mockOnSearch} />);

      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('');
      }, { timeout: 1000 });
    });
  });
});
