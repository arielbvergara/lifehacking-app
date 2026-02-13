import { describe, it, expect } from 'vitest';
import { fc, test } from '@fast-check/vitest';
import { User as FirebaseUser } from 'firebase/auth';
import { getInitials } from './user';

describe('getInitials', () => {
  it('should return first character of first two words for multi-word display names', () => {
    const user = {
      displayName: 'Ariel Cohen',
      email: 'ariel@example.com',
    } as FirebaseUser;

    const result = getInitials(user);

    expect(result).toBe('AC');
  });

  it('should return first two characters for single-word display names', () => {
    const user = {
      displayName: 'Chiara',
      email: 'chiara@example.com',
    } as FirebaseUser;

    const result = getInitials(user);

    expect(result).toBe('CH');
  });

  it('should derive initials from email when display name is null', () => {
    const user = {
      displayName: null,
      email: 'test@example.com',
    } as FirebaseUser;

    const result = getInitials(user);

    expect(result).toBe('TE');
  });

  it('should derive initials from email when display name is empty string', () => {
    const user = {
      displayName: '',
      email: 'john@example.com',
    } as FirebaseUser;

    const result = getInitials(user);

    expect(result).toBe('JO');
  });

  it('should return "U" when both display name and email are null', () => {
    const user = {
      displayName: null,
      email: null,
    } as FirebaseUser;

    const result = getInitials(user);

    expect(result).toBe('U');
  });

  it('should handle display names with extra whitespace', () => {
    const user = {
      displayName: '  John   Doe  ',
      email: 'john@example.com',
    } as FirebaseUser;

    const result = getInitials(user);

    expect(result).toBe('JD');
  });

  it('should handle display names with more than two words', () => {
    const user = {
      displayName: 'John Michael Doe',
      email: 'john@example.com',
    } as FirebaseUser;

    const result = getInitials(user);

    expect(result).toBe('JM');
  });

  it('should return uppercase initials', () => {
    const user = {
      displayName: 'alice bob',
      email: 'alice@example.com',
    } as FirebaseUser;

    const result = getInitials(user);

    expect(result).toBe('AB');
  });

  it('should handle single character display names', () => {
    const user = {
      displayName: 'A',
      email: 'a@example.com',
    } as FirebaseUser;

    const result = getInitials(user);

    expect(result).toBe('A');
  });

  it('should handle email with single character', () => {
    const user = {
      displayName: null,
      email: 'a@example.com',
    } as FirebaseUser;

    const result = getInitials(user);

    expect(result).toBe('A@');
  });
});

/**
 * Property-Based Tests
 * Feature: home-page-implementation
 */
describe('getInitials - Property-Based Tests', () => {
  /**
   * Property 7: User Initials Derivation
   * **Validates: Requirements 7.2, 7.3, 7.4**
   * 
   * For any authenticated user with a display name containing at least two words,
   * the derived initials should be the first character of the first word concatenated
   * with the first character of the second word, both converted to uppercase.
   */
  test.prop([
    fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
    fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  ], { numRuns: 100 })(
    'Property_7_UserInitials_ShouldUseFirstTwoWords_WhenDisplayNameHasTwoOrMoreWords',
    (firstName, lastName) => {
      // Arrange
      const displayName = `${firstName} ${lastName}`;
      const user = {
        displayName: displayName,
        email: 'test@example.com',
      } as FirebaseUser;

      // Act
      const result = getInitials(user);

      // Assert
      // The function splits by whitespace and takes first char of first two parts
      const parts = displayName.trim().split(/\s+/);
      const expectedInitials = `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      expect(result).toBe(expectedInitials);
      expect(result.length).toBe(2);
    }
  );

  test.prop([
    fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  ], { numRuns: 100 })(
    'Property_7_UserInitials_ShouldUseFirstTwoCharacters_WhenDisplayNameIsSingleWord',
    (name) => {
      // Arrange: Ensure single word by removing spaces
      const singleWord = name.trim().replace(/\s+/g, '');
      const user = {
        displayName: singleWord,
        email: 'test@example.com',
      } as FirebaseUser;

      // Act
      const result = getInitials(user);

      // Assert
      const expected = singleWord.substring(0, 2).toUpperCase();
      expect(result).toBe(expected);
      expect(result.length).toBeLessThanOrEqual(2);
    }
  );

  test.prop([
    fc.emailAddress(),
  ], { numRuns: 100 })(
    'Property_7_UserInitials_ShouldUseEmail_WhenDisplayNameIsNull',
    (email) => {
      // Arrange
      const user = {
        displayName: null,
        email: email,
      } as FirebaseUser;

      // Act
      const result = getInitials(user);

      // Assert
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(2);
      expect(result).toBe(result.toUpperCase());
      // Should start with first characters of email
      if (email.length >= 2) {
        expect(result).toBe(email.substring(0, 2).toUpperCase());
      }
    }
  );

  test.prop([
    fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
    fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  ], { numRuns: 100 })(
    'Property_7_UserInitials_ShouldAlwaysReturnUppercase_ForAnyDisplayName',
    (firstName, lastName) => {
      // Arrange
      const user = {
        displayName: `${firstName} ${lastName}`,
        email: 'test@example.com',
      } as FirebaseUser;

      // Act
      const result = getInitials(user);

      // Assert
      expect(result).toBe(result.toUpperCase());
    }
  );

  test.prop([
    fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
    fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  ], { numRuns: 100 })(
    'Property_7_UserInitials_ShouldBeDeterministic_ForSameUser',
    (firstName, lastName) => {
      // Arrange
      const user = {
        displayName: `${firstName} ${lastName}`,
        email: 'test@example.com',
      } as FirebaseUser;

      // Act: Call multiple times
      const result1 = getInitials(user);
      const result2 = getInitials(user);
      const result3 = getInitials(user);

      // Assert: Should always return the same result
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    }
  );

  test.prop([
    fc.oneof(
      fc.constant(null),
      fc.constant(''),
      fc.constant('   ')
    ),
    fc.oneof(
      fc.constant(null),
      fc.constant(''),
      fc.constant('   ')
    ),
  ], { numRuns: 20 })(
    'Property_7_UserInitials_ShouldReturnFallback_WhenBothDisplayNameAndEmailAreInvalid',
    (displayName, email) => {
      // Arrange
      const user = {
        displayName: displayName,
        email: email,
      } as FirebaseUser;

      // Act
      const result = getInitials(user);

      // Assert: Should return fallback 'U'
      expect(result).toBe('U');
    }
  );
});
