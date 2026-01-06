import React from 'react';
import { render, screen } from '@testing-library/react';
import { IndustryContent } from '../../../components/industry/IndustryContent';
import { INDUSTRIES } from '../../../constants/industries';

describe('IndustryContent', () => {
  const airlinesIndustry = INDUSTRIES.find(industry => industry.id === 'airlines')!;

  it('renders industry overview', () => {
    render(<IndustryContent industry={airlinesIndustry} />);

    expect(screen.getByText('Airlines Solutions')).toBeInTheDocument();
    expect(screen.getByText(airlinesIndustry.description)).toBeInTheDocument();
  });

  it('renders specialized services section', () => {
    render(<IndustryContent industry={airlinesIndustry} />);

    expect(screen.getByText('Specialized Services for Airlines')).toBeInTheDocument();
    
    // Check that services are rendered
    airlinesIndustry.specificServices.forEach(service => {
      expect(screen.getByText(service.title)).toBeInTheDocument();
    });
  });

  it('renders case studies section', () => {
    render(<IndustryContent industry={airlinesIndustry} />);

    expect(screen.getByText('Success Stories')).toBeInTheDocument();
    
    // Check that case studies are rendered
    airlinesIndustry.caseStudies.forEach(caseStudy => {
      expect(screen.getByText(caseStudy.title)).toBeInTheDocument();
    });
  });

  it('renders compliance requirements', () => {
    render(<IndustryContent industry={airlinesIndustry} />);

    expect(screen.getByText('Compliance & Standards')).toBeInTheDocument();
    
    // Check that compliance requirements are rendered
    airlinesIndustry.complianceRequirements.forEach(requirement => {
      expect(screen.getByText(requirement)).toBeInTheDocument();
    });
  });
});