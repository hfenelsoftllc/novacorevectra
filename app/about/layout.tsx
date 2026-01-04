import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, pageConfigs } from '../../src/utils/seo';

export const metadata: Metadata = generateSEOMetadata({
  ...pageConfigs.about,
  url: `${process.env['NEXT_PUBLIC_SITE_URL'] || 'https://novacorevectra.com'}/about`,
  image: `${process.env['NEXT_PUBLIC_SITE_URL'] || 'https://novacorevectra.com'}/og-about.png`,
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}