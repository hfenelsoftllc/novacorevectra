import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Header } from '../../../components/layout/Header';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Header', () => {
  it('renders logo and navigation', () => {
    render(<Header />);
    
    // Check logo is present (use getAllByText since there are multiple NCV elements for responsive design)
    expect(screen.getAllByText('NCV')).toHaveLength(3); // Mobile compact, desktop compact, desktop full
    expect(screen.getByText('NovaCoreVectra')).toBeInTheDocument();
    
    // Check navigation items are present (desktop navigation only)
    const desktopNav = screen.getByRole('navigation', { name: /main navigation/i });
    const desktopNavContainer = desktopNav.closest('.hidden.md\\:block');
    
    if (desktopNavContainer) {
      const homeLink = within(desktopNavContainer as HTMLElement).getByRole('link', { name: /home/i }) as HTMLElement;
      const servicesLink = within(desktopNavContainer as HTMLElement).getByRole('link', { name: /services/i }) as HTMLElement;
      const governanceLink = within(desktopNavContainer as HTMLElement).getByRole('link', { name: /governance/i }) as HTMLElement;
      const aboutLink = within(desktopNavContainer as HTMLElement).getByRole('link', { name: /about/i }) as HTMLElement;
      const contactLink = within(desktopNavContainer as HTMLElement).getByRole('link', { name: /contact/i }) as HTMLElement;
      
      expect(homeLink).toBeInTheDocument();
      expect(servicesLink).toBeInTheDocument();
      expect(governanceLink).toBeInTheDocument();
      expect(aboutLink).toBeInTheDocument();
      expect(contactLink).toBeInTheDocument();
    }
  });

  it('toggles mobile menu when button is clicked', () => {
    render(<Header />);
    
    const mobileMenuButton = screen.getByRole('button', { name: /open navigation menu/i });
    expect(mobileMenuButton).toBeInTheDocument();
    
    // Mobile menu should not be visible initially
    expect(screen.queryByRole('dialog', { name: /navigation menu/i })).not.toBeInTheDocument();
    
    // Click to open mobile menu
    fireEvent.click(mobileMenuButton);
    
    // Check if mobile menu dialog appears
    expect(screen.getByRole('dialog', { name: /navigation menu/i })).toBeInTheDocument();
    
    // Check if close button appears (menu is open) - use getAllByRole and check for at least one
    const closeButtons = screen.getAllByRole('button', { name: /close navigation menu/i });
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    const { container } = render(<Header className="custom-header" />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('custom-header');
  });
});