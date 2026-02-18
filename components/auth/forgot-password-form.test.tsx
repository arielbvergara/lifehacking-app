import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ForgotPasswordForm } from "./forgot-password-form";
import { useAuth } from "@/lib/auth/auth-context";
import { vi } from "vitest";

// Mock Firebase
vi.mock("@/lib/firebase", () => ({
  auth: {},
}));

// Mock the useAuth hook
vi.mock("@/lib/auth/auth-context");
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  },
}));

describe("ForgotPasswordForm", () => {
  const mockResetPassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      resetPassword: mockResetPassword,
      user: null,
      idToken: null,
      loading: false,
      error: null,
      signInWithGoogle: vi.fn(),
      signInWithEmail: vi.fn(),
      signOut: vi.fn(),
      signUpWithGoogle: vi.fn(),
      signUpWithEmail: vi.fn(),
    });
  });

  describe("ForgotPasswordForm_ShouldRenderCorrectly_WhenMounted", () => {
    it("renders email input field", () => {
      render(<ForgotPasswordForm />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("placeholder", "hello@example.com");
    });

    it("renders submit button", () => {
      render(<ForgotPasswordForm />);
      
      const submitButton = screen.getByRole("button", { name: /send reset link/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });

    it("renders back to login link", () => {
      render(<ForgotPasswordForm />);
      
      const backLink = screen.getByRole("link", { name: /back to login/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute("href", "/login");
    });
  });

  describe("ForgotPasswordForm_ShouldValidateEmail_WhenSubmitted", () => {
    it("requires email field", async () => {
      render(<ForgotPasswordForm />);
      
      const submitButton = screen.getByRole("button", { name: /send reset link/i });
      fireEvent.click(submitButton);

      // HTML5 validation should prevent submission
      expect(mockResetPassword).not.toHaveBeenCalled();
    });

    it("accepts valid email format", async () => {
      mockResetPassword.mockResolvedValueOnce(undefined);
      render(<ForgotPasswordForm />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith("test@example.com");
      });
    });
  });

  describe("ForgotPasswordForm_ShouldShowLoadingState_WhenSubmitting", () => {
    it("disables form during submission", async () => {
      mockResetPassword.mockImplementation(() => new Promise(() => {})); // Never resolves
      render(<ForgotPasswordForm />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/sending/i)).toBeInTheDocument();
      });
    });
  });

  describe("ForgotPasswordForm_ShouldShowSuccessMessage_WhenEmailSent", () => {
    it("displays success message after successful submission", async () => {
      mockResetPassword.mockResolvedValueOnce(undefined);
      render(<ForgotPasswordForm />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
        expect(screen.getByText(/we've sent you a password reset link/i)).toBeInTheDocument();
      });
    });

    it("calls onSuccess callback after successful submission", async () => {
      mockResetPassword.mockResolvedValueOnce(undefined);
      const onSuccess = vi.fn();
      render(<ForgotPasswordForm onSuccess={onSuccess} />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it("disables form after successful submission", async () => {
      mockResetPassword.mockResolvedValueOnce(undefined);
      render(<ForgotPasswordForm />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/email sent/i)).toBeInTheDocument();
      });
    });
  });

  describe("ForgotPasswordForm_ShouldShowErrorMessage_WhenSubmissionFails", () => {
    it("displays error message on failure", async () => {
      const error = { code: "auth/too-many-requests" };
      mockResetPassword.mockRejectedValueOnce(error);
      render(<ForgotPasswordForm />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/too many attempts/i)).toBeInTheDocument();
      });
    });

    it("allows retry after error", async () => {
      const error = { code: "auth/network-request-failed" };
      mockResetPassword.mockRejectedValueOnce(error);
      render(<ForgotPasswordForm />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Form should be enabled for retry
      expect(emailInput).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
    });

    it("clears previous error on new submission", async () => {
      const error = { code: "auth/network-request-failed" };
      mockResetPassword.mockRejectedValueOnce(error).mockResolvedValueOnce(undefined);
      render(<ForgotPasswordForm />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole("button", { name: /send reset link/i });

      // First submission - error
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Second submission - success
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
      
      // Error should be cleared
      expect(screen.queryByText(/network error/i)).not.toBeInTheDocument();
    });
  });
});
