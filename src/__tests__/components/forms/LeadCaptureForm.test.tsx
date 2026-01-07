import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeadCaptureForm } from '@/components/forms/LeadCaptureForm';

// Mock the analytics hook
jest.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackFormStart: jest.fn(),
    trackFormSubmission: jest.fn(),
    trackFormFieldCompletion: jest.fn(),
  }),
}));

// Mock progressive profiling utilities
jest.mock('@/utils/progressiveProfiling', () => ({
  isReturningVisitor: jest.fn(() => false),
  getVisitorData: jest.fn(() => null),
  saveVisitorData: jest.fn(),
  trackVisit: jest.fn(),
  getVisitCount: jest.fn(() => 1),
  getProgressiveFields: jest.fn(() => []),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('LeadCaptureForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders newsletter form variant correctly', () => {
    render(
      <LeadCaptureForm
        variant="newsletter"
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
  });

  test('renders contact form variant correctly', () => {
    render(
      <LeadCaptureForm
        variant="contact"
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  test('renders lead capture form variant correctly', () => {
    render(
      <LeadCaptureForm
        variant="lead-capture"
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Job Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Industry/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Project Type/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <LeadCaptureForm
        variant="contact"
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByRole('button', { name: /send message/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/subject is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);
    
    render(
      <LeadCaptureForm
        variant="contact"
        onSubmit={mockOnSubmit}
      />
    );

    await user.type(screen.getByLabelText(/First Name/i), 'John');
    await user.type(screen.getByLabelText(/Last Name/i), 'Doe');
    await user.type(screen.getByLabelText(/Email Address/i), 'john.doe@example.com');
    await user.type(screen.getByLabelText(/Company/i), 'Test Company');
    await user.type(screen.getByLabelText(/Subject/i), 'Test Subject');
    await user.type(screen.getByLabelText(/Message/i), 'This is a test message');

    const submitButton = screen.getByRole('button', { name: /send message/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        company: 'Test Company',
        subject: 'Test Subject',
        message: 'This is a test message',
      });
    });
  });

  test('shows returning visitor message when applicable', () => {
    const { isReturningVisitor, getVisitorData } = require('@/utils/progressiveProfiling');
    
    // Mock returning visitor
    isReturningVisitor.mockReturnValue(true);
    getVisitorData.mockReturnValue({
      firstName: 'John',
      email: 'john@example.com',
    });

    render(
      <LeadCaptureForm
        variant="lead-capture"
        onSubmit={mockOnSubmit}
        showProgressiveFields={true}
      />
    );

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });
});