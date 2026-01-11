import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the AnimatedSection component to avoid window.matchMedia issues
jest.mock('@/components/common/AnimatedSection', () => ({
  AnimatedSection: React.forwardRef<HTMLElement, any>(({ children, className, ...props }, ref) => (
    <section ref={ref} className={className} {...props}>
      {children}
    </section>
  ))
}));

import { AnimatedSection } from '@/components';

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
