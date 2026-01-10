/**
 * Centralized calendar service mock utilities
 * Provides consistent mocking patterns for calendar service across tests
 */

import type { ConsultationRequest } from '@/services/calendarService';

/**
 * Creates a comprehensive mock for the calendar service
 * @param overrides - Optional overrides for specific methods
 */
export const createMockCalendarService = (overrides: Partial<any> = {}) => {
  const defaultMock = {
    createConsultationEvent: jest.fn().mockImplementation(async (data: ConsultationRequest): Promise<boolean> => {
      // Validate required fields
      if (!data.email || !data.firstName || !data.lastName || !data.company) {
        return false;
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return true;
    }),
    
    getAvailableTimeSlots: jest.fn().mockImplementation(async (date: string, _timezone: string = 'UTC'): Promise<string[]> => {
      const targetDate = new Date(date);
      const dayOfWeek = targetDate.getDay();
      
      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return [];
      }
      
      return [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
      ];
    }),
    
    isTimeSlotAvailable: jest.fn().mockImplementation(async (dateTime: string, _timezone: string = 'UTC'): Promise<boolean> => {
      const date = new Date(dateTime);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      
      // Not available on weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return false;
      }
      
      // Not available outside business hours (9 AM - 5 PM)
      if (hour < 9 || hour >= 17) {
        return false;
      }
      
      return true;
    }),
    
    cancelEvent: jest.fn().mockResolvedValue(true),
    
    rescheduleEvent: jest.fn().mockImplementation(async (_eventId: string, newDateTime: string): Promise<boolean> => {
      // Check if new time slot is available
      const isAvailable = await defaultMock.isTimeSlotAvailable(newDateTime);
      return isAvailable;
    }),
    
    getBusinessDaysBetween: jest.fn().mockImplementation((startDate: Date, endDate: Date): Date[] => {
      const businessDays: Date[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        // Monday = 1, Friday = 5
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          businessDays.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return businessDays;
    })
  };

  return {
    ...defaultMock,
    ...overrides
  };
};

/**
 * Mock calendar service that simulates failures
 */
export const createFailingMockCalendarService = () => {
  return createMockCalendarService({
    createConsultationEvent: jest.fn().mockResolvedValue(false),
    getAvailableTimeSlots: jest.fn().mockResolvedValue([]),
    isTimeSlotAvailable: jest.fn().mockResolvedValue(false),
    cancelEvent: jest.fn().mockResolvedValue(false),
    rescheduleEvent: jest.fn().mockResolvedValue(false)
  });
};

/**
 * Mock calendar service that simulates network errors
 */
export const createErrorMockCalendarService = () => {
  const networkError = new Error('Calendar API temporarily unavailable');
  
  return createMockCalendarService({
    createConsultationEvent: jest.fn().mockRejectedValue(networkError),
    getAvailableTimeSlots: jest.fn().mockRejectedValue(networkError),
    isTimeSlotAvailable: jest.fn().mockRejectedValue(networkError),
    cancelEvent: jest.fn().mockRejectedValue(networkError),
    rescheduleEvent: jest.fn().mockRejectedValue(networkError)
  });
};

/**
 * Setup calendar service mock for tests
 * Call this in beforeEach to ensure consistent mocking
 */
export const setupCalendarServiceMock = (mockImplementation?: any) => {
  const mockService = mockImplementation || createMockCalendarService();
  
  // Mock the module
  jest.doMock('@/services/calendarService', () => ({
    CalendarService: jest.fn().mockImplementation(() => mockService),
    calendarService: mockService
  }));
  
  return mockService;
};