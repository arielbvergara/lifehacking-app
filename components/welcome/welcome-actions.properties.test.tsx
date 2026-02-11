/**
 * WelcomeActions Component Property-Based Tests
 * 
 * Property-based tests for the WelcomeActions component.
 * Tests universal properties that should hold for all inputs.
 * 
 * Feature: welcome-and-profile-pages
 * Property 2: Explore Button Navigation
 * Property 3: Profile Link Navigation
 * Validates: Requirements 2.2, 2.4
 */

import { describe, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { test, fc } from '@fast-check/vitest';
import { WelcomeActions } from './welcome-actions';

describe('WelcomeActions Property-Based Tests', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Property 2: Explore Button Navigation', () => {
    /**
     * Property: For any click on the "Start Exploring Tips" button,
     * the onExplore callback should be invoked exactly once.
     * 
     * This property verifies that the explore button navigation works
     * consistently regardless of the number of times it's tested.
     * 
     * Tag: Feature: welcome-and-profile-pages, Property 2: Explore Button Navigation
     * Validates: Requirements 2.2
     */
    test.prop([fc.constant(null)], { numRuns: 100 })('ExploreButtonNavigation_ShouldInvokeOnExploreCallback_WhenButtonIsClicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnExplore = vi.fn();
      const mockOnViewProfile = vi.fn();
      
      const { unmount } = render(<WelcomeActions onExplore={mockOnExplore} onViewProfile={mockOnViewProfile} />);
      
      // Act
      const exploreButton = screen.getByRole('button', { name: /start exploring tips/i });
      await user.click(exploreButton);
      
      // Assert
      expect(mockOnExplore).toHaveBeenCalledTimes(1);
      
      // Cleanup
      unmount();
    });

    /**
     * Property: For any sequence of clicks on the "Start Exploring Tips" button,
     * the onExplore callback should be invoked the same number of times as clicks.
     * 
     * This property verifies that multiple clicks are handled correctly.
     */
    test.prop([fc.integer({ min: 1, max: 10 })], { numRuns: 100 })('ExploreButtonNavigation_ShouldInvokeOnExploreMultipleTimes_WhenButtonIsClickedMultipleTimes', async (clickCount) => {
      // Arrange
      const user = userEvent.setup();
      const mockOnExplore = vi.fn();
      const mockOnViewProfile = vi.fn();
      
      const { unmount } = render(<WelcomeActions onExplore={mockOnExplore} onViewProfile={mockOnViewProfile} />);
      
      // Act
      const exploreButton = screen.getByRole('button', { name: /start exploring tips/i });
      for (let i = 0; i < clickCount; i++) {
        await user.click(exploreButton);
      }
      
      // Assert
      expect(mockOnExplore).toHaveBeenCalledTimes(clickCount);
      expect(mockOnViewProfile).not.toHaveBeenCalled();
      
      // Cleanup
      unmount();
    });

    /**
     * Property: For any click on the "Start Exploring Tips" button,
     * the onViewProfile callback should NOT be invoked.
     * 
     * This property verifies that clicking the explore button doesn't
     * accidentally trigger the profile navigation.
     */
    test.prop([fc.constant(null)], { numRuns: 100 })('ExploreButtonNavigation_ShouldNotInvokeOnViewProfile_WhenExploreButtonIsClicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnExplore = vi.fn();
      const mockOnViewProfile = vi.fn();
      
      const { unmount } = render(<WelcomeActions onExplore={mockOnExplore} onViewProfile={mockOnViewProfile} />);
      
      // Act
      const exploreButton = screen.getByRole('button', { name: /start exploring tips/i });
      await user.click(exploreButton);
      
      // Assert
      expect(mockOnViewProfile).not.toHaveBeenCalled();
      
      // Cleanup
      unmount();
    });
  });

  describe('Property 3: Profile Link Navigation', () => {
    /**
     * Property: For any click on the "View My Profile" link,
     * the onViewProfile callback should be invoked exactly once.
     * 
     * This property verifies that the profile link navigation works
     * consistently regardless of the number of times it's tested.
     * 
     * Tag: Feature: welcome-and-profile-pages, Property 3: Profile Link Navigation
     * Validates: Requirements 2.4
     */
    test.prop([fc.constant(null)], { numRuns: 100 })('ProfileLinkNavigation_ShouldInvokeOnViewProfileCallback_WhenLinkIsClicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnExplore = vi.fn();
      const mockOnViewProfile = vi.fn();
      
      const { unmount } = render(<WelcomeActions onExplore={mockOnExplore} onViewProfile={mockOnViewProfile} />);
      
      // Act
      const profileButton = screen.getByRole('button', { name: /view my profile/i });
      await user.click(profileButton);
      
      // Assert
      expect(mockOnViewProfile).toHaveBeenCalledTimes(1);
      
      // Cleanup
      unmount();
    });

    /**
     * Property: For any sequence of clicks on the "View My Profile" link,
     * the onViewProfile callback should be invoked the same number of times as clicks.
     * 
     * This property verifies that multiple clicks are handled correctly.
     */
    test.prop([fc.integer({ min: 1, max: 10 })], { numRuns: 100 })('ProfileLinkNavigation_ShouldInvokeOnViewProfileMultipleTimes_WhenLinkIsClickedMultipleTimes', async (clickCount) => {
      // Arrange
      const user = userEvent.setup();
      const mockOnExplore = vi.fn();
      const mockOnViewProfile = vi.fn();
      
      const { unmount } = render(<WelcomeActions onExplore={mockOnExplore} onViewProfile={mockOnViewProfile} />);
      
      // Act
      const profileButton = screen.getByRole('button', { name: /view my profile/i });
      for (let i = 0; i < clickCount; i++) {
        await user.click(profileButton);
      }
      
      // Assert
      expect(mockOnViewProfile).toHaveBeenCalledTimes(clickCount);
      expect(mockOnExplore).not.toHaveBeenCalled();
      
      // Cleanup
      unmount();
    });

    /**
     * Property: For any click on the "View My Profile" link,
     * the onExplore callback should NOT be invoked.
     * 
     * This property verifies that clicking the profile link doesn't
     * accidentally trigger the explore navigation.
     */
    test.prop([fc.constant(null)], { numRuns: 100 })('ProfileLinkNavigation_ShouldNotInvokeOnExplore_WhenProfileLinkIsClicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnExplore = vi.fn();
      const mockOnViewProfile = vi.fn();
      
      const { unmount } = render(<WelcomeActions onExplore={mockOnExplore} onViewProfile={mockOnViewProfile} />);
      
      // Act
      const profileButton = screen.getByRole('button', { name: /view my profile/i });
      await user.click(profileButton);
      
      // Assert
      expect(mockOnExplore).not.toHaveBeenCalled();
      
      // Cleanup
      unmount();
    });
  });
});
