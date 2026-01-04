import * as React from 'react';
import { motion } from 'framer-motion';
import { Search, Palette, Rocket, Settings } from 'lucide-react';
import { ProcessStep } from '@/types/process';
import { PROCESS_STEPS } from '@/constants/processes';
import { cn } from '@/utils';

/**
 * Props for ProcessLifecycleSection component
 */
export interface ProcessLifecycleSectionProps {
  processes?: ProcessStep[];
  animationDelay?: number;
  className?: string;
}

/**
 * Individual process step component with hover interactions
 */
const ProcessStepCard = React.memo<{
  step: ProcessStep;
  index: number;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}>(({ step, index, isHovered, onHover }) => {
  // Icon mapping for process steps
  const iconMap = {
    discover: Search,
    design: Palette,
    deploy: Rocket,
    operate: Settings,
  };

  const IconComponent = iconMap[step.id as keyof typeof iconMap] || Search;

  // Animation variants for the step card
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    hover: {
      scale: 1.05,
      y: -10,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  // Animation variants for the details panel
  const detailsVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.div
      className="relative"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, margin: '-50px' }}
      onHoverStart={() => onHover(step.id)}
      onHoverEnd={() => onHover(null)}
    >
      {/* Main step card */}
      <div className={cn(
        'bg-card border rounded-xl p-6 shadow-sm transition-all duration-300',
        'hover:shadow-lg hover:border-primary/20',
        isHovered && 'border-primary/30 shadow-md'
      )}>
        {/* Step number and icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300',
              'bg-primary/10 text-primary',
              isHovered && 'bg-primary text-primary-foreground'
            )}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Step {index + 1}
            </div>
          </div>
          {step.duration && (
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {step.duration}
            </div>
          )}
        </div>

        {/* Step title and description */}
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {step.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {step.description}
        </p>

        {/* Expandable details */}
        <motion.div
          variants={detailsVariants}
          initial="hidden"
          animate={isHovered ? "visible" : "hidden"}
          className="overflow-hidden"
        >
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-2">
              Key Activities:
            </h4>
            <ul className="space-y-1">
              {step.details.map((detail, detailIndex) => (
                <li 
                  key={detailIndex}
                  className="text-xs text-muted-foreground flex items-start"
                >
                  <span className="w-1 h-1 bg-primary rounded-full mt-2 mr-2 flex-shrink-0" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Connection line to next step */}
      {index < 3 && (
        <motion.div
          className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-primary/20"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 0.8, 
            delay: (index + 1) * 0.2,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        />
      )}
    </motion.div>
  );
});

ProcessStepCard.displayName = 'ProcessStepCard';

/**
 * ProcessLifecycleSection component displays the four-stage process flow
 * with animations and hover interactions
 */
const ProcessLifecycleSectionComponent = React.forwardRef<
  HTMLElement,
  ProcessLifecycleSectionProps
>(({ processes = PROCESS_STEPS, animationDelay = 0, className, ...props }, ref) => {
  const [hoveredStep, setHoveredStep] = React.useState<string | null>(null);

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: animationDelay,
        staggerChildren: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  // Header animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.section
      ref={ref}
      className={cn('max-w-7xl mx-auto px-6 py-20', className)}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      aria-labelledby="process-lifecycle-heading"
      role="region"
      aria-label="Our process lifecycle"
      {...props}
    >
      {/* Section header */}
      <motion.header 
        className="text-center mb-16"
        variants={headerVariants}
      >
        <h2 
          id="process-lifecycle-heading"
          className="text-3xl sm:text-4xl font-semibold text-foreground mb-4"
        >
          Our Process Lifecycle
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          From discovery to deployment and beyond, we guide you through every step 
          of your AI transformation journey with proven methodologies and expert support.
        </p>
      </motion.header>

      {/* Process steps grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
        {processes.map((step, index) => (
          <ProcessStepCard
            key={step.id}
            step={step}
            index={index}
            isHovered={hoveredStep === step.id}
            onHover={setHoveredStep}
          />
        ))}
      </div>

      {/* Mobile connection indicators */}
      <div className="lg:hidden mt-8 flex justify-center">
        <div className="flex space-x-2">
          {processes.map((_, index) => (
            <React.Fragment key={index}>
              <div className="w-2 h-2 bg-primary rounded-full" />
              {index < processes.length - 1 && (
                <div className="w-8 h-0.5 bg-gradient-to-r from-primary/50 to-primary/20 self-center" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </motion.section>
  );
});

ProcessLifecycleSectionComponent.displayName = 'ProcessLifecycleSection';

// Memoize the component to prevent unnecessary re-renders
export const ProcessLifecycleSection = React.memo(ProcessLifecycleSectionComponent);