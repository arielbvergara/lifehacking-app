'use client';

import { useState, useEffect, useRef, type ReactNode, Children, isValidElement } from 'react';
import { Header } from '@/components/layout/header';

/**
 * Client wrapper for scroll-based header search bar visibility
 * 
 * This component handles the client-side scroll detection logic
 * to show/hide the search bar in the header based on scroll position.
 * 
 * The first child is assumed to be the hero section and gets a ref
 * attached to track when it scrolls out of view.
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

  // Convert children to array and attach ref to first child (hero section)
  const childrenArray = Children.toArray(children);
  const enhancedChildren = childrenArray.map((child, index) => {
    if (index === 0 && isValidElement(child)) {
      // Wrap first child (hero) in a div with ref
      return (
        <div key="hero-wrapper" ref={heroRef}>
          {child}
        </div>
      );
    }
    return child;
  });

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      {/* Header with scroll-based search visibility */}
      <Header showSearchBar={showHeaderSearch} />

      {/* Main Content */}
      <main id="main-content" className="flex-grow">
        {enhancedChildren}
      </main>
    </div>
  );
}
