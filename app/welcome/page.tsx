"use client";

import { AuthNav } from "@/components/layout/auth-nav";
import { AuthFooter } from "@/components/layout/auth-footer";
import { WelcomeCard } from "@/components/welcome/welcome-card";

export default function WelcomePage() {
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

        {/* Welcome Card */}
        <WelcomeCard />
      </main>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
}
