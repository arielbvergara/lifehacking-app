'use client';

import { useEffect, useRef, useState } from 'react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

/**
 * ConfirmationDialog Component
 * 
 * A reusable modal dialog for confirming actions with overlay and focus trap.
 * Supports keyboard navigation (Escape to close) and click-outside-to-close behavior.
 * Optionally requires typed confirmation for destructive actions.
 * 
 * @example
 * <ConfirmationDialog
 *   isOpen={showDialog}
 *   title="Confirm Action"
 *   message="Are you sure you want to proceed?"
 *   confirmText="DELETE"
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 *   variant="danger"
 * />
 */
export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText,
  confirmButtonLabel = 'Confirm',
  cancelButtonLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'info',
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [typedConfirmation, setTypedConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset typed confirmation and loading state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setTypedConfirmation('');
      setIsLoading(false);
    }
  }, [isOpen]);

  // Handle ESC key to close dialog (unless loading)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      // Focus the cancel button when dialog opens
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 0);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isLoading, onCancel]);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const dialog = dialogRef.current;
    const focusableElements = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    dialog.addEventListener('keydown', handleTabKey);

    return () => {
      dialog.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        };
      case 'info':
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        };
    }
  };

  const styles = getVariantStyles();

  // Determine if confirm button should be enabled
  const isConfirmEnabled = !isLoading && (confirmText ? typedConfirmation === confirmText : true);

  // Handle confirm action with loading state
  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      // Error handling is the responsibility of the onConfirm callback
      // We just ensure loading state is cleared
      console.error('Confirmation action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel action (prevent during loading)
  const handleCancel = () => {
    if (!isLoading) {
      onCancel();
    }
  };

  // Handle overlay click (prevent during loading)
  const handleOverlayClick = () => {
    if (!isLoading) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <div
        ref={dialogRef}
        className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg} mb-4`}>
          {variant === 'danger' && (
            <svg
              className={`h-6 w-6 ${styles.iconColor}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          {variant === 'warning' && (
            <svg
              className={`h-6 w-6 ${styles.iconColor}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          {variant === 'info' && (
            <svg
              className={`h-6 w-6 ${styles.iconColor}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        {/* Title */}
        <h3
          id="dialog-title"
          className="text-lg font-semibold text-gray-900 text-center mb-2"
        >
          {title}
        </h3>

        {/* Message */}
        <p
          id="dialog-description"
          className="text-sm text-gray-600 text-center mb-6"
        >
          {message}
        </p>

        {/* Typed Confirmation Input */}
        {confirmText && (
          <div className="mb-6">
            <label htmlFor="confirm-input" className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-semibold">{confirmText}</span> to confirm
            </label>
            <input
              id="confirm-input"
              type="text"
              value={typedConfirmation}
              onChange={(e) => setTypedConfirmation(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={confirmText}
              autoComplete="off"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelButtonLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isConfirmEnabled}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.confirmButton} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {isLoading && (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {confirmButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
