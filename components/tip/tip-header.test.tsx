import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TipHeader } from './tip-header';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('TipHeader', () => {
  const mockProps = {
    title: 'Peel Garlic in 10 Seconds',
    categoryName: 'Kitchen',
    createdAt: '2024-01-15T10:30:00Z',
  };

  it('renders the tip title correctly', () => {
    render(<TipHeader {...mockProps} />);
    
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Peel Garlic in 10 Seconds');
  });

  it('displays the category badge with correct styling', () => {
    render(<TipHeader {...mockProps} />);
    
    const badge = screen.getByText('Kitchen');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800', 'uppercase');
  });

  it('formats and displays the creation date', () => {
    render(<TipHeader {...mockProps} />);
    
    const dateElement = screen.getByText('January 15, 2024');
    expect(dateElement).toBeInTheDocument();
    expect(dateElement.tagName).toBe('TIME');
  });

  it('includes the ISO date in the datetime attribute', () => {
    render(<TipHeader {...mockProps} />);
    
    const timeElement = screen.getByText('January 15, 2024');
    expect(timeElement).toHaveAttribute('datetime', '2024-01-15T10:30:00Z');
  });

  it('displays the clock icon', () => {
    render(<TipHeader {...mockProps} />);
    
    const icon = screen.getByText('schedule');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('material-icons-round');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies responsive typography classes to the title', () => {
    render(<TipHeader {...mockProps} />);
    
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('text-4xl', 'md:text-5xl', 'font-bold');
  });

  it('renders with different category names', () => {
    render(<TipHeader {...mockProps} categoryName="Cleaning" />);
    
    const badge = screen.getByText('Cleaning');
    expect(badge).toBeInTheDocument();
  });

  it('renders with different dates', () => {
    render(<TipHeader {...mockProps} createdAt="2023-12-25T15:45:00Z" />);
    
    const dateElement = screen.getByText('December 25, 2023');
    expect(dateElement).toBeInTheDocument();
  });

  it('handles long titles correctly', () => {
    const longTitle = 'This is a very long tip title that should still render correctly without breaking the layout';
    render(<TipHeader {...mockProps} title={longTitle} />);
    
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveTextContent(longTitle);
  });

  it('has proper semantic HTML structure', () => {
    const { container } = render(<TipHeader {...mockProps} />);
    
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    
    const h1 = header?.querySelector('h1');
    expect(h1).toBeInTheDocument();
  });

  it('TipHeader_ShouldDisplayTags_WhenTagsProvided', () => {
    const tags = ['quick', 'easy', 'kitchen'];
    render(<TipHeader {...mockProps} tags={tags} />);
    
    expect(screen.getByText('#quick')).toBeInTheDocument();
    expect(screen.getByText('#easy')).toBeInTheDocument();
    expect(screen.getByText('#kitchen')).toBeInTheDocument();
  });

  it('TipHeader_ShouldNotDisplayTags_WhenTagsNotProvided', () => {
    const { container } = render(<TipHeader {...mockProps} />);
    
    const tags = container.querySelectorAll('[class*="bg-gray-100"]');
    expect(tags.length).toBe(0);
  });

  it('TipHeader_ShouldNotDisplayTags_WhenTagsArrayEmpty', () => {
    const { container } = render(<TipHeader {...mockProps} tags={[]} />);
    
    const tags = container.querySelectorAll('[class*="bg-gray-100"]');
    expect(tags.length).toBe(0);
  });

  it('TipHeader_ShouldFormatTags_WhenTagsHaveSpaces', () => {
    const tags = ['Quick Tip', 'Easy Method'];
    render(<TipHeader {...mockProps} tags={tags} />);
    
    expect(screen.getByText('#quicktip')).toBeInTheDocument();
    expect(screen.getByText('#easymethod')).toBeInTheDocument();
  });

  it('TipHeader_ShouldDisplayMultipleTags_WhenMultipleTagsProvided', () => {
    const tags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];
    render(<TipHeader {...mockProps} tags={tags} />);
    
    tags.forEach(tag => {
      expect(screen.getByText(`#${tag}`)).toBeInTheDocument();
    });
  });

  it('TipHeader_ShouldApplyCorrectStyling_WhenTagsDisplayed', () => {
    const tags = ['test'];
    render(<TipHeader {...mockProps} tags={tags} />);
    
    const tagElement = screen.getByText('#test');
    expect(tagElement).toHaveClass('bg-gray-100', 'text-gray-700', 'rounded-full');
  });

  it('TipHeader_ShouldNavigateToSearch_WhenTagClicked', async () => {
    const user = userEvent.setup();
    const tags = ['quick', 'easy'];
    render(<TipHeader {...mockProps} tags={tags} />);
    
    const quickTag = screen.getByRole('button', { name: '#quick' });
    await user.click(quickTag);
    
    expect(mockPush).toHaveBeenCalledWith('/search?q=quick');
  });

  it('TipHeader_ShouldEncodeTagsInURL_WhenTagHasSpaces', async () => {
    const user = userEvent.setup();
    const tags = ['Quick Tip'];
    render(<TipHeader {...mockProps} tags={tags} />);
    
    const tag = screen.getByRole('button', { name: '#quicktip' });
    await user.click(tag);
    
    expect(mockPush).toHaveBeenCalledWith('/search?q=Quick%20Tip');
  });

  it('TipHeader_ShouldRenderTagsAsButtons_WhenTagsProvided', () => {
    const tags = ['test'];
    render(<TipHeader {...mockProps} tags={tags} />);
    
    const tagButton = screen.getByRole('button', { name: '#test' });
    expect(tagButton).toBeInTheDocument();
    expect(tagButton.tagName).toBe('BUTTON');
  });
});
