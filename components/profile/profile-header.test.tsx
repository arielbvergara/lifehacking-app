import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { User as FirebaseUser } from 'firebase/auth';
import { ProfileHeader } from './profile-header';

describe('ProfileHeader', () => {
  const mockUser = {
    uid: '123',
    email: 'alex.johnson@example.com',
    displayName: 'Alex Johnson',
  } as FirebaseUser;

  it('ProfileHeader_ShouldDisplayGreeting_WhenDisplayNameProvided', () => {
    render(
      <ProfileHeader
        user={mockUser}
        displayName="Alex"
        createdAt="2023-09-15T10:30:00Z"
        savedTipsCount={12}
      />
    );

    expect(screen.getByText(/Hi, Alex! Glad you're here./i)).toBeInTheDocument();
  });

  it('ProfileHeader_ShouldDisplayMemberSinceDate_WhenCreatedAtProvided', () => {
    render(
      <ProfileHeader
        user={mockUser}
        displayName="Alex"
        createdAt="2023-09-15T10:30:00Z"
        savedTipsCount={12}
      />
    );

    expect(screen.getByText(/Member since September 2023/i)).toBeInTheDocument();
  });

  it('ProfileHeader_ShouldDisplaySavedTipsCount_WhenCountProvided', () => {
    render(
      <ProfileHeader
        user={mockUser}
        displayName="Alex"
        createdAt="2023-09-15T10:30:00Z"
        savedTipsCount={12}
      />
    );

    expect(screen.getByText(/12 Saved Tips/i)).toBeInTheDocument();
  });

  it('ProfileHeader_ShouldLinkToFavoritesPage_WhenSavedTipsClicked', () => {
    render(
      <ProfileHeader
        user={mockUser}
        displayName="Alex"
        createdAt="2023-09-15T10:30:00Z"
        savedTipsCount={12}
      />
    );

    const link = screen.getByRole('link', { name: /view your 12 saved tips/i });
    expect(link).toHaveAttribute('href', '/favorites');
  });

  it('ProfileHeader_ShouldUseEmailUsername_WhenDisplayNameIsNull', () => {
    render(
      <ProfileHeader
        user={mockUser}
        displayName={null}
        createdAt="2023-09-15T10:30:00Z"
        savedTipsCount={0}
      />
    );

    expect(screen.getByText(/Hi, alex.johnson! Glad you're here./i)).toBeInTheDocument();
  });

  it('ProfileHeader_ShouldDisplayInitials_WhenUserHasDisplayName', () => {
    render(
      <ProfileHeader
        user={mockUser}
        displayName="Alex Johnson"
        createdAt="2023-09-15T10:30:00Z"
        savedTipsCount={5}
      />
    );

    // Check that initials are displayed (AJ from Alex Johnson)
    expect(screen.getByText('AJ')).toBeInTheDocument();
  });

  it('ProfileHeader_ShouldHandleZeroSavedTips_WhenCountIsZero', () => {
    render(
      <ProfileHeader
        user={mockUser}
        displayName="Alex"
        createdAt="2023-09-15T10:30:00Z"
        savedTipsCount={0}
      />
    );

    expect(screen.getByText(/0 Saved Tips/i)).toBeInTheDocument();
  });
});
