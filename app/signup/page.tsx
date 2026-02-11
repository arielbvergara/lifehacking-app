"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { AuthNav } from "@/components/layout/auth-nav";
import { AuthFooter } from "@/components/layout/auth-footer";
import { SignupHeader } from "@/components/auth/signup-header";
import { SocialLoginButton } from "@/components/auth/social-login-button";
import { Divider } from "@/components/shared/divider";
import { SignupForm } from "@/components/auth/signup-form";
import { LoginLink } from "@/components/auth/login-link";

export default function SignupPage() {
  const router = useRouter();
  const { signUpWithGoogle } = useAuth();

  const handleGoogleSignup = async () => {
    try {
      await signUpWithGoogle();
      router.push("/welcome");
    } catch (error) {
      console.error("Google signup failed:", error);
    }
  };

  const handleSignupSuccess = () => {
    router.push("/welcome");
  };

  return (
    <div className="page-gradient min-h-screen flex flex-col antialiased selection:text-black selection:bg-primary">
      {/* Navigation */}
      <AuthNav showSignupButton={false} showLoginButton={true} />

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

        {/* Signup Card */}
        <div 
          className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 relative z-10 border border-white/50 shadow-soft"
        >
          <SignupHeader />

          <div className="space-y-3 mb-8">
            <SocialLoginButton provider="google" onLogin={handleGoogleSignup} />
          </div>

          <Divider text="Or sign up with email" />

          <div className="mt-6">
            <SignupForm onSuccess={handleSignupSuccess} />
          </div>

          <LoginLink />
        </div>
      </main>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
}
