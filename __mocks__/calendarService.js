/**
 * Jest manual mock for calendar service
 * This file provides a default mock implementation that can be used across tests
 */

const mockCalendarService = {
  createConsultationEvent: jest.fn().mockImplementation(async (data) => {
    // Validate required fields
    if (!data.email || !data.firstName || !data.lastName || !data.company) {
      return false;
    }
    return true;
  }),
  
  getAvailableTimeSlots: jest.fn().mockImplementation(async (date, timezone = 'UTC') => {
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
  
  isTimeSlotAvailable: jest.fn().mockImplementation(async (dateTime, timezone = 'UTC') => {
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
  
  rescheduleEvent: jest.fn().mockImplementation(async (eventId, newDateTime) => {
    // Check if new time slot is available
    const isAvailable = await mockCalendarService.isTimeSlotAvailable(newDateTime);
    return isAvailable;
  }),
  
  getBusinessDaysBetween: jest.fn().mockImplementation((startDate, endDate) => {
    const businessDays = [];
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
MockCalendarService.getInstance = jest.fn().mockReturnValue(mockCalendarService);

module.exports = {
  CalendarService: MockCalendarService,
  calendarService: mockCalendarService
};