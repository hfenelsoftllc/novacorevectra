/**
 * Interface for analytics events
 */
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  customParameters?: Record<string, unknown>;
}

/**
 * Interface for conversion funnel data
 */
export interface ConversionFunnel {
  step: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
}