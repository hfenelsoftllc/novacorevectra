import * as fc from 'fast-check';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeadCaptureForm } from '../../components/forms/LeadCaptureForm';
import { FormVariant } from '@/types';
import { 
  leadCaptureSchema, 
  contactFormSchema, 
  newsletterSchema
} from '@/schemas/forms';

// Mock the analytics hook
jest.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackFormStart: jest.fn(),
    trackFormSubmission: jest.fn(),
    trackFormFieldCompletion: jest.fn(),
  }),
}));

// Mock progressive profiling utilities
jest.mock('../../utils/progressiveProfiling', () => ({
  isReturningVisitor: jest.fn(() => false),
  getVisitorData: jest.fn(() => null),
  saveVisitorData: jest.fn(),
  trackVisit: jest.fn(),
  getVisitCount: jest.fn(() => 1),
  getProgressiveFields: jest.fn(() => []),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

describe('Property 6: Form Validation and Progressive Profiling', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    cleanup();
  });

  it('should validate required fields for any form variant', async () => {
    // Feature: full-marketing-site, Property 6: Form Validation and Progressive Profiling
    fc.assert(
      fc.property(
        fc.constantFrom('contact', 'lead-capture', 'newsletter', 'demo', 'consultation'),
        async (variant: FormVariant) => {
          const mockOnSubmit = jest.fn();
          
          render(
            <LeadCaptureForm
              variant={variant}
              onSubmit={mockOnSubmit}
            />
          );

          // Try to submit without filling required fields
          const submitButton = screen.getByRole('button', { type: 'submit' });
          await userEvent.click(submitButton);

          // Wait for validation to complete and check for error messages
          await waitFor(() => {
            const errorMessages = screen.queryAllByRole('alert');
            // Should show validation errors for required fields
            expect(errorMessages.length).toBeGreaterThan(0);
          });

          // Form should not be submitted due to validation errors
          expect(mockOnSubmit).not.toHaveBeenCalled();

          return true;
        }
      ),
      { numRuns: 2 }
    );
  });

  it('should accept valid form data according to schema requirements', async () => {
    // Feature: full-marketing-site, Property 6: Form Validation and Progressive Profiling
    fc.assert(
      fc.property(
        fc.constantFrom('newsletter'), // Test with simplest form first
        async (variant: FormVariant) => {
          const validData = {
            firstName: 'John',
            email: 'john@example.com',
          };

          // Validate against schema first
          const result = newsletterSchema.safeParse(validData);
          expect(result.success).toBe(true);

          const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
          
          render(
            <LeadCaptureForm
              variant={variant}
              onSubmit={mockOnSubmit}
            />
          );

          // Fill form with valid data
          await userEvent.type(screen.getByLabelText(/first name/i), validData.firstName);
          await userEvent.type(screen.getByLabelText(/email address/i), validData.email);

          // Submit form
          const submitButton = screen.getByRole('button', { type: 'submit' });
          await userEvent.click(submitButton);

          // Should successfully submit with valid data
          await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith(
              expect.objectContaining({
                firstName: validData.firstName,
                email: validData.email,
              })
            );
          });

          return true;
        }
      ),
      { numRuns: 2 }
    );
  });

  it('should show appropriate fields based on form variant', async () => {
    // Feature: full-marketing-site, Property 6: Form Validation and Progressive Profiling
    fc.assert(
      fc.property(
        fc.constantFrom('contact', 'lead-capture', 'newsletter'),
        async (variant: FormVariant) => {
          render(
            <LeadCaptureForm
              variant={variant}
              onSubmit={jest.fn()}
            />
          );

          // All variants should have first name and email
          expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();

          // Check variant-specific fields
          if (variant === 'contact') {
            expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
          } else if (variant === 'lead-capture') {
            expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/project type/i)).toBeInTheDocument();
          } else if (variant === 'newsletter') {
            // Newsletter form should only have basic fields
            expect(screen.queryByLabelText(/last name/i)).not.toBeInTheDocument();
            expect(screen.queryByLabelText(/company/i)).not.toBeInTheDocument();
          }

          return true;
        }
      ),
      { numRuns: 2 }
    );
  });

  it('should handle progressive profiling with existing data', async () => {
    // Feature: full-marketing-site, Property 6: Form Validation and Progressive Profiling
    fc.assert(
      fc.property(
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
          company: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        async (existingData: any) => {
          render(
            <LeadCaptureForm
              variant="lead-capture"
              onSubmit={jest.fn()}
              showProgressiveFields={true}
              existingData={existingData}
            />
          );

          // Should show all basic fields for lead-capture variant
          expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/project type/i)).toBeInTheDocument();

          // Progressive fields should also be present
          expect(screen.getByLabelText(/budget range/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/timeline/i)).toBeInTheDocument();

          return true;
        }
      ),
      { numRuns: 2 }
    );
  });

  it('should validate schema compliance for different form variants', () => {
    // Feature: full-marketing-site, Property 6: Form Validation and Progressive Profiling
    fc.assert(
      fc.property(
        fc.constantFrom('contact', 'lead-capture', 'newsletter'),
        (variant: FormVariant) => {
          let schema;
          let validData;
          let invalidData;

          switch (variant) {
            case 'contact':
              schema = contactFormSchema;
              validData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                company: 'Test Corp',
                subject: 'Test Subject',
                message: 'This is a test message with enough characters.',
              };
              invalidData = { ...validData, email: 'invalid-email' };
              break;
            case 'newsletter':
              schema = newsletterSchema;
              validData = {
                firstName: 'John',
                email: 'john@example.com',
              };
              invalidData = { ...validData, email: 'invalid-email' };
              break;
            default:
              schema = leadCaptureSchema;
              validData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                company: 'Test Corp',
                jobTitle: 'Manager',
                industry: 'aviation',
                projectType: 'ai-strategy',
              };
              invalidData = { ...validData, email: 'invalid-email' };
          }

          // Schema validation should pass for valid data
          const validResult = schema.safeParse(validData);
          expect(validResult.success).toBe(true);

          // Schema validation should fail for invalid data
          const invalidResult = schema.safeParse(invalidData);
          expect(invalidResult.success).toBe(false);

          return true;
        }
      ),
      { numRuns: 2 }
    );
  });
});