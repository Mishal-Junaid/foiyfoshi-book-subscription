/**
 * This file contains email templates related to payment processing.
 */

/**
 * Generate payment waiting for verification email content
 * @param {Object} order - Order details
 * @returns {Object} - Email subject and content
 */
export const paymentPendingTemplate = (order) => {
  return {
    subject: `Your payment is being processed for order #${order.id} - FoiyFoshi Books`,
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="text-align: center; padding: 20px; background-color: #805A29;">
          <h1 style="color: #ffffff; margin: 0;">FoiyFoshi Books</h1>
        </header>
        
        <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
          <h2>Payment Being Processed</h2>
          <p>Dear ${order.customerName},</p>
          
          <p>Thank you for your order! We've received your payment receipt for order <strong>#${order.id}</strong> and it is currently being verified.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #805A29;">Order Summary:</h3>
            <p><strong>Order Number:</strong> #${order.id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> MVR ${order.total.toFixed(2)}</p>
          </div>
          
          <div style="background-color: #fff8e1; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ffc107;">
            <h3 style="margin-top: 0; color: #805A29;">What's Next:</h3>
            <p>Our team is reviewing your payment receipt and will process your order shortly. This typically takes 1-2 business days.</p>
            <p>You'll receive another email once your payment is confirmed.</p>
          </div>
          
          <a href="https://foiyfoshi.com/dashboard/orders/${order.id}" style="display: inline-block; background-color: #805A29; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px;">Track Order Status</a>
          
          <p style="margin-top: 20px;">Thank you for your patience and for choosing FoiyFoshi Books!</p>
          
          <p>Regards,<br>The FoiyFoshi Books Team</p>
        </div>
        
        <footer style="text-align: center; padding: 15px; font-size: 12px; color: #666;">
          <p>If you have any questions, please contact our support at support@foiyfoshi.com</p>
          <p>&copy; ${new Date().getFullYear()} FoiyFoshi Books. All rights reserved.</p>
        </footer>
      </div>
    `
  };
};

/**
 * Generate payment update email content
 * @param {Object} order - Order details
 * @param {string} status - Payment status (approved/rejected)
 * @param {string} reason - Reason for rejection (only required if status is rejected)
 * @returns {Object} - Email subject and content
 */
export const paymentStatusUpdateTemplate = (order, status, reason = '') => {
  if (status === 'approved') {
    return {
      subject: `Your payment for order #${order.id} has been approved - FoiyFoshi Books`,
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <header style="text-align: center; padding: 20px; background-color: #805A29;">
            <h1 style="color: #ffffff; margin: 0;">FoiyFoshi Books</h1>
          </header>
          
          <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
            <h2>Payment Approved!</h2>
            <p>Dear ${order.customerName},</p>
            
            <p>Great news! We've approved your payment for order <strong>#${order.id}</strong>.</p>
            
            <div style="background-color: #e8f5e9; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #4caf50;">
              <h3 style="margin-top: 0; color: #805A29;">Order Status: Processing</h3>
              <p>Your order is now being processed and will be prepared for shipping.</p>
              <p>You'll receive another notification when your order ships.</p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #805A29;">Order Summary:</h3>
              <p><strong>Order Number:</strong> #${order.id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> MVR ${order.total.toFixed(2)}</p>
            </div>
            
            <a href="https://foiyfoshi.com/dashboard/orders/${order.id}" style="display: inline-block; background-color: #805A29; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px;">View Order Details</a>
            
            <p style="margin-top: 20px;">Thank you for choosing FoiyFoshi Books for your reading adventures!</p>
            
            <p>Regards,<br>The FoiyFoshi Books Team</p>
          </div>
          
          <footer style="text-align: center; padding: 15px; font-size: 12px; color: #666;">
            <p>If you have any questions, please contact our support at support@foiyfoshi.com</p>
            <p>&copy; ${new Date().getFullYear()} FoiyFoshi Books. All rights reserved.</p>
          </footer>
        </div>
      `
    };
  } else {
    return {
      subject: `Action Required: Payment issue with your order #${order.id} - FoiyFoshi Books`,
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <header style="text-align: center; padding: 20px; background-color: #805A29;">
            <h1 style="color: #ffffff; margin: 0;">FoiyFoshi Books</h1>
          </header>
          
          <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
            <h2>Payment Verification Issue</h2>
            <p>Dear ${order.customerName},</p>
            
            <p>We encountered an issue verifying the payment for your order <strong>#${order.id}</strong>.</p>
            
            <div style="background-color: #ffebee; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #f44336;">
              <h3 style="margin-top: 0; color: #805A29;">Issue Details:</h3>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : '<p>We were unable to verify your payment receipt.</p>'}
              <p>Please upload a clear image of your payment receipt to proceed with your order.</p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #805A29;">Order Summary:</h3>
              <p><strong>Order Number:</strong> #${order.id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> MVR ${order.total.toFixed(2)}</p>
            </div>
            
            <a href="https://foiyfoshi.com/dashboard/orders/${order.id}/upload-receipt" style="display: inline-block; background-color: #805A29; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px;">Upload New Receipt</a>
            
            <p style="margin-top: 20px;">If you need any assistance, please don't hesitate to contact our support team.</p>
            
            <p>Regards,<br>The FoiyFoshi Books Team</p>
          </div>
          
          <footer style="text-align: center; padding: 15px; font-size: 12px; color: #666;">
            <p>If you have any questions, please contact our support at support@foiyfoshi.com</p>
            <p>&copy; ${new Date().getFullYear()} FoiyFoshi Books. All rights reserved.</p>
          </footer>
        </div>
      `
    };
  }
};
