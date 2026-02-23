'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserProfile, deleteAccount } from "@/lib/api/user";
import { DisplayNameForm } from "./display-name-form";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { signOut } from "@/lib/auth/firebase-auth";
import { clearSessionCookie } from "@/lib/auth/auth-utils";
import { addToast } from "@/lib/hooks/use-toast";

// Delay before redirecting to allow user to see toast notification
const REDIRECT_DELAY_MS = 2000;

interface ProfileCardProps {
  profile: UserProfile;
  idToken: string;
}

export function ProfileCard({ profile, idToken }: ProfileCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    try {
      // Call API to delete account (Requirement 2.7)
      await deleteAccount(idToken);
      
      // Show success toast (Requirement 3.1)
      addToast({
        type: 'success',
        message: 'Account deleted successfully',
      });

      // Sign out from Firebase and clear session (Requirements 2.8, 8.1)
      try {
        await signOut();
      } catch (signOutError) {
        // Log error and show toast, but continue with redirect (Requirement 8.4)
        console.error('[ProfileCard] Sign out failed after account deletion:', signOutError);
        addToast({
          type: 'error',
          message: 'Sign out failed, but account was deleted. Redirecting...',
        });
      } finally {
        // Clear session cookie regardless of signOut success (Requirement 8.2)
        clearSessionCookie();
      }

      // Wait 2 seconds to allow user to see the toast, then redirect (Requirement 2.9, 8.3)
      setTimeout(() => {
        router.push('/');
      }, REDIRECT_DELAY_MS);

    } catch (error) {
      // Handle specific error cases (Requirements 2.10, 7.4, 7.5, 7.6)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete account';
      console.error('[ProfileCard] Delete account error:', errorMessage);
      
      // Handle 401 Unauthorized - sign out and redirect to login (Requirement 7.4)
      if (errorMessage === 'Unauthorized') {
        addToast({
          type: 'error',
          message: 'Session expired. Please sign in again.',
        });
        
        // Sign out user and redirect to login
        try {
          await signOut();
        } catch (signOutError) {
          console.error('[ProfileCard] Sign out failed after 401:', signOutError);
        } finally {
          clearSessionCookie();
        }
        
        // Close dialog and redirect to login
        setShowDeleteDialog(false);
        router.push('/login');
        return;
      }
      
      // Handle 404 Not Found (Requirement 7.5)
      if (errorMessage === 'Account not found') {
        addToast({
          type: 'error',
          message: 'Account not found. It may have already been deleted.',
        });
      } 
      // Handle network errors (Requirement 7.6)
      else if (error instanceof TypeError && errorMessage.includes('fetch')) {
        addToast({
          type: 'error',
          message: 'Network error. Please check your connection and try again.',
        });
      } 
      // Handle all other errors with generic message (Requirement 7.6)
      else {
        addToast({
          type: 'error',
          message: 'Failed to delete account. Please try again.',
        });
      }
      
      // Close dialog on error so user can retry (Requirement 2.10)
      setShowDeleteDialog(false);
    }
  };

  // Handle profile refresh after display name update (Requirement 1.1)
  const handleDisplayNameUpdate = (newName: string) => {
    setCurrentProfile({
      ...currentProfile,
      displayName: newName,
    });
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 max-w-2xl w-full">
        {/* Card Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="material-icons-round text-blue-500 text-2xl">account_circle</span>
          <h2 className="text-xl font-semibold text-gray-900">Personal Details</h2>
        </div>
        
        {/* Form Fields */}
        <div className="space-y-4">
          {/* Display Name Field */}
          <DisplayNameForm 
            currentName={currentProfile.displayName} 
            idToken={idToken}
            onUpdate={handleDisplayNameUpdate}
          />
          
          {/* Email Field (Read-only) */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={currentProfile.email}
              disabled
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Delete Account Link - Positioned separately below */}
      <div className="text-center mt-8">
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="text-red-600 hover:text-red-700 underline text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Account"
        message="This action cannot be undone. All your data will be permanently deleted. Type DELETE to confirm."
        confirmText="DELETE"
        confirmButtonLabel="Delete Account"
        cancelButtonLabel="Cancel"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteDialog(false)}
        variant="danger"
      />
    </>
  );
}
