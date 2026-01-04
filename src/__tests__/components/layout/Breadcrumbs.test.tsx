import React from 'react';
import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from '../../../components/layout/Breadcrumbs';
import { BreadcrumbItem } from '../../../types/navigation';

describe('Breadcrumbs', () => {
  const sampleItems: BreadcrumbItem[] = [
    { label: 'Services', href: '/services' },
    { label: 'AI Consulting', href: '/services/ai-consulting' },
    { label: 'Strategy Planning' }
  ];

  it('renders home icon when showHome is true', () => {
    render(<Breadcrumbs items={sampleItems} showHome={true} />);
    
    const homeIcon = screen.getByLabelText('Home');
    expect(homeIcon).toBeInTheDocument();
  });

  it('does not render home when showHome is false', () => {
    render(<Breadcrumbs items={sampleItems} showHome={false} />);
    
    expect(screen.queryByLabelText('Home')).not.toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
  });

  it('marks last item as current page', () => {
    render(<Breadcrumbs items={sampleItems} />);
    
    const lastItem = screen.getByText('Strategy Planning');
    expect(lastItem).toHaveAttribute('aria-current', 'page');
  });

  it('renders links for non-last items with href', () => {
    render(<Breadcrumbs items={sampleItems} />);
    
    const servicesLink = screen.getByRole('link', { name: 'Services' });
    expect(servicesLink).toHaveAttribute('href', '/services');
    
    const aiConsultingLink = screen.getByRole('link', { name: 'AI Consulting' });
    expect(aiConsultingLink).toHaveAttribute('href', '/services/ai-consulting');
  });

  it('renders chevron separators', () => {
    render(<Breadcrumbs items={sampleItems} />);
    
    // Check for chevron SVG elements with aria-hidden="true"
    const { container } = render(<Breadcrumbs items={sampleItems} />);
    const chevrons = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(chevrons.length).toBeGreaterThan(0);
  });

  it('returns null when no items and showHome is false', () => {
    const { container } = render(<Breadcrumbs items={[]} showHome={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('applies custom className', () => {
    const { container } = render(<Breadcrumbs items={sampleItems} className="custom-breadcrumbs" />);
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('custom-breadcrumbs');
  });

  it('handles items without href correctly', () => {
    const itemsWithoutHref: BreadcrumbItem[] = [
      { label: 'Services' }, // No href
      { label: 'Current Page' }
    ];
    
    render(<Breadcrumbs items={itemsWithoutHref} />);
    
    // Should render as link with # href when no href provided
    const servicesLink = screen.getByRole('link', { name: 'Services' });
    expect(servicesLink).toHaveAttribute('href', '#');
    expect(servicesLink).toHaveClass('pointer-events-none');
  });
});