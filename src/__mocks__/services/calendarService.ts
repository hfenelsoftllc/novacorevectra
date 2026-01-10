/**
 * Mock implementation of the calendar service for testing
 * Provides consistent mocking for all calendar service methods
 */

import type { ConsultationRequest, CalendarEventData } from '../../services/calendarService';

const mockCalendarService = {
  // Main method used in CTASection
  createConsultationEvent: jest.fn().mockImplementation(async (data: ConsultationRequest): Promise<boolean> => {
    // Simulate realistic behavior
    if (!data.email || !data.firstName || !data.lastName || !data.company) {
      return false;
    }
    return true;
  }),
  
  // Additional methods that might be called
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
    const isAvailable = await mockCalendarService.isTimeSlotAvailable(newDateTime);
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

// Mock the CalendarService class
const MockCalendarService = jest.fn().mockImplementation(() => mockCalendarService);
// Add getInstance as a static method
(MockCalendarService as any).getInstance = jest.fn().mockReturnValue(mockCalendarService);

export const CalendarService = MockCalendarService;
export const calendarService = mockCalendarService;

// Export types for compatibility
export type { ConsultationRequest, CalendarEventData };