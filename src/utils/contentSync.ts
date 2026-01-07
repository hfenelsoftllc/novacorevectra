/**
 * Content synchronization utilities
 * Handles syncing content between different environments and sources
 */


import { ContentChange } from '../types/content';

export interface SyncOptions {
  source: 'local' | 'remote' | 'cdn';
  target: 'local' | 'remote' | 'cdn';
  dryRun?: boolean;
  force?: boolean;
}

export interface SyncResult {
  success: boolean;
  changes: ContentChange[];
  errors: string[];
  summary: {
    added: number;
    updated: number;
    deleted: number;
    unchanged: number;
  };
}

/**
 * Content synchronization manager
 */
export class ContentSyncManager {
  /**
   * Sync content between environments
   */
  async syncContent(contentIds: string[], options: SyncOptions): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      changes: [],
      errors: [],
      summary: {
        added: 0,
        updated: 0,
        deleted: 0,
        unchanged: 0
      }
    };

    try {
      for (const contentId of contentIds) {
        const syncResult = await this.syncSingleContent(contentId, options);
        
        result.changes.push(...syncResult.changes);
        result.errors.push(...syncResult.errors);
        
        // Update summary
        if (syncResult.changes.length === 0) {
          result.summary.unchanged++;
        } else {
          syncResult.changes.forEach(change => {
            switch (change.operation) {
              case 'add':
                result.summary.added++;
                break;
              case 'update':
                result.summary.updated++;
                break;
              case 'delete':
                result.summary.deleted++;
                break;
            }
          });
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown sync error');
    }

    return result;
  }

  /**
   * Sync a single content item
   */
  private async syncSingleContent(contentId: string, options: SyncOptions): Promise<{
    changes: ContentChange[];
    errors: string[];
  }> {
    const changes: ContentChange[] = [];
    const errors: string[] = [];

    try {
      // Load content from source
      const sourceContent = await this.loadContentFromSource(contentId, options.source);
      
      // Load content from target (if exists)
      let targetContent;
      try {
        targetContent = await this.loadContentFromSource(contentId, options.target);
      } catch (error) {
        // Target content doesn't exist - this is an add operation
        targetContent = null;
      }

      // Compare and generate changes
      const contentChanges = this.compareContent(sourceContent, targetContent);
      
      if (contentChanges.length > 0) {
        if (!options.dryRun) {
          // Apply changes to target
          await this.saveContentToTarget(contentId, sourceContent, options.target);
        }
        changes.push(...contentChanges);
      }
    } catch (error) {
      errors.push(`Failed to sync ${contentId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { changes, errors };
  }

  /**
   * Load content from specified source
   */
  private async loadContentFromSource(contentId: string, source: string): Promise<any> {
    switch (source) {
      case 'local':
        return this.loadLocalContent(contentId);
      case 'remote':
        return this.loadRemoteContent(contentId);
      case 'cdn':
        return this.loadCDNContent(contentId);
      default:
        throw new Error(`Unknown content source: ${source}`);
    }
  }

  /**
   * Save content to specified target
   */
  private async saveContentToTarget(contentId: string, content: any, target: string): Promise<void> {
    switch (target) {
      case 'local':
        return this.saveLocalContent(contentId, content);
      case 'remote':
        return this.saveRemoteContent(contentId, content);
      case 'cdn':
        return this.saveCDNContent(contentId, content);
      default:
        throw new Error(`Unknown content target: ${target}`);
    }
  }

  /**
   * Compare two content objects and generate changes
   */
  private compareContent(sourceContent: any, targetContent: any): ContentChange[] {
    const changes: ContentChange[] = [];

    if (!targetContent) {
      // New content
      changes.push({
        path: 'content',
        operation: 'add',
        newValue: sourceContent
      });
      return changes;
    }

    // Compare versions
    if (sourceContent.version !== targetContent.version) {
      changes.push({
        path: 'version',
        operation: 'update',
        oldValue: targetContent.version,
        newValue: sourceContent.version
      });
    }

    // Compare lastUpdated
    if (sourceContent.lastUpdated !== targetContent.lastUpdated) {
      changes.push({
        path: 'lastUpdated',
        operation: 'update',
        oldValue: targetContent.lastUpdated,
        newValue: sourceContent.lastUpdated
      });
    }

    // Deep compare content (simplified implementation)
    const sourceStr = JSON.stringify(sourceContent);
    const targetStr = JSON.stringify(targetContent);
    
    if (sourceStr !== targetStr) {
      changes.push({
        path: 'content',
        operation: 'update',
        oldValue: targetContent,
        newValue: sourceContent
      });
    }

    return changes;
  }

  /**
   * Load content from local file system
   */
  private async loadLocalContent(contentId: string): Promise<any> {
    // Determine file path based on content ID
    const filePath = this.getContentFilePath(contentId);
    
    if (typeof window !== 'undefined') {
      // Client-side: fetch from public directory
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } else {
      // Server-side: load from file system
      const fs = await import('fs/promises');
      const content = await fs.readFile(`public${filePath}`, 'utf-8');
      return JSON.parse(content);
    }
  }

  /**
   * Save content to local file system
   */
  private async saveLocalContent(contentId: string, content: any): Promise<void> {
    const filePath = this.getContentFilePath(contentId);
    
    if (typeof window === 'undefined') {
      // Server-side only
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Ensure directory exists
      const dir = path.dirname(`public${filePath}`);
      await fs.mkdir(dir, { recursive: true });
      
      // Write content
      await fs.writeFile(`public${filePath}`, JSON.stringify(content, null, 2), 'utf-8');
    } else {
      throw new Error('Cannot save local content from client-side');
    }
  }

  /**
   * Load content from remote API
   */
  private async loadRemoteContent(contentId: string): Promise<any> {
    const apiUrl = process.env['NEXT_PUBLIC_CONTENT_API_URL'] || 'https://api.example.com';
    const response = await fetch(`${apiUrl}/content/${contentId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Save content to remote API
   */
  private async saveRemoteContent(contentId: string, content: any): Promise<void> {
    const apiUrl = process.env['NEXT_PUBLIC_CONTENT_API_URL'] || 'https://api.example.com';
    const response = await fetch(`${apiUrl}/content/${contentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env['CONTENT_API_TOKEN']}`
      },
      body: JSON.stringify(content)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Load content from CDN
   */
  private async loadCDNContent(contentId: string): Promise<any> {
    const cdnUrl = process.env['NEXT_PUBLIC_CONTENT_CDN_URL'] || 'https://cdn.example.com';
    const filePath = this.getContentFilePath(contentId);
    const response = await fetch(`${cdnUrl}${filePath}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Save content to CDN (typically via API)
   */
  private async saveCDNContent(_contentId: string, _content: any): Promise<void> {
    // CDN content is typically updated via API or deployment process
    // This would integrate with your CDN provider's API
    throw new Error('CDN content saving not implemented - typically handled by deployment process');
  }

  /**
   * Get file path for content ID
   */
  private getContentFilePath(contentId: string): string {
    if (contentId === 'site') {
      return '/content/config/site.json';
    } else if (contentId.startsWith('page-')) {
      const pageName = contentId.replace('page-', '');
      return `/content/pages/${pageName}.json`;
    } else {
      return `/content/data/${contentId}.json`;
    }
  }

  /**
   * Get content status across environments
   */
  async getContentStatus(contentIds: string[]): Promise<{
    [contentId: string]: {
      local?: { version: string; lastUpdated: string };
      remote?: { version: string; lastUpdated: string };
      cdn?: { version: string; lastUpdated: string };
      needsSync: boolean;
    };
  }> {
    const status: any = {};

    for (const contentId of contentIds) {
      status[contentId] = {
        needsSync: false
      };

      // Check local version
      try {
        const localContent = await this.loadLocalContent(contentId);
        status[contentId].local = {
          version: localContent.version,
          lastUpdated: localContent.lastUpdated
        };
      } catch (error) {
        // Local content doesn't exist
      }

      // Check remote version
      try {
        const remoteContent = await this.loadRemoteContent(contentId);
        status[contentId].remote = {
          version: remoteContent.version,
          lastUpdated: remoteContent.lastUpdated
        };
      } catch (error) {
        // Remote content doesn't exist
      }

      // Check CDN version
      try {
        const cdnContent = await this.loadCDNContent(contentId);
        status[contentId].cdn = {
          version: cdnContent.version,
          lastUpdated: cdnContent.lastUpdated
        };
      } catch (error) {
        // CDN content doesn't exist
      }

      // Determine if sync is needed
      const versions = [
        status[contentId].local?.version,
        status[contentId].remote?.version,
        status[contentId].cdn?.version
      ].filter(Boolean);

      status[contentId].needsSync = new Set(versions).size > 1;
    }

    return status;
  }
}

// Export singleton instance
export const contentSyncManager = new ContentSyncManager();

// Export utility functions
export const syncContent = (contentIds: string[], options: SyncOptions) =>
  contentSyncManager.syncContent(contentIds, options);

export const getContentStatus = (contentIds: string[]) =>
  contentSyncManager.getContentStatus(contentIds);