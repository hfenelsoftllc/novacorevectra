/**
 * Static content loader for build-time content loading
 * Works with Next.js static export
 */

import * as fs from 'fs';
import * as path from 'path';
import { SiteConfig, PageContent } from '../types/content';

/**
 * Load site configuration at build time
 */
export function loadSiteConfigStatic(): SiteConfig {
  const configPath = path.join(process.cwd(), 'content', 'config', 'site.json');
  const configContent = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(configContent);
}

/**
 * Load page content at build time
 */
export function loadPageContentStatic(pageName: string): PageContent {
  const pagePath = path.join(process.cwd(), 'content', 'pages', `${pageName}.json`);
  const pageContent = fs.readFileSync(pagePath, 'utf-8');
  return JSON.parse(pageContent);
}

/**
 * Get all available page names
 */
export function getAvailablePages(): string[] {
  const pagesDir = path.join(process.cwd(), 'content', 'pages');
  const files = fs.readdirSync(pagesDir);
  return files
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''));
}