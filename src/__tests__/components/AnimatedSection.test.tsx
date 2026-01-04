import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnimatedSection } from '@/components';

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

describe('AnimatedSection', () => {
  it('renders children correctly', () => {
    render(
      <AnimatedSection>
        <div>Test content</div>
      </AnimatedSection>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <AnimatedSection className='custom-section'>
        <div>Test content</div>
      </AnimatedSection>
    );

    expect(container.firstChild).toHaveClass('custom-section');
  });

  it('renders as a section element', () => {
    render(
      <AnimatedSection>
        <div>Test content</div>
      </AnimatedSection>
    );

    const section = screen.getByText('Test content').closest('section');
    expect(section).toBeInTheDocument();
  });
});
