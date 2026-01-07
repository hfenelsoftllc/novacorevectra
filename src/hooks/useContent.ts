/**
 * React hooks for content management
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  SiteConfig, 
  PageContent, 
  ContentLoadOptions,
  ContentHistory 
} from '../types/content';
import { 
  contentManager, 
  loadSiteConfig, 
  loadPageContent,
  getContentHistory 
} from '../utils/contentManager';

/**
 * Hook for loading site configuration
 */
export function useSiteConfig(options: ContentLoadOptions = {}) {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const siteConfig = await loadSiteConfig(options);
      setConfig(siteConfig);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load site config'));
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    error,
    reload: loadConfig
  };
}

/**
 * Hook for loading page content
 */
export function usePageContent(page: string, options: ContentLoadOptions = {}) {
  const [content, setContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadContent = useCallback(async () => {
    if (!page) return;
    
    try {
      setLoading(true);
      setError(null);
      const pageContent = await loadPageContent(page, options);
      setContent(pageContent);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to load page content for ${page}`));
    } finally {
      setLoading(false);
    }
  }, [page, options]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  return {
    content,
    loading,
    error,
    reload: loadContent
  };
}

/**
 * Hook for content versioning and history
 */
export function useContentHistory(contentId: string) {
  const [history, setHistory] = useState<ContentHistory | null>(null);
  const [loading, setLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!contentId) return;
    
    try {
      setLoading(true);
      const contentHistory = getContentHistory(contentId);
      setHistory(contentHistory || null);
    } catch (err) {
      console.error('Failed to load content history:', err);
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    loading,
    reload: loadHistory
  };
}

/**
 * Hook for content caching status
 */
export function useContentCache() {
  const [cacheStatus, setCacheStatus] = useState<{ [key: string]: { version: string; age: number } }>({});

  const refreshCacheStatus = useCallback(() => {
    const status = contentManager.getCacheStatus();
    setCacheStatus(status);
  }, []);

  const clearCache = useCallback((key?: string) => {
    contentManager.clearCache(key);
    refreshCacheStatus();
  }, [refreshCacheStatus]);

  useEffect(() => {
    refreshCacheStatus();
    
    // Refresh cache status every 30 seconds
    const interval = setInterval(refreshCacheStatus, 30000);
    return () => clearInterval(interval);
  }, [refreshCacheStatus]);

  return {
    cacheStatus,
    clearCache,
    refresh: refreshCacheStatus
  };
}

/**
 * Hook for content updates (admin functionality)
 */
export function useContentUpdates() {
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<Error | null>(null);

  const updateContent = useCallback(async (
    contentId: string,
    changes: Array<{ path: string; operation: 'add' | 'update' | 'delete'; oldValue?: any; newValue?: any }>,
    author?: string
  ) => {
    try {
      setUpdating(true);
      setUpdateError(null);
      await contentManager.updateContent(contentId, changes, author);
    } catch (err) {
      setUpdateError(err instanceof Error ? err : new Error('Failed to update content'));
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  const rollbackContent = useCallback(async (contentId: string, version: string) => {
    try {
      setUpdating(true);
      setUpdateError(null);
      await contentManager.rollbackContent(contentId, version);
    } catch (err) {
      setUpdateError(err instanceof Error ? err : new Error('Failed to rollback content'));
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  return {
    updating,
    updateError,
    updateContent,
    rollbackContent
  };
}

/**
 * Hook for content validation
 */
export function useContentValidation() {
  const validateContent = useCallback((content: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validate required fields
    if (!content.version) {
      errors.push('Content version is required');
    }

    if (!content.lastUpdated) {
      errors.push('Last updated timestamp is required');
    }

    // Validate version format
    if (content.version && !/^\d+\.\d+\.\d+/.test(content.version)) {
      errors.push('Invalid version format (expected: x.y.z)');
    }

    // Validate timestamp format
    if (content.lastUpdated && isNaN(Date.parse(content.lastUpdated))) {
      errors.push('Invalid timestamp format');
    }

    // Page-specific validation
    if (content.page) {
      if (!content.meta) {
        errors.push('Page meta information is required');
      } else {
        if (!content.meta.title) {
          errors.push('Page title is required');
        }
        if (!content.meta.description) {
          errors.push('Page description is required');
        }
      }

      if (!content.hero) {
        errors.push('Hero section is required for pages');
      } else {
        if (!content.hero.title) {
          errors.push('Hero title is required');
        }
        if (!content.hero.description) {
          errors.push('Hero description is required');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  return { validateContent };
}

/**
 * Hook for content search and filtering
 */
export function useContentSearch() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const searchContent = useCallback(async (
    query: string,
    _contentType?: 'page' | 'config',
    _filters?: { [key: string]: any }
  ) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      
      // In a real implementation, this would search through content files
      // For now, we'll simulate search results
      const results = await simulateContentSearch(query, _contentType, _filters);
      setSearchResults(results);
    } catch (err) {
      console.error('Content search failed:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    searchResults,
    searching,
    searchContent,
    clearSearch
  };
}

/**
 * Simulate content search (placeholder implementation)
 */
async function simulateContentSearch(
  query: string,
  _contentType?: 'page' | 'config',
  _filters?: { [key: string]: any }
): Promise<any[]> {
  // This would be replaced with actual search implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'home',
          type: 'page',
          title: 'Home Page',
          matches: [`Found "${query}" in hero section`]
        }
      ]);
    }, 500);
  });
}