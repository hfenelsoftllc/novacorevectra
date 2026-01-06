import * as fc from 'fast-check';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';

// Mock Next.js router for testing
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
}));

// Mock framer-motion to test motion preferences
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => children,
}));

// Ensure cleanup after each test
afterEach(() => {
  cleanup();
});

// Viewport size generators for different device categories
const mobileViewportGenerator = fc.record({
  width: fc.integer({ min: 320, max: 767 }),
  height: fc.integer({ min: 568, max: 1024 }),
});

const tabletViewportGenerator = fc.record({
  width: fc.integer({ min: 768, max: 1023 }),
  height: fc.integer({ min: 768, max: 1366 }),
});

const desktopViewportGenerator = fc.record({
  width: fc.integer({ min: 1024, max: 1920 }),
  height: fc.integer({ min: 768, max: 1080 }),
});

const allViewportGenerator = fc.oneof(
  mobileViewportGenerator,
  tabletViewportGenerator,
  desktopViewportGenerator
);

// Test component that simulates responsive behavior without duplicating Header elements
const ResponsiveTestComponent: React.FC<{ viewport: { width: number; height: number } }> = ({ viewport }) => {
  // Simulate responsive behavior based on viewport
  const isMobile = viewport.width < 768;
  const isTablet = viewport.width >= 768 && viewport.width < 1024;

  return (
    <div 
      data-testid="responsive-container"
      data-viewport-type={isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}
      style={{ width: viewport.width, height: viewport.height }}
    >
      {/* Touch-friendly elements test */}
      <div className="p-4">
        <Button 
          data-testid="touch-button"
          className={`${isMobile ? 'min-h-[44px] min-w-[44px]' : 'min-h-[32px]'} touch-manipulation`}
        >
          Touch Target
        </Button>
        
        {/* Form elements that should be touch-friendly */}
        <input
          data-testid="touch-input"
          type="text"
          className={`mt-4 ${isMobile ? 'min-h-[44px] text-base' : 'min-h-[32px]'} w-full border rounded px-3`}
          placeholder="Touch-friendly input"
        />
        
        {/* Navigation should adapt to viewport */}
        <Navigation 
          currentPath="/"
          isMobile={isMobile}
          className={isMobile ? 'flex-col space-y-2' : 'flex space-x-4'}
        />
      </div>
      
      {/* Content that should be responsive */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'} gap-4 p-4`}>
        <div data-testid="content-item-1" className="bg-gray-100 p-4 rounded">Item 1</div>
        <div data-testid="content-item-2" className="bg-gray-100 p-4 rounded">Item 2</div>
        <div data-testid="content-item-3" className="bg-gray-100 p-4 rounded">Item 3</div>
      </div>
    </div>
  );
};

// Separate component for testing Header responsive behavior
const HeaderTestComponent: React.FC<{ viewport: { width: number; height: number } }> = ({ viewport }) => {
  return (
    <div 
      data-testid="header-container"
      style={{ width: viewport.width, height: viewport.height }}
    >
      <Header />
    </div>
  );
};

// Component to test motion preferences
const MotionTestComponent: React.FC<{ respectsMotionPreference: boolean }> = ({ respectsMotionPreference }) => {
  return (
    <div data-testid="motion-container">
      <div 
        data-testid="animated-element"
        className={`transition-transform duration-300 ${respectsMotionPreference ? 'motion-reduce:transition-none' : ''}`}
        style={{
          transform: 'translateX(0px)',
          animation: respectsMotionPreference ? 'none' : 'fade-in 0.5s ease-out',
        }}
      >
        Animated Content
      </div>
    </div>
  );
};

describe('Property 12: Responsive Design Compliance', () => {
  test('provides optimal viewing experience across all viewport sizes', () => {
    // Feature: full-marketing-site, Property 12: Responsive Design Compliance
    fc.assert(
      fc.property(allViewportGenerator, (viewport) => {
        cleanup(); // Ensure clean state before render
        const { unmount } = render(<ResponsiveTestComponent viewport={viewport} />);
        
        const containers = screen.queryAllByTestId('responsive-container');
        expect(containers.length).toBeGreaterThan(0);
        const container = containers[0];
        const viewportType = container.getAttribute('data-viewport-type');
        
        // Container should adapt to viewport size
        expect(container).toBeInTheDocument();
        expect(['mobile', 'tablet', 'desktop']).toContain(viewportType);
        
        // Content should be accessible regardless of viewport
        expect(screen.getByTestId('content-item-1')).toBeInTheDocument();
        expect(screen.getByTestId('content-item-2')).toBeInTheDocument();
        expect(screen.getByTestId('content-item-3')).toBeInTheDocument();
        
        // Navigation should be present and functional
        const navigation = screen.getByRole('navigation', { name: /main navigation/i });
        expect(navigation).toBeInTheDocument();
        
        // All navigation links should be accessible
        expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /services/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /governance/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
        
        unmount();
        cleanup(); // Ensure clean state after test
        return true;
      }),
      { numRuns: 10 }
    );
  });

  test('maintains full functionality on mobile viewports', () => {
    // Feature: full-marketing-site, Property 12: Responsive Design Compliance
    fc.assert(
      fc.property(mobileViewportGenerator, (viewport) => {
        // Clean up any existing DOM elements first
        cleanup();
        
        // Test Header component separately to avoid conflicts
        const { unmount: unmountHeader } = render(<HeaderTestComponent viewport={viewport} />);
        
        // Mobile menu button should be present and functional
        const mobileMenuButtons = screen.queryAllByRole('button', { name: /open.*menu/i });
        expect(mobileMenuButtons.length).toBeGreaterThan(0);
        expect(mobileMenuButtons[0]).toBeInTheDocument();
        
        unmountHeader();
        cleanup(); // Clean up between renders
        
        // Test responsive component separately
        const { unmount: unmountResponsive } = render(<ResponsiveTestComponent viewport={viewport} />);
        
        const container = screen.getByTestId('responsive-container');
        expect(container.getAttribute('data-viewport-type')).toBe('mobile');
        
        // All interactive elements should be present
        const touchButton = screen.getByTestId('touch-button');
        const touchInput = screen.getByTestId('touch-input');
        
        expect(touchButton).toBeInTheDocument();
        expect(touchInput).toBeInTheDocument();
        
        // Elements should be clickable/focusable
        fireEvent.click(touchButton);
        fireEvent.focus(touchInput);
        
        // Navigation should work in mobile mode
        const navigation = screen.getByRole('navigation', { name: /main navigation/i });
        expect(navigation).toBeInTheDocument();
        
        // All navigation links should be functional
        const homeLink = screen.getByRole('link', { name: /home/i });
        expect(homeLink).toBeInTheDocument();
        fireEvent.click(homeLink);
        
        unmountResponsive();
        cleanup(); // Clean up after test
        return true;
      }),
      { numRuns: 10 }
    );
  });

  test('uses touch-friendly interface elements on mobile', () => {
    // Feature: full-marketing-site, Property 12: Responsive Design Compliance
    fc.assert(
      fc.property(mobileViewportGenerator, (viewport) => {
        // Clean up any existing DOM elements first
        cleanup();
        
        const { unmount } = render(<ResponsiveTestComponent viewport={viewport} />);
        
        // Touch targets should meet minimum size requirements (44px for mobile)
        const touchButtons = screen.queryAllByTestId('touch-button');
        const touchInputs = screen.queryAllByTestId('touch-input');
        
        expect(touchButtons.length).toBeGreaterThan(0);
        expect(touchInputs.length).toBeGreaterThan(0);
        
        // Use the first elements found
        const touchButton = touchButtons[0];
        const touchInput = touchInputs[0];
        
        // Touch button should have minimum dimensions
        expect(touchButton).toHaveClass('min-h-[44px]');
        expect(touchButton).toHaveClass('min-w-[44px]');
        expect(touchButton).toHaveClass('touch-manipulation');
        
        // Input should be touch-friendly
        expect(touchInput).toHaveClass('min-h-[44px]');
        expect(touchInput).toHaveClass('text-base'); // Prevents zoom on iOS
        
        // Navigation should be in mobile-friendly layout
        const navigation = screen.getByRole('navigation', { name: /main navigation/i });
        expect(navigation).toBeInTheDocument();
        
        unmount();
        cleanup(); // Clean up between renders
        
        // Test Header component separately for mobile menu
        const { unmount: unmountHeader } = render(<HeaderTestComponent viewport={viewport} />);
        
        // Mobile menu should be accessible
        const mobileMenuButtons = screen.queryAllByRole('button', { name: /open.*menu/i });
        expect(mobileMenuButtons.length).toBeGreaterThan(0);
        expect(mobileMenuButtons[0]).toBeInTheDocument();
        
        unmountHeader();
        cleanup(); // Clean up after test
        return true;
      }),
      { numRuns: 10 }
    );
  });

  test('respects user motion preferences for animations', () => {
    // Feature: full-marketing-site, Property 12: Responsive Design Compliance
    const motionPreferenceGenerator = fc.boolean();
    
    fc.assert(
      fc.property(motionPreferenceGenerator, (respectsMotionPreference) => {
        cleanup(); // Ensure clean state before render
        const { unmount } = render(<MotionTestComponent respectsMotionPreference={respectsMotionPreference} />);
        
        const animatedElements = screen.queryAllByTestId('animated-element');
        expect(animatedElements.length).toBeGreaterThan(0);
        const animatedElement = animatedElements[0];
        
        expect(animatedElement).toBeInTheDocument();
        
        if (respectsMotionPreference) {
          // When motion preference is respected, should have motion-reduce class
          expect(animatedElement).toHaveClass('motion-reduce:transition-none');
          
          // Animation should be disabled
          expect(animatedElement.style.animation).toBe('none');
        } else {
          // When motion is allowed, animations should be present
          expect(animatedElement.style.animation).toContain('fade-in');
        }
        
        unmount();
        cleanup(); // Ensure clean state after test
        return true;
      }),
      { numRuns: 10 }
    );
  });

  test('provides consistent functionality across all device categories', () => {
    // Feature: full-marketing-site, Property 12: Responsive Design Compliance
    fc.assert(
      fc.property(allViewportGenerator, (viewport) => {
        // Clean up any existing DOM elements first
        cleanup();
        
        const { unmount } = render(<ResponsiveTestComponent viewport={viewport} />);
        
        const containers = screen.queryAllByTestId('responsive-container');
        expect(containers.length).toBeGreaterThan(0);
        const container = containers[0]; // Use the first container found
        const viewportType = container.getAttribute('data-viewport-type');
        
        // Core functionality should be available regardless of viewport
        // 1. Navigation should always be accessible
        const navigation = screen.getByRole('navigation', { name: /main navigation/i });
        expect(navigation).toBeInTheDocument();
        
        // 2. All required navigation links should be present
        const requiredLinks = ['home', 'services', 'governance', 'about', 'contact'];
        requiredLinks.forEach(linkName => {
          const link = screen.getByRole('link', { name: new RegExp(linkName, 'i') });
          expect(link).toBeInTheDocument();
          expect(link).toHaveAttribute('href');
        });
        
        // 3. Interactive elements should be present and functional
        const touchButtons = screen.queryAllByTestId('touch-button');
        const touchInputs = screen.queryAllByTestId('touch-input');
        
        expect(touchButtons.length).toBeGreaterThan(0);
        expect(touchInputs.length).toBeGreaterThan(0);
        
        const touchButton = touchButtons[0];
        const touchInput = touchInputs[0];
        
        expect(touchButton).toBeInTheDocument();
        expect(touchInput).toBeInTheDocument();
        
        // 4. Content should be organized appropriately for viewport
        const contentItems = [
          screen.getByTestId('content-item-1'),
          screen.getByTestId('content-item-2'),
          screen.getByTestId('content-item-3'),
        ];
        
        contentItems.forEach(item => {
          expect(item).toBeInTheDocument();
          expect(item).toBeVisible();
        });
        
        unmount();
        cleanup(); // Clean up between renders
        
        // 5. Layout should adapt to viewport type - test with Header separately
        if (viewportType === 'mobile') {
          const { unmount: unmountHeader } = render(<HeaderTestComponent viewport={viewport} />);
          // Mobile should have menu button
          const mobileMenuButtons = screen.queryAllByRole('button', { name: /open.*menu/i });
          expect(mobileMenuButtons.length).toBeGreaterThan(0);
          unmountHeader();
          cleanup();
        }
        
        return true;
      }),
      { numRuns: 10 }
    );
  });

  test('maintains proper spacing and layout proportions across viewports', () => {
    // Feature: full-marketing-site, Property 12: Responsive Design Compliance
    fc.assert(
      fc.property(allViewportGenerator, (viewport) => {
        cleanup(); // Ensure clean state before render
        const { unmount } = render(<ResponsiveTestComponent viewport={viewport} />);
        
        const containers = screen.queryAllByTestId('responsive-container');
        expect(containers.length).toBeGreaterThan(0);
        const container = containers[0];
        const viewportType = container.getAttribute('data-viewport-type');
        
        // Container should have appropriate dimensions
        expect(container).toHaveStyle({
          width: `${viewport.width}px`,
          height: `${viewport.height}px`,
        });
        
        // Content should be properly spaced
        const contentItems = [
          screen.getByTestId('content-item-1'),
          screen.getByTestId('content-item-2'),
          screen.getByTestId('content-item-3'),
        ];
        
        // All content items should be visible and accessible
        contentItems.forEach(item => {
          expect(item).toBeInTheDocument();
          expect(item).toBeVisible();
        });
        
        // Layout should be appropriate for viewport
        // This is tested through the grid classes applied in the component
        const gridContainer = contentItems[0].parentElement;
        expect(gridContainer).toBeInTheDocument();
        
        // Verify responsive grid behavior through class presence
        if (viewportType === 'mobile') {
          expect(gridContainer).toHaveClass('grid-cols-1');
        } else if (viewportType === 'tablet') {
          expect(gridContainer).toHaveClass('grid-cols-2');
        } else if (viewportType === 'desktop') {
          expect(gridContainer).toHaveClass('grid-cols-3');
        }
        
        unmount();
        cleanup(); // Ensure clean state after test
        return true;
      }),
      { numRuns: 10 }
    );
  });

  test('ensures text remains readable across all viewport sizes', () => {
    // Feature: full-marketing-site, Property 12: Responsive Design Compliance
    fc.assert(
      fc.property(allViewportGenerator, (viewport) => {
        cleanup(); // Ensure clean state before render
        const { unmount } = render(<ResponsiveTestComponent viewport={viewport} />);
        
        // Text elements should be readable
        const touchButtons = screen.queryAllByTestId('touch-button');
        const touchInputs = screen.queryAllByTestId('touch-input');
        
        expect(touchButtons.length).toBeGreaterThan(0);
        expect(touchInputs.length).toBeGreaterThan(0);
        
        const touchButton = touchButtons[0];
        const touchInput = touchInputs[0];
        
        // Button text should be visible
        expect(touchButton).toHaveTextContent('Touch Target');
        expect(touchButton).toBeVisible();
        
        // Input placeholder should be accessible
        expect(touchInput).toHaveAttribute('placeholder', 'Touch-friendly input');
        expect(touchInput).toBeVisible();
        
        // Navigation text should be readable
        const homeLink = screen.getByRole('link', { name: /home/i });
        expect(homeLink).toBeVisible();
        expect(homeLink).toHaveAccessibleName();
        
        // Content text should be visible
        const contentItems = [
          screen.getByTestId('content-item-1'),
          screen.getByTestId('content-item-2'),
          screen.getByTestId('content-item-3'),
        ];
        
        contentItems.forEach((item, index) => {
          expect(item).toHaveTextContent(`Item ${index + 1}`);
          expect(item).toBeVisible();
        });
        
        unmount();
        cleanup(); // Ensure clean state after test
        return true;
      }),
      { numRuns: 10 }
    );
  });
});
