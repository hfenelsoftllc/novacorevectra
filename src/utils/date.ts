/**
 * Date utility functions for formatting and manipulation
 */

/**
 * Format a date to a readable string
 */
export const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Format a date to ISO string
 */
export const formatDateISO = (date: Date | string | number): string => {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }

  return dateObj.toISOString();
};

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 */
export const getRelativeTime = (date: Date | string | number): string => {
  const dateObj = new Date(date);
  const now = new Date();
  
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }

  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (Math.abs(diffInSeconds) < 60) {
    return 'just now';
  }
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
    if (count >= 1) {
      const suffix = count === 1 ? '' : 's';
      const timeString = `${count} ${interval.label}${suffix}`;
      return diffInSeconds < 0 ? `in ${timeString}` : `${timeString} ago`;
    }
  }
  
  return 'just now';
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date | string | number): boolean => {
  const dateObj = new Date(date);
  const today = new Date();
  
  return dateObj.toDateString() === today.toDateString();
};

/**
 * Check if a date is in the past
 */
export const isPast = (date: Date | string | number): boolean => {
  const dateObj = new Date(date);
  const now = new Date();
  
  return dateObj.getTime() < now.getTime();
};

/**
 * Check if a date is in the future
 */
export const isFuture = (date: Date | string | number): boolean => {
  const dateObj = new Date(date);
  const now = new Date();
  
  return dateObj.getTime() > now.getTime();
};