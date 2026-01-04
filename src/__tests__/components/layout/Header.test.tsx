import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../../../components/layout/Header';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Header', () => {
  it('renders logo and navigation', () => {
    render(<Header />);
    
    // Check logo is present
    expect(screen.getByText('NCV')).toBeInTheDocument();
    expect(screen.getByText('NovaCoreVectra')).toBeInTheDocument();
    
    // Check navigation items are present (desktop)
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /services/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /governance/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('toggles mobile menu when button is clicked', () => {
    render(<Header />);
    
    const mobileMenuButton = screen.getByRole('button', { name: /open menu/i });
    expect(mobileMenuButton).toBeInTheDocument();
    
    // Mobile menu should not be visible initially
    expect(screen.queryByText('flex flex-col space-y-1')).not.toBeInTheDocument();
    
    // Click to open mobile menu
    fireEvent.click(mobileMenuButton);
    
    // Check if close button appears (menu is open)
    expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Header className="custom-header" />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('custom-header');
  });
});