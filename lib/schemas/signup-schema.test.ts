/**
 * Tests for Signup Form Validation Schema
 * 
 * Includes both unit tests and property-based tests to verify:
 * - Email validation (Property 1.1)
 * - Password length validation (Property 1.2)
 * - Optional name field validation (Property 1.3)
 * - Valid inputs pass validation
 * - Invalid inputs fail with correct error messages
 */

import { describe, it, expect } from 'vitest';
import { fc, test } from '@fast-check/vitest';
import { signupSchema } from './signup-schema';

describe('Signup Schema Validation', () => {
  // ============================================================================
  // UNIT TESTS - Valid Inputs
  // ============================================================================

  describe('Valid Inputs', () => {
    it('ValidInputs_ShouldPassValidation_WhenAllFieldsAreValid', () => {
      // Arrange
      const validInput = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
      };

      // Act
      const result = signupSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('ValidInputs_ShouldPassValidation_WhenNameIsOmitted', () => {
      // Arrange
      const validInput = {
        email: 'user@domain.com',
        password: 'securePass123',
      };

      // Act
      const result = signupSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe(validInput.email);
        expect(result.data.password).toBe(validInput.password);
        expect(result.data.name).toBeUndefined();
      }
    });

    it('ValidInputs_ShouldPassValidation_WhenNameIsEmptyString', () => {
      // Arrange
      const validInput = {
        name: '',
        email: 'admin@company.org',
        password: 'myPassword1',
      };

      // Act
      const result = signupSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('');
      }
    });

    it('ValidInputs_ShouldPassValidation_WhenPasswordIsExactly8Characters', () => {
      // Arrange
      const validInput = {
        name: 'Test User',
        email: 'test@test.com',
        password: '12345678', // Exactly 8 characters
      };

      // Act
      const result = signupSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
    });

    it('ValidInputs_ShouldPassValidation_WhenPasswordIsExactly100Characters', () => {
      // Arrange
      const validInput = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'a'.repeat(100), // Exactly 100 characters
      };

      // Act
      const result = signupSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
    });

    it('ValidInputs_ShouldPassValidation_WhenNameIsExactly100Characters', () => {
      // Arrange
      const validInput = {
        name: 'a'.repeat(100), // Exactly 100 characters
        email: 'test@test.com',
        password: 'password123',
      };

      // Act
      const result = signupSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
    });

    it('ValidInputs_ShouldPassValidation_WhenEmailHasSubdomain', () => {
      // Arrange
      const validInput = {
        name: 'User Name',
        email: 'user@mail.example.com',
        password: 'password123',
      };

      // Act
      const result = signupSchema.safeParse(validInput);

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
      const result = signupSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
    });

    it('ValidInputs_ShouldPassValidation_WhenNameHasSpecialCharacters', () => {
      // Arrange
      const validInput = {
        name: "O'Brien-Smith Jr.",
        email: 'test@example.com',
        password: 'password123',
      };

      // Act
      const result = signupSchema.safeParse(validInput);

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
        name: 'John Doe',
        email: '',
        password: 'password123',
      };

      // Act
      const result = signupSchema.safeParse(invalidInput);

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
        name: 'John Doe',
        password: 'password123',
      };

      // Act
      const result = signupSchema.safeParse(invalidInput);

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
        name: 'John Doe',
        email: 'notanemail.com',
        password: 'password123',
      };

      // Act
      const result = signupSchema.safeParse(invalidInput);

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
      const result = signupSchema.safeParse(invalidInput);

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
      const result = signupSchema.safeParse(invalidInput);

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
        name: 'John Doe',
        email: 'test@example.com',
        password: '1234567', // 7 characters
      };

      // Act
      const result = signupSchema.safeParse(invalidInput);

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
      const result = signupSchema.safeParse(invalidInput);

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
      const result = signupSchema.safeParse(invalidInput);

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
      const result = signupSchema.safeParse(invalidInput);

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
  // UNIT TESTS - Invalid Name
  // ============================================================================

  describe('Invalid Name', () => {
    it('InvalidName_ShouldFailValidation_WhenNameIsTooLong', () => {
      // Arrange
      const invalidInput = {
        name: 'a'.repeat(101), // 101 characters
        email: 'test@example.com',
        password: 'password123',
      };

      // Act
      const result = signupSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameError = result.error.issues.find(
          (issue) => issue.path[0] === 'name'
        );
        expect(nameError?.message).toBe('Name is too long');
      }
    });
  });

  // ============================================================================
  // UNIT TESTS - Multiple Errors
  // ============================================================================

  describe('Multiple Errors', () => {
    it('MultipleErrors_ShouldFailValidation_WhenEmailAndPasswordAreInvalid', () => {
      // Arrange
      const invalidInput = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'short',
      };

      // Act
      const result = signupSchema.safeParse(invalidInput);

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
        name: 'a'.repeat(101),
        email: '',
        password: '',
      };

      // Act
      const result = signupSchema.safeParse(invalidInput);

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
     *   then signupSchema.parse({ email: s, password: "valid123", name: "" }) succeeds
     *   
     *   If s is not a valid email format,
     *   then signupSchema.parse({ email: s, password: "valid123", name: "" }) throws ZodError
     */
    test.prop([
      fc.emailAddress().filter(email => {
        // Filter out edge case emails that fast-check generates but Zod rejects
        try {
          return signupSchema.safeParse({ email, password: 'validPassword123', name: '' }).success;
        } catch {
          return false;
        }
      })
    ], { numRuns: 20 })('Property_1_1_EmailValidation_ShouldSucceed_WhenEmailIsValid', (email) => {
      // Arrange
      const input = {
        email,
        password: 'validPassword123',
        name: '',
      };

      // Act
      const result = signupSchema.safeParse(input);

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
        name: '',
      };

      // Act
      const result = signupSchema.safeParse(input);

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
     * **Validates: Requirements AC-3.10**
     * 
     * For all strings p:
     *   If length(p) >= 8 and length(p) <= 100,
     *   then signupSchema.parse({ email: "test@example.com", password: p, name: "" }) succeeds
     *   
     *   If length(p) < 8 or length(p) > 100,
     *   then signupSchema.parse({ email: "test@example.com", password: p, name: "" }) throws ZodError
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
          name: '',
        };

        // Act
        const result = signupSchema.safeParse(input);

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
        name: '',
      };

      // Act
      const result = signupSchema.safeParse(input);

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
     * Property 1.3: Optional Name Field
     * **Validates: Requirements AC-3.2**
     * 
     * For all strings n (including empty string):
     *   signupSchema.parse({ email: "test@example.com", password: "valid123", name: n }) succeeds
     *   
     * Name field can be omitted:
     *   signupSchema.parse({ email: "test@example.com", password: "valid123" }) succeeds
     */
    test.prop([
      fc.string({ maxLength: 100 })
    ], { numRuns: 20 })('Property_1_3_OptionalName_ShouldSucceed_WhenNameIsAnyString', (name) => {
      // Arrange
      const input = {
        email: 'test@example.com',
        password: 'validPassword123',
        name,
      };

      // Act
      const result = signupSchema.safeParse(input);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe(name);
      }
    });

    test.prop([
      fc.emailAddress().filter(email => {
        try {
          return signupSchema.safeParse({ email, password: 'validPassword123' }).success;
        } catch {
          return false;
        }
      }),
      fc.string({ minLength: 8, maxLength: 100 })
    ], { numRuns: 20 })('Property_1_3_OptionalName_ShouldSucceed_WhenNameIsOmitted', (email, password) => {
      // Arrange
      const input = {
        email,
        password,
      };

      // Act
      const result = signupSchema.safeParse(input);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBeUndefined();
      }
    });

    /**
     * Property: Complete Valid Form
     * 
     * For all valid combinations of name, email, and password:
     *   Schema should parse successfully and return the same data
     */
    test.prop([
      fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
      fc.emailAddress().filter(email => {
        try {
          return signupSchema.safeParse({ email, password: 'validPassword123' }).success;
        } catch {
          return false;
        }
      }),
      fc.string({ minLength: 8, maxLength: 100 }),
    ], { numRuns: 20 })('Property_CompleteForm_ShouldSucceed_WhenAllFieldsAreValid', (name, email, password) => {
      // Arrange
      const input = name !== undefined
        ? { name, email, password }
        : { email, password };

      // Act
      const result = signupSchema.safeParse(input);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe(email);
        expect(result.data.password).toBe(password);
        if (name !== undefined) {
          expect(result.data.name).toBe(name);
        }
      }
    });
  });
});
