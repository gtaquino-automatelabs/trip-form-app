import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation, QuickNavigation } from '@/components/form/navigation';

describe('Navigation', () => {
  it('renders navigation buttons correctly', () => {
    render(
      <Navigation
        currentStep={1}
        totalSteps={8}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    );

    // Check for either mobile or desktop text
    expect(screen.getAllByText(/Anterior|Voltar/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Próximo|Avançar/i).length).toBeGreaterThan(0);
  });

  it('disables Previous button on first step', () => {
    render(
      <Navigation
        currentStep={1}
        totalSteps={8}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    );

    const prevButtons = screen.getAllByText(/Anterior|Voltar/i);
    const prevButton = prevButtons[0].closest('button');
    expect(prevButton).toBeDisabled();
  });

  it('shows Submit button on last step', () => {
    render(
      <Navigation
        currentStep={8}
        totalSteps={8}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText(/Enviar/i)).toBeInTheDocument();
  });

  it('calls onPrevious when Previous button is clicked', () => {
    const onPrevious = vi.fn();
    render(
      <Navigation
        currentStep={2}
        totalSteps={8}
        onPrevious={onPrevious}
        onNext={vi.fn()}
      />
    );

    const prevButtons = screen.getAllByText(/Anterior|Voltar/i);
    fireEvent.click(prevButtons[0]);
    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when Next button is clicked', () => {
    const onNext = vi.fn();
    render(
      <Navigation
        currentStep={1}
        totalSteps={8}
        onPrevious={vi.fn()}
        onNext={onNext}
      />
    );

    const nextButtons = screen.getAllByText(/Próximo|Avançar/i);
    fireEvent.click(nextButtons[0]);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit when Submit button is clicked on last step', () => {
    const onSubmit = vi.fn();
    render(
      <Navigation
        currentStep={8}
        totalSteps={8}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const submitButton = screen.getByText(/Enviar/i);
    fireEvent.click(submitButton);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <Navigation
        currentStep={1}
        totalSteps={8}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        isLoading={true}
      />
    );

    expect(screen.getByText(/Processando|\.\.\./i)).toBeInTheDocument();
  });

  it('disables buttons when specified', () => {
    render(
      <Navigation
        currentStep={5}
        totalSteps={8}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        isPreviousDisabled={true}
        isNextDisabled={true}
      />
    );

    const prevButtons = screen.getAllByText(/Anterior|Voltar/i);
    const nextButtons = screen.getAllByText(/Próximo|Avançar/i);
    
    const prevButton = prevButtons[0].closest('button');
    const nextButton = nextButtons[0].closest('button');
    
    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });
});

describe('QuickNavigation', () => {
  it('renders all step buttons', () => {
    render(
      <QuickNavigation
        currentStep={1}
        totalSteps={8}
        visitedPages={[1]}
        onNavigate={vi.fn()}
      />
    );

    for (let i = 1; i <= 8; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });

  it('allows navigation to visited pages only', () => {
    const onNavigate = vi.fn();
    render(
      <QuickNavigation
        currentStep={3}
        totalSteps={8}
        visitedPages={[1, 2, 3]}
        onNavigate={onNavigate}
      />
    );

    // Click on visited page (page 1)
    const page1Button = screen.getByText('1');
    fireEvent.click(page1Button);
    expect(onNavigate).toHaveBeenCalledWith(1);

    // Try to click on unvisited page (page 4)
    const page4Button = screen.getByText('4');
    fireEvent.click(page4Button);
    expect(onNavigate).toHaveBeenCalledTimes(1); // Should not be called again
  });

  it('highlights current page', () => {
    render(
      <QuickNavigation
        currentStep={3}
        totalSteps={8}
        visitedPages={[1, 2, 3]}
        onNavigate={vi.fn()}
      />
    );

    const currentButton = screen.getByText('3');
    expect(currentButton).toHaveClass('bg-blue-600');
    expect(currentButton).toHaveClass('cursor-default');
  });

  it('disables unvisited pages', () => {
    render(
      <QuickNavigation
        currentStep={3}
        totalSteps={8}
        visitedPages={[1, 2, 3]}
        onNavigate={vi.fn()}
      />
    );

    const unvisitedButton = screen.getByText('5');
    expect(unvisitedButton).toHaveClass('cursor-not-allowed');
    expect(unvisitedButton).toBeDisabled();
  });
});