/**
 * Content management types for the marketing site
 */

export interface ContentVersion {
  version: string;
  lastUpdated: string;
}

export interface SiteConfig extends ContentVersion {
  site: {
    name: string;
    tagline: string;
    description: string;
    url: string;
    logo: ImageAsset;
    favicon: string;
    theme: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
    };
  };
  contact: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    social: {
      linkedin: string;
      twitter: string;
    };
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string[];
    author: string;
    twitterHandle: string;
  };
}

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface CTAButton {
  text: string;
  href: string;
  variant: 'primary' | 'secondary' | 'outline';
}

export interface PageMeta {
  title: string;
  description: string;
  keywords: string[];
}

export interface PageContent extends ContentVersion {
  page: string;
  meta: PageMeta;
  hero: HeroSection;
  sections: ContentSection[];
}

export interface HeroSection {
  title: string;
  subtitle: string;
  description: string;
  cta?: {
    primary?: CTAButton;
    secondary?: CTAButton;
  };
  image?: ImageAsset;
}

export interface ContentSection {
  id: string;
  type: SectionType;
  title?: string;
  description?: string;
  content?: string;
  [key: string]: any; // Allow additional properties for specific section types
}

export type SectionType =
  | 'text-image'
  | 'text-content'
  | 'text-columns'
  | 'process-lifecycle'
  | 'industry-variants'
  | 'compliance-section'
  | 'services-grid'
  | 'service-cards'
  | 'standards-grid'
  | 'values-grid'
  | 'expertise-grid'
  | 'stats-grid'
  | 'certifications-grid'
  | 'contact-grid'
  | 'contact-info'
  | 'lead-capture-form'
  | 'faq'
  | 'process-steps'
  | 'cta';

export interface TextImageSection extends ContentSection {
  type: 'text-image';
  content: string;
  features?: Array<{
    title: string;
    description: string;
  }>;
  image?: ImageAsset;
}

export interface TextColumnsSection extends ContentSection {
  type: 'text-columns';
  columns: Array<{
    title: string;
    content: string;
  }>;
}

export interface ValuesGridSection extends ContentSection {
  type: 'values-grid';
  values: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

export interface StatsGridSection extends ContentSection {
  type: 'stats-grid';
  stats: Array<{
    value: string;
    label: string;
    description: string;
  }>;
}

export interface FAQSection extends ContentSection {
  type: 'faq';
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export interface CTASection extends ContentSection {
  type: 'cta';
  variant: 'primary' | 'secondary' | 'consultation' | 'demo' | 'whitepaper';
  cta: CTAButton;
}

export interface ProcessStepsSection extends ContentSection {
  type: 'process-steps';
  steps: Array<{
    title: string;
    description: string;
    duration: string;
  }>;
}

export interface ServiceCardsSection extends ContentSection {
  type: 'service-cards';
  services: Array<{
    id: string;
    title: string;
    description: string;
    features: string[];
  }>;
}

export interface ContactGridSection extends ContentSection {
  type: 'contact-grid';
  options: Array<{
    type: string;
    title: string;
    description: string;
    icon: string;
    cta: CTAButton;
  }>;
}

export interface ExpertiseGridSection extends ContentSection {
  type: 'expertise-grid';
  areas: Array<{
    category: string;
    items: string[];
  }>;
}

export interface CertificationsGridSection extends ContentSection {
  type: 'certifications-grid';
  certifications: Array<{
    name: string;
    description: string;
    logo: string;
  }>;
}

// Rich text formatting support
export interface RichTextContent {
  type: 'rich-text';
  content: string; // Markdown or HTML content
  format: 'markdown' | 'html';
}

// Content versioning
export interface ContentHistory {
  contentId: string;
  versions: Array<{
    version: string;
    timestamp: string;
    author: string;
    changes: string[];
    content: any;
  }>;
}

// Content update mechanisms
export interface ContentUpdate {
  contentId: string;
  version: string;
  timestamp: string;
  author: string;
  changes: ContentChange[];
}

export interface ContentChange {
  path: string; // JSON path to the changed property
  operation: 'add' | 'update' | 'delete';
  oldValue?: any;
  newValue?: any;
}

// Content loading and caching
export interface ContentCache {
  [key: string]: {
    content: any;
    timestamp: number;
    version: string;
  };
}

export interface ContentLoadOptions {
  useCache?: boolean;
  version?: string;
  fallback?: any;
}