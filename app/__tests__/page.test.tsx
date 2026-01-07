import { render, screen } from '@testing-library/react';
import HomePage from '../page';

// Mock the analytics hook
jest.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackFunnelStep: jest.fn(),
    trackCTAClick: jest.fn(),
  }),
}));

describe('HomePage', () => {
  it('renders the main heading and content', () => {
    render(<HomePage />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Trusted AI for Business Process Transformation'
    );
    expect(screen.getByText(/NovaCoreVectra delivers strategy-led/)).toBeInTheDocument();
  });

  it('renders the CTA buttons', () => {
    render(<HomePage />);
    
    expect(screen.getByRole('button', { name: /explore our services/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /executive brief/i })).toBeInTheDocument();
  });

  it('renders the additional CTA section', () => {
    render(<HomePage />);
    
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Build AI You Can Trust');
    expect(screen.getByText(/Get started with our comprehensive AI solutions/)).toBeInTheDocument();
  });
});