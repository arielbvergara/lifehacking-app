'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/shared/logo';
import { UserAvatar } from '@/components/layout/user-avatar';
import { SearchBar } from '@/components/shared/search-bar';
import { CategoryFilterBar } from '@/components/search/category-filter-bar';
import { useAuth } from '@/lib/auth/auth-context';
import { useFavorites } from '@/lib/hooks/use-favorites';
import { useUserProfile } from '@/lib/hooks/use-user-profile';

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
  const { count: favoritesCount } = useFavorites();
  const { isAdmin } = useUserProfile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const isAdminPage = pathname?.startsWith('/admin');

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

  const handleSearchComplete = () => {
    // Close mobile search interface after search
    if (isSearchOpen) {
      setIsSearchOpen(false);
    }
  };

  const handleSearch = onSearch ? (query: string) => {
    try {
      // Use custom handler if provided (for SearchPage)
      onSearch(query);
    } catch (error) {
      console.error('Search error:', error);
    }
  } : undefined;

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 lg-header:px-8 py-2">
        <div className="flex justify-between items-center">
          {/* Logo - Smaller on mobile */}
          <div className="lg-header:hidden">
            <Logo size="sm" isAdmin={isAdminPage} />
          </div>
          <div className="hidden lg-header:block">
            <Logo isAdmin={isAdminPage} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg-header:flex items-center gap-6">
            {/* SearchBar - Desktop Only */}
            {showSearchBar && (
              <div className="flex-1 max-w-md ml-6 w-80 animate-slide-down">
                <SearchBar 
                  variant="compact"
                  onSearch={handleSearch}
                  onSearchComplete={handleSearchComplete}
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
              
              {/* Favorites Link */}
              <Link
                href="/favorites"
                className={`relative flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  pathname === '/favorites'
                    ? 'text-primary'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
                aria-label={`Favorites${favoritesCount > 0 ? ` (${favoritesCount} items)` : ''}`}
                suppressHydrationWarning
              >
                <span className="material-icons-round text-xl">favorite</span>
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1" suppressHydrationWarning>
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                )}
              </Link>
            </div>
            <div suppressHydrationWarning>
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
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
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
          </div>

          {/* Mobile Search and Menu Buttons */}
          <div className="lg-header:hidden flex items-center gap-2">
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
          <div className="lg-header:hidden mt-4 pb-4 border-t border-gray-100 pt-4 animate-slide-down">
            <SearchBar 
              variant="compact"
              onSearch={handleSearch}
              onSearchComplete={handleSearchComplete}
              placeholder="Search for tips..."
              autoFocus={true}
            />
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg-header:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
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
              
              {/* Favorites Link */}
              <Link
                href="/favorites"
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg flex items-center justify-between ${
                  pathname === '/favorites'
                    ? 'text-primary bg-primary/5'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
                aria-label={`Favorites${favoritesCount > 0 ? ` (${favoritesCount} items)` : ''}`}
                suppressHydrationWarning
              >
                <span className="flex items-center gap-2">
                  <span className="material-icons-round text-xl">favorite</span>
                  Favorites
                </span>
                {favoritesCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5" suppressHydrationWarning>
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mb-4" />

            <div suppressHydrationWarning>
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
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-amber-50 hover:bg-amber-100 transition-colors rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
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
          </div>
        )}
      </nav>

      {/* Category Filter Bar - Conditionally rendered below main navigation */}
      {showCategoryFilter && onCategorySelect && (
        <div className="border-t border-gray-100 py-3">
          <div className="max-w-7xl mx-auto px-4 lg-header:px-8">
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
