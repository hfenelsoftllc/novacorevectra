/**
 * A/B Testing configuration for content variants
 */

import { ABTest } from '@/utils/analytics';

/**
 * Hero section A/B test
 */
export const HERO_SECTION_TEST: ABTest = {
  id: 'hero_section_v1',
  name: 'Hero Section Messaging Test',
  trafficAllocation: 50, // 50% of users in test
  variants: [
    {
      id: 'control',
      name: 'Control - Original',
      weight: 50,
      content: {
        headline: 'Leading AI Solutions & Governance',
        subheadline: 'Empower your organization with ethical AI innovation and comprehensive governance frameworks.',
        ctaText: 'Get Started',
        ctaVariant: 'primary' as const,
      },
    },
    {
      id: 'variant_a',
      name: 'Variant A - Benefits Focused',
      weight: 50,
      content: {
        headline: 'Transform Your Business with Trusted AI',
        subheadline: 'Reduce costs, increase efficiency, and ensure compliance with our proven AI solutions.',
        ctaText: 'Start Your AI Journey',
        ctaVariant: 'primary' as const,
      },
    },
  ],
};

/**
 * CTA button text A/B test
 */
export const CTA_BUTTON_TEST: ABTest = {
  id: 'cta_button_v1',
  name: 'CTA Button Text Test',
  trafficAllocation: 30, // 30% of users in test
  variants: [
    {
      id: 'control',
      name: 'Control - Get Started',
      weight: 33,
      content: {
        primaryCTA: 'Get Started',
        secondaryCTA: 'Learn More',
      },
    },
    {
      id: 'variant_a',
      name: 'Variant A - Action Oriented',
      weight: 33,
      content: {
        primaryCTA: 'Book Consultation',
        secondaryCTA: 'View Services',
      },
    },
    {
      id: 'variant_b',
      name: 'Variant B - Value Focused',
      weight: 34,
      content: {
        primaryCTA: 'Start Free Assessment',
        secondaryCTA: 'See Case Studies',
      },
    },
  ],
};

/**
 * Services section layout A/B test
 */
export const SERVICES_LAYOUT_TEST: ABTest = {
  id: 'services_layout_v1',
  name: 'Services Section Layout Test',
  trafficAllocation: 25, // 25% of users in test
  variants: [
    {
      id: 'control',
      name: 'Control - Grid Layout',
      weight: 50,
      content: {
        layout: 'grid',
        showIcons: true,
        showDescriptions: true,
        cardsPerRow: 3,
      },
    },
    {
      id: 'variant_a',
      name: 'Variant A - List Layout',
      weight: 50,
      content: {
        layout: 'list',
        showIcons: true,
        showDescriptions: true,
        cardsPerRow: 1,
      },
    },
  ],
};

/**
 * Form fields A/B test
 */
export const FORM_FIELDS_TEST: ABTest = {
  id: 'form_fields_v1',
  name: 'Lead Capture Form Fields Test',
  trafficAllocation: 40, // 40% of users in test
  variants: [
    {
      id: 'control',
      name: 'Control - Standard Fields',
      weight: 50,
      content: {
        fields: ['firstName', 'lastName', 'email', 'company', 'jobTitle'],
        requiredFields: ['firstName', 'lastName', 'email', 'company'],
        showOptionalLabel: true,
      },
    },
    {
      id: 'variant_a',
      name: 'Variant A - Minimal Fields',
      weight: 50,
      content: {
        fields: ['firstName', 'email', 'company'],
        requiredFields: ['firstName', 'email', 'company'],
        showOptionalLabel: false,
      },
    },
  ],
};

/**
 * Industry selector A/B test
 */
export const INDUSTRY_SELECTOR_TEST: ABTest = {
  id: 'industry_selector_v1',
  name: 'Industry Selector Display Test',
  trafficAllocation: 35, // 35% of users in test
  variants: [
    {
      id: 'control',
      name: 'Control - Tabs',
      weight: 50,
      content: {
        displayType: 'tabs',
        showIcons: true,
        showDescriptions: true,
        defaultIndustry: 'airlines',
      },
    },
    {
      id: 'variant_a',
      name: 'Variant A - Dropdown',
      weight: 50,
      content: {
        displayType: 'dropdown',
        showIcons: false,
        showDescriptions: false,
        defaultIndustry: null, // Let user choose
      },
    },
  ],
};

/**
 * All A/B tests configuration
 */
export const AB_TESTS = {
  HERO_SECTION: HERO_SECTION_TEST,
  CTA_BUTTON: CTA_BUTTON_TEST,
  SERVICES_LAYOUT: SERVICES_LAYOUT_TEST,
  FORM_FIELDS: FORM_FIELDS_TEST,
  INDUSTRY_SELECTOR: INDUSTRY_SELECTOR_TEST,
} as const;

/**
 * A/B test IDs for easy reference
 */
export const AB_TEST_IDS = {
  HERO_SECTION: 'hero_section_v1',
  CTA_BUTTON: 'cta_button_v1',
  SERVICES_LAYOUT: 'services_layout_v1',
  FORM_FIELDS: 'form_fields_v1',
  INDUSTRY_SELECTOR: 'industry_selector_v1',
} as const;

/**
 * Conversion events for A/B tests
 */
export const AB_TEST_CONVERSIONS = {
  HERO_CTA_CLICK: 'hero_cta_click',
  FORM_SUBMISSION: 'form_submission',
  SERVICE_INQUIRY: 'service_inquiry',
  CONSULTATION_BOOKING: 'consultation_booking',
  NEWSLETTER_SIGNUP: 'newsletter_signup',
} as const;