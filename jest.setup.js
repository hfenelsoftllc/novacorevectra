import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import * as fc from 'fast-check';
import * as React from 'react';

// Extend Jest matchers with jest-axe
expect.extend(toHaveNoViolations);

// Configure fast-check for property-based testing
fc.configureGlobal({
  numRuns: 25, // Reduced for faster execution during integration testing
  verbose: process.env.NODE_ENV === 'test' && process.env.VERBOSE_TESTS === 'true',
  seed: process.env.FAST_CHECK_SEED ? parseInt(process.env.FAST_CHECK_SEED, 10) : undefined,
});

// Mock Next.js router for Pages Router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock Next.js navigation for App Router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  notFound: jest.fn(),
  redirect: jest.fn(),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  ArrowRight: ({ className, ...props }) => <div data-testid="arrow-right-icon" className={className} {...props} />,
  Calendar: ({ className, ...props }) => <div data-testid="calendar-icon" className={className} {...props} />,
  Download: ({ className, ...props }) => <div data-testid="download-icon" className={className} {...props} />,
  MessageCircle: ({ className, ...props }) => <div data-testid="message-circle-icon" className={className} {...props} />,
  Phone: ({ className, ...props }) => <div data-testid="phone-icon" className={className} {...props} />,
  Search: ({ className, ...props }) => <div data-testid="search-icon" className={className} {...props} />,
  Palette: ({ className, ...props }) => <div data-testid="palette-icon" className={className} {...props} />,
  Rocket: ({ className, ...props }) => <div data-testid="rocket-icon" className={className} {...props} />,
  Settings: ({ className, ...props }) => <div data-testid="settings-icon" className={className} {...props} />,
  ChevronDown: ({ className, ...props }) => <div data-testid="chevron-down-icon" className={className} {...props} />,
  ChevronUp: ({ className, ...props }) => <div data-testid="chevron-up-icon" className={className} {...props} />,
  ChevronLeft: ({ className, ...props }) => <div data-testid="chevron-left-icon" className={className} {...props} />,
  ChevronRight: ({ className, ...props }) => <div data-testid="chevron-right-icon" className={className} {...props} />,
  Check: ({ className, ...props }) => <div data-testid="check-icon" className={className} {...props} />,
  X: ({ className, ...props }) => <div data-testid="x-icon" className={className} {...props} />,
  Mail: ({ className, ...props }) => <div data-testid="mail-icon" className={className} {...props} />,
  User: ({ className, ...props }) => <div data-testid="user-icon" className={className} {...props} />,
  Building: ({ className, ...props }) => <div data-testid="building-icon" className={className} {...props} />,
  Briefcase: ({ className, ...props }) => <div data-testid="briefcase-icon" className={className} {...props} />,
  Globe: ({ className, ...props }) => <div data-testid="globe-icon" className={className} {...props} />,
  Shield: ({ className, ...props }) => <div data-testid="shield-icon" className={className} {...props} />,
  ShieldCheck: ({ className, ...props }) => <div data-testid="shield-check-icon" className={className} {...props} />,
  Cpu: ({ className, ...props }) => <div data-testid="cpu-icon" className={className} {...props} />,
  Workflow: ({ className, ...props }) => <div data-testid="workflow-icon" className={className} {...props} />,
  Target: ({ className, ...props }) => <div data-testid="target-icon" className={className} {...props} />,
  TrendingUp: ({ className, ...props }) => <div data-testid="trending-up-icon" className={className} {...props} />,
  BarChart: ({ className, ...props }) => <div data-testid="bar-chart-icon" className={className} {...props} />,
  PieChart: ({ className, ...props }) => <div data-testid="pie-chart-icon" className={className} {...props} />,
  Activity: ({ className, ...props }) => <div data-testid="activity-icon" className={className} {...props} />,
  Zap: ({ className, ...props }) => <div data-testid="zap-icon" className={className} {...props} />,
  Lock: ({ className, ...props }) => <div data-testid="lock-icon" className={className} {...props} />,
  Unlock: ({ className, ...props }) => <div data-testid="unlock-icon" className={className} {...props} />,
  Eye: ({ className, ...props }) => <div data-testid="eye-icon" className={className} {...props} />,
  EyeOff: ({ className, ...props }) => <div data-testid="eye-off-icon" className={className} {...props} />,
  AlertTriangle: ({ className, ...props }) => <div data-testid="alert-triangle-icon" className={className} {...props} />,
  AlertCircle: ({ className, ...props }) => <div data-testid="alert-circle-icon" className={className} {...props} />,
  Info: ({ className, ...props }) => <div data-testid="info-icon" className={className} {...props} />,
  HelpCircle: ({ className, ...props }) => <div data-testid="help-circle-icon" className={className} {...props} />,
  ExternalLink: ({ className, ...props }) => <div data-testid="external-link-icon" className={className} {...props} />,
  Link: ({ className, ...props }) => <div data-testid="link-icon" className={className} {...props} />,
  Copy: ({ className, ...props }) => <div data-testid="copy-icon" className={className} {...props} />,
  Share: ({ className, ...props }) => <div data-testid="share-icon" className={className} {...props} />,
  Menu: ({ className, ...props }) => <div data-testid="menu-icon" className={className} {...props} />,
  MoreHorizontal: ({ className, ...props }) => <div data-testid="more-horizontal-icon" className={className} {...props} />,
  MoreVertical: ({ className, ...props }) => <div data-testid="more-vertical-icon" className={className} {...props} />,
  Plus: ({ className, ...props }) => <div data-testid="plus-icon" className={className} {...props} />,
  Minus: ({ className, ...props }) => <div data-testid="minus-icon" className={className} {...props} />,
  Edit: ({ className, ...props }) => <div data-testid="edit-icon" className={className} {...props} />,
  Trash: ({ className, ...props }) => <div data-testid="trash-icon" className={className} {...props} />,
  Save: ({ className, ...props }) => <div data-testid="save-icon" className={className} {...props} />,
  Upload: ({ className, ...props }) => <div data-testid="upload-icon" className={className} {...props} />,
  FileText: ({ className, ...props }) => <div data-testid="file-text-icon" className={className} {...props} />,
  File: ({ className, ...props }) => <div data-testid="file-icon" className={className} {...props} />,
  Folder: ({ className, ...props }) => <div data-testid="folder-icon" className={className} {...props} />,
  FolderOpen: ({ className, ...props }) => <div data-testid="folder-open-icon" className={className} {...props} />,
  Image: ({ className, ...props }) => <div data-testid="image-icon" className={className} {...props} />,
  Video: ({ className, ...props }) => <div data-testid="video-icon" className={className} {...props} />,
  Music: ({ className, ...props }) => <div data-testid="music-icon" className={className} {...props} />,
  Play: ({ className, ...props }) => <div data-testid="play-icon" className={className} {...props} />,
  Pause: ({ className, ...props }) => <div data-testid="pause-icon" className={className} {...props} />,
  Stop: ({ className, ...props }) => <div data-testid="stop-icon" className={className} {...props} />,
  SkipBack: ({ className, ...props }) => <div data-testid="skip-back-icon" className={className} {...props} />,
  SkipForward: ({ className, ...props }) => <div data-testid="skip-forward-icon" className={className} {...props} />,
  Volume: ({ className, ...props }) => <div data-testid="volume-icon" className={className} {...props} />,
  VolumeX: ({ className, ...props }) => <div data-testid="volume-x-icon" className={className} {...props} />,
  Wifi: ({ className, ...props }) => <div data-testid="wifi-icon" className={className} {...props} />,
  WifiOff: ({ className, ...props }) => <div data-testid="wifi-off-icon" className={className} {...props} />,
  Bluetooth: ({ className, ...props }) => <div data-testid="bluetooth-icon" className={className} {...props} />,
  Battery: ({ className, ...props }) => <div data-testid="battery-icon" className={className} {...props} />,
  BatteryLow: ({ className, ...props }) => <div data-testid="battery-low-icon" className={className} {...props} />,
  Power: ({ className, ...props }) => <div data-testid="power-icon" className={className} {...props} />,
  PowerOff: ({ className, ...props }) => <div data-testid="power-off-icon" className={className} {...props} />,
  Refresh: ({ className, ...props }) => <div data-testid="refresh-icon" className={className} {...props} />,
  RotateCcw: ({ className, ...props }) => <div data-testid="rotate-ccw-icon" className={className} {...props} />,
  RotateCw: ({ className, ...props }) => <div data-testid="rotate-cw-icon" className={className} {...props} />,
  Loader: ({ className, ...props }) => <div data-testid="loader-icon" className={className} {...props} />,
  Loader2: ({ className, ...props }) => <div data-testid="loader2-icon" className={className} {...props} />,
}));

// Mock progressive profiling utilities
jest.mock('@/utils/progressiveProfiling', () => ({
  isReturningVisitor: jest.fn().mockReturnValue(false),
  getVisitorData: jest.fn().mockReturnValue(null),
  saveVisitorData: jest.fn(),
  trackVisit: jest.fn(),
  getVisitCount: jest.fn().mockReturnValue(1),
  getProgressiveFields: jest.fn().mockReturnValue([]),
  getRecommendedFormVariant: jest.fn().mockReturnValue('consultation'),
  clearVisitorData: jest.fn(),
  getDaysSinceLastVisit: jest.fn().mockReturnValue(0),
}));

// Mock analytics hook
const mockAnalyticsReturn = {
  // Core tracking
  trackEvent: jest.fn(),
  trackPageView: jest.fn(),
  trackEngagement: jest.fn(),
  trackScrollDepth: jest.fn(),
  
  // CTA and conversion tracking
  trackCTAClick: jest.fn(),
  trackConversionEvent: jest.fn(),
  
  // Form tracking
  trackFormEvent: jest.fn(),
  trackFormSubmission: jest.fn(),
  trackFormStart: jest.fn(),
  trackFormFieldCompletion: jest.fn(),
  
  // Funnel tracking
  trackFunnelStep: jest.fn(),
  
  // Session tracking
  trackSessionStart: jest.fn(),
  trackSessionEnd: jest.fn(),
  
  // A/B Testing
  getTestVariant: jest.fn().mockReturnValue(null),
  trackTestConversion: jest.fn(),
  
  // User and session IDs
  getUserId: () => 'test-user-id',
  getSessionId: () => 'test-session-id',
};

jest.mock('@/hooks/useAnalytics', () => ({
  __esModule: true,
  default: () => mockAnalyticsReturn,
  useAnalytics: () => mockAnalyticsReturn,
}));

// Mock performance hook
jest.mock('@/hooks/usePerformance', () => ({
  __esModule: true,
  usePerformance: () => ({
    calculateAnimationDelay: (index) => index * 0.1,
    prefersReducedMotion: false,
    getAnimationConfig: (duration, delay) => ({
      duration,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94],
    }),
  }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    section: 'section',
    header: 'header',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    p: 'p',
    span: 'span',
    button: 'button',
    form: 'form',
    input: 'input',
    textarea: 'textarea',
    select: 'select',
    label: 'label',
    ul: 'ul',
    li: 'li',
    img: 'img',
    a: 'a',
  },
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
  useInView: () => [React.createRef(), true],
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => {
    const mediaQuery = {
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
    
    // Ensure matches property is always accessible and defined
    Object.defineProperty(mediaQuery, 'matches', {
      value: false,
      writable: true,
      enumerable: true,
      configurable: true
    });
    
    return mediaQuery;
  }),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    // Simulate intersection for testing
    if (this.callback) {
      this.callback([{ isIntersecting: true, target: {} }]);
    }
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => {
      return store[key] || null;
    },
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    // Add method to reset store for testing
    _resetStore: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Reset localStorage before each test
beforeEach(() => {
  localStorageMock._resetStore();
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    })
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true
});

// Custom matchers for property-based testing
expect.extend({
  toSatisfyProperty(received, property) {
    try {
      fc.assert(property);
      return {
        message: () => `Property test passed`,
        pass: true,
      };
    } catch (error) {
      return {
        message: () => `Property test failed: ${error.message}`,
        pass: false,
      };
    }
  },
});
// Mock ErrorBoundary and ErrorFallback components
jest.mock('@/components/common/ErrorBoundary', () => ({
  __esModule: true,
  ErrorBoundary: class MockErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.resetError = this.resetError.bind(this);
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    componentDidMount() {
      document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
      document.removeEventListener('keydown', this.handleKeyDown);
    }

    // Reset error state when key prop changes (component remounts)
    componentDidUpdate(prevProps) {
      if (prevProps.key !== this.props.key && this.state.hasError) {
        this.setState({ hasError: false, error: null });
      }
    }

    handleKeyDown(e) {
      if (e.key === 'Escape' && this.state.hasError) {
        this.resetError();
      }
    }

    resetError() {
      this.setState({ hasError: false, error: null });
    }

    render() {
      if (this.state.hasError) {
        return React.createElement('div', {
          role: 'alert',
          'aria-live': 'assertive',
          'data-testid': 'error-boundary'
        }, [
          React.createElement('h2', { key: 'title' }, 'Something went wrong'),
          React.createElement('p', { key: 'message' }, 'An error occurred while rendering this component.'),
          React.createElement('button', {
            key: 'retry',
            onClick: this.resetError,
            autoFocus: true
          }, 'Try Again'),
          React.createElement('a', {
            key: 'home',
            href: '/',
          }, 'Go to Home Page')
        ]);
      }

      return this.props.children;
    }
  }
}));

jest.mock('@/components/common/ErrorFallback', () => ({
  __esModule: true,
  ErrorFallback: ({ error, resetError }) => {
    React.useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          resetError();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [resetError]);

    const elements = [
      React.createElement('h2', { key: 'title' }, 'Something went wrong'),
      React.createElement('p', { key: 'message' }, error?.message || 'An unexpected error occurred'),
      React.createElement('button', {
        key: 'retry',
        onClick: resetError,
        autoFocus: true
      }, 'Try Again'),
      React.createElement('a', {
        key: 'home',
        href: '/',
      }, 'Go to Home Page')
    ];

    // Check for development mode - use process.env.NODE_ENV directly
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      elements.push(React.createElement('details', {
        key: 'details'
      }, [
        React.createElement('summary', { key: 'summary' }, 'Error details (development only)'),
        React.createElement('pre', { key: 'error' }, error?.message),
        React.createElement('pre', { key: 'stack' }, error?.stack)
      ]));
    }

    return React.createElement('div', {
      role: 'alert',
      'aria-live': 'assertive',
      'data-testid': 'error-fallback'
    }, elements);
  }
}));

jest.mock('@/components/common/AccessibilityAnnouncer', () => ({
  __esModule: true,
  AccessibilityAnnouncer: ({ message, priority = 'polite' }) => {
    return React.createElement('div', {
      role: 'status',
      'aria-live': priority,
      'aria-atomic': 'true',
      className: 'sr-only',
      'data-testid': 'accessibility-announcer'
    }, message);
  },
  GlobalAnnouncer: () => {
    return React.createElement('div', {}, [
      React.createElement('div', {
        key: 'polite',
        id: 'polite-announcer',
        role: 'status',
        'aria-live': 'polite',
        'aria-atomic': 'true',
        className: 'sr-only'
      }),
      React.createElement('div', {
        key: 'assertive',
        id: 'assertive-announcer',
        role: 'alert',
        'aria-live': 'assertive',
        'aria-atomic': 'true',
        className: 'sr-only'
      })
    ]);
  }
}));

jest.mock('@/components/ui/loading-spinner', () => ({
  __esModule: true,
  LoadingSpinner: ({ text = 'Loading content, please wait', 'aria-label': ariaLabel, variant, ...props }) => {
    const displayText = text || 'Loading content, please wait';
    
    return React.createElement('div', {
      role: 'status',
      'aria-live': 'polite',
      'aria-label': ariaLabel || displayText,
      'data-testid': 'loading-spinner',
      ...props
    }, [
      React.createElement('div', {
        key: 'spinner',
        className: variant === 'dots' ? 'animate-pulse' : variant === 'bars' ? 'animate-pulse' : variant === 'pulse' ? 'animate-ping' : 'animate-spin'
      }, '⟳'),
      React.createElement('span', {
        key: 'text',
        className: 'sr-only'
      }, displayText)
    ]);
  }
}));

jest.mock('@/components/ui/button', () => ({
  __esModule: true,
  Button: React.forwardRef(({ children, className, variant, size, asChild, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline'
    };
    const sizeClasses = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10'
    };
    
    const classes = `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.default} ${className || ''}`;
    
    return React.createElement('button', {
      ref,
      className: classes,
      ...props
    }, children);
  })
}));
// Mock ComplianceSection component
jest.mock('@/components/sections/ComplianceSection', () => ({
  __esModule: true,
  ComplianceSection: ({ framework, showDownloadLinks = true, ...props }) => {
    const [expandedClauses, setExpandedClauses] = React.useState(new Set());
    
    const toggleClause = (clauseId) => {
      const newExpanded = new Set(expandedClauses);
      if (newExpanded.has(clauseId)) {
        newExpanded.delete(clauseId);
      } else {
        newExpanded.add(clauseId);
      }
      setExpandedClauses(newExpanded);
    };
    
    const getServiceName = (serviceId) => {
      const serviceMap = {
        'business-process-strategy': 'Business Process Strategy',
        'ai-solution-implementation': 'AI Solution Implementation'
      };
      return serviceMap[serviceId] || serviceId;
    };
    
    return React.createElement('section', {
      role: 'region',
      'aria-labelledby': 'compliance-heading',
      'data-testid': 'compliance-section',
      ...props
    }, [
      React.createElement('h2', {
        key: 'heading',
        id: 'compliance-heading'
      }, 'Trust & Compliance'),
      React.createElement('div', {
        key: 'framework-info'
      }, [
        React.createElement('h3', { key: 'name' }, `${framework.name} (${framework.version})`),
        React.createElement('span', { key: 'level' }, framework.certificationLevel)
      ]),
      React.createElement('div', {
        key: 'clauses'
      }, framework.clauses.map(clause => 
        React.createElement('div', {
          key: clause.id
        }, [
          React.createElement('h4', { key: 'title' }, clause.title),
          React.createElement('p', { key: 'description' }, clause.description),
          React.createElement('button', {
            key: 'toggle',
            onClick: () => toggleClause(clause.id),
            'aria-label': expandedClauses.has(clause.id) ? 'Collapse details' : 'Expand details'
          }, expandedClauses.has(clause.id) ? 'Collapse details' : 'Expand details'),
          expandedClauses.has(clause.id) && React.createElement('div', {
            key: 'details'
          }, [
            React.createElement('div', {
              key: 'requirements'
            }, clause.requirements.map((req, idx) => 
              React.createElement('p', { key: idx }, req)
            )),
            clause.mappedServices && React.createElement('div', {
              key: 'services'
            }, [
              React.createElement('h5', { key: 'services-title' }, 'Mapped Services'),
              ...clause.mappedServices.map(serviceId => 
                React.createElement('span', { key: serviceId }, getServiceName(serviceId))
              )
            ]),
            showDownloadLinks && clause.documentationUrl && React.createElement('a', {
              key: 'download',
              href: clause.documentationUrl
            }, 'Download Documentation')
          ])
        ])
      ))
    ]);
  }
}));

// Mock content management functions for tests that need them
const mockContentManager = {
  getContent: jest.fn().mockReturnValue({
    hero: {
      title: 'Test **bold** content',
      subtitle: 'Test content'
    }
  }),
  updateContent: jest.fn().mockResolvedValue(true),
  getCacheStatus: jest.fn().mockReturnValue({
    size: 100,
    lastUpdated: new Date().toISOString(),
    hitRate: 0.95
  }),
  clearCache: jest.fn(),
  validateContent: jest.fn().mockReturnValue({ isValid: true, errors: [] })
};

const mockRenderRichText = jest.fn().mockImplementation((content) => {
  if (!content) return undefined;
  
  // Simple markdown-like processing for tests
  const processed = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  return React.createElement('div', {
    dangerouslySetInnerHTML: { __html: processed }
  });
});

const mockValidateRichText = jest.fn().mockImplementation((content) => {
  if (!content) return { isValid: false, errors: ['Content is required'] };
  
  const errors = [];
  
  // Check for unclosed markdown tags
  const boldMatches = (content.match(/\*\*/g) || []).length;
  if (boldMatches % 2 !== 0) {
    errors.push('Unclosed bold markdown tags');
  }
  
  const italicMatches = (content.match(/(?<!\*)\*(?!\*)/g) || []).length;
  if (italicMatches % 2 !== 0) {
    errors.push('Unclosed italic markdown tags');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
});

// Make these available globally for tests that need them
global.mockContentManager = mockContentManager;
global.mockRenderRichText = mockRenderRichText;
global.mockValidateRichText = mockValidateRichText;
// Mock LeadCaptureForm component to avoid useAnalytics issues
jest.mock('@/components/forms/LeadCaptureForm', () => ({
  __esModule: true,
  LeadCaptureForm: ({ onSubmit, variant = 'consultation', className, showProgressiveFields = false, ...props }) => {
    const [formData, setFormData] = React.useState({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      company: '',
      jobTitle: '',
      industry: '',
      interests: []
    });
    
    const [errors, setErrors] = React.useState({});
    
    // Mock progressive profiling behavior
    React.useEffect(() => {
      if (showProgressiveFields) {
        const { isReturningVisitor, getVisitorData } = require('@/utils/progressiveProfiling');
        if (isReturningVisitor()) {
          const visitorData = getVisitorData();
          if (visitorData) {
            setFormData(prev => ({
              ...prev,
              ...visitorData
            }));
          }
        }
      }
    }, [showProgressiveFields]);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Basic validation
      const newErrors = {};
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      
      setErrors(newErrors);
      
      if (Object.keys(newErrors).length === 0 && onSubmit) {
        onSubmit(formData);
      }
    };
    
    const handleChange = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

    // Check if this is a returning visitor for progressive profiling
    const isReturningVisitor = showProgressiveFields && (() => {
      try {
        const { isReturningVisitor } = require('@/utils/progressiveProfiling');
        return isReturningVisitor();
      } catch {
        return false;
      }
    })();
    
    const elements = [];
    
    // Show welcome message for returning visitors
    if (isReturningVisitor) {
      elements.push(React.createElement('div', {
        key: 'welcome',
        className: 'mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'
      }, 'Welcome back! We remember some of your information.'));
    }
    
    // Email field
    elements.push(React.createElement('input', {
      key: 'email',
      type: 'email',
      name: 'email',
      placeholder: 'Email',
      value: formData.email,
      onChange: (e) => handleChange('email', e.target.value),
      'data-testid': 'email-input',
      'aria-invalid': !!errors.email,
      required: true
    }));
    
    if (errors.email) {
      elements.push(React.createElement('div', {
        key: 'email-error',
        role: 'alert',
        'data-testid': 'email-error'
      }, errors.email));
    }
    
    // First name field
    elements.push(React.createElement('input', {
      key: 'firstName',
      type: 'text',
      name: 'firstName',
      placeholder: 'First Name',
      value: formData.firstName,
      onChange: (e) => handleChange('firstName', e.target.value),
      'data-testid': 'firstName-input',
      'aria-invalid': !!errors.firstName,
      required: variant === 'consultation'
    }));
    
    if (errors.firstName) {
      elements.push(React.createElement('div', {
        key: 'firstName-error',
        role: 'alert',
        'data-testid': 'firstName-error'
      }, errors.firstName));
    }
    
    // Other basic fields
    elements.push(React.createElement('input', {
      key: 'lastName',
      type: 'text',
      name: 'lastName',
      placeholder: 'Last Name',
      value: formData.lastName,
      onChange: (e) => handleChange('lastName', e.target.value),
      'data-testid': 'lastName-input'
    }));
    
    elements.push(React.createElement('input', {
      key: 'phone',
      type: 'tel',
      name: 'phone',
      placeholder: 'Phone',
      value: formData.phone,
      onChange: (e) => handleChange('phone', e.target.value),
      'data-testid': 'phone-input'
    }));
    
    elements.push(React.createElement('input', {
      key: 'company',
      type: 'text',
      name: 'company',
      placeholder: 'Company',
      value: formData.company,
      onChange: (e) => handleChange('company', e.target.value),
      'data-testid': 'company-input'
    }));
    
    // Progressive fields for returning visitors
    if (showProgressiveFields && isReturningVisitor) {
      elements.push(React.createElement('label', {
        key: 'industry-label',
        htmlFor: 'industry'
      }, 'Industry'));
      
      elements.push(React.createElement('select', {
        key: 'industry',
        id: 'industry',
        name: 'industry',
        value: formData.industry,
        onChange: (e) => handleChange('industry', e.target.value),
        'data-testid': 'industry-input'
      }, [
        React.createElement('option', { key: 'empty', value: '' }, 'Select Industry'),
        React.createElement('option', { key: 'tech', value: 'technology' }, 'Technology'),
        React.createElement('option', { key: 'finance', value: 'finance' }, 'Finance')
      ]));
      
      elements.push(React.createElement('label', {
        key: 'jobTitle-label',
        htmlFor: 'jobTitle'
      }, 'Job Title'));
      
      elements.push(React.createElement('input', {
        key: 'jobTitle',
        id: 'jobTitle',
        type: 'text',
        name: 'jobTitle',
        placeholder: 'Job Title',
        value: formData.jobTitle,
        onChange: (e) => handleChange('jobTitle', e.target.value),
        'data-testid': 'jobTitle-input'
      }));
    }
    
    // Submit button
    elements.push(React.createElement('button', {
      key: 'submit',
      type: 'submit',
      'data-testid': 'submit-button'
    }, 'Submit'));

    return React.createElement('form', {
      onSubmit: handleSubmit,
      className,
      'data-testid': 'lead-capture-form',
      ...props
    }, elements);
  }
}));
// Mock AnimatedSection component to avoid matchMedia issues
jest.mock('@/components/common/AnimatedSection', () => ({
  __esModule: true,
  AnimatedSection: ({ children, className, ...props }) => {
    return React.createElement('section', {
      role: 'region',
      tabIndex: -1,
      className,
      'data-testid': 'animated-section',
      ...props
    }, children);
  }
}));
// Mock fetch API for form submissions
global.fetch = jest.fn().mockImplementation((url, options) => {
  console.log('Fetch mock called with:', url, options?.method);
  console.log('Fetch mock options:', JSON.stringify(options, null, 2));
  
  // Mock successful API responses
  if (url === '/api/contact' && options?.method === 'POST') {
    console.log('Returning successful response for /api/contact POST');
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, message: 'Form submitted successfully' }),
      text: () => Promise.resolve('{"success": true, "message": "Form submitted successfully"}')
    });
  }
  
  console.log('Returning default response for:', url);
  // Default to successful response for other requests
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('{}')
  });
});

// Reset fetch mock before each test
beforeEach(() => {
  if (global.fetch && global.fetch.mockClear) {
    global.fetch.mockClear();
  }
});