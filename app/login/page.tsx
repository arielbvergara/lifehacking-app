"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { AuthNav } from "@/components/layout/auth-nav";
import { AuthFooter } from "@/components/layout/auth-footer";
import { LoginHeader } from "@/components/auth/login-header";
import { SocialLoginButton } from "@/components/auth/social-login-button";
import { Divider } from "@/components/shared/divider";
import { LoginForm } from "@/components/auth/login-form";
import { GuestLink } from "@/components/auth/guest-link";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      router.push("/");
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  const handleLoginSuccess = () => {
    router.push("/");
  };

  return (
    <div className="page-gradient min-h-screen flex flex-col antialiased selection:text-black selection:bg-primary">
      {/* Navigation */}
      <AuthNav />

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

        {/* Login Card */}
        <div 
          className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 relative z-10 border border-white/50 shadow-soft"
        >
          <LoginHeader />

          <div className="space-y-3 mb-8">
            <SocialLoginButton provider="google" onLogin={handleGoogleLogin} />
          </div>

          <Divider text="Or log in with email" />

          <div className="mt-6">
            <LoginForm onSuccess={handleLoginSuccess} />
          </div>

          <GuestLink />
        </div>
      </main>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
}
