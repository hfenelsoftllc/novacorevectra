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
   * Create calendar event using Google Calendar API (placeholder for actual implementation)
   */
  private async createCalendarEvent(eventData: CalendarEventData): Promise<boolean> {
    try {
      // In a real implementation, this would integrate with:
      // - Google Calendar API
      // - Microsoft Graph API (for Outlook)
      // - CalDAV protocol
      // - Or other calendar service provider
      
      // For now, we'll simulate the calendar event creation and log the data
      console.log('📅 Calendar event would be created:', {
        summary: eventData.summary,
        attendee: `${eventData.attendeeName} <${eventData.attendeeEmail}>`,
        startTime: eventData.startDateTime,
        endTime: eventData.endDateTime,
        timestamp: new Date().toISOString(),
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In development, you could use:
      // - Google Calendar API with service account
      // - Calendly API for scheduling
      // - Cal.com API for open-source scheduling
      
      // Send calendar invitation email
      await this.sendCalendarInvitation(eventData);
      
      return true;
    } catch (error) {
      console.error('Calendar event creation failed:', error);
      return false;
    }
  }

  /**
   * Send calendar invitation email
   */
  private async sendCalendarInvitation(eventData: CalendarEventData): Promise<void> {
    // Generate ICS file content for calendar invitation
    // Generate ICS content for calendar integration
    this.generateICSContent(eventData);
    
    console.log('📧 Calendar invitation would be sent:', {
      to: eventData.attendeeEmail,
      subject: `Calendar Invitation: ${eventData.summary}`,
      icsAttachment: 'event.ics',
    });
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
  async getAvailableTimeSlots(_date: string, _timezone: string = 'UTC'): Promise<string[]> {
    // In a real implementation, this would check calendar availability
    // For now, return standard business hours
    const businessHours = [
      '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
    ];
    
    return businessHours;
  }

  /**
   * Validate if a time slot is available
   */
  async isTimeSlotAvailable(dateTime: string, _timezone: string = 'UTC'): Promise<boolean> {
    // In a real implementation, this would check against existing calendar events
    // For now, assume all business hours are available
    const date = new Date(dateTime);
    const hour = date.getHours();
    
    // Available during business hours (9 AM - 5 PM)
    return hour >= 9 && hour <= 17;
  }
}

export const calendarService = CalendarService.getInstance();