import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IndustryVariantsSection } from '../../../components/sections/IndustryVariantsSection';
import { INDUSTRIES } from '../../../constants/industries';

describe('IndustryVariantsSection', () => {
  it('renders section header', () => {
    render(<IndustryVariantsSection industries={INDUSTRIES} />);

    expect(screen.getByText('Industry-Specific Solutions')).toBeInTheDocument();
    expect(screen.getByText(/discover how our ai solutions are tailored/i)).toBeInTheDocument();
  });

  it('renders industry selector', () => {
    render(<IndustryVariantsSection industries={INDUSTRIES} />);

    expect(screen.getByText('Select Your Industry')).toBeInTheDocument();
    
    // Check that all industry buttons are present
    INDUSTRIES.forEach(industry => {
      expect(screen.getByRole('tab', { name: new RegExp(industry.name, 'i') })).toBeInTheDocument();
    });
  });

  it('renders default industry content', () => {
    render(<IndustryVariantsSection industries={INDUSTRIES} />);

    // Should render the first industry by default
    const firstIndustry = INDUSTRIES[0];
    expect(screen.getByText(`${firstIndustry.name} Solutions`)).toBeInTheDocument();
  });

  it('switches industry content when selector is clicked', () => {
    render(<IndustryVariantsSection industries={INDUSTRIES} />);

    // Click on healthcare industry
    const healthcareButton = screen.getByRole('tab', { name: /healthcare/i });
    fireEvent.click(healthcareButton);

    // Should now show healthcare content
    expect(screen.getByText('Healthcare Solutions')).toBeInTheDocument();
  });

  it('handles custom default industry', () => {
    render(<IndustryVariantsSection industries={INDUSTRIES} defaultIndustry="healthcare" />);

    // Should render healthcare content by default
    expect(screen.getByText('Healthcare Solutions')).toBeInTheDocument();
  });

  it('handles empty industries gracefully', () => {
    render(<IndustryVariantsSection industries={[]} />);

    expect(screen.getByText('No industry data available')).toBeInTheDocument();
  });
});