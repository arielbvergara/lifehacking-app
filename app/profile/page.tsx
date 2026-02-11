"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getUserProfile, UserProfile } from "@/lib/api/user";
import { AuthNav } from "@/components/layout/auth-nav";
import { AuthFooter } from "@/components/layout/auth-footer";
import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileLoading } from "@/components/profile/profile-loading";

export default function ProfilePage() {
  const router = useRouter();
  const { user, idToken, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Fetch profile data when authenticated
  useEffect(() => {
    async function fetchProfile() {
      if (!idToken || !user) return;

      setIsLoadingProfile(true);
      setError(null);

      try {
        const profileData = await getUserProfile(idToken);
        setProfile(profileData);
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

    fetchProfile();
  }, [idToken, user]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="page-gradient min-h-screen flex flex-col antialiased selection:text-black selection:bg-primary">
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
    <div className="page-gradient min-h-screen flex flex-col antialiased selection:text-black selection:bg-primary">
      {/* Navigation */}
      <AuthNav showSignupButton={false} showLoginButton={false} />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Blur Circles */}
        <div 
          className="absolute top-1/4 left-10 w-72 h-72 rounded-full blur-3xl -z-10 mix-blend-multiply filter opacity-50 animate-pulse-slow"
          style={{ backgroundColor: 'rgba(43, 238, 43, 0.2)' }}
        ></div>
        <div 
          className="absolute bottom-10 right-10 w-80 h-80 rounded-full blur-3xl -z-10 mix-blend-multiply filter opacity-50"
          style={{ backgroundColor: 'rgba(254, 240, 138, 0.4)' }}
        ></div>

        {/* Profile Content */}
        {isLoadingProfile && <ProfileLoading />}
        
        {error && !isLoadingProfile && (
          <div className="bg-white rounded-3xl shadow-soft p-8 max-w-2xl w-full">
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {profile && idToken && !isLoadingProfile && !error && (
          <ProfileCard profile={profile} idToken={idToken} />
        )}
      </main>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
}
