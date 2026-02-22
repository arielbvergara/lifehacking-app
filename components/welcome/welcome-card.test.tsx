/**
 * WelcomeCard Component Tests
 * 
 * Unit tests for the WelcomeCard component.
 * Tests heading and subtext rendering, CelebrationIcon presence, 
 * WelcomeActions integration, and card styling classes.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WelcomeCard } from './welcome-card';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock child components
vi.mock('./celebration-icon', () => ({
  CelebrationIcon: () => <div data-testid="celebration-icon">CelebrationIcon</div>,
}));

vi.mock('./welcome-actions', () => ({
  WelcomeActions: ({ onExplore, onViewProfile }: { onExplore: () => void; onViewProfile: () => void }) => (
    <div data-testid="welcome-actions">
      <button onClick={onExplore}>Start Exploring Tips</button>
      <button onClick={onViewProfile}>View My Profile</button>
    </div>
  ),
}));

describe('WelcomeCard', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  describe('Heading and Subtext Rendering', () => {
    it('HeadingRendering_ShouldDisplayWelcomeHeading_WhenComponentRenders', () => {
      // Arrange & Act
      render(<WelcomeCard />);

      // Assert
      const heading = screen.getByRole('heading', { name: /welcome to the family!/i });
      expect(heading).toBeDefined();
      expect(heading.textContent).toBe('Welcome to the Family!');
    });

    it('SubtextRendering_ShouldDisplayAccountCreationMessage_WhenComponentRenders', () => {
      // Arrange & Act
      const { container } = render(<WelcomeCard />);

      // Assert
      const subtext = container.querySelector('p');
      expect(subtext).not.toBeNull();
      expect(subtext?.textContent).toBe(
        'Your account has been successfully created. Ready to make life a little easier?'
      );
    });

    it('HeadingRendering_ShouldHaveCorrectTextStyling_WhenComponentRenders', () => {
      // Arrange & Act
      render(<WelcomeCard />);

      // Assert
      const heading = screen.getByRole('heading', { name: /welcome to the family!/i });
      expect(heading.className).toContain('text-3xl');
      expect(heading.className).toContain('md:text-4xl');
      expect(heading.className).toContain('font-bold');
      expect(heading.className).toContain('text-center');
      expect(heading.className).toContain('text-gray-900');
    });

    it('SubtextRendering_ShouldHaveCorrectTextStyling_WhenComponentRenders', () => {
      // Arrange & Act
      const { container } = render(<WelcomeCard />);

      // Assert
      const subtext = container.querySelector('p');
      expect(subtext?.className).toContain('text-center');
      expect(subtext?.className).toContain('text-gray-600');
      expect(subtext?.className).toContain('text-base');
    });
  });

  describe('CelebrationIcon Presence', () => {
    it('CelebrationIconPresence_ShouldRenderCelebrationIcon_WhenComponentRenders', () => {
      // Arrange & Act
      render(<WelcomeCard />);

      // Assert
      const icon = screen.getByTestId('celebration-icon');
      expect(icon).toBeDefined();
    });

    it('CelebrationIconPresence_ShouldRenderIconBeforeHeading_WhenComponentRenders', () => {
      // Arrange & Act
      const { container } = render(<WelcomeCard />);

      // Assert
      const icon = screen.getByTestId('celebration-icon');
      const heading = screen.getByRole('heading', { name: /welcome to the family!/i });
      
      // Check that icon appears before heading in DOM order
      const allElements = Array.from(container.querySelectorAll('*'));
      const iconIndex = allElements.indexOf(icon);
      const headingIndex = allElements.indexOf(heading);
      
      expect(iconIndex).toBeLessThan(headingIndex);
    });
  });

  describe('WelcomeActions Integration', () => {
    it('WelcomeActionsIntegration_ShouldRenderWelcomeActions_WhenComponentRenders', () => {
      // Arrange & Act
      render(<WelcomeCard />);

      // Assert
      const actions = screen.getByTestId('welcome-actions');
      expect(actions).toBeDefined();
    });

    it('WelcomeActionsIntegration_ShouldPassExploreCallback_WhenComponentRenders', async () => {
      // Arrange & Act
      render(<WelcomeCard />);
      const exploreButton = screen.getByRole('button', { name: /start exploring tips/i });

      // Act
      exploreButton.click();

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('WelcomeActionsIntegration_ShouldPassProfileCallback_WhenComponentRenders', async () => {
      // Arrange & Act
      render(<WelcomeCard />);
      const profileButton = screen.getByRole('button', { name: /view my profile/i });

      // Act
      profileButton.click();

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/profile');
    });

    it('WelcomeActionsIntegration_ShouldRenderActionsAfterSubtext_WhenComponentRenders', () => {
      // Arrange & Act
      const { container } = render(<WelcomeCard />);

      // Assert
      const actions = screen.getByTestId('welcome-actions');
      const subtext = container.querySelector('p');
      
      // Check that actions appear after subtext in DOM order
      const allElements = Array.from(container.querySelectorAll('*'));
      const subtextIndex = allElements.indexOf(subtext!);
      const actionsIndex = allElements.indexOf(actions);
      
      expect(actionsIndex).toBeGreaterThan(subtextIndex);
    });
  });

  describe('Card Styling Classes', () => {
    it('CardStyling_ShouldApplyWhiteBackground_WhenComponentRenders', () => {
      // Arrange & Act
      const { container } = render(<WelcomeCard />);

      // Assert
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('bg-white');
    });

    it('CardStyling_ShouldApplyRoundedCorners_WhenComponentRenders', () => {
      // Arrange & Act
      const { container } = render(<WelcomeCard />);

      // Assert
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('rounded-3xl');
    });

    it('CardStyling_ShouldApplyPadding_WhenComponentRenders', () => {
      // Arrange & Act
      const { container } = render(<WelcomeCard />);

      // Assert
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('p-8');
      expect(card.className).toContain('md:p-10');
    });

    it('CardStyling_ShouldApplyMaxWidth_WhenComponentRenders', () => {
      // Arrange & Act
      const { container } = render(<WelcomeCard />);

      // Assert
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('max-w-md');
      expect(card.className).toContain('w-full');
    });

    it('CardStyling_ShouldApplyShadowAndBorder_WhenComponentRenders', () => {
      // Arrange & Act
      const { container } = render(<WelcomeCard />);

      // Assert
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('shadow-soft');
      expect(card.className).toContain('border');
      expect(card.className).toContain('border-white/50');
    });

    it('CardStyling_ShouldApplyZIndex_WhenComponentRenders', () => {
      // Arrange & Act
      const { container } = render(<WelcomeCard />);

      // Assert
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('relative');
      expect(card.className).toContain('z-10');
    });
  });
});
