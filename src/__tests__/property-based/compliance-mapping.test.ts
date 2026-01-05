import * as fc from 'fast-check';
import { ISO_42001_FRAMEWORK } from '../../constants/compliance';
import { SERVICES } from '../../constants/services';
import { ComplianceClause, ComplianceFramework } from '../../types/compliance';
import { Service } from '../../types/services';

describe('Property 4: Compliance Mapping Completeness', () => {
  it('should verify all services are mapped to appropriate ISO 42001 clauses with complete clause information', () => {
    // Feature: full-marketing-site, Property 4: Compliance Mapping Completeness
    fc.assert(
      fc.property(fc.constant(true), () => {
        // Test that all services in the system are mapped to appropriate ISO 42001 clauses
        const framework = ISO_42001_FRAMEWORK;
        const services = SERVICES;
        
        // Verify framework structure is complete
        expect(framework).toBeDefined();
        expect(framework.id).toBe('iso-42001');
        expect(framework.name).toBe('ISO/IEC 42001:2023');
        expect(framework.version).toBe('2023');
        expect(Array.isArray(framework.clauses)).toBe(true);
        expect(framework.clauses.length).toBeGreaterThan(0);
        
        // Verify all clauses have complete information
        framework.clauses.forEach((clause: ComplianceClause) => {
          // Clause must have all required fields
          expect(clause.id).toBeDefined();
          expect(typeof clause.id).toBe('string');
          expect(clause.id.length).toBeGreaterThan(0);
          
          expect(clause.clauseNumber).toBeDefined();
          expect(typeof clause.clauseNumber).toBe('string');
          expect(clause.clauseNumber.length).toBeGreaterThan(0);
          
          expect(clause.title).toBeDefined();
          expect(typeof clause.title).toBe('string');
          expect(clause.title.length).toBeGreaterThan(0);
          
          expect(clause.description).toBeDefined();
          expect(typeof clause.description).toBe('string');
          expect(clause.description.length).toBeGreaterThan(0);
          
          // Requirements array must exist and have content
          expect(Array.isArray(clause.requirements)).toBe(true);
          expect(clause.requirements.length).toBeGreaterThan(0);
          clause.requirements.forEach(requirement => {
            expect(typeof requirement).toBe('string');
            expect(requirement.length).toBeGreaterThan(0);
          });
          
          // Mapped services array must exist and have content
          expect(Array.isArray(clause.mappedServices)).toBe(true);
          expect(clause.mappedServices.length).toBeGreaterThan(0);
          clause.mappedServices.forEach(serviceId => {
            expect(typeof serviceId).toBe('string');
            expect(serviceId.length).toBeGreaterThan(0);
          });
        });
        
        return true;
      }),
      { numRuns: 10 }
    );
  });

  it('should verify bidirectional mapping consistency between services and clauses', () => {
    // Feature: full-marketing-site, Property 4: Compliance Mapping Completeness
    fc.assert(
      fc.property(fc.constant(true), () => {
        const framework = ISO_42001_FRAMEWORK;
        const services = SERVICES;
        
        // Collect all service IDs that are mapped in clauses
        const mappedServiceIds = new Set<string>();
        framework.clauses.forEach(clause => {
          clause.mappedServices.forEach(serviceId => {
            mappedServiceIds.add(serviceId);
          });
        });
        
        // Collect all actual service IDs
        const actualServiceIds = new Set(services.map(service => service.id));
        
        // Verify that all mapped service IDs correspond to actual services
        mappedServiceIds.forEach(mappedServiceId => {
          expect(actualServiceIds.has(mappedServiceId)).toBe(true);
        });
        
        // Verify that all actual services are mapped to at least one clause
        actualServiceIds.forEach(serviceId => {
          const isMapped = framework.clauses.some(clause => 
            clause.mappedServices.includes(serviceId)
          );
          expect(isMapped).toBe(true);
        });
        
        return true;
      }),
      { numRuns: 10 }
    );
  });

  it('should verify clause numbers follow proper ISO 42001 numbering scheme', () => {
    // Feature: full-marketing-site, Property 4: Compliance Mapping Completeness
    fc.assert(
      fc.property(fc.constant(true), () => {
        const framework = ISO_42001_FRAMEWORK;
        
        // Verify clause numbers are valid and follow ISO numbering
        const clauseNumbers = framework.clauses.map(clause => clause.clauseNumber);
        
        // All clause numbers should be numeric strings
        clauseNumbers.forEach(clauseNumber => {
          expect(/^\d+$/.test(clauseNumber)).toBe(true);
          const num = parseInt(clauseNumber, 10);
          expect(num).toBeGreaterThan(0);
          expect(num).toBeLessThan(20); // ISO 42001 has clauses 1-10 typically
        });
        
        // Clause numbers should be unique
        const uniqueClauseNumbers = new Set(clauseNumbers);
        expect(uniqueClauseNumbers.size).toBe(clauseNumbers.length);
        
        // Verify clause IDs follow consistent naming pattern
        framework.clauses.forEach(clause => {
          expect(clause.id).toMatch(/^clause-\d+$/);
          expect(clause.id).toBe(`clause-${clause.clauseNumber}`);
        });
        
        return true;
      }),
      { numRuns: 10 }
    );
  });

  it('should verify service mapping coverage across all compliance areas', () => {
    // Feature: full-marketing-site, Property 4: Compliance Mapping Completeness
    fc.assert(
      fc.property(fc.constant(true), () => {
        const framework = ISO_42001_FRAMEWORK;
        const services = SERVICES;
        
        // Verify that each service is mapped to multiple clauses (comprehensive coverage)
        services.forEach(service => {
          const mappingCount = framework.clauses.filter(clause => 
            clause.mappedServices.includes(service.id)
          ).length;
          
          // Each service should be mapped to at least one clause
          expect(mappingCount).toBeGreaterThan(0);
        });
        
        // Verify that each clause maps to at least one service
        framework.clauses.forEach(clause => {
          expect(clause.mappedServices.length).toBeGreaterThan(0);
          
          // Verify all mapped services exist
          clause.mappedServices.forEach(serviceId => {
            const serviceExists = services.some(service => service.id === serviceId);
            expect(serviceExists).toBe(true);
          });
        });
        
        // Verify comprehensive coverage - all major compliance areas are covered
        const expectedClauseAreas = [
          'Context of the Organization',
          'Leadership', 
          'Planning',
          'Support',
          'Operation',
          'Performance Evaluation',
          'Improvement'
        ];
        
        expectedClauseAreas.forEach(expectedArea => {
          const hasClauseForArea = framework.clauses.some(clause => 
            clause.title.includes(expectedArea) || 
            clause.description.toLowerCase().includes(expectedArea.toLowerCase())
          );
          expect(hasClauseForArea).toBe(true);
        });
        
        return true;
      }),
      { numRuns: 10 }
    );
  });

  it('should verify documentation URLs are properly formatted and accessible', () => {
    // Feature: full-marketing-site, Property 4: Compliance Mapping Completeness
    fc.assert(
      fc.property(fc.constant(true), () => {
        const framework = ISO_42001_FRAMEWORK;
        
        // Verify all clauses have documentation URLs
        framework.clauses.forEach(clause => {
          expect(clause.documentationUrl).toBeDefined();
          expect(typeof clause.documentationUrl).toBe('string');
          expect(clause.documentationUrl!.length).toBeGreaterThan(0);
          
          // Verify URL format is correct
          expect(clause.documentationUrl).toMatch(/^\/docs\/.*\.pdf$/);
          
          // Verify URL corresponds to clause
          const expectedUrl = `/docs/iso-42001-clause-${clause.clauseNumber}.pdf`;
          expect(clause.documentationUrl).toBe(expectedUrl);
        });
        
        return true;
      }),
      { numRuns: 10 }
    );
  });

  it('should verify compliance framework metadata is complete and valid', () => {
    // Feature: full-marketing-site, Property 4: Compliance Mapping Completeness
    fc.assert(
      fc.property(fc.constant(true), () => {
        const framework = ISO_42001_FRAMEWORK;
        
        // Verify framework metadata
        expect(framework.id).toBe('iso-42001');
        expect(framework.name).toBe('ISO/IEC 42001:2023');
        expect(framework.version).toBe('2023');
        expect(framework.certificationLevel).toBe('Certified');
        
        // Verify framework has reasonable number of clauses for ISO 42001
        expect(framework.clauses.length).toBeGreaterThanOrEqual(7);
        expect(framework.clauses.length).toBeLessThanOrEqual(15);
        
        // Verify all required clause numbers are present (ISO 42001 core clauses)
        const requiredClauses = ['4', '5', '6', '7', '8', '9', '10'];
        requiredClauses.forEach(requiredClause => {
          const hasClause = framework.clauses.some(clause => 
            clause.clauseNumber === requiredClause
          );
          expect(hasClause).toBe(true);
        });
        
        return true;
      }),
      { numRuns: 10 }
    );
  });
});