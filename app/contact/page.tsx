import { StaticContentPage } from '../../src/components/pages/StaticContentPage';
import { loadPageContentStatic, loadSiteConfigStatic } from '../../src/utils/staticContentLoader';

/**
 * ContactPage component - Uses static content loading for build-time content
 */
export default function ContactPage() {
  // Load content at build time (this will be pre-rendered)
  const pageContent = loadPageContentStatic('contact');
  const siteConfig = loadSiteConfigStatic();
  
  return <StaticContentPage pageContent={pageContent} siteConfig={siteConfig} />;
}