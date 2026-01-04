/**
 * Interface for compliance clauses
 */
export interface ComplianceClause {
  id: string;
  clauseNumber: string;
  title: string;
  description: string;
  requirements: string[];
  mappedServices: string[];
  documentationUrl?: string;
}

/**
 * Interface for compliance frameworks
 */
export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  clauses: ComplianceClause[];
  certificationLevel?: string;
}