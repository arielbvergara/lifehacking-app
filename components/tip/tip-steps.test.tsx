import { render, screen } from '@testing-library/react';
import { TipSteps } from './tip-steps';
import type { TipStep } from '@/lib/types/api';

describe('TipSteps', () => {
  const mockSteps: TipStep[] = [
    { stepNumber: 1, description: 'First step description' },
    { stepNumber: 2, description: 'Second step description' },
    { stepNumber: 3, description: 'Third step description' },
  ];

  it('Should_RenderAllSteps_When_ProvidedWithSteps', () => {
    render(<TipSteps steps={mockSteps} />);
    
    expect(screen.getByText('First step description')).toBeInTheDocument();
    expect(screen.getByText('Second step description')).toBeInTheDocument();
    expect(screen.getByText('Third step description')).toBeInTheDocument();
  });

  it('Should_DisplayStepNumbers_When_Rendered', () => {
    render(<TipSteps steps={mockSteps} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('Should_RenderSectionHeading_When_StepsExist', () => {
    render(<TipSteps steps={mockSteps} />);
    
    expect(screen.getByText('Easy Steps')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Easy Steps' })).toBeInTheDocument();
  });

  it('Should_RenderIcon_When_StepsExist', () => {
    render(<TipSteps steps={mockSteps} />);
    
    const icon = screen.getByText('list_alt');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('material-icons');
  });

  it('Should_ApplyCardStyling_When_Rendered', () => {
    const { container } = render(<TipSteps steps={mockSteps} />);
    
    const cards = container.querySelectorAll('.rounded-2xl');
    expect(cards.length).toBe(mockSteps.length);
  });

  it('Should_ApplyHoverEffect_When_Rendered', () => {
    const { container } = render(<TipSteps steps={mockSteps} />);
    
    const cards = container.querySelectorAll('.hover\\:border-primary\\/50');
    expect(cards.length).toBe(mockSteps.length);
  });

  it('Should_ReturnNull_When_StepsArrayIsEmpty', () => {
    const { container } = render(<TipSteps steps={[]} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('Should_ReturnNull_When_StepsIsUndefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { container } = render(<TipSteps steps={undefined as any} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('Should_RenderSingleStep_When_OnlyOneStepProvided', () => {
    const singleStep: TipStep[] = [
      { stepNumber: 1, description: 'Only one step' },
    ];
    
    render(<TipSteps steps={singleStep} />);
    
    expect(screen.getByText('Only one step')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('Should_HandleLongDescriptions_When_StepDescriptionIsLong', () => {
    const longSteps: TipStep[] = [
      {
        stepNumber: 1,
        description: 'This is a very long step description that contains a lot of text to test how the component handles lengthy content. '.repeat(3),
      },
    ];
    
    render(<TipSteps steps={longSteps} />);
    
    const description = screen.getByText(/This is a very long step description/);
    expect(description).toBeInTheDocument();
  });
});
