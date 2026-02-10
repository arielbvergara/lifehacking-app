"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { ComingSoon } from "@/components/home/coming-soon";
import { Logo } from "@/components/shared/logo";

export default function Home() {
  const { user, loading, signOut } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show coming soon page for unauthenticated users
  if (!user) {
    return <ComingSoon />;
  }

  // Show personalized welcome for authenticated users
  const displayName = user.displayName || user.email || "User";

  return (
    <div className="page-gradient min-h-screen flex flex-col antialiased selection:text-black selection:bg-primary">
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
        <div className="w-full max-w-2xl bg-white rounded-3xl p-8 md:p-16 relative z-10 border border-white/50 shadow-soft text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {/* Welcome Message */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-textMain mb-4">
            Welcome back, {displayName}!
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            You&apos;re successfully logged in.
          </p>

          {/* Sign Out Button */}
          <button
            onClick={signOut}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-800 text-white font-bold text-lg rounded-full hover:bg-gray-700 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg"
          >
            Sign Out
          </button>
        </div>
      </main>
    </div>
  );
}
