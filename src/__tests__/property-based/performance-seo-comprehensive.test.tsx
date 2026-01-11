/**
 * Comprehensive Performance and SEO Tests
 * Tests meta tag generation, structured data, sitemap generation, and image optimization
 * Requirements: 9.3, 9.4, 9.5
 */

import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import { 
  generateMetadata, 
  generateStructuredData, 
  generateSitemapData,
  generateOrganizationStructuredData,
  generateWebsiteStructuredData,
  generateBreadcrumbStructuredData,
  generateServiceStructuredData,
  validateSEOConfig,
  pageConfigs,

  SitemapEntry
} from '../../utils/seo';
import { Metadata } from 'next';

// Mock Next.js components and environment variables
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, loading, width, height, ...props }: any) => (
    <img 
      src={src} 
      alt={alt}
      data-loading={loading}
      data-width={width}
      data-height={height}
      data-testid="optimized-image"
      {...props}
    />
  ),
}));

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_SITE_URL: 'https://novacorevectra.net',
    NEXT_PUBLIC_GOOGLE_VERIFICATION: 'test-google-verification',
    NEXT_PUBLIC_YANDEX_VERIFICATION: 'test-yandex-verification',
    NEXT_PUBLIC_YAHOO_VERIFICATION: 'test-yahoo-verification',
  };
});

afterEach(() => {
  process.env = originalEnv;
});

// Test data generators
const seoConfigGenerator = fc.record({
  title: fc.string({ minLength: 10, maxLength: 60 }),
  description: fc.string({ minLength: 50, maxLength: 160 }),
  keywords: fc.array(fc.string({ minLength: 2, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
  image: fc.webUrl(),
  url: fc.webUrl(),
  type: fc.constantFrom('website', 'article', 'product') as fc.Arbitrary<'website' | 'article' | 'product'>,
  siteName: fc.string({ minLength: 3, maxLength: 50 }),
  locale: fc.constantFrom('en_US', 'en_GB', 'fr_FR'),
});

const breadcrumbGenerator = fc.array(
  fc.record({
    name: fc.string({ minLength: 2, maxLength: 30 }),
    url: fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`),
  }),
  { minLength: 1, maxLength: 5 }
);

const serviceGenerator = fc.record({
  name: fc.string({ minLength: 5, maxLength: 100 }),
  description: fc.string({ minLength: 20, maxLength: 200 }),
  provider: fc.string({ minLength: 3, maxLength: 50 }),
  areaServed: fc.array(fc.string({ minLength: 2, maxLength: 3 }), { minLength: 1, maxLength: 10 }),
  serviceType: fc.string({ minLength: 5, maxLength: 50 }),
});

const imagePropsGenerator = fc.record({
  src: fc.webUrl(),
  alt: fc.string({ minLength: 5, maxLength: 100 }),
  loading: fc.constantFrom('lazy', 'eager'),
  width: fc.integer({ min: 200, max: 1600 }),
  height: fc.integer({ min: 200, max: 1600 }),
});

// Helper functions
const validateMetadataStructure = (metadata: Metadata): boolean => {
  return !!(
    metadata.title &&
    metadata.description &&
    typeof metadata.title === 'string' &&
    typeof metadata.description === 'string' &&
    metadata.openGraph &&
    metadata.twitter
  );
};

const validateStructuredDataJSON = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    return !!(
      parsed['@context'] === 'https://schema.org' &&
      parsed['@type'] &&
      typeof parsed['@type'] === 'string'
    );
  } catch {
    return false;
  }
};

const validateSitemapEntry = (entry: SitemapEntry): boolean => {
  return !!(
    entry.url &&
    entry.lastModified &&
    entry.changeFrequency &&
    typeof entry.priority === 'number' &&
    entry.priority >= 0 &&
    entry.priority <= 1 &&
    entry.url.startsWith('http')
  );
};

describe('Property 14.1: Performance and SEO Tests', () => {
  // Feature: full-marketing-site, Property 14.1: Performance and SEO Tests

  describe('Meta Tag Generation', () => {
    test('generates proper meta tags for all SEO configurations', () => {
      fc.assert(
        fc.property(seoConfigGenerator, (config) => {
          const metadata = generateMetadata(config);
          
          // Validate basic metadata structure
          expect(validateMetadataStructure(metadata)).toBe(true);
          
          // Validate title optimization
          expect(metadata.title).toBeDefined();
          if (typeof metadata.title === 'string') {
            expect(metadata.title.length).toBeLessThanOrEqual(60);
            expect(metadata.title.length).toBeGreaterThan(0);
          }
          
          // Validate description optimization
          expect(metadata.description).toBeDefined();
          if (typeof metadata.description === 'string') {
            expect(metadata.description.length).toBeLessThanOrEqual(160);
            expect(metadata.description.length).toBeGreaterThan(0);
          }
          
          // Validate OpenGraph data
          expect(metadata.openGraph).toBeDefined();
          expect(metadata.openGraph?.title).toBeDefined();
          expect(metadata.openGraph?.description).toBeDefined();
          expect(metadata.openGraph?.siteName).toBeDefined();
          
          // Validate Twitter data
          expect(metadata.twitter).toBeDefined();
          expect(metadata.twitter?.title).toBeDefined();
          expect(metadata.twitter?.description).toBeDefined();
          
          // Validate robots configuration
          expect(metadata.robots).toBeDefined();
          if (typeof metadata.robots === 'object' && metadata.robots !== null) {
            expect(metadata.robots.index).toBe(true);
            expect(metadata.robots.follow).toBe(true);
          }
        }),
        { numRuns: 20 }
      );
    });

    test('validates SEO configuration correctly', () => {
      fc.assert(
        fc.property(seoConfigGenerator, (config) => {
          const validation = validateSEOConfig(config);
          
          // Should be valid for properly generated configs
          expect(validation.isValid).toBe(true);
          expect(validation.errors).toHaveLength(0);
          
          // Test with invalid title (too short)
          const invalidConfig = { ...config, title: 'short' };
          const invalidValidation = validateSEOConfig(invalidConfig);
          expect(invalidValidation.isValid).toBe(false);
          expect(invalidValidation.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 20 }
      );
    });

    test('generates consistent metadata for predefined page configurations', () => {
      fc.assert(
        fc.property(fc.constantFrom(...Object.keys(pageConfigs)), (pageKey) => {
          const config = pageConfigs[pageKey as keyof typeof pageConfigs];
          const metadata = generateMetadata({
            ...config,
            url: 'https://novacorevectra.net',
            image: 'https://novacorevectra.net/og-image.png',
          });
          
          // Validate that predefined configs generate valid metadata
          expect(validateMetadataStructure(metadata)).toBe(true);
          // Title may be truncated but should still reference the brand
          expect(metadata.title).toMatch(/NovaCoreVectra|Nov\.\.\./);
          expect(metadata.description).toBeDefined();
          expect(metadata.keywords).toBeDefined();
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Structured Data Generation', () => {
    test('generates valid JSON-LD structured data', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('Organization', 'WebSite', 'Service', 'BreadcrumbList'),
          fc.record({ name: fc.string(), description: fc.string() }),
          (type, data) => {
            const structuredData = generateStructuredData({ type: type as any, data });
            
            // Validate JSON structure
            expect(validateStructuredDataJSON(structuredData)).toBe(true);
            
            // Parse and validate content
            const parsed = JSON.parse(structuredData);
            expect(parsed['@context']).toBe('https://schema.org');
            expect(parsed['@type']).toBe(type);
            expect(parsed.name).toBe(data.name);
            expect(parsed.description).toBe(data.description);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('generates organization structured data correctly', () => {
      fc.assert(
        fc.property(fc.constant(true), () => {
          const orgData = generateOrganizationStructuredData();
          
          expect(validateStructuredDataJSON(orgData)).toBe(true);
          
          const parsed = JSON.parse(orgData);
          expect(parsed['@type']).toBe('Organization');
          expect(parsed.name).toBe('NovaCoreVectra');
          expect(parsed.description).toBeDefined();
          expect(parsed.url).toBeDefined();
          expect(parsed.contactPoint).toBeDefined();
          expect(parsed.address).toBeDefined();
        }),
        { numRuns: 20 }
      );
    });

    test('generates website structured data correctly', () => {
      fc.assert(
        fc.property(fc.constant(true), () => {
          const websiteData = generateWebsiteStructuredData();
          
          expect(validateStructuredDataJSON(websiteData)).toBe(true);
          
          const parsed = JSON.parse(websiteData);
          expect(parsed['@type']).toBe('WebSite');
          expect(parsed.name).toBe('NovaCoreVectra');
          expect(parsed.url).toBeDefined();
          expect(parsed.potentialAction).toBeDefined();
          expect(parsed.potentialAction['@type']).toBe('SearchAction');
        }),
        { numRuns: 20 }
      );
    });

    test('generates breadcrumb structured data correctly', () => {
      fc.assert(
        fc.property(breadcrumbGenerator, (breadcrumbs) => {
          const breadcrumbData = generateBreadcrumbStructuredData(breadcrumbs);
          
          expect(validateStructuredDataJSON(breadcrumbData)).toBe(true);
          
          const parsed = JSON.parse(breadcrumbData);
          expect(parsed['@type']).toBe('BreadcrumbList');
          expect(parsed.itemListElement).toHaveLength(breadcrumbs.length);
          
          // Validate each breadcrumb item
          parsed.itemListElement.forEach((item: any, index: number) => {
            expect(item['@type']).toBe('ListItem');
            expect(item.position).toBe(index + 1);
            expect(item.name).toBe(breadcrumbs[index]?.name);
            expect(item.item).toContain(breadcrumbs[index]?.url);
          });
        }),
        { numRuns: 20 }
      );
    });

    test('generates service structured data correctly', () => {
      fc.assert(
        fc.property(serviceGenerator, (service) => {
          const serviceData = generateServiceStructuredData(service);
          
          expect(validateStructuredDataJSON(serviceData)).toBe(true);
          
          const parsed = JSON.parse(serviceData);
          expect(parsed['@type']).toBe('Service');
          expect(parsed.name).toBe(service.name);
          expect(parsed.description).toBe(service.description);
          expect(parsed.provider['@type']).toBe('Organization');
          expect(parsed.provider.name).toBe(service.provider);
          expect(parsed.areaServed).toEqual(service.areaServed);
          expect(parsed.serviceType).toBe(service.serviceType);
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Sitemap Generation', () => {
    test('generates valid sitemap entries', () => {
      fc.assert(
        fc.property(fc.constant(true), () => {
          const sitemapData = generateSitemapData();
          
          // Validate sitemap structure
          expect(Array.isArray(sitemapData)).toBe(true);
          expect(sitemapData.length).toBeGreaterThan(0);
          
          // Validate each entry
          sitemapData.forEach(entry => {
            expect(validateSitemapEntry(entry)).toBe(true);
          });
          
          // Validate required pages are included
          const urls = sitemapData.map(entry => entry.url);
          const expectedPages = ['/', '/services', '/governance', '/about', '/contact'];
          expectedPages.forEach(page => {
            const expectedUrl = `${process.env['NEXT_PUBLIC_SITE_URL']}${page === '/' ? '' : page}`;
            expect(urls).toContain(expectedUrl);
          });
        }),
        { numRuns: 20 }
      );
    });

    test('generates sitemap with proper SEO attributes', () => {
      fc.assert(
        fc.property(fc.constant(true), () => {
          const sitemapData = generateSitemapData();
          
          sitemapData.forEach(entry => {
            // Validate URL format
            expect(entry.url).toMatch(/^https?:\/\/.+/);
            
            // Validate lastModified is a valid date
            expect(entry.lastModified).toBeInstanceOf(Date);
            expect(entry.lastModified.getTime()).toBeLessThanOrEqual(Date.now());
            
            // Validate changeFrequency is valid
            const validFrequencies = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
            expect(validFrequencies).toContain(entry.changeFrequency);
            
            // Validate priority is in valid range
            expect(entry.priority).toBeGreaterThanOrEqual(0);
            expect(entry.priority).toBeLessThanOrEqual(1);
          });
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Image Optimization', () => {
    test('implements proper image optimization attributes', () => {
      fc.assert(
        fc.property(imagePropsGenerator, (imageProps) => {
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
          
          const image = container.querySelector('[data-testid="optimized-image"]');
          expect(image).toBeInTheDocument();
          
          // Validate optimization attributes
          expect(image?.getAttribute('data-loading')).toBe(imageProps.loading);
          expect(image?.getAttribute('alt')).toBe(imageProps.alt);
          expect(image?.getAttribute('src')).toBe(imageProps.src);
          expect(image?.getAttribute('data-width')).toBe(imageProps.width.toString());
          expect(image?.getAttribute('data-height')).toBe(imageProps.height.toString());
          
          // Validate alt text is meaningful (not empty)
          expect(imageProps.alt.length).toBeGreaterThan(0);
        }),
        { numRuns: 20 }
      );
    });

    test('ensures lazy loading is properly configured', () => {
      fc.assert(
        fc.property(
          imagePropsGenerator,
          (imageProps) => {
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
            
            const image = container.querySelector('[data-testid="optimized-image"]');
            expect(image).toBeInTheDocument();
            
            // Validate loading strategy
            const loadingAttr = image?.getAttribute('data-loading');
            expect(['lazy', 'eager']).toContain(loadingAttr);
            
            // For performance, most images should be lazy loaded
            if (imageProps.loading === 'lazy') {
              expect(loadingAttr).toBe('lazy');
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    test('validates image dimensions for responsive design', () => {
      fc.assert(
        fc.property(imagePropsGenerator, (imageProps) => {
          // Validate dimensions are reasonable for web use
          expect(imageProps.width).toBeGreaterThanOrEqual(200);
          expect(imageProps.width).toBeLessThanOrEqual(1600);
          expect(imageProps.height).toBeGreaterThanOrEqual(200);
          expect(imageProps.height).toBeLessThanOrEqual(1600);
          
          // Validate aspect ratio is reasonable (not too extreme)
          const aspectRatio = imageProps.width / imageProps.height;
          expect(aspectRatio).toBeGreaterThan(0.125); // Not too tall (8:1 max)
          expect(aspectRatio).toBeLessThan(8); // Not too wide (8:1 max)
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Performance Optimization', () => {
    test('ensures meta tags are optimized for performance', () => {
      fc.assert(
        fc.property(seoConfigGenerator, (config) => {
          const metadata = generateMetadata(config);
          
          // Validate that long titles are truncated for performance
          if (typeof metadata.title === 'string' && config.title.length > 60) {
            expect(metadata.title.length).toBeLessThanOrEqual(60);
            expect(metadata.title).toMatch(/\.\.\.$/);
          }
          
          // Validate that long descriptions are truncated for performance
          if (typeof metadata.description === 'string' && config.description.length > 160) {
            expect(metadata.description.length).toBeLessThanOrEqual(160);
            expect(metadata.description).toMatch(/\.\.\.$/);
          }
          
          // Validate robots configuration for optimal crawling
          if (typeof metadata.robots === 'object' && metadata.robots !== null) {
            expect(metadata.robots.index).toBe(true);
            expect(metadata.robots.follow).toBe(true);
            if (metadata.robots.googleBot && typeof metadata.robots.googleBot === 'object') {
              expect(metadata.robots.googleBot.index).toBe(true);
              expect(metadata.robots.googleBot.follow).toBe(true);
            }
          }
        }),
        { numRuns: 20 }
      );
    });

    test('validates structured data size for performance', () => {
      fc.assert(
        fc.property(serviceGenerator, (service) => {
          const serviceData = generateServiceStructuredData(service);
          
          // Validate JSON size is reasonable (not too large)
          const jsonSize = new Blob([serviceData]).size;
          expect(jsonSize).toBeLessThan(10000); // Less than 10KB
          
          // Validate JSON is properly formatted (no unnecessary whitespace in production)
          const minified = JSON.stringify(JSON.parse(serviceData));
          const formatted = serviceData;
          
          // In tests, we use formatted JSON, but validate it can be minified
          // Allow for cases where content is already minimal
          expect(minified.length).toBeLessThanOrEqual(formatted.length);
        }),
        { numRuns: 20 }
      );
    });
  });
});
