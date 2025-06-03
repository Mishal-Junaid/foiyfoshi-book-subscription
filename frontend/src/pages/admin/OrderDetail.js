import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaEdit, FaCheck, FaTimes, FaDownload, FaShippingFast, FaMoneyBillWave } from 'react-icons/fa';
import { getOrder, updateOrderStatus, updatePaymentStatus, updateTrackingNumber } from '../../services/orderService';
import { useNotification } from '../../components/ui/Notification';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import api from '../../services/api';
import { getReceiptUrl } from '../../services/paymentService';
import AdminLayout from '../../components/layout/AdminLayout';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.8rem;
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  color: ${props => props.theme.colors.gold};
  text-decoration: none;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    text-decoration: underline;
  }
`;

const OrderInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const InfoCard = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const InfoTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: ${props => props.theme.colors.primary};
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
`;

const InfoItem = styled.div`
  margin-bottom: 0.5rem;
  
  strong {
    display: inline-block;
    min-width: 140px;
    color: #555;
  }
`;

const AddressBlock = styled.div`
  margin: 1rem 0;
  line-height: 1.6;
`;

const OrderItems = styled.div`
  margin-top: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const ItemsHeader = styled.div`
  background-color: #f5f5f5;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
`;

const ItemsTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
`;

const ItemsList = styled.div`
  padding: 0 1.5rem;
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 80px 3fr 1fr 1fr 1fr;
  gap: 1rem;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 80px 2fr 1fr;
    gap: 0.5rem;
    
    &:not(:first-child) {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }
  }
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
`;

const ItemDetails = styled.div`
  h4 {
    margin: 0 0 0.5rem 0;
  }
  
  p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
  }
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
`;

const ItemQuantity = styled.div`
  color: #666;
`;

const ItemTotal = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.gold};
`;

const OrderSummary = styled.div`
  margin-top: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const SummaryTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: ${props => props.theme.colors.primary};
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  &.total {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #ddd;
    font-weight: 600;
    font-size: 1.1rem;
    color: ${props => props.theme.colors.gold};
  }
`;

const AdminActions = styled.div`
  margin-top: 2rem;
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ActionsTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: ${props => props.theme.colors.primary};
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  background-color: ${props => 
    props.status === 'delivered' ? props.theme.colors.success : 
    props.status === 'processing' ? props.theme.colors.warning :
    props.status === 'cancelled' ? props.theme.colors.danger :
    props.status === 'shipped' ? '#3498db' :
    props.theme.colors.primary};
  color: white;
`;

const PaymentBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  background-color: ${props => 
    props.isPaid ? props.theme.colors.success : 
    props.theme.colors.danger};
  color: white;
`;

const InputGroup = styled.div`
  margin-bottom: 1rem;
  width: 100%;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  select, input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.gold};
    }
  }
`;

const ReceiptSection = styled.div`
  margin-top: 1.5rem;
`;

const ReceiptImage = styled.img`
  max-width: 100%;
  border-radius: 8px;
  margin-top: 1rem;
  border: 1px solid #eee;
`;

const NoReceiptMessage = styled.div`
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #666;
  margin-top: 1rem;
`;

const OrderDetail = () => {
  const { id } = useParams();
  const { addNotification } = useNotification();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await getOrder(id);
        setOrder(response.data);
        setOrderStatus(response.data.status);
        setPaymentStatus(response.data.isPaid);
        setTrackingNumber(response.data.trackingNumber || '');
      } catch (error) {
        console.error("Error fetching order details:", error);
        addNotification({
          type: 'error',
          message: 'Failed to fetch order details'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, addNotification]);

  // Separate useEffect to fetch receipt after order is loaded
  useEffect(() => {
    if (order && order.paymentMethod === 'bankTransfer') {
      fetchReceiptUrl(id);
    }
  }, [order, id]);

  const fetchReceiptUrl = async (orderId) => {
    setLoadingReceipt(true);
    try {
      // If order has paymentReceipt filename, construct the URL
      if (order && order.paymentReceipt) {
        const receiptUrl = getReceiptUrl(order.paymentReceipt);
        setReceiptUrl(receiptUrl);
      } else if (order && order.paymentResult && order.paymentResult.receiptUrl) {
        // Handle legacy receiptUrl format
        const receiptUrl = order.paymentResult.receiptUrl.startsWith('/') 
          ? `${process.env.REACT_APP_API_URL}${order.paymentResult.receiptUrl}`
          : order.paymentResult.receiptUrl;
        setReceiptUrl(receiptUrl);
      }
    } catch (error) {
      console.error("Error fetching receipt:", error);
      // Not showing notification for this as it's not critical
    } finally {
      setLoadingReceipt(false);
    }
  };
  const handleUpdateOrderStatus = async () => {
    try {
      await updateOrderStatus(id, orderStatus);
      addNotification({
        type: 'success',
        message: `Order status updated to ${orderStatus}`
      });
      // Refresh order data
      const response = await getOrder(id);
      setOrder(response.data);
    } catch (error) {
      console.error("Error updating order status:", error);
      addNotification({
        type: 'error',
        message: 'Failed to update order status'
      });
    }
  };

  const handleUpdatePaymentStatus = async () => {
    try {
      await updatePaymentStatus(id, paymentStatus);
      addNotification({
        type: 'success',
        message: paymentStatus ? 'Order marked as paid' : 'Order marked as unpaid'
      });
      // Refresh order data
      const response = await getOrder(id);
      setOrder(response.data);
    } catch (error) {
      console.error("Error updating payment status:", error);
      addNotification({
        type: 'error',
        message: 'Failed to update payment status'
      });
    }
  };

  const handleUpdateTrackingNumber = async () => {
    if (!trackingNumber.trim()) {
      addNotification({
        type: 'warning',
        message: 'Please enter a tracking number'
      });
      return;
    }
    
    try {
      await updateTrackingNumber(id, trackingNumber);
      addNotification({
        type: 'success',
        message: 'Tracking number updated successfully'
      });
      // Refresh order data
      const response = await getOrder(id);
      setOrder(response.data);
    } catch (error) {
      console.error("Error updating tracking number:", error);
      addNotification({
        type: 'error',
        message: 'Failed to update tracking number'
      });
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const res = await api.get(`/orders/${id}/invoice`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      addNotification({
        type: 'success',
        message: 'Invoice downloaded successfully'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Failed to download invoice'
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <Spinner />;
  }

  if (!order) {
    return (
      <Container>
        <h2>Order not found</h2>
        <BackLink to="/admin/orders">
          <FaArrowLeft /> Back to Orders
        </BackLink>
      </Container>
    );
  }

  return (
    <AdminLayout>
      <Container>
        <Header>
          <div>
            <BackLink to="/admin/orders">
              <FaArrowLeft /> Back to Orders
            </BackLink>
            <Title>Order #{order._id}</Title>
          </div>
          
          <Button 
            variant="secondary"
            icon={<FaDownload />}
            onClick={handleDownloadInvoice}
          >
            Download Invoice
          </Button>
        </Header>
        
        <OrderInfo>
          <InfoCard>
            <InfoTitle>Order Information</InfoTitle>
            <InfoItem>
              <strong>Order ID:</strong> {order._id}
            </InfoItem>
            <InfoItem>
              <strong>Order Date:</strong> {formatDate(order.createdAt)}
            </InfoItem>
            <InfoItem>
              <strong>Status:</strong> <StatusBadge status={order.status}>{order.status}</StatusBadge>
            </InfoItem>
            <InfoItem>
              <strong>Payment:</strong> <PaymentBadge isPaid={order.isPaid}>{order.isPaid ? 'Paid' : 'Unpaid'}</PaymentBadge>
            </InfoItem>
            <InfoItem>
              <strong>Payment Method:</strong> {order.paymentMethod === 'bankTransfer' ? 'Bank Transfer' : 'Cash on Delivery'}
            </InfoItem>
            {order.trackingNumber && (
              <InfoItem>
                <strong>Tracking Number:</strong> {order.trackingNumber}
              </InfoItem>
            )}
            {order.paidAt && (
              <InfoItem>
                <strong>Paid On:</strong> {formatDate(order.paidAt)}
              </InfoItem>
            )}
            {order.deliveredAt && (
              <InfoItem>
                <strong>Delivered On:</strong> {formatDate(order.deliveredAt)}
              </InfoItem>
            )}
          </InfoCard>
          
          <InfoCard>
            <InfoTitle>Customer Information</InfoTitle>
            <InfoItem>
              <strong>Name:</strong> {order.user?.name || 'N/A'}
            </InfoItem>
            <InfoItem>
              <strong>Email:</strong> {order.user?.email || 'N/A'}
            </InfoItem>
            <InfoItem>
              <strong>Phone:</strong> {order.user?.phone || 'N/A'}
            </InfoItem>
          </InfoCard>
          
          <InfoCard>
            <InfoTitle>Shipping Address</InfoTitle>
            {order.shippingAddress ? (
              <AddressBlock>
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.country}</p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </AddressBlock>
            ) : (
              <p>No shipping address provided</p>
            )}
          </InfoCard>
        </OrderInfo>
        
        <OrderItems>
          <ItemsHeader>
            <ItemsTitle>Order Items</ItemsTitle>
          </ItemsHeader>
          
          <ItemsList>
            <ItemRow style={{ fontWeight: 'bold' }}>
              <div>Image</div>
              <div>Product</div>
              <div>Price</div>
              <div>Quantity</div>
              <div>Total</div>
            </ItemRow>
            
            {order.products.map((item) => (
              <ItemRow key={item._id}>
                <ItemImage 
                  src={item.product?.images?.[0] || '/images/placeholder.jpg'} 
                  alt={item.product?.name || 'Product image'} 
                />
                
                <ItemDetails>
                  <h4>{item.product?.name || 'Product name unavailable'}</h4>
                  <p>{item.product?.category || 'Category unavailable'}</p>
                </ItemDetails>
                
                <ItemPrice>MVR {item.price?.toFixed(2) || '0.00'}</ItemPrice>
                
                <ItemQuantity>{item.quantity}</ItemQuantity>
                
                <ItemTotal>MVR {(item.price * item.quantity).toFixed(2)}</ItemTotal>
              </ItemRow>
            ))}
          </ItemsList>
        </OrderItems>
        
        <OrderSummary>
          <SummaryTitle>Order Summary</SummaryTitle>
          <SummaryRow>
            <span>Subtotal:</span>
            <span>MVR {order.totalPrice?.toFixed(2) || '0.00'}</span>
          </SummaryRow>
          <SummaryRow>
            <span>Shipping:</span>
            <span>MVR 0.00</span>
          </SummaryRow>
          <SummaryRow className="total">
            <span>Total:</span>
            <span>MVR {order.totalPrice?.toFixed(2) || '0.00'}</span>
          </SummaryRow>
        </OrderSummary>
        
        {order.paymentMethod === 'bankTransfer' && (
          <InfoCard style={{ marginTop: '2rem' }}>
            <InfoTitle>Payment Receipt</InfoTitle>
            <ReceiptSection>
              {loadingReceipt ? (
                <p>Loading receipt...</p>
              ) : receiptUrl ? (
                <ReceiptImage 
                  src={receiptUrl} 
                  alt="Payment Receipt"
                  onError={(e) => {
                    console.error('Failed to load receipt image:', receiptUrl);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : (
                <NoReceiptMessage>No receipt uploaded for this order</NoReceiptMessage>
              )}
              {receiptUrl && (
                <NoReceiptMessage style={{ display: 'none' }}>
                  Failed to load receipt image
                </NoReceiptMessage>
              )}
            </ReceiptSection>
          </InfoCard>
        )}
        
        <AdminActions>
          <ActionsTitle>Admin Actions</ActionsTitle>
          
          <ActionRow>
            <InputGroup>
              <label htmlFor="orderStatus">Order Status</label>
              <select 
                id="orderStatus" 
                value={orderStatus} 
                onChange={(e) => setOrderStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </InputGroup>
            
            <Button 
              onClick={handleUpdateOrderStatus}
              icon={<FaCheck />}
            >
              Update Status
            </Button>
          </ActionRow>
          
          <ActionRow>
            <InputGroup>
              <label htmlFor="paymentStatus">Payment Status</label>
              <select 
                id="paymentStatus" 
                value={paymentStatus ? 'paid' : 'unpaid'} 
                onChange={(e) => setPaymentStatus(e.target.value === 'paid')}
              >
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </InputGroup>
            
            <Button 
              onClick={handleUpdatePaymentStatus}
              icon={<FaMoneyBillWave />}
              variant="success"
            >
              Update Payment
            </Button>
          </ActionRow>
          
          <ActionRow>
            <InputGroup>
              <label htmlFor="trackingNumber">Tracking Number</label>
              <input 
                id="trackingNumber" 
                type="text" 
                value={trackingNumber} 
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
              />
            </InputGroup>
            
            <Button 
              onClick={handleUpdateTrackingNumber}
              icon={<FaShippingFast />}
              variant="info"
            >
              Update Tracking
            </Button>
          </ActionRow>
        </AdminActions>
      </Container>
    </AdminLayout>
  );
};

export default OrderDetail;
