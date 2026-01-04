import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { Service } from '@/types/services';
import { Workflow } from 'lucide-react';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => {
      // Filter out framer-motion specific props
      const { initial, whileInView, whileHover, viewport, transition, ...domProps } = props;
      return <div className={className} {...domProps}>{children}</div>;
    },
  },
}));

const mockService: Service = {
  id: 'test-service',
  icon: <Workflow className="h-8 w-8" data-testid="service-icon" />,
  title: 'Test Service',
  description: 'This is a test service description',
  bullets: ['Feature 1', 'Feature 2', 'Feature 3'],
};

describe('ServiceCard', () => {
  it('renders service information correctly', () => {
    render(<ServiceCard service={mockService} />);

    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.getByText('This is a test service description')).toBeInTheDocument();
    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
    expect(screen.getByText('Feature 3')).toBeInTheDocument();
    expect(screen.getByTestId('service-icon')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <ServiceCard service={mockService} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders with proper accessibility attributes', () => {
    render(<ServiceCard service={mockService} />);

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Test Service');
  });
});