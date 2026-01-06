import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Governance & Compliance - NovaCoreVectra',
  description: 'ISO 42001 compliant AI governance solutions and risk management frameworks',
};

export default function GovernanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}