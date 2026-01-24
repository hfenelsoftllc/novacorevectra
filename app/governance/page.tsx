import { StaticContentPage } from '../../src/components/pages/StaticContentPage';
import { loadPageContentStatic } from '../../src/utils/staticContentLoader';

/**
 * GovernancePage component - Uses static content loading for build-time content
 */
export default function GovernancePage() {
  // Load content at build time (this will be pre-rendered)
  const pageContent = loadPageContentStatic('governance');
  
  return <StaticContentPage pageContent={pageContent} />;
}