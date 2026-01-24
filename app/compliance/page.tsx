import { StaticContentPage } from '../../src/components/pages/StaticContentPage';
import { loadPageContentStatic } from '../../src/utils/staticContentLoader';

/**
 * CompliancePage component - Uses static content loading for build-time content
 */
export default function CompliancePage() {
  // Load content at build time (this will be pre-rendered)
  const pageContent = loadPageContentStatic('compliance');
  
  return <StaticContentPage pageContent={pageContent} />;
}