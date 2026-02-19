"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getUserProfile, UserProfile, getSavedTipsCount } from "@/lib/api/user";
import { AuthNav } from "@/components/layout/auth-nav";
import { AuthFooter } from "@/components/layout/auth-footer";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileCard } from "@/components/profile/profile-card";
import { LogOutButton } from "@/components/profile/log-out-button";
import { ProfileLoading } from "@/components/profile/profile-loading";

export default function ProfilePage() {
  const router = useRouter();
  const { user, idToken, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedTipsCount, setSavedTipsCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Fetch profile data and saved tips count when authenticated
  useEffect(() => {
    async function fetchProfileData() {
      if (!idToken || !user) return;

      setIsLoadingProfile(true);
      setError(null);

      try {
        // Fetch profile and saved tips count in parallel
        const [profileData, tipsCount] = await Promise.all([
          getUserProfile(idToken),
          getSavedTipsCount(idToken).catch(() => 0), // Default to 0 if fails
        ]);
        
        setProfile(profileData);
        setSavedTipsCount(tipsCount);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        
        // Handle specific error cases
        if (err instanceof Error) {
          if (err.message === "User profile not found") {
            setError("Profile not found. Please contact support.");
          } else {
            setError("Failed to load profile. Please try again later.");
          }
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchProfileData();
  }, [idToken, user]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col antialiased selection:text-black selection:bg-primary">
        <AuthNav showSignupButton={false} showLoginButton={false} />
        <main className="flex-grow flex items-center justify-center p-4">
          <ProfileLoading />
        </main>
        <AuthFooter />
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col antialiased selection:text-black selection:bg-primary">
      {/* Navigation */}
      <AuthNav showSignupButton={false} showLoginButton={false} />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 py-8">
        <div className="max-w-2xl w-full space-y-6">
          {/* Loading State */}
          {isLoadingProfile && <ProfileLoading />}
          
          {/* Error State */}
          {error && !isLoadingProfile && (
            <div className="bg-white rounded-2xl shadow-md p-8">
              <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          {/* Profile Content */}
          {profile && idToken && !isLoadingProfile && !error && (
            <>
              {/* Profile Header */}
              <ProfileHeader
                user={user}
                displayName={profile.displayName}
                createdAt={profile.createdAt}
                savedTipsCount={savedTipsCount}
              />
              
              {/* Profile Card */}
              <ProfileCard profile={profile} idToken={idToken} />
              
              {/* Log Out Button */}
              <LogOutButton />
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
}
