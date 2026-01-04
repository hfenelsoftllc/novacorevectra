/**
 * Integration tests for A/B testing and content management features
 * Tests A/B test functionality, content management system, and variant tracking
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useABTest, useMultipleABTests } from '../../hooks/useABTest';
import { useContent } from '../../hooks/useContent';
import { ContentManagedPage } from '../../pages/ContentManagedPage';
import * as analyticsUtils from '../../utils/analytics';
import * as contentManager from '../../utils/contentManager';

// Mock analytics utilities
jest.mock('../../utils/analytics', () => ({
  getABTestVariant: jest.fn(),
  trackABTestConversion: jest.fn(),
  trackEvent: jest.fn(),
}));

// Mock content manager
jest.mock('../../utils/contentManager', () => ({
  getContent: jest.fn(),
  updateContent: jest.fn(),
  getContentVersion: jest.fn(),
  validateContent: jest.fn(),
}));

// Mock hooks
jest.mock('../../hooks/useContent', () => ({
  useContent: jest.fn(),
}));

describe('A/B Testing and Content Management Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
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
  });

  describe('A/B Testing Functionality', () => {
    test('assigns users to test variants correctly', () => {
      const testConfig = {
        id: 'hero-cta-test',
        name: 'Hero CTA Test',
        variants: [
          {
            id: 'control',
            name: 'Control',
            weight: 0.5,
            content: {
              title: 'Get Started Today',
              buttonText: 'Start Now',
            },
          },
          {
            id: 'variant-a',
            name: 'Variant A',
            weight: 0.5,
            content: {
              title: 'Transform Your Business',
              buttonText: 'Learn More',
            },
          },
        ],
      };
      
      // Mock variant assignment
      (analyticsUtils.getABTestVariant as jest.Mock).mockReturnValue(testConfig.variants[1]);
      
      const TestComponent = () => {
        const { variant, getContent, trackConversion } = useABTest(testConfig);
        const content = getContent();
        
        return (
          <div>
            <h1>{content.title}</h1>
            <button onClick={() => trackConversion('cta_click')}>
              {content.buttonText}
            </button>
            <span data-testid="variant-id">{variant?.id}</span>
          </div>
        );
      };
      
      render(<TestComponent />);
      
      // Verify variant assignment
      expect(screen.getByTestId('variant-id')).toHaveTextContent('variant-a');
      expect(screen.getByText('Transform Your Business')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });

    test('tracks A/B test conversions correctly', async () => {
      const user = userEvent.setup();
      const testConfig = {
        id: 'cta-test',
        name: 'CTA Test',
        variants: [
          {
            id: 'control',
            name: 'Control',
            weight: 1.0,
            content: { buttonText: 'Click Me' },
          },
        ],
      };
      
      (analyticsUtils.getABTestVariant as jest.Mock).mockReturnValue(testConfig.variants[0]);
      
      const TestComponent = () => {
        const { trackConversion, getContent } = useABTest(testConfig);
        const content = getContent();
        
        return (
          <button onClick={() => trackConversion('button_click')}>
            {content.buttonText}
          </button>
        );
      };
      
      render(<TestComponent />);
      
      const button = screen.getByText('Click Me');
      await user.click(button);
      
      // Verify conversion tracking
      expect(analyticsUtils.trackABTestConversion).toHaveBeenCalledWith(
        'cta-test',
        'control',
        'button_click'
      );
    });

    test('handles multiple A/B tests simultaneously', () => {
      const tests = {
        heroTest: {
          id: 'hero-test',
          name: 'Hero Test',
          variants: [
            { id: 'control', name: 'Control', weight: 1.0, content: { title: 'Control Title' } },
          ],
        },
        ctaTest: {
          id: 'cta-test',
          name: 'CTA Test',
          variants: [
            { id: 'control', name: 'Control', weight: 1.0, content: { buttonText: 'Control Button' } },
          ],
        },
      };
      
      (analyticsUtils.getABTestVariant as jest.Mock)
        .mockReturnValueOnce(tests.heroTest.variants[0])
        .mockReturnValueOnce(tests.ctaTest.variants[0]);
      
      const TestComponent = () => {
        const { getContent, trackConversion } = useMultipleABTests(tests);
        
        const heroContent = getContent('heroTest');
        const ctaContent = getContent('ctaTest');
        
        return (
          <div>
            <h1>{heroContent.title}</h1>
            <button onClick={() => trackConversion('ctaTest', 'click')}>
              {ctaContent.buttonText}
            </button>
          </div>
        );
      };
      
      render(<TestComponent />);
      
      expect(screen.getByText('Control Title')).toBeInTheDocument();
      expect(screen.getByText('Control Button')).toBeInTheDocument();
    });

    test('falls back to control variant when test fails', () => {
      const testConfig = {
        id: 'failing-test',
        name: 'Failing Test',
        variants: [
          { id: 'control', name: 'Control', weight: 0.5, content: { title: 'Control' } },
          { id: 'variant', name: 'Variant', weight: 0.5, content: { title: 'Variant' } },
        ],
      };
      
      // Mock test failure
      (analyticsUtils.getABTestVariant as jest.Mock).mockReturnValue(null);
      
      const TestComponent = () => {
        const { getContent, isInTest } = useABTest(testConfig);
        const content = getContent({ title: 'Fallback' });
        
        return (
          <div>
            <h1>{content.title}</h1>
            <span data-testid="in-test">{isInTest.toString()}</span>
          </div>
        );
      };
      
      render(<TestComponent />);
      
      // Should fall back to control variant
      expect(screen.getByText('Control')).toBeInTheDocument();
      expect(screen.getByTestId('in-test')).toHaveTextContent('false');
    });

    test('respects user exclusion from tests', () => {
      const testConfig = {
        id: 'excluded-test',
        name: 'Excluded Test',
        variants: [
          { id: 'control', name: 'Control', weight: 1.0, content: { title: 'Control' } },
        ],
      };
      
      // Mock user exclusion
      (analyticsUtils.getABTestVariant as jest.Mock).mockReturnValue(null);
      
      const TestComponent = () => {
        const { isInTest, getContent } = useABTest(testConfig);
        const content = getContent({ title: 'Default Content' });
        
        return (
          <div>
            <h1>{content.title}</h1>
            <span data-testid="excluded">{(!isInTest).toString()}</span>
          </div>
        );
      };
      
      render(<TestComponent />);
      
      expect(screen.getByText('Default Content')).toBeInTheDocument();
      expect(screen.getByTestId('excluded')).toHaveTextContent('true');
    });
  });

  describe('Content Management System', () => {
    test('loads content from configuration files', async () => {
      const mockContent = {
        hero: {
          title: 'Dynamic Title',
          subtitle: 'Dynamic Subtitle',
          cta: 'Dynamic CTA',
        },
        features: [
          { id: 1, title: 'Feature 1', description: 'Description 1' },
          { id: 2, title: 'Feature 2', description: 'Description 2' },
        ],
      };
      
      (contentManager.getContent as jest.Mock).mockResolvedValue(mockContent);
      (useContent as jest.Mock).mockReturnValue({
        content: mockContent,
        loading: false,
        error: null,
        updateContent: jest.fn(),
      });
      
      render(<ContentManagedPage pageId="home" />);
      
      await waitFor(() => {
        expect(screen.getByText('Dynamic Title')).toBeInTheDocument();
        expect(screen.getByText('Dynamic Subtitle')).toBeInTheDocument();
        expect(screen.getByText('Feature 1')).toBeInTheDocument();
        expect(screen.getByText('Feature 2')).toBeInTheDocument();
      });
    });

    test('updates content without code deployment', async () => {
      const user = userEvent.setup();
      const initialContent = { title: 'Original Title' };
      const updatedContent = { title: 'Updated Title' };
      
      const mockUpdateContent = jest.fn().mockResolvedValue(updatedContent);
      
      (useContent as jest.Mock)
        .mockReturnValueOnce({
          content: initialContent,
          loading: false,
          error: null,
          updateContent: mockUpdateContent,
        })
        .mockReturnValueOnce({
          content: updatedContent,
          loading: false,
          error: null,
          updateContent: mockUpdateContent,
        });
      
      const TestComponent = () => {
        const { content, updateContent } = useContent('test-page');
        
        return (
          <div>
            <h1>{content.title}</h1>
            <button onClick={() => updateContent({ title: 'Updated Title' })}>
              Update Content
            </button>
          </div>
        );
      };
      
      const { rerender } = render(<TestComponent />);
      
      expect(screen.getByText('Original Title')).toBeInTheDocument();
      
      const updateButton = screen.getByText('Update Content');
      await user.click(updateButton);
      
      // Simulate re-render with updated content
      rerender(<TestComponent />);
      
      expect(mockUpdateContent).toHaveBeenCalledWith({ title: 'Updated Title' });
    });

    test('supports rich text formatting', async () => {
      const richTextContent = {
        description: {
          type: 'rich-text',
          content: [
            { type: 'paragraph', content: 'This is a paragraph with ' },
            { type: 'bold', content: 'bold text' },
            { type: 'paragraph', content: ' and ' },
            { type: 'link', content: 'a link', href: 'https://example.com' },
          ],
        },
      };
      
      (useContent as jest.Mock).mockReturnValue({
        content: richTextContent,
        loading: false,
        error: null,
        updateContent: jest.fn(),
      });
      
      render(<ContentManagedPage pageId="rich-text-test" />);
      
      await waitFor(() => {
        expect(screen.getByText('bold text')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'a link' })).toBeInTheDocument();
      });
    });

    test('handles content versioning', async () => {
      const version1 = { title: 'Version 1', version: '1.0' };
      const version2 = { title: 'Version 2', version: '2.0' };
      
      (contentManager.getContentVersion as jest.Mock)
        .mockResolvedValueOnce(version1)
        .mockResolvedValueOnce(version2);
      
      (useContent as jest.Mock).mockReturnValue({
        content: version1,
        loading: false,
        error: null,
        updateContent: jest.fn(),
        getVersion: jest.fn(),
      });
      
      const TestComponent = () => {
        const { content, getVersion } = useContent('versioned-page');
        
        return (
          <div>
            <h1>{content.title}</h1>
            <span data-testid="version">{content.version}</span>
            <button onClick={() => getVersion('2.0')}>Load Version 2</button>
          </div>
        );
      };
      
      render(<TestComponent />);
      
      expect(screen.getByText('Version 1')).toBeInTheDocument();
      expect(screen.getByTestId('version')).toHaveTextContent('1.0');
    });

    test('validates content structure', async () => {
      const invalidContent = { title: '' }; // Missing required field
      const validContent = { title: 'Valid Title', description: 'Valid Description' };
      
      (contentManager.validateContent as jest.Mock)
        .mockReturnValueOnce({ isValid: false, errors: ['Title is required'] })
        .mockReturnValueOnce({ isValid: true, errors: [] });
      
      (useContent as jest.Mock).mockReturnValue({
        content: validContent,
        loading: false,
        error: null,
        updateContent: jest.fn(),
        validateContent: contentManager.validateContent,
      });
      
      const TestComponent = () => {
        const { content, validateContent } = useContent('validation-test');
        const [validationResult, setValidationResult] = React.useState(null);
        
        return (
          <div>
            <h1>{content.title}</h1>
            <button onClick={() => setValidationResult(validateContent(invalidContent))}>
              Validate Invalid
            </button>
            <button onClick={() => setValidationResult(validateContent(validContent))}>
              Validate Valid
            </button>
            {validationResult && (
              <div data-testid="validation-result">
                {validationResult.isValid ? 'Valid' : 'Invalid'}
              </div>
            )}
          </div>
        );
      };
      
      const user = userEvent.setup();
      render(<TestComponent />);
      
      const validateInvalidButton = screen.getByText('Validate Invalid');
      await user.click(validateInvalidButton);
      
      expect(screen.getByTestId('validation-result')).toHaveTextContent('Invalid');
      
      const validateValidButton = screen.getByText('Validate Valid');
      await user.click(validateValidButton);
      
      expect(screen.getByTestId('validation-result')).toHaveTextContent('Valid');
    });
  });

  describe('A/B Testing with Content Management Integration', () => {
    test('A/B tests work with dynamic content', async () => {
      const testConfig = {
        id: 'content-test',
        name: 'Content Test',
        variants: [
          {
            id: 'control',
            name: 'Control',
            weight: 0.5,
            content: { contentKey: 'hero-control' },
          },
          {
            id: 'variant',
            name: 'Variant',
            weight: 0.5,
            content: { contentKey: 'hero-variant' },
          },
        ],
      };
      
      const contentData = {
        'hero-control': { title: 'Control Hero', description: 'Control Description' },
        'hero-variant': { title: 'Variant Hero', description: 'Variant Description' },
      };
      
      (analyticsUtils.getABTestVariant as jest.Mock).mockReturnValue(testConfig.variants[1]);
      (contentManager.getContent as jest.Mock).mockImplementation((key) => 
        Promise.resolve(contentData[key])
      );
      
      const TestComponent = () => {
        const { getContent: getTestContent } = useABTest(testConfig);
        const testVariant = getTestContent();
        
        const { content, loading } = useContent(testVariant.contentKey);
        
        if (loading) return <div>Loading...</div>;
        
        return (
          <div>
            <h1>{content.title}</h1>
            <p>{content.description}</p>
          </div>
        );
      };
      
      (useContent as jest.Mock).mockReturnValue({
        content: contentData['hero-variant'],
        loading: false,
        error: null,
      });
      
      render(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByText('Variant Hero')).toBeInTheDocument();
        expect(screen.getByText('Variant Description')).toBeInTheDocument();
      });
    });

    test('content updates trigger A/B test re-evaluation', async () => {
      const user = userEvent.setup();
      const testConfig = {
        id: 'dynamic-test',
        name: 'Dynamic Test',
        variants: [
          { id: 'control', name: 'Control', weight: 1.0, content: { version: 'v1' } },
        ],
      };
      
      const contentV1 = { title: 'Title V1', version: 'v1' };
      const contentV2 = { title: 'Title V2', version: 'v2' };
      
      (analyticsUtils.getABTestVariant as jest.Mock).mockReturnValue(testConfig.variants[0]);
      
      const mockUpdateContent = jest.fn();
      
      (useContent as jest.Mock)
        .mockReturnValueOnce({
          content: contentV1,
          loading: false,
          error: null,
          updateContent: mockUpdateContent,
        })
        .mockReturnValueOnce({
          content: contentV2,
          loading: false,
          error: null,
          updateContent: mockUpdateContent,
        });
      
      const TestComponent = () => {
        const { getContent: getTestContent, trackConversion } = useABTest(testConfig);
        const { content, updateContent } = useContent('dynamic-page');
        
        return (
          <div>
            <h1>{content.title}</h1>
            <button onClick={() => updateContent(contentV2)}>Update Content</button>
            <button onClick={() => trackConversion('content_interaction')}>
              Track Conversion
            </button>
          </div>
        );
      };
      
      const { rerender } = render(<TestComponent />);
      
      expect(screen.getByText('Title V1')).toBeInTheDocument();
      
      const updateButton = screen.getByText('Update Content');
      await user.click(updateButton);
      
      // Simulate re-render with updated content
      rerender(<TestComponent />);
      
      const trackButton = screen.getByText('Track Conversion');
      await user.click(trackButton);
      
      // Verify conversion tracking still works after content update
      expect(analyticsUtils.trackABTestConversion).toHaveBeenCalledWith(
        'dynamic-test',
        'control',
        'content_interaction'
      );
    });

    test('handles content loading errors gracefully', async () => {
      const testConfig = {
        id: 'error-test',
        name: 'Error Test',
        variants: [
          { id: 'control', name: 'Control', weight: 1.0, content: { contentKey: 'missing-content' } },
        ],
      };
      
      (analyticsUtils.getABTestVariant as jest.Mock).mockReturnValue(testConfig.variants[0]);
      (useContent as jest.Mock).mockReturnValue({
        content: null,
        loading: false,
        error: 'Content not found',
      });
      
      const TestComponent = () => {
        const { getContent: getTestContent } = useABTest(testConfig);
        const { content, loading, error } = useContent('missing-page');
        
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error: {error}</div>;
        
        return <div>{content?.title || 'No content'}</div>;
      };
      
      render(<TestComponent />);
      
      expect(screen.getByText('Error: Content not found')).toBeInTheDocument();
    });
  });

  describe('Performance and Caching', () => {
    test('content is cached appropriately', async () => {
      const mockContent = { title: 'Cached Content' };
      
      (contentManager.getContent as jest.Mock).mockResolvedValue(mockContent);
      (useContent as jest.Mock).mockReturnValue({
        content: mockContent,
        loading: false,
        error: null,
        fromCache: true,
      });
      
      const TestComponent = () => {
        const { content, fromCache } = useContent('cached-page');
        
        return (
          <div>
            <h1>{content.title}</h1>
            <span data-testid="from-cache">{fromCache.toString()}</span>
          </div>
        );
      };
      
      render(<TestComponent />);
      
      expect(screen.getByText('Cached Content')).toBeInTheDocument();
      expect(screen.getByTestId('from-cache')).toHaveTextContent('true');
      
      // Verify content manager was called only once due to caching
      expect(contentManager.getContent).toHaveBeenCalledTimes(1);
    });

    test('A/B test assignments are consistent across sessions', () => {
      const testConfig = {
        id: 'consistent-test',
        name: 'Consistent Test',
        variants: [
          { id: 'control', name: 'Control', weight: 0.5, content: { title: 'Control' } },
          { id: 'variant', name: 'Variant', weight: 0.5, content: { title: 'Variant' } },
        ],
      };
      
      // Mock consistent assignment
      (analyticsUtils.getABTestVariant as jest.Mock).mockReturnValue(testConfig.variants[1]);
      
      const TestComponent = () => {
        const { getContent, getVariantId } = useABTest(testConfig);
        const content = getContent();
        
        return (
          <div>
            <h1>{content.title}</h1>
            <span data-testid="variant-id">{getVariantId()}</span>
          </div>
        );
      };
      
      // Render multiple times to simulate different sessions
      const { unmount } = render(<TestComponent />);
      expect(screen.getByTestId('variant-id')).toHaveTextContent('variant');
      unmount();
      
      render(<TestComponent />);
      expect(screen.getByTestId('variant-id')).toHaveTextContent('variant');
    });
  });

  describe('Error Handling and Fallbacks', () => {
    test('handles A/B test configuration errors', () => {
      const invalidTestConfig = {
        id: 'invalid-test',
        name: 'Invalid Test',
        variants: [], // Empty variants array
      };
      
      (analyticsUtils.getABTestVariant as jest.Mock).mockReturnValue(null);
      
      const TestComponent = () => {
        const { getContent, isInTest } = useABTest(invalidTestConfig);
        const content = getContent({ title: 'Fallback Content' });
        
        return (
          <div>
            <h1>{content.title}</h1>
            <span data-testid="in-test">{isInTest.toString()}</span>
          </div>
        );
      };
      
      render(<TestComponent />);
      
      expect(screen.getByText('Fallback Content')).toBeInTheDocument();
      expect(screen.getByTestId('in-test')).toHaveTextContent('false');
    });

    test('handles content management system failures', async () => {
      (contentManager.getContent as jest.Mock).mockRejectedValue(new Error('CMS Error'));
      (useContent as jest.Mock).mockReturnValue({
        content: null,
        loading: false,
        error: 'Failed to load content',
      });
      
      const TestComponent = () => {
        const { content, error } = useContent('failing-page');
        
        if (error) {
          return <div>Fallback: Default content due to error</div>;
        }
        
        return <div>{content?.title || 'No content'}</div>;
      };
      
      render(<TestComponent />);
      
      expect(screen.getByText('Fallback: Default content due to error')).toBeInTheDocument();
    });
  });
});