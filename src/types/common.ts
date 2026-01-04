import { ReactNode } from 'react';
import { Service } from './services';

/**
 * Animation properties for framer-motion components
 */
export interface AnimationProps {
  initial?: object;
  animate?: object;
  transition?: object;
  delay?: number;
}

/**
 * Base props for section components
 */
export interface SectionProps {
  className?: string;
  children: ReactNode;
}

/**
 * Props for animated section wrapper
 */
export interface AnimatedSectionProps extends SectionProps {
  animationProps?: AnimationProps;
  viewport?: object;
}

/**
 * Props for action buttons
 */
export interface ActionButtonProps {
  text: string;
  onClick: () => void;
}

/**
 * Props for hero section
 */
export interface HeroSectionProps {
  title: string;
  subtitle: string;
  primaryAction: ActionButtonProps;
  secondaryAction: ActionButtonProps;
}

/**
 * Props for service card component
 */
export interface ServiceCardProps {
  service: Service;
  index?: number;
  className?: string;
}
