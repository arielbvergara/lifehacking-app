import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomeFooter } from './home-footer';

describe('HomeFooter', () => {
  describe('Section Rendering', () => {
    it('should render Discover section with heading', () => {
      render(<HomeFooter />);

      expect(screen.getByRole('heading', { name: /discover/i })).toBeInTheDocument();
    });

    it('should render Company section with heading', () => {
      render(<HomeFooter />);

      expect(screen.getByRole('heading', { name: /company/i })).toBeInTheDocument();
    });

    it('should render Legal section with heading', () => {
      render(<HomeFooter />);

      expect(screen.getByRole('heading', { name: /legal/i })).toBeInTheDocument();
    });
  });

  describe('Discover Section Links', () => {
    it('should render Categories link', () => {
      render(<HomeFooter />);

      const link = screen.getByRole('link', { name: /categories/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/categories');
    });

    it('should render Latest Tips link', () => {
      render(<HomeFooter />);

      const link = screen.getByRole('link', { name: /latest tips/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/tips/latest');
    });

    it('should render Popular link', () => {
      render(<HomeFooter />);

      const link = screen.getByRole('link', { name: /popular/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/tips/popular');
    });
  });

  describe('Company Section Links', () => {
    it('should render About link', () => {
      render(<HomeFooter />);

      const link = screen.getByRole('link', { name: /about/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/about');
    });

    it('should render Contact link', () => {
      render(<HomeFooter />);

      const link = screen.getByRole('link', { name: /contact/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/contact');
    });

    it('should render Blog link', () => {
      render(<HomeFooter />);

      const link = screen.getByRole('link', { name: /blog/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/blog');
    });
  });

  describe('Legal Section Links', () => {
    it('should render Privacy Policy link', () => {
      render(<HomeFooter />);

      const link = screen.getByRole('link', { name: /privacy policy/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/privacy');
    });

    it('should render Terms of Service link', () => {
      render(<HomeFooter />);

      const link = screen.getByRole('link', { name: /terms of service/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/terms');
    });
  });

  describe('Social Media Icons', () => {
    it('should render Twitter icon link', () => {
      render(<HomeFooter />);

      const link = screen.getByRole('link', { name: /twitter/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://twitter.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render Facebook icon link', () => {
      render(<HomeFooter />);

      const link = screen.getByRole('link', { name: /facebook/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://facebook.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render Instagram icon link', () => {
      render(<HomeFooter />);

      const link = screen.getByRole('link', { name: /instagram/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://instagram.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render all three social media icons', () => {
      render(<HomeFooter />);

      const socialLinks = [
        screen.getByRole('link', { name: /twitter/i }),
        screen.getByRole('link', { name: /facebook/i }),
        screen.getByRole('link', { name: /instagram/i }),
      ];

      expect(socialLinks).toHaveLength(3);
      socialLinks.forEach(link => {
        expect(link).toBeInTheDocument();
      });
    });
  });

  describe('Copyright Notice', () => {
    it('should render copyright notice with current year', () => {
      render(<HomeFooter />);

      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${currentYear} LifeHacking`))).toBeInTheDocument();
    });

    it('should include "All rights reserved" in copyright', () => {
      render(<HomeFooter />);

      expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive grid classes', () => {
      const { container } = render(<HomeFooter />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-3');
    });

    it('should have responsive flex classes for social and copyright', () => {
      const { container } = render(<HomeFooter />);

      const flexContainer = container.querySelector('.flex.flex-col.md\\:flex-row');
      expect(flexContainer).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have footer background styling', () => {
      const { container } = render(<HomeFooter />);

      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('bg-gray-50');
      expect(footer).toHaveClass('border-t');
      expect(footer).toHaveClass('border-gray-100');
    });

    it('should have hover states on links', () => {
      render(<HomeFooter />);

      const link = screen.getByRole('link', { name: /categories/i });
      expect(link).toHaveClass('hover:text-primary');
    });

    it('should have transition classes on links', () => {
      render(<HomeFooter />);

      const link = screen.getByRole('link', { name: /categories/i });
      expect(link).toHaveClass('transition-colors');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<HomeFooter />);

      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(3);
    });

    it('should have aria-labels on social media links', () => {
      render(<HomeFooter />);

      expect(screen.getByRole('link', { name: /twitter/i })).toHaveAttribute('aria-label', 'Twitter');
      expect(screen.getByRole('link', { name: /facebook/i })).toHaveAttribute('aria-label', 'Facebook');
      expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute('aria-label', 'Instagram');
    });

    it('should have aria-hidden on social media SVG icons', () => {
      const { container } = render(<HomeFooter />);

      const svgs = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgs).toHaveLength(3);
    });
  });

  describe('Structure', () => {
    it('should render as a footer element', () => {
      const { container } = render(<HomeFooter />);

      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should have max-width container', () => {
      const { container } = render(<HomeFooter />);

      const maxWidthContainer = container.querySelector('.max-w-7xl');
      expect(maxWidthContainer).toBeInTheDocument();
    });

    it('should have border separator between content and copyright', () => {
      const { container } = render(<HomeFooter />);

      const separator = container.querySelector('.border-t.border-gray-200');
      expect(separator).toBeInTheDocument();
    });
  });
});
