'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Header } from '@/components/layout/header';

/**
 * Client wrapper for scroll-based header search bar visibility
 * 
 * This component handles the client-side scroll detection logic
 * to show/hide the search bar in the header based on scroll position.
 */

interface PageScrollWrapperProps {
  children: ReactNode;
}

export function PageScrollWrapper({ children }: PageScrollWrapperProps) {
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        // Show header search when hero section is scrolled past (with some buffer)
        setShowHeaderSearch(heroBottom < 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Check initial state
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      {/* Header with scroll-based search visibility */}
      <Header showSearchBar={showHeaderSearch} />

      {/* Main Content with hero ref */}
      <main id="main-content" className="flex-grow">
        <div ref={heroRef}>
          {children}
        </div>
      </main>
    </div>
  );
}
