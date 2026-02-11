import { User as FirebaseUser } from 'firebase/auth';

/**
 * Derives user initials from display name or email.
 * 
 * For display names with two or more words, returns the first character of the first two words.
 * For single-word display names, returns the first two characters.
 * For users without display names, derives initials from email address.
 * 
 * @param user - The Firebase user object
 * @returns Two-character uppercase initials
 * 
 * @example
 * getInitials({ displayName: "Ariel Cohen" }) // "AC"
 * getInitials({ displayName: "Chiara" }) // "CH"
 * getInitials({ displayName: null, email: "test@example.com" }) // "TE"
 * getInitials({ displayName: null, email: null }) // "U"
 */
export function getInitials(user: FirebaseUser): string {
  // Try to get initials from display name
  if (user.displayName) {
    const trimmedName = user.displayName.trim();
    
    if (trimmedName.length === 0) {
      // Fall through to email if display name is empty after trimming
    } else {
      const parts = trimmedName.split(/\s+/); // Split by whitespace
      
      if (parts.length >= 2) {
        // Two or more words: first character of first two words
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      } else {
        // Single word: first two characters
        return trimmedName.substring(0, 2).toUpperCase();
      }
    }
  }
  
  // Try to get initials from email
  if (user.email) {
    const trimmedEmail = user.email.trim();
    if (trimmedEmail.length >= 2) {
      return trimmedEmail.substring(0, 2).toUpperCase();
    } else if (trimmedEmail.length === 1) {
      return trimmedEmail.toUpperCase();
    }
  }
  
  // Default fallback
  return 'U';
}
