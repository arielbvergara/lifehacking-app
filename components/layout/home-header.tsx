'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/shared/logo';
import { UserAvatar } from '@/components/layout/user-avatar';
import { useAuth } from '@/lib/auth/auth-context';

/**
 * HomeHeader Component
 * 
 * Navigation header for the home page with authentication-aware UI.
 * - Anonymous users see "Login" and "Join for Free" buttons
 * - Authenticated users see UserAvatar with dropdown menu
 * - Responsive mobile menu for smaller screens
 * 
 * @example
 * <HomeHeader />
 */
export function HomeHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
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
            {user ? (
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
            aria-label="Toggle menu"
            type="button"
          >
            <span className="material-icons-round">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

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

            {user ? (
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
    </header>
  );
}
