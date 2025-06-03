// Mock email service for development
const mockSendEmail = async (options) => {
  // Log email details to console instead of actually sending
  console.log('==========================================');
  console.log('MOCK EMAIL SENT');
  console.log('------------------------------------------');
  console.log('To: ' + options.email);
  console.log('Subject: ' + options.subject);
  
  if (options.html) {
    console.log('Content (HTML): ' + options.html);
  } else if (options.message) {
    console.log('Content (Text): ' + options.message);
  }
  
  console.log('==========================================');
  
  // Return a resolved promise to simulate success
  return Promise.resolve({
    success: true,
    messageId: `mock-email-${Date.now()}@foiyfoshi.mv`
  });
};

module.exports = mockSendEmail;
