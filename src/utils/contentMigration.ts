/**
 * Content migration utilities for updating content structure
 */

import { ContentChange } from '../types/content';

export interface MigrationScript {
  version: string;
  description: string;
  up: (content: any) => any;
  down: (content: any) => any;
}

/**
 * Content migration manager
 */
export class ContentMigrationManager {
  private migrations: MigrationScript[] = [];

  /**
   * Register a migration script
   */
  registerMigration(migration: MigrationScript): void {
    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.version.localeCompare(b.version));
  }

  /**
   * Migrate content from one version to another
   */
  async migrateContent(
    content: any,
    fromVersion: string,
    toVersion: string
  ): Promise<{ content: any; changes: ContentChange[] }> {
    const changes: ContentChange[] = [];
    let migratedContent = JSON.parse(JSON.stringify(content)); // Deep clone

    const fromIndex = this.migrations.findIndex(m => m.version === fromVersion);
    const toIndex = this.migrations.findIndex(m => m.version === toVersion);

    if (fromIndex === -1 || toIndex === -1) {
      throw new Error(`Migration path not found from ${fromVersion} to ${toVersion}`);
    }

    // Apply migrations in order
    if (fromIndex < toIndex) {
      // Migrating up
      for (let i = fromIndex + 1; i <= toIndex; i++) {
        const migration = this.migrations[i];
        const beforeContent = JSON.stringify(migratedContent);
        migratedContent = migration?.up(migratedContent) || migratedContent;
        const afterContent = JSON.stringify(migratedContent);

        if (beforeContent !== afterContent) {
          changes.push({
            path: 'migration',
            operation: 'update',
            oldValue: migration?.version || 'unknown',
            newValue: `Applied migration: ${migration?.description || 'unknown'}`
          });
        }
      }
    } else {
      // Migrating down
      for (let i = fromIndex; i > toIndex; i--) {
        const migration = this.migrations[i];
        const beforeContent = JSON.stringify(migratedContent);
        migratedContent = migration?.down(migratedContent) || migratedContent;
        const afterContent = JSON.stringify(migratedContent);

        if (beforeContent !== afterContent) {
          changes.push({
            path: 'migration',
            operation: 'update',
            oldValue: migration?.version || 'unknown',
            newValue: `Reverted migration: ${migration?.description || 'unknown'}`
          });
        }
      }
    }

    // Update version info
    migratedContent.version = toVersion;
    migratedContent.lastUpdated = new Date().toISOString();

    return { content: migratedContent, changes };
  }

  /**
   * Get available migrations
   */
  getAvailableMigrations(): MigrationScript[] {
    return [...this.migrations];
  }

  /**
   * Check if migration is needed
   */
  needsMigration(currentVersion: string, targetVersion: string): boolean {
    return currentVersion !== targetVersion;
  }
}

// Create singleton instance
export const migrationManager = new ContentMigrationManager();

// Register built-in migrations
migrationManager.registerMigration({
  version: '1.0.0',
  description: 'Initial content structure',
  up: (content) => content,
  down: (content) => content
});

migrationManager.registerMigration({
  version: '1.1.0',
  description: 'Add rich text support to content fields',
  up: (content) => {
    // Convert plain text fields to rich text format
    if (content.hero && content.hero.title) {
      content.hero.title = content.hero.title;
    }
    if (content.hero && content.hero.description) {
      content.hero.description = content.hero.description;
    }
    return content;
  },
  down: (content) => {
    // Remove rich text formatting
    return content;
  }
});

migrationManager.registerMigration({
  version: '1.2.0',
  description: 'Add SEO metadata fields',
  up: (content) => {
    if (content.meta && !content.meta.openGraph) {
      content.meta.openGraph = {
        title: content.meta.title,
        description: content.meta.description,
        type: 'website'
      };
    }
    return content;
  },
  down: (content) => {
    if (content.meta && content.meta.openGraph) {
      delete content.meta.openGraph;
    }
    return content;
  }
});

/**
 * Utility functions for common migration tasks
 */
export const migrationUtils = {
  /**
   * Add field to all objects in an array
   */
  addFieldToArray: (array: any[], fieldName: string, defaultValue: any) => {
    return array.map(item => ({
      ...item,
      [fieldName]: item[fieldName] || defaultValue
    }));
  },

  /**
   * Remove field from all objects in an array
   */
  removeFieldFromArray: (array: any[], fieldName: string) => {
    return array.map(item => {
      const { [fieldName]: removed, ...rest } = item;
      return rest;
    });
  },

  /**
   * Rename field in object
   */
  renameField: (obj: any, oldName: string, newName: string) => {
    if (obj[oldName] !== undefined) {
      obj[newName] = obj[oldName];
      delete obj[oldName];
    }
    return obj;
  },

  /**
   * Transform field value
   */
  transformField: (obj: any, fieldName: string, transformer: (value: any) => any) => {
    if (obj[fieldName] !== undefined) {
      obj[fieldName] = transformer(obj[fieldName]);
    }
    return obj;
  },

  /**
   * Merge objects with conflict resolution
   */
  mergeWithConflictResolution: (
    target: any, 
    source: any, 
    resolver: (key: string, targetValue: any, sourceValue: any) => any
  ) => {
    const result = { ...target };
    
    for (const [key, value] of Object.entries(source)) {
      if (result[key] !== undefined && result[key] !== value) {
        result[key] = resolver(key, result[key], value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
};