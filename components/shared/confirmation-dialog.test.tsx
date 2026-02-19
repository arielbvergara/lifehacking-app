import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmationDialog } from './confirmation-dialog';

describe('ConfirmationDialog', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Test Title',
    message: 'Test message',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('Should_RenderWithTitleAndMessage_When_DialogIsOpen', () => {
    render(<ConfirmationDialog {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('Should_NotRender_When_DialogIsClosed', () => {
    render(<ConfirmationDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('Should_DisableConfirmButton_When_ConfirmTextProvidedAndInputEmpty', () => {
    render(
      <ConfirmationDialog
        {...defaultProps}
        confirmText="DELETE"
      />
    );

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toBeDisabled();
  });

  it('Should_DisableConfirmButton_When_TypedTextDoesNotMatch', async () => {
    const user = userEvent.setup();
    render(
      <ConfirmationDialog
        {...defaultProps}
        confirmText="DELETE"
      />
    );

    const input = screen.getByLabelText(/type delete to confirm/i);
    await user.type(input, 'WRONG');

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toBeDisabled();
  });

  it('Should_EnableConfirmButton_When_TypedTextMatchesExactly', async () => {
    const user = userEvent.setup();
    render(
      <ConfirmationDialog
        {...defaultProps}
        confirmText="DELETE"
      />
    );

    const input = screen.getByLabelText(/type delete to confirm/i);
    await user.type(input, 'DELETE');

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toBeEnabled();
  });

  it('Should_EnableConfirmButton_When_NoConfirmTextProvided', () => {
    render(<ConfirmationDialog {...defaultProps} />);

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toBeEnabled();
  });

  it('Should_CallOnConfirm_When_ConfirmButtonClicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />);

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('Should_CallOnCancel_When_CancelButtonClicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ConfirmationDialog {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('Should_ShowTypedConfirmationInput_When_ConfirmTextProvided', () => {
    render(
      <ConfirmationDialog
        {...defaultProps}
        confirmText="DELETE"
      />
    );

    const input = screen.getByLabelText(/type delete to confirm/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'DELETE');
  });

  it('Should_NotShowTypedConfirmationInput_When_ConfirmTextNotProvided', () => {
    render(<ConfirmationDialog {...defaultProps} />);

    const input = screen.queryByRole('textbox');
    expect(input).not.toBeInTheDocument();
  });

  it('Should_ResetTypedConfirmation_When_DialogReopens', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ConfirmationDialog
        {...defaultProps}
        confirmText="DELETE"
      />
    );

    const input = screen.getByLabelText(/type delete to confirm/i);
    await user.type(input, 'DELETE');
    expect(input).toHaveValue('DELETE');

    // Close dialog
    rerender(
      <ConfirmationDialog
        {...defaultProps}
        isOpen={false}
        confirmText="DELETE"
      />
    );

    // Reopen dialog
    rerender(
      <ConfirmationDialog
        {...defaultProps}
        isOpen={true}
        confirmText="DELETE"
      />
    );

    const newInput = screen.getByLabelText(/type delete to confirm/i);
    expect(newInput).toHaveValue('');
  });

  it('Should_UseCustomButtonLabels_When_Provided', () => {
    render(
      <ConfirmationDialog
        {...defaultProps}
        confirmButtonLabel="Delete"
        cancelButtonLabel="Go Back"
      />
    );

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  it('Should_ApplyDangerVariantStyles_When_VariantIsDanger', () => {
    render(
      <ConfirmationDialog
        {...defaultProps}
        variant="danger"
      />
    );

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toHaveClass('bg-red-600');
  });

  it('Should_ApplyWarningVariantStyles_When_VariantIsWarning', () => {
    render(
      <ConfirmationDialog
        {...defaultProps}
        variant="warning"
      />
    );

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toHaveClass('bg-yellow-600');
  });

  it('Should_ApplyInfoVariantStyles_When_VariantIsInfo', () => {
    render(
      <ConfirmationDialog
        {...defaultProps}
        variant="info"
      />
    );

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toHaveClass('bg-blue-600');
  });

  it('Should_HaveProperAriaAttributes_When_Rendered', () => {
    render(<ConfirmationDialog {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'dialog-description');
  });

  describe('Loading State', () => {
    it('Should_ShowLoadingSpinner_When_ConfirmButtonClickedWithAsyncAction', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Check for loading spinner (svg with animate-spin class)
      const spinner = confirmButton.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('Should_DisableAllButtons_When_LoadingStateIsActive', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      await user.click(confirmButton);

      expect(confirmButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('Should_DisableTypedConfirmationInput_When_LoadingStateIsActive', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(
        <ConfirmationDialog
          {...defaultProps}
          confirmText="DELETE"
          onConfirm={onConfirm}
        />
      );

      const input = screen.getByLabelText(/type delete to confirm/i);
      await user.type(input, 'DELETE');

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      expect(input).toBeDisabled();
    });

    it('Should_PreventClosingOnOverlayClick_When_LoadingStateIsActive', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      const onConfirm = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(
        <ConfirmationDialog
          {...defaultProps}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Try to click overlay (the dialog backdrop)
      const overlay = screen.getByRole('dialog');
      await user.click(overlay);

      expect(onCancel).not.toHaveBeenCalled();
    });

    it('Should_PreventClosingOnEscapeKey_When_LoadingStateIsActive', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      const onConfirm = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(
        <ConfirmationDialog
          {...defaultProps}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Try to press Escape
      await user.keyboard('{Escape}');

      expect(onCancel).not.toHaveBeenCalled();
    });

    it('Should_ReEnableButtons_When_AsyncActionCompletes', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      await user.click(confirmButton);

      // Wait for async action to complete
      await vi.waitFor(() => {
        expect(confirmButton).toBeEnabled();
        expect(cancelButton).toBeEnabled();
      });
    });

    it('Should_RemoveLoadingSpinner_When_AsyncActionCompletes', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Wait for async action to complete
      await vi.waitFor(() => {
        const spinner = confirmButton.querySelector('.animate-spin');
        expect(spinner).not.toBeInTheDocument();
      });
    });

    it('Should_ReEnableButtons_When_AsyncActionFails', async () => {
      const user = userEvent.setup();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onConfirm = vi.fn().mockRejectedValue(new Error('Test error'));
      render(<ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      await user.click(confirmButton);

      // Wait for async action to fail and loading state to clear
      await vi.waitFor(() => {
        expect(confirmButton).toBeEnabled();
        expect(cancelButton).toBeEnabled();
      });

      consoleError.mockRestore();
    });

    it('Should_ResetLoadingState_When_DialogReopens', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const { rerender } = render(
        <ConfirmationDialog {...defaultProps} onConfirm={onConfirm} />
      );

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Verify loading state is active
      expect(confirmButton).toBeDisabled();

      // Close dialog
      rerender(<ConfirmationDialog {...defaultProps} isOpen={false} onConfirm={onConfirm} />);

      // Reopen dialog
      rerender(<ConfirmationDialog {...defaultProps} isOpen={true} onConfirm={onConfirm} />);

      // Verify loading state is reset
      const newConfirmButton = screen.getByRole('button', { name: /confirm/i });
      expect(newConfirmButton).toBeEnabled();
    });
  });
});
