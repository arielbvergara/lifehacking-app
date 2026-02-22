import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserForm } from './user-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { createAdminUser } from '@/lib/api/admin-user';
import { useToast } from '@/lib/hooks/use-toast';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/api/admin-user', () => ({
  createAdminUser: vi.fn(),
}));

vi.mock('@/lib/hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

describe('UserForm', () => {
  const mockPush = vi.fn();
  const mockShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ idToken: 'test-token' });
    (useToast as ReturnType<typeof vi.fn>).mockReturnValue({ showToast: mockShowToast });
  });

  describe('UserForm_Should_DisplayFormFields_When_Rendered', () => {
    it('should display email field', () => {
      render(<UserForm />);

      expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('admin@example.com')).toBeInTheDocument();
    });

    it('should display display name field', () => {
      render(<UserForm />);

      expect(screen.getByLabelText(/Display Name/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    });

    it('should display password field', () => {
      render(<UserForm />);

      expect(screen.getByLabelText(/^Password/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Minimum 8 characters')).toBeInTheDocument();
    });

    it('should display confirm password field', () => {
      render(<UserForm />);

      expect(screen.getByLabelText(/Confirm Password/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Re-enter password')).toBeInTheDocument();
    });

    it('should display required field indicators', () => {
      render(<UserForm />);

      const requiredIndicators = screen.getAllByText('*');
      expect(requiredIndicators.length).toBeGreaterThan(0);
    });

    it('should display submit button', () => {
      render(<UserForm />);

      expect(screen.getByRole('button', { name: /Create Admin User/ })).toBeInTheDocument();
    });

    it('should display cancel button', () => {
      render(<UserForm />);

      expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument();
    });
  });

  describe('UserForm_Should_ValidateEmail_When_Submitted', () => {
    it('should show error when email is empty', async () => {
      const user = userEvent.setup();
      render(<UserForm />);

      const submitButton = screen.getByRole('button', { name: /Create Admin User/ });
      await user.click(submitButton);

      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('should clear email error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<UserForm />);

      const submitButton = screen.getByRole('button', { name: /Create Admin User/ });
      await user.click(submitButton);

      expect(screen.getByText('Email is required')).toBeInTheDocument();

      const emailInput = screen.getByLabelText(/Email Address/);
      await user.type(emailInput, 'test@example.com');

      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });

  describe('UserForm_Should_ValidateDisplayName_When_Submitted', () => {
    it('should show error when display name is empty', async () => {
      const user = userEvent.setup();
      render(<UserForm />);

      const submitButton = screen.getByRole('button', { name: /Create Admin User/ });
      await user.click(submitButton);

      expect(screen.getByText('Display name is required')).toBeInTheDocument();
    });

    it('should show error when display name is too short', async () => {
      const user = userEvent.setup();
      render(<UserForm />);

      const displayNameInput = screen.getByLabelText(/Display Name/);
      await user.type(displayNameInput, 'A');

      const submitButton = screen.getByRole('button', { name: /Create Admin User/ });
      await user.click(submitButton);

      expect(screen.getByText('Display name must be at least 2 characters')).toBeInTheDocument();
    });

    it('should show error when display name is too long', async () => {
      const user = userEvent.setup();
      render(<UserForm />);

      const displayNameInput = screen.getByLabelText(/Display Name/);
      await user.type(displayNameInput, 'A'.repeat(101));

      const submitButton = screen.getByRole('button', { name: /Create Admin User/ });
      await user.click(submitButton);

      expect(screen.getByText('Display name cannot exceed 100 characters')).toBeInTheDocument();
    });
  });

  describe('UserForm_Should_ValidatePassword_When_Submitted', () => {
    it('should show error when password is empty', async () => {
      const user = userEvent.setup();
      render(<UserForm />);

      const submitButton = screen.getByRole('button', { name: /Create Admin User/ });
      await user.click(submitButton);

      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('should show error when password is too short', async () => {
      const user = userEvent.setup();
      render(<UserForm />);

      const passwordInput = screen.getByLabelText(/^Password/);
      await user.type(passwordInput, 'Short1!');

      const submitButton = screen.getByRole('button', { name: /Create Admin User/ });
      await user.click(submitButton);

      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });

    it('should show error when password lacks lowercase letter', async () => {
      const user = userEvent.setup();
      render(<UserForm />);

      const passwordInput = screen.getByLabelText(/^Password/);
      await user.type(passwordInput, 'PASSWORD1!');

      const submitButton = screen.getByRole('button', { name: /Create Admin User/ });
      await user.click(submitButton);

      expect(screen.getByText('Password must include at least one lowercase letter')).toBeInTheDocument();
    });

    it('should show error when password lacks uppercase letter', async () => {
      const user = userEvent.setup();
      render(<UserForm />);

      const passwordInput = screen.getByLabelText(/^Password/);
      await user.type(passwordInput, 'password1!');

      const submitButton = screen.getByRole('button', { name: /Create Admin User/ });
      await user.click(submitButton);

      expect(screen.getByText('Password must include at least one uppercase letter')).toBeInTheDocument();
    });

    it('should show error when password lacks number', async () => {
      const user = userEvent.setup();
      render(<UserForm />);

      const passwordInput = screen.getByLabelText(/^Password/);
      await user.type(passwordInput, 'Password!');

      const submitButton = screen.getByRole('button', { name: /Create Admin User/ });
      await user.click(submitButton);

      expect(screen.getByText('Password must include at least one number')).toBeInTheDocument();
    });

    it('should show error when password lacks special character', async () => {
      const user = userEvent.setup();
      render(<UserForm />);

      const passwordInput = screen.getByLabelText(/^Password/);
      await user.type(passwordInput, 'Password1');

      const submitButton = screen.getByRole('button', { name: /Create Admin User/ });
      await user.click(submitButton);

      expect(screen.getByText('Password must include at least one special character')).toBeInTheDocument();
    });
  });

  describe('UserForm_Should_ValidateConfirmPassword_When_Submitted', () => {
    it('should show error when confirm password is empty', async () => {
      const user = userEvent.setup();
      render(<UserForm />);

      const submitButton = screen.getByRole('button', { name: /Create Admin User/ });
      await user.click(submitButton);

      expect(screen.getByText('Please confirm password')).toBeInTheDocument();
    });

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<UserForm />);

      const passwordInput = screen.getByLabelText(/^Password/);
      await user.type(passwordInput, 'Password1!');

      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/);
      await user.type(confirmPasswordInput, 'Different1!');

      const submitButton = screen.getByRole('button', { name: /Create Admin User/ });
      await user.click(submitButton);

      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  describe('UserForm_Should_SubmitForm_When_ValidationPasses', () => {
    it('should call createAdminUser with correct data when form is valid', async () => {
      const user = userEvent.setup();
      (createAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue({});

      render(<UserForm />);

      await user.type(screen.getByLabelText(/Email Address/), 'admin@example.com');
      await user.type(screen.getByLabelText(/Display Name/), 'Admin User');
      await user.type(screen.getByLabelText(/^Password/), 'Password1!');
      await user.type(screen.getByLabelText(/Confirm Password/), 'Password1!');

      const submitButton = screen.getByRole('button', { name: /Create Admin User/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(createAdminUser).toHaveBeenCalledWith(
          {
            email: 'admin@example.com',
            displayName: 'Admin User',
            password: 'Password1!',
          },
          'test-token'
        );
      });
    });

    it('should show success toast when user is created successfully', async () => {
      const user = userEvent.setup();
      (createAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue({});

      render(<UserForm />);

      await user.type(screen.getByLabelText(/Email Address/), 'admin@example.com');
      await user.type(screen.getByLabelText(/Display Name/), 'Admin User');
      await user.type(screen.getByLabelText(/^Password/), 'Password1!');
      await user.type(screen.getByLabelText(/Confirm Password/), 'Password1!');

      const submitButton = screen.getByRole('button', { name: /Create Admin User/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          type: 'success',
          message: 'Admin user created successfully',
          duration: 5000,
        });
      });
    });

    it('should navigate to users page when user is created successfully', async () => {
      const user = userEvent.setup();
      (createAdminUser as ReturnType<typeof vi.fn>).mockResolvedValue({});

      render(<UserForm />);

      await user.type(screen.getByLabelText(/Email Address/), 'admin@example.com');
      await user.type(screen.getByLabelText(/Display Name/), 'Admin User');
      await user.type(screen.getByLabelText(/^Password/), 'Password1!');
      await user.type(screen.getByLabelText(/Confirm Password/), 'Password1!');

      const submitButton = screen.getByRole('button', { name: /Create Admin User/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/users');
      });
    });

    it('should show error toast when creation fails', async () => {
      const user = userEvent.setup();
      (createAdminUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Creation failed'));

      render(<UserForm />);

      await user.type(screen.getByLabelText(/Email Address/), 'admin@example.com');
      await user.type(screen.getByLabelText(/Display Name/), 'Admin User');
      await user.type(screen.getByLabelText(/^Password/), 'Password1!');
      await user.type(screen.getByLabelText(/Confirm Password/), 'Password1!');

      const submitButton = screen.getByRole('button', { name: /Create Admin User/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'Creation failed',
          duration: 7000,
        });
      });
    });

    it('should display loading state during submission', async () => {
      const user = userEvent.setup();
      (createAdminUser as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<UserForm />);

      await user.type(screen.getByLabelText(/Email Address/), 'admin@example.com');
      await user.type(screen.getByLabelText(/Display Name/), 'Admin User');
      await user.type(screen.getByLabelText(/^Password/), 'Password1!');
      await user.type(screen.getByLabelText(/Confirm Password/), 'Password1!');

      const submitButton = screen.getByRole('button', { name: /Create Admin User/ });
      await user.click(submitButton);

      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });
  });

  describe('UserForm_Should_HandleCancelAction_When_CancelButtonClicked', () => {
    it('should navigate to users page when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<UserForm />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/ });
      await user.click(cancelButton);

      expect(mockPush).toHaveBeenCalledWith('/admin/users');
    });
  });

  describe('UserForm_Should_DisableInputs_When_Submitting', () => {
    it('should disable all inputs during submission', async () => {
      const user = userEvent.setup();
      (createAdminUser as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<UserForm />);

      await user.type(screen.getByLabelText(/Email Address/), 'admin@example.com');
      await user.type(screen.getByLabelText(/Display Name/), 'Admin User');
      await user.type(screen.getByLabelText(/^Password/), 'Password1!');
      await user.type(screen.getByLabelText(/Confirm Password/), 'Password1!');

      const submitButton = screen.getByRole('button', { name: /Create Admin User/ });
      await user.click(submitButton);

      expect(screen.getByLabelText(/Email Address/)).toBeDisabled();
      expect(screen.getByLabelText(/Display Name/)).toBeDisabled();
      expect(screen.getByLabelText(/^Password/)).toBeDisabled();
      expect(screen.getByLabelText(/Confirm Password/)).toBeDisabled();
    });
  });
});
