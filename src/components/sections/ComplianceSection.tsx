import * as React from 'react';
import { useState } from 'react';
import { Download, ChevronDown, ChevronUp, Shield, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/common';
import { ISO_42001_FRAMEWORK } from '@/constants/compliance';
import { SERVICES } from '@/constants/services';
import { ComplianceClause, ComplianceFramework } from '@/types/compliance';
import { SectionProps } from '@/types/common';
import { usePerformance } from '@/hooks';
import { cn } from '@/utils';

/**
 * Props for ComplianceSection component
 */
interface ComplianceSectionProps extends SectionProps {
  framework?: ComplianceFramework;
  showDownloadLinks?: boolean;
}

/**
 * Props for ComplianceClauseCard component
 */
interface ComplianceClauseCardProps {
  clause: ComplianceClause;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  showDownloadLinks: boolean;
}

/**
 * Individual compliance clause card component
 */
const ComplianceClauseCard: React.FC<ComplianceClauseCardProps> = ({
  clause,
  index,
  isExpanded,
  onToggle,
  showDownloadLinks
}) => {
  const { calculateAnimationDelay, prefersReducedMotion } = usePerformance();
  const animationDelay = calculateAnimationDelay(index);

  // Get mapped service details
  const mappedServiceDetails = clause.mappedServices
    .map(serviceId => SERVICES.find(service => service.id === serviceId))
    .filter(Boolean);

  return (
    <Card
      className={cn(
        'bg-card border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5',
        !prefersReducedMotion && 'animate-in fade-in slide-in-from-bottom-4'
      )}
      style={{
        animationDelay: prefersReducedMotion ? '0ms' : `${animationDelay * 1000}ms`,
        animationFillMode: 'both',
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
              <span className="text-sm font-semibold text-primary">
                {clause.clauseNumber}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg">{clause.title}</CardTitle>
              <CardDescription className="mt-1">
                Clause {clause.clauseNumber}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} details for ${clause.title}`}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-muted-foreground mb-4">
          {clause.description}
        </p>

        {isExpanded && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Requirements */}
            <div>
              <h4 className="font-medium text-foreground mb-2">Requirements</h4>
              <ul className="space-y-1">
                {clause.requirements.map((requirement, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mapped Services */}
            {mappedServiceDetails.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Mapped Services</h4>
                <div className="grid gap-2">
                  {mappedServiceDetails.map((service) => (
                    <div
                      key={service!.id}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
                    >
                      {service!.icon}
                      <span className="text-sm font-medium">{service!.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documentation Download */}
            {showDownloadLinks && clause.documentationUrl && (
              <div className="pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full"
                >
                  <a
                    href={clause.documentationUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Download documentation for ${clause.title}`}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Documentation
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * ComplianceSection component displays ISO 42001 compliance mapping
 * Shows clause numbers, descriptions, service mappings, and documentation links
 * Includes interactive clause expansion and certification information
 */
const ComplianceSectionComponent = React.forwardRef<HTMLElement, ComplianceSectionProps>(
  ({ 
    className, 
    children, 
    framework = ISO_42001_FRAMEWORK,
    showDownloadLinks = true,
    ...props 
  }, ref) => {
    const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set());

    const toggleClause = (clauseId: string) => {
      setExpandedClauses(prev => {
        const newSet = new Set(prev);
        if (newSet.has(clauseId)) {
          newSet.delete(clauseId);
        } else {
          newSet.add(clauseId);
        }
        return newSet;
      });
    };

    return (
      <AnimatedSection
        ref={ref}
        className={cn('bg-background border-t border-border', className)}
        animationProps={{
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        }}
        aria-labelledby="compliance-heading"
        role="region"
        aria-label="Compliance and trust information"
        {...props}
      >
        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Section Header */}
          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <h2
                id="compliance-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground"
              >
                Trust & Compliance
              </h2>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our AI solutions are built with compliance at their core, aligned with {framework.name} 
              standards to ensure trust, accountability, and regulatory adherence.
            </p>
          </header>

          {/* Certification Badge */}
          <div className="flex justify-center mb-12">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="font-semibold text-foreground">
                  {framework.certificationLevel || 'Compliant'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {framework.name} ({framework.version})
              </p>
            </div>
          </div>

          {/* Optional additional content */}
          {children && <div className="mb-10">{children}</div>}

          {/* Compliance Clauses Grid */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground text-center mb-8">
              Compliance Framework Mapping
            </h3>
            <div
              className="grid gap-6"
              role="list"
              aria-label="List of compliance clauses"
            >
              {framework.clauses.map((clause, index) => (
                <ComplianceClauseCard
                  key={clause.id}
                  clause={clause}
                  index={index}
                  isExpanded={expandedClauses.has(clause.id)}
                  onToggle={() => toggleClause(clause.id)}
                  showDownloadLinks={showDownloadLinks}
                />
              ))}
            </div>
          </div>

          {/* Additional Trust Information */}
          <div className="mt-16 text-center">
            <div className="bg-muted/30 rounded-lg p-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Audit-Ready Documentation
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                All our implementations include comprehensive documentation, audit trails, 
                and compliance reports to support your regulatory requirements and internal audits.
              </p>
              {showDownloadLinks && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" asChild>
                    <a
                      href="/docs/compliance-overview.pdf"
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Compliance Overview
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a
                      href="/docs/audit-checklist.pdf"
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Audit Checklist
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </AnimatedSection>
    );
  }
);

ComplianceSectionComponent.displayName = 'ComplianceSection';

// Memoize the component to prevent unnecessary re-renders
export const ComplianceSection = React.memo(ComplianceSectionComponent);