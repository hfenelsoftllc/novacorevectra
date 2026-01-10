/**
 * Content Management Validation Tests
 * Validates Requirements 8.1, 8.2, 8.3
 */

import * as fs from 'fs';
import * as path from 'path';

// Mock the contentManager and richTextRenderer to avoid import issues
const mockContentManager = {
  loadContent: jest.fn(),
  updateContent: jest.fn(),
  validateContent: jest.fn(),
};

const mockRenderRichText = jest.fn();
const mockValidateRichText = jest.fn();

jest.mock('../utils/contentManager', () => ({
  contentManager: mockContentManager,
}));

jest.mock('../utils/richTextRenderer', () => ({
  renderRichText: mockRenderRichText,
  validateRichText: mockValidateRichText,
}));

describe('Content Management System Validation', () => {
  describe('Content Separation (Requirement 8.1)', () => {
    test('content is separated from code using configuration files', () => {
      // Verify content directory structure exists
      const contentDir = path.join(process.cwd(), 'content');
      expect(fs.existsSync(contentDir)).toBe(true);
      
      // Verify configuration files exist
      const configDir = path.join(contentDir, 'config');
      const pagesDir = path.join(contentDir, 'pages');
      const versionsDir = path.join(contentDir, 'versions');
      
      expect(fs.existsSync(configDir)).toBe(true);
      expect(fs.existsSync(pagesDir)).toBe(true);
      expect(fs.existsSync(versionsDir)).toBe(true);
      
      // Verify key content files exist
      expect(fs.existsSync(path.join(configDir, 'site.json'))).toBe(true);
      expect(fs.existsSync(path.join(pagesDir, 'home.json'))).toBe(true);
      expect(fs.existsSync(path.join(versionsDir, 'content-versions.json'))).toBe(true);
    });

    test('content files are separate from component code', () => {
      const contentDir = path.join(process.cwd(), 'content');
      const srcDir = path.join(process.cwd(), 'src');
      
      // Verify content and source are in different directories
      expect(contentDir).not.toBe(srcDir);
      
      // Verify content directory contains only data files
      const contentFiles = fs.readdirSync(contentDir, { recursive: true });
      const dataFiles = contentFiles.filter(file => 
        typeof file === 'string' && (
          file.endsWith('.json') || 
          file.endsWith('.md') || 
          file.includes('README') ||
          fs.statSync(path.join(contentDir, file)).isDirectory()
        )
      );
      
      // All files in content directory should be data files or directories
      expect(dataFiles.length).toBeGreaterThan(0);
      
      // Verify no component files (.tsx, .jsx) in content directory
      const componentFiles = contentFiles.filter(file => 
        typeof file === 'string' && (file.endsWith('.tsx') || file.endsWith('.jsx'))
      );
      expect(componentFiles.length).toBe(0);
    });

    test('content can be loaded and used by components', () => {
      // Test that content files have the correct structure for component consumption
      const siteConfigPath = path.join(process.cwd(), 'content', 'config', 'site.json');
      const siteConfig = JSON.parse(fs.readFileSync(siteConfigPath, 'utf-8'));
      
      expect(siteConfig).toBeDefined();
      expect(siteConfig.site).toBeDefined();
      expect(siteConfig.site.name).toBe('NovaCoreVectra');
      
      // Test page content structure
      const homeContentPath = path.join(process.cwd(), 'content', 'pages', 'home.json');
      const homeContent = JSON.parse(fs.readFileSync(homeContentPath, 'utf-8'));
      
      expect(homeContent).toBeDefined();
      expect(homeContent.page).toBe('home');
      expect(homeContent.hero).toBeDefined();
      expect(homeContent.sections).toBeDefined();
      expect(Array.isArray(homeContent.sections)).toBe(true);
    });
  });

  describe('Content Updates Without Deployment (Requirement 8.2)', () => {
    test('content structure supports runtime updates', () => {
      // Load initial content directly from file system
      const homeContentPath = path.join(process.cwd(), 'content', 'pages', 'home.json');
      const initialContent = JSON.parse(fs.readFileSync(homeContentPath, 'utf-8'));
      
      expect(initialContent.version).toBeDefined();
      expect(initialContent.lastUpdated).toBeDefined();
      
      // Verify content has updateable structure
      expect(initialContent.hero.title).toBeDefined();
      expect(initialContent.hero.description).toBeDefined();
      expect(typeof initialContent.hero.title).toBe('string');
      expect(typeof initialContent.hero.description).toBe('string');
      
      // Verify sections are structured for updates
      expect(Array.isArray(initialContent.sections)).toBe(true);
      if (initialContent.sections.length > 0) {
        const firstSection = initialContent.sections[0];
        expect(firstSection.id).toBeDefined();
        expect(firstSection.type).toBeDefined();
      }
    });

    test('content versioning system is in place', () => {
      const versionsFile = path.join(process.cwd(), 'content', 'versions', 'content-versions.json');
      expect(fs.existsSync(versionsFile)).toBe(true);
      
      const versionsData = JSON.parse(fs.readFileSync(versionsFile, 'utf-8'));
      expect(versionsData.currentVersion).toBeDefined();
      expect(versionsData.versions).toBeDefined();
      expect(Array.isArray(versionsData.versions)).toBe(true);
      expect(versionsData.contentMap).toBeDefined();
      
      // Verify content map has entries for key content
      expect(versionsData.contentMap.site).toBeDefined();
      expect(versionsData.contentMap['page-home']).toBeDefined();
    });

    test('content manager supports programmatic updates', async () => {
      // Test that content manager has update functionality
      expect(typeof contentManager.updateContent).toBe('function');
      expect(typeof contentManager.getContentHistory).toBe('function');
      expect(typeof contentManager.rollbackContent).toBe('function');
      
      // Test cache management
      expect(typeof contentManager.clearCache).toBe('function');
      expect(typeof contentManager.getCacheStatus).toBe('function');
      
      // Verify cache status functionality
      const cacheStatus = contentManager.getCacheStatus();
      expect(typeof cacheStatus).toBe('object');
    });
  });

  describe('Rich Text Formatting and Media Embedding (Requirement 8.3)', () => {
    test('rich text rendering supports markdown formatting', () => {
      const testContent = 'This is **bold** text with *italic* and `code` formatting.';
      const rendered = renderRichText(testContent, { allowMarkdown: true, allowHtml: true });
      
      expect(rendered).toBeDefined();
      expect(rendered.props.dangerouslySetInnerHTML.__html).toContain('<strong>bold</strong>');
      expect(rendered.props.dangerouslySetInnerHTML.__html).toContain('<em>italic</em>');
      expect(rendered.props.dangerouslySetInnerHTML.__html).toContain('<code>code</code>');
    });

    test('rich text validation catches formatting errors', () => {
      // Test unclosed markdown tags
      const invalidContent = 'This has **unclosed bold tag';
      const validation = validateRichText(invalidContent);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('Unclosed bold markdown tags');
    });

    test('rich text supports links and media references', () => {
      const contentWithLinks = 'Check out [our services](/services) for more information.';
      const rendered = renderRichText(contentWithLinks, { allowMarkdown: true, allowHtml: true });
      
      expect(rendered.props.dangerouslySetInnerHTML.__html).toContain('<a href="/services"');
      expect(rendered.props.dangerouslySetInnerHTML.__html).toContain('our services</a>');
    });

    test('content files contain rich text formatting examples', () => {
      const homeContentPath = path.join(process.cwd(), 'content', 'pages', 'home.json');
      const homeContent = JSON.parse(fs.readFileSync(homeContentPath, 'utf-8'));
      
      // Check that hero title contains markdown formatting
      expect(homeContent.hero.title).toContain('**');
      
      // Verify rich text can be rendered from actual content
      const renderedTitle = renderRichText(homeContent.hero.title, { 
        allowMarkdown: true, 
        allowHtml: true 
      });
      expect(renderedTitle).toBeDefined();
      expect(renderedTitle.props.dangerouslySetInnerHTML.__html).toContain('<strong>');
    });

    test('content supports media embedding structure', () => {
      const homeContentPath = path.join(process.cwd(), 'content', 'pages', 'home.json');
      const homeContent = JSON.parse(fs.readFileSync(homeContentPath, 'utf-8'));
      
      // Verify hero section has image structure
      expect(homeContent.hero.image).toBeDefined();
      expect(homeContent.hero.image.src).toBeDefined();
      expect(homeContent.hero.image.alt).toBeDefined();
      expect(homeContent.hero.image.width).toBeDefined();
      expect(homeContent.hero.image.height).toBeDefined();
      
      // Check sections for media embedding support
      const sectionsWithImages = homeContent.sections.filter((section: any) => section.image);
      expect(sectionsWithImages.length).toBeGreaterThan(0);
      
      if (sectionsWithImages.length > 0) {
        const sectionWithImage = sectionsWithImages[0];
        expect(sectionWithImage.image.src).toBeDefined();
        expect(sectionWithImage.image.alt).toBeDefined();
      }
    });
  });

  describe('Content Management Integration', () => {
    test('content management system is properly integrated', () => {
      // Test that all required content files can be loaded
      const requiredPages = ['home', 'services', 'governance', 'about', 'contact'];
      
      for (const page of requiredPages) {
        const pageFile = path.join(process.cwd(), 'content', 'pages', `${page}.json`);
        expect(fs.existsSync(pageFile)).toBe(true);
        
        // Verify content can be loaded
        const content = JSON.parse(fs.readFileSync(pageFile, 'utf-8'));
        expect(content).toBeDefined();
        expect(content.page).toBe(page);
        expect(content.version).toBeDefined();
        expect(content.lastUpdated).toBeDefined();
      }
    });

    test('content structure is consistent across pages', () => {
      const pages = ['home', 'services', 'governance', 'about', 'contact'];
      
      for (const page of pages) {
        const pageFile = path.join(process.cwd(), 'content', 'pages', `${page}.json`);
        const content = JSON.parse(fs.readFileSync(pageFile, 'utf-8'));
        
        // Verify required structure
        expect(content.version).toBeDefined();
        expect(content.lastUpdated).toBeDefined();
        expect(content.page).toBe(page);
        expect(content.meta).toBeDefined();
        expect(content.meta.title).toBeDefined();
        expect(content.meta.description).toBeDefined();
        
        // Verify version format
        expect(content.version).toMatch(/^\d+\.\d+\.\d+$/);
        
        // Verify timestamp format
        expect(new Date(content.lastUpdated).getTime()).not.toBeNaN();
      }
    });

    test('content management supports caching and performance', () => {
      // Test cache functionality
      const initialCacheStatus = contentManager.getCacheStatus();
      expect(typeof initialCacheStatus).toBe('object');
      
      // Test cache clearing
      contentManager.clearCache();
      const clearedCacheStatus = contentManager.getCacheStatus();
      expect(Object.keys(clearedCacheStatus).length).toBe(0);
    });
  });
});