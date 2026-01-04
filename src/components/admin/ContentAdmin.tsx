/**
 * Content administration interface
 * Provides UI for managing content updates, versioning, and synchronization
 */

import React, { useState, useEffect } from 'react';
import { 
  useContentCache, 
  useContentHistory, 
  useContentUpdates,
  useContentSearch 
} from '../../hooks/useContent';
import { ContentChange } from '../../types/content';
import { contentSyncManager } from '../../utils/contentSync';

interface ContentAdminProps {
  className?: string;
}

export function ContentAdmin({ className = '' }: ContentAdminProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'editor' | 'history' | 'sync'>('overview');
  const [selectedContent, setSelectedContent] = useState<string>('');
  
  return (
    <div className={`bg-white shadow-lg rounded-lg ${className}`}>
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'editor', label: 'Content Editor' },
            { id: 'history', label: 'Version History' },
            { id: 'sync', label: 'Sync Status' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && <ContentOverview />}
        {activeTab === 'editor' && (
          <ContentEditor 
            contentId={selectedContent}
            onContentSelect={setSelectedContent}
          />
        )}
        {activeTab === 'history' && (
          <ContentHistory 
            contentId={selectedContent}
            onContentSelect={setSelectedContent}
          />
        )}
        {activeTab === 'sync' && <ContentSync />}
      </div>
    </div>
  );
}

function ContentOverview() {
  const { cacheStatus, clearCache } = useContentCache();
  const [contentList] = useState([
    'site',
    'page-home',
    'page-services',
    'page-governance',
    'page-about',
    'page-contact'
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Content Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentList.map((contentId) => (
            <div key={contentId} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                {contentId.replace('page-', '').replace('-', ' ').toUpperCase()}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  Version: {cacheStatus[contentId]?.version || 'Not loaded'}
                </div>
                <div>
                  Cache Age: {
                    cacheStatus[contentId] 
                      ? `${Math.round(cacheStatus[contentId].age / 1000)}s`
                      : 'N/A'
                  }
                </div>
              </div>
              <button
                onClick={() => clearCache(contentId)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Clear Cache
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium text-gray-900 mb-2">Cache Actions</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => clearCache()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Clear All Cache
          </button>
        </div>
      </div>
    </div>
  );
}

function ContentEditor({ contentId, onContentSelect }: {
  contentId: string;
  onContentSelect: (id: string) => void;
}) {
  const [selectedContent, setSelectedContent] = useState(contentId);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [jsonEditor, setJsonEditor] = useState('');
  const { updateContent, updating, updateError } = useContentUpdates();
  const { searchContent, searchResults, searching } = useContentSearch();

  const contentOptions = [
    { id: 'site', label: 'Site Configuration' },
    { id: 'page-home', label: 'Home Page' },
    { id: 'page-services', label: 'Services Page' },
    { id: 'page-governance', label: 'Governance Page' },
    { id: 'page-about', label: 'About Page' },
    { id: 'page-contact', label: 'Contact Page' }
  ];

  const handleContentSelect = (id: string) => {
    setSelectedContent(id);
    onContentSelect(id);
    // Load content for editing
    loadContentForEditing(id);
  };

  const loadContentForEditing = async (_id: string) => {
    try {
      // In a real implementation, this would load the actual content
      const mockContent = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        // ... other content fields
      };
      setEditingContent(mockContent);
      setJsonEditor(JSON.stringify(mockContent, null, 2));
    } catch (error) {
      console.error('Failed to load content:', error);
    }
  };

  const handleSaveContent = async () => {
    try {
      const updatedContent = JSON.parse(jsonEditor);
      const changes: ContentChange[] = [{
        path: 'content',
        operation: 'update',
        oldValue: editingContent,
        newValue: updatedContent
      }];
      
      await updateContent(selectedContent, changes, 'admin');
      setEditingContent(updatedContent);
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Content Editor</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Content
          </label>
          <select
            value={selectedContent}
            onChange={(e) => handleContentSelect(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select content to edit...</option>
            {contentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {selectedContent && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content JSON
              </label>
              <textarea
                value={jsonEditor}
                onChange={(e) => setJsonEditor(e.target.value)}
                rows={20}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Content JSON will appear here..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleSaveContent}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => loadContentForEditing(selectedContent)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Reset
              </button>
            </div>

            {updateError && (
              <div className="text-red-600 text-sm">
                Error: {updateError.message}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-md font-medium text-gray-900 mb-2">Content Search</h3>
        <div className="flex space-x-4 mb-4">
          <input
            type="text"
            placeholder="Search content..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => searchContent(e.target.value)}
          />
        </div>
        
        {searching && <div className="text-gray-600">Searching...</div>}
        
        {searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map((result, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <div className="font-medium">{result.title}</div>
                <div className="text-sm text-gray-600">{result.type}</div>
                {result.matches && (
                  <div className="text-xs text-gray-500 mt-1">
                    {result.matches.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ContentHistory({ contentId, onContentSelect: _onContentSelect }: {
  contentId: string;
  onContentSelect: (id: string) => void;
}) {
  const { history, loading } = useContentHistory(contentId);
  const { rollbackContent, updating } = useContentUpdates();

  const handleRollback = async (version: string) => {
    if (contentId && window.confirm(`Rollback to version ${version}?`)) {
      try {
        await rollbackContent(contentId, version);
      } catch (error) {
        console.error('Rollback failed:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Version History</h2>
        
        {!contentId && (
          <div className="text-gray-600">
            Select content from the editor tab to view its history.
          </div>
        )}

        {contentId && loading && (
          <div className="text-gray-600">Loading history...</div>
        )}

        {contentId && !loading && !history && (
          <div className="text-gray-600">No history available for this content.</div>
        )}

        {history && (
          <div className="space-y-4">
            {history.versions.map((version) => (
              <div key={version.version} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">Version {version.version}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(version.timestamp).toLocaleString()} by {version.author}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRollback(version.version)}
                    disabled={updating}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Rollback
                  </button>
                </div>
                
                {version.changes.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Changes:</div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {version.changes.map((change, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ContentSync() {
  const [syncStatus, setSyncStatus] = useState<any>({});
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<any>(null);

  const contentIds = [
    'site',
    'page-home',
    'page-services',
    'page-governance',
    'page-about',
    'page-contact'
  ];

  const loadSyncStatus = async () => {
    try {
      const status = await contentSyncManager.getContentStatus(contentIds);
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const handleSync = async (source: string, target: string) => {
    setSyncing(true);
    try {
      const results = await contentSyncManager.syncContent(contentIds, {
        source: source as any,
        target: target as any,
        dryRun: false
      });
      setSyncResults(results);
      await loadSyncStatus(); // Refresh status
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadSyncStatus();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Content Synchronization</h2>
        
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-2">Sync Status</h3>
          <div className="space-y-2">
            {Object.entries(syncStatus).map(([contentId, status]: [string, any]) => (
              <div key={contentId} className="bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <div className="font-medium">
                    {contentId.replace('page-', '').replace('-', ' ').toUpperCase()}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    status.needsSync 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {status.needsSync ? 'Needs Sync' : 'In Sync'}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-1 grid grid-cols-3 gap-4">
                  <div>
                    Local: {status.local?.version || 'N/A'}
                  </div>
                  <div>
                    Remote: {status.remote?.version || 'N/A'}
                  </div>
                  <div>
                    CDN: {status.cdn?.version || 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-2">Sync Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleSync('local', 'remote')}
              disabled={syncing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Local → Remote
            </button>
            <button
              onClick={() => handleSync('remote', 'local')}
              disabled={syncing}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Remote → Local
            </button>
            <button
              onClick={() => handleSync('remote', 'cdn')}
              disabled={syncing}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Remote → CDN
            </button>
          </div>
        </div>

        {syncing && (
          <div className="text-blue-600">Synchronizing content...</div>
        )}

        {syncResults && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Sync Results</h3>
            <div className="text-sm space-y-1">
              <div>Success: {syncResults.success ? 'Yes' : 'No'}</div>
              <div>Added: {syncResults.summary.added}</div>
              <div>Updated: {syncResults.summary.updated}</div>
              <div>Deleted: {syncResults.summary.deleted}</div>
              <div>Unchanged: {syncResults.summary.unchanged}</div>
            </div>
            {syncResults.errors.length > 0 && (
              <div className="mt-2">
                <div className="text-red-600 font-medium">Errors:</div>
                <ul className="text-red-600 text-sm">
                  {syncResults.errors.map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}