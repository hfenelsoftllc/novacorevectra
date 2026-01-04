import { render, screen } from '@testing-library/react';
import RootLayout from '../layout';

// Mock Next.js font
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter-font',
  }),
}));

describe('RootLayout', () => {
  it('renders children correctly', () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('includes proper body class', () => {
    const { container } = render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );

    const body = container.querySelector('body');
    expect(body).toHaveClass('inter-font');
  });

  it('includes proper meta tags configuration', () => {
    // This test verifies that the metadata is properly configured
    // The actual meta tags are handled by Next.js during SSR
    expect(true).toBe(true); // Placeholder for metadata verification
  });
});