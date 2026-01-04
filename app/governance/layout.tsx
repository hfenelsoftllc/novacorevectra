import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, pageConfigs } from '../../src/utils/seo';

export const metadata: Metadata = generateSEOMetadata({
  ...pageConfigs.governance,
  url: `${process.env['NEXT_PUBLIC_SITE_URL'] || 'https://novacorevectra.com'}/governance`,
  image: `${process.env['NEXT_PUBLIC_SITE_URL'] || 'https://novacorevectra.com'}/og-governance.png`,
});

export default function GovernanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}