/**
 * This file contains email templates for various notifications sent to users.
 * In a real application, these templates would be rendered on the server-side
 * and sent as HTML emails, but this file provides a reference for what content
 * would be included in different notification types.
 */

/**
 * Generate payment verification success email content
 * @param {Object} order - Order details
 * @returns {Object} - Email subject and content
 */
export const paymentVerifiedTemplate = (order) => {
  return {
    subject: `Your payment for order #${order.id} has been verified - FoiyFoshi Books`,
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="text-align: center; padding: 20px; background-color: #805A29;">
          <h1 style="color: #ffffff; margin: 0;">FoiyFoshi Books</h1>
        </header>
        
        <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
          <h2>Payment Verified!</h2>
          <p>Dear ${order.customerName},</p>
          
          <p>Great news! We've received and verified your payment for order <strong>#${order.id}</strong>.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #805A29;">Order Summary:</h3>
            <p><strong>Order Number:</strong> #${order.id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> MVR ${order.total.toFixed(2)}</p>
          </div>
          
          <p>Your order is now being processed and will be shipped shortly. You'll receive another email with tracking information once your order is on its way.</p>
          
          <p>Thank you for choosing FoiyFoshi Books for your reading adventures!</p>
          
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
 * Generate payment rejection email content
 * @param {Object} order - Order details
 * @param {string} reason - Reason for rejection (optional)
 * @returns {Object} - Email subject and content
 */
export const paymentRejectedTemplate = (order, reason = "") => {
  return {
    subject: `Action Required: Payment rejected for order #${order.id} - FoiyFoshi Books`,
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="text-align: center; padding: 20px; background-color: #805A29;">
          <h1 style="color: #ffffff; margin: 0;">FoiyFoshi Books</h1>
        </header>
        
        <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
          <h2>Payment Verification Issue</h2>
          <p>Dear ${order.customerName},</p>
          
          <p>We're writing to inform you that we couldn't verify the payment receipt for your order <strong>#${order.id}</strong>.</p>
          
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          
          <div style="background-color: #fff8e1; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ffc107;">
            <h3 style="margin-top: 0; color: #805A29;">What's Next:</h3>
            <p>Please log in to your FoiyFoshi account and upload a clear image of your payment receipt for this order.</p>
            <p>Make sure the receipt shows:</p>
            <ul>
              <li>Transaction date and time</li>
              <li>Transaction amount</li>
              <li>Reference number</li>
            </ul>
          </div>
          
          <a href="https://foiyfoshi.com/dashboard/orders/${order.id}" style="display: inline-block; background-color: #805A29; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px;">Upload Receipt</a>
          
          <p style="margin-top: 20px;">If you believe this is an error or need assistance, please contact our customer support team.</p>
          
          <p>Thank you for your understanding.</p>
          
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
 * Generate order shipment notification email content
 * @param {Object} order - Order details with tracking information
 * @returns {Object} - Email subject and content
 */
export const orderShippedTemplate = (order) => {
  return {
    subject: `Your FoiyFoshi Books order #${order.id} is on its way!`,
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="text-align: center; padding: 20px; background-color: #805A29;">
          <h1 style="color: #ffffff; margin: 0;">FoiyFoshi Books</h1>
        </header>
        
        <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
          <h2>Your Order Is On Its Way!</h2>
          <p>Dear ${order.customerName},</p>
          
          <p>Exciting news! Your FoiyFoshi Books order has been shipped and is on its way to you.</p>
          
          <div style="background-color: #e8f5e9; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #4caf50;">
            <h3 style="margin-top: 0; color: #805A29;">Tracking Information:</h3>
            <p><strong>Tracking Number:</strong> ${order.trackingNumber || 'N/A'}</p>
            <p><strong>Carrier:</strong> ${order.carrier || 'Local Delivery'}</p>
            <p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery || 'Within 3-5 business days'}</p>
          </div>
          
          <a href="${order.trackingUrl || 'https://foiyfoshi.com/dashboard/orders/' + order.id}" style="display: inline-block; background-color: #805A29; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px;">Track Your Order</a>
          
          <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
            <h3 style="color: #805A29;">Order Summary:</h3>
            <p><strong>Order Number:</strong> #${order.id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
          </div>
          
          <p style="margin-top: 20px;">We hope you'll enjoy your books! Happy reading!</p>
          
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
 * Generate order delivered notification email content
 * @param {Object} order - Order details
 * @returns {Object} - Email subject and content
 */
export const orderDeliveredTemplate = (order) => {
  return {
    subject: `Your FoiyFoshi Books order #${order.id} has been delivered!`,
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="text-align: center; padding: 20px; background-color: #805A29;">
          <h1 style="color: #ffffff; margin: 0;">FoiyFoshi Books</h1>
        </header>
        
        <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
          <h2>Your Order Has Been Delivered!</h2>
          <p>Dear ${order.customerName},</p>
          
          <p>We're pleased to inform you that your FoiyFoshi Books order has been delivered!</p>
          
          <div style="background-color: #e8f5e9; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #4caf50;">
            <h3 style="margin-top: 0; color: #805A29;">Delivery Confirmation:</h3>
            <p><strong>Order Number:</strong> #${order.id}</p>
            <p><strong>Delivery Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="margin-top: 20px;">
            <h3 style="color: #805A29;">How was your experience?</h3>
            <p>We'd love to hear your thoughts! Rate your experience or leave a review.</p>
            <a href="https://foiyfoshi.com/review-order/${order.id}" style="display: inline-block; background-color: #805A29; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px; margin-top: 10px;">Rate Your Experience</a>
          </div>
          
          <p style="margin-top: 20px;">Thank you for choosing FoiyFoshi Books. We hope you enjoy your new reads!</p>
          
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
