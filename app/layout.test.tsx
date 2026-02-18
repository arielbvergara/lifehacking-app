/**
 * Tests for RootLayout component
 * Verifies AuthProvider integration
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RootLayout from './layout';

// Mock Next.js fonts
vi.mock('next/font/google', () => ({
  Plus_Jakarta_Sans: () => ({
    variable: '--font-display',
    className: 'plus-jakarta-sans',
  }),
}));

// Mock the AuthProvider and useAuth
vi.mock('@/lib/auth/auth-context', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
  useAuth: () => ({
    user: null,
    idToken: null,
    loading: false,
    error: null,
    signInWithGoogle: vi.fn(),
    signInWithEmail: vi.fn(),
    signOut: vi.fn(),
    signUpWithGoogle: vi.fn(),
    signUpWithEmail: vi.fn(),
    resetPassword: vi.fn(),
  }),
}));

describe('RootLayout', () => {
  it('RootLayout_ShouldWrapChildrenWithAuthProvider_WhenRendered', () => {
    // Arrange
    const testContent = 'Test Content';

    // Act
    render(
      <RootLayout>
        <div>{testContent}</div>
      </RootLayout>
    );

    // Assert
    const authProvider = screen.getByTestId('auth-provider');
    expect(authProvider).toBeDefined();
    expect(screen.getByText(testContent)).toBeDefined();
  });

  it('RootLayout_ShouldRenderChildrenInsideAuthProvider_WhenRendered', () => {
    // Arrange
    const testContent = 'Child Component';

    // Act
    render(
      <RootLayout>
        <div data-testid="child-component">{testContent}</div>
      </RootLayout>
    );

    // Assert
    const authProvider = screen.getByTestId('auth-provider');
    const childComponent = screen.getByTestId('child-component');
    
    // Verify child is inside auth provider
    expect(authProvider).toBeDefined();
    expect(childComponent).toBeDefined();
    expect(authProvider.contains(childComponent)).toBe(true);
  });
});
