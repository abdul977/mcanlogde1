import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

// Create transporter
const transporter = nodemailer.createTransporter(emailConfig);

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error);
    return false;
  }
};

// Email templates
const emailTemplates = {
  'payment-reminder': (data) => ({
    subject: `Payment Reminder - Month ${data.monthNumber} Due`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #28a745; margin-bottom: 20px;">Payment Reminder</h2>
          
          <p>Dear ${data.userName},</p>
          
          <p>This is a friendly reminder about your upcoming accommodation payment.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Payment Details</h3>
            <p><strong>Accommodation:</strong> ${data.accommodationTitle}</p>
            <p><strong>Month:</strong> ${data.monthNumber}</p>
            <p><strong>Amount:</strong> ₦${data.amount?.toLocaleString()}</p>
            <p><strong>Due Date:</strong> ${data.dueDate}</p>
          </div>
          
          <div style="background-color: ${data.reminderType === 'overdue' ? '#fff3cd' : '#d1ecf1'}; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: ${data.reminderType === 'overdue' ? '#856404' : '#0c5460'};">
              ${data.message}
            </p>
          </div>
          
          <div style="margin: 30px 0;">
            <h4>How to Make Payment:</h4>
            <ol>
              <li>Log in to your MCAN account</li>
              <li>Go to "My Bookings"</li>
              <li>Find your accommodation booking</li>
              <li>Click "Upload Payment Proof" for Month ${data.monthNumber}</li>
              <li>Upload your payment screenshot and details</li>
            </ol>
          </div>
          
          <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #6c757d;">
              <strong>Need Help?</strong> Contact our support team if you have any questions about your payment.
            </p>
          </div>
          
          <p>Thank you for choosing MCAN Lodge.</p>
          
          <p style="color: #6c757d; font-size: 12px; margin-top: 30px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
    text: `
      Payment Reminder - Month ${data.monthNumber}
      
      Dear ${data.userName},
      
      This is a reminder about your accommodation payment:
      
      Accommodation: ${data.accommodationTitle}
      Month: ${data.monthNumber}
      Amount: ₦${data.amount?.toLocaleString()}
      Due Date: ${data.dueDate}
      
      ${data.message}
      
      Please log in to your MCAN account to upload your payment proof.
      
      Thank you,
      MCAN Lodge Team
    `
  }),
  
  'payment-approved': (data) => ({
    subject: `Payment Approved - Month ${data.monthNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #28a745; margin-bottom: 20px;">✅ Payment Approved</h2>
          
          <p>Dear ${data.userName},</p>
          
          <p>Great news! Your payment has been approved.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Payment Details</h3>
            <p><strong>Accommodation:</strong> ${data.accommodationTitle}</p>
            <p><strong>Month:</strong> ${data.monthNumber}</p>
            <p><strong>Amount:</strong> ₦${data.amount?.toLocaleString()}</p>
            <p><strong>Approved Date:</strong> ${data.approvedDate}</p>
          </div>
          
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #155724;">
              Your payment has been successfully verified and processed. Thank you for your prompt payment!
            </p>
          </div>
          
          <p>You can view your payment history and upcoming payments in your MCAN account.</p>
          
          <p>Thank you for choosing MCAN Lodge.</p>
        </div>
      </div>
    `
  }),
  
  'payment-rejected': (data) => ({
    subject: `Payment Verification Required - Month ${data.monthNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #dc3545; margin-bottom: 20px;">Payment Verification Required</h2>
          
          <p>Dear ${data.userName},</p>
          
          <p>We need additional information regarding your payment submission.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Payment Details</h3>
            <p><strong>Accommodation:</strong> ${data.accommodationTitle}</p>
            <p><strong>Month:</strong> ${data.monthNumber}</p>
            <p><strong>Amount:</strong> ₦${data.amount?.toLocaleString()}</p>
          </div>
          
          ${data.rejectionReason ? `
          <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #721c24;">
              <strong>Reason:</strong> ${data.rejectionReason}
            </p>
          </div>
          ` : ''}
          
          <p>Please resubmit your payment proof with the correct information or contact our support team for assistance.</p>
          
          <p>Thank you for your understanding.</p>
        </div>
      </div>
    `
  })
};

// Send email function
export const sendEmail = async (emailData) => {
  try {
    const { to, subject, template, data, html, text } = emailData;
    
    let emailContent = {};
    
    if (template && emailTemplates[template]) {
      emailContent = emailTemplates[template](data);
    } else {
      emailContent = { subject, html, text };
    }
    
    const mailOptions = {
      from: `"MCAN Lodge" <${process.env.SMTP_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}:`, result.messageId);
    return result;
    
  } catch (error) {
    console.error(`❌ Failed to send email to ${emailData.to}:`, error);
    throw error;
  }
};

// Send bulk emails
export const sendBulkEmails = async (emailList) => {
  const results = [];
  
  for (const emailData of emailList) {
    try {
      const result = await sendEmail(emailData);
      results.push({ success: true, email: emailData.to, messageId: result.messageId });
    } catch (error) {
      results.push({ success: false, email: emailData.to, error: error.message });
    }
  }
  
  return results;
};

// Initialize email service
export const initEmailService = async () => {
  const isConfigured = await verifyEmailConfig();
  if (!isConfigured) {
    console.warn('⚠️ Email service is not properly configured. Check your SMTP settings.');
  }
  return isConfigured;
};

export default {
  sendEmail,
  sendBulkEmails,
  initEmailService
};
