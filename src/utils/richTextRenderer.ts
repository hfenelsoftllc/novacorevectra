/**
 * Rich text rendering utilities
 * Supports markdown and HTML content with safe rendering
 */

import React from 'react';

/**
 * Rich text rendering options
 */
export interface RichTextOptions {
  allowHtml?: boolean;
  allowMarkdown?: boolean;
  sanitize?: boolean;
  className?: string;
}

/**
 * Render rich text content with markdown support
 */
export function renderRichText(
  content: string, 
  options: RichTextOptions = {}
): React.ReactElement {
  const {
    allowHtml = false,
    allowMarkdown = true,
    sanitize = true,
    className = ''
  } = options;

  if (!content) {
    return React.createElement('div', { className });
  }

  // Process markdown if enabled
  let processedContent = content;
  if (allowMarkdown) {
    processedContent = processMarkdown(processedContent);
  }

  // Sanitize HTML if enabled
  if (sanitize) {
    processedContent = sanitizeHtml(processedContent);
  }

  // Render as HTML if allowed, otherwise as text
  if (allowHtml) {
    return React.createElement('div', {
      className,
      dangerouslySetInnerHTML: { __html: processedContent }
    });
  } else {
    return React.createElement('div', { className }, processedContent);
  }
}

/**
 * Process basic markdown syntax
 */
function processMarkdown(content: string): string {
  return content
    // Bold text: **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    
    // Italic text: *text* or _text_
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    
    // Code: `code`
    .replace(/`(.*?)`/g, '<code>$1</code>')
    
    // Links: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Line breaks
    .replace(/\n/g, '<br>');
}

/**
 * Basic HTML sanitization
 */
function sanitizeHtml(html: string): string {
  // Allow only safe HTML tags
  const allowedTags = [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'code', 'pre',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'span', 'div'
  ];

  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');

  // Remove disallowed tags (basic implementation)
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      return match;
    }
    return '';
  });

  return sanitized;
}

/**
 * Extract plain text from rich text content
 */
export function extractPlainText(content: string): string {
  return content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
    .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
    .replace(/`(.*?)`/g, '$1') // Remove markdown code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Extract link text
    .replace(/\n/g, ' ') // Replace line breaks with spaces
    .trim();
}

/**
 * Truncate rich text content to specified length
 */
export function truncateRichText(
  content: string, 
  maxLength: number, 
  suffix: string = '...'
): string {
  const plainText = extractPlainText(content);
  
  if (plainText.length <= maxLength) {
    return content;
  }
  
  const truncated = plainText.substring(0, maxLength - suffix.length);
  const lastSpace = truncated.lastIndexOf(' ');
  
  // Truncate at word boundary if possible
  const finalText = lastSpace > maxLength * 0.8 
    ? truncated.substring(0, lastSpace)
    : truncated;
    
  return finalText + suffix;
}

/**
 * Convert content to SEO-friendly format
 */
export function toSeoText(content: string): string {
  return extractPlainText(content)
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Validate rich text content
 */
export function validateRichText(content: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check for unclosed markdown tags
  const boldMatches = (content.match(/\*\*/g) || []).length;
  if (boldMatches % 2 !== 0) {
    errors.push('Unclosed bold markdown tags (**)');
  }
  
  const italicMatches = (content.match(/(?<!\*)\*(?!\*)/g) || []).length;
  if (italicMatches % 2 !== 0) {
    errors.push('Unclosed italic markdown tags (*)');
  }
  
  const codeMatches = (content.match(/`/g) || []).length;
  if (codeMatches % 2 !== 0) {
    errors.push('Unclosed code markdown tags (`)');
  }
  
  // Check for malformed links
  const linkRegex = /\[([^\]]*)\]\(([^)]*)\)/g;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(content)) !== null) {
    const [, text, url] = linkMatch;
    if (!text.trim()) {
      errors.push('Empty link text found');
    }
    if (!url.trim()) {
      errors.push('Empty link URL found');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Rich text content statistics
 */
export function getRichTextStats(content: string): {
  characters: number;
  words: number;
  paragraphs: number;
  links: number;
  images: number;
} {
  const plainText = extractPlainText(content);
  
  return {
    characters: plainText.length,
    words: plainText.split(/\s+/).filter(word => word.length > 0).length,
    paragraphs: content.split(/\n\s*\n/).length,
    links: (content.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length,
    images: (content.match(/!\[([^\]]*)\]\([^)]+\)/g) || []).length
  };
}