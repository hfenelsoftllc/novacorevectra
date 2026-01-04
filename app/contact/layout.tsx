import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, pageConfigs } from '../../src/utils/seo';

export const metadata: Metadata = generateSEOMetadata({
  ...pageConfigs.contact,
  url: `${process.env['NEXT_PUBLIC_SITE_URL'] || 'https://novacorevectra.com'}/contact`,
  image: `${process.env['NEXT_PUBLIC_SITE_URL'] || 'https://novacorevectra.com'}/og-contact.png`,
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}