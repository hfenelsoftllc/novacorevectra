/**
 * Example of a content-managed page component
 * Demonstrates how to use the content management system
 */

import React from 'react';
import { usePageContent, useSiteConfig } from '../../hooks/useContent';
import { ContentRenderer } from '../common/ContentRenderer';
import { renderRichText } from '../../utils/richTextRenderer';

interface ContentManagedPageProps {
  pageName: string;
}

export function ContentManagedPage({ pageName }: ContentManagedPageProps) {
  const { config: siteConfig, loading: siteLoading, error: siteError } = useSiteConfig();
  const { content: pageContent, loading: pageLoading, error: pageError } = usePageContent(pageName);

  // Loading state
  if (siteLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (siteError || pageError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Content Loading Error</h1>
          <p className="text-gray-600 mb-4">
            {siteError?.message || pageError?.message || 'Failed to load content'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No content state
  if (!pageContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600">The requested page content could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* SEO Meta Tags (would be handled by Next.js Head component) */}
      <title>{pageContent.meta.title}</title>
      <meta name="description" content={pageContent.meta.description} />
      <meta name="keywords" content={pageContent.meta.keywords.join(', ')} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {renderRichText(pageContent.hero.title, { 
                allowMarkdown: true, 
                className: 'inline' 
              })}
            </h1>
            
            {pageContent.hero.subtitle && (
              <p className="text-xl md:text-2xl mb-6 text-blue-100">
                {renderRichText(pageContent.hero.subtitle, { 
                  allowMarkdown: true, 
                  className: 'inline' 
                })}
              </p>
            )}
            
            <p className="text-lg mb-8 max-w-3xl mx-auto text-blue-50">
              {renderRichText(pageContent.hero.description, { 
                allowMarkdown: true, 
                className: 'inline' 
              })}
            </p>

            {/* CTA Buttons */}
            {pageContent.hero.cta && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {pageContent.hero.cta.primary && (
                  <a
                    href={pageContent.hero.cta.primary.href}
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition-colors"
                  >
                    {pageContent.hero.cta.primary.text}
                  </a>
                )}
                
                {pageContent.hero.cta.secondary && (
                  <a
                    href={pageContent.hero.cta.secondary.href}
                    className="inline-flex items-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    {pageContent.hero.cta.secondary.text}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Hero Image */}
          {pageContent.hero.image && (
            <div className="mt-16 text-center">
              <img
                src={pageContent.hero.image.src}
                alt={pageContent.hero.image.alt}
                width={pageContent.hero.image.width}
                height={pageContent.hero.image.height}
                className="rounded-lg shadow-2xl mx-auto max-w-full h-auto"
              />
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Content Sections */}
      <ContentRenderer sections={pageContent.sections} />

      {/* Footer with Site Config */}
      {siteConfig && (
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <img
                    src={siteConfig.site.logo.src}
                    alt={siteConfig.site.logo.alt}
                    width={siteConfig.site.logo.width}
                    height={siteConfig.site.logo.height}
                    className="h-8 w-auto"
                  />
                </div>
                <p className="text-gray-300 mb-4">{siteConfig.site.description}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact</h3>
                <div className="space-y-2 text-gray-300">
                  <p>{siteConfig.contact.email}</p>
                  <p>{siteConfig.contact.phone}</p>
                  <p>
                    {siteConfig.contact.address.street}<br />
                    {siteConfig.contact.address.city}, {siteConfig.contact.address.state} {siteConfig.contact.address.zip}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a
                    href={siteConfig.contact.social.linkedin}
                    className="text-gray-300 hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                  <a
                    href={siteConfig.contact.social.twitter}
                    className="text-gray-300 hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Twitter
                  </a>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 {siteConfig.site.name}. All rights reserved.</p>
              <p className="text-sm mt-2">
                Content Version: {pageContent.version} | 
                Last Updated: {new Date(pageContent.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

// Example usage in Next.js pages
export function HomePage() {
  return <ContentManagedPage pageName="home" />;
}

export function ServicesPage() {
  return <ContentManagedPage pageName="services" />;
}

export function GovernancePage() {
  return <ContentManagedPage pageName="governance" />;
}

export function AboutPage() {
  return <ContentManagedPage pageName="about" />;
}

export function ContactPage() {
  return <ContentManagedPage pageName="contact" />;
}