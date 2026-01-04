import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from '../../../components/layout/Footer';

describe('Footer', () => {
  it('renders company logo and name', () => {
    render(<Footer />);
    
    expect(screen.getByText('NCV')).toBeInTheDocument();
    expect(screen.getByText('NovaCoreVectra')).toBeInTheDocument();
  });

  it('renders company description', () => {
    render(<Footer />);
    
    expect(screen.getByText(/Leading AI consulting and governance solutions/)).toBeInTheDocument();
  });

  it('renders quick links section', () => {
    render(<Footer />);
    
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /services/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /governance/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('renders legal links section', () => {
    render(<Footer />);
    
    expect(screen.getByText('Legal')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /cookie policy/i })).toBeInTheDocument();
  });

  it('renders social links', () => {
    render(<Footer />);
    
    expect(screen.getByRole('link', { name: /follow us on linkedin/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /follow us on twitter/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view our github/i })).toBeInTheDocument();
  });

  it('renders copyright information with current year', () => {
    render(<Footer />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} NovaCoreVectra`))).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Footer className="custom-footer" />);
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('custom-footer');
  });
});