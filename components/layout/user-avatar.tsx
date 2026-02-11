'use client';

import { User as FirebaseUser } from 'firebase/auth';
import { getInitials } from '@/lib/utils/user';

export interface UserAvatarProps {
  user: FirebaseUser;
  onClick?: () => void;
}

/**
 * UserAvatar Component
 * 
 * Displays a circular avatar with user initials derived from display name or email.
 * Supports click interactions for opening account menus.
 * 
 * @example
 * <UserAvatar user={firebaseUser} onClick={handleMenuOpen} />
 */
export function UserAvatar({ user, onClick }: UserAvatarProps) {
  const initials = getInitials(user);

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label="User menu"
      type="button"
    >
      {initials}
    </button>
  );
}
