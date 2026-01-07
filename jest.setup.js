import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import * as fc from 'fast-check';

// Extend Jest matchers with jest-axe
expect.extend(toHaveNoViolations);

// Configure fast-check for property-based testing
fc.configureGlobal({
  numRuns: 25, // Reduced for faster execution during integration testing
  verbose: process.env.NODE_ENV === 'test' && process.env.VERBOSE_TESTS === 'true',
  seed: process.env.FAST_CHECK_SEED ? parseInt(process.env.FAST_CHECK_SEED, 10) : undefined,
});

// Mock framer-motion to avoid issues in tests
jest.mock('framer-motion', () => {
  const filterMotionProps = (props) => {
    const {
      initial,
      animate,
      exit,
      whileInView,
      whileHover,
      whileTap,
      whileFocus,
      whileDrag,
      drag,
      dragConstraints,
      dragElastic,
      dragMomentum,
      dragPropagation,
      dragSnapToOrigin,
      dragTransition,
      layout,
      layoutId,
      transition,
      variants,
      viewport,
      onAnimationStart,
      onAnimationComplete,
      onUpdate,
      onDrag,
      onDragStart,
      onDragEnd,
      onDirectionLock,
      onHoverStart,
      onHoverEnd,
      onTap,
      onTapStart,
      onTapCancel,
      onPan,
      onPanStart,
      onPanEnd,
      ...filteredProps
    } = props;
    return filteredProps;
  };

  return {
    motion: {
      div: ({ children, ...props }) => <div {...filterMotionProps(props)}>{children}</div>,
      h1: ({ children, ...props }) => <h1 {...filterMotionProps(props)}>{children}</h1>,
      h2: ({ children, ...props }) => <h2 {...filterMotionProps(props)}>{children}</h2>,
      h3: ({ children, ...props }) => <h3 {...filterMotionProps(props)}>{children}</h3>,
      h4: ({ children, ...props }) => <h4 {...filterMotionProps(props)}>{children}</h4>,
      section: ({ children, ...props }) => (
        <section {...filterMotionProps(props)}>{children}</section>
      ),
      article: ({ children, ...props }) => (
        <article {...filterMotionProps(props)}>{children}</article>
      ),
      header: ({ children, ...props }) => (
        <header {...filterMotionProps(props)}>{children}</header>
      ),
      footer: ({ children, ...props }) => (
        <footer {...filterMotionProps(props)}>{children}</footer>
      ),
      nav: ({ children, ...props }) => <nav {...filterMotionProps(props)}>{children}</nav>,
      main: ({ children, ...props }) => <main {...filterMotionProps(props)}>{children}</main>,
      button: ({ children, ...props }) => <button {...filterMotionProps(props)}>{children}</button>,
      a: ({ children, ...props }) => <a {...filterMotionProps(props)}>{children}</a>,
      span: ({ children, ...props }) => <span {...filterMotionProps(props)}>{children}</span>,
      p: ({ children, ...props }) => <p {...filterMotionProps(props)}>{children}</p>,
    },
    AnimatePresence: ({ children }) => children,
    useAnimation: () => ({
      start: jest.fn(),
      stop: jest.fn(),
      set: jest.fn(),
    }),
    useInView: () => [jest.fn(), true],
  };
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
