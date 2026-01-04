'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Logo } from '../ui/logo';
import { Navigation } from './Navigation';
import { cn } from '../../utils';
import { useFocusTrap } from '../../hooks';

export interface HeaderProps {
  className?: string;
}

/**
 * Header component with logo placeholder and navigation
 * Includes responsive design, mobile navigation, and enhanced accessibility
 */
export const Header: React.FC<HeaderProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Focus trap for mobile menu
  useFocusTrap(isMobileMenuOpen);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <header 
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
      role="banner"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              onClick={closeMobileMenu}
              aria-label="NovaCoreVectra - Go to homepage"
            >
              <Logo size="md" className="sm:hidden" variant="compact" />
              <Logo size="md" className="hidden sm:flex" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Navigation 
              currentPath={pathname}
              className="flex items-center space-x-1"
            />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-haspopup="true"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div 
            id="mobile-navigation"
            className="md:hidden border-t bg-background"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Navigation 
                currentPath={pathname}
                className="flex flex-col space-y-1"
                onItemClick={closeMobileMenu}
                isMobile={true}
              />
              
              {/* Close button for screen readers */}
              <Button
                variant="ghost"
                onClick={closeMobileMenu}
                className="w-full justify-start mt-4 text-muted-foreground"
                aria-label="Close navigation menu"
              >
                <X className="h-4 w-4 mr-2" aria-hidden="true" />
                Close Menu
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </header>
  );
};