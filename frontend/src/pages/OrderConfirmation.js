import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaArrowLeft, FaFileAlt, FaShippingFast } from 'react-icons/fa';

import Button from '../components/ui/Button';
import BankDetails from '../components/ui/BankDetails';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 10rem 1.5rem 5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: 8rem 1.5rem 3rem;
  }
`;

const ConfirmationBox = styled(motion.div)`
  background-color: white;
  border-radius: 10px;
  box-shadow: ${props => props.theme.shadows.medium};
  padding: 3rem 2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const SuccessIcon = styled.div`
  font-size: 5rem;
  color: ${props => props.theme.colors.success};
  margin-bottom: 1.5rem;
`;

const ThankYouTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.colors.black};
`;

const OrderNumber = styled.div`
  font-size: 1.2rem;
  background-color: ${props => props.theme.colors.lightGrey};
  border-radius: 5px;
  padding: 1rem;
  font-weight: 500;
  margin-bottom: 2rem;
  
  span {
    font-weight: 700;
    color: ${props => props.theme.colors.gold};
  }
`;

const OrderDetails = styled.div`
  text-align: left;
  margin-bottom: 2rem;
`;

const DetailTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  position: relative;
  padding-bottom: 0.75rem;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 3px;
    background-color: ${props => props.theme.colors.gold};
  }
`;

const DetailSection = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  
  &:last-child {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #eee;
    font-weight: 700;
    font-size: 1.1rem;
  }
`;

const StepContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  padding: 0 1rem;
  
  &:not(:last-child):after {
    content: '';
    position: absolute;
    top: 30px;
    right: -25%;
    width: 50%;
    height: 2px;
    background-color: #ddd;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: row;
    gap: 1rem;
    align-items: center;
    
    &:not(:last-child):after {
      display: none;
    }
  }
`;

const StepIcon = styled.div.withConfig({
  shouldForwardProp: prop => !['active'].includes(prop)
})`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${props => props.active ? props.theme.colors.gold : props.theme.colors.lightGrey};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  color: ${props => props.active ? 'white' : '#666'};
  font-size: 1.5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    margin-bottom: 0;
  }
`;

const StepText = styled.div`
  text-align: center;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    text-align: left;
  }
`;

const StepTitle = styled.h4.withConfig({
  shouldForwardProp: prop => !['active'].includes(prop)
})`
  font-size: 1rem;
  margin-bottom: 0.25rem;
  color: ${props => props.active ? props.theme.colors.black : '#666'};
`;

const StepDate = styled.p`
  font-size: 0.85rem;
  color: #666;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  color: ${props => props.theme.colors.gold};
  
  svg {
    margin-right: 0.5rem;
  }
`;

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
    // Extract order info from location state or use dummy data
  const orderInfo = location.state || {
    orderNumber: 'ORD-12345',
    total: 799,
    paymentMethod: 'bankTransfer'
  };
  
  // Format date
  const orderDate = new Date();
  const formattedDate = orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Estimated delivery date (7 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  useEffect(() => {
    // If the user came directly to this page without an order (e.g. by URL typing),
    // redirect them to the products page
    if (!location.state) {
      // Use setTimeout to allow the component to render first
      const timer = setTimeout(() => {
        navigate('/products');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate]);
  
  return (
    <PageContainer>
      {/* Success Message */}
      <ConfirmationBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SuccessIcon>
          <FaCheckCircle />
        </SuccessIcon>
        <ThankYouTitle>Thank you for your order!</ThankYouTitle>
        <p>Your order has been successfully placed and is now being processed.</p>
        <OrderNumber>
          Order Number: <span>{orderInfo.orderNumber}</span>
        </OrderNumber>        <p>A confirmation email has been sent to your email address.</p>
          {/* Payment-specific Messages */}
        {orderInfo.paymentMethod === 'bankTransfer' && (
          <div style={{ 
            margin: '1.5rem 0', 
            padding: '1rem', 
            backgroundColor: 'rgba(128, 90, 41, 0.1)', 
            borderRadius: '5px' 
          }}>
            <h3 style={{ marginBottom: '0.75rem', color: '#805A29' }}>
              {orderInfo.receiptUploaded ? 'Payment Receipt Received' : 'Bank Transfer Selected'}
            </h3>
            {orderInfo.receiptUploaded ? (
              <p>Thank you for submitting your bank transfer receipt. Our team will verify your payment, and you will receive a confirmation email once verified.</p>
            ) : (
              <div>
                <p style={{ marginBottom: '1rem' }}>Please complete your bank transfer using the bank details below:</p>
                <Button 
                  variant="primary"
                  as={Link} 
                  to={`/dashboard/orders/${orderInfo.orderNumber}`}
                  style={{ marginTop: '1rem' }}
                >
                  Upload Receipt
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Show bank details for bank transfer orders */}
        {orderInfo.paymentMethod === 'bankTransfer' && !orderInfo.receiptUploaded && (
          <BankDetails orderId={orderInfo.orderNumber} />
        )}
        
        {orderInfo.paymentMethod === 'cashOnDelivery' && (
          <div style={{ 
            margin: '1.5rem 0', 
            padding: '1rem', 
            backgroundColor: 'rgba(128, 90, 41, 0.1)', 
            borderRadius: '5px' 
          }}>
            <h3 style={{ marginBottom: '0.75rem', color: '#805A29' }}>Cash on Delivery</h3>
            <p>Your order will be delivered to your shipping address. Please ensure someone is available to receive the package and make the payment.</p>
          </div>
        )}
        
        {/* Order Status Steps */}
        <StepContainer>
          <Step>
            <StepIcon active={true}>
              <FaCheckCircle />
            </StepIcon>
            <StepText>
              <StepTitle active={true}>Order Placed</StepTitle>
              <StepDate>{formattedDate}</StepDate>
            </StepText>
          </Step>
          
          <Step>
            <StepIcon active={false}>
              <FaFileAlt />
            </StepIcon>
            <StepText>
              <StepTitle active={false}>
                {orderInfo.paymentMethod === 'bankTransfer' 
                  ? 'Payment Verification' 
                  : 'Processing'}
              </StepTitle>
              <StepDate>In progress</StepDate>
            </StepText>
          </Step>
          
          <Step>
            <StepIcon active={false}>
              <FaShippingFast />
            </StepIcon>
            <StepText>
              <StepTitle active={false}>Shipped</StepTitle>
              <StepDate>Estimated {formattedDeliveryDate}</StepDate>
            </StepText>
          </Step>
        </StepContainer>
      </ConfirmationBox>
      
      {/* Order Details */}
      <OrderDetails>
        <DetailTitle>Order Summary</DetailTitle>
        <DetailSection>
          <SummaryItem>
            <span>Subtotal</span>
            <span>MVR {orderInfo.total.toFixed(2)}</span>
          </SummaryItem>
          <SummaryItem>
            <span>Shipping</span>
            <span>Free</span>
          </SummaryItem>
          <SummaryItem>
            <span>Total</span>
            <span>MVR {orderInfo.total.toFixed(2)}</span>
          </SummaryItem>
        </DetailSection>
      </OrderDetails>
      
      {/* Action Buttons */}
      <ActionButtons>
        <BackLink to="/">
          <FaArrowLeft /> Back to Home
        </BackLink>
        <Button variant="primary" as={Link} to="/dashboard/orders">
          View Your Orders
        </Button>
      </ActionButtons>
    </PageContainer>
  );
};

export default OrderConfirmation;
