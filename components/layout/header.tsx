'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/shared/logo';
import { UserAvatar } from '@/components/layout/user-avatar';
import { SearchBar } from '@/components/shared/search-bar';
import { CategoryFilterBar } from '@/components/search/category-filter-bar';
import { useAuth } from '@/lib/auth/auth-context';

export interface HeaderProps {
  showSearchBar?: boolean;
  showCategoryFilter?: boolean;
  selectedCategoryId?: string | null;
  onCategorySelect?: (categoryId: string | null) => void;
  onSearch?: (query: string) => void;
}

/**
 * Header Component
 * 
 * Navigation header with authentication-aware UI.
 * - Anonymous users see "Login" and "Join for Free" buttons
 * - Authenticated users see UserAvatar with dropdown menu
 * - Responsive mobile menu for smaller screens
 * - Optional search bar display (controlled via showSearchBar prop)
 * - Optional category filter bar (controlled via showCategoryFilter prop)
 * 
 * @example
 * <Header />
 * <Header showSearchBar={false} />
 * <Header showCategoryFilter={true} selectedCategoryId={categoryId} onCategorySelect={handleCategorySelect} />
 */
export function Header({ 
  showSearchBar = true,
  showCategoryFilter = false,
  selectedCategoryId = null,
  onCategorySelect,
  onSearch,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut, loading: authLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/categories', label: 'Categories' },
    { href: '/tips/popular', label: 'Popular' },
    { href: '/about', label: 'About' },
  ];

  const handleAvatarClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    router.push('/profile');
  };

  const handleSearch = (query: string) => {
    try {
      // Use custom handler if provided (for SearchPage)
      if (onSearch) {
        onSearch(query);
      } else {
        // Default behavior: log the search query
        // Future: Navigate to search results page or trigger search API
        console.log('Search query:', query);
      }
      
      // Close mobile search interface if open
      if (isSearchOpen) {
        setIsSearchOpen(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Ensure mobile search interface closes even if handler throws
      if (isSearchOpen) {
        setIsSearchOpen(false);
      }
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo - Smaller on mobile */}
          <div className="md:hidden">
            <Logo size="sm" />
          </div>
          <div className="hidden md:block">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* SearchBar - Desktop Only */}
            {showSearchBar && (
              <div className="flex-1 max-w-md ml-6 w-80 animate-slide-down">
                <SearchBar 
                  variant="compact"
                  onSearch={handleSearch}
                  placeholder="Search for tips..."
                />
              </div>
            )}

            {/* Desktop Navigation Links */}
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-primary'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            {authLoading ? (
              /* Loading Skeleton - Avatar skeleton for better UX */
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              /* Authenticated User UI */
              <div className="relative">
                <UserAvatar user={user} onClick={handleAvatarClick} />
                
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    
                    {/* Dropdown Content */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-20">
                      <button
                        onClick={handleProfileClick}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Profile
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Anonymous User UI */
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2 rounded-full bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Join for Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Search and Menu Buttons */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Search Icon Button */}
            {showSearchBar && (
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                aria-label={isSearchOpen ? "Close search" : "Search"}
                type="button"
              >
                <span className="material-icons-round">
                  {isSearchOpen ? 'close' : 'search'}
                </span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
              aria-label="Toggle menu"
              type="button"
            >
              <span className="material-icons-round">
                {isMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Interface */}
        {showSearchBar && isSearchOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4 animate-slide-down">
            <SearchBar 
              variant="compact"
              onSearch={handleSearch}
              placeholder="Search for tips..."
            />
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
            {/* Navigation Links */}
            <div className="flex flex-col gap-2 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                    pathname === link.href
                      ? 'text-primary bg-primary/5'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mb-4" />

            {authLoading ? (
              /* Loading Skeleton - Avatar skeleton for better UX */
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                  <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="w-full h-9 bg-gray-200 rounded-lg animate-pulse" />
                <div className="w-full h-9 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            ) : user ? (
              /* Authenticated User Mobile Menu */
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 px-4 py-2">
                  <UserAvatar user={user} />
                  <span className="text-sm font-medium text-gray-700">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={handleProfileClick}
                  className="text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
                >
                  Profile
                </button>
                <button
                  onClick={handleSignOut}
                  className="text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              /* Anonymous User Mobile Menu */
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-center rounded-full bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Join for Free
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Category Filter Bar - Conditionally rendered below main navigation */}
      {showCategoryFilter && onCategorySelect && (
        <div className="border-t border-gray-100 py-3">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <CategoryFilterBar
              selectedCategoryId={selectedCategoryId}
              onCategorySelect={onCategorySelect}
            />
          </div>
        </div>
      )}
    </header>
  );
}
