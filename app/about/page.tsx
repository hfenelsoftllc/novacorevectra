import { StaticContentPage } from '../../src/components/pages/StaticContentPage';
import { loadPageContentStatic } from '../../src/utils/staticContentLoader';

/**
 * AboutPage component - Uses static content loading for build-time content
 */
export default function AboutPage() {
  // Load content at build time (this will be pre-rendered)
  const pageContent = loadPageContentStatic('about');
  
  return <StaticContentPage pageContent={pageContent} />;
}