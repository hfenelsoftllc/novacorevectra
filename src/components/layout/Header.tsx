'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Logo } from '../ui/logo';
import { Navigation } from './Navigation';
import { cn } from '../../utils';

export interface HeaderProps {
  className?: string;
}

/**
 * Header component with logo placeholder and navigation
 * Includes responsive design and mobile navigation
 */
export const Header: React.FC<HeaderProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      className
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="hover:opacity-80 transition-opacity"
              onClick={closeMobileMenu}
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
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Navigation 
                currentPath={pathname}
                className="flex flex-col space-y-1"
                onItemClick={closeMobileMenu}
                isMobile={true}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};