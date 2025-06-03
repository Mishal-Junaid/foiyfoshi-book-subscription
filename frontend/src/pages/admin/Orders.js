import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEye, 
  FaEdit,
  FaSearch, 
  FaCalendarAlt, 
  FaUser, 
  FaMoneyBillWave,
  FaFileImage,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaBox,
  FaShippingFast,
  FaCheck,
  FaTimes,
  FaFilter,
  FaDownload,
  FaSpinner,
  FaImage
} from 'react-icons/fa';

import { getAllOrders, updateOrderStatus, updatePaymentStatus } from '../../services/orderService';
import { sendPaymentNotification } from '../../services/emailService';
import { useNotification } from '../../components/ui/Notification';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import api from '../../services/api';

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.primary};
  font-size: 2rem;
`;

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  position: relative;
  
  input {
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    min-width: 250px;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.gold};
    }
  }
  
  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.gold};
  }
`;

const OrdersTable = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 150px 200px 150px 150px 120px 150px 200px;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  border-bottom: 1px solid #eee;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`;

const OrderRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 150px 200px 150px 150px 120px 150px 200px;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #f8f9fa;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
  }
`;

const OrderId = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
`;

const CustomerInfo = styled.div`
  .name {
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
  
  .email {
    color: #666;
    font-size: 0.9rem;
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  gap: 0.5rem;
  
  ${props => {
    switch(props.status) {
      case 'pending':
        return `
          background: #fff8e1;
          color: #f57c00;
        `;
      case 'processing':
        return `
          background: #e3f2fd;
          color: #1976d2;
        `;
      case 'shipped':
        return `
          background: #f3e5f5;
          color: #7b1fa2;
        `;
      case 'delivered':
        return `
          background: #e8f5e9;
          color: #2e7d32;
        `;
      case 'cancelled':
        return `
          background: #ffebee;
          color: #c62828;
        `;
      default:
        return `
          background: #f5f5f5;
          color: #666;
        `;
    }
  }}
`;

const PaymentBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  gap: 0.5rem;
  
  ${props => {
    switch(props.status) {
      case 'verified':
      case 'paid':
        return `
          background: #e8f5e9;
          color: #2e7d32;
        `;
      case 'pending_verification':
        return `
          background: #fff8e1;
          color: #f57c00;
        `;
      case 'rejected':
        return `
          background: #ffebee;
          color: #c62828;
        `;
      default:
        return `
          background: #f5f5f5;
          color: #666;
        `;
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const StatusSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.85rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.gold};
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
`;

// Modal styles for receipt preview
const ModalBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled(motion.div)`
  background-color: white;
  border-radius: 8px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    margin: 0;
    font-size: 1.2rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const ReceiptPreview = styled.div`
  padding: 1.5rem;
  text-align: center;
  
  img {
    max-width: 100%;
    max-height: 500px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
`;

const ReceiptAction = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

// Card view styles
const PaymentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PaymentCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const PaymentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const OrderInfo = styled.div`
  h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
  }
  
  p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
  }
`;

const PaymentStatus = styled.span.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) => {
    if (['status'].includes(prop)) {
      return false;
    }
    if (typeof defaultValidatorFn === 'function') {
      return defaultValidatorFn(prop);
    }
    return !prop.startsWith('$');
  }
})`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: ${props => {
    switch (props.status) {
      case 'pending_verification':
        return '#fff3cd';
      case 'verified':
        return '#d4edda';
      case 'rejected':
        return '#f8d7da';
      default:
        return '#e2e3e5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending_verification':
        return '#856404';
      case 'verified':
        return '#155724';
      case 'rejected':
        return '#721c24';
      default:
        return '#6c757d';
    }
  }};
`;

const PaymentDetails = styled.div`
  padding: 1.5rem;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const DetailItem = styled.div`
  h4 {
    margin: 0 0 0.25rem 0;
    font-size: 0.9rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  p {
    margin: 0;
    font-weight: 500;
  }
`;

const ReceiptSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
`;

const ReceiptImage = styled.img`
  max-width: 300px;
  max-height: 400px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ViewButton = styled.button.withConfig({
  shouldForwardProp: prop => !['active'].includes(prop)
})`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? props.theme.colors.gold : '#ccc'};
  background-color: ${props => props.active ? props.theme.colors.gold : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 5px;
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  
  &:hover {
    background-color: ${props => props.active ? props.theme.colors.gold : '#f0f0f0'};
  }
`;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [processingOrder, setProcessingOrder] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm, statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter,
        paymentStatus: paymentFilter === 'all' ? undefined : paymentFilter
      });

      if (response.success) {
        setOrders(response.data.orders || []);
        setTotalPages(Math.ceil(response.data.total / 10));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      addNotification({
        message: 'Failed to fetch orders',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setProcessingOrder(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      addNotification({
        message: `Order status updated to ${newStatus}`,
        type: 'success'
      });
      await fetchOrders(); // Refresh the orders
    } catch (error) {
      console.error('Error updating order status:', error);
      addNotification({
        message: 'Failed to update order status',
        type: 'error'
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const handlePaymentUpdate = async (orderId, paymentStatus) => {
    setProcessingOrder(orderId);
    try {
      await updatePaymentStatus(orderId, { paymentStatus });
      
      // Send email notification to customer
      try {
        await sendPaymentNotification(orderId, paymentStatus);
        console.log(`Payment ${paymentStatus} email sent for order:`, orderId);
      } catch (emailError) {
        console.error('Error sending payment notification email:', emailError);
        addNotification({
          type: 'warning',
          title: 'Email Not Sent',
          message: `Payment was updated, but we couldn't send an email notification to the customer.`
        });
      }
      
      addNotification({
        message: `Payment status updated to ${paymentStatus}! Customer has been notified.`,
        type: 'success'
      });
      await fetchOrders(); // Refresh the orders
    } catch (error) {
      console.error('Error updating payment status:', error);
      addNotification({
        message: 'Failed to update payment status',
        type: 'error'
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const handlePaymentAction = async (orderId, action) => {
    setProcessingOrder(orderId);
    try {
      // Use the correct payment status values
      const paymentStatus = action === 'approve' ? 'verified' : 'rejected';
      await updatePaymentStatus(orderId, { paymentStatus });
      
      // Send email notification to customer
      try {
        await sendPaymentNotification(orderId, paymentStatus);
        console.log(`Payment ${action} email sent for order:`, orderId);
      } catch (emailError) {
        console.error('Error sending payment notification email:', emailError);
        addNotification({
          type: 'warning',
          title: 'Email Not Sent',
          message: `Payment was ${action}d, but we couldn't send an email notification to the customer.`
        });
      }
      
      addNotification({
        message: `Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully! Customer has been notified.`,
        type: 'success'
      });
      
      // Refresh orders
      await fetchOrders();
    } catch (error) {
      console.error('Error updating payment status:', error);
      addNotification({
        message: 'Failed to update payment status',
        type: 'error'
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const handlePreviewReceipt = (order) => {
    setCurrentReceipt(order);
    setShowReceiptModal(true);
  };

  const handleClosePreview = () => {
    setShowReceiptModal(false);
    setCurrentReceipt(null);
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      addNotification({ message: 'Invoice downloaded successfully', type: 'success' });
    } catch (err) {
      addNotification({ message: 'Failed to download invoice', type: 'error' });
    }
  };

  const getReceiptUrl = (filename) => {
    if (!filename) return null;
    // Use the same base URL as the API calls (without /api suffix for static files)
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
    const baseUrl = apiBaseUrl.replace('/api', ''); // Remove /api for static file serving
    return `${baseUrl}/uploads/receipts/${filename}`;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FaClock />;
      case 'processing': return <FaSpinner />;
      case 'shipped': return <FaShippingFast />;
      case 'delivered': return <FaCheck />;
      case 'cancelled': return <FaTimes />;
      default: return <FaBox />;
    }
  };

  const getPaymentIcon = (status) => {
    switch(status) {
      case 'verified': case 'paid': return <FaCheckCircle />;
      case 'pending_verification': return <FaClock />;
      case 'rejected': return <FaTimesCircle />;
      default: return <FaClock />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <Container>
          <LoadingWrapper>
            <Spinner size="large" />
          </LoadingWrapper>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>Order Management</Title>
          <Filters>
            <SearchBox>
              <FaSearch />
              <input
                type="text"
                placeholder="Search by order ID, customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBox>
            
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </FilterSelect>
            
            <FilterSelect
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">All Payments</option>
              <option value="pending">Payment Pending</option>
              <option value="pending_verification">Awaiting Verification</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </FilterSelect>
          </Filters>
        </Header>

        <ViewToggle>
          <ViewButton
            active={viewMode === 'table'}
            onClick={() => setViewMode('table')}
          >
            Table View
          </ViewButton>
          <ViewButton
            active={viewMode === 'cards'}
            onClick={() => setViewMode('cards')}
          >
            Card View
          </ViewButton>
        </ViewToggle>

        {viewMode === 'table' ? (
          <OrdersTable>
            <TableHeader>
              <div>Order ID</div>
              <div>Customer</div>
              <div>Date</div>
              <div>Total</div>
              <div>Status</div>
              <div>Payment</div>
              <div>Actions</div>
            </TableHeader>

            {orders.length === 0 ? (
              <EmptyState>
                <FaBox size={48} color="#ccc" />
                <h3>No orders found</h3>
                <p>No orders match your current filters.</p>
              </EmptyState>
            ) : (
              <AnimatePresence>
                {orders.map((order) => (
                  <OrderRow
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <OrderId>
                      #{order.orderNumber || order._id.slice(-6)}
                    </OrderId>
                    
                    <CustomerInfo>
                      <div className="name">{order.user?.name || 'N/A'}</div>
                      <div className="email">{order.user?.email || 'N/A'}</div>
                    </CustomerInfo>
                    
                    <div>{formatDate(order.createdAt)}</div>
                    
                    <div>MVR {order.totalPrice?.toFixed(2)}</div>
                    
                    <StatusBadge status={order.status}>
                      {getStatusIcon(order.status)}
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </StatusBadge>
                    
                    <PaymentBadge status={order.paymentStatus || (order.isPaid ? 'verified' : 'pending')}>
                      {getPaymentIcon(order.paymentStatus || (order.isPaid ? 'verified' : 'pending'))}
                      {order.paymentStatus === 'verified' || order.isPaid ? 'Verified' :
                       order.paymentStatus === 'pending_verification' ? 'Pending' :
                       order.paymentStatus === 'rejected' ? 'Rejected' : 'Pending'}
                    </PaymentBadge>
                    
                    <QuickActions>
                      <Button
                        as={Link}
                        to={`/admin/orders/${order._id}`}
                        variant="outline"
                        size="small"
                        icon={<FaEye />}
                      />
                      
                      <Button
                        variant="outline"
                        size="small"
                        icon={<FaDownload />}
                        onClick={() => handleDownloadInvoice(order._id)}
                        title="Download Invoice"
                      />
                      
                      {(order.paymentReceipt || order.paymentResult?.receiptUrl) && (
                        <Button
                          variant="outline"
                          size="small"
                          icon={<FaImage />}
                          onClick={() => handlePreviewReceipt(order)}
                          title="Preview Receipt"
                        />
                      )}
                      
                      <StatusSelect
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        disabled={processingOrder === order._id}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </StatusSelect>
                      
                      {order.paymentMethod === 'bankTransfer' && (
                        <>
                          <StatusSelect
                            value={order.paymentStatus || (order.isPaid ? 'verified' : 'pending')}
                            onChange={(e) => handlePaymentUpdate(order._id, e.target.value)}
                            disabled={processingOrder === order._id}
                          >
                            <option value="pending">Pending</option>
                            <option value="pending_verification">Verifying</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                          </StatusSelect>
                          
                          {order.paymentStatus === 'pending_verification' && (
                            <>
                              <Button
                                variant="success"
                                size="small"
                                icon={<FaCheck />}
                                onClick={() => handlePaymentAction(order._id, 'approve')}
                                loading={processingOrder === order._id}
                                disabled={processingOrder === order._id}
                                title="Approve Payment"
                              />
                              <Button
                                variant="danger"
                                size="small"
                                icon={<FaTimes />}
                                onClick={() => handlePaymentAction(order._id, 'reject')}
                                loading={processingOrder === order._id}
                                disabled={processingOrder === order._id}
                                title="Reject Payment"
                              />
                            </>
                          )}
                        </>
                      )}
                    </QuickActions>
                  </OrderRow>
                ))}
              </AnimatePresence>
            )}
          </OrdersTable>
        ) : (
          <PaymentsList>
            {orders.length === 0 ? (
              <EmptyState>
                <FaBox size={48} color="#ccc" />
                <h3>No orders found</h3>
                <p>No orders match your current filters.</p>
              </EmptyState>
            ) : (
              orders.map(order => (
                <PaymentCard key={order._id}>
                  <PaymentHeader>
                    <OrderInfo>
                      <h3>Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}</h3>
                      <p>Customer: {order.user?.name || 'Unknown'} • MVR {order.totalPrice.toFixed(2)}</p>
                    </OrderInfo>
                    <PaymentStatus status={order.paymentStatus}>
                      {order.paymentStatus?.replace('_', ' ').toUpperCase() || 'PENDING'}
                    </PaymentStatus>
                  </PaymentHeader>

                  <PaymentDetails>
                    <DetailsGrid>
                      <DetailItem>
                        <h4>Order Date</h4>
                        <p>{formatDate(order.createdAt)}</p>
                      </DetailItem>
                      <DetailItem>
                        <h4>Customer Email</h4>
                        <p>{order.user?.email || 'N/A'}</p>
                      </DetailItem>
                      <DetailItem>
                        <h4>Order Status</h4>
                        <p>
                          <StatusSelect
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                            disabled={processingOrder === order._id}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </StatusSelect>
                        </p>
                      </DetailItem>
                      <DetailItem>
                        <h4>Total Amount</h4>
                        <p>MVR {order.totalPrice.toFixed(2)}</p>
                      </DetailItem>
                      {order.receiptUploadedAt && (
                        <DetailItem>
                          <h4>Receipt Uploaded</h4>
                          <p>{formatDate(order.receiptUploadedAt)}</p>
                        </DetailItem>
                      )}
                    </DetailsGrid>

                    {(order.paymentReceipt || order.paymentResult?.receiptUrl) && (
                      <ReceiptSection>
                        <h4>Payment Receipt</h4>
                        <ReceiptImage
                          src={order.paymentReceipt 
                            ? getReceiptUrl(order.paymentReceipt)
                            : order.paymentResult?.receiptUrl?.startsWith('http') 
                              ? order.paymentResult.receiptUrl
                              : getReceiptUrl(order.paymentResult?.receiptUrl?.replace('/uploads/receipts/', ''))
                          }
                          alt="Payment Receipt"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div style={{ display: 'none', color: '#666' }}>
                          Receipt image could not be loaded
                        </div>

                        <ActionButtons>
                          <Button
                            as={Link}
                            to={`/admin/orders/${order._id}`}
                            variant="outline"
                            size="small"
                            icon={<FaEye />}
                          >
                            View Details
                          </Button>
                          
                          <Button
                            variant="secondary"
                            size="small"
                            icon={<FaImage />}
                            onClick={() => handlePreviewReceipt(order)}
                          >
                            Preview Receipt
                          </Button>
                          <Button
                            variant="secondary"
                            size="small"
                            icon={<FaDownload />}
                            as="a"
                            href={order.paymentReceipt 
                              ? getReceiptUrl(order.paymentReceipt)
                              : order.paymentResult?.receiptUrl?.startsWith('http') 
                                ? order.paymentResult.receiptUrl
                                : getReceiptUrl(order.paymentResult?.receiptUrl?.replace('/uploads/receipts/', ''))
                            }
                            download
                            target="_blank"
                          >
                            Download Receipt
                          </Button>
                          
                          {order.paymentMethod === 'bankTransfer' && (
                            <>
                              <StatusSelect
                                value={order.paymentStatus || (order.isPaid ? 'verified' : 'pending')}
                                onChange={(e) => handlePaymentUpdate(order._id, e.target.value)}
                                disabled={processingOrder === order._id}
                              >
                                <option value="pending">Pending</option>
                                <option value="pending_verification">Verifying</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                              </StatusSelect>
                              
                              {order.paymentStatus === 'pending_verification' && (
                                <>
                                  <Button
                                    variant="success"
                                    size="small"
                                    icon={<FaCheck />}
                                    onClick={() => handlePaymentAction(order._id, 'approve')}
                                    loading={processingOrder === order._id}
                                    disabled={processingOrder === order._id}
                                  >
                                    Approve Payment
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="small"
                                    icon={<FaTimes />}
                                    onClick={() => handlePaymentAction(order._id, 'reject')}
                                    loading={processingOrder === order._id}
                                    disabled={processingOrder === order._id}
                                  >
                                    Reject Payment
                                  </Button>
                                </>
                              )}
                            </>
                          )}
                        </ActionButtons>
                      </ReceiptSection>
                    )}

                    {!order.paymentReceipt && !order.paymentResult?.receiptUrl && order.paymentMethod === 'bankTransfer' && (
                      <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
                        No receipt uploaded yet
                      </div>
                    )}
                  </PaymentDetails>
                </PaymentCard>
              ))
            )}
          </PaymentsList>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <Button
              variant="outline"
              size="small"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </Button>
            
            <span>Page {currentPage} of {totalPages}</span>
            
            <Button
              variant="outline"
              size="small"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </Button>
          </Pagination>
        )}

        {/* Receipt Preview Modal */}
        <AnimatePresence>
          {showReceiptModal && currentReceipt && (
            <ModalBackdrop
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClosePreview}
            >
              <ModalContent
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <ModalHeader>
                  <h3>Payment Receipt - Order #{currentReceipt.orderNumber || currentReceipt._id.slice(-6).toUpperCase()}</h3>
                  <CloseButton onClick={handleClosePreview}>×</CloseButton>
                </ModalHeader>
                
                {(currentReceipt.paymentReceipt || currentReceipt.paymentResult?.receiptUrl) ? (
                  <>
                    <ReceiptPreview>
                      <img
                        src={currentReceipt.paymentReceipt 
                          ? getReceiptUrl(currentReceipt.paymentReceipt)
                          : currentReceipt.paymentResult?.receiptUrl?.startsWith('http') 
                            ? currentReceipt.paymentResult.receiptUrl
                            : getReceiptUrl(currentReceipt.paymentResult?.receiptUrl?.replace('/uploads/receipts/', ''))
                        }
                        alt="Payment Receipt"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div style={{ display: 'none', color: '#666' }}>
                        Receipt image could not be loaded
                      </div>
                    </ReceiptPreview>
                    
                    {currentReceipt.paymentStatus === 'pending_verification' && (
                      <ReceiptAction>
                        <Button 
                          variant="secondary" 
                          onClick={handleClosePreview}
                        >
                          Cancel
                        </Button>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <Button 
                            variant="danger" 
                            onClick={() => {
                              handlePaymentAction(currentReceipt._id, 'reject');
                              handleClosePreview();
                            }}
                          >
                            <FaTimes style={{ marginRight: '0.5rem' }} />
                            Reject Payment
                          </Button>
                          <Button 
                            variant="success" 
                            onClick={() => {
                              handlePaymentAction(currentReceipt._id, 'approve');
                              handleClosePreview();
                            }}
                          >
                            <FaCheck style={{ marginRight: '0.5rem' }} />
                            Approve Payment
                          </Button>
                        </div>
                      </ReceiptAction>
                    )}
                  </>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                    <p>No receipt available for this order</p>
                  </div>
                )}
              </ModalContent>
            </ModalBackdrop>
          )}
        </AnimatePresence>
      </Container>
    </AdminLayout>
  );
};

export default AdminOrders; 