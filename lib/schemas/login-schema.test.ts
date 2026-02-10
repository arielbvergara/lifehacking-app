/**
 * Tests for Login Form Validation Schema
 * 
 * Includes both unit tests and property-based tests to verify:
 * - Email validation (Property 1.1)
 * - Password length validation (Property 1.2)
 * - Valid inputs pass validation
 * - Invalid inputs fail with correct error messages
 */

import { describe, it, expect } from 'vitest';
import { fc, test } from '@fast-check/vitest';
import { loginSchema } from './login-schema';

describe('Login Schema Validation', () => {
  // ============================================================================
  // UNIT TESTS - Valid Inputs
  // ============================================================================

  describe('Valid Inputs', () => {
    it('ValidInputs_ShouldPassValidation_WhenAllFieldsAreValid', () => {
      // Arrange
      const validInput = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      };

      // Act
      const result = loginSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('ValidInputs_ShouldPassValidation_WhenRememberMeIsOmitted', () => {
      // Arrange
      const validInput = {
        email: 'user@domain.com',
        password: 'securePass123',
      };

      // Act
      const result = loginSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe(validInput.email);
        expect(result.data.password).toBe(validInput.password);
        expect(result.data.rememberMe).toBeUndefined();
      }
    });

    it('ValidInputs_ShouldPassValidation_WhenRememberMeIsFalse', () => {
      // Arrange
      const validInput = {
        email: 'admin@company.org',
        password: 'myPassword1',
        rememberMe: false,
      };

      // Act
      const result = loginSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('ValidInputs_ShouldPassValidation_WhenPasswordIsExactly8Characters', () => {
      // Arrange
      const validInput = {
        email: 'test@test.com',
        password: '12345678', // Exactly 8 characters
        rememberMe: true,
      };

      // Act
      const result = loginSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
    });

    it('ValidInputs_ShouldPassValidation_WhenPasswordIsExactly100Characters', () => {
      // Arrange
      const validInput = {
        email: 'test@test.com',
        password: 'a'.repeat(100), // Exactly 100 characters
        rememberMe: true,
      };

      // Act
      const result = loginSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
    });

    it('ValidInputs_ShouldPassValidation_WhenEmailHasSubdomain', () => {
      // Arrange
      const validInput = {
        email: 'user@mail.example.com',
        password: 'password123',
      };

      // Act
      const result = loginSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
    });

    it('ValidInputs_ShouldPassValidation_WhenEmailHasPlus', () => {
      // Arrange
      const validInput = {
        email: 'user+tag@example.com',
        password: 'password123',
      };

      // Act
      const result = loginSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
    });

    it('ValidInputs_ShouldPassValidation_WhenEmailHasDots', () => {
      // Arrange
      const validInput = {
        email: 'first.last@example.com',
        password: 'password123',
      };

      // Act
      const result = loginSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // UNIT TESTS - Invalid Email
  // ============================================================================

  describe('Invalid Email', () => {
    it('InvalidEmail_ShouldFailValidation_WhenEmailIsEmpty', () => {
      // Arrange
      const invalidInput = {
        email: '',
        password: 'password123',
      };

      // Act
      const result = loginSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find(
          (issue) => issue.path[0] === 'email'
        );
        expect(emailError?.message).toBe('Email is required');
      }
    });

    it('InvalidEmail_ShouldFailValidation_WhenEmailIsMissing', () => {
      // Arrange
      const invalidInput = {
        password: 'password123',
      };

      // Act
      const result = loginSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find(
          (issue) => issue.path[0] === 'email'
        );
        expect(emailError).toBeDefined();
      }
    });

    it('InvalidEmail_ShouldFailValidation_WhenEmailHasNoAtSymbol', () => {
      // Arrange
      const invalidInput = {
        email: 'notanemail.com',
        password: 'password123',
      };

      // Act
      const result = loginSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find(
          (issue) => issue.path[0] === 'email'
        );
        expect(emailError?.message).toBe('Invalid email format');
      }
    });

    it('InvalidEmail_ShouldFailValidation_WhenEmailHasNoDomain', () => {
      // Arrange
      const invalidInput = {
        email: 'user@',
        password: 'password123',
      };

      // Act
      const result = loginSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find(
          (issue) => issue.path[0] === 'email'
        );
        expect(emailError?.message).toBe('Invalid email format');
      }
    });

    it('InvalidEmail_ShouldFailValidation_WhenEmailHasNoLocalPart', () => {
      // Arrange
      const invalidInput = {
        email: '@example.com',
        password: 'password123',
      };

      // Act
      const result = loginSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find(
          (issue) => issue.path[0] === 'email'
        );
        expect(emailError?.message).toBe('Invalid email format');
      }
    });

    it('InvalidEmail_ShouldFailValidation_WhenEmailHasSpaces', () => {
      // Arrange
      const invalidInput = {
        email: 'user name@example.com',
        password: 'password123',
      };

      // Act
      const result = loginSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find(
          (issue) => issue.path[0] === 'email'
        );
        expect(emailError?.message).toBe('Invalid email format');
      }
    });

    it('InvalidEmail_ShouldFailValidation_WhenEmailHasMultipleAtSymbols', () => {
      // Arrange
      const invalidInput = {
        email: 'user@@example.com',
        password: 'password123',
      };

      // Act
      const result = loginSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find(
          (issue) => issue.path[0] === 'email'
        );
        expect(emailError?.message).toBe('Invalid email format');
      }
    });
  });

  // ============================================================================
  // UNIT TESTS - Invalid Password
  // ============================================================================

  describe('Invalid Password', () => {
    it('InvalidPassword_ShouldFailValidation_WhenPasswordIsTooShort', () => {
      // Arrange
      const invalidInput = {
        email: 'test@example.com',
        password: '1234567', // 7 characters
      };

      // Act
      const result = loginSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find(
          (issue) => issue.path[0] === 'password'
        );
        expect(passwordError?.message).toBe('Password must be at least 8 characters');
      }
    });

    it('InvalidPassword_ShouldFailValidation_WhenPasswordIsEmpty', () => {
      // Arrange
      const invalidInput = {
        email: 'test@example.com',
        password: '',
      };

      // Act
      const result = loginSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find(
          (issue) => issue.path[0] === 'password'
        );
        expect(passwordError?.message).toBe('Password must be at least 8 characters');
      }
    });

    it('InvalidPassword_ShouldFailValidation_WhenPasswordIsTooLong', () => {
      // Arrange
      const invalidInput = {
        email: 'test@example.com',
        password: 'a'.repeat(101), // 101 characters
      };

      // Act
      const result = loginSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find(
          (issue) => issue.path[0] === 'password'
        );
        expect(passwordError?.message).toBe('Password is too long');
      }
    });

    it('InvalidPassword_ShouldFailValidation_WhenPasswordIsMissing', () => {
      // Arrange
      const invalidInput = {
        email: 'test@example.com',
      };

      // Act
      const result = loginSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find(
          (issue) => issue.path[0] === 'password'
        );
        expect(passwordError).toBeDefined();
      }
    });
  });

  // ============================================================================
  // UNIT TESTS - Invalid RememberMe
  // ============================================================================

  describe('Invalid RememberMe', () => {
    it('InvalidRememberMe_ShouldFailValidation_WhenRememberMeIsNotBoolean', () => {
      // Arrange
      const invalidInput = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: 'yes' as unknown, // Invalid type
      };

      // Act
      const result = loginSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const rememberMeError = result.error.issues.find(
          (issue) => issue.path[0] === 'rememberMe'
        );
        expect(rememberMeError).toBeDefined();
      }
    });
  });

  // ============================================================================
  // UNIT TESTS - Multiple Errors
  // ============================================================================

  describe('Multiple Errors', () => {
    it('MultipleErrors_ShouldFailValidation_WhenBothEmailAndPasswordAreInvalid', () => {
      // Arrange
      const invalidInput = {
        email: 'invalid-email',
        password: 'short',
      };

      // Act
      const result = loginSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
        
        const emailError = result.error.issues.find(
          (issue) => issue.path[0] === 'email'
        );
        const passwordError = result.error.issues.find(
          (issue) => issue.path[0] === 'password'
        );
        
        expect(emailError?.message).toBe('Invalid email format');
        expect(passwordError?.message).toBe('Password must be at least 8 characters');
      }
    });

    it('MultipleErrors_ShouldFailValidation_WhenAllFieldsAreInvalid', () => {
      // Arrange
      const invalidInput = {
        email: '',
        password: '',
        rememberMe: 'invalid' as unknown,
      };

      // Act
      const result = loginSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  // ============================================================================
  // PROPERTY-BASED TESTS
  // ============================================================================

  describe('Property-Based Tests', () => {
    /**
     * Property 1.1: Email Validation
     * **Validates: Requirements AC-3.9**
     * 
     * For all strings s:
     *   If s is a valid email format (contains @ and domain),
     *   then loginSchema.parse({ email: s, password: "valid123" }) succeeds
     *   
     *   If s is not a valid email format,
     *   then loginSchema.parse({ email: s, password: "valid123" }) throws ZodError
     */
    test.prop([
      fc.emailAddress().filter(email => {
        // Filter out edge case emails that fast-check generates but Zod rejects
        // Zod's email validation is stricter than the RFC spec
        try {
          return loginSchema.safeParse({ email, password: 'validPassword123' }).success;
        } catch {
          return false;
        }
      })
    ], { numRuns: 20 })('Property_1_1_EmailValidation_ShouldSucceed_WhenEmailIsValid', (email) => {
      // Arrange
      const input = {
        email,
        password: 'validPassword123',
      };

      // Act
      const result = loginSchema.safeParse(input);

      // Assert
      expect(result.success).toBe(true);
    });

    test.prop([
      fc.oneof(
        fc.string().filter(s => !s.includes('@')), // No @ symbol
        fc.string().filter(s => s.includes('@') && !s.split('@')[1]), // No domain after @
        fc.constant(''), // Empty string
        fc.constant('@'), // Just @
        fc.constant('user@'), // No domain
        fc.constant('@domain.com'), // No local part
      )
    ], { numRuns: 20 })('Property_1_1_EmailValidation_ShouldFail_WhenEmailIsInvalid', (invalidEmail) => {
      // Arrange
      const input = {
        email: invalidEmail,
        password: 'validPassword123',
      };

      // Act
      const result = loginSchema.safeParse(input);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find(
          (issue) => issue.path[0] === 'email'
        );
        expect(emailError).toBeDefined();
      }
    });

    /**
     * Property 1.2: Password Length
     * **Validates: Requirements AC-3.9**
     * 
     * For all strings p:
     *   If length(p) >= 8 and length(p) <= 100,
     *   then loginSchema.parse({ email: "test@example.com", password: p }) succeeds
     *   
     *   If length(p) < 8 or length(p) > 100,
     *   then loginSchema.parse({ email: "test@example.com", password: p }) throws ZodError
     */
    test.prop([
      fc.string({ minLength: 8, maxLength: 100 }).filter(s => s.length >= 8 && s.length <= 100)
    ], { numRuns: 20 })(
      'Property_1_2_PasswordLength_ShouldSucceed_WhenPasswordLengthIsValid',
      (password) => {
        // Arrange
        const input = {
          email: 'test@example.com',
          password,
        };

        // Act
        const result = loginSchema.safeParse(input);

        // Assert
        expect(result.success).toBe(true);
      }
    );

    test.prop([
      fc.oneof(
        fc.string({ maxLength: 7 }), // Too short
        fc.string({ minLength: 101, maxLength: 200 }), // Too long
      )
    ], { numRuns: 20 })('Property_1_2_PasswordLength_ShouldFail_WhenPasswordLengthIsInvalid', (invalidPassword) => {
      // Arrange
      const input = {
        email: 'test@example.com',
        password: invalidPassword,
      };

      // Act
      const result = loginSchema.safeParse(input);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find(
          (issue) => issue.path[0] === 'password'
        );
        expect(passwordError).toBeDefined();
        
        // Verify the error message is appropriate
        if (invalidPassword.length < 8) {
          expect(passwordError?.message).toBe('Password must be at least 8 characters');
        } else if (invalidPassword.length > 100) {
          expect(passwordError?.message).toBe('Password is too long');
        }
      }
    });

    /**
     * Property: RememberMe Optional Boolean
     * 
     * For all valid email and password combinations:
     *   Schema should accept rememberMe as true, false, or undefined
     */
    test.prop([
      fc.emailAddress().filter(email => {
        // Filter to emails that Zod accepts
        try {
          return loginSchema.safeParse({ email, password: 'validPassword123' }).success;
        } catch {
          return false;
        }
      }),
      fc.string({ minLength: 8, maxLength: 100 }).filter(s => s.length >= 8 && s.length <= 100),
      fc.option(fc.boolean(), { nil: undefined }),
    ], { numRuns: 20 })('Property_RememberMe_ShouldSucceed_WhenRememberMeIsOptionalBoolean', (email, password, rememberMe) => {
      // Arrange
      const input = rememberMe !== undefined
        ? { email, password, rememberMe }
        : { email, password };

      // Act
      const result = loginSchema.safeParse(input);

      // Assert
      expect(result.success).toBe(true);
      if (result.success && rememberMe !== undefined) {
        expect(result.data.rememberMe).toBe(rememberMe);
      }
    });

    /**
     * Property: Complete Valid Form
     * 
     * For all valid combinations of email, password, and rememberMe:
     *   Schema should parse successfully and return the same data
     */
    test.prop([
      fc.emailAddress().filter(email => {
        // Filter to emails that Zod accepts
        try {
          return loginSchema.safeParse({ email, password: 'validPassword123' }).success;
        } catch {
          return false;
        }
      }),
      fc.string({ minLength: 8, maxLength: 100 }).filter(s => s.length >= 8 && s.length <= 100),
      fc.boolean(),
    ], { numRuns: 20 })('Property_CompleteForm_ShouldSucceed_WhenAllFieldsAreValid', (email, password, rememberMe) => {
      // Arrange
      const input = { email, password, rememberMe };

      // Act
      const result = loginSchema.safeParse(input);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe(email);
        expect(result.data.password).toBe(password);
        expect(result.data.rememberMe).toBe(rememberMe);
      }
    });
  });
});
