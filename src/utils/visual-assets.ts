/**
 * Visual assets utility for consistent image handling and branding
 */

// Image size configurations for different use cases
export const imageSizes = {
  avatar: {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 96, height: 96 }
  },
  card: {
    sm: { width: 200, height: 150 },
    md: { width: 300, height: 200 },
    lg: { width: 400, height: 300 },
    xl: { width: 600, height: 400 }
  },
  hero: {
    sm: { width: 400, height: 300 },
    md: { width: 800, height: 600 },
    lg: { width: 1200, height: 800 },
    xl: { width: 1600, height: 1000 }
  },
  thumbnail: {
    sm: { width: 80, height: 80 },
    md: { width: 120, height: 120 },
    lg: { width: 160, height: 160 },
    xl: { width: 200, height: 200 }
  }
} as const;

// Responsive image sizes for Next.js Image component
export const responsiveSizes = {
  avatar: '(max-width: 768px) 32px, (max-width: 1200px) 48px, 64px',
  card: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  hero: '100vw',
  thumbnail: '(max-width: 768px) 80px, (max-width: 1200px) 120px, 160px',
  full: '100vw',
  half: '(max-width: 768px) 100vw, 50vw',
  third: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quarter: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'
} as const;

// Placeholder image URLs for different categories
export const placeholderImages = {
  avatar: '/images/placeholders/avatar-placeholder.svg',
  company: '/images/placeholders/company-placeholder.svg',
  service: '/images/placeholders/service-placeholder.svg',
  industry: '/images/placeholders/industry-placeholder.svg',
  process: '/images/placeholders/process-placeholder.svg',
  hero: '/images/placeholders/hero-placeholder.svg',
  case_study: '/images/placeholders/case-study-placeholder.svg',
  compliance: '/images/placeholders/compliance-placeholder.svg',
  generic: '/images/placeholders/generic-placeholder.svg'
} as const;

// Brand asset paths
export const brandAssets = {
  logo: {
    primary: '/images/brand/logo-primary.svg',
    white: '/images/brand/logo-white.svg',
    dark: '/images/brand/logo-dark.svg',
    icon: '/images/brand/logo-icon.svg'
  },
  favicon: {
    ico: '/favicon.ico',
    png: '/favicon.png',
    svg: '/favicon.svg'
  },
  social: {
    og_image: '/images/brand/og-image.png',
    twitter_card: '/images/brand/twitter-card.png'
  }
} as const;

// Image optimization settings
export const imageOptimization = {
  quality: 85,
  formats: ['webp', 'avif'],
  placeholder: 'blur' as const,
  priority: false,
  loading: 'lazy' as const
} as const;

// Generate blur data URL for placeholder
export const generateBlurDataURL = (width: number = 10, height: number = 10): string => {
  const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null;
  if (!canvas) {
    // Fallback for SSR
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';
  }
  
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Create a simple gradient blur
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f1f5f9');
  gradient.addColorStop(1, '#e2e8f0');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
};

// Get optimized image props for Next.js Image component
export interface OptimizedImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export const getOptimizedImageProps = (config: OptimizedImageConfig) => {
  const {
    src,
    alt,
    width,
    height,
    sizes = responsiveSizes.card,
    priority = false,
    quality = imageOptimization.quality,
    placeholder = 'blur',
    blurDataURL
  } = config;

  return {
    src,
    alt,
    width,
    height,
    sizes,
    priority,
    quality,
    placeholder,
    blurDataURL: blurDataURL || (placeholder === 'blur' ? generateBlurDataURL(width, height) : undefined),
    loading: priority ? 'eager' as const : 'lazy' as const
  };
};

// Get placeholder image for specific category
export const getPlaceholderImage = (
  category: keyof typeof placeholderImages,
  fallback: string = placeholderImages.generic
): string => {
  return placeholderImages[category] || fallback;
};

// Check if image URL is external
export const isExternalImage = (src: string): boolean => {
  return src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//');
};

// Generate srcSet for responsive images
export const generateSrcSet = (baseSrc: string, sizes: number[]): string => {
  if (isExternalImage(baseSrc)) {
    return '';
  }
  
  return sizes
    .map(size => `${baseSrc}?w=${size} ${size}w`)
    .join(', ');
};

// Image loading states
export const imageLoadingStates = {
  loading: 'animate-pulse bg-muted',
  loaded: 'animate-none bg-transparent',
  error: 'bg-muted border-2 border-dashed border-muted-foreground/30'
} as const;

// Accessibility helpers
export const getImageAltText = (
  context: string,
  subject?: string,
  description?: string
): string => {
  const parts = [context, subject, description].filter(Boolean);
  return parts.join(' - ');
};

// Image aspect ratios
export const aspectRatios = {
  square: '1:1',
  landscape: '4:3',
  portrait: '3:4',
  wide: '16:9',
  ultrawide: '21:9',
  golden: '1.618:1'
} as const;

// Convert aspect ratio to Tailwind classes
export const getAspectRatioClass = (ratio: keyof typeof aspectRatios): string => {
  const ratioMap = {
    square: 'aspect-square',
    landscape: 'aspect-[4/3]',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-video',
    ultrawide: 'aspect-[21/9]',
    golden: 'aspect-[1.618/1]'
  };
  
  return ratioMap[ratio] || 'aspect-square';
};

export type ImageCategory = keyof typeof placeholderImages;
export type ImageSize = keyof typeof imageSizes;
export type ResponsiveSize = keyof typeof responsiveSizes;
export type AspectRatio = keyof typeof aspectRatios;