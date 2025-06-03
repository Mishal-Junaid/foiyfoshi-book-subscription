import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaBox, 
  FaShippingFast, 
  FaCheck,
  FaDownload,
  FaExclamationCircle,
  FaMapMarkerAlt,
  FaUpload,
  FaEye,
  FaReceipt,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';

import Button from '../components/ui/Button';
import ReceiptUploadModal from '../components/checkout/ReceiptUploadModal';
import { getOrder } from '../services/orderService';
import { getImageUrl } from '../utils/imageUtils';
import Spinner from '../components/ui/Spinner';

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const Header = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: ${props => props.theme.colors.gold};
  text-decoration: none;
  margin-bottom: 1rem;
  font-weight: 500;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const OrderTitle = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.primary};
  font-size: 2rem;
  font-weight: 600;
`;

const OrderMeta = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  color: #666;
  
  strong {
    color: ${props => props.theme.colors.primary};
  }
`;

const StatusSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const SectionTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  color: ${props => props.theme.colors.primary};
  font-size: 1.5rem;
  font-weight: 600;
`;

const StatusTracker = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 30px;
    left: 30px;
    right: 30px;
    height: 3px;
    background: #e0e0e0;
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    
    &::before {
      display: none;
    }
  }
`;

const StatusStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
`;

const StepIcon = styled.div.withConfig({
  shouldForwardProp: prop => !['active', 'completed'].includes(prop)
})`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => 
    props.completed ? props.theme.colors.success :
    props.active ? props.theme.colors.gold : '#e0e0e0'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;

const StepLabel = styled.div`
  text-align: center;
  font-weight: 500;
  color: ${props => props.theme.colors.primary};
  font-size: 0.9rem;
`;

const StepDate = styled.div`
  text-align: center;
  color: #666;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const PaymentSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const PaymentStatus = styled.div.withConfig({
  shouldForwardProp: prop => !['status'].includes(prop)
})`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  margin-bottom: 1rem;
  
  background: ${props => {
    switch(props.status) {
      case 'verified': case 'paid': return '#e8f5e9';
      case 'pending_verification': return '#fff8e1';
      case 'rejected': return '#ffebee';
      default: return '#f5f5f5';
    }
  }};
  
  color: ${props => {
    switch(props.status) {
      case 'verified': case 'paid': return '#2e7d32';
      case 'pending_verification': return '#ef6c00';
      case 'rejected': return '#c62828';
      default: return '#666';
    }
  }};
  
  svg {
    margin-right: 0.5rem;
  }
`;

const ReceiptSection = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
`;

const ItemsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const OrderItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  background: #f5f5f5;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.h4`
  margin: 0 0 0.5rem 0;
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
`;

const ItemPrice = styled.div`
  color: #666;
  margin-bottom: 0.25rem;
`;

const ItemQuantity = styled.div`
  color: #999;
  font-size: 0.9rem;
`;

const ItemTotal = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.gold};
  font-size: 1.1rem;
`;

const AddressSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const Address = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
`;

const SummarySection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  
  &.total {
    font-size: 1.2rem;
    font-weight: 600;
    color: ${props => props.theme.colors.gold};
    padding-top: 1rem;
    border-top: 2px solid #eee;
    margin-top: 1rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const ErrorWrapper = styled.div`
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  margin: 2rem 0;
`;

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getOrder(orderId);
        
        if (response.success && response.data) {
          setOrder(response.data);
        } else {
          setError('Order not found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, uploadSuccess]);
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const getOrderSteps = () => {
    const baseSteps = [
      { key: 'pending', label: 'Order Placed', icon: <FaBox /> },
      { key: 'processing', label: 'Processing', icon: <FaSpinner /> },
      { key: 'shipped', label: 'Shipped', icon: <FaShippingFast /> },
      { key: 'delivered', label: 'Delivered', icon: <FaCheck /> }
    ];
    
    const currentStepIndex = baseSteps.findIndex(step => step.key === order?.status);
    
    return baseSteps.map((step, index) => ({
      ...step,
      completed: index < currentStepIndex,
      active: index === currentStepIndex,
      date: index === currentStepIndex ? order?.updatedAt : 
            (index === 0 ? order?.createdAt : null)
    }));
  };
  
  const getPaymentStatusInfo = () => {
    const status = order?.paymentStatus || (order?.isPaid ? 'verified' : 'pending');
    
    switch(status) {
      case 'verified':
      case 'paid':
        return { 
          icon: <FaCheckCircle />, 
          text: 'Payment Verified', 
          status: 'verified' 
        };
      case 'pending_verification':
        return { 
          icon: <FaClock />, 
          text: 'Awaiting Verification', 
          status: 'pending_verification' 
        };
      case 'rejected':
        return { 
          icon: <FaExclamationTriangle />, 
          text: 'Payment Rejected', 
          status: 'rejected' 
        };
      default:
        return { 
          icon: <FaTimes />, 
          text: 'Payment Pending', 
          status: 'pending' 
        };
    }
  };
  
  const getReceiptUrl = (filename) => {
    if (!filename) return null;
    if (filename.startsWith('http')) return filename;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/receipts/${filename}`;
  };
  
  const handleUploadSuccess = async () => {
    setIsUploadModalOpen(false);
    setUploadSuccess(prev => !prev); // Trigger re-fetch
  };
  
  const handleViewReceipt = (receiptUrl) => {
    window.open(receiptUrl, '_blank');
  };
  
  const handleDownloadReceipt = () => {
    if (order?.paymentReceipt) {
      const receiptUrl = getReceiptUrl(order.paymentReceipt);
      const link = document.createElement('a');
      link.href = receiptUrl;
      link.download = `receipt-order-${order._id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingWrapper>
          <Spinner size="large" />
        </LoadingWrapper>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container>
        <ErrorWrapper>
          <FaExclamationCircle size={48} color="#e53e3e" />
          <h2>Order Not Found</h2>
          <p>{error || 'The order you are looking for does not exist.'}</p>
          <Button as={Link} to="/dashboard" variant="primary">
            Back to Dashboard
          </Button>
        </ErrorWrapper>
      </Container>
    );
  }

  const paymentInfo = getPaymentStatusInfo();
  const orderSteps = getOrderSteps();

  return (
    <Container>
      {/* Header */}
      <Header>
        <BackLink to="/dashboard">
          <FaArrowLeft /> Back to Orders
        </BackLink>
        <OrderTitle>Order #{order.orderNumber || order._id?.slice(-6)?.toUpperCase()}</OrderTitle>
        <OrderMeta>
          <MetaItem>
            <strong>Date:</strong> {formatDate(order.createdAt)}
          </MetaItem>
          <MetaItem>
            <strong>Status:</strong> {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
          </MetaItem>
          <MetaItem>
            <strong>Total:</strong> MVR {order.totalPrice?.toFixed(2)}
          </MetaItem>
          {order.trackingNumber && (
            <MetaItem>
              <strong>Tracking:</strong> {order.trackingNumber}
            </MetaItem>
          )}
        </OrderMeta>
      </Header>

      {/* Order Status Tracker */}
      <StatusSection>
        <SectionTitle>Order Status</SectionTitle>
        <StatusTracker>
          {orderSteps.map(step => (
            <StatusStep key={step.key}>
              <StepIcon active={step.active} completed={step.completed}>
                {step.icon}
              </StepIcon>
              <StepLabel>{step.label}</StepLabel>
              {step.date && <StepDate>{formatDate(step.date)}</StepDate>}
            </StatusStep>
          ))}
        </StatusTracker>
      </StatusSection>

      {/* Payment Information */}
      <PaymentSection>
        <SectionTitle>Payment Information</SectionTitle>
        <div>
          <strong>Payment Method:</strong> {order.paymentMethod === 'bankTransfer' ? 'Bank Transfer' : 'Cash on Delivery'}
        </div>
        
        {order.paymentMethod === 'bankTransfer' && (
          <>
            <PaymentStatus status={paymentInfo.status}>
              {paymentInfo.icon}
              {paymentInfo.text}
            </PaymentStatus>
            
            {order.paidAt && (
              <div style={{ color: '#666', marginBottom: '1rem' }}>
                <strong>Paid On:</strong> {formatDate(order.paidAt)}
              </div>
            )}

            {/* Receipt Section */}
            <ReceiptSection>
              <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>
                <FaReceipt style={{ marginRight: '0.5rem' }} />
                Payment Receipt
              </h4>
              
              {order.paymentReceipt ? (
                <div>
                  <p style={{ color: '#666', marginBottom: '1rem' }}>
                    Receipt uploaded on {formatDate(order.receiptUploadedAt || order.updatedAt)}
                  </p>
                  <ActionButtons>
                    <Button 
                      variant="outline" 
                      icon={<FaEye />}
                      onClick={() => handleViewReceipt(getReceiptUrl(order.paymentReceipt))}
                    >
                      View Receipt
                    </Button>
                    <Button 
                      variant="outline" 
                      icon={<FaDownload />}
                      onClick={handleDownloadReceipt}
                    >
                      Download Receipt
                    </Button>
                    {paymentInfo.status === 'rejected' && (
                      <Button 
                        variant="primary" 
                        icon={<FaUpload />}
                        onClick={() => setIsUploadModalOpen(true)}
                      >
                        Upload New Receipt
                      </Button>
                    )}
                  </ActionButtons>
                </div>
              ) : (
                <div>
                  <p style={{ color: '#666', marginBottom: '1rem' }}>
                    No receipt uploaded yet. Please upload your payment receipt for verification.
                  </p>
                  <Button 
                    variant="primary" 
                    icon={<FaUpload />}
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    Upload Receipt
                  </Button>
                </div>
              )}
            </ReceiptSection>
          </>
        )}
      </PaymentSection>

      {/* Order Items */}
      <ItemsSection>
        <SectionTitle>Order Items</SectionTitle>
        {order.products?.map(item => (
          <OrderItem key={item._id || item.product?._id}>
            <ItemImage 
              src={getImageUrl(item.product?.images?.[0]) || '/images/placeholder.jpg'} 
              alt={item.product?.name || 'Product'} 
            />
            <ItemDetails>
              <ItemName>{item.product?.name || 'Product name unavailable'}</ItemName>
              <ItemPrice>MVR {item.price?.toFixed(2)} each</ItemPrice>
              <ItemQuantity>Quantity: {item.quantity}</ItemQuantity>
            </ItemDetails>
            <ItemTotal>MVR {(item.price * item.quantity).toFixed(2)}</ItemTotal>
          </OrderItem>
        ))}
      </ItemsSection>

      {/* Shipping Address */}
      <AddressSection>
        <SectionTitle>
          <FaMapMarkerAlt style={{ marginRight: '0.5rem' }} />
          Shipping Address
        </SectionTitle>
        <Address>
          <div><strong>{order.shippingAddress?.fullName || 'N/A'}</strong></div>
          <div>{order.shippingAddress?.street || 'N/A'}</div>
          {order.shippingAddress?.apartment && <div>{order.shippingAddress.apartment}</div>}
          <div>{order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.postalCode || 'N/A'}</div>
          <div>{order.shippingAddress?.country || 'Maldives'}</div>
          {order.shippingAddress?.phone && <div>Phone: {order.shippingAddress.phone}</div>}
        </Address>
      </AddressSection>

      {/* Order Summary */}
      <SummarySection>
        <SectionTitle>Order Summary</SectionTitle>
        <SummaryRow>
          <span>Subtotal:</span>
          <span>MVR {order.totalPrice?.toFixed(2)}</span>
        </SummaryRow>
        <SummaryRow>
          <span>Shipping:</span>
          <span>Free</span>
        </SummaryRow>
        <SummaryRow className="total">
          <span>Total:</span>
          <span>MVR {order.totalPrice?.toFixed(2)}</span>
        </SummaryRow>
      </SummarySection>

      {/* Receipt Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <ReceiptUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onSuccess={handleUploadSuccess}
            orderId={order._id}
          />
        )}
      </AnimatePresence>
    </Container>
  );
};

export default OrderDetails;
