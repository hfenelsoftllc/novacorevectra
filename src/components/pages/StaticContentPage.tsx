'use client';

/**
 * Static content page component for build-time content loading
 * Works with Next.js static export
 */

import React from 'react';
import { PageContent, SiteConfig } from '../../types/content';
import { ContentRenderer } from '../common/ContentRenderer';
import { renderRichText } from '../../utils/richTextRenderer';

interface StaticContentPageProps {
  pageContent: PageContent;
  siteConfig: SiteConfig;
}

export function StaticContentPage({ pageContent, siteConfig }: StaticContentPageProps) {
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

      {/* Footer with Site Config */}
      <footer className="bg-slate-800 text-white">
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
              <p className="text-slate-300 mb-4">{siteConfig.site.description}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-slate-300">
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
                  className="text-slate-300 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
                <a
                  href={siteConfig.contact.social.twitter}
                  className="text-slate-300 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 {siteConfig.site.name}. All rights reserved.</p>
            <p className="text-sm mt-2">
              Content Version: {pageContent.version} | 
              Last Updated: {new Date(pageContent.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}