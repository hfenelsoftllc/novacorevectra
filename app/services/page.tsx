import { StaticContentPage } from '../../src/components/pages/StaticContentPage';
import { loadPageContentStatic } from '../../src/utils/staticContentLoader';

/**
 * ServicesPage component - Uses static content loading for build-time content
 */
export default function ServicesPage() {
  // Load content at build time (this will be pre-rendered)
  const pageContent = loadPageContentStatic('services');
  
  return <StaticContentPage pageContent={pageContent} />;
}