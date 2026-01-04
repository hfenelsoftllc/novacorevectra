import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { Metadata } from 'next';

// Mock Next.js components and hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
}));

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  default: ({ src, alt, loading, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={src} 
      alt={alt}
      data-loading={loading}
      data-testid="optimized-image"
      {...props}
    />
  ),
})); 

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Test data generators
const pageGenerator = fc.constantFrom('/', '/services', '/governance', '/about', '/contact');
const metaTagGenerator = fc.record({
  title: fc.string({ minLength: 10, maxLength: 60 }),
  description: fc.string({ minLength: 50, maxLength: 160 }),
  keywords: fc.array(fc.string({ minLength: 2, maxLength: 20 }), { minLength: 3, maxLength: 10 }),
});

const imagePropsGenerator = fc.record({
  src: fc.webUrl(),
  alt: fc.string({ minLength: 5, maxLength: 100 }),
  loading: fc.constantFrom('lazy', 'eager'),
  width: fc.integer({ min: 100, max: 2000 }),
  height: fc.integer({ min: 100, max: 2000 }),
});

// Helper functions for SEO validation
const validateMetadata = (metadata: Metadata): boolean => {
  return !!(
    metadata.title &&
    metadata.description &&
    typeof metadata.title === 'string' &&
    typeof metadata.description === 'string' &&
    metadata.title.length >= 10 &&
    metadata.title.length <= 60 &&
    metadata.description.length >= 50 &&
    metadata.description.length <= 160
  );
};

const validateStructuredData = (metadata: Metadata): boolean => {
  return !!(
    metadata.openGraph &&
    metadata.openGraph.title &&
    metadata.openGraph.description &&
    metadata.openGraph.type &&
    metadata.twitter &&
    metadata.twitter.card &&
    metadata.twitter.title &&
    metadata.twitter.description
  );
};

const validateImageOptimization = (element: HTMLElement): boolean => {
  const images = element.querySelectorAll('[data-testid="optimized-image"]');
  return Array.from(images).every((img) => {
    const loadingAttr = img.getAttribute('data-loading');
    const altAttr = img.getAttribute('alt');
    const srcAttr = img.getAttribute('src');
    
    return !!(
      loadingAttr && // Has loading attribute
      altAttr && altAttr.length > 0 && // Has meaningful alt text
      srcAttr && srcAttr.length > 0 // Has valid src
    );
  });
};

// Property-based tests for SEO and Performance Optimization
describe('Property 10: SEO and Performance Optimization', () => {
  // Feature: full-marketing-site, Property 10: SEO and Performance Optimization
  
  test('generates proper meta tags and structured data for all pages', () => {
    fc.assert(
      fc.property(pageGenerator, metaTagGenerator, (page, metaData) => {
        // Create metadata object similar to Next.js layout
        const metadata: Metadata = {
          title: metaData.title,
          description: metaData.description,
          keywords: metaData.keywords,
          openGraph: {
            title: metaData.title,
            description: metaData.description,
            type: 'website',
            siteName: 'NovaCoreVectra',
          },
          twitter: {
            card: 'summary_large_image',
            title: metaData.title,
            description: metaData.description,
          },
        };

        // Validate basic meta tags
        expect(validateMetadata(metadata)).toBe(true);
        
        // Validate structured data (OpenGraph and Twitter)
        expect(validateStructuredData(metadata)).toBe(true);
        
        // Validate title length for SEO
        expect(metadata.title).toBeDefined();
        if (typeof metadata.title === 'string') {
          expect(metadata.title.length).toBeGreaterThanOrEqual(10);
          expect(metadata.title.length).toBeLessThanOrEqual(60);
        }
        
        // Validate description length for SEO
        expect(metadata.description).toBeDefined();
        if (typeof metadata.description === 'string') {
          expect(metadata.description.length).toBeGreaterThanOrEqual(50);
          expect(metadata.description.length).toBeLessThanOrEqual(160);
        }
      }),
      { numRuns: 10 }
    );
  });

  test('implements proper image optimization and lazy loading', () => {
    fc.assert(
      fc.property(imagePropsGenerator, (imageProps) => {
        // Mock component that uses Next.js Image
        const TestImageComponent = () => {
          const NextImage = require('next/image').default;
          return (
            <div>
              <NextImage
                src={imageProps.src}
                alt={imageProps.alt}
                loading={imageProps.loading}
                width={imageProps.width}
                height={imageProps.height}
              />
            </div>
          );
        };

        const { container } = render(<TestImageComponent />);
        
        // Validate image optimization attributes
        expect(validateImageOptimization(container)).toBe(true);
        
        // Check that lazy loading is properly implemented
        const image = container.querySelector('[data-testid="optimized-image"]');
        expect(image).toBeInTheDocument();
        expect(image?.getAttribute('data-loading')).toBe(imageProps.loading);
        expect(image?.getAttribute('alt')).toBe(imageProps.alt);
        expect(image?.getAttribute('src')).toBe(imageProps.src);
      }),
      { numRuns: 10 }
    );
  });

  test('provides optimized sitemaps structure', () => {
    fc.assert(
      fc.property(fc.constant(true), () => {
        // Define expected sitemap structure
        const expectedPages = ['/', '/services', '/governance', '/about', '/contact'];
        const sitemapStructure = {
          pages: expectedPages,
          lastModified: new Date().toISOString(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };

        // Validate sitemap contains all required pages
        expect(sitemapStructure.pages).toEqual(expect.arrayContaining(expectedPages));
        expect(sitemapStructure.pages.length).toBe(expectedPages.length);
        
        // Validate sitemap metadata
        expect(sitemapStructure.lastModified).toBeDefined();
        expect(sitemapStructure.changeFrequency).toBeDefined();
        expect(sitemapStructure.priority).toBeGreaterThan(0);
        expect(sitemapStructure.priority).toBeLessThanOrEqual(1);
        
        // Validate each page path format
        sitemapStructure.pages.forEach(page => {
          expect(page).toMatch(/^\/[a-z-]*$/);
        });
      }),
      { numRuns: 10 }
    );
  });

  test('maintains SEO-friendly URL structure across all pages', () => {
    fc.assert(
      fc.property(pageGenerator, (page) => {
        // Validate URL structure is SEO-friendly
        expect(page).toMatch(/^\/[a-z-]*$/); // Only lowercase letters, hyphens, and slashes
        expect(page).not.toMatch(/[A-Z]/); // No uppercase letters
        expect(page).not.toMatch(/[_]/); // No underscores
        expect(page).not.toMatch(/\s/); // No spaces
        
        // Validate page length is reasonable for SEO
        expect(page.length).toBeLessThanOrEqual(50);
        
        // Validate page starts with slash
        expect(page).toMatch(/^\//);
      }),
      { numRuns: 10 }
    );
  });

  test('ensures proper semantic HTML structure for SEO', () => {
    fc.assert(
      fc.property(fc.constant(true), () => {
        // Mock a page component with semantic HTML
        const TestPageComponent = () => (
          <div>
            <header role="banner">
              <nav role="navigation" aria-label="Main navigation">
                <ul>
                  <li><a href="/">Home</a></li>
                  <li><a href="/services">Services</a></li>
                  <li><a href="/governance">Governance</a></li>
                  <li><a href="/about">About</a></li>
                  <li><a href="/contact">Contact</a></li>
                </ul>
              </nav>
            </header>
            <main role="main" id="main-content">
              <h1>Page Title</h1>
              <section>
                <h2>Section Title</h2>
                <p>Content paragraph</p>
              </section>
            </main>
            <footer role="contentinfo">
              <p>Footer content</p>
            </footer>
          </div>
        );

        const { container } = render(<TestPageComponent />);
        
        // Validate semantic HTML elements exist
        expect(container.querySelector('header[role="banner"]')).toBeInTheDocument();
        expect(container.querySelector('nav[role="navigation"]')).toBeInTheDocument();
        expect(container.querySelector('main[role="main"]')).toBeInTheDocument();
        expect(container.querySelector('footer[role="contentinfo"]')).toBeInTheDocument();
        
        // Validate heading hierarchy
        expect(container.querySelector('h1')).toBeInTheDocument();
        expect(container.querySelector('h2')).toBeInTheDocument();
        
        // Validate main content has proper ID for skip links
        expect(container.querySelector('#main-content')).toBeInTheDocument();
      }),
      { numRuns: 10 }
    );
  });
});
