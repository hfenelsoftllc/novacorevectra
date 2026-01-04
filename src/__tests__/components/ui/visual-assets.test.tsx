import React from 'react';
import { render, screen } from '@testing-library/react';
import { 
  Logo, 
  ImagePlaceholder, 
  LoadingSpinner,
  BrandText,
  BrandGradient 
} from '../../../components/ui';

describe('Visual Assets Components', () => {
  describe('Logo', () => {
    it('renders default logo with icon and text', () => {
      render(<Logo />);
      
      expect(screen.getByText('NCV')).toBeInTheDocument();
      expect(screen.getByText('NovaCoreVectra')).toBeInTheDocument();
    });

    it('renders icon-only variant', () => {
      render(<Logo variant="icon-only" />);
      
      expect(screen.getByText('NCV')).toBeInTheDocument();
      expect(screen.queryByText('NovaCoreVectra')).not.toBeInTheDocument();
    });

    it('renders text-only variant', () => {
      render(<Logo variant="text-only" />);
      
      expect(screen.getByText('NovaCoreVectra')).toBeInTheDocument();
      expect(screen.queryByText('NCV')).not.toBeInTheDocument();
    });

    it('renders compact variant', () => {
      render(<Logo variant="compact" />);
      
      const ncvElements = screen.getAllByText('NCV');
      expect(ncvElements.length).toBeGreaterThan(0);
    });
  });

  describe('ImagePlaceholder', () => {
    it('renders default placeholder with icon', () => {
      render(<ImagePlaceholder text="Test Image" />);
      
      expect(screen.getByText('Test Image')).toBeInTheDocument();
    });

    it('renders different variants', () => {
      const { rerender } = render(<ImagePlaceholder variant="gradient" text="Gradient" />);
      expect(screen.getByText('Gradient')).toBeInTheDocument();

      rerender(<ImagePlaceholder variant="pattern" text="Pattern" />);
      expect(screen.getByText('Pattern')).toBeInTheDocument();

      rerender(<ImagePlaceholder variant="icon" text="Icon" />);
      expect(screen.getByText('Icon')).toBeInTheDocument();
    });

    it('renders different icon types', () => {
      const { rerender } = render(<ImagePlaceholder iconType="user" text="User" />);
      expect(screen.getByText('User')).toBeInTheDocument();

      rerender(<ImagePlaceholder iconType="building" text="Building" />);
      expect(screen.getByText('Building')).toBeInTheDocument();

      rerender(<ImagePlaceholder iconType="chart" text="Chart" />);
      expect(screen.getByText('Chart')).toBeInTheDocument();
    });
  });

  describe('LoadingSpinner', () => {
    it('renders default spinner', () => {
      render(<LoadingSpinner />);
      
      // Check that spinner container is present
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('renders with text', () => {
      render(<LoadingSpinner text="Loading..." />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders different variants', () => {
      const { rerender } = render(<LoadingSpinner variant="dots" />);
      let dotsSpinner = document.querySelector('.animate-pulse');
      expect(dotsSpinner).toBeInTheDocument();

      rerender(<LoadingSpinner variant="pulse" />);
      let pulseSpinner = document.querySelector('.animate-ping');
      expect(pulseSpinner).toBeInTheDocument();

      rerender(<LoadingSpinner variant="bars" />);
      let barsSpinner = document.querySelector('.animate-pulse');
      expect(barsSpinner).toBeInTheDocument();
    });
  });

  describe('BrandText', () => {
    it('renders different heading variants', () => {
      const { rerender } = render(<BrandText variant="h1">Heading 1</BrandText>);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Heading 1');

      rerender(<BrandText variant="h2">Heading 2</BrandText>);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Heading 2');

      rerender(<BrandText variant="h3">Heading 3</BrandText>);
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Heading 3');
    });

    it('renders body text', () => {
      render(<BrandText variant="body">Body text content</BrandText>);
      
      expect(screen.getByText('Body text content')).toBeInTheDocument();
    });

    it('applies different color variants', () => {
      const { rerender } = render(<BrandText color="primary">Primary text</BrandText>);
      expect(screen.getByText('Primary text')).toHaveClass('text-foreground');

      rerender(<BrandText color="secondary">Secondary text</BrandText>);
      expect(screen.getByText('Secondary text')).toHaveClass('text-muted-foreground');

      rerender(<BrandText color="muted">Muted text</BrandText>);
      expect(screen.getByText('Muted text')).toHaveClass('text-muted-foreground/80');
    });
  });

  describe('BrandGradient', () => {
    it('renders gradient container', () => {
      render(
        <BrandGradient data-testid="gradient">
          <span>Gradient content</span>
        </BrandGradient>
      );
      
      const gradient = screen.getByTestId('gradient');
      expect(gradient).toBeInTheDocument();
      expect(gradient).toHaveClass('bg-gradient-to-br');
      expect(screen.getByText('Gradient content')).toBeInTheDocument();
    });

    it('applies custom gradient directions', () => {
      const { rerender } = render(
        <BrandGradient direction="to-r" data-testid="gradient">
          Content
        </BrandGradient>
      );
      
      expect(screen.getByTestId('gradient')).toHaveClass('bg-gradient-to-r');

      rerender(
        <BrandGradient direction="to-t" data-testid="gradient">
          Content
        </BrandGradient>
      );
      
      expect(screen.getByTestId('gradient')).toHaveClass('bg-gradient-to-t');
    });
  });
});