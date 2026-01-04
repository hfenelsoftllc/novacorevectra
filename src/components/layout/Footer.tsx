import React from 'react';
import Link from 'next/link';
import { MAIN_NAVIGATION } from '../../constants/navigation';
import { Logo } from '../ui/logo';
import { cn } from '../../utils';

export interface FooterProps {
  className?: string;
}

/**
 * Footer component with logo placeholder and links
 * Includes responsive design and organized link sections
 */
export const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  const quickLinks = MAIN_NAVIGATION.filter(item => item.id !== 'home');
  
  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' }
  ];

  const socialLinks = [
    { label: 'LinkedIn', href: '#', ariaLabel: 'Follow us on LinkedIn' },
    { label: 'Twitter', href: '#', ariaLabel: 'Follow us on Twitter' },
    { label: 'GitHub', href: '#', ariaLabel: 'View our GitHub' }
  ];

  return (
    <footer className={cn(
      'bg-muted/50 border-t mt-auto',
      className
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info and logo */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Logo size="md" />
            </Link>
            <p className="text-muted-foreground text-sm max-w-md mb-4">
              Leading AI consulting and governance solutions for enterprise. 
              Empowering organizations to lead the AI era through ethical innovation 
              and world-class strategy.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={link.ariaLabel}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-muted-foreground text-sm">
              © {currentYear} NovaCoreVectra. All rights reserved.
            </p>
            <p className="text-muted-foreground text-sm">
              Built with Next.js and Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};