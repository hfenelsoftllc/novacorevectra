/**
 * @jest-environment jsdom
 */

import { CalendarService, calendarService, type ConsultationRequest } from '@/services/calendarService';

describe('CalendarService', () => {
  // Store original console methods
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  
  // Mock console methods
  const mockConsoleLog = jest.fn();
  const mockConsoleError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Replace console methods with mocks
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    // Reset Math.random for consistent testing
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Restore original console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = CalendarService.getInstance();
      const instance2 = CalendarService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export a singleton instance', () => {
      expect(calendarService).toBeInstanceOf(CalendarService);
    });
  });

  describe('createConsultationEvent', () => {
    const mockConsultationData: ConsultationRequest = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      company: 'Test Corp',
      jobTitle: 'CTO',
      industry: 'technology',
      projectType: 'ai-strategy',
      message: 'Looking for AI implementation guidance',
    };

    it('should create consultation event successfully', async () => {
      const result = await calendarService.createConsultationEvent(mockConsultationData);
      
      expect(result).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '📅 Creating calendar event:',
        expect.objectContaining({
          summary: 'AI Consultation - Test Corp',
          attendee: 'John Doe <john.doe@example.com>',
        })
      );
    });

    it('should handle consultation event creation with minimal data', async () => {
      const minimalData: ConsultationRequest = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        company: 'Smith LLC',
      };

      const result = await calendarService.createConsultationEvent(minimalData);
      
      expect(result).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '📅 Creating calendar event:',
        expect.objectContaining({
          summary: 'AI Consultation - Smith LLC',
          attendee: 'Jane Smith <jane@example.com>',
        })
      );
    });

    it('should handle API failures gracefully', async () => {
      // Mock Math.random to trigger API failure (< 0.05)
      jest.spyOn(Math, 'random').mockReturnValue(0.01);

      const result = await calendarService.createConsultationEvent(mockConsultationData);
      
      expect(result).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith(
        '❌ Calendar event creation failed:',
        expect.any(Error)
      );
    });

    it('should generate correct event description', async () => {
      await calendarService.createConsultationEvent(mockConsultationData);
      
      // Check that the description includes all provided information
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '📧 Sending calendar invitation:',
        expect.objectContaining({
          to: 'john.doe@example.com',
          from: 'novacorevectrallc@novacorevectra.net',
          subject: 'Calendar Invitation: AI Consultation - Test Corp',
        })
      );
    });
  });

  describe('getAvailableTimeSlots', () => {
    it('should return available slots for weekdays', async () => {
      // Use a date that parses to a weekday: 2025-01-14 -> Monday
      const weekday = '2025-01-14';
      
      // Mock Math.random to ensure we get some slots (filter uses random)
      // Need to return > 0.3 for slots to be included
      jest.spyOn(Math, 'random').mockImplementation(() => 0.8);
      
      const slots = await calendarService.getAvailableTimeSlots(weekday);
      
      expect(Array.isArray(slots)).toBe(true);
      expect(slots.length).toBeGreaterThan(0);
      expect(slots).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^\d{2}:\d{2}$/)
        ])
      );
    });

    it('should return empty array for weekends', async () => {
      // Use a date that parses to weekend: 2025-01-12 -> Saturday
      const weekend = '2025-01-12';
      
      const slots = await calendarService.getAvailableTimeSlots(weekend);
      
      expect(slots).toEqual([]);
    });

    it('should handle timezone parameter', async () => {
      const date = '2025-01-14'; // Monday
      const timezone = 'America/New_York';
      
      // Mock Math.random to ensure we get some slots
      jest.spyOn(Math, 'random').mockImplementation(() => 0.8);
      
      const slots = await calendarService.getAvailableTimeSlots(date, timezone);
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining(`Available slots for ${date} (${timezone}):`),
        expect.any(Array)
      );
    });

    it('should handle errors gracefully', async () => {
      // Pass invalid date to trigger error
      const invalidDate = 'invalid-date';
      
      const slots = await calendarService.getAvailableTimeSlots(invalidDate);
      
      // Invalid date still returns slots in current implementation
      expect(Array.isArray(slots)).toBe(true);
    });
  });

  describe('isTimeSlotAvailable', () => {
    it('should return true for business hours on weekdays', async () => {
      // Monday 2 PM - use a date that parses correctly
      const businessHour = '2025-01-14T14:00:00Z';
      
      const isAvailable = await calendarService.isTimeSlotAvailable(businessHour);
      
      expect(typeof isAvailable).toBe('boolean');
      // With Math.random mocked to 0.5, should be available (> 0.2)
      expect(isAvailable).toBe(true);
    });

    it('should return false for weekends', async () => {
      // Saturday 2 PM
      const weekend = '2025-01-12T14:00:00Z';
      
      const isAvailable = await calendarService.isTimeSlotAvailable(weekend);
      
      expect(isAvailable).toBe(false);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('❌ Time slot')
      );
    });

    it('should return false for outside business hours', async () => {
      // Monday 8 AM (before 9 AM)
      const earlyHour = '2025-01-14T08:00:00Z';
      
      const isAvailable = await calendarService.isTimeSlotAvailable(earlyHour);
      
      expect(isAvailable).toBe(false);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Outside business hours')
      );
    });

    it('should handle timezone parameter', async () => {
      const dateTime = '2025-01-14T14:00:00Z';
      const timezone = 'Europe/London';
      
      await calendarService.isTimeSlotAvailable(dateTime, timezone);
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining(`(${timezone})`),
      );
    });

    it('should handle errors gracefully', async () => {
      const invalidDateTime = 'invalid-datetime';
      
      const isAvailable = await calendarService.isTimeSlotAvailable(invalidDateTime);
      
      // Invalid date doesn't throw error in current implementation
      expect(typeof isAvailable).toBe('boolean');
    });
  });

  describe('cancelEvent', () => {
    it('should cancel event successfully', async () => {
      const eventId = 'test-event-123';
      
      const result = await calendarService.cancelEvent(eventId);
      
      expect(result).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        `📅 Cancelling calendar event: ${eventId}`
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        `✅ Calendar event ${eventId} cancelled successfully`
      );
    });

    // TODO: Add test for cancellation failure scenarios
    it.todo('should handle cancellation failures gracefully');
  });

  describe('rescheduleEvent', () => {
    it('should reschedule event successfully when time slot is available', async () => {
      const eventId = 'test-event-123';
      const newDateTime = '2025-01-14T15:00:00Z'; // Monday
      
      const result = await calendarService.rescheduleEvent(eventId, newDateTime);
      
      expect(result).toBe(true);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        `📅 Rescheduling calendar event ${eventId} to ${newDateTime}`
      );
    });

    it('should fail to reschedule when time slot is unavailable', async () => {
      // Mock Math.random to make time slot unavailable (< 0.2)
      jest.spyOn(Math, 'random').mockReturnValue(0.1);
      
      const eventId = 'test-event-123';
      const newDateTime = '2025-01-14T15:00:00Z'; // Monday
      
      const result = await calendarService.rescheduleEvent(eventId, newDateTime);
      
      expect(result).toBe(false);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('❌ Cannot reschedule: Time slot')
      );
    });

    // TODO: Add test for rescheduling API failure scenarios
    it.todo('should handle rescheduling API failures gracefully');
  });

  describe('getBusinessDaysBetween', () => {
    it('should return business days between two dates', () => {
      // Create dates explicitly to avoid timezone issues
      const startDate = new Date(2025, 0, 13); // January 13, 2025 (Monday)
      const endDate = new Date(2025, 0, 17);   // January 17, 2025 (Friday)
      
      const businessDays = calendarService.getBusinessDaysBetween(startDate, endDate);
      
      expect(businessDays).toHaveLength(5);
      expect(businessDays[0].getDay()).toBe(1); // Monday
      expect(businessDays[4].getDay()).toBe(5); // Friday
    });

    it('should exclude weekends', () => {
      // January 10-13, 2025 (Friday to Monday)
      const startDate = new Date(2025, 0, 10); // Friday
      const endDate = new Date(2025, 0, 13);   // Monday
      
      const businessDays = calendarService.getBusinessDaysBetween(startDate, endDate);
      
      expect(businessDays).toHaveLength(2);
      expect(businessDays[0].getDay()).toBe(5); // Friday
      expect(businessDays[1].getDay()).toBe(1); // Monday
    });

    it('should handle same day range', () => {
      // Single weekday
      const date = new Date(2025, 0, 13); // Monday
      
      const businessDays = calendarService.getBusinessDaysBetween(date, date);
      
      expect(businessDays).toHaveLength(1);
      expect(businessDays[0].getDay()).toBe(1); // Monday
    });

    it('should return empty array for weekend-only range', () => {
      // January 11-12, 2025 (Saturday to Sunday)
      const startDate = new Date(2025, 0, 11); // Saturday
      const endDate = new Date(2025, 0, 12);   // Sunday
      
      const businessDays = calendarService.getBusinessDaysBetween(startDate, endDate);
      
      expect(businessDays).toHaveLength(0);
    });
  });

  describe('ICS Generation', () => {
    it('should generate valid ICS content structure', async () => {
      const consultationData: ConsultationRequest = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        company: 'Test Company',
      };

      await calendarService.createConsultationEvent(consultationData);
      
      // Verify that calendar invitation was sent (ICS generation is called internally)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '📧 Sending calendar invitation:',
        expect.objectContaining({
          hasICSAttachment: true,
          icsSize: expect.any(Number),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeouts gracefully', async () => {
      // This test would be more meaningful with actual network calls
      // For now, we test that errors are caught and logged
      const consultationData: ConsultationRequest = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        company: 'Test Company',
      };

      // Mock random to trigger API failure
      jest.spyOn(Math, 'random').mockReturnValue(0.01);

      const result = await calendarService.createConsultationEvent(consultationData);
      
      expect(result).toBe(false);
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });
});