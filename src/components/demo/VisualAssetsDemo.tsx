'use client';

import React from 'react';
import { 
  Logo, 
  OptimizedImage, 
  ImagePlaceholder, 
  LoadingSpinner,
  BrandText,
  BrandGradient,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '../ui';
import { 
  placeholderImages, 
  imageSizes
} from '../../utils/visual-assets';

/**
 * Demo component showcasing visual assets and branding system
 * This component demonstrates proper usage of all visual components
 */
export const VisualAssetsDemo: React.FC = () => {
  return (
    <div className="space-y-12 p-8">
      {/* Logo Variants */}
      <section>
        <BrandText variant="h3" className="mb-6">Logo Variants</BrandText>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Default</CardTitle>
            </CardHeader>
            <CardContent>
              <Logo size="lg" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compact</CardTitle>
            </CardHeader>
            <CardContent>
              <Logo variant="compact" size="lg" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Icon Only</CardTitle>
            </CardHeader>
            <CardContent>
              <Logo variant="icon-only" size="lg" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Text Only</CardTitle>
            </CardHeader>
            <CardContent>
              <Logo variant="text-only" size="lg" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Image Placeholders */}
      <section>
        <BrandText variant="h3" className="mb-6">Image Placeholders</BrandText>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Default</CardTitle>
            </CardHeader>
            <CardContent>
              <ImagePlaceholder 
                aspectRatio="landscape"
                text="Service Image"
                iconType="image"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gradient</CardTitle>
            </CardHeader>
            <CardContent>
              <ImagePlaceholder 
                variant="gradient"
                aspectRatio="square"
                text="User Avatar"
                iconType="user"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <ImagePlaceholder 
                variant="pattern"
                aspectRatio="wide"
                text="Company Building"
                iconType="building"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Animated</CardTitle>
            </CardHeader>
            <CardContent>
              <ImagePlaceholder 
                variant="icon"
                aspectRatio="portrait"
                text="Loading..."
                iconType="chart"
                animate
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Loading Spinners */}
      <section>
        <BrandText variant="h3" className="mb-6">Loading States</BrandText>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Default Spinner</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="Loading..." />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dots</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <LoadingSpinner variant="dots" size="lg" text="Processing..." />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pulse</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <LoadingSpinner variant="pulse" size="lg" text="Syncing..." />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bars</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <LoadingSpinner variant="bars" size="lg" text="Analyzing..." />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Typography Scale */}
      <section>
        <BrandText variant="h3" className="mb-6">Typography Scale</BrandText>
        <div className="space-y-4">
          <BrandText variant="h1">Heading 1 - Main Page Title</BrandText>
          <BrandText variant="h2">Heading 2 - Section Title</BrandText>
          <BrandText variant="h3">Heading 3 - Subsection Title</BrandText>
          <BrandText variant="h4">Heading 4 - Component Title</BrandText>
          <BrandText variant="h5">Heading 5 - Card Title</BrandText>
          <BrandText variant="h6">Heading 6 - Small Title</BrandText>
          <BrandText variant="body">
            Body text - This is the standard body text used throughout the application. 
            It provides good readability and follows our typography guidelines.
          </BrandText>
          <BrandText variant="caption" color="secondary">
            Caption text - Used for image captions, form help text, and secondary information.
          </BrandText>
          <BrandText variant="overline" color="muted">
            Overline text - Used for labels and categories
          </BrandText>
        </div>
      </section>

      {/* Brand Gradients */}
      <section>
        <BrandText variant="h3" className="mb-6">Brand Gradients</BrandText>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BrandGradient 
            className="h-32 rounded-lg flex items-center justify-center"
            from="from-brand-primary"
            to="to-primary-600"
          >
            <BrandText variant="h5" className="text-white">Primary Gradient</BrandText>
          </BrandGradient>
          
          <BrandGradient 
            className="h-32 rounded-lg flex items-center justify-center"
            from="from-brand-secondary"
            to="to-secondary-600"
          >
            <BrandText variant="h5" className="text-white">Secondary Gradient</BrandText>
          </BrandGradient>
          
          <BrandGradient 
            className="h-32 rounded-lg flex items-center justify-center"
            from="from-brand-accent"
            to="to-accent-600"
          >
            <BrandText variant="h5" className="text-white">Accent Gradient</BrandText>
          </BrandGradient>
        </div>
      </section>

      {/* Optimized Images Example */}
      <section>
        <BrandText variant="h3" className="mb-6">Optimized Images</BrandText>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Service Card</CardTitle>
              <CardDescription>
                Optimized image with loading state and fallback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OptimizedImage
                src={placeholderImages.service}
                alt="AI Strategy Service"
                width={imageSizes.card.md.width}
                height={imageSizes.card.md.height}
                className="w-full rounded-lg"
                fallbackSrc={placeholderImages.generic}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Industry Example</CardTitle>
              <CardDescription>
                Industry-specific imagery with proper optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OptimizedImage
                src={placeholderImages.industry}
                alt="Healthcare Industry Solutions"
                width={imageSizes.card.md.width}
                height={imageSizes.card.md.height}
                className="w-full rounded-lg"
                fallbackSrc={placeholderImages.generic}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Case Study</CardTitle>
              <CardDescription>
                Case study image with responsive sizing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OptimizedImage
                src={placeholderImages.case_study}
                alt="Successful AI Implementation Case Study"
                width={imageSizes.card.md.width}
                height={imageSizes.card.md.height}
                className="w-full rounded-lg"
                fallbackSrc={placeholderImages.generic}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Aspect Ratios */}
      <section>
        <BrandText variant="h3" className="mb-6">Aspect Ratios</BrandText>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Square (1:1)</CardTitle>
            </CardHeader>
            <CardContent>
              <ImagePlaceholder 
                aspectRatio="square"
                text="Square Image"
                variant="gradient"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Landscape (4:3)</CardTitle>
            </CardHeader>
            <CardContent>
              <ImagePlaceholder 
                aspectRatio="landscape"
                text="Landscape Image"
                variant="pattern"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wide (16:9)</CardTitle>
            </CardHeader>
            <CardContent>
              <ImagePlaceholder 
                aspectRatio="wide"
                text="Wide Image"
                variant="default"
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};