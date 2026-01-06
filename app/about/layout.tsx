import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - NovaCoreVectra',
  description: 'Learn about NovaCoreVectra - empowering organizations to lead the AI era through world-class strategy and ethical innovation.',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}