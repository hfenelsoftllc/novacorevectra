import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - NovaCoreVectra',
  description: 'Ready to transform your business with responsible AI? Contact NovaCoreVectra for AI consulting and governance solutions.',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}