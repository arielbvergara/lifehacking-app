import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DisplayNameForm } from "./display-name-form";
import { vi } from "vitest";
import * as userApi from "@/lib/api/user";
import * as toastHook from "@/lib/hooks/use-toast";
import * as firebaseAuth from "@/lib/auth/firebase-auth";
import { useRouter } from "next/navigation";

// Mock the API module
vi.mock("@/lib/api/user", () => ({
  updateDisplayName: vi.fn(),
}));

// Mock the toast hook
vi.mock("@/lib/hooks/use-toast", () => ({
  addToast: vi.fn(),
}));

// Mock Firebase auth
vi.mock("@/lib/auth/firebase-auth", () => ({
  signOut: vi.fn(),
}));

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("DisplayNameForm", () => {
  const mockOnUpdate = vi.fn();
  const mockIdToken = "test-id-token";
  const mockPush = vi.fn();
  const mockRouterReturn = { push: mockPush };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouterReturn);
    
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  describe("DisplayNameForm_ShouldRenderCorrectly_WhenMounted", () => {
    it("renders with current display name", () => {
      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      expect(input).toHaveValue("JohnDoe");
    });

    it("renders with empty value when currentName is null", () => {
      render(
        <DisplayNameForm
          currentName={null}
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      expect(input).toHaveValue("");
    });

    it("renders save button", () => {
      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const saveButton = screen.getByRole("button", { name: /save/i });
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe("DisplayNameForm_ShouldShowValidationError_WhenInputIsEmpty", () => {
    it("shows error for empty input", async () => {
      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      fireEvent.change(input, { target: { value: "" } });

      await waitFor(() => {
        expect(screen.getByText(/display name cannot be empty/i)).toBeInTheDocument();
      });
    });

    it("shows error for whitespace-only input", async () => {
      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      fireEvent.change(input, { target: { value: "   " } });

      await waitFor(() => {
        expect(screen.getByText(/display name cannot be empty/i)).toBeInTheDocument();
      });
    });
  });

  describe("DisplayNameForm_ShouldShowValidationError_WhenInputContainsSpecialCharacters", () => {
    it("shows error for special characters", async () => {
      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      fireEvent.change(input, { target: { value: "John@Doe" } });

      await waitFor(() => {
        expect(
          screen.getByText(/display name can only contain letters and numbers/i)
        ).toBeInTheDocument();
      });
    });

    it("shows error for emoji input", async () => {
      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      fireEvent.change(input, { target: { value: "John😀Doe" } });

      await waitFor(() => {
        expect(
          screen.getByText(/display name can only contain letters and numbers/i)
        ).toBeInTheDocument();
      });
    });

    it("shows error for spaces in input", async () => {
      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      fireEvent.change(input, { target: { value: "John Doe" } });

      await waitFor(() => {
        expect(
          screen.getByText(/display name can only contain letters and numbers/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("DisplayNameForm_ShouldClearValidationError_WhenInputBecomesValid", () => {
    it("clears error when input becomes valid", async () => {
      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      
      // Enter invalid input
      fireEvent.change(input, { target: { value: "John@Doe" } });
      
      await waitFor(() => {
        expect(
          screen.getByText(/display name can only contain letters and numbers/i)
        ).toBeInTheDocument();
      });

      // Enter valid input
      fireEvent.change(input, { target: { value: "JohnDoe123" } });

      await waitFor(() => {
        expect(
          screen.queryByText(/display name can only contain letters and numbers/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("DisplayNameForm_ShouldDisableSubmitButton_WhenValidationFails", () => {
    it("disables submit button for empty input", async () => {
      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      const saveButton = screen.getByRole("button", { name: /save/i });

      fireEvent.change(input, { target: { value: "" } });

      await waitFor(() => {
        expect(saveButton).toBeDisabled();
      });
    });

    it("disables submit button for invalid characters", async () => {
      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      const saveButton = screen.getByRole("button", { name: /save/i });

      fireEvent.change(input, { target: { value: "John@Doe" } });

      await waitFor(() => {
        expect(saveButton).toBeDisabled();
      });
    });
  });

  describe("DisplayNameForm_ShouldEnableSubmitButton_WhenValidationPasses", () => {
    it("enables submit button for valid alphanumeric input", async () => {
      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      const saveButton = screen.getByRole("button", { name: /save/i });

      fireEvent.change(input, { target: { value: "JohnDoe123" } });

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });
  });

  describe("DisplayNameForm_ShouldCallAPI_WhenSubmittedWithValidInput", () => {
    it("calls API with trimmed input", async () => {
      vi.mocked(userApi.updateDisplayName).mockResolvedValueOnce(undefined);

      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      const saveButton = screen.getByRole("button", { name: /save/i });

      fireEvent.change(input, { target: { value: "  NewName123  " } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(userApi.updateDisplayName).toHaveBeenCalledWith(
          mockIdToken,
          "NewName123"
        );
      });
    });

    it("calls onUpdate callback on successful API call", async () => {
      vi.mocked(userApi.updateDisplayName).mockResolvedValueOnce(undefined);

      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      const saveButton = screen.getByRole("button", { name: /save/i });

      fireEvent.change(input, { target: { value: "NewName123" } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith("NewName123");
      });
    });

    it("shows success toast on successful API call", async () => {
      vi.mocked(userApi.updateDisplayName).mockResolvedValueOnce(undefined);

      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      const saveButton = screen.getByRole("button", { name: /save/i });

      fireEvent.change(input, { target: { value: "NewName123" } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toastHook.addToast).toHaveBeenCalledWith({
          type: "success",
          message: "Display name updated successfully",
          duration: 5000,
        });
      });
    });
  });

  describe("DisplayNameForm_ShouldShowLoadingState_WhenAPICallInProgress", () => {
    it("shows loading state during API call", async () => {
      vi.mocked(userApi.updateDisplayName).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      const saveButton = screen.getByRole("button", { name: /save/i });

      fireEvent.change(input, { target: { value: "NewName123" } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/saving/i)).toBeInTheDocument();
        expect(input).toBeDisabled();
        expect(saveButton).toBeDisabled();
      });
    });
  });

  describe("DisplayNameForm_ShouldShowErrorMessage_WhenAPICallFails", () => {
    it("shows error toast on API failure", async () => {
      vi.mocked(userApi.updateDisplayName).mockRejectedValueOnce(
        new Error("Failed to update display name")
      );

      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      const saveButton = screen.getByRole("button", { name: /save/i });

      fireEvent.change(input, { target: { value: "NewName123" } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toastHook.addToast).toHaveBeenCalledWith({
          type: "error",
          message: "Failed to update display name",
          duration: 5000,
        });
      });
    });

    it("shows error toast for backend validation error", async () => {
      vi.mocked(userApi.updateDisplayName).mockRejectedValueOnce(
        new Error("Name too short")
      );

      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      const saveButton = screen.getByRole("button", { name: /save/i });

      fireEvent.change(input, { target: { value: "NewName123" } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toastHook.addToast).toHaveBeenCalledWith({
          type: "error",
          message: "Name too short",
          duration: 5000,
        });
      });
    });
  });

  describe("DisplayNameForm_ShouldHandleUnauthorized_When401ErrorOccurs", () => {
    it("shows session expired toast and redirects to login on 401 error", async () => {
      vi.mocked(userApi.updateDisplayName).mockRejectedValueOnce(
        new Error("Unauthorized")
      );
      vi.mocked(firebaseAuth.signOut).mockResolvedValueOnce();

      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      const saveButton = screen.getByRole("button", { name: /save/i });

      fireEvent.change(input, { target: { value: "NewName123" } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toastHook.addToast).toHaveBeenCalledWith({
          type: "error",
          message: "Session expired. Please sign in again.",
          duration: 5000,
        });
      });

      // Verify signOut was called
      expect(firebaseAuth.signOut).toHaveBeenCalled();

      // Verify session cookie was cleared
      expect(document.cookie).toContain('session=; path=/; max-age=0');

      // Verify redirect to login
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe("DisplayNameForm_ShouldHandleNetworkError_WhenNetworkFailureOccurs", () => {
    it("shows network error toast when network error occurs", async () => {
      vi.mocked(userApi.updateDisplayName).mockRejectedValueOnce(
        new Error("Network error. Please check your connection and try again.")
      );

      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      const saveButton = screen.getByRole("button", { name: /save/i });

      fireEvent.change(input, { target: { value: "NewName123" } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toastHook.addToast).toHaveBeenCalledWith({
          type: "error",
          message: "Network error. Please check your connection and try again.",
          duration: 5000,
        });
      });
    });

    it("shows network error toast for TypeError with fetch", async () => {
      const networkError = new TypeError("Failed to fetch");
      vi.mocked(userApi.updateDisplayName).mockRejectedValueOnce(networkError);

      render(
        <DisplayNameForm
          currentName="JohnDoe"
          idToken={mockIdToken}
          onUpdate={mockOnUpdate}
        />
      );

      const input = screen.getByLabelText(/display name/i);
      const saveButton = screen.getByRole("button", { name: /save/i });

      fireEvent.change(input, { target: { value: "NewName123" } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toastHook.addToast).toHaveBeenCalledWith({
          type: "error",
          message: "Network error. Please check your connection and try again.",
          duration: 5000,
        });
      });
    });
  });
});
