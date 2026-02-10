/**
 * Unit and Integration Tests for User API Functions
 * 
 * Tests all user API functions with mocked fetch calls.
 * Covers both success and error scenarios.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fc, test } from '@fast-check/vitest';
import {
  getUserProfile,
  createUser,
  handleUserSync,
  UserProfile,
} from './user';

// Store original fetch
const originalFetch = global.fetch;

describe('User API Functions', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original fetch after each test
    global.fetch = originalFetch;
  });

  describe('getUserProfile', () => {
    it('getUserProfile_ShouldReturnUserProfile_WhenAPICallSucceeds', async () => {
      // Arrange
      const mockToken = 'test-firebase-token-123';
      const mockProfile: UserProfile = {
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: '2024-01-01T00:00:00Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockProfile,
      } as Response);

      // Act
      const result = await getUserProfile(mockToken);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/User/me'),
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        })
      );
    });

    it('getUserProfile_ShouldIncludeBearerToken_WhenMakingAPICall', async () => {
      // Arrange
      const mockToken = 'test-token-with-special-chars-!@#$%';
      const mockProfile: UserProfile = {
        id: 'user-456',
        email: 'user@example.com',
        displayName: 'User Name',
        createdAt: '2024-01-15T10:30:00Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockProfile,
      } as Response);

      // Act
      await getUserProfile(mockToken);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it('getUserProfile_ShouldThrowUserNotFoundError_When404Returned', async () => {
      // Arrange
      const mockToken = 'test-token';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: 'User not found' }),
      } as Response);

      // Act & Assert
      await expect(getUserProfile(mockToken)).rejects.toThrow(
        'User profile not found'
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('getUserProfile_ShouldThrowGenericError_WhenNon404ErrorOccurs', async () => {
      // Arrange
      const mockToken = 'test-token';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
      } as Response);

      // Act & Assert
      await expect(getUserProfile(mockToken)).rejects.toThrow(
        'Failed to fetch user profile'
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('getUserProfile_ShouldThrowError_WhenNetworkFails', async () => {
      // Arrange
      const mockToken = 'test-token';

      global.fetch = vi.fn().mockRejectedValue(
        new Error('Network request failed')
      );

      // Act & Assert
      await expect(getUserProfile(mockToken)).rejects.toThrow(
        'Network request failed'
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('getUserProfile_ShouldThrowError_When401Unauthorized', async () => {
      // Arrange
      const mockToken = 'invalid-token';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      } as Response);

      // Act & Assert
      await expect(getUserProfile(mockToken)).rejects.toThrow(
        'Failed to fetch user profile'
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('getUserProfile_ShouldUseEnvironmentVariable_ForAPIBaseURL', async () => {
      // Arrange
      const mockToken = 'test-token';
      const mockProfile: UserProfile = {
        id: 'user-789',
        email: 'env@example.com',
        displayName: 'Env User',
        createdAt: '2024-02-01T00:00:00Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockProfile,
      } as Response);

      // Act
      await getUserProfile(mockToken);

      // Assert
      // Should use either env variable or default localhost
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/^https?:\/\/.+\/api\/User\/me$/),
        expect.any(Object)
      );
    });
  });

  describe('createUser', () => {
    it('createUser_ShouldReturnCreatedProfile_WhenAPICallSucceeds', async () => {
      // Arrange
      const mockToken = 'test-firebase-token-456';
      const mockProfile: UserProfile = {
        id: 'new-user-123',
        email: 'newuser@example.com',
        displayName: 'New User',
        createdAt: '2024-03-01T00:00:00Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => mockProfile,
      } as Response);

      // Act
      const result = await createUser(mockToken);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/User'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('createUser_ShouldIncludeCorrectHeaders_WhenMakingAPICall', async () => {
      // Arrange
      const mockToken = 'test-token-789';
      const mockProfile: UserProfile = {
        id: 'user-abc',
        email: 'headers@example.com',
        displayName: 'Headers User',
        createdAt: '2024-03-15T00:00:00Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => mockProfile,
      } as Response);

      // Act
      await createUser(mockToken);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('createUser_ShouldThrowError_WhenAPICallFails', async () => {
      // Arrange
      const mockToken = 'test-token';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad request' }),
      } as Response);

      // Act & Assert
      await expect(createUser(mockToken)).rejects.toThrow(
        'Failed to create user'
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('createUser_ShouldThrowError_WhenNetworkFails', async () => {
      // Arrange
      const mockToken = 'test-token';

      global.fetch = vi.fn().mockRejectedValue(
        new Error('Network connection lost')
      );

      // Act & Assert
      await expect(createUser(mockToken)).rejects.toThrow(
        'Network connection lost'
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('createUser_ShouldThrowError_When401Unauthorized', async () => {
      // Arrange
      const mockToken = 'invalid-token';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      } as Response);

      // Act & Assert
      await expect(createUser(mockToken)).rejects.toThrow(
        'Failed to create user'
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('createUser_ShouldThrowError_When409Conflict', async () => {
      // Arrange
      const mockToken = 'test-token';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ message: 'User already exists' }),
      } as Response);

      // Act & Assert
      await expect(createUser(mockToken)).rejects.toThrow(
        'Failed to create user'
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('createUser_ShouldUsePOSTMethod_WhenMakingAPICall', async () => {
      // Arrange
      const mockToken = 'test-token';
      const mockProfile: UserProfile = {
        id: 'user-post',
        email: 'post@example.com',
        displayName: 'POST User',
        createdAt: '2024-04-01T00:00:00Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => mockProfile,
      } as Response);

      // Act
      await createUser(mockToken);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('handleUserSync', () => {
    it('handleUserSync_ShouldReturnExistingProfile_WhenUserExists', async () => {
      // Arrange
      const mockToken = 'test-token-sync-1';
      const mockProfile: UserProfile = {
        id: 'existing-user-123',
        email: 'existing@example.com',
        displayName: 'Existing User',
        createdAt: '2024-01-01T00:00:00Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockProfile,
      } as Response);

      // Act
      const result = await handleUserSync(mockToken);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      // Should only call getUserProfile, not createUser
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/User/me'),
        expect.any(Object)
      );
    });

    it('handleUserSync_ShouldCreateNewProfile_WhenUserDoesNotExist', async () => {
      // Arrange
      const mockToken = 'test-token-sync-2';
      const mockNewProfile: UserProfile = {
        id: 'new-user-456',
        email: 'newuser@example.com',
        displayName: 'New User',
        createdAt: '2024-05-01T00:00:00Z',
      };

      // First call (getUserProfile) returns 404
      // Second call (createUser) returns new profile
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ message: 'User not found' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => mockNewProfile,
        } as Response);

      // Act
      const result = await handleUserSync(mockToken);

      // Assert
      expect(result).toEqual(mockNewProfile);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      
      // First call should be GET /api/User/me
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('/api/User/me'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      
      // Second call should be POST /api/User
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('/api/User'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('handleUserSync_ShouldThrowError_WhenGetUserProfileFailsWithNon404', async () => {
      // Arrange
      const mockToken = 'test-token-sync-3';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
      } as Response);

      // Act & Assert
      await expect(handleUserSync(mockToken)).rejects.toThrow(
        'Failed to fetch user profile'
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('handleUserSync_ShouldThrowError_WhenCreateUserFails', async () => {
      // Arrange
      const mockToken = 'test-token-sync-4';

      // First call (getUserProfile) returns 404
      // Second call (createUser) fails
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ message: 'User not found' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ message: 'Failed to create user' }),
        } as Response);

      // Act & Assert
      await expect(handleUserSync(mockToken)).rejects.toThrow(
        'Failed to create user'
      );
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('handleUserSync_ShouldThrowError_WhenNetworkFailsOnGetUser', async () => {
      // Arrange
      const mockToken = 'test-token-sync-5';

      global.fetch = vi.fn().mockRejectedValue(
        new Error('Network timeout')
      );

      // Act & Assert
      await expect(handleUserSync(mockToken)).rejects.toThrow(
        'Network timeout'
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('handleUserSync_ShouldThrowError_WhenNetworkFailsOnCreateUser', async () => {
      // Arrange
      const mockToken = 'test-token-sync-6';

      // First call (getUserProfile) returns 404
      // Second call (createUser) fails with network error
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ message: 'User not found' }),
        } as Response)
        .mockRejectedValueOnce(
          new Error('Network connection lost')
        );

      // Act & Assert
      await expect(handleUserSync(mockToken)).rejects.toThrow(
        'Network connection lost'
      );
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('handleUserSync_ShouldNotCallCreateUser_WhenUserExists', async () => {
      // Arrange
      const mockToken = 'test-token-sync-7';
      const mockProfile: UserProfile = {
        id: 'user-exists',
        email: 'exists@example.com',
        displayName: 'Exists User',
        createdAt: '2024-06-01T00:00:00Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockProfile,
      } as Response);

      // Act
      await handleUserSync(mockToken);

      // Assert
      expect(global.fetch).toHaveBeenCalledTimes(1);
      // Verify it was only GET, not POST
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/User/me'),
        expect.not.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  /**
   * Property-Based Tests
   * 
   * These tests verify that the API functions behave correctly
   * across a wide range of inputs and scenarios.
   */
  describe('Property-Based Tests', () => {
    test.prop([fc.string({ minLength: 10, maxLength: 200 })], { numRuns: 20 })(
      'getUserProfile_ShouldIncludeBearerToken_ForAnyValidToken',
      async (token) => {
        // Arrange
        const mockProfile: UserProfile = {
          id: 'prop-user-1',
          email: 'prop@example.com',
          displayName: 'Prop User',
          createdAt: '2024-07-01T00:00:00Z',
        };

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => mockProfile,
        } as Response);

        // Act
        await getUserProfile(token);

        // Assert
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: `Bearer ${token}`,
            }),
          })
        );
      }
    );

    test.prop([fc.string({ minLength: 10, maxLength: 200 })], { numRuns: 20 })(
      'createUser_ShouldIncludeCorrectHeaders_ForAnyValidToken',
      async (token) => {
        // Arrange
        const mockProfile: UserProfile = {
          id: 'prop-user-2',
          email: 'create@example.com',
          displayName: 'Create User',
          createdAt: '2024-08-01T00:00:00Z',
        };

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          status: 201,
          json: async () => mockProfile,
        } as Response);

        // Act
        await createUser(token);

        // Assert
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            }),
          })
        );
      }
    );

    test.prop([
      fc.constantFrom(400, 401, 403, 500, 502, 503),
    ], { numRuns: 20 })(
      'getUserProfile_ShouldThrowError_ForAnyNon200StatusCode',
      async (statusCode) => {
        // Arrange
        const mockToken = 'test-token';

        global.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: statusCode,
          json: async () => ({ message: 'Error' }),
        } as Response);

        // Act & Assert
        await expect(getUserProfile(mockToken)).rejects.toThrow();
        expect(global.fetch).toHaveBeenCalledTimes(1);
      }
    );

    test.prop([
      fc.constantFrom(400, 401, 403, 500, 502, 503),
    ], { numRuns: 20 })(
      'createUser_ShouldThrowError_ForAnyNon200StatusCode',
      async (statusCode) => {
        // Arrange
        const mockToken = 'test-token';

        global.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: statusCode,
          json: async () => ({ message: 'Error' }),
        } as Response);

        // Act & Assert
        await expect(createUser(mockToken)).rejects.toThrow(
          'Failed to create user'
        );
        expect(global.fetch).toHaveBeenCalledTimes(1);
      }
    );

    test.prop([fc.string({ minLength: 10, maxLength: 200 })], { numRuns: 20 })(
      'handleUserSync_ShouldAlwaysReturnUserProfile_WhenSuccessful',
      async (token) => {
        // Arrange
        const mockProfile: UserProfile = {
          id: 'sync-user',
          email: 'sync@example.com',
          displayName: 'Sync User',
          createdAt: '2024-09-01T00:00:00Z',
        };

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => mockProfile,
        } as Response);

        // Act
        const result = await handleUserSync(token);

        // Assert
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('email');
        expect(result).toHaveProperty('displayName');
        expect(result).toHaveProperty('createdAt');
        expect(typeof result.id).toBe('string');
        expect(typeof result.email).toBe('string');
      }
    );

    test.prop([fc.string({ minLength: 10, maxLength: 200 })], { numRuns: 20 })(
      'handleUserSync_ShouldCreateUser_WhenGetReturns404',
      async (token) => {
        // Arrange
        const mockNewProfile: UserProfile = {
          id: 'new-sync-user',
          email: 'newsync@example.com',
          displayName: 'New Sync User',
          createdAt: '2024-10-01T00:00:00Z',
        };

        global.fetch = vi
          .fn()
          .mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ message: 'User not found' }),
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            status: 201,
            json: async () => mockNewProfile,
          } as Response);

        // Act
        const result = await handleUserSync(token);

        // Assert
        expect(result).toEqual(mockNewProfile);
        expect(global.fetch).toHaveBeenCalledTimes(2);
        
        // Verify first call was GET
        expect(global.fetch).toHaveBeenNthCalledWith(
          1,
          expect.stringContaining('/api/User/me'),
          expect.not.objectContaining({ method: 'POST' })
        );
        
        // Verify second call was POST
        expect(global.fetch).toHaveBeenNthCalledWith(
          2,
          expect.stringContaining('/api/User'),
          expect.objectContaining({ method: 'POST' })
        );
      }
    );
  });

  /**
   * Error Message Tests
   * 
   * Verify that error messages are user-friendly and helpful.
   */
  describe('Error Message Quality', () => {
    it('getUserProfile_ShouldProvideUserFriendlyErrorMessage_When404', async () => {
      // Arrange
      const mockToken = 'test-token';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' }),
      } as Response);

      // Act & Assert
      try {
        await getUserProfile(mockToken);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorMessage = (error as Error).message;
        
        // Error message should be user-friendly
        expect(errorMessage).toBe('User profile not found');
        expect(errorMessage).not.toContain('404');
        expect(errorMessage).not.toContain('API');
        expect(errorMessage).not.toContain('endpoint');
      }
    });

    it('createUser_ShouldProvideUserFriendlyErrorMessage_WhenFails', async () => {
      // Arrange
      const mockToken = 'test-token';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
      } as Response);

      // Act & Assert
      try {
        await createUser(mockToken);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorMessage = (error as Error).message;
        
        // Error message should be user-friendly
        expect(errorMessage).toBe('Failed to create user');
        expect(errorMessage).not.toContain('500');
        expect(errorMessage).not.toContain('Internal server error');
      }
    });
  });
});
