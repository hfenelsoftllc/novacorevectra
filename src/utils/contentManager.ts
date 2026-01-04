/**
 * Content Management System utilities
 * Handles loading, caching, and updating content from configuration files
 */

import { 
  SiteConfig, 
  PageContent, 
  ContentCache, 
  ContentLoadOptions,
  ContentHistory,
  ContentUpdate,
  ContentChange
} from '../types/content';

class ContentManager {
  private cache: ContentCache = {};
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private contentHistory: Map<string, ContentHistory> = new Map();

  /**
   * Load site configuration
   */
  async loadSiteConfig(options: ContentLoadOptions = {}): Promise<SiteConfig> {
    return this.loadContent<SiteConfig>('site', '/content/config/site.json', options);
  }

  /**
   * Load page content by page name
   */
  async loadPageContent(page: string, options: ContentLoadOptions = {}): Promise<PageContent> {
    return this.loadContent<PageContent>(
      `page-${page}`, 
      `/content/pages/${page}.json`, 
      options
    );
  }

  /**
   * Generic content loader with caching
   */
  private async loadContent<T>(
    key: string, 
    path: string, 
    options: ContentLoadOptions = {}
  ): Promise<T> {
    const { useCache = true, version, fallback } = options;

    // Check cache first
    if (useCache && this.isCacheValid(key, version)) {
      return this.cache[key].content as T;
    }

    try {
      // Load content from file system or API
      const content = await this.fetchContent<T>(path, version);
      
      // Update cache
      this.updateCache(key, content, version);
      
      // Track content loading for versioning
      this.trackContentAccess(key, content);
      
      return content;
    } catch (error) {
      console.error(`Failed to load content from ${path}:`, error);
      
      // Return fallback if available
      if (fallback) {
        return fallback as T;
      }
      
      // Return cached version if available
      if (this.cache[key]) {
        console.warn(`Using cached version of ${key} due to loading error`);
        return this.cache[key].content as T;
      }
      
      throw error;
    }
  }

  /**
   * Fetch content from file system or API
   */
  private async fetchContent<T>(path: string, version?: string): Promise<T> {
    // In a real implementation, this would handle different environments:
    // - Development: Load from file system
    // - Production: Load from CDN or API
    // - With versioning: Load specific version
    
    const url = version ? `${path}?v=${version}` : path;
    
    if (typeof window !== 'undefined') {
      // Client-side: fetch from public directory
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } else {
      // Server-side: load from file system
      const fs = await import('fs/promises');
      const filePath = path.startsWith('/') ? `public${path}` : path;
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    }
  }

  /**
   * Check if cached content is valid
   */
  private isCacheValid(key: string, version?: string): boolean {
    const cached = this.cache[key];
    if (!cached) return false;
    
    // Check version if specified
    if (version && cached.version !== version) return false;
    
    // Check cache timeout
    const now = Date.now();
    return (now - cached.timestamp) < this.cacheTimeout;
  }

  /**
   * Update cache with new content
   */
  private updateCache<T>(key: string, content: T, version?: string): void {
    this.cache[key] = {
      content,
      timestamp: Date.now(),
      version: version || (content as any).version || '1.0.0'
    };
  }

  /**
   * Track content access for analytics and versioning
   */
  private trackContentAccess<T>(key: string, content: T): void {
    // Track content access for analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'content_load', {
        content_id: key,
        content_version: (content as any).version || '1.0.0'
      });
    }
  }

  /**
   * Clear cache for specific content or all content
   */
  clearCache(key?: string): void {
    if (key) {
      delete this.cache[key];
    } else {
      this.cache = {};
    }
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus(): { [key: string]: { version: string; age: number } } {
    const now = Date.now();
    const status: { [key: string]: { version: string; age: number } } = {};
    
    for (const [key, cached] of Object.entries(this.cache)) {
      status[key] = {
        version: cached.version,
        age: now - cached.timestamp
      };
    }
    
    return status;
  }

  /**
   * Update content with versioning support
   */
  async updateContent(
    contentId: string, 
    updates: ContentChange[], 
    author: string = 'system'
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const version = this.generateVersion();
    
    // Create update record
    const update: ContentUpdate = {
      contentId,
      version,
      timestamp,
      author,
      changes: updates
    };
    
    // Apply updates to content
    const currentContent = await this.loadContent(contentId, '', { useCache: false });
    const updatedContent = this.applyChanges(currentContent, updates);
    
    // Update version info
    (updatedContent as any).version = version;
    (updatedContent as any).lastUpdated = timestamp;
    
    // Save updated content (in a real implementation, this would save to file system or API)
    await this.saveContent(contentId, updatedContent);
    
    // Update content history
    this.updateContentHistory(contentId, update, updatedContent);
    
    // Clear cache to force reload
    this.clearCache(contentId);
  }

  /**
   * Apply content changes to existing content
   */
  private applyChanges(content: any, changes: ContentChange[]): any {
    const updatedContent = JSON.parse(JSON.stringify(content)); // Deep clone
    
    for (const change of changes) {
      const pathParts = change.path.split('.');
      let current = updatedContent;
      
      // Navigate to the parent of the target property
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {};
        }
        current = current[pathParts[i]];
      }
      
      const finalKey = pathParts[pathParts.length - 1];
      
      switch (change.operation) {
        case 'add':
        case 'update':
          current[finalKey] = change.newValue;
          break;
        case 'delete':
          delete current[finalKey];
          break;
      }
    }
    
    return updatedContent;
  }

  /**
   * Save content (placeholder for actual implementation)
   */
  private async saveContent(contentId: string, content: any): Promise<void> {
    // In a real implementation, this would:
    // - Save to file system in development
    // - Send to API in production
    // - Handle atomic updates and rollbacks
    console.log(`Saving content ${contentId}:`, content);
  }

  /**
   * Update content history for versioning
   */
  private updateContentHistory(
    contentId: string, 
    update: ContentUpdate, 
    content: any
  ): void {
    let history = this.contentHistory.get(contentId);
    
    if (!history) {
      history = {
        contentId,
        versions: []
      };
      this.contentHistory.set(contentId, history);
    }
    
    history.versions.push({
      version: update.version,
      timestamp: update.timestamp,
      author: update.author,
      changes: update.changes.map(c => `${c.operation} ${c.path}`),
      content: JSON.parse(JSON.stringify(content))
    });
    
    // Keep only last 10 versions
    if (history.versions.length > 10) {
      history.versions = history.versions.slice(-10);
    }
  }

  /**
   * Generate new version number
   */
  private generateVersion(): string {
    const now = new Date();
    return `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}.${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
  }

  /**
   * Get content history for a specific content item
   */
  getContentHistory(contentId: string): ContentHistory | undefined {
    return this.contentHistory.get(contentId);
  }

  /**
   * Rollback to a previous version
   */
  async rollbackContent(contentId: string, targetVersion: string): Promise<void> {
    const history = this.contentHistory.get(contentId);
    if (!history) {
      throw new Error(`No history found for content ${contentId}`);
    }
    
    const targetVersionData = history.versions.find(v => v.version === targetVersion);
    if (!targetVersionData) {
      throw new Error(`Version ${targetVersion} not found for content ${contentId}`);
    }
    
    // Save current version as new version with rollback marker
    const rollbackVersion = this.generateVersion();
    const rollbackContent = { ...targetVersionData.content };
    rollbackContent.version = rollbackVersion;
    rollbackContent.lastUpdated = new Date().toISOString();
    rollbackContent.rollbackFrom = targetVersion;
    
    await this.saveContent(contentId, rollbackContent);
    
    // Update history
    const rollbackUpdate: ContentUpdate = {
      contentId,
      version: rollbackVersion,
      timestamp: new Date().toISOString(),
      author: 'system',
      changes: [{
        path: 'rollback',
        operation: 'update',
        oldValue: 'current',
        newValue: targetVersion
      }]
    };
    
    this.updateContentHistory(contentId, rollbackUpdate, rollbackContent);
    
    // Clear cache
    this.clearCache(contentId);
  }
}

// Export singleton instance
export const contentManager = new ContentManager();

// Export utility functions for common operations
export const loadSiteConfig = (options?: ContentLoadOptions) => 
  contentManager.loadSiteConfig(options);

export const loadPageContent = (page: string, options?: ContentLoadOptions) => 
  contentManager.loadPageContent(page, options);

export const clearContentCache = (key?: string) => 
  contentManager.clearCache(key);

export const updateContent = (contentId: string, changes: ContentChange[], author?: string) =>
  contentManager.updateContent(contentId, changes, author);

export const getContentHistory = (contentId: string) =>
  contentManager.getContentHistory(contentId);

export const rollbackContent = (contentId: string, version: string) =>
  contentManager.rollbackContent(contentId, version);