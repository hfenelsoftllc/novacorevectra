import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services - NovaCoreVectra',
  description: 'Comprehensive AI services from strategy development to implementation and governance',
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}