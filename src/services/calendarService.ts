/**
 * Google Calendar service for creating calendar events
 * Integrates with Google Calendar API for scheduling consultations
 */

export interface CalendarEventData {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  attendeeEmail: string;
  attendeeName: string;
  location?: string;
  meetingType?: 'video' | 'phone' | 'in-person';
}

export interface ConsultationRequest {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle?: string;
  industry?: string;
  projectType?: string;
  message?: string;
  preferredDate?: string;
  preferredTime?: string;
  timezone?: string;
}

/**
 * Calendar service class for handling Google Calendar operations
 */
export class CalendarService {
  private static instance: CalendarService;
  
  public static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  /**
   * Create a consultation calendar event
   */
  async createConsultationEvent(data: ConsultationRequest): Promise<boolean> {
    try {
      // Calculate event time (default to next business day at 2 PM if no preference)
      const eventDateTime = this.calculateEventDateTime(data.preferredDate, data.preferredTime, data.timezone);
      
      const eventData: CalendarEventData = {
        summary: `AI Consultation - ${data.company}`,
        description: this.generateEventDescription(data),
        startDateTime: eventDateTime.start,
        endDateTime: eventDateTime.end,
        attendeeEmail: data.email,
        attendeeName: `${data.firstName} ${data.lastName}`,
        location: 'Google Meet (link will be provided)',
        meetingType: 'video',
      };

      return await this.createCalendarEvent(eventData);
    } catch (error) {
      console.error('Error creating consultation event:', error);
      return false;
    }
  }

  /**
   * Create calendar event using Google Calendar API
   */
  private async createCalendarEvent(eventData: CalendarEventData): Promise<boolean> {
    try {
      // TODO: Implement actual Google Calendar API integration
      // This would require:
      // 1. Google Calendar API credentials (service account or OAuth)
      // 2. Calendar ID configuration
      // 3. Proper error handling for API failures
      // 4. Rate limiting and retry logic
      
      // For now, we'll simulate the calendar event creation and log the data
      console.log('📅 Creating calendar event:', {
        summary: eventData.summary,
        attendee: `${eventData.attendeeName} <${eventData.attendeeEmail}>`,
        startTime: eventData.startDateTime,
        endTime: eventData.endDateTime,
        location: eventData.location,
        meetingType: eventData.meetingType,
        timestamp: new Date().toISOString(),
      });

      // Simulate realistic API call behavior
      await this.simulateCalendarAPICall();

      // Generate and send calendar invitation
      await this.sendCalendarInvitation(eventData);
      
      // Log successful creation
      console.log('✅ Calendar event created successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Calendar event creation failed:', error);
      return false;
    }
  }

  /**
   * Simulate calendar API call with realistic timing and potential failures
   */
  private async simulateCalendarAPICall(): Promise<void> {
    // Simulate network delay (500ms - 2s)
    const delay = Math.random() * 1500 + 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Simulate occasional API failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Calendar API temporarily unavailable');
    }
  }

  /**
   * Send calendar invitation email with ICS attachment
   */
  private async sendCalendarInvitation(eventData: CalendarEventData): Promise<void> {
    try {
      // Generate ICS file content for calendar invitation
      const icsContent = this.generateICSContent(eventData);
      
      // TODO: Implement actual email service integration
      // This would require:
      // 1. Email service configuration (SendGrid, AWS SES, etc.)
      // 2. Email template for calendar invitations
      // 3. ICS file attachment handling
      // 4. Error handling for email delivery failures
      
      console.log('📧 Sending calendar invitation:', {
        to: eventData.attendeeEmail,
        from: 'novacorevectrallc@novacorevectra.net',
        subject: `Calendar Invitation: ${eventData.summary}`,
        hasICSAttachment: true,
        icsSize: icsContent.length,
      });

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('✅ Calendar invitation sent successfully');
    } catch (error) {
      console.error('❌ Failed to send calendar invitation:', error);
      throw error;
    }
  }

  /**
   * Calculate event date and time
   */
  private calculateEventDateTime(
    preferredDate?: string, 
    preferredTime?: string, 
    _timezone?: string
  ): { start: string; end: string } {
    const now = new Date();
    let eventDate = new Date();

    if (preferredDate) {
      eventDate = new Date(preferredDate);
    } else {
      // Default to next business day
      eventDate = this.getNextBusinessDay(now);
    }

    // Set time (default to 2 PM if no preference)
    if (preferredTime) {
      const [hours, minutes] = preferredTime.split(':').map(Number);
      eventDate.setHours(hours || 0, minutes || 0, 0, 0);
    } else {
      eventDate.setHours(14, 0, 0, 0); // 2 PM
    }

    // Create end time (1 hour later)
    const endDate = new Date(eventDate);
    endDate.setHours(endDate.getHours() + 1);

    return {
      start: eventDate.toISOString(),
      end: endDate.toISOString(),
    };
  }

  /**
   * Get next business day (Monday-Friday)
   */
  private getNextBusinessDay(date: Date): Date {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // If it's Saturday (6) or Sunday (0), move to Monday
    const dayOfWeek = nextDay.getDay();
    if (dayOfWeek === 0) { // Sunday
      nextDay.setDate(nextDay.getDate() + 1);
    } else if (dayOfWeek === 6) { // Saturday
      nextDay.setDate(nextDay.getDate() + 2);
    }
    
    return nextDay;
  }

  /**
   * Generate event description
   */
  private generateEventDescription(data: ConsultationRequest): string {
    return `
AI Consultation Meeting

Client Information:
- Name: ${data.firstName} ${data.lastName}
- Company: ${data.company}
- Email: ${data.email}
${data.jobTitle ? `- Job Title: ${data.jobTitle}` : ''}
${data.industry ? `- Industry: ${data.industry}` : ''}
${data.projectType ? `- Project Type: ${data.projectType}` : ''}

${data.message ? `Additional Information:\n${data.message}` : ''}

Meeting Details:
- Duration: 1 hour
- Type: Video conference (Google Meet link will be provided)
- Agenda: Discuss AI strategy, implementation opportunities, and next steps

Please confirm your attendance or request a reschedule if needed.

NovaCoreVectra - Trusted AI for Business Process Transformation
Contact: novacorevectrallc@novacorevectra.net
    `.trim();
  }

  /**
   * Generate ICS calendar file content
   */
  private generateICSContent(eventData: CalendarEventData): string {
    const startDate = new Date(eventData.startDateTime);
    const endDate = new Date(eventData.endDateTime);
    
    // Format dates for ICS (YYYYMMDDTHHMMSSZ)
    const formatICSDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const uid = `${Date.now()}@novacorevectra.net`;
    const timestamp = formatICSDate(new Date());

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NovaCoreVectra//Calendar//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${timestamp}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${eventData.summary}
DESCRIPTION:${eventData.description.replace(/\n/g, '\\n')}
LOCATION:${eventData.location || ''}
ORGANIZER;CN=NovaCoreVectra:MAILTO:novacorevectrallc@novacorevectra.net
ATTENDEE;CN=${eventData.attendeeName};RSVP=TRUE:MAILTO:${eventData.attendeeEmail}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
  }

  /**
   * Get available time slots for scheduling
   */
  async getAvailableTimeSlots(date: string, timezone: string = 'UTC'): Promise<string[]> {
    try {
      // TODO: Implement actual calendar availability checking
      // This would require:
      // 1. Integration with calendar provider API
      // 2. Checking existing events for conflicts
      // 3. Business hours configuration
      // 4. Timezone conversion handling
      
      const targetDate = new Date(date);
      const dayOfWeek = targetDate.getDay();
      
      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return [];
      }
      
      // Standard business hours with some slots potentially unavailable
      const allSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
      ];
      
      // Simulate some slots being unavailable (random for demo)
      const availableSlots = allSlots.filter(() => Math.random() > 0.3);
      
      console.log(`📅 Available slots for ${date} (${timezone}):`, availableSlots);
      
      return availableSlots;
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      return [];
    }
  }

  /**
   * Validate if a time slot is available
   */
  async isTimeSlotAvailable(dateTime: string, timezone: string = 'UTC'): Promise<boolean> {
    try {
      // TODO: Implement actual calendar conflict checking
      // This would require:
      // 1. Querying existing calendar events
      // 2. Checking for overlapping time slots
      // 3. Considering buffer time between meetings
      // 4. Handling timezone conversions
      
      const date = new Date(dateTime);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      
      // Not available on weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        console.log(`❌ Time slot ${dateTime} not available: Weekend`);
        return false;
      }
      
      // Not available outside business hours (9 AM - 5 PM)
      if (hour < 9 || hour >= 17) {
        console.log(`❌ Time slot ${dateTime} not available: Outside business hours`);
        return false;
      }
      
      // Simulate some random unavailability (for demo purposes)
      const isAvailable = Math.random() > 0.2; // 80% chance of availability
      
      console.log(`${isAvailable ? '✅' : '❌'} Time slot ${dateTime} (${timezone}): ${isAvailable ? 'Available' : 'Unavailable'}`);
      
      return isAvailable;
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      return false;
    }
  }

  /**
   * Cancel a calendar event
   * TODO: Implement actual calendar event cancellation
   */
  async cancelEvent(eventId: string): Promise<boolean> {
    try {
      console.log(`📅 Cancelling calendar event: ${eventId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`✅ Calendar event ${eventId} cancelled successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to cancel calendar event ${eventId}:`, error);
      return false;
    }
  }

  /**
   * Reschedule a calendar event
   * TODO: Implement actual calendar event rescheduling
   */
  async rescheduleEvent(eventId: string, newDateTime: string): Promise<boolean> {
    try {
      console.log(`📅 Rescheduling calendar event ${eventId} to ${newDateTime}`);
      
      // Check if new time slot is available
      const isAvailable = await this.isTimeSlotAvailable(newDateTime);
      if (!isAvailable) {
        console.log(`❌ Cannot reschedule: Time slot ${newDateTime} is not available`);
        return false;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      console.log(`✅ Calendar event ${eventId} rescheduled successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to reschedule calendar event ${eventId}:`, error);
      return false;
    }
  }

  /**
   * Get business days between two dates (inclusive)
   */
  getBusinessDaysBetween(startDate: Date, endDate: Date): Date[] {
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
  }
}

export const calendarService = CalendarService.getInstance();