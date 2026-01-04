import * as React from 'react';
import { cn } from '@/utils';

// Brand color palette
const brandColors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main brand primary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b', // Main brand secondary
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main brand accent
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Main success color
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main error color
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  }
} as const;

// Typography scale
const typography = {
  fontFamilies: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
  fontWeights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  lineHeights: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  }
} as const;

// Spacing scale
const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
} as const;

// Brand component interfaces
export interface BrandColorProps {
  color: keyof typeof brandColors;
  shade?: keyof typeof brandColors.primary;
  className?: string;
}

export interface BrandTextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'overline';
  weight?: keyof typeof typography.fontWeights;
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'success' | 'error';
  as?: React.ElementType;
}

// Brand color swatch component
const BrandColor: React.FC<BrandColorProps> = ({ 
  color, 
  shade = '500', 
  className 
}) => {
  const colorValue = (brandColors[color] as any)[shade];
  
  return (
    <div 
      className={cn('w-12 h-12 rounded-lg shadow-sm border', className)}
      style={{ backgroundColor: colorValue }}
      title={`${color}-${shade}: ${colorValue}`}
    />
  );
};

// Brand typography component
const BrandText = React.forwardRef<HTMLElement, BrandTextProps>(
  ({ 
    variant = 'body', 
    weight = 'normal', 
    color = 'primary',
    as,
    className,
    children,
    ...props 
  }, ref) => {
    const variantStyles = {
      h1: 'text-4xl md:text-5xl lg:text-6xl font-bold leading-tight',
      h2: 'text-3xl md:text-4xl lg:text-5xl font-bold leading-tight',
      h3: 'text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug',
      h4: 'text-xl md:text-2xl lg:text-3xl font-semibold leading-snug',
      h5: 'text-lg md:text-xl lg:text-2xl font-medium leading-normal',
      h6: 'text-base md:text-lg lg:text-xl font-medium leading-normal',
      body: 'text-base leading-relaxed',
      caption: 'text-sm leading-normal',
      overline: 'text-xs uppercase tracking-wider font-medium leading-none'
    };

    const colorStyles = {
      primary: 'text-foreground',
      secondary: 'text-muted-foreground',
      muted: 'text-muted-foreground/80',
      accent: 'text-brand-accent',
      success: 'text-brand-success',
      error: 'text-brand-error'
    };

    const weightStyles = {
      thin: 'font-thin',
      extralight: 'font-extralight',
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
      black: 'font-black'
    };

    const Component = as || (variant.startsWith('h') ? variant as React.ElementType : 'p');

    return (
      <Component
        ref={ref}
        className={cn(
          variantStyles[variant],
          colorStyles[color],
          weightStyles[weight],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

BrandText.displayName = 'BrandText';

// Brand gradient component
export interface BrandGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-tr' | 'to-tl' | 'to-br' | 'to-bl';
  from?: string;
  via?: string;
  to?: string;
}

const BrandGradient = React.forwardRef<HTMLDivElement, BrandGradientProps>(
  ({ 
    direction = 'to-br',
    from = 'from-brand-primary',
    via,
    to = 'to-primary-600',
    className,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-gradient-' + direction,
          from,
          via,
          to,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BrandGradient.displayName = 'BrandGradient';

// Export all brand system components
export {
  BrandColor,
  BrandText,
  BrandGradient,
  brandColors,
  typography,
  spacing
};