'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateDisplayName } from '@/lib/api/user';
import { addToast } from '@/lib/hooks/use-toast';
import { signOut } from '@/lib/auth/firebase-auth';

interface DisplayNameFormProps {
  currentName: string | null;
  idToken: string;
  onUpdate: (newName: string) => void;
}

/**
 * DisplayNameForm Component
 * 
 * Provides an editable form for updating the user's display name with real-time validation.
 * Validates that the display name is alphanumeric only and not empty/whitespace.
 */
export function DisplayNameForm({ currentName, idToken, onUpdate }: DisplayNameFormProps) {
  const [displayName, setDisplayName] = useState(currentName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const router = useRouter();

  // Reset form when currentName changes
  useEffect(() => {
    setDisplayName(currentName || '');
    setValidationError(null);
  }, [currentName]);

  // Validate display name in real-time
  const validateDisplayName = (value: string): string | null => {
    const trimmedValue = value.trim();

    // Check for empty or whitespace-only input (Requirement 4.3)
    if (trimmedValue === '') {
      return 'Display name cannot be empty';
    }

    // Check for non-alphanumeric characters (Requirement 4.2)
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(trimmedValue)) {
      return 'Display name can only contain letters and numbers';
    }

    return null;
  };

  // Handle input change with real-time validation (Requirement 4.1)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayName(value);

    // Validate in real-time
    const error = validateDisplayName(value);
    setValidationError(error);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trim whitespace before validation (Requirement 1.2)
    const trimmedName = displayName.trim();

    // Final validation before submission
    const error = validateDisplayName(displayName);
    if (error) {
      setValidationError(error);
      return;
    }

    // Set loading state and disable submit button (Requirement 1.8)
    setIsLoading(true);
    setValidationError(null);

    try {
      // Call API to update display name (Requirement 1.5, 7.1, 7.3)
      await updateDisplayName(idToken, trimmedName);

      // Show success toast (Requirement 1.6, 3.1)
      addToast({
        type: 'success',
        message: 'Display name updated successfully',
        duration: 5000,
      });

      // Call the onUpdate callback to refresh profile data
      onUpdate(trimmedName);
    } catch (error) {
      // Handle 401 Unauthorized - sign out and redirect to login (Requirement 7.4)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update display name';
      
      if (errorMessage === 'Unauthorized') {
        addToast({
          type: 'error',
          message: 'Session expired. Please sign in again.',
          duration: 5000,
        });
        
        // Sign out user and redirect to login
        try {
          await signOut();
        } catch (signOutError) {
          console.error('[DisplayNameForm] Sign out failed after 401:', signOutError);
        } finally {
          document.cookie = 'session=; path=/; max-age=0';
        }
        
        // Redirect to login page
        router.push('/login');
        return;
      }
      
      // Handle network errors (Requirement 7.6)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        addToast({
          type: 'error',
          message: 'Network error. Please check your connection and try again.',
          duration: 5000,
        });
      } else {
        // Show error toast for other errors (Requirement 1.7, 3.2)
        addToast({
          type: 'error',
          message: errorMessage,
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Disable submit button when validation fails (Requirement 4.5)
  const isSubmitDisabled = isLoading || validationError !== null || displayName.trim() === '';

  return (
    <form onSubmit={handleSubmit}>
      <label
        htmlFor="display-name"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Display Name
      </label>
      
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={handleInputChange}
            disabled={isLoading}
            placeholder="Enter your display name"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg outline-none transition-all text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
            aria-invalid={validationError !== null}
            aria-describedby={validationError ? 'display-name-error' : undefined}
          />
          
          {/* Inline validation error message (Requirement 4.2, 4.3) */}
          {validationError && (
            <p
              id="display-name-error"
              className="text-red-600 text-sm mt-1"
              role="alert"
            >
              {validationError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {isLoading ? (
            <>
              <span className="material-icons-round animate-spin text-sm">refresh</span>
              Saving...
            </>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </form>
  );
}
