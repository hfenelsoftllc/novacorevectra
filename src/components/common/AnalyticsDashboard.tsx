'use client';

import React, { useState, useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ConversionFunnel } from '@/types/analytics';

/**
 * Analytics dashboard props
 */
interface AnalyticsDashboardProps {
  className?: string;
  showRealTime?: boolean;
}

/**
 * Real-time analytics data
 */
interface RealTimeData {
  activeUsers: number;
  pageViews: number;
  conversions: number;
  topPages: Array<{ page: string; views: number }>;
  conversionFunnel: ConversionFunnel[];
}

/**
 * Analytics dashboard component (for development/admin use)
 */
export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = '',
  showRealTime = false,
}) => {
  const { trackEvent } = useAnalytics();
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({
    activeUsers: 0,
    pageViews: 0,
    conversions: 0,
    topPages: [],
    conversionFunnel: [],
  });

  // Simulate real-time data updates (in production, this would connect to analytics API)
  useEffect(() => {
    if (!showRealTime) return;

    const updateRealTimeData = () => {
      // Simulate data from localStorage/sessionStorage for demo purposes
      const sessionData = {
        activeUsers: Math.floor(Math.random() * 50) + 10,
        pageViews: Math.floor(Math.random() * 200) + 50,
        conversions: Math.floor(Math.random() * 10) + 2,
        topPages: [
          { page: '/', views: Math.floor(Math.random() * 100) + 20 },
          { page: '/services', views: Math.floor(Math.random() * 80) + 15 },
          { page: '/governance', views: Math.floor(Math.random() * 60) + 10 },
          { page: '/contact', views: Math.floor(Math.random() * 40) + 5 },
        ],
        conversionFunnel: [
          { step: 'Landing', visitors: 100, conversions: 85, conversionRate: 85 },
          { step: 'Services View', visitors: 85, conversions: 60, conversionRate: 70.6 },
          { step: 'CTA Click', visitors: 60, conversions: 35, conversionRate: 58.3 },
          { step: 'Form Start', visitors: 35, conversions: 25, conversionRate: 71.4 },
          { step: 'Form Submit', visitors: 25, conversions: 20, conversionRate: 80 },
          { step: 'Conversion', visitors: 20, conversions: 18, conversionRate: 90 },
        ],
      };

      setRealTimeData(sessionData);
    };

    // Update immediately and then every 30 seconds
    updateRealTimeData();
    const interval = setInterval(updateRealTimeData, 30000);

    return () => clearInterval(interval);
  }, [showRealTime]);

  /**
   * Test analytics event
   */
  const testAnalyticsEvent = () => {
    trackEvent({
      event: 'test_event',
      category: 'testing',
      action: 'dashboard_test',
      label: 'analytics_dashboard',
      value: 1,
      customParameters: {
        test_timestamp: Date.now(),
        dashboard_version: '1.0',
      },
    });
  };

  if (process.env.NODE_ENV === 'production' && !process.env['NEXT_PUBLIC_SHOW_ANALYTICS_DASHBOARD']) {
    return null; // Hide in production unless explicitly enabled
  }

  return (
    <div className={`analytics-dashboard bg-gray-50 p-6 rounded-lg ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <button
          onClick={testAnalyticsEvent}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Test Event
        </button>
      </div>

      {showRealTime && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
            <p className="text-2xl font-bold text-green-600">{realTimeData.activeUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Page Views</h3>
            <p className="text-2xl font-bold text-blue-600">{realTimeData.pageViews}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Conversions</h3>
            <p className="text-2xl font-bold text-purple-600">{realTimeData.conversions}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
            <p className="text-2xl font-bold text-orange-600">
              {realTimeData.pageViews > 0 
                ? ((realTimeData.conversions / realTimeData.pageViews) * 100).toFixed(1)
                : 0}%
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Pages */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
          <div className="space-y-3">
            {realTimeData.topPages.map((page) => (
              <div key={page.page} className="flex justify-between items-center">
                <span className="text-gray-700">{page.page}</span>
                <span className="font-medium text-gray-900">{page.views} views</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
          <div className="space-y-3">
            {realTimeData.conversionFunnel.map((step) => (
              <div key={step.step} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{step.step}</span>
                  <span className="text-sm text-gray-500">
                    {step.conversions}/{step.visitors} ({step.conversionRate.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${step.conversionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Events Log */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
        <div className="text-sm text-gray-600">
          <p>Events are being tracked and sent to Google Analytics.</p>
          <p className="mt-2">
            Check the browser console (F12) to see event details in development mode.
          </p>
          <p className="mt-2">
            In production, events will be visible in your Google Analytics dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};