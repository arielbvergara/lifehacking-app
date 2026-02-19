'use client';

import Link from 'next/link';
import { User as FirebaseUser } from 'firebase/auth';

interface ProfileHeaderProps {
  user: FirebaseUser;
  displayName: string | null;
  createdAt: string;
  savedTipsCount: number;
}

/**
 * ProfileHeader Component
 * 
 * Displays user profile summary at the top of the profile page.
 * Shows avatar, personalized greeting, member since date, and saved tips count.
 * 
 * @example
 * <ProfileHeader 
 *   user={firebaseUser}
 *   displayName="Alex"
 *   createdAt="2023-09-15T10:30:00Z"
 *   savedTipsCount={12}
 * />
 */
export function ProfileHeader({ 
  user, 
  displayName, 
  createdAt, 
  savedTipsCount 
}: ProfileHeaderProps) {
  // Format the createdAt date as "Member since Month Year"
  const formatMemberSince = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long' 
      };
      return `Member since ${date.toLocaleDateString('en-US', options)}`;
    } catch {
      return 'Member since recently';
    }
  };

  const greeting = displayName || user.email?.split('@')[0] || 'there';

  return (
    <div className="flex flex-col items-center text-center space-y-4">
      {/* Avatar - larger size for profile page */}
      <div className="relative">
        <div className="w-20 h-20 sm:w-24 sm:h-24">
          <div className="w-full h-full flex items-center justify-center rounded-full bg-primary text-white font-semibold text-2xl sm:text-3xl border-4 border-white shadow-lg">
            {user.displayName ? 
              user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) :
              (user.email?.[0] || 'U').toUpperCase()
            }
          </div>
        </div>
      </div>

      {/* Greeting */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Hi, {greeting}! Glad you&apos;re here.
      </h1>

      {/* Member since date */}
      <p className="text-gray-600 text-sm sm:text-base">
        {formatMemberSince(createdAt)}
      </p>

      {/* Saved tips count - clickable link to favorites page */}
      <Link
        href="/favorites"
        className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition-colors group"
        aria-label={`View your ${savedTipsCount} saved tips`}
      >
        {/* Filled heart icon matching favorites */}
        <svg
          className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
        <span className="font-medium group-hover:underline">{savedTipsCount} Saved Tips</span>
      </Link>
    </div>
  );
}
