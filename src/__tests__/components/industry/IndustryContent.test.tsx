import React from 'react';
import { render, screen } from '@testing-library/react';
import { IndustryContent } from '../../../components/industry/IndustryContent';
import { INDUSTRIES } from '../../../constants/industries';

describe('IndustryContent', () => {
  const aviationIndustry = INDUSTRIES.find(industry => industry.id === 'aviation')!;

  it('renders industry overview', () => {
    render(<IndustryContent industry={aviationIndustry} />);

    expect(screen.getByText('Aviation Solutions')).toBeInTheDocument();
    expect(screen.getByText(aviationIndustry.description)).toBeInTheDocument();
  });

  it('renders specialized services section', () => {
    render(<IndustryContent industry={aviationIndustry} />);

    expect(screen.getByText('Specialized Services for Aviation')).toBeInTheDocument();
    
    // Check that services are rendered
    aviationIndustry.specificServices.forEach(service => {
      expect(screen.getByText(service.title)).toBeInTheDocument();
    });
  });

  it('renders case studies section', () => {
    render(<IndustryContent industry={aviationIndustry} />);

    expect(screen.getByText('Success Stories')).toBeInTheDocument();
    
    // Check that case studies are rendered
    aviationIndustry.caseStudies.forEach(caseStudy => {
      expect(screen.getByText(caseStudy.title)).toBeInTheDocument();
    });
  });

  it('renders compliance requirements', () => {
    render(<IndustryContent industry={aviationIndustry} />);

    expect(screen.getByText('Compliance & Standards')).toBeInTheDocument();
    
    // Check that compliance requirements are rendered
    aviationIndustry.complianceRequirements.forEach(requirement => {
      expect(screen.getByText(requirement)).toBeInTheDocument();
    });
  });
});