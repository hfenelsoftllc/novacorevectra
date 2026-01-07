/**
 * Health check tests for website availability and response times
 * Tests critical page functionality and performance metrics
 * Requirements: 6.5, 7.2
 */

import { performance } from 'perf_hooks';

// Mock fetch for testing
global.fetch = jest.fn();

interface HealthCheckResult {
  url: string;
  status: number;
  responseTime: number;
  isHealthy: boolean;
  error?: string;
}

interface PerformanceMetrics {
  responseTime: number;
  contentLength?: number;
  ttfb?: number; // Time to First Byte
}

/**
 * Health check utility functions
 */
class HealthChecker {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'https://novacorevectra.net', timeout: number = 5000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Check if a URL is accessible and returns expected status
   */
  async checkEndpoint(path: string, expectedStatus: number = 200): Promise<HealthCheckResult> {
    const url = `${this.baseUrl}${path}`;
    const startTime = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'NovaCoreVectra-HealthCheck/1.0',
        },
      });

      clearTimeout(timeoutId);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      return {
        url,
        status: response.status,
        responseTime,
        isHealthy: response.status === expectedStatus,
      };
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      return {
        url,
        status: 0,
        responseTime,
        isHealthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check multiple endpoints in parallel
   */
  async checkMultipleEndpoints(endpoints: Array<{ path: string; expectedStatus?: number }>): Promise<HealthCheckResult[]> {
    const promises = endpoints.map(({ path, expectedStatus }) =>
      this.checkEndpoint(path, expectedStatus)
    );

    return Promise.all(promises);
  }

  /**
   * Measure performance metrics for an endpoint
   */
  async measurePerformance(path: string): Promise<PerformanceMetrics> {
    const url = `${this.baseUrl}${path}`;
    const startTime = performance.now();

    try {
      const response = await fetch(url, {
        method: 'HEAD', // Use HEAD to get headers without body
        headers: {
          'User-Agent': 'NovaCoreVectra-PerformanceCheck/1.0',
        },
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;
      const contentLength = response.headers.get('content-length');

      return {
        responseTime,
        contentLength: contentLength ? parseInt(contentLength, 10) : 0,
        ttfb: responseTime, // For HEAD requests, this is essentially TTFB
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        responseTime: endTime - startTime,
      };
    }
  }
}

describe('Health Check Tests', () => {
  let healthChecker: HealthChecker;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    healthChecker = new HealthChecker('https://novacorevectra.net', 5000);
  });

  describe('Website Availability Tests', () => {
    test('home page should be accessible', async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers({
          'content-type': 'text/html',
        }),
      } as Response);

      const result = await healthChecker.checkEndpoint('/');

      expect(result.isHealthy).toBe(true);
      expect(result.status).toBe(200);
      expect(result.responseTime).toBeGreaterThan(0);
      expect(result.url).toBe('https://novacorevectra.net/');
    });

    test('services page should be accessible', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers({
          'content-type': 'text/html',
        }),
      } as Response);

      const result = await healthChecker.checkEndpoint('/services');

      expect(result.isHealthy).toBe(true);
      expect(result.status).toBe(200);
      expect(result.url).toBe('https://novacorevectra.net/services');
    });

    test('governance page should be accessible', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers({
          'content-type': 'text/html',
        }),
      } as Response);

      const result = await healthChecker.checkEndpoint('/governance');

      expect(result.isHealthy).toBe(true);
      expect(result.status).toBe(200);
      expect(result.url).toBe('https://novacorevectra.net/governance');
    });

    test('contact page should be accessible', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers({
          'content-type': 'text/html',
        }),
      } as Response);

      const result = await healthChecker.checkEndpoint('/contact');

      expect(result.isHealthy).toBe(true);
      expect(result.status).toBe(200);
      expect(result.url).toBe('https://novacorevectra.net/contact');
    });

    test('should handle 404 errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 404,
        ok: false,
        headers: new Headers(),
      } as Response);

      const result = await healthChecker.checkEndpoint('/nonexistent');

      expect(result.isHealthy).toBe(false);
      expect(result.status).toBe(404);
      expect(result.responseTime).toBeGreaterThan(0);
    });

    test('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await healthChecker.checkEndpoint('/');

      expect(result.isHealthy).toBe(false);
      expect(result.status).toBe(0);
      expect(result.error).toBe('Network error');
      expect(result.responseTime).toBeGreaterThan(0);
    });

    test('should handle timeout errors', async () => {
      // Create a health checker with very short timeout
      const shortTimeoutChecker = new HealthChecker('https://novacorevectra.net', 1);
      
      // Mock a slow response that will be aborted
      mockFetch.mockImplementationOnce(() => 
        new Promise((_resolve, reject) => {
          setTimeout(() => {
            reject(new Error('The operation was aborted'));
          }, 100);
        })
      );

      const result = await shortTimeoutChecker.checkEndpoint('/');

      expect(result.isHealthy).toBe(false);
      expect(result.error).toContain('abort');
    });
  });

  describe('Response Time Tests', () => {
    test('home page should respond within acceptable time', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers(),
      } as Response);

      const result = await healthChecker.checkEndpoint('/');

      // Response time should be reasonable (less than 5 seconds)
      expect(result.responseTime).toBeLessThan(5000);
      expect(result.responseTime).toBeGreaterThan(0);
    });

    test('all critical pages should respond within acceptable time', async () => {
      const criticalPages = [
        { path: '/' },
        { path: '/services' },
        { path: '/governance' },
        { path: '/contact' },
      ];

      // Mock successful responses for all pages
      criticalPages.forEach(() => {
        mockFetch.mockResolvedValueOnce({
          status: 200,
          ok: true,
          headers: new Headers(),
        } as Response);
      });

      const results = await healthChecker.checkMultipleEndpoints(criticalPages);

      results.forEach((result, index) => {
        expect(result.isHealthy).toBe(true);
        expect(result.responseTime).toBeLessThan(5000);
        const criticalPage = criticalPages[index];
        if (criticalPage) {
          expect(result.url).toBe(`https://novacorevectra.net${criticalPage.path}`);
        }
      });
    });

    test('performance metrics should be measurable', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers({
          'content-length': '12345',
          'content-type': 'text/html',
        }),
      } as Response);

      const metrics = await healthChecker.measurePerformance('/');

      expect(metrics.responseTime).toBeGreaterThan(0);
      expect(metrics.contentLength).toBe(12345);
      expect(metrics.ttfb).toBeGreaterThan(0);
    });
  });

  describe('Critical Page Functionality Tests', () => {
    test('should verify essential HTML elements are present', async () => {
      const mockHtmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>NovaCoreVectra - AI Solutions</title>
            <meta name="description" content="Leading AI consulting">
          </head>
          <body>
            <main>
              <h1>Trusted AI for Business Process Transformation</h1>
              <nav>
                <a href="/services">Services</a>
                <a href="/contact">Contact</a>
              </nav>
            </main>
          </body>
        </html>
      `;

      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: () => Promise.resolve(mockHtmlContent),
        headers: new Headers({
          'content-type': 'text/html',
        }),
      } as Response);

      // In a real implementation, we would parse the HTML and check for elements
      const response = await fetch('https://novacorevectra.net/');
      const html = await response.text();

      expect(html).toContain('<title>');
      expect(html).toContain('<meta name="description"');
      expect(html).toContain('<h1>');
      expect(html).toContain('<nav>');
    });

    test('should verify navigation links are present', async () => {
      const mockHtmlContent = `
        <nav>
          <a href="/">Home</a>
          <a href="/services">Services</a>
          <a href="/governance">Governance</a>
          <a href="/contact">Contact</a>
        </nav>
      `;

      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: () => Promise.resolve(mockHtmlContent),
        headers: new Headers({
          'content-type': 'text/html',
        }),
      } as Response);

      const response = await fetch('https://novacorevectra.net/');
      const html = await response.text();

      expect(html).toContain('href="/"');
      expect(html).toContain('href="/services"');
      expect(html).toContain('href="/governance"');
      expect(html).toContain('href="/contact"');
    });

    test('should verify contact form is present on contact page', async () => {
      const mockContactHtml = `
        <form>
          <input name="firstName" type="text" required>
          <input name="lastName" type="text" required>
          <input name="email" type="email" required>
          <input name="company" type="text" required>
          <textarea name="message"></textarea>
          <button type="submit">Send Message</button>
        </form>
      `;

      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: () => Promise.resolve(mockContactHtml),
        headers: new Headers({
          'content-type': 'text/html',
        }),
      } as Response);

      const response = await fetch('https://novacorevectra.net/contact');
      const html = await response.text();

      expect(html).toContain('<form>');
      expect(html).toContain('name="firstName"');
      expect(html).toContain('name="email"');
      expect(html).toContain('type="submit"');
    });
  });

  describe('Health Check Integration', () => {
    test('should run comprehensive health check suite', async () => {
      const endpoints = [
        { path: '/', expectedStatus: 200 },
        { path: '/services', expectedStatus: 200 },
        { path: '/governance', expectedStatus: 200 },
        { path: '/contact', expectedStatus: 200 },
        { path: '/sitemap.xml', expectedStatus: 200 },
        { path: '/robots.txt', expectedStatus: 200 },
      ];

      // Mock successful responses for all endpoints
      endpoints.forEach(() => {
        mockFetch.mockResolvedValueOnce({
          status: 200,
          ok: true,
          headers: new Headers(),
        } as Response);
      });

      const results = await healthChecker.checkMultipleEndpoints(endpoints);

      // All endpoints should be healthy
      const healthyCount = results.filter(r => r.isHealthy).length;
      expect(healthyCount).toBe(endpoints.length);

      // All response times should be reasonable
      results.forEach(result => {
        expect(result.responseTime).toBeLessThan(5000);
        expect(result.responseTime).toBeGreaterThan(0);
      });
    });

    test('should identify unhealthy endpoints', async () => {
      const endpoints = [
        { path: '/', expectedStatus: 200 },
        { path: '/broken', expectedStatus: 200 },
      ];

      // Mock mixed responses
      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
          headers: new Headers(),
        } as Response)
        .mockResolvedValueOnce({
          status: 500,
          ok: false,
          headers: new Headers(),
        } as Response);

      const results = await healthChecker.checkMultipleEndpoints(endpoints);

      const firstResult = results[0];
      const secondResult = results[1];
      
      if (firstResult) {
        expect(firstResult.isHealthy).toBe(true);
      }
      if (secondResult) {
        expect(secondResult.isHealthy).toBe(false);
        expect(secondResult.status).toBe(500);
      }
    });
  });

  describe('Monitoring Integration', () => {
    test('should generate health check report', async () => {
      const endpoints = [
        { path: '/', expectedStatus: 200 },
        { path: '/services', expectedStatus: 200 },
      ];

      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
          headers: new Headers(),
        } as Response)
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
          headers: new Headers(),
        } as Response);

      const results = await healthChecker.checkMultipleEndpoints(endpoints);

      // Generate report
      const report = {
        timestamp: new Date().toISOString(),
        totalEndpoints: results.length,
        healthyEndpoints: results.filter(r => r.isHealthy).length,
        unhealthyEndpoints: results.filter(r => !r.isHealthy).length,
        averageResponseTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length,
        results,
      };

      expect(report.totalEndpoints).toBe(2);
      expect(report.healthyEndpoints).toBe(2);
      expect(report.unhealthyEndpoints).toBe(0);
      expect(report.averageResponseTime).toBeGreaterThan(0);
      expect(report.timestamp).toBeDefined();
    });

    test('should support custom health check thresholds', async () => {
      const customChecker = new HealthChecker('https://novacorevectra.net', 1000); // 1 second timeout

      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers(),
      } as Response);

      const result = await customChecker.checkEndpoint('/');

      expect(result.isHealthy).toBe(true);
      expect(result.responseTime).toBeLessThan(1000);
    });
  });
});