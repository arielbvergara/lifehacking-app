import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogOutButton } from './log-out-button';

// Hoist mocks to avoid initialization issues
const { mockPush, mockSignOut, mockAddToast } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockSignOut: vi.fn(),
  mockAddToast: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock firebase auth
vi.mock('@/lib/auth/firebase-auth', () => ({
  signOut: mockSignOut,
}));

// Mock toast
vi.mock('@/lib/hooks/use-toast', () => ({
  addToast: mockAddToast,
}));

describe('LogOutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue(undefined);
  });

  it('LogOutButton_ShouldRenderButton_WhenMounted', () => {
    render(<LogOutButton />);
    
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
  });

  it('LogOutButton_ShouldCallSignOut_WhenClicked', async () => {
    const user = userEvent.setup();
    render(<LogOutButton />);
    
    const button = screen.getByRole('button', { name: /log out/i });
    await user.click(button);
    
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });

  it('LogOutButton_ShouldShowSuccessToast_WhenSignOutSucceeds', async () => {
    const user = userEvent.setup();
    render(<LogOutButton />);
    
    const button = screen.getByRole('button', { name: /log out/i });
    await user.click(button);
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'Signed out successfully',
      });
    });
  });

  it('LogOutButton_ShouldRedirectToHome_WhenSignOutSucceeds', async () => {
    const user = userEvent.setup();
    render(<LogOutButton />);
    
    const button = screen.getByRole('button', { name: /log out/i });
    await user.click(button);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('LogOutButton_ShouldShowErrorToast_WhenSignOutFails', async () => {
    mockSignOut.mockRejectedValue(new Error('Sign out failed'));
    const user = userEvent.setup();
    render(<LogOutButton />);
    
    const button = screen.getByRole('button', { name: /log out/i });
    await user.click(button);
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'Failed to sign out. Please try again.',
      });
    });
  });

  it('LogOutButton_ShouldDisableButton_WhenSignOutInProgress', async () => {
    mockSignOut.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    const user = userEvent.setup();
    render(<LogOutButton />);
    
    const button = screen.getByRole('button', { name: /log out/i });
    await user.click(button);
    
    expect(button).toBeDisabled();
    expect(screen.getByText(/signing out/i)).toBeInTheDocument();
  });
});
