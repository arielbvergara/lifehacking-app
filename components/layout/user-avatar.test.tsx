import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { User as FirebaseUser } from 'firebase/auth';
import { UserAvatar } from './user-avatar';

describe('UserAvatar', () => {
  it('should display initials for user with two-word display name', () => {
    const user = {
      displayName: 'Ariel Cohen',
      email: 'ariel@example.com',
    } as FirebaseUser;

    render(<UserAvatar user={user} />);

    expect(screen.getByText('AC')).toBeInTheDocument();
  });

  it('should display initials for user with single-word display name', () => {
    const user = {
      displayName: 'Chiara',
      email: 'chiara@example.com',
    } as FirebaseUser;

    render(<UserAvatar user={user} />);

    expect(screen.getByText('CH')).toBeInTheDocument();
  });

  it('should display initials derived from email when display name is null', () => {
    const user = {
      displayName: null,
      email: 'test@example.com',
    } as FirebaseUser;

    render(<UserAvatar user={user} />);

    expect(screen.getByText('TE')).toBeInTheDocument();
  });

  it('should display fallback initials when both display name and email are null', () => {
    const user = {
      displayName: null,
      email: null,
    } as FirebaseUser;

    render(<UserAvatar user={user} />);

    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const firebaseUser = {
      displayName: 'John Doe',
      email: 'john@example.com',
    } as FirebaseUser;

    render(<UserAvatar user={firebaseUser} onClick={handleClick} />);

    const button = screen.getByRole('button', { name: /user menu/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not throw error when onClick is not provided', async () => {
    const user = userEvent.setup();
    const firebaseUser = {
      displayName: 'Jane Doe',
      email: 'jane@example.com',
    } as FirebaseUser;

    render(<UserAvatar user={firebaseUser} />);

    const button = screen.getByRole('button', { name: /user menu/i });
    
    // Should not throw
    await expect(user.click(button)).resolves.not.toThrow();
  });

  it('should render as a button element', () => {
    const user = {
      displayName: 'Test User',
      email: 'test@example.com',
    } as FirebaseUser;

    render(<UserAvatar user={user} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('should have accessible label', () => {
    const user = {
      displayName: 'Test User',
      email: 'test@example.com',
    } as FirebaseUser;

    render(<UserAvatar user={user} />);

    expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument();
  });

  it('should apply correct styling classes', () => {
    const user = {
      displayName: 'Test User',
      email: 'test@example.com',
    } as FirebaseUser;

    render(<UserAvatar user={user} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-full');
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-white');
  });
});
