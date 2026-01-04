import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation } from '../../../components/layout/Navigation';

describe('Navigation', () => {
  const mockOnItemClick = jest.fn();

  beforeEach(() => {
    mockOnItemClick.mockClear();
  });

  it('renders all navigation items', () => {
    render(<Navigation currentPath="/" />);
    
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /services/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /governance/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('highlights active page correctly', () => {
    render(<Navigation currentPath="/services" />);
    
    const servicesLink = screen.getByRole('link', { name: /services/i });
    expect(servicesLink).toHaveAttribute('aria-current', 'page');
    expect(servicesLink).toHaveClass('text-primary', 'bg-accent');
  });

  it('handles root path correctly', () => {
    render(<Navigation currentPath="/" />);
    
    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  it('calls onItemClick when navigation item is clicked', () => {
    render(<Navigation currentPath="/" onItemClick={mockOnItemClick} />);
    
    const servicesLink = screen.getByRole('link', { name: /services/i });
    const servicesSpan = servicesLink.querySelector('span');
    
    if (servicesSpan) {
      fireEvent.click(servicesSpan);
      expect(mockOnItemClick).toHaveBeenCalledTimes(1);
    } else {
      // Fallback: click the link itself
      fireEvent.click(servicesLink);
      expect(mockOnItemClick).toHaveBeenCalledTimes(1);
    }
  });

  it('applies mobile styles when isMobile is true', () => {
    render(<Navigation currentPath="/services" isMobile={true} />);
    
    const servicesLink = screen.getByRole('link', { name: /services/i });
    expect(servicesLink).toHaveClass('block', 'w-full', 'text-left');
    expect(servicesLink).toHaveClass('border-l-4', 'border-primary');
  });

  it('handles null currentPath gracefully', () => {
    render(<Navigation currentPath={null} />);
    
    // Should render without errors
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    
    // No items should be marked as active
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).not.toHaveAttribute('aria-current', 'page');
    });
  });
});