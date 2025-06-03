import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaCreditCard, FaUniversity, FaMoneyBillWave } from 'react-icons/fa';

import Button from '../components/ui/Button';
import BankDetailsComponent from '../components/ui/BankDetails';
import useAuth from '../hooks/useAuth';

const PaymentMethodsContainer = styled.div`
  max-width: 800px;
`;

const PageTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const PaymentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const PaymentGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const PaymentCard = styled(motion.div)`
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #eee;
  position: relative;
  
  ${props => props.$isDefault && `
    border-color: ${props.theme.colors.gold};
    background-color: #fffbf0;
  `}
`;

const PaymentType = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.gold};
  
  svg {
    font-size: 1.1rem;
  }
`;

const DefaultBadge = styled.span`
  background-color: ${props => props.theme.colors.gold};
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: auto;
`;

const PaymentDetails = styled.div`
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #333;
`;

const PaymentName = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const PaymentInfo = styled.div`
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
`;

const PaymentActions = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
  
  svg {
    font-size: 4rem;
    color: #ddd;
    margin-bottom: 1rem;
  }
  
  h3 {
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  p {
    margin-bottom: 1.5rem;
  }
`;

const InfoBox = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  
  h4 {
    margin-bottom: 1rem;
    color: ${props => props.theme.colors.gold};
  }
  
  p {
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }
  
  strong {
    color: #333;
  }
`;

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Simulate loading payment methods
    const fetchPaymentMethods = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock payment methods data
        const mockPaymentMethods = [
          {
            id: '1',
            type: 'bankTransfer',
            name: 'Bank Transfer',
            details: 'Primary payment method for orders',
            isDefault: true
          },
          {
            id: '2',
            type: 'cashOnDelivery',
            name: 'Cash on Delivery',
            details: 'Pay when your order arrives',
            isDefault: false
          }
        ];
        
        setPaymentMethods(mockPaymentMethods);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching payment methods:', err);
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const getPaymentTypeIcon = (type) => {
    switch (type) {
      case 'bankTransfer':
        return <FaUniversity />;
      case 'cashOnDelivery':
        return <FaMoneyBillWave />;
      case 'creditCard':
        return <FaCreditCard />;
      default:
        return <FaCreditCard />;
    }
  };

  const getPaymentTypeName = (type) => {
    switch (type) {
      case 'bankTransfer':
        return 'Bank Transfer';
      case 'cashOnDelivery':
        return 'Cash on Delivery';
      case 'creditCard':
        return 'Credit Card';
      default:
        return 'Payment Method';
    }
  };

  if (loading) {
    return (
      <PaymentMethodsContainer>
        <PageTitle>Payment Methods</PageTitle>
        <p>Loading your payment methods...</p>
      </PaymentMethodsContainer>
    );
  }

  return (
    <PaymentMethodsContainer>
      <PaymentHeader>
        <PageTitle>Payment Methods</PageTitle>
      </PaymentHeader>

      <InfoBox>
        <h4>Available Payment Options</h4>
        <p><strong>Bank Transfer:</strong> Transfer money directly to our bank account and upload the receipt for verification.</p>
        <p><strong>Cash on Delivery:</strong> Pay with cash when your order is delivered to your address.</p>
        
        <BankDetailsComponent />
      </InfoBox>
      
      {paymentMethods.length === 0 ? (
        <EmptyState>
          <FaCreditCard />
          <h3>No payment methods configured</h3>
          <p>Payment methods will be available during checkout.</p>
        </EmptyState>
      ) : (
        <PaymentGrid>
          <AnimatePresence>
            {paymentMethods.map((method, index) => (
              <PaymentCard
                key={method.id}
                $isDefault={method.isDefault}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <PaymentType>
                  {getPaymentTypeIcon(method.type)}
                  {getPaymentTypeName(method.type)}
                  {method.isDefault && <DefaultBadge>Default</DefaultBadge>}
                </PaymentType>
                
                <PaymentDetails>
                  <PaymentName>{method.name}</PaymentName>
                  <PaymentInfo>{method.details}</PaymentInfo>
                  
                  {method.type === 'bankTransfer' && (
                    <PaymentInfo style={{ marginTop: '0.5rem', color: '#666' }}>
                      Upload receipt after bank transfer for order verification
                    </PaymentInfo>
                  )}
                  
                  {method.type === 'cashOnDelivery' && (
                    <PaymentInfo style={{ marginTop: '0.5rem', color: '#666' }}>
                      Available for delivery within Malé area
                    </PaymentInfo>
                  )}
                </PaymentDetails>
                
                <PaymentActions>
                  <Button
                    variant="outline"
                    small
                    disabled
                  >
                    Active
                  </Button>
                </PaymentActions>
              </PaymentCard>
            ))}
          </AnimatePresence>
        </PaymentGrid>
      )}
    </PaymentMethodsContainer>
  );
};

export default PaymentMethods; 