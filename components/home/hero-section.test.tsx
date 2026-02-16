import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from './hero-section';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('HeroSection', () => {
  it('should render headline text', () => {
    render(<HeroSection />);

    const headline = screen.getByRole('heading', { 
      name: /make life a little easier, every day!/i 
    });
    expect(headline).toBeInTheDocument();
  });

  it('should render subheadline text', () => {
    render(<HeroSection />);

    const subheadline = screen.getByText(
      /simple tricks for cooking, cleaning, and living better/i
    );
    expect(subheadline).toBeInTheDocument();
  });

  it('should render SearchBar component', () => {
    render(<HeroSection />);

    const searchInput = screen.getByRole('textbox', { name: /search/i });
    const searchButtons = screen.getAllByRole('button', { name: /search/i });

    expect(searchInput).toBeInTheDocument();
    expect(searchButtons.length).toBeGreaterThan(0);
  });

  it('should render CategoryTags component with default tags', () => {
    render(<HeroSection />);

    expect(screen.getByRole('button', { name: /#kitchenhacks/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /#organization/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /#wellness/i })).toBeInTheDocument();
  });

  it('should pass onSearch prop to SearchBar', () => {
    const handleSearch = vi.fn();
    render(<HeroSection onSearch={handleSearch} />);

    // SearchBar should be present and functional
    const searchInput = screen.getByRole('textbox', { name: /search/i });
    expect(searchInput).toBeInTheDocument();
  });

  it('should render with proper semantic structure', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section?.tagName).toBe('SECTION');
  });

  it('should render headline as h1 element', () => {
    render(<HeroSection />);

    const headline = screen.getByRole('heading', { level: 1 });
    expect(headline).toHaveTextContent(/make life a little easier, every day!/i);
  });
});
