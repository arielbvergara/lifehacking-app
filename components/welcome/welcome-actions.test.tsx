/**
 * WelcomeActions Component Tests
 * 
 * Unit tests for the WelcomeActions component.
 * Tests button and link rendering, callback invocation, icon presence, and styling.
 * 
 * Requirements: 2.1, 2.3, 2.5, 2.6
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { WelcomeActions } from './welcome-actions';

describe('WelcomeActions', () => {
  describe('Button and Link Rendering', () => {
    it('ButtonRendering_ShouldDisplayStartExploringButton_WhenComponentRenders', () => {
      // Arrange
      const mockOnExplore = vi.fn();
      const mockOnViewProfile = vi.fn();

      // Act
      render(<WelcomeActions onExplore={mockOnExplore} onViewProfile={mockOnViewProfile} />);

      // Assert
      const exploreButton = screen.getByRole('button', { name: /start exploring tips/i });
      expect(exploreButton).toBeDefined();
      expect(exploreButton.textContent).toContain('Start Exploring Tips');
    });

    it('ButtonRendering_ShouldDisplayViewProfileButton_WhenComponentRenders', () => {
      // Arrange
      const mockOnExplore = vi.fn();
      const mockOnViewProfile = vi.fn();

      // Act
      render(<WelcomeActions onExplore={mockOnExplore} onViewProfile={mockOnViewProfile} />);

      // Assert
      const profileButton = screen.getByRole('button', { name: /view my profile/i });
      expect(profileButton).toBeDefined();
      expect(profileButton.textContent).toContain('View My Profile');
    });
  });

  describe('Callback Invocation', () => {
    it('CallbackInvocation_ShouldCallOnExplore_WhenStartExploringButtonIsClicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnExplore = vi.fn();
      const mockOnViewProfile = vi.fn();
      render(<WelcomeActions onExplore={mockOnExplore} onViewProfile={mockOnViewProfile} />);

      // Act
      const exploreButton = screen.getByRole('button', { name: /start exploring tips/i });
      await user.click(exploreButton);

      // Assert
      expect(mockOnExplore).toHaveBeenCalledTimes(1);
      expect(mockOnViewProfile).not.toHaveBeenCalled();
    });

    it('CallbackInvocation_ShouldCallOnViewProfile_WhenViewProfileButtonIsClicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnExplore = vi.fn();
      const mockOnViewProfile = vi.fn();
      render(<WelcomeActions onExplore={mockOnExplore} onViewProfile={mockOnViewProfile} />);

      // Act
      const profileButton = screen.getByRole('button', { name: /view my profile/i });
      await user.click(profileButton);

      // Assert
      expect(mockOnViewProfile).toHaveBeenCalledTimes(1);
      expect(mockOnExplore).not.toHaveBeenCalled();
    });

    it('CallbackInvocation_ShouldCallCallbacksMultipleTimes_WhenButtonsAreClickedMultipleTimes', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnExplore = vi.fn();
      const mockOnViewProfile = vi.fn();
      render(<WelcomeActions onExplore={mockOnExplore} onViewProfile={mockOnViewProfile} />);

      // Act
      const exploreButton = screen.getByRole('button', { name: /start exploring tips/i });
      const profileButton = screen.getByRole('button', { name: /view my profile/i });
      
      await user.click(exploreButton);
      await user.click(exploreButton);
      await user.click(profileButton);

      // Assert
      expect(mockOnExplore).toHaveBeenCalledTimes(2);
      expect(mockOnViewProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('Icon Presence', () => {
    it('IconPresence_ShouldDisplayArrowIcon_WhenStartExploringButtonRenders', () => {
      // Arrange
      const mockOnExplore = vi.fn();
      const mockOnViewProfile = vi.fn();

      // Act
      render(<WelcomeActions onExplore={mockOnExplore} onViewProfile={mockOnViewProfile} />);

      // Assert
      const exploreButton = screen.getByRole('button', { name: /start exploring tips/i });
      const arrowIcon = exploreButton.querySelector('.material-icons-round');
      expect(arrowIcon).not.toBeNull();
      expect(arrowIcon?.textContent).toBe('arrow_forward');
    });

    it('IconPresence_ShouldDisplayPersonIcon_WhenViewProfileButtonRenders', () => {
      // Arrange
      const mockOnExplore = vi.fn();
      const mockOnViewProfile = vi.fn();

      // Act
      render(<WelcomeActions onExplore={mockOnExplore} onViewProfile={mockOnViewProfile} />);

      // Assert
      const profileButton = screen.getByRole('button', { name: /view my profile/i });
      const personIcon = profileButton.querySelector('.material-icons-round');
      expect(personIcon).not.toBeNull();
      expect(personIcon?.textContent).toBe('person');
    });
  });

  describe('Styling Classes', () => {
    it('StylingClasses_ShouldApplyPrimaryGreenStyling_WhenStartExploringButtonRenders', () => {
      // Arrange
      const mockOnExplore = vi.fn();
      const mockOnViewProfile = vi.fn();

      // Act
      render(<WelcomeActions onExplore={mockOnExplore} onViewProfile={mockOnViewProfile} />);

      // Assert
      const exploreButton = screen.getByRole('button', { name: /start exploring tips/i });
      expect(exploreButton.className).toContain('bg-primary');
      expect(exploreButton.className).toContain('hover:bg-primary-dark');
      expect(exploreButton.className).toContain('text-black');
      expect(exploreButton.className).toContain('font-bold');
    });

    it('StylingClasses_ShouldApplyGrayStyling_WhenViewProfileButtonRenders', () => {
      // Arrange
      const mockOnExplore = vi.fn();
      const mockOnViewProfile = vi.fn();

      // Act
      render(<WelcomeActions onExplore={mockOnExplore} onViewProfile={mockOnViewProfile} />);

      // Assert
      const profileButton = screen.getByRole('button', { name: /view my profile/i });
      expect(profileButton.className).toContain('text-gray-600');
      expect(profileButton.className).toContain('hover:text-gray-800');
      expect(profileButton.className).toContain('hover:bg-gray-50');
      expect(profileButton.className).toContain('font-medium');
    });

    it('StylingClasses_ShouldApplyFullWidthAndRoundedCorners_WhenButtonsRender', () => {
      // Arrange
      const mockOnExplore = vi.fn();
      const mockOnViewProfile = vi.fn();

      // Act
      render(<WelcomeActions onExplore={mockOnExplore} onViewProfile={mockOnViewProfile} />);

      // Assert
      const exploreButton = screen.getByRole('button', { name: /start exploring tips/i });
      const profileButton = screen.getByRole('button', { name: /view my profile/i });
      
      expect(exploreButton.className).toContain('w-full');
      expect(exploreButton.className).toContain('rounded-xl');
      expect(profileButton.className).toContain('w-full');
      expect(profileButton.className).toContain('rounded-xl');
    });

    it('StylingClasses_ShouldApplyFlexAndGapClasses_WhenButtonsRender', () => {
      // Arrange
      const mockOnExplore = vi.fn();
      const mockOnViewProfile = vi.fn();

      // Act
      render(<WelcomeActions onExplore={mockOnExplore} onViewProfile={mockOnViewProfile} />);

      // Assert
      const exploreButton = screen.getByRole('button', { name: /start exploring tips/i });
      const profileButton = screen.getByRole('button', { name: /view my profile/i });
      
      expect(exploreButton.className).toContain('flex');
      expect(exploreButton.className).toContain('items-center');
      expect(exploreButton.className).toContain('justify-center');
      expect(exploreButton.className).toContain('gap-2');
      
      expect(profileButton.className).toContain('flex');
      expect(profileButton.className).toContain('items-center');
      expect(profileButton.className).toContain('justify-center');
      expect(profileButton.className).toContain('gap-2');
    });
  });
});
