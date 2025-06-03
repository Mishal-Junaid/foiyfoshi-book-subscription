import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaExclamationCircle, 
  FaSearch, 
  FaBox, 
  FaShippingFast, 
  FaCheck, 
  FaUpload, 
  FaMoneyBillWave,
  FaExclamationTriangle
} from 'react-icons/fa';

import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import ReceiptUploadModal from '../components/checkout/ReceiptUploadModal';
import { getMyOrders } from '../services/orderService';

// Mock data for orders (replace with API call)
const mockOrders = [
  {
    id: 'ORD-12345',
    date: '2023-06-15',
    total: 399,
    status: 'delivered',
    items: 2,
    trackingNumber: 'TRK789012345',
    paymentMethod: 'cashOnDelivery',
    paymentStatus: 'paid'
  },
  {
    id: 'ORD-12344',
    date: '2023-05-20',
    total: 599,
    status: 'delivered',
    items: 3,
    trackingNumber: 'TRK789012344',
    paymentMethod: 'cashOnDelivery',
    paymentStatus: 'paid'
  },
  {
    id: 'ORD-12343',
    date: '2023-04-05',
    total: 199,
    status: 'delivered',
    items: 1,
    trackingNumber: 'TRK789012343',
    paymentMethod: 'bankTransfer',
    paymentStatus: 'paid'
  },
  {
    id: 'ORD-12346',
    date: '2023-07-10',
    total: 499,
    status: 'processing',
    items: 2,
    trackingNumber: null,
    paymentMethod: 'bankTransfer',
    paymentStatus: 'pending',
    hasReceipt: false
  },
  {
    id: 'ORD-12347',
    date: '2023-07-15',
    total: 799,
    status: 'processing',
    items: 3,
    trackingNumber: null,
    paymentMethod: 'bankTransfer',
    paymentStatus: 'verifying',
    hasReceipt: true
  }
];

const OrdersContainer = styled.div`
  max-width: 800px;
`;

const PageTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const SearchContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  position: relative;
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #aaa;
  }
`;

const SearchInput = styled.input`
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  transition: ${props => props.theme.transitions.short};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.gold};
    box-shadow: 0 0 0 2px rgba(164, 112, 49, 0.2);
  }
`;

const OrdersGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 0;
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  color: ${props => props.theme.colors.gold};
  margin-bottom: 1.5rem;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const EmptyStateText = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  max-width: 400px;
  margin: 0 auto 1.5rem;
`;

const PaymentStatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 0.5rem;
  
  background-color: ${props => {
    switch (props.status) {
      case 'paid':
        return '#e8f5e9';
      case 'verifying':
        return '#fff8e1';
      case 'pending':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  }};
  
  color: ${props => {
    switch (props.status) {
      case 'paid':
        return '#388e3c';
      case 'verifying':
        return '#f57c00';
      case 'pending':
        return '#d32f2f';
      default:
        return '#616161';
    }
  }};
`;

const OrderCard = styled(motion.div)`
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #eee;
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 1rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const OrderInfo = styled.div``;

const OrderID = styled.h4`
  font-size: 1.1rem;
  margin-bottom: 0.2rem;
`;

const OrderDate = styled.p`
  color: #666;
  font-size: 0.9rem;
`;

const OrderStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  background-color: ${props => {
    switch (props.status) {
      case 'processing':
        return '#fff8e1';
      case 'shipped':
        return '#e3f2fd';
      case 'delivered':
        return '#e8f5e9';
      case 'cancelled':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  }};
  
  color: ${props => {
    switch (props.status) {
      case 'processing':
        return '#f57c00';
      case 'shipped':
        return '#1976d2';
      case 'delivered':
        return '#388e3c';
      case 'cancelled':
        return '#d32f2f';
      default:
        return '#616161';
    }
  }};
  
  svg {
    font-size: 0.9rem;
  }
`;

const OrderDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const OrderMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const OrderMetaItem = styled.div`
  font-size: 0.9rem;
  
  span {
    font-weight: 600;
  }
`;

const OrderActions = styled.div`
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    button, a {
      width: 100%;
    }
  }
`;

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'processing':
      return <FaBox />;
    case 'shipped':
      return <FaShippingFast />;
    case 'delivered':
      return <FaCheck />;
    default:
      return null;
  }
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getMyOrders();
        const ordersData = response.data || [];
        
        // Transform API data to match component expectations
        const transformedOrders = ordersData.map(order => ({
          id: order._id,
          date: order.createdAt,
          total: order.totalPrice,
          status: order.status,
          items: order.products.length,
          trackingNumber: order.trackingNumber || null,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.isPaid ? 'paid' : 'pending',
          hasReceipt: order.receiptUrl ? true : false,
          orderNumber: order.orderNumber || order._id.slice(-6).toUpperCase()
        }));
        
        setOrders(transformedOrders);
        setFilteredOrders(transformedOrders);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again later.');
        setLoading(false);
      }
    };
    fetchOrders();
  }, [uploadSuccess]);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);
    const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle open receipt upload modal
  const handleOpenUploadModal = (orderId) => {
    setSelectedOrderId(orderId);
    setIsUploadModalOpen(true);
  };
  
  // Handle receipt upload success
  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false);
    
    // Simulate updating the order in the local state
    const updatedOrders = orders.map(order => {
      if (order.id === selectedOrderId) {
        return {
          ...order,
          hasReceipt: true,
          paymentStatus: 'verifying'
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    setFilteredOrders(updatedOrders.filter(order => 
      searchTerm.trim() === '' || order.id.toLowerCase().includes(searchTerm.toLowerCase())
    ));
    
    setUploadSuccess(!uploadSuccess); // Toggle to trigger useEffect
  };
  
  // Get payment status display text and color
  const getPaymentStatusDisplay = (status) => {
    switch(status) {
      case 'paid':
        return { 
          text: 'Payment Confirmed',
          icon: <FaCheck />,
          color: '#388e3c' 
        };
      case 'verifying':
        return { 
          text: 'Verifying Payment',
          icon: <FaExclamationTriangle />,
          color: '#f57c00' 
        };
      case 'pending':
        return { 
          text: 'Payment Required',
          icon: <FaExclamationCircle />,
          color: '#d32f2f' 
        };
      default:
        return { 
          text: 'Unknown', 
          icon: <FaExclamationCircle />,
          color: '#616161' 
        };
    }
  };

  return (
    <OrdersContainer>
      <PageTitle>My Orders</PageTitle>
      
      <SearchContainer>
        <FaSearch />
        <SearchInput 
          type="text"
          placeholder="Search by order number..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </SearchContainer>
      
      {loading ? (
        <p>Loading your orders...</p>
      ) : error ? (
        <div>
          <FaExclamationCircle /> {error}
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>
            <FaBox />
          </EmptyStateIcon>
          <EmptyStateTitle>No orders found</EmptyStateTitle>
          <EmptyStateText>
            You haven't placed any orders yet or no orders match your search.
          </EmptyStateText>
          <Button as={Link} to="/products" variant="primary">
            Start Shopping
          </Button>
        </EmptyState>
      ) : (
        <OrdersGrid>
          {filteredOrders.map((order, index) => (
            <OrderCard
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <OrderHeader>
                <OrderInfo>
                  <OrderID>Order #{order.orderNumber}</OrderID>
                  <OrderDate>{formatDate(order.date)}</OrderDate>
                </OrderInfo>
                
                <OrderStatus status={order.status}>
                  <StatusIcon status={order.status} />
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </OrderStatus>
              </OrderHeader>
              
              <OrderDetails>                <OrderMeta>
                  <OrderMetaItem>
                    Total: <span>MVR {order.total.toFixed(2)}</span>
                  </OrderMetaItem>
                  <OrderMetaItem>
                    Items: <span>{order.items}</span>
                  </OrderMetaItem>
                  {order.trackingNumber && (
                    <OrderMetaItem>
                      Tracking #: <span>{order.trackingNumber}</span>
                    </OrderMetaItem>
                  )}
                  
                  {/* Display payment method and status */}
                  <OrderMetaItem>
                    Payment: <span>
                      {order.paymentMethod === 'bankTransfer' 
                        ? 'Bank Transfer' 
                        : 'Cash on Delivery'}
                    </span>
                  </OrderMetaItem>
                  
                  {/* Payment Status Badge */}
                  {order.paymentMethod === 'bankTransfer' && (
                    <PaymentStatusBadge status={order.paymentStatus}>
                      {getPaymentStatusDisplay(order.paymentStatus).icon}
                      {getPaymentStatusDisplay(order.paymentStatus).text}
                    </PaymentStatusBadge>
                  )}
                </OrderMeta>
                
                <OrderActions>
                  {/* Receipt Upload Button */}
                  {order.paymentMethod === 'bankTransfer' && 
                   order.paymentStatus === 'pending' && (
                    <Button
                      variant="primary"
                      small
                      onClick={() => handleOpenUploadModal(order.id)}
                      style={{ marginBottom: '0.5rem' }}
                    >
                      <FaUpload style={{ marginRight: '0.5rem' }} />
                      Upload Receipt
                    </Button>
                  )}
                  
                  {/* Receipt Re-Upload Button */}
                  {order.paymentMethod === 'bankTransfer' && 
                   order.paymentStatus === 'verifying' && 
                   order.hasReceipt && (
                    <Button
                      variant="secondary"
                      small
                      onClick={() => handleOpenUploadModal(order.id)}
                      style={{ marginBottom: '0.5rem' }}
                    >
                      <FaUpload style={{ marginRight: '0.5rem' }} />
                      Re-upload Receipt
                    </Button>
                  )}
                  
                  <Button 
                    as={Link} 
                    to={`/dashboard/orders/${order.id}`}
                    variant="secondary"
                    small
                  >
                    View Details
                  </Button>
                </OrderActions>
              </OrderDetails>
            </OrderCard>
          ))}
        </OrdersGrid>      )}
      
      {/* Receipt Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <ReceiptUploadModal
            isOpen={isUploadModalOpen}
            orderId={selectedOrderId}
            onClose={() => setIsUploadModalOpen(false)}
            onSuccess={handleUploadSuccess}
          />
        )}
      </AnimatePresence>
    </OrdersContainer>
  );
};

export default Orders;
