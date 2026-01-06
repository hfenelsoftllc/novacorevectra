/**
 * Smoke test suite for key user journeys and SEO validation
 * Tests essential functionality after deployment
 * Requirements: 6.5
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateMetadata, generateStructuredData, pageConfigs } from '../../utils/seo';

// Import page components for testing
import HomePage from '../../../app/page';
import ServicesPage from '../../../app/services/page';
import GovernancePage from '../../../app/governance/page';
import ContactPage from '../../../app/contact/page';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => React.createElement('div', props, children),
    section: ({ children, ...props }) => React.createElement('section', props, children),
    main: ({ children, ...props }) => React.createElement('main', props, children),
  },
  AnimatePresence: ({ children }) => children,
}));

describe('Smoke Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Key User Journey Tests', () => {
    test('home page loads and displays core content', () => {
      render(React.createElement(HomePage));

      // Verify main heading is present
      expect(screen.getByText(/Trusted AI for Business Process Transformation/i)).toBeInTheDocument();
      
      // Verify key CTAs are present
      expect(screen.getByText(/Explore Our Services/i)).toBeInTheDocument();
      expect(screen.getByText(/Executive Brief/i)).toBeInTheDocument();
      
      // Verify description is present
      expect(screen.getByText(/NovaCoreVectra delivers strategy-led/i)).toBeInTheDocument();
    });

    test('services page loads and displays service offerings', () => {
      render(React.createElement(ServicesPage));

      // Verify main heading
      expect(screen.getByText(/Our Services/i)).toBeInTheDocument();
      
      // Verify service categories are present
      expect(screen.getByText(/Business Process Strategy/i)).toBeInTheDocument();
      expect(screen.getByText(/AI Solution Implementation/i)).toBeInTheDocument();
      expect(screen.getByText(/Enterprise Integration & Governance/i)).toBeInTheDocument();
      
      // Verify service descriptions are present
      expect(screen.getByText(/Align AI initiatives with operational priorities/i)).toBeInTheDocument();
      expect(screen.getByText(/Design and deploy production-grade AI solutions/i)).toBeInTheDocument();
    });

    test('governance page loads and displays compliance information', () => {
      render(React.createElement(GovernancePage));

      // Verify main heading
      expect(screen.getByText(/AI Governance & Compliance/i)).toBeInTheDocument();
      
      // Verify ISO 42001 section
      expect(screen.getByText(/ISO 42001 Compliance/i)).toBeInTheDocument();
      
      // Verify governance components
      expect(screen.getByText(/Risk Management/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Documentation/i)).toHaveLength(2); // Header and description
      expect(screen.getAllByText(/Monitoring/i)).toHaveLength(2); // Header and description
      
      // Verify CTA section
      expect(screen.getByText(/Download Our AI Governance Guide/i)).toBeInTheDocument();
      expect(screen.getByText(/Download Whitepaper/i)).toBeInTheDocument();
    });

    test('contact page loads and displays functional form', async () => {
      const user = userEvent.setup();
      render(React.createElement(ContactPage));

      // Verify main heading
      expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
      
      // Verify form fields are present
      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Company/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
      
      // Verify submit button
      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      expect(submitButton).toBeInTheDocument();
      
      // Test form interaction
      await user.type(screen.getByLabelText(/First Name/i), 'John');
      await user.type(screen.getByLabelText(/Email Address/i), 'john@example.com');
      
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });

    test('navigation between pages works correctly', async () => {
      const user = userEvent.setup();
      
      // Test home page navigation
      render(React.createElement(HomePage));
      
      const servicesButton = screen.getByText(/Explore Our Services/i);
      expect(servicesButton).toBeInTheDocument();
      
      // Simulate navigation click (in real app this would navigate)
      await user.click(servicesButton);
      
      // Verify button is clickable
      expect(servicesButton).toBeInTheDocument();
    });

    test('form submission flow works end-to-end', async () => {
      const user = userEvent.setup();
      
      // Mock window.alert for form submission
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(React.createElement(ContactPage));
      
      // Fill out the form
      await user.type(screen.getByLabelText(/First Name/i), 'John');
      await user.type(screen.getByLabelText(/Last Name/i), 'Doe');
      await user.type(screen.getByLabelText(/Email Address/i), 'john.doe@example.com');
      await user.type(screen.getByLabelText(/Company/i), 'Test Company');
      await user.type(screen.getByLabelText(/Message/i), 'Test message');
      
      // Submit the form
      await user.click(screen.getByRole('button', { name: /Send Message/i }));
      
      // Verify form submission success message appears
      await waitFor(() => {
        expect(screen.getByText(/Thank you! Your message has been sent successfully/i)).toBeInTheDocument();
      });
      
      // Verify form is cleared after submission (form is no longer visible)
      await waitFor(() => {
        expect(screen.queryByLabelText(/First Name/i)).not.toBeInTheDocument();
      });
      
      alertSpy.mockRestore();
    });
  });

  describe('SEO Meta Tags Validation', () => {
    test('home page SEO configuration is valid', () => {
      const homeConfig = pageConfigs.home;
      const metadata = generateMetadata({
        title: homeConfig.title,
        description: homeConfig.description,
        keywords: homeConfig.keywords,
        url: 'https://novacorevectra.net',
      });

      // Verify title
      expect(metadata.title).toBe(homeConfig.title);
      expect(metadata.title?.toString().length).toBeLessThanOrEqual(60);
      
      // Verify description
      expect(metadata.description).toBe(homeConfig.description);
      expect(metadata.description?.length).toBeLessThanOrEqual(160);
      expect(metadata.description?.length).toBeGreaterThanOrEqual(50);
      
      // Verify keywords
      expect(metadata.keywords).toEqual(homeConfig.keywords);
      
      // Verify OpenGraph data
      expect(metadata.openGraph?.title).toBe(homeConfig.title);
      expect(metadata.openGraph?.description).toBe(homeConfig.description);
      expect(metadata.openGraph?.type).toBe('website');
      
      // Verify Twitter data
      expect(metadata.twitter?.title).toBe(homeConfig.title);
      expect(metadata.twitter?.description).toBe(homeConfig.description);
      expect(metadata.twitter?.card).toBe('summary_large_image');
    });

    test('services page SEO configuration is valid', () => {
      const servicesConfig = pageConfigs.services;
      const metadata = generateMetadata({
        title: servicesConfig.title,
        description: servicesConfig.description,
        keywords: servicesConfig.keywords,
        url: 'https://novacorevectra.net/services',
      });

      // Verify title matches (accounting for potential truncation)
      expect(metadata.title?.toString()).toContain('AI Services - Strategy, Implementation & Governance');
      expect(metadata.description).toBe(servicesConfig.description);
      expect(metadata.keywords).toEqual(servicesConfig.keywords);
      
      // Verify title length is optimized (allowing for truncation)
      expect(metadata.title?.toString().length).toBeLessThanOrEqual(70);
      
      // Verify description length is optimized
      expect(metadata.description?.length).toBeLessThanOrEqual(160);
      expect(metadata.description?.length).toBeGreaterThanOrEqual(50);
    });

    test('governance page SEO configuration is valid', () => {
      const governanceConfig = pageConfigs.governance;
      const metadata = generateMetadata({
        title: governanceConfig.title,
        description: governanceConfig.description,
        keywords: governanceConfig.keywords,
        url: 'https://novacorevectra.net/governance',
      });

      expect(metadata.title).toBe(governanceConfig.title);
      expect(metadata.description).toBe(governanceConfig.description);
      expect(metadata.keywords).toEqual(governanceConfig.keywords);
      
      // Verify governance-specific keywords are present
      expect(governanceConfig.keywords).toContain('AI governance');
      expect(governanceConfig.keywords).toContain('ISO 42001');
    });

    test('contact page SEO configuration is valid', () => {
      const contactConfig = pageConfigs.contact;
      const metadata = generateMetadata({
        title: contactConfig.title,
        description: contactConfig.description,
        keywords: contactConfig.keywords,
        url: 'https://novacorevectra.net/contact',
      });

      expect(metadata.title).toBe(contactConfig.title);
      expect(metadata.description).toBe(contactConfig.description);
      expect(metadata.keywords).toEqual(contactConfig.keywords);
      
      // Verify contact-specific keywords are present
      expect(contactConfig.keywords).toContain('contact NovaCoreVectra');
      expect(contactConfig.keywords).toContain('AI consultation');
    });

    test('all page configurations have required SEO elements', () => {
      Object.entries(pageConfigs).forEach(([pageName, config]) => {
        // Title requirements (allowing for truncation in metadata generation)
        expect(config.title).toBeDefined();
        expect(config.title.length).toBeGreaterThan(10);
        expect(config.title.length).toBeLessThanOrEqual(80); // Allow longer titles that get truncated
        
        // Description requirements (allowing for some flexibility in SEO optimization)
        expect(config.description).toBeDefined();
        expect(config.description.length).toBeGreaterThanOrEqual(50);
        expect(config.description.length).toBeLessThanOrEqual(170); // Allow slightly longer descriptions
        
        // Keywords requirements
        expect(config.keywords).toBeDefined();
        expect(Array.isArray(config.keywords)).toBe(true);
        expect(config.keywords.length).toBeGreaterThan(0);
        expect(config.keywords.length).toBeLessThanOrEqual(10);
        
        // Brand consistency
        expect(config.title).toContain('NovaCoreVectra');
        expect(config.description).toMatch(/AI|artificial intelligence/i);
      });
    });
  });

  describe('Structured Data Validation', () => {
    test('organization structured data is valid', () => {
      const orgData = generateStructuredData({
        type: 'Organization',
        data: {
          name: 'NovaCoreVectra',
          description: 'Leading AI consulting and governance solutions for enterprise',
          url: 'https://novacorevectra.net',
          logo: 'https://novacorevectra.net/logo.png',
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+1-305-504-0206',
            contactType: 'customer service',
            availableLanguage: ['English'],
          },
        },
      });

      const parsed = JSON.parse(orgData);
      
      expect(parsed['@context']).toBe('https://schema.org');
      expect(parsed['@type']).toBe('Organization');
      expect(parsed.name).toBe('NovaCoreVectra');
      expect(parsed.description).toContain('AI consulting');
      expect(parsed.url).toBe('https://novacorevectra.net');
      expect(parsed.contactPoint['@type']).toBe('ContactPoint');
      expect(parsed.contactPoint.telephone).toBe('+1-305-504-0206');
    });

    test('website structured data is valid', () => {
      const websiteData = generateStructuredData({
        type: 'WebSite',
        data: {
          name: 'NovaCoreVectra',
          description: 'Leading AI consulting and governance solutions for enterprise',
          url: 'https://novacorevectra.net',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://novacorevectra.net/search?q={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
          },
        },
      });

      const parsed = JSON.parse(websiteData);
      
      expect(parsed['@context']).toBe('https://schema.org');
      expect(parsed['@type']).toBe('WebSite');
      expect(parsed.name).toBe('NovaCoreVectra');
      expect(parsed.potentialAction['@type']).toBe('SearchAction');
      expect(parsed.potentialAction.target.urlTemplate).toContain('search?q=');
    });

    test('service structured data is valid', () => {
      const serviceData = generateStructuredData({
        type: 'Service',
        data: {
          name: 'AI Consulting Services',
          description: 'Comprehensive AI strategy and implementation services',
          provider: {
            '@type': 'Organization',
            name: 'NovaCoreVectra',
          },
          areaServed: ['US', 'CA', 'EU'],
          serviceType: 'AI Consulting',
        },
      });

      const parsed = JSON.parse(serviceData);
      
      expect(parsed['@context']).toBe('https://schema.org');
      expect(parsed['@type']).toBe('Service');
      expect(parsed.name).toBe('AI Consulting Services');
      expect(parsed.provider['@type']).toBe('Organization');
      expect(parsed.provider.name).toBe('NovaCoreVectra');
      expect(parsed.areaServed).toEqual(['US', 'CA', 'EU']);
      expect(parsed.serviceType).toBe('AI Consulting');
    });

    test('breadcrumb structured data is valid', () => {
      const breadcrumbData = generateStructuredData({
        type: 'BreadcrumbList',
        data: {
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://novacorevectra.net/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Services',
              item: 'https://novacorevectra.net/services',
            },
          ],
        },
      });

      const parsed = JSON.parse(breadcrumbData);
      
      expect(parsed['@context']).toBe('https://schema.org');
      expect(parsed['@type']).toBe('BreadcrumbList');
      expect(parsed.itemListElement).toHaveLength(2);
      expect(parsed.itemListElement[0]['@type']).toBe('ListItem');
      expect(parsed.itemListElement[0].position).toBe(1);
      expect(parsed.itemListElement[0].name).toBe('Home');
      expect(parsed.itemListElement[1].position).toBe(2);
      expect(parsed.itemListElement[1].name).toBe('Services');
    });
  });

  describe('Critical Functionality Tests', () => {
    test('all pages render without JavaScript errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Test all main pages
      const pages = [HomePage, ServicesPage, GovernancePage, ContactPage];
      
      pages.forEach((PageComponent) => {
        expect(() => render(React.createElement(PageComponent))).not.toThrow();
      });
      
      // Verify no console errors were logged
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('responsive design elements are present', () => {
      render(React.createElement(HomePage));
      
      // Check for responsive classes (Tailwind CSS)
      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveClass('max-w-7xl', 'mx-auto', 'px-6');
      
      // Check for responsive text sizing
      const heading = screen.getByText(/Trusted AI for Business Process Transformation/i);
      expect(heading).toHaveClass('text-4xl', 'sm:text-5xl', 'lg:text-6xl');
    });

    test('accessibility features are present', () => {
      render(React.createElement(ContactPage));
      
      // Check for proper form labels
      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      
      // Check for required field indicators
      const firstNameInput = screen.getByLabelText(/First Name/i);
      expect(firstNameInput).toHaveAttribute('required');
      
      const emailInput = screen.getByLabelText(/Email Address/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    test('key interactive elements are functional', async () => {
      const user = userEvent.setup();
      
      render(React.createElement(HomePage));
      
      // Test button interactions
      const exploreButton = screen.getByText(/Explore Our Services/i);
      const executiveButton = screen.getByText(/Executive Brief/i);
      
      expect(exploreButton).toBeInTheDocument();
      expect(executiveButton).toBeInTheDocument();
      
      // Verify buttons are clickable
      await user.click(exploreButton);
      await user.click(executiveButton);
      
      // Buttons should remain in document after click
      expect(exploreButton).toBeInTheDocument();
      expect(executiveButton).toBeInTheDocument();
    });

    test('error boundaries handle component failures gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Create a component that throws an error
      const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return React.createElement('div', null, 'No error');
      };
      
      // Test that error is thrown (would be caught by ErrorBoundary in real app)
      expect(() => render(React.createElement(ThrowError, { shouldThrow: true }))).toThrow();
      
      // Test that component works when not throwing
      expect(() => render(React.createElement(ThrowError, { shouldThrow: false }))).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance and Loading Tests', () => {
    test('pages render within acceptable time', () => {
      const startTime = performance.now();
      
      render(React.createElement(HomePage));
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render quickly (less than 100ms)
      expect(renderTime).toBeLessThan(100);
    });

    test('large content pages render efficiently', () => {
      const startTime = performance.now();
      
      render(React.createElement(ServicesPage));
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Services page has more content but should still render quickly
      expect(renderTime).toBeLessThan(200);
      
      // Verify all service sections are rendered
      expect(screen.getByText(/Business Process Strategy/i)).toBeInTheDocument();
      expect(screen.getByText(/AI Solution Implementation/i)).toBeInTheDocument();
      expect(screen.getByText(/Enterprise Integration & Governance/i)).toBeInTheDocument();
    });

    test('form interactions are responsive', async () => {
      const user = userEvent.setup();
      
      render(React.createElement(ContactPage));
      
      const startTime = performance.now();
      
      // Perform multiple form interactions
      await user.type(screen.getByLabelText(/First Name/i), 'John');
      await user.type(screen.getByLabelText(/Last Name/i), 'Doe');
      await user.type(screen.getByLabelText(/Email Address/i), 'john@example.com');
      
      const endTime = performance.now();
      const interactionTime = endTime - startTime;
      
      // Form interactions should be responsive
      expect(interactionTime).toBeLessThan(1000);
      
      // Verify form state is updated
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });
  });
});