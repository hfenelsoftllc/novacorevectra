'use client';

/**
 * Static content page component for build-time content loading
 * Works with Next.js static export
 */

import React from 'react';
import { PageContent } from '../../types/content';
import { ContentRenderer } from '../common/ContentRenderer';
import { renderRichText } from '../../utils/richTextRenderer';

interface StaticContentPageProps {
  pageContent: PageContent;
}

export function StaticContentPage({ pageContent }: StaticContentPageProps) {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              {renderRichText(pageContent.hero.title, { 
                allowMarkdown: true,
                allowHtml: true,
                className: 'inline' 
              })}
            </h1>
            
            {pageContent.hero.subtitle && (
              <p className="text-xl md:text-2xl mb-6 text-white">
                {renderRichText(pageContent.hero.subtitle, { 
                  allowMarkdown: true,
                  allowHtml: true,
                  className: 'inline' 
                })}
              </p>
            )}
            
            <p className="text-lg mb-8 max-w-3xl mx-auto text-white">
              {renderRichText(pageContent.hero.description, { 
                allowMarkdown: true,
                allowHtml: true,
                className: 'inline' 
              })}
            </p>

            {/* CTA Buttons */}
            {pageContent.hero.cta && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {pageContent.hero.cta.primary && (
                  <a
                    href={pageContent.hero.cta.primary.href}
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    {pageContent.hero.cta.primary.text}
                  </a>
                )}
                
                {pageContent.hero.cta.secondary && (
                  <a
                    href={pageContent.hero.cta.secondary.href}
                    className="inline-flex items-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-slate-900 transition-colors"
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

      
    </div>
  );
}