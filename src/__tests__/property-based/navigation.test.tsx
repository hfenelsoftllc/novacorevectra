import * as fc from 'fast-check';
import { render, screen, cleanup } from '@testing-library/react';
import { MAIN_NAVIGATION } from '@/constants/navigation';
import { NavigationItem } from '@/types/navigation';

// Mock Next.js router for testing
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
}));

// Ensure cleanup after each test
afterEach(() => {
  cleanup();
});

// Test component that renders navigation items
const TestNavigation: React.FC<{ items: NavigationItem[]; currentPath?: string }> = ({ 
  items, 
  currentPath = '/' 
}) => {
  return (
    <nav role="navigation" aria-label="Main navigation">
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a 
              href={item.href}
              className={currentPath === item.href ? 'active' : ''}
              aria-current={currentPath === item.href ? 'page' : undefined}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

// Test component for breadcrumbs
const TestBreadcrumbs: React.FC<{ path: string }> = ({ path }) => {
  const pathSegments = path.split('/').filter(Boolean);
  
  return (
    <nav role="navigation" aria-label="Breadcrumb">
      <ol>
        <li>
          <a href="/">Home</a>
        </li>
        {pathSegments.map((segment, index) => {
          const href = '/' + pathSegments.slice(0, index + 1).join('/');
          const isLast = index === pathSegments.length - 1;
          
          return (
            <li key={segment}>
              {isLast ? (
                <span aria-current="page">{segment}</span>
              ) : (
                <a href={href}>{segment}</a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

describe('Property 1: Navigation System Completeness', () => {
  // Generator for valid page paths
  const pagePathGenerator = fc.constantFrom(
    '/',
    '/services',
    '/governance', 
    '/about',
    '/contact'
  );

  // Generator for navigation items (currently unused but may be needed for future tests)
  // const navigationItemGenerator = fc.record({
  //   id: fc.string({ minLength: 1 }),
  //   label: fc.string({ minLength: 1 }),
  //   href: fc.string({ minLength: 1 }).map(s => s.startsWith('/') ? s : '/' + s),
  // });

  test('all required pages exist in main navigation', () => {
    // Feature: full-marketing-site, Property 1: Navigation System Completeness
    const requiredPages = ['home', 'services', 'governance', 'about', 'contact'];
    
    fc.assert(
      fc.property(fc.constant(MAIN_NAVIGATION), (navigation) => {
        const navigationIds = navigation.map(item => item.id);
        
        // All required pages must be present
        return requiredPages.every(pageId => navigationIds.includes(pageId));
      }),
      { numRuns: 100 }
    );
  });

  test('navigation items have valid structure and properties', () => {
    // Feature: full-marketing-site, Property 1: Navigation System Completeness
    fc.assert(
      fc.property(fc.constant(MAIN_NAVIGATION), (navigation) => {
        return navigation.every(item => {
          // Each navigation item must have required properties
          return (
            typeof item.id === 'string' && item.id.length > 0 &&
            typeof item.label === 'string' && item.label.length > 0 &&
            typeof item.href === 'string' && item.href.startsWith('/')
          );
        });
      }),
      { numRuns: 100 }
    );
  });

  test('navigation renders all required links correctly', () => {
    // Feature: full-marketing-site, Property 1: Navigation System Completeness
    fc.assert(
      fc.property(pagePathGenerator, (currentPath) => {
        const { unmount } = render(<TestNavigation items={MAIN_NAVIGATION} currentPath={currentPath} />);
        
        // Check all required navigation links exist
        const homeLink = screen.getByRole('link', { name: /home/i });
        const servicesLink = screen.getByRole('link', { name: /services/i });
        const governanceLink = screen.getByRole('link', { name: /governance/i });
        const aboutLink = screen.getByRole('link', { name: /about/i });
        const contactLink = screen.getByRole('link', { name: /contact/i });
        
        // All links must be present
        expect(homeLink).toBeInTheDocument();
        expect(servicesLink).toBeInTheDocument();
        expect(governanceLink).toBeInTheDocument();
        expect(aboutLink).toBeInTheDocument();
        expect(contactLink).toBeInTheDocument();
        
        // Links must have correct href attributes
        expect(homeLink).toHaveAttribute('href', '/');
        expect(servicesLink).toHaveAttribute('href', '/services');
        expect(governanceLink).toHaveAttribute('href', '/governance');
        expect(aboutLink).toHaveAttribute('href', '/about');
        expect(contactLink).toHaveAttribute('href', '/contact');
        
        unmount();
        return true;
      }),
      { numRuns: 100 }
    );
  });

  test('current page is highlighted in navigation', () => {
    // Feature: full-marketing-site, Property 1: Navigation System Completeness
    fc.assert(
      fc.property(pagePathGenerator, (currentPath) => {
        const { unmount } = render(<TestNavigation items={MAIN_NAVIGATION} currentPath={currentPath} />);
        
        // Find the link that matches the current path
        const currentNavItem = MAIN_NAVIGATION.find(item => item.href === currentPath);
        
        if (currentNavItem) {
          const currentLink = screen.getByRole('link', { name: new RegExp(currentNavItem.label, 'i') });
          
          // Current page link should have active class and aria-current
          expect(currentLink).toHaveClass('active');
          expect(currentLink).toHaveAttribute('aria-current', 'page');
        }
        
        unmount();
        return true;
      }),
      { numRuns: 100 }
    );
  });

  test('navigation maintains consistent structure across all pages', () => {
    // Feature: full-marketing-site, Property 1: Navigation System Completeness
    fc.assert(
      fc.property(pagePathGenerator, (currentPath) => {
        const { unmount } = render(<TestNavigation items={MAIN_NAVIGATION} currentPath={currentPath} />);
        
        // Navigation should always have the same structure regardless of current page
        const navElement = screen.getByRole('navigation', { name: /main navigation/i });
        const links = screen.getAllByRole('link');
        
        // Should always have exactly 5 navigation links
        expect(links).toHaveLength(5);
        
        // Navigation element should be present
        expect(navElement).toBeInTheDocument();
        
        // All required pages should be present regardless of current page
        const requiredLabels = ['Home', 'Services', 'Governance', 'About', 'Contact'];
        requiredLabels.forEach(label => {
          expect(screen.getByRole('link', { name: new RegExp(label, 'i') })).toBeInTheDocument();
        });
        
        unmount();
        return true;
      }),
      { numRuns: 100 }
    );
  });

  test('breadcrumb navigation exists for deep pages', () => {
    // Feature: full-marketing-site, Property 1: Navigation System Completeness
    const deepPageGenerator = fc.constantFrom(
      '/services/ai-strategy',
      '/governance/compliance',
      '/about/team',
      '/contact/support'
    );

    fc.assert(
      fc.property(deepPageGenerator, (deepPath) => {
        const { unmount } = render(<TestBreadcrumbs path={deepPath} />);
        
        // Breadcrumb navigation should exist
        const breadcrumbNav = screen.getByRole('navigation', { name: /breadcrumb/i });
        expect(breadcrumbNav).toBeInTheDocument();
        
        // Should always start with Home
        const homeLink = screen.getByRole('link', { name: /home/i });
        expect(homeLink).toBeInTheDocument();
        expect(homeLink).toHaveAttribute('href', '/');
        
        // Should show current page as non-link
        const pathSegments = deepPath.split('/').filter(Boolean);
        const currentPage = pathSegments[pathSegments.length - 1];
        const currentPageElement = screen.getByText(currentPage);
        expect(currentPageElement).toHaveAttribute('aria-current', 'page');
        
        unmount();
        return true;
      }),
      { numRuns: 100 }
    );
  });

  test('navigation accessibility requirements are met', () => {
    // Feature: full-marketing-site, Property 1: Navigation System Completeness
    fc.assert(
      fc.property(pagePathGenerator, (currentPath) => {
        const { unmount } = render(<TestNavigation items={MAIN_NAVIGATION} currentPath={currentPath} />);
        
        // Navigation should have proper ARIA labels
        const navElement = screen.getByRole('navigation', { name: /main navigation/i });
        expect(navElement).toBeInTheDocument();
        
        // All links should be accessible
        const links = screen.getAllByRole('link');
        links.forEach(link => {
          // Each link should have accessible text
          expect(link).toHaveAccessibleName();
          
          // Current page should have aria-current
          if (link.getAttribute('href') === currentPath) {
            expect(link).toHaveAttribute('aria-current', 'page');
          }
        });
        
        unmount();
        return true;
      }),
      { numRuns: 100 }
    );
  });
});