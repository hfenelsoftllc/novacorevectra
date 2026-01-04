import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, pageConfigs } from '../../src/utils/seo';

export const metadata: Metadata = generateSEOMetadata({
  ...pageConfigs.services,
  url: `${process.env['NEXT_PUBLIC_SITE_URL'] || 'https://novacorevectra.com'}/services`,
  image: `${process.env['NEXT_PUBLIC_SITE_URL'] || 'https://novacorevectra.com'}/og-services.png`,
});

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}