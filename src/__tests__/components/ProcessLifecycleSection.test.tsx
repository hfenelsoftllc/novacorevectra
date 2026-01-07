import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProcessLifecycleSection } from '@/components/sections';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    section: ({ children, className, ...props }: React.ComponentProps<'section'> & Record<string, unknown>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { initial, whileInView, viewport, transition, variants, ...domProps } = props;
      return <section className={className} {...domProps}>{children}</section>;
    },
    header: ({ children, className, ...props }: React.ComponentProps<'header'> & Record<string, unknown>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { initial, whileInView, viewport, transition, variants, ...domProps } = props;
      return <header className={className} {...domProps}>{children}</header>;
    },
    div: ({ children, className, ...props }: React.ComponentProps<'div'> & Record<string, unknown>) => {
      const { 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        initial, whileInView, viewport, transition, variants, whileHover, 
        onHoverStart, onHoverEnd, 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        animate, ...domProps 
      } = props;
      return (
        <div 
          className={className} 
          onMouseEnter={onHoverStart as React.MouseEventHandler<HTMLDivElement>}
          onMouseLeave={onHoverEnd as React.MouseEventHandler<HTMLDivElement>}
          {...domProps}
        >
          {children}
        </div>
      );
    },
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  Palette: () => <div data-testid="palette-icon">Palette</div>,
  Rocket: () => <div data-testid="rocket-icon">Rocket</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
}));

describe('ProcessLifecycleSection', () => {
  it('renders the section with correct heading', () => {
    render(<ProcessLifecycleSection />);
    
    expect(screen.getByRole('heading', { name: /our process lifecycle/i })).toBeInTheDocument();
    expect(screen.getByText(/from discovery to deployment/i)).toBeInTheDocument();
  });

  it('renders all four process steps by default', () => {
    render(<ProcessLifecycleSection />);
    
    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('Deploy')).toBeInTheDocument();
    expect(screen.getByText('Operate')).toBeInTheDocument();
  });

  it('displays step descriptions', () => {
    render(<ProcessLifecycleSection />);
    
    expect(screen.getByText(/understand your business needs/i)).toBeInTheDocument();
    expect(screen.getByText(/create tailored ai solutions/i)).toBeInTheDocument();
    expect(screen.getByText(/implement and integrate/i)).toBeInTheDocument();
    expect(screen.getByText(/monitor, optimize, and maintain/i)).toBeInTheDocument();
  });

  it('shows step numbers correctly', () => {
    render(<ProcessLifecycleSection />);
    
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
    expect(screen.getByText('Step 4')).toBeInTheDocument();
  });

  it('displays duration information when available', () => {
    render(<ProcessLifecycleSection />);
    
    expect(screen.getByText('2-4 weeks')).toBeInTheDocument();
    expect(screen.getByText('3-6 weeks')).toBeInTheDocument();
    expect(screen.getByText('4-12 weeks')).toBeInTheDocument();
    expect(screen.getByText('Ongoing')).toBeInTheDocument();
  });

  it('renders appropriate icons for each step', () => {
    render(<ProcessLifecycleSection />);
    
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByTestId('palette-icon')).toBeInTheDocument();
    expect(screen.getByTestId('rocket-icon')).toBeInTheDocument();
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
  });

  it('accepts custom processes prop', () => {
    const customProcesses = [
      {
        id: 'custom',
        title: 'Custom Step',
        description: 'Custom description',
        icon: null,
        details: ['Custom detail'],
        duration: '1 week'
      }
    ];

    render(<ProcessLifecycleSection processes={customProcesses} />);
    
    expect(screen.getByText('Custom Step')).toBeInTheDocument();
    expect(screen.getByText('Custom description')).toBeInTheDocument();
    expect(screen.getByText('1 week')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <ProcessLifecycleSection className="custom-process-section" />
    );
    
    expect(container.firstChild).toHaveClass('custom-process-section');
  });

  it('has proper accessibility attributes', () => {
    render(<ProcessLifecycleSection />);
    
    const section = screen.getByRole('region', { name: /our process lifecycle/i });
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('aria-labelledby', 'process-lifecycle-heading');
  });

  it('shows mobile connection indicators', () => {
    render(<ProcessLifecycleSection />);
    
    // Check for mobile connection dots (should be 4 dots for 4 steps)
    const dots = screen.getByText('Discover').closest('section')?.querySelectorAll('.w-2.h-2.bg-primary.rounded-full');
    expect(dots).toHaveLength(4);
  });
});