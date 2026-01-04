import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IndustrySelector } from '../../../components/industry/IndustrySelector';
import { INDUSTRIES } from '../../../constants/industries';

describe('IndustrySelector', () => {
  const mockOnIndustrySelect = jest.fn();

  beforeEach(() => {
    mockOnIndustrySelect.mockClear();
  });

  it('renders all industry options', () => {
    render(
      <IndustrySelector
        industries={INDUSTRIES}
        onIndustrySelect={mockOnIndustrySelect}
      />
    );

    // Check that all industries are rendered
    expect(screen.getByRole('tab', { name: /aviation/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /healthcare/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /financial services/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /public sector/i })).toBeInTheDocument();
  });

  it('highlights selected industry', () => {
    render(
      <IndustrySelector
        industries={INDUSTRIES}
        selectedIndustry="healthcare"
        onIndustrySelect={mockOnIndustrySelect}
      />
    );

    const healthcareButton = screen.getByRole('tab', { name: /healthcare/i });
    expect(healthcareButton).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onIndustrySelect when industry is clicked', () => {
    render(
      <IndustrySelector
        industries={INDUSTRIES}
        onIndustrySelect={mockOnIndustrySelect}
      />
    );

    const aviationButton = screen.getByRole('tab', { name: /aviation/i });
    fireEvent.click(aviationButton);

    expect(mockOnIndustrySelect).toHaveBeenCalledWith('aviation');
  });
});