import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FavoriteButton } from './favorite-button';
import { useFavoritesContext } from '@/lib/context/favorites-context';
import { useToast } from '@/lib/hooks/use-toast';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  auth: {},
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock the context and hooks
vi.mock('@/lib/context/favorites-context');
vi.mock('@/lib/hooks/use-toast');

const mockUseFavoritesContext = useFavoritesContext as ReturnType<typeof vi.fn>;
const mockUseToast = useToast as ReturnType<typeof vi.fn>;

describe('FavoriteButton', () => {
  const mockAddFavorite = vi.fn();
  const mockRemoveFavorite = vi.fn();
  const mockIsFavorite = vi.fn();
  const mockShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseFavoritesContext.mockReturnValue({
      favorites: [],
      isLoading: false,
      error: null,
      addFavorite: mockAddFavorite,
      removeFavorite: mockRemoveFavorite,
      isFavorite: mockIsFavorite,
      refreshFavorites: vi.fn(),
      count: 0,
    });

    mockUseToast.mockReturnValue({
      toasts: [],
      showToast: mockShowToast,
      dismissToast: vi.fn(),
    });

    mockIsFavorite.mockReturnValue(false);
  });

  describe('FavoriteButton_ShouldRenderCorrectly_WhenMounted', () => {
    it('renders button with outline heart icon when not favorited', () => {
      mockIsFavorite.mockReturnValue(false);
      render(<FavoriteButton tipId="tip-123" />);
      
      const button = screen.getByRole('button', { name: /add to favorites/i });
      expect(button).toBeInTheDocument();
      
      // Check for outline heart (stroke, no fill)
      const svg = button.querySelector('svg');
      expect(svg).toHaveAttribute('fill', 'none');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
    });

    it('renders button with filled heart icon when favorited', () => {
      mockIsFavorite.mockReturnValue(true);
      render(<FavoriteButton tipId="tip-123" />);
      
      const button = screen.getByRole('button', { name: /remove from favorites/i });
      expect(button).toBeInTheDocument();
      
      // Check for filled heart
      const svg = button.querySelector('svg');
      expect(svg).toHaveAttribute('fill', 'currentColor');
    });

    it('renders with correct ARIA label when tipTitle provided', () => {
      mockIsFavorite.mockReturnValue(false);
      render(<FavoriteButton tipId="tip-123" tipTitle="How to save time" />);
      
      const button = screen.getByRole('button', { name: /add how to save time to favorites/i });
      expect(button).toBeInTheDocument();
    });

    it('renders with label text when showLabel is true', () => {
      mockIsFavorite.mockReturnValue(false);
      render(<FavoriteButton tipId="tip-123" showLabel={true} />);
      
      expect(screen.getByText('Favorite')).toBeInTheDocument();
    });

    it('renders with "Favorited" label when favorited and showLabel is true', () => {
      mockIsFavorite.mockReturnValue(true);
      render(<FavoriteButton tipId="tip-123" showLabel={true} />);
      
      expect(screen.getByText('Favorited')).toBeInTheDocument();
    });

    it('applies correct size classes for small size', () => {
      render(<FavoriteButton tipId="tip-123" size="sm" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-w-[36px]', 'min-h-[36px]');
    });

    it('applies correct size classes for medium size (default)', () => {
      render(<FavoriteButton tipId="tip-123" size="md" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-w-[44px]', 'min-h-[44px]');
    });

    it('applies correct size classes for large size', () => {
      render(<FavoriteButton tipId="tip-123" size="lg" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-w-[48px]', 'min-h-[48px]');
    });
  });

  describe('FavoriteButton_ShouldHandleClick_WhenNotFavorited', () => {
    it('calls addFavorite when clicked', async () => {
      mockIsFavorite.mockReturnValue(false);
      mockAddFavorite.mockResolvedValueOnce(undefined);
      
      render(<FavoriteButton tipId="tip-123" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAddFavorite).toHaveBeenCalledWith('tip-123');
      });
    });

    it('shows success toast after adding favorite', async () => {
      mockIsFavorite.mockReturnValue(false);
      mockAddFavorite.mockResolvedValueOnce(undefined);
      
      render(<FavoriteButton tipId="tip-123" tipTitle="Test Tip" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          type: 'success',
          message: 'Added "Test Tip" to favorites',
          duration: 3000,
        });
      });
    });

    it('calls onToggle callback after successful add', async () => {
      mockIsFavorite.mockReturnValue(false);
      mockAddFavorite.mockResolvedValueOnce(undefined);
      const onToggle = vi.fn();
      
      render(<FavoriteButton tipId="tip-123" onToggle={onToggle} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(onToggle).toHaveBeenCalledWith(true);
      });
    });

    it('stops event propagation on click', () => {
      mockIsFavorite.mockReturnValue(false);
      const parentClick = vi.fn();
      
      render(
        <div onClick={parentClick}>
          <FavoriteButton tipId="tip-123" />
        </div>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(parentClick).not.toHaveBeenCalled();
    });
  });

  describe('FavoriteButton_ShouldHandleClick_WhenFavorited', () => {
    it('calls removeFavorite when clicked', async () => {
      mockIsFavorite.mockReturnValue(true);
      mockRemoveFavorite.mockResolvedValueOnce(undefined);
      
      render(<FavoriteButton tipId="tip-123" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockRemoveFavorite).toHaveBeenCalledWith('tip-123');
      });
    });

    it('shows success toast after removing favorite', async () => {
      mockIsFavorite.mockReturnValue(true);
      mockRemoveFavorite.mockResolvedValueOnce(undefined);
      
      render(<FavoriteButton tipId="tip-123" tipTitle="Test Tip" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          type: 'success',
          message: 'Removed "Test Tip" from favorites',
          duration: 3000,
        });
      });
    });

    it('calls onToggle callback after successful remove', async () => {
      mockIsFavorite.mockReturnValue(true);
      mockRemoveFavorite.mockResolvedValueOnce(undefined);
      const onToggle = vi.fn();
      
      render(<FavoriteButton tipId="tip-123" onToggle={onToggle} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(onToggle).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('FavoriteButton_ShouldShowLoadingState_WhenProcessing', () => {
    it('shows loading spinner during add operation', async () => {
      mockIsFavorite.mockReturnValue(false);
      mockAddFavorite.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<FavoriteButton tipId="tip-123" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const spinner = button.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      });
    });

    it('disables button during operation', async () => {
      mockIsFavorite.mockReturnValue(false);
      mockAddFavorite.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<FavoriteButton tipId="tip-123" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it('hides label during loading when showLabel is true', async () => {
      mockIsFavorite.mockReturnValue(false);
      mockAddFavorite.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<FavoriteButton tipId="tip-123" showLabel={true} />);
      
      const button = screen.getByRole('button');
      expect(screen.getByText('Favorite')).toBeInTheDocument();
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.queryByText('Favorite')).not.toBeInTheDocument();
      });
    });

    it('prevents multiple clicks during operation', async () => {
      mockIsFavorite.mockReturnValue(false);
      mockAddFavorite.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<FavoriteButton tipId="tip-123" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockAddFavorite).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('FavoriteButton_ShouldHandleErrors_WhenOperationFails', () => {
    it('shows error toast when add fails', async () => {
      mockIsFavorite.mockReturnValue(false);
      mockAddFavorite.mockRejectedValueOnce(new Error('Network error'));
      
      render(<FavoriteButton tipId="tip-123" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'Failed to add to favorites',
          duration: 4000,
        });
      });
    });

    it('shows error toast when remove fails', async () => {
      mockIsFavorite.mockReturnValue(true);
      mockRemoveFavorite.mockRejectedValueOnce(new Error('Network error'));
      
      render(<FavoriteButton tipId="tip-123" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'Failed to remove from favorites',
          duration: 4000,
        });
      });
    });

    it('does not call onToggle callback when operation fails', async () => {
      mockIsFavorite.mockReturnValue(false);
      mockAddFavorite.mockRejectedValueOnce(new Error('Network error'));
      const onToggle = vi.fn();
      
      render(<FavoriteButton tipId="tip-123" onToggle={onToggle} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalled();
      });

      expect(onToggle).not.toHaveBeenCalled();
    });

    it('re-enables button after error', async () => {
      mockIsFavorite.mockReturnValue(false);
      mockAddFavorite.mockRejectedValueOnce(new Error('Network error'));
      
      render(<FavoriteButton tipId="tip-123" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalled();
      });

      expect(button).not.toBeDisabled();
    });
  });

  describe('FavoriteButton_ShouldSupportKeyboard_WhenInteracting', () => {
    it('handles Enter key press', async () => {
      mockIsFavorite.mockReturnValue(false);
      mockAddFavorite.mockResolvedValueOnce(undefined);
      
      render(<FavoriteButton tipId="tip-123" />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      await waitFor(() => {
        expect(mockAddFavorite).toHaveBeenCalledWith('tip-123');
      });
    });

    it('handles Space key press', async () => {
      mockIsFavorite.mockReturnValue(false);
      mockAddFavorite.mockResolvedValueOnce(undefined);
      
      render(<FavoriteButton tipId="tip-123" />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });

      await waitFor(() => {
        expect(mockAddFavorite).toHaveBeenCalledWith('tip-123');
      });
    });

    it('prevents default behavior on Enter key', () => {
      mockIsFavorite.mockReturnValue(false);
      
      render(<FavoriteButton tipId="tip-123" />);
      
      const button = screen.getByRole('button');
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
      button.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('stops propagation on keyboard events', () => {
      mockIsFavorite.mockReturnValue(false);
      const parentKeyDown = vi.fn();
      
      render(
        <div onKeyDown={parentKeyDown}>
          <FavoriteButton tipId="tip-123" />
        </div>
      );
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(parentKeyDown).not.toHaveBeenCalled();
    });

    it('ignores other keys', async () => {
      mockIsFavorite.mockReturnValue(false);
      
      render(<FavoriteButton tipId="tip-123" />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'a' });
      fireEvent.keyDown(button, { key: 'Escape' });
      fireEvent.keyDown(button, { key: 'Tab' });

      expect(mockAddFavorite).not.toHaveBeenCalled();
    });
  });

  describe('FavoriteButton_ShouldHaveAccessibility_WhenRendered', () => {
    it('has proper button role', () => {
      render(<FavoriteButton tipId="tip-123" />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('has type="button" to prevent form submission', () => {
      render(<FavoriteButton tipId="tip-123" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('has focus ring styles', () => {
      render(<FavoriteButton tipId="tip-123" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:ring-2', 'focus:ring-green-500');
    });

    it('meets minimum touch target size (44x44px)', () => {
      render(<FavoriteButton tipId="tip-123" size="md" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-w-[44px]', 'min-h-[44px]');
    });

    it('has aria-hidden on icons', () => {
      render(<FavoriteButton tipId="tip-123" />);
      
      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
