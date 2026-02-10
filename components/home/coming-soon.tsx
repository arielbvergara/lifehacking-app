"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export function ComingSoon() {
  return (
    <div className="page-gradient min-h-screen flex flex-col antialiased selection:text-black selection:bg-primary">
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

        {/* Content Card */}
        <div className="w-full max-w-2xl bg-white rounded-3xl p-8 md:p-16 relative z-10 border border-white/50 shadow-soft text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {/* Coming Soon Message */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-textMain mb-4">
            Coming Soon
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-md mx-auto">
            We're working hard to bring you something amazing. Stay tuned!
          </p>

          {/* Login Button */}
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold text-lg rounded-full hover:bg-primaryDark transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg"
          >
            Go to Login
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 7l5 5m0 0l-5 5m5-5H6" 
              />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  );
}
