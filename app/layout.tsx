import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../src/styles/globals.css';
import { Header, Footer } from '../src/components/layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NovaCoreVectra - AI Solutions & Governance',
  description: 'Leading AI consulting and governance solutions for enterprise',
  keywords: ['AI', 'artificial intelligence', 'governance', 'consulting', 'enterprise'],
  authors: [{ name: 'NovaCoreVectra' }],
  openGraph: {
    title: 'NovaCoreVectra - AI Solutions & Governance',
    description: 'Leading AI consulting and governance solutions for enterprise',
    type: 'website',
    siteName: 'NovaCoreVectra',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NovaCoreVectra - AI Solutions & Governance',
    description: 'Leading AI consulting and governance solutions for enterprise',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}