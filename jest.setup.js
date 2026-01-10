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

// Mock calendar service
jest.mock('@/services/calendarService', () => ({
  calendarService: {
    createConsultationEvent: jest.fn().mockResolvedValue(true),
    getAvailableTimeSlots: jest.fn().mockResolvedValue(['09:00', '10:00', '14:00', '15:00']),
    isTimeSlotAvailable: jest.fn().mockResolvedValue(true),
    cancelEvent: jest.fn().mockResolvedValue(true),
    rescheduleEvent: jest.fn().mockResolvedValue(true),
    getBusinessDaysBetween: jest.fn().mockReturnValue([]),
  },
  CalendarService: {
    getInstance: jest.fn().mockReturnValue({
      createConsultationEvent: jest.fn().mockResolvedValue(true),
      getAvailableTimeSlots: jest.fn().mockResolvedValue(['09:00', '10:00', '14:00', '15:00']),
      isTimeSlotAvailable: jest.fn().mockResolvedValue(true),
      cancelEvent: jest.fn().mockResolvedValue(true),
      rescheduleEvent: jest.fn().mockResolvedValue(true),
      getBusinessDaysBetween: jest.fn().mockReturnValue([]),
    }),
  },
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
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
