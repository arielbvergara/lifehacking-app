import { render, screen } from '@testing-library/react';
import { TipDescription } from './tip-description';

describe('TipDescription', () => {
  it('Should_RenderDescriptionText_When_ProvidedWithDescription', () => {
    const description = 'This is a helpful life hack tip description.';
    
    render(<TipDescription description={description} />);
    
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it('Should_PreserveLineBreaks_When_DescriptionContainsNewlines', () => {
    const description = 'First line\nSecond line\nThird line';
    
    render(<TipDescription description={description} />);
    
    const element = screen.getByText(/First line/);
    expect(element).toHaveClass('whitespace-pre-wrap');
  });

  it('Should_ApplyCorrectStyling_When_Rendered', () => {
    const description = 'Test description';
    
    render(<TipDescription description={description} />);
    
    const element = screen.getByText(description);
    expect(element).toHaveClass('text-xl');
    expect(element).toHaveClass('leading-relaxed');
    expect(element).toHaveClass('text-gray-600');
    expect(element).toHaveClass('max-w-prose');
  });

  it('Should_HandleLongText_When_DescriptionIsVeryLong', () => {
    const longDescription = 'Lorem ipsum dolor sit amet, '.repeat(50);
    
    render(<TipDescription description={longDescription} />);
    
    const element = screen.getByText(/Lorem ipsum dolor sit amet/);
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('max-w-prose');
  });

  it('Should_HandleEmptyDescription_When_DescriptionIsEmpty', () => {
    const description = '';
    
    const { container } = render(<TipDescription description={description} />);
    
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });
});
