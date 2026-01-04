import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import '../src/styles/globals.css';
import { Header, Footer } from '../src/components/layout';
import { 
  AnalyticsProvider, 
  GoogleAnalyticsScript, 
  ErrorBoundary, 
  GlobalAnnouncer,
  PerformanceMonitor,
  PageStructuredData
} from '../src/components/common';
import { generateMetadata as generateSEOMetadata, pageConfigs } from '../src/utils/seo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = generateSEOMetadata({
  ...pageConfigs.home,
  url: process.env['NEXT_PUBLIC_SITE_URL'] || 'https://novacorevectra.com',
  image: `${process.env['NEXT_PUBLIC_SITE_URL'] || 'https://novacorevectra.com'}/og-image.png`,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalyticsScript />
        <PageStructuredData />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            <AnalyticsProvider>
              <PerformanceMonitor />
              
              {/* Global accessibility announcer */}
              <GlobalAnnouncer />
              
              {/* Skip to main content link for keyboard navigation */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium"
              >
                Skip to main content
              </a>
              <Header />
              <main id="main-content" className="flex-1" tabIndex={-1}>
                {children}
              </main>
              <Footer />
            </AnalyticsProvider>
          </Suspense>
        </ErrorBoundary>
      </body>
    </html>
  );
}