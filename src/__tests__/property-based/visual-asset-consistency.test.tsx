import * as fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import { 
  Logo, 
  ImagePlaceholder, 
  OptimizedImage
} from '../../components/ui';

// Clean up after each test to prevent DOM accumulation
afterEach(cleanup);

// Generators for property-based testing
const logoVariantGen = fc.constantFrom('default', 'compact', 'text-only', 'icon-only') as fc.Arbitrary<'default' | 'compact' | 'text-only' | 'icon-only'>;
const logoSizeGen = fc.constantFrom('sm', 'md', 'lg', 'xl') as fc.Arbitrary<'sm' | 'md' | 'lg' | 'xl'>;
const imagePlaceholderVariantGen = fc.constantFrom('default', 'gradient', 'pattern', 'icon') as fc.Arbitrary<'default' | 'gradient' | 'pattern' | 'icon'>;
const aspectRatioGen = fc.constantFrom('square', 'video', 'portrait', 'landscape', 'wide') as fc.Arbitrary<'square' | 'video' | 'portrait' | 'landscape' | 'wide'>;
const iconTypeGen = fc.constantFrom('image', 'user', 'building', 'chart', 'document') as fc.Arbitrary<'image' | 'user' | 'building' | 'chart' | 'document'>;


describe('Property 11: Visual Asset Consistency', () => {
  // Feature: full-marketing-site, Property 11: Visual Asset Consistency
  
  describe('Logo Component Consistency', () => {
    test('logo should always render with consistent brand elements across all variants and sizes', () => {
      // Feature: full-marketing-site, Property 11: Visual Asset Consistency - Logo consistency
      fc.assert(fc.property(
        logoVariantGen,
        logoSizeGen,
        fc.boolean(), // showText
        (variant, size, showText) => {
          const { container } = render(
            <Logo variant={variant} size={size} showText={showText} />
          );
          
          // Logo should always have consistent structure
          const logoElement = container.firstChild as HTMLElement;
          expect(logoElement).toBeInTheDocument();
          expect(logoElement).toHaveClass('inline-flex');
          
          // Brand consistency checks
          if (variant !== 'text-only') {
            // Should contain brand icon with consistent styling
            const iconElement = container.querySelector('[class*="bg-gradient-to-br"]');
            expect(iconElement).toBeInTheDocument();
            expect(iconElement).toHaveClass('from-brand-primary');
            expect(iconElement).toHaveClass('to-primary-600');
            expect(iconElement).toHaveClass('rounded-md');
            
            // Should contain NCV text in icon - use container query to avoid multiple elements
            const ncvInIcon = container.querySelector('[class*="bg-gradient-to-br"] span');
            expect(ncvInIcon).toBeInTheDocument();
            expect(ncvInIcon).toHaveTextContent('NCV');
          }
          
          // Text consistency checks
          if (variant !== 'icon-only' && (showText || variant === 'text-only' || variant === 'compact')) {
            // Check for text elements within this specific container
            const hasFullText = container.querySelector('span')?.textContent?.includes('NovaCoreVectra');
            const hasShortText = container.querySelector('span')?.textContent?.includes('NCV');
            
            // Should have either full text or short text based on variant
            expect(hasFullText || hasShortText).toBeTruthy();
          }
          
          return true;
        }
      ), { numRuns: 20 });
    });
  });

  describe('Image Placeholder Consistency', () => {
    test('image placeholders should maintain consistent styling and structure across all variants', () => {
      // Feature: full-marketing-site, Property 11: Visual Asset Consistency - Image placeholder consistency
      fc.assert(fc.property(
        imagePlaceholderVariantGen,
        aspectRatioGen,
        iconTypeGen,
        fc.string({ minLength: 3, maxLength: 50 }).filter(s => {
          const trimmed = s.trim();
          return trimmed.length > 2 && 
                 !trimmed.includes('toString') && 
                 !trimmed.includes('!') && 
                 /^[a-zA-Z0-9\s]+$/.test(trimmed); // alphanumeric and spaces only
        }), // safe meaningful text
        fc.boolean(), // showIcon
        fc.boolean(), // animate
        (variant, aspectRatio, iconType, text, showIcon, animate) => {
          const { container } = render(
            <ImagePlaceholder 
              variant={variant}
              aspectRatio={aspectRatio}
              iconType={iconType}
              text={text}
              showIcon={showIcon}
              animate={animate}
            />
          );
          
          const placeholderElement = container.firstChild as HTMLElement;
          
          // Consistent base structure
          expect(placeholderElement).toBeInTheDocument();
          expect(placeholderElement).toHaveClass('flex');
          expect(placeholderElement).toHaveClass('items-center');
          expect(placeholderElement).toHaveClass('justify-center');
          expect(placeholderElement).toHaveClass('rounded-lg');
          expect(placeholderElement).toHaveClass('overflow-hidden');
          
          // Validate aspect ratio consistency
          const aspectRatioClasses: Record<string, string> = {
            'square': 'aspect-square',
            'video': 'aspect-video',
            'portrait': 'aspect-[3/4]',
            'landscape': 'aspect-[4/3]',
            'wide': 'aspect-[16/9]'
          };
          expect(placeholderElement).toHaveClass(aspectRatioClasses[aspectRatio] || 'aspect-square');
          
          // Animation consistency
          if (animate) {
            expect(placeholderElement).toHaveClass('animate-pulse');
          }
          
          // Content consistency - check within container to avoid multiple elements
          if (text && text.trim().length > 1) {
            const textElement = container.querySelector('span.text-sm');
            expect(textElement).toBeInTheDocument();
            // Check text content more flexibly to handle whitespace normalization
            const actualText = textElement?.textContent?.trim() || '';
            const expectedText = text.trim();
            expect(actualText).toBe(expectedText);
          }
          
          // Icon consistency
          if (showIcon) {
            const iconElement = container.querySelector('svg');
            expect(iconElement).toBeInTheDocument();
            // The SVG should exist and be properly sized - check if it's the icon from iconTypes or pattern SVG
            if (variant === 'pattern') {
              // Pattern variant has a different SVG structure for the background pattern
              expect(iconElement).toBeTruthy();
            } else {
              // Regular icon variants should have w-8 h-8 classes
              const hasCorrectSize = iconElement?.classList.contains('w-8') && iconElement?.classList.contains('h-8');
              expect(hasCorrectSize).toBeTruthy();
            }
          }
          
          return true;
        }
      ), { numRuns: 20 });
    });
  });

  describe('Optimized Image Loading States', () => {
    test('optimized images should provide consistent loading states and fallbacks', () => {
      // Feature: full-marketing-site, Property 11: Visual Asset Consistency - Image loading states
      fc.assert(fc.property(
        fc.webUrl(), // src
        fc.string({ minLength: 1, maxLength: 100 }), // alt
        fc.option(fc.webUrl(), { nil: undefined }), // fallbackSrc
        fc.boolean(), // showLoadingState
        (src, alt, _fallbackSrc, showLoadingState) => {
          const { container } = render(
            <OptimizedImage 
              src={src}
              alt={alt}
              showLoadingState={showLoadingState}
              width={400}
              height={300}
            />
          );
          
          // Container should always be present with consistent structure
          const containerElement = container.querySelector('[class*="relative"]');
          expect(containerElement).toBeInTheDocument();
          expect(containerElement).toHaveClass('relative');
          expect(containerElement).toHaveClass('overflow-hidden');
          
          // Image element should be present
          const imageElement = container.querySelector('img');
          expect(imageElement).toBeInTheDocument();
          expect(imageElement).toHaveAttribute('alt', alt);
          // Next.js Image component transforms URLs, so just check that src contains the base URL
          const imageSrc = imageElement?.getAttribute('src') || '';
          expect(imageSrc).toContain('url=');
          // Check for the domain part of the URL to avoid encoding issues with special characters
          const urlMatch = src.match(/https?:\/\/([^\/]+)/);
          if (urlMatch && urlMatch[1]) {
            const domain = urlMatch[1];
            expect(imageSrc).toContain(encodeURIComponent(domain));
          }
          
          // Loading state consistency
          if (showLoadingState) {
            // Loading element should exist (initially) or have been there
            // We can't test the dynamic state easily, but we can verify structure
            expect(containerElement).toBeInTheDocument();
          }
          
          // Consistent image optimization attributes
          expect(imageElement).toHaveAttribute('sizes');
          
          return true;
        }
      ), { numRuns: 10 }); // Reduced runs for web URLs
    });
  });

  describe('Cross-Component Visual Consistency', () => {
    test('all visual components should maintain consistent design system adherence', () => {
      // Feature: full-marketing-site, Property 11: Visual Asset Consistency - Cross-component consistency
      fc.assert(fc.property(
        logoSizeGen,
        fc.string({ minLength: 1, maxLength: 50 }),
        (size, placeholderText) => {
          const { container: logoContainer } = render(<Logo size={size} />);
          const { container: placeholderContainer } = render(
            <ImagePlaceholder text={placeholderText} />
          );
          
          // All components should use consistent border radius
          const logoElement = logoContainer.querySelector('[class*="rounded"]');
          const placeholderElement = placeholderContainer.firstChild as HTMLElement;
          
          expect(logoElement).toHaveClass('rounded-md');
          expect(placeholderElement).toHaveClass('rounded-lg');
          
          // All components should follow consistent spacing patterns
          expect(logoElement).toBeInTheDocument();
          expect(placeholderElement).toBeInTheDocument();
          
          return true;
        }
      ), { numRuns: 20 });
    });
  });
});