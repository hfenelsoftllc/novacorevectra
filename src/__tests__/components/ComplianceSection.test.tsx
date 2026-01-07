import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ComplianceSection } from '@/components';
import { ComplianceFramework } from '@/types/compliance';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    section: ({
      children,
      className,
      ...props
    }: React.ComponentProps<'section'> & Record<string, unknown>) => {
      // Filter out framer-motion specific props
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        initial,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        whileInView,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        viewport,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        transition,
        ...domProps
      } = props;
      return (
        <section className={className} {...domProps}>
          {children}
        </section>
      );
    },
  },
}));

// Mock the usePerformance hook
jest.mock('@/hooks', () => ({
  usePerformance: () => ({
    calculateAnimationDelay: (index: number) => index * 0.1,
    prefersReducedMotion: false,
  }),
}));

const mockFramework: ComplianceFramework = {
  id: 'test-framework',
  name: 'Test Framework 2023',
  version: '2023',
  certificationLevel: 'Certified',
  clauses: [
    {
      id: 'clause-1',
      clauseNumber: '1',
      title: 'Test Clause',
      description: 'This is a test clause description',
      requirements: [
        'Test requirement 1',
        'Test requirement 2',
      ],
      mappedServices: ['business-process-strategy'],
      documentationUrl: '/docs/test-clause.pdf',
    },
    {
      id: 'clause-2',
      clauseNumber: '2',
      title: 'Another Test Clause',
      description: 'This is another test clause description',
      requirements: [
        'Another test requirement 1',
        'Another test requirement 2',
      ],
      mappedServices: ['ai-solution-implementation'],
    },
  ],
};

describe('ComplianceSection', () => {
  it('renders compliance section with framework information', () => {
    render(<ComplianceSection framework={mockFramework} />);

    expect(screen.getByText('Trust & Compliance')).toBeInTheDocument();
    expect(screen.getByText('Test Framework 2023 (2023)')).toBeInTheDocument();
    expect(screen.getByText('Certified')).toBeInTheDocument();
  });

  it('renders all compliance clauses', () => {
    render(<ComplianceSection framework={mockFramework} />);

    expect(screen.getByText('Test Clause')).toBeInTheDocument();
    expect(screen.getByText('Another Test Clause')).toBeInTheDocument();
    expect(screen.getByText('This is a test clause description')).toBeInTheDocument();
    expect(screen.getByText('This is another test clause description')).toBeInTheDocument();
  });

  it('expands and collapses clause details when clicked', () => {
    render(<ComplianceSection framework={mockFramework} />);

    // Initially, detailed requirements should not be visible
    expect(screen.queryByText('Test requirement 1')).not.toBeInTheDocument();

    // Find and click the expand button for the first clause
    const expandButtons = screen.getAllByRole('button', { name: /expand details/i });
    const firstButton = expandButtons[0];
    expect(firstButton).toBeInTheDocument();
    fireEvent.click(firstButton);

    // Now the requirements should be visible
    expect(screen.getByText('Test requirement 1')).toBeInTheDocument();
    expect(screen.getByText('Test requirement 2')).toBeInTheDocument();

    // Click again to collapse
    const collapseButton = screen.getByRole('button', { name: /collapse details/i });
    fireEvent.click(collapseButton);

    // Requirements should be hidden again
    expect(screen.queryByText('Test requirement 1')).not.toBeInTheDocument();
  });

  it('shows download links when enabled', () => {
    render(<ComplianceSection framework={mockFramework} showDownloadLinks={true} />);

    // Expand the first clause to see download link
    const expandButtons = screen.getAllByRole('button', { name: /expand details/i });
    const firstButton = expandButtons[0];
    expect(firstButton).toBeInTheDocument();
    fireEvent.click(firstButton);

    expect(screen.getByText('Download Documentation')).toBeInTheDocument();
  });

  it('hides download links when disabled', () => {
    render(<ComplianceSection framework={mockFramework} showDownloadLinks={false} />);

    // Expand the first clause
    const expandButtons = screen.getAllByRole('button', { name: /expand details/i });
    const firstButton = expandButtons[0];
    expect(firstButton).toBeInTheDocument();
    fireEvent.click(firstButton);

    expect(screen.queryByText('Download Documentation')).not.toBeInTheDocument();
  });

  it('renders with proper accessibility attributes', () => {
    render(<ComplianceSection framework={mockFramework} />);

    const region = screen.getByRole('region', { name: /Trust & Compliance/i });
    expect(region).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /trust & compliance/i })).toBeInTheDocument();
  });

  it('displays mapped services for each clause', () => {
    render(<ComplianceSection framework={mockFramework} />);

    // Expand the first clause to see mapped services
    const expandButtons = screen.getAllByRole('button', { name: /expand details/i });
    const firstButton = expandButtons[0];
    expect(firstButton).toBeInTheDocument();
    fireEvent.click(firstButton);

    expect(screen.getByText('Mapped Services')).toBeInTheDocument();
    expect(screen.getByText('Business Process Strategy')).toBeInTheDocument();
  });
});