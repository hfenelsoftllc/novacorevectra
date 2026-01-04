'use client';

import React from 'react';

interface AccessibilityAnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
  className?: string;
}

/**
 * Component for announcing content changes to screen readers
 * Uses aria-live regions to communicate dynamic content updates
 */
export const AccessibilityAnnouncer: React.FC<AccessibilityAnnouncerProps> = ({
  message,
  priority = 'polite',
  className = ''
}) => {
  return (
    <div
      className={`sr-only ${className}`}
      aria-live={priority}
      aria-atomic="true"
      role="status"
    >
      {message}
    </div>
  );
};

/**
 * Global announcer component that can be used throughout the app
 */
export const GlobalAnnouncer: React.FC = () => {
  return (
    <>
      <div
        id="polite-announcer"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      />
      <div
        id="assertive-announcer"
        className="sr-only"
        aria-live="assertive"
        aria-atomic="true"
        role="alert"
      />
    </>
  );
};

/**
 * Utility function to announce messages globally
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) => {
  const announcerId = priority === 'assertive' ? 'assertive-announcer' : 'polite-announcer';
  const announcer = document.getElementById(announcerId);
  
  if (announcer) {
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);
  }
};