/**
 * Content renderer component for dynamic content sections
 */

import React from 'react';
import { ContentSection } from '../../types/content';
import { renderRichText } from '../../utils/richTextRenderer';

// Import section components (these would be implemented separately)
import { ProcessLifecycleSection } from '../sections/ProcessLifecycleSection';
import { IndustryVariantsSection } from '../sections/IndustryVariantsSection';
import { ComplianceSection } from '../sections/ComplianceSection';
import { ServicesSection } from '../sections/ServicesSection';
import { StandardsSection } from '../sections/StandardsSection';
import { CTASection } from '../sections/CTASection';

interface ContentRendererProps {
  sections: ContentSection[];
  className?: string;
}

export function ContentRenderer({ sections, className = '' }: ContentRendererProps) {
  return (
    <div className={className}>
      {sections.map((section, index) => (
        <ContentSectionRenderer 
          key={section.id || index} 
          section={section} 
        />
      ))}
    </div>
  );
}

interface ContentSectionRendererProps {
  section: ContentSection;
}

function ContentSectionRenderer({ section }: ContentSectionRendererProps) {
  const { type, id, title, description } = section;

  // Common section wrapper
  const SectionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <section id={id} className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {renderRichText(title, { allowMarkdown: true, className: 'inline' })}
            </h2>
            {description && (
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                {renderRichText(description, { allowMarkdown: true, className: 'inline' })}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );

  // Render different section types
  switch (type) {
    case 'text-image':
      return (
        <SectionWrapper>
          <TextImageSection section={section} />
        </SectionWrapper>
      );

    case 'text-content':
      return (
        <SectionWrapper>
          <TextContentSection section={section} />
        </SectionWrapper>
      );

    case 'text-columns':
      return (
        <SectionWrapper>
          <TextColumnsSection section={section} />
        </SectionWrapper>
      );

    case 'process-lifecycle':
      return (
        <SectionWrapper>
          <ProcessLifecycleSection 
            showAnimation={section.showAnimation}
            showDetails={section.showDetails}
          />
        </SectionWrapper>
      );

    case 'industry-variants':
      return (
        <SectionWrapper>
          <IndustryVariantsSection 
            showSelector={section.showSelector}
            showCaseStudies={section.showCaseStudies}
          />
        </SectionWrapper>
      );

    case 'compliance-section':
      return (
        <SectionWrapper>
          <ComplianceSection 
            framework={section.showFramework}
            showMappings={section.showMappings}
            showDocumentation={section.showDocumentation}
          />
        </SectionWrapper>
      );

    case 'services-grid':
      return (
        <SectionWrapper>
          <ServicesSection showDetails={section.showDetails} />
        </SectionWrapper>
      );

    case 'service-cards':
      return (
        <SectionWrapper>
          <ServiceCardsSection section={section} />
        </SectionWrapper>
      );

    case 'standards-grid':
      return (
        <SectionWrapper>
          <StandardsSection />
        </SectionWrapper>
      );

    case 'values-grid':
      return (
        <SectionWrapper>
          <ValuesGridSection section={section} />
        </SectionWrapper>
      );

    case 'expertise-grid':
      return (
        <SectionWrapper>
          <ExpertiseGridSection section={section} />
        </SectionWrapper>
      );

    case 'stats-grid':
      return (
        <SectionWrapper>
          <StatsGridSection section={section} />
        </SectionWrapper>
      );

    case 'certifications-grid':
      return (
        <SectionWrapper>
          <CertificationsGridSection section={section} />
        </SectionWrapper>
      );

    case 'contact-grid':
      return (
        <SectionWrapper>
          <ContactGridSection section={section} />
        </SectionWrapper>
      );

    case 'contact-info':
      return (
        <SectionWrapper>
          <ContactInfoSection section={section} />
        </SectionWrapper>
      );

    case 'lead-capture-form':
      return (
        <SectionWrapper>
          <LeadCaptureFormSection section={section} />
        </SectionWrapper>
      );

    case 'faq':
      return (
        <SectionWrapper>
          <FAQSection section={section} />
        </SectionWrapper>
      );

    case 'process-steps':
      return (
        <SectionWrapper>
          <ProcessStepsSection section={section} />
        </SectionWrapper>
      );

    case 'cta':
      return (
        <CTASection 
          variant={section.variant}
          title={section.title || ''}
          description={section.description || ''}
          cta={section.cta}
        />
      );

    default:
      console.warn(`Unknown section type: ${type}`);
      return null;
  }
}

// Individual section components

function TextImageSection({ section }: { section: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        {section.content && (
          <div className="prose prose-lg text-gray-600 mb-8">
            {renderRichText(section.content, { allowMarkdown: true })}
          </div>
        )}
        {section.features && (
          <div className="space-y-4">
            {section.features.map((feature: any, index: number) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {section.image && (
        <div className="relative">
          <img
            src={section.image.src}
            alt={section.image.alt}
            width={section.image.width}
            height={section.image.height}
            className="rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
}

function TextContentSection({ section }: { section: any }) {
  return (
    <div className="max-w-4xl mx-auto">
      {section.content && (
        <div className="prose prose-lg text-gray-600 mb-8">
          {renderRichText(section.content, { allowMarkdown: true })}
        </div>
      )}
      {section.highlights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {section.highlights.map((highlight: string, index: number) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg">
              <div className="prose text-gray-700">
                {renderRichText(highlight, { allowMarkdown: true })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TextColumnsSection({ section }: { section: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {section.columns?.map((column: any, index: number) => (
        <div key={index}>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{column.title}</h3>
          <div className="prose text-gray-600">
            {renderRichText(column.content, { allowMarkdown: true })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ServiceCardsSection({ section }: { section: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {section.services?.map((service: any) => (
        <div key={service.id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
          <p className="text-gray-600 mb-6">{service.description}</p>
          {service.features && (
            <ul className="space-y-2">
              {service.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function ValuesGridSection({ section }: { section: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {section.values?.map((value: any, index: number) => (
        <div key={index} className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            {/* Icon would be rendered here based on value.icon */}
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
          <p className="text-gray-600">{value.description}</p>
        </div>
      ))}
    </div>
  );
}

function StatsGridSection({ section }: { section: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {section.stats?.map((stat: any, index: number) => (
        <div key={index} className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
          <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
          <div className="text-sm text-gray-600">{stat.description}</div>
        </div>
      ))}
    </div>
  );
}

function ExpertiseGridSection({ section }: { section: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {section.areas?.map((area: any, index: number) => (
        <div key={index} className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{area.category}</h3>
          <ul className="space-y-2">
            {area.items.map((item: string, itemIndex: number) => (
              <li key={itemIndex} className="flex items-center text-gray-600">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function CertificationsGridSection({ section }: { section: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {section.certifications?.map((cert: any, index: number) => (
        <div key={index} className="text-center bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <img
            src={cert.logo}
            alt={cert.name}
            className="w-16 h-16 mx-auto mb-4"
          />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{cert.name}</h3>
          <p className="text-sm text-gray-600">{cert.description}</p>
        </div>
      ))}
    </div>
  );
}

function ContactGridSection({ section }: { section: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {section.options?.map((option: any, index: number) => (
        <div key={index} className="text-center bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            {/* Icon would be rendered here based on option.icon */}
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">{option.title}</h3>
          <p className="text-gray-600 mb-6">{option.description}</p>
          <a
            href={option.cta.href}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md ${
              option.cta.variant === 'primary'
                ? 'text-white bg-blue-600 hover:bg-blue-700'
                : 'text-blue-600 bg-blue-100 hover:bg-blue-200'
            }`}
          >
            {option.cta.text}
          </a>
        </div>
      ))}
    </div>
  );
}

function ContactInfoSection({ section }: { section: any }) {
  // This would render contact information from site config
  return (
    <div className="bg-gray-50 p-8 rounded-lg">
      <p className="text-gray-600">Contact information would be rendered here from site config.</p>
    </div>
  );
}

function LeadCaptureFormSection({ section }: { section: any }) {
  // This would render the lead capture form component
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <p className="text-gray-600">Lead capture form would be rendered here.</p>
      </div>
    </div>
  );
}

function FAQSection({ section }: { section: any }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        {section.faqs?.map((faq: any, index: number) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
            <div className="prose text-gray-600">
              {renderRichText(faq.answer, { allowMarkdown: true })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcessStepsSection({ section }: { section: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {section.steps?.map((step: any, index: number) => (
        <div key={index} className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold">{index + 1}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
          <p className="text-gray-600 mb-2">{step.description}</p>
          <p className="text-sm text-blue-600 font-medium">{step.duration}</p>
        </div>
      ))}
    </div>
  );
}