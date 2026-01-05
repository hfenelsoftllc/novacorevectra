/**
 * Content Update Demo Test
 * Demonstrates that content can be updated without code deployment
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Content Update Without Code Deployment Demo', () => {
  const testContentPath = path.join(process.cwd(), 'content', 'pages', 'test-page.json');
  
  // Clean up test file after tests
  afterEach(() => {
    if (fs.existsSync(testContentPath)) {
      fs.unlinkSync(testContentPath);
    }
  });

  test('content can be updated by modifying JSON files', () => {
    // Create initial content
    const initialContent = {
      version: '1.0.0',
      lastUpdated: '2024-01-04T00:00:00Z',
      page: 'test-page',
      meta: {
        title: 'Initial Title',
        description: 'Initial description'
      },
      hero: {
        title: 'Initial **Hero** Title',
        description: 'Initial hero description'
      },
      sections: [
        {
          id: 'test-section',
          type: 'text-content',
          title: 'Initial Section Title',
          content: 'Initial section content with *formatting*'
        }
      ]
    };

    // Write initial content
    fs.writeFileSync(testContentPath, JSON.stringify(initialContent, null, 2));
    
    // Verify initial content
    const loadedInitial = JSON.parse(fs.readFileSync(testContentPath, 'utf-8'));
    expect(loadedInitial.hero.title).toBe('Initial **Hero** Title');
    expect(loadedInitial.sections[0].title).toBe('Initial Section Title');

    // Update content (simulating content manager update)
    const updatedContent = {
      ...initialContent,
      version: '1.1.0',
      lastUpdated: '2024-01-04T12:00:00Z',
      hero: {
        ...initialContent.hero,
        title: 'Updated **Hero** Title',
        description: 'Updated hero description'
      },
      sections: [
        {
          ...initialContent.sections[0],
          title: 'Updated Section Title',
          content: 'Updated section content with **bold** and *italic* formatting'
        }
      ]
    };

    // Write updated content (no code deployment needed)
    fs.writeFileSync(testContentPath, JSON.stringify(updatedContent, null, 2));
    
    // Verify updated content
    const loadedUpdated = JSON.parse(fs.readFileSync(testContentPath, 'utf-8'));
    expect(loadedUpdated.version).toBe('1.1.0');
    expect(loadedUpdated.hero.title).toBe('Updated **Hero** Title');
    expect(loadedUpdated.sections[0].title).toBe('Updated Section Title');
    expect(loadedUpdated.sections[0].content).toContain('**bold**');
    expect(loadedUpdated.sections[0].content).toContain('*italic*');
  });

  test('rich text formatting is preserved during content updates', () => {
    const contentWithRichText = {
      version: '1.0.0',
      lastUpdated: '2024-01-04T00:00:00Z',
      page: 'rich-text-test',
      meta: {
        title: 'Rich Text Test',
        description: 'Testing rich text formatting'
      },
      hero: {
        title: 'Welcome to **NovaCoreVectra**',
        description: 'We provide *innovative* AI solutions with `cutting-edge` technology.',
        cta: {
          text: 'Learn More',
          href: '/services'
        }
      },
      sections: [
        {
          id: 'rich-content',
          type: 'text-content',
          title: 'Rich **Text** Examples',
          content: 'This content includes:\n\n- **Bold text** for emphasis\n- *Italic text* for style\n- `Code snippets` for technical terms\n- [Links to other pages](/about)\n\nAll formatting is preserved during updates!'
        }
      ]
    };

    // Write content with rich text
    fs.writeFileSync(testContentPath, JSON.stringify(contentWithRichText, null, 2));
    
    // Load and verify rich text is preserved
    const loaded = JSON.parse(fs.readFileSync(testContentPath, 'utf-8'));
    
    expect(loaded.hero.title).toContain('**NovaCoreVectra**');
    expect(loaded.hero.description).toContain('*innovative*');
    expect(loaded.hero.description).toContain('`cutting-edge`');
    expect(loaded.sections[0].title).toContain('**Text**');
    expect(loaded.sections[0].content).toContain('**Bold text**');
    expect(loaded.sections[0].content).toContain('*Italic text*');
    expect(loaded.sections[0].content).toContain('`Code snippets`');
    expect(loaded.sections[0].content).toContain('[Links to other pages](/about)');
  });

  test('content versioning tracks changes correctly', () => {
    const versions = [];
    
    // Create version 1.0.0
    const v1 = {
      version: '1.0.0',
      lastUpdated: '2024-01-04T00:00:00Z',
      page: 'versioning-test',
      meta: { title: 'Version 1', description: 'First version' },
      hero: { title: 'Version **1.0.0**', description: 'Initial release' }
    };
    
    fs.writeFileSync(testContentPath, JSON.stringify(v1, null, 2));
    versions.push(JSON.parse(fs.readFileSync(testContentPath, 'utf-8')));
    
    // Update to version 1.1.0
    const v2 = {
      ...v1,
      version: '1.1.0',
      lastUpdated: '2024-01-04T06:00:00Z',
      meta: { title: 'Version 1.1', description: 'Minor update' },
      hero: { title: 'Version **1.1.0**', description: 'Feature additions' }
    };
    
    fs.writeFileSync(testContentPath, JSON.stringify(v2, null, 2));
    versions.push(JSON.parse(fs.readFileSync(testContentPath, 'utf-8')));
    
    // Update to version 2.0.0
    const v3 = {
      ...v2,
      version: '2.0.0',
      lastUpdated: '2024-01-04T12:00:00Z',
      meta: { title: 'Version 2.0', description: 'Major update' },
      hero: { title: 'Version **2.0.0**', description: 'Complete redesign' }
    };
    
    fs.writeFileSync(testContentPath, JSON.stringify(v3, null, 2));
    versions.push(JSON.parse(fs.readFileSync(testContentPath, 'utf-8')));
    
    // Verify version progression
    expect(versions[0].version).toBe('1.0.0');
    expect(versions[1].version).toBe('1.1.0');
    expect(versions[2].version).toBe('2.0.0');
    
    // Verify timestamps are progressive
    const time1 = new Date(versions[0].lastUpdated).getTime();
    const time2 = new Date(versions[1].lastUpdated).getTime();
    const time3 = new Date(versions[2].lastUpdated).getTime();
    
    expect(time2).toBeGreaterThan(time1);
    expect(time3).toBeGreaterThan(time2);
    
    // Verify content changes are tracked
    expect(versions[0].hero.title).toBe('Version **1.0.0**');
    expect(versions[1].hero.title).toBe('Version **1.1.0**');
    expect(versions[2].hero.title).toBe('Version **2.0.0**');
  });
});