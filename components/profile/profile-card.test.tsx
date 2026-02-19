import { render, screen, fireEvent, act } from "@testing-library/react";
import { ProfileCard } from "./profile-card";
import { vi } from "vitest";
import * as userApi from "@/lib/api/user";
import * as firebaseAuth from "@/lib/auth/firebase-auth";
import * as toastHook from "@/lib/hooks/use-toast";
import { useRouter } from "next/navigation";

// Mock the API module
vi.mock("@/lib/api/user", () => ({
  deleteAccount: vi.fn(),
}));

// Mock Firebase auth
vi.mock("@/lib/auth/firebase-auth", () => ({
  signOut: vi.fn(),
}));

// Mock the toast hook
vi.mock("@/lib/hooks/use-toast", () => ({
  addToast: vi.fn(),
}));

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock DisplayNameForm component
vi.mock("./display-name-form", () => ({
  DisplayNameForm: ({ currentName, onUpdate }: { currentName: string | null; onUpdate: (name: string) => void }) => (
    <div data-testid="display-name-form">
      <span data-testid="current-name">{currentName}</span>
      <button onClick={() => onUpdate("UpdatedName")}>Update Name</button>
    </div>
  ),
}));

describe("ProfileCard - Account Deletion", () => {
  const mockProfile = {
    id: "user-123",
    email: "test@example.com",
    displayName: "TestUser",
    createdAt: "2024-01-01T00:00:00Z",
  };
  const mockIdToken = "test-id-token";
  const mockPush = vi.fn();
  const mockRouterReturn = { push: mockPush };

  // Helper function to open dialog and confirm deletion
  const openDialogAndConfirm = async () => {
    // Open dialog
    const deleteButton = screen.getByRole("button", { name: /delete account/i });
    
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Type DELETE to enable confirm button - use placeholder to identify the correct input
    const confirmInput = screen.getByPlaceholderText("DELETE");
    
    await act(async () => {
      fireEvent.change(confirmInput, { target: { value: "DELETE" } });
    });

    // Click confirm - get all buttons and select the one inside the dialog
    const buttons = screen.getAllByRole("button", { name: /delete account/i });
    const confirmButton = buttons[1]; // Second button is in the dialog
    
    await act(async () => {
      fireEvent.click(confirmButton);
      // Flush microtasks to allow promises to resolve
      await Promise.resolve();
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouterReturn);
    
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("ProfileCard_ShouldOpenDialog_WhenDeleteButtonClicked", () => {
    it("opens confirmation dialog when delete button is clicked", () => {
      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);

      const deleteButton = screen.getByRole("button", { name: /delete account/i });
      fireEvent.click(deleteButton);

      expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
      expect(screen.getByText(/type delete to confirm/i)).toBeInTheDocument();
    });
  });

  describe("ProfileCard_ShouldDeleteAccountAndRedirect_WhenConfirmed", () => {
    it("calls deleteAccount API with correct token", async () => {
      vi.mocked(userApi.deleteAccount).mockResolvedValue();
      vi.mocked(firebaseAuth.signOut).mockResolvedValue();

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      // Wait for the API call
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(userApi.deleteAccount).toHaveBeenCalledWith(mockIdToken);
    });

    it("shows success toast after successful deletion", async () => {
      vi.mocked(userApi.deleteAccount).mockResolvedValue();
      vi.mocked(firebaseAuth.signOut).mockResolvedValue();

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(toastHook.addToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'Account deleted successfully',
      });
    });

    it("calls Firebase signOut after successful deletion", async () => {
      vi.mocked(userApi.deleteAccount).mockResolvedValue();
      vi.mocked(firebaseAuth.signOut).mockResolvedValue();

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(firebaseAuth.signOut).toHaveBeenCalled();
    });

    it("clears session cookie after signOut", async () => {
      vi.mocked(userApi.deleteAccount).mockResolvedValue();
      vi.mocked(firebaseAuth.signOut).mockResolvedValue();

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(document.cookie).toContain('session=; path=/; max-age=0');
    });

    it("redirects to home page after 2 second delay", async () => {
      vi.mocked(userApi.deleteAccount).mockResolvedValue();
      vi.mocked(firebaseAuth.signOut).mockResolvedValue();

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe("ProfileCard_ShouldHandleSignOutError_WhenSignOutFails", () => {
    it("logs error and shows toast when signOut fails", async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const signOutError = new Error('Sign out failed');
      
      vi.mocked(userApi.deleteAccount).mockResolvedValue();
      vi.mocked(firebaseAuth.signOut).mockRejectedValue(signOutError);

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ProfileCard] Sign out failed after account deletion:',
        signOutError
      );

      expect(toastHook.addToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'Sign out failed, but account was deleted. Redirecting...',
      });

      consoleErrorSpy.mockRestore();
    });

    it("clears session cookie even when signOut fails", async () => {
      vi.mocked(userApi.deleteAccount).mockResolvedValue();
      vi.mocked(firebaseAuth.signOut).mockRejectedValue(new Error('Sign out failed'));

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(document.cookie).toContain('session=; path=/; max-age=0');
    });

    it("still redirects to home page when signOut fails", async () => {
      vi.mocked(userApi.deleteAccount).mockResolvedValue();
      vi.mocked(firebaseAuth.signOut).mockRejectedValue(new Error('Sign out failed'));

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe("ProfileCard_ShouldShowError_WhenDeletionFails", () => {
    it("shows error toast when API returns 401", async () => {
      vi.mocked(userApi.deleteAccount).mockRejectedValue(new Error('Unauthorized'));
      vi.mocked(firebaseAuth.signOut).mockResolvedValue();

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(toastHook.addToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'Session expired. Please sign in again.',
      });
    });

    it("signs out user when API returns 401", async () => {
      vi.mocked(userApi.deleteAccount).mockRejectedValue(new Error('Unauthorized'));
      vi.mocked(firebaseAuth.signOut).mockResolvedValue();

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(firebaseAuth.signOut).toHaveBeenCalled();
    });

    it("clears session cookie when API returns 401", async () => {
      vi.mocked(userApi.deleteAccount).mockRejectedValue(new Error('Unauthorized'));
      vi.mocked(firebaseAuth.signOut).mockResolvedValue();

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(document.cookie).toContain('session=; path=/; max-age=0');
    });

    it("redirects to login page when API returns 401", async () => {
      vi.mocked(userApi.deleteAccount).mockRejectedValue(new Error('Unauthorized'));
      vi.mocked(firebaseAuth.signOut).mockResolvedValue();

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it("closes dialog when API returns 401", async () => {
      vi.mocked(userApi.deleteAccount).mockRejectedValue(new Error('Unauthorized'));
      vi.mocked(firebaseAuth.signOut).mockResolvedValue();

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Dialog should be closed (not visible)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it("shows specific error toast when API returns 404", async () => {
      vi.mocked(userApi.deleteAccount).mockRejectedValue(new Error('Account not found'));

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(toastHook.addToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'Account not found. It may have already been deleted.',
      });
    });

    it("closes dialog when API returns 404", async () => {
      vi.mocked(userApi.deleteAccount).mockRejectedValue(new Error('Account not found'));

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Dialog should be closed (not visible)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it("shows generic error toast for other failures", async () => {
      vi.mocked(userApi.deleteAccount).mockRejectedValue(new Error('Failed to delete account'));

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(toastHook.addToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'Failed to delete account',
      });
    });

    it("closes dialog for generic errors", async () => {
      vi.mocked(userApi.deleteAccount).mockRejectedValue(new Error('Failed to delete account'));

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Dialog should be closed (not visible)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it("does not call signOut for non-401 errors", async () => {
      vi.mocked(userApi.deleteAccount).mockRejectedValue(new Error('Failed to delete account'));

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(firebaseAuth.signOut).not.toHaveBeenCalled();
    });

    it("does not redirect to home for non-401 errors", async () => {
      vi.mocked(userApi.deleteAccount).mockRejectedValue(new Error('Failed to delete account'));

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("ProfileCard_ShouldHandleNetworkError_WhenNetworkFailureOccurs", () => {
    it("shows network error toast when network error occurs", async () => {
      vi.mocked(userApi.deleteAccount).mockRejectedValue(
        new Error('Network error. Please check your connection and try again.')
      );

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(toastHook.addToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'Network error. Please check your connection and try again.',
      });
    });

    it("closes dialog when network error occurs", async () => {
      vi.mocked(userApi.deleteAccount).mockRejectedValue(
        new Error('Network error. Please check your connection and try again.')
      );

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Dialog should be closed (not visible)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it("does not call signOut for network errors", async () => {
      vi.mocked(userApi.deleteAccount).mockRejectedValue(
        new Error('Network error. Please check your connection and try again.')
      );

      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);
      await openDialogAndConfirm();

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(firebaseAuth.signOut).not.toHaveBeenCalled();
    });
  });
});

describe("ProfileCard - Display Name Update", () => {
  const mockProfile = {
    id: "user-123",
    email: "test@example.com",
    displayName: "TestUser",
    createdAt: "2024-01-01T00:00:00Z",
  };
  const mockIdToken = "test-id-token";
  const mockPush = vi.fn();
  const mockRouterReturn = { push: mockPush };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouterReturn);
  });

  describe("ProfileCard_ShouldRenderDisplayNameForm_WhenLoaded", () => {
    it("renders DisplayNameForm with current display name", () => {
      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);

      const displayNameForm = screen.getByTestId("display-name-form");
      expect(displayNameForm).toBeInTheDocument();
      
      const currentName = screen.getByTestId("current-name");
      expect(currentName).toHaveTextContent("TestUser");
    });

    it("renders DisplayNameForm with null display name", () => {
      const profileWithoutName = { ...mockProfile, displayName: null };
      render(<ProfileCard profile={profileWithoutName} idToken={mockIdToken} />);

      const displayNameForm = screen.getByTestId("display-name-form");
      expect(displayNameForm).toBeInTheDocument();
      
      const currentName = screen.getByTestId("current-name");
      expect(currentName).toBeEmptyDOMElement();
    });
  });

  describe("ProfileCard_ShouldUpdateProfile_WhenDisplayNameChanged", () => {
    it("updates local profile state when display name is updated", () => {
      render(<ProfileCard profile={mockProfile} idToken={mockIdToken} />);

      // Verify initial name
      let currentName = screen.getByTestId("current-name");
      expect(currentName).toHaveTextContent("TestUser");

      // Trigger update
      const updateButton = screen.getByRole("button", { name: /update name/i });
      fireEvent.click(updateButton);

      // Verify name was updated
      currentName = screen.getByTestId("current-name");
      expect(currentName).toHaveTextContent("UpdatedName");
    });
  });
});

