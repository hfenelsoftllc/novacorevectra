/**
 * SEO utilities for meta tags, structured data, and sitemap generation
 */

import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
  locale?: string;
  alternateLocales?: string[];
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface StructuredDataConfig {
  type: 'Organization' | 'WebSite' | 'WebPage' | 'Article' | 'Service' | 'BreadcrumbList';
  data: Record<string, any>;
}

/**
 * Generate comprehensive metadata for Next.js pages
 */
export const generateMetadata = (config: SEOConfig): Metadata => {
  const {
    title,
    description,
    keywords = [],
    image,
    url,
    type = 'website',
    siteName = 'NovaCoreVectra',
    locale = 'en_US',
    alternateLocales = []
  } = config;

  // Ensure title and description are within SEO limits
  const optimizedTitle = title.length > 60 ? `${title.substring(0, 57)}...` : title;
  const optimizedDescription = description.length > 160 ? `${description.substring(0, 157)}...` : description;

  const metadata: Metadata = {
    title: optimizedTitle,
    description: optimizedDescription,
    keywords: keywords.length > 0 ? keywords : undefined,
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: optimizedTitle,
      description: optimizedDescription,
      type: type,
      siteName: siteName,
      locale: locale,
      alternateLocale: alternateLocales.length > 0 ? alternateLocales : undefined,
      url: url,
      images: image ? [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: optimizedTitle,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: optimizedTitle,
      description: optimizedDescription,
      images: image ? [image] : undefined,
      creator: '@novacorevectra',
      site: '@novacorevectra',
    },
    alternates: {
      canonical: url,
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
    },
  };

  return metadata;
};

/**
 * Generate structured data (JSON-LD) for better SEO
 */
export const generateStructuredData = (config: StructuredDataConfig | any): string => {
  const baseContext = 'https://schema.org';
  
  let structuredData;
  
  // Handle both old and new API formats for backward compatibility
  if (config.type && config.data) {
    // New format: { type: 'Organization', data: { ... } }
    structuredData = {
      '@context': baseContext,
      '@type': config.type,
      ...config.data,
    };
  } else {
    // Old format: { type: 'Organization', name: '...', description: '...', ... }
    const { type, ...data } = config;
    structuredData = {
      '@context': baseContext,
      '@type': type,
      ...data,
    };
  }

  // Return minified JSON for tests and production
  return JSON.stringify(structuredData);
};

/**
 * Generate organization structured data
 */
export const generateOrganizationStructuredData = (): string => {
  return generateStructuredData({
    type: 'Organization',
    data: {
      name: 'NovaCoreVectra',
      description: 'Leading AI consulting and governance solutions for enterprise',
      url: process.env['NEXT_PUBLIC_SITE_URL'] || 'https://novacorevectra.net',
      logo: `${process.env['NEXT_PUBLIC_SITE_URL'] || 'https://novacorevectra.net'}/logo.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-305-504-0206',
        contactType: 'customer service',
        availableLanguage: ['English'],
      },
      sameAs: [
        'https://linkedin.com/company/novacorevectra',
        'https://twitter.com/novacorevectra',
      ],
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'US',
        addressRegion: 'FL',
        addressLocality: 'Homestead',
      },
    },
  });
};

/**
 * Generate website structured data
 */
export const generateWebsiteStructuredData = (): string => {
  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] || 'https://novacorevectra.net';
  
  return generateStructuredData({
    type: 'WebSite',
    data: {
      name: 'NovaCoreVectra',
      description: 'Leading AI consulting and governance solutions for enterprise',
      url: siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  });
};

/**
 * Generate breadcrumb structured data
 */
export const generateBreadcrumbStructuredData = (breadcrumbs: BreadcrumbItem[]): string => {
  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] || 'https://novacorevectra.net';
  
  return generateStructuredData({
    type: 'BreadcrumbList',
    data: {
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${siteUrl}${item.url}`,
      })),
    },
  });
};

/**
 * Generate service structured data
 */
export const generateServiceStructuredData = (service: {
  name: string;
  description: string;
  provider: string;
  areaServed?: string[];
  serviceType?: string;
}): string => {
  return generateStructuredData({
    type: 'Service',
    data: {
      name: service.name,
      description: service.description,
      provider: {
        '@type': 'Organization',
        name: service.provider,
      },
      areaServed: service.areaServed || ['US', 'CA', 'EU'],
      serviceType: service.serviceType || 'AI Consulting',
    },
  });
};

/**
 * Page-specific SEO configurations
 */
export const pageConfigs = {
  home: {
    title: 'NovaCoreVectra - AI Solutions & Governance',
    description: 'Leading AI consulting and governance solutions for enterprise. Discover, design, deploy, and operate AI systems with ISO 42001 compliance and expert guidance.',
    keywords: ['AI consulting', 'artificial intelligence', 'AI governance', 'ISO 42001', 'enterprise AI', 'AI strategy', 'machine learning'],
  },
  services: {
    title: 'AI Services - Strategy, Implementation & Governance | NovaCoreVectra',
    description: 'Comprehensive AI services from strategy development to implementation and governance. Expert consulting for aviation, healthcare, financial services, and public sector.',
    keywords: ['AI services', 'AI implementation', 'AI strategy', 'AI consulting', 'machine learning services', 'AI governance'],
  },
  governance: {
    title: 'AI Governance & ISO 42001 Compliance | NovaCoreVectra',
    description: 'ISO 42001 compliant AI governance solutions. Risk management, compliance mapping, and regulatory frameworks for responsible AI implementation.',
    keywords: ['AI governance', 'ISO 42001', 'AI compliance', 'AI risk management', 'AI ethics', 'regulatory compliance'],
  },
  about: {
    title: 'About NovaCoreVectra - AI Consulting Experts',
    description: 'Learn about NovaCoreVectra\'s mission to empower organizations with ethical AI innovation. Meet our team of AI experts and governance specialists.',
    keywords: ['about NovaCoreVectra', 'AI experts', 'AI consulting team', 'AI governance specialists', 'company mission'],
  },
  contact: {
    title: 'Contact NovaCoreVectra - AI Consulting & Governance',
    description: 'Get in touch with NovaCoreVectra for AI consulting, governance solutions, and expert guidance. Schedule a consultation to discuss your AI strategy.',
    keywords: ['contact NovaCoreVectra', 'AI consultation', 'AI consulting contact', 'schedule consultation', 'AI experts'],
  },
};

/**
 * Generate sitemap data
 */
export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export const generateSitemapData = (): SitemapEntry[] => {
  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] || 'https://novacorevectra.net';
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/services`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/governance`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
};

/**
 * Validate SEO configuration
 */
export const validateSEOConfig = (config: SEOConfig): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.title || config.title.length < 10) {
    errors.push('Title must be at least 10 characters long');
  }

  if (config.title && config.title.length > 60) {
    errors.push('Title should be 60 characters or less for optimal SEO');
  }

  if (!config.description || config.description.length < 50) {
    errors.push('Description must be at least 50 characters long');
  }

  if (config.description && config.description.length > 160) {
    errors.push('Description should be 160 characters or less for optimal SEO');
  }

  if (config.keywords && config.keywords.length > 10) {
    errors.push('Too many keywords - limit to 10 for better SEO');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generate robots.txt content
 */
export const generateRobotsTxt = (): string => {
  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] || 'https://novacorevectra.net';
  
  return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${siteUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /private/

# Allow important pages
Allow: /
Allow: /services
Allow: /governance
Allow: /about
Allow: /contact
`;
};