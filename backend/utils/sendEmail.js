const nodemailer = require('nodemailer');

/**
 * Send email using configured email provider
 * Production: Uses SMTP settings from environment variables
 * Development: Uses ethereal.email (nodemailer's testing service) if credentials not provided
 */
const sendEmail = async (options) => {
  let transporter;
  let info;
  
  // Check if we have proper email credentials (support both EMAIL_USER/USERNAME)
  const emailUser = process.env.EMAIL_USER || process.env.EMAIL_USERNAME;
  const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
  
  const hasCredentials = emailUser && 
                        emailPass && 
                        emailPass !== 'your_app_password_here' &&
                        emailPass !== 'bookbox03136'; // Don't expose default passwords
  
  // Use real email credentials if available, otherwise use test account
  if (hasCredentials) {
    console.log('📧 Using configured email credentials:', emailUser);
    
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtpout.secureserver.net',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });
  } else {
    // Fallback to Ethereal test account for development
    console.log('🔧 No valid email credentials found, using test email account...');
    
    try {
      // Create test account using ethereal.email (no real emails sent)
      const testAccount = await nodemailer.createTestAccount();
      
      // Create transporter with test account
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      
      console.log('📧 Using test email account:', testAccount.user);
    } catch (error) {
      console.error('❌ Failed to create test email account:', error.message);
      throw new Error('Failed to set up email service');
    }
  }

  // Create message object with basic properties - Updated branding
  const message = {
    from: `foiyfoshi <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || process.env.EMAIL_USERNAME || 'noreply@foiyfoshi.mv'}>`,
    to: options.to || options.email,
    subject: options.subject,
  };
  
  // Add either html or text content based on what's provided
  if (options.html) {
    message.html = options.html;
  } else if (options.message || options.text) {
    message.text = options.message || options.text;
  }
  
  try {
    // Verify transporter configuration
    await transporter.verify();
    console.log('📧 SMTP configuration verified successfully');
    
    // Send the email
    info = await transporter.sendMail(message);
    
    // Log appropriate message based on email type
    if (hasCredentials) {
      console.log('✅ Real email sent successfully to:', message.to);
      console.log('📧 Subject:', options.subject);
      console.log('📧 Message ID:', info.messageId);
    } else {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('✅ Test email sent successfully!');
      console.log('📧 To:', message.to);
      console.log('📧 Subject:', options.subject);
      console.log('📧 Preview URL:', previewUrl);
      console.log('📧 (This is a test email - check the preview URL to see the email content)');
      
      // Return both the email info and the preview URL for development testing
      return {
        ...info,
        previewUrl,
        developmentMode: true
      };
    }
    
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('❌ Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    throw error;
  }
};

module.exports = sendEmail;
