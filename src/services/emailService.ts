/**
 * Email service for handling form submissions and notifications
 * Integrates with external email services for sending emails
 */

export interface EmailData {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

export interface ExecutiveBriefRequest {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle?: string;
  industry?: string;
  message?: string;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}

export interface CalendarEventData {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  attendeeEmail: string;
  attendeeName: string;
}

/**
 * Email service class for handling various email operations
 */
export class EmailService {
  private static instance: EmailService;
  
  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send executive brief request email
   */
  async sendExecutiveBriefRequest(data: ExecutiveBriefRequest): Promise<boolean> {
    try {
      const emailData: EmailData = {
        to: 'support@novacorevectra.net',
        from: 'noreply@novacorevectra.net',
        subject: `Executive Brief Request from ${data.firstName} ${data.lastName}`,
        html: this.generateExecutiveBriefEmailHTML(data),
        text: this.generateExecutiveBriefEmailText(data),
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      console.error('Error sending executive brief request:', error);
      return false;
    }
  }

  /**
   * Send contact form submission
   */
  async sendContactForm(data: ContactFormData): Promise<boolean> {
    try {
      const emailData: EmailData = {
        to: 'novacorevectrallc@novacorevectra.net',
        from: 'noreply@novacorevectra.net',
        subject: `Contact Form: ${data.subject}`,
        html: this.generateContactFormEmailHTML(data),
        text: this.generateContactFormEmailText(data),
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      console.error('Error sending contact form:', error);
      return false;
    }
  }

  /**
   * Send email using external service (placeholder for actual implementation)
   */
  private async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // In a real implementation, this would integrate with:
      // - SendGrid API
      // - AWS SES
      // - Mailgun
      // - Or other email service provider
      
      // For now, we'll simulate the email sending and log the data
      console.log('📧 Email would be sent:', {
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject,
        timestamp: new Date().toISOString(),
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In development, we can use a service like EmailJS or similar
      // For production, integrate with your preferred email service
      
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  /**
   * Generate HTML email template for executive brief request
   */
  private generateExecutiveBriefEmailHTML(data: ExecutiveBriefRequest): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Executive Brief Request</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f8fafc; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #475569; }
            .value { margin-top: 5px; }
            .footer { padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Executive Brief Request</h1>
            </div>
            <div class="content">
              <p>A new executive brief request has been submitted through the website.</p>
              
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${data.firstName} ${data.lastName}</div>
              </div>
              
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${data.email}</div>
              </div>
              
              <div class="field">
                <div class="label">Company:</div>
                <div class="value">${data.company}</div>
              </div>
              
              ${data.jobTitle ? `
                <div class="field">
                  <div class="label">Job Title:</div>
                  <div class="value">${data.jobTitle}</div>
                </div>
              ` : ''}
              
              ${data.industry ? `
                <div class="field">
                  <div class="label">Industry:</div>
                  <div class="value">${data.industry}</div>
                </div>
              ` : ''}
              
              ${data.message ? `
                <div class="field">
                  <div class="label">Additional Information:</div>
                  <div class="value">${data.message}</div>
                </div>
              ` : ''}
              
              <div class="field">
                <div class="label">Requested:</div>
                <div class="value">${new Date().toLocaleString()}</div>
              </div>
            </div>
            <div class="footer">
              <p>Please send the executive brief document to the provided email address.</p>
              <p>NovaCoreVectra - Trusted AI for Business Process Transformation</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate plain text email for executive brief request
   */
  private generateExecutiveBriefEmailText(data: ExecutiveBriefRequest): string {
    return `
Executive Brief Request

A new executive brief request has been submitted through the website.

Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Company: ${data.company}
${data.jobTitle ? `Job Title: ${data.jobTitle}` : ''}
${data.industry ? `Industry: ${data.industry}` : ''}
${data.message ? `Additional Information: ${data.message}` : ''}
Requested: ${new Date().toLocaleString()}

Please send the executive brief document to the provided email address.

NovaCoreVectra - Trusted AI for Business Process Transformation
    `.trim();
  }

  /**
   * Generate HTML email template for contact form
   */
  private generateContactFormEmailHTML(data: ContactFormData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Contact Form Submission</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f8fafc; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #475569; }
            .value { margin-top: 5px; }
            .message { background: white; padding: 15px; border-left: 4px solid #3b82f6; margin-top: 10px; }
            .footer { padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Contact Form Submission</h1>
            </div>
            <div class="content">
              <p>A new contact form has been submitted through the website.</p>
              
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${data.firstName} ${data.lastName}</div>
              </div>
              
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${data.email}</div>
              </div>
              
              ${data.company ? `
                <div class="field">
                  <div class="label">Company:</div>
                  <div class="value">${data.company}</div>
                </div>
              ` : ''}
              
              <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${data.subject}</div>
              </div>
              
              <div class="field">
                <div class="label">Message:</div>
                <div class="message">${data.message.replace(/\n/g, '<br>')}</div>
              </div>
              
              <div class="field">
                <div class="label">Submitted:</div>
                <div class="value">${new Date().toLocaleString()}</div>
              </div>
            </div>
            <div class="footer">
              <p>Please respond to this inquiry within 24 hours.</p>
              <p>NovaCoreVectra - Trusted AI for Business Process Transformation</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate plain text email for contact form
   */
  private generateContactFormEmailText(data: ContactFormData): string {
    return `
Contact Form Submission

A new contact form has been submitted through the website.

Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
${data.company ? `Company: ${data.company}` : ''}
Subject: ${data.subject}

Message:
${data.message}

Submitted: ${new Date().toLocaleString()}

Please respond to this inquiry within 24 hours.

NovaCoreVectra - Trusted AI for Business Process Transformation
    `.trim();
  }
}

export const emailService = EmailService.getInstance();