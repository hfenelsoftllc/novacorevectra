# Content Management System

This directory contains the content management system for the NovaCoreVectra marketing site. The system separates content from code, enabling updates without deployment and supporting rich text formatting, versioning, and content synchronization.

## Directory Structure

```
content/
├── config/           # Site-wide configuration
│   └── site.json     # Site metadata, contact info, SEO settings
├── pages/            # Page-specific content
│   ├── home.json     # Home page content
│   ├── services.json # Services page content
│   ├── governance.json # Governance page content
│   ├── about.json    # About page content
│   └── contact.json  # Contact page content
├── versions/         # Content versioning
│   └── content-versions.json # Version tracking
└── README.md         # This file
```

## Content Structure

### Site Configuration (`config/site.json`)

Contains site-wide settings including:
- Site metadata (name, tagline, description)
- Contact information
- Social media links
- SEO defaults
- Theme colors

### Page Content (`pages/*.json`)

Each page contains:
- **version**: Content version number
- **lastUpdated**: ISO timestamp of last update
- **page**: Page identifier
- **meta**: SEO metadata (title, description, keywords)
- **hero**: Hero section content
- **sections**: Array of content sections

## Rich Text Formatting

Content supports markdown formatting:
- **Bold text**: `**text**` or `__text__`
- *Italic text*: `*text*` or `_text_`
- `Code`: `` `code` ``
- [Links](url): `[text](url)`

Example:
```json
{
  "title": "Transform Your Business with **Responsible AI**",
  "description": "We help organizations navigate the AI landscape with *confidence* through strategic consulting."
}
```

## Section Types

The content system supports various section types:

### Basic Content Sections
- `text-image`: Text content with optional image
- `text-content`: Rich text content with highlights
- `text-columns`: Multi-column text layout

### Interactive Sections
- `process-lifecycle`: Animated process flow
- `industry-variants`: Industry-specific content switcher
- `compliance-section`: Compliance framework display
- `cta`: Call-to-action sections

### Grid Sections
- `services-grid`: Service offerings display
- `values-grid`: Company values
- `stats-grid`: Statistics and metrics
- `expertise-grid`: Areas of expertise
- `certifications-grid`: Certifications and partnerships

### Form Sections
- `lead-capture-form`: Lead generation forms
- `contact-grid`: Contact options
- `contact-info`: Contact information display
- `faq`: Frequently asked questions

## Content Updates

### Manual Updates

1. Edit the appropriate JSON file in the `content/` directory
2. Update the `version` and `lastUpdated` fields
3. Save the file
4. The changes will be reflected on the next page load (with cache clearing)

### Programmatic Updates

Use the content management utilities:

```typescript
import { updateContent } from '../utils/contentManager';

// Update content programmatically
await updateContent('page-home', [
  {
    path: 'hero.title',
    operation: 'update',
    oldValue: 'Old Title',
    newValue: 'New Title'
  }
], 'admin');
```

### Using the Admin Interface

Access the content admin interface at `/admin/content` (when implemented) to:
- View content overview and cache status
- Edit content with JSON editor
- View version history
- Manage content synchronization

## Content Versioning

The system automatically tracks content versions:
- Each update increments the version number
- Change history is maintained
- Rollback functionality is available
- Version format: `YYYY.MM.DD.HHMM`

## Content Synchronization

Content can be synchronized between environments:
- **Local**: Development environment
- **Remote**: Staging/production API
- **CDN**: Content delivery network

Sync operations:
```typescript
import { syncContent } from '../utils/contentSync';

// Sync from local to remote
await syncContent(['page-home'], {
  source: 'local',
  target: 'remote'
});
```

## React Integration

### Using Content in Components

```typescript
import { usePageContent, useSiteConfig } from '../hooks/useContent';

function MyPage() {
  const { content, loading, error } = usePageContent('home');
  const { config } = useSiteConfig();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>{content.hero.title}</h1>
      <ContentRenderer sections={content.sections} />
    </div>
  );
}
```

### Rendering Rich Text

```typescript
import { renderRichText } from '../utils/richTextRenderer';

function RichTextComponent({ content }) {
  return (
    <div>
      {renderRichText(content, { 
        allowMarkdown: true,
        className: 'prose'
      })}
    </div>
  );
}
```

## Best Practices

### Content Structure
- Keep content files focused and organized
- Use consistent naming conventions
- Include version and timestamp in all content
- Validate JSON structure before saving

### Rich Text
- Use markdown for formatting
- Keep formatting simple and consistent
- Test rich text rendering in different contexts
- Validate markdown syntax

### Versioning
- Always update version numbers when making changes
- Include meaningful change descriptions
- Test content changes before deployment
- Keep version history for rollback capability

### Performance
- Content is cached for 5 minutes by default
- Clear cache after updates
- Use content versioning for cache busting
- Monitor content loading performance

## Troubleshooting

### Content Not Loading
1. Check file paths and naming
2. Validate JSON syntax
3. Clear content cache
4. Check browser console for errors

### Rich Text Not Rendering
1. Verify markdown syntax
2. Check for unclosed tags
3. Validate content structure
4. Test with simple content first

### Version Conflicts
1. Check version numbers across environments
2. Use content sync to resolve conflicts
3. Review change history
4. Consider manual merge if needed

### Cache Issues
1. Clear browser cache
2. Clear content management cache
3. Check cache timeout settings
4. Verify cache invalidation logic

## Development Workflow

1. **Local Development**
   - Edit content files directly
   - Use hot reload for immediate feedback
   - Test with different content variations

2. **Content Review**
   - Validate content structure
   - Test rich text formatting
   - Review on different devices/browsers

3. **Staging Deployment**
   - Sync content to staging environment
   - Test full user journeys
   - Validate SEO metadata

4. **Production Deployment**
   - Sync content to production
   - Monitor performance metrics
   - Verify content delivery

## API Reference

### Content Manager
- `loadSiteConfig(options)`: Load site configuration
- `loadPageContent(page, options)`: Load page content
- `updateContent(id, changes, author)`: Update content
- `clearCache(key)`: Clear content cache

### Content Hooks
- `useSiteConfig(options)`: React hook for site config
- `usePageContent(page, options)`: React hook for page content
- `useContentHistory(id)`: React hook for version history
- `useContentUpdates()`: React hook for content updates

### Rich Text Utilities
- `renderRichText(content, options)`: Render rich text
- `extractPlainText(content)`: Extract plain text
- `validateRichText(content)`: Validate rich text syntax

For more detailed API documentation, see the TypeScript definitions in `src/types/content.ts`.