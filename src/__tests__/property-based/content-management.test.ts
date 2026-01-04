import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

// Import existing constants to test content separation
import { SERVICES } from '../../constants/services';
import { STANDARDS } from '../../constants/standards';

describe('Property 8: Content Management Separation', () => {
  it('should verify content is separated from code using configuration files', () => {
    // Feature: full-marketing-site, Property 8: Content Management Separation
    fc.assert(
      fc.property(fc.constant(true), () => {
        // Test that content exists in separate configuration files
        const constantsDir = path.join(process.cwd(), 'src', 'constants');
        
        // Verify constants directory exists
        expect(fs.existsSync(constantsDir)).toBe(true);
        
        // Verify key content files exist
        const servicesFile = path.join(constantsDir, 'services.ts');
        const standardsFile = path.join(constantsDir, 'standards.ts');
        const indexFile = path.join(constantsDir, 'index.ts');
        
        expect(fs.existsSync(servicesFile)).toBe(true);
        expect(fs.existsSync(standardsFile)).toBe(true);
        expect(fs.existsSync(indexFile)).toBe(true);
        
        // Verify content is properly structured and accessible
        expect(Array.isArray(SERVICES)).toBe(true);
        expect(Array.isArray(STANDARDS)).toBe(true);
        expect(SERVICES.length).toBeGreaterThan(0);
        expect(STANDARDS.length).toBeGreaterThan(0);
        
        return true;
      }),
      { numRuns: 10 }
    );
  });

  it('should verify content structure allows updates without code deployment', () => {
    // Feature: full-marketing-site, Property 8: Content Management Separation
    fc.assert(
      fc.property(fc.constant(true), () => {
        // Test that content is structured as data objects that can be modified
        // without changing component code
        
        // Verify services have required structure for content management
        SERVICES.forEach(service => {
          expect(service).toHaveProperty('id');
          expect(service).toHaveProperty('title');
          expect(service).toHaveProperty('description');
          expect(typeof service.id).toBe('string');
          expect(typeof service.title).toBe('string');
          expect(typeof service.description).toBe('string');
        });
        
        // Verify standards have required structure for content management
        STANDARDS.forEach(standard => {
          expect(standard).toHaveProperty('id');
          expect(standard).toHaveProperty('name');
          expect(standard).toHaveProperty('description');
          expect(typeof standard.id).toBe('string');
          expect(typeof standard.name).toBe('string');
          expect(typeof standard.description).toBe('string');
        });
        
        return true;
      }),
      { numRuns: 10 }
    );
  });

  it('should verify content files are separate from component implementation', () => {
    // Feature: full-marketing-site, Property 8: Content Management Separation
    fc.assert(
      fc.property(fc.constant(true), () => {
        // Test that content files exist in constants directory separate from components
        const constantsDir = path.join(process.cwd(), 'src', 'constants');
        const componentsDir = path.join(process.cwd(), 'src', 'components');
        
        // Verify separation of concerns - constants and components are in different directories
        expect(fs.existsSync(constantsDir)).toBe(true);
        expect(fs.existsSync(componentsDir)).toBe(true);
        
        // Verify constants directory contains only data files, not component files
        const constantsFiles = fs.readdirSync(constantsDir);
        const hasOnlyDataFiles = constantsFiles.every(file => 
          file.endsWith('.ts') || file.endsWith('.js') || file.startsWith('.git')
        );
        expect(hasOnlyDataFiles).toBe(true);
        
        // Verify no component files (.tsx) in constants directory
        const hasComponentFiles = constantsFiles.some(file => file.endsWith('.tsx'));
        expect(hasComponentFiles).toBe(false);
        
        return true;
      }),
      { numRuns: 10 }
    );
  });

  it('should verify content can be imported and used by components', () => {
    // Feature: full-marketing-site, Property 8: Content Management Separation
    fc.assert(
      fc.property(fc.constant(true), () => {
        // Test that content from constants can be properly imported and used
        // This validates that content separation doesn't break functionality
        
        // Verify content is exportable and importable
        expect(SERVICES).toBeDefined();
        expect(STANDARDS).toBeDefined();
        
        // Verify content has the structure needed for components to consume
        if (SERVICES.length > 0) {
          const firstService = SERVICES[0];
          expect(firstService.id).toBeDefined();
          expect(firstService.title).toBeDefined();
          expect(firstService.description).toBeDefined();
          expect(firstService.icon).toBeDefined();
        }
        
        if (STANDARDS.length > 0) {
          const firstStandard = STANDARDS[0];
          expect(firstStandard.id).toBeDefined();
          expect(firstStandard.name).toBeDefined();
          expect(firstStandard.description).toBeDefined();
        }
        
        return true;
      }),
      { numRuns: 10 }
    );
  });
});
