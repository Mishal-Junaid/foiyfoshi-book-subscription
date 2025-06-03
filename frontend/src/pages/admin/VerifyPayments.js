import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaEye, FaCheck, FaTimes, FaSearch, FaDownload, FaImage } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

import { getAllOrders, updatePaymentStatus } from '../../services/orderService';
import { sendPaymentNotification } from '../../services/emailService';
import Button from '../../components/ui/Button';
import { useNotification } from '../../components/ui/Notification';
import Spinner from '../../components/ui/Spinner';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../services/api';

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  margin: 0;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0;
`;

const SearchContainer = styled.div`
  display: flex;
  position: relative;
  max-width: 300px;
  width: 100%;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
  
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
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.gold};
    box-shadow: 0 0 0 2px rgba(164, 112, 49, 0.2);
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
`;

const FilterTab = styled.button.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) => {
    if (['active'].includes(prop)) {
      return false;
    }
    if (typeof defaultValidatorFn === 'function') {
      return defaultValidatorFn(prop);
    }
    return !prop.startsWith('$');
  }
})`
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  font-weight: 500;
  color: ${props => props.active ? props.theme.colors.gold : '#666'};
  border-bottom-color: ${props => props.active ? props.theme.colors.gold : 'transparent'};
  
  &:hover {
    color: ${props => props.theme.colors.gold};
  }
`;

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

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
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

const NoDataMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

// Table view styles for order management
const OrdersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background-color: #f5f5f5;
    color: #333;
    font-weight: 600;
  }
  
  tr:hover {
    background-color: #f9f9f9;
  }
  
  @media (max-width: 768px) {
    display: block;
    overflow-x: auto;
  }
`;

const Badge = styled.span`
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

const Pagination = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  gap: 0.5rem;
`;

const PageButton = styled.button.withConfig({
  shouldForwardProp: prop => !['active'].includes(prop)
})`
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  background-color: ${props => props.active ? props.theme.colors.primary : 'white'};
  color: ${props => props.active ? 'white' : props.theme.colors.primary};
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? props.theme.colors.primary : '#f0f0f0'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

const VerifyPayments = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [processingOrder, setProcessingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchOrders();
  }, [activeFilter, currentPage, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter orders based on search term and active filter
  useEffect(() => {
    let filtered = orders;
    
    // Apply status filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'pending_verification' || activeFilter === 'verified' || activeFilter === 'rejected') {
        filtered = filtered.filter(order => order.paymentStatus === activeFilter);
      } else {
        filtered = filtered.filter(order => order.status === activeFilter);
      }
    }
    
    // Search is handled by API, so we don't need to filter here locally
    
    setFilteredOrders(filtered);
  }, [orders, activeFilter, searchTerm]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10
      };
      
      // Add filters based on activeFilter
      if (activeFilter === 'pending_verification' || activeFilter === 'verified' || activeFilter === 'rejected') {
        params.paymentMethod = 'bankTransfer';
        params.paymentStatus = activeFilter;
      } else if (activeFilter !== 'all') {
        params.status = activeFilter;
      }
      
      if (searchTerm.trim()) {
        params.search = searchTerm;
      }
      
      const response = await getAllOrders(params);
      setOrders(response.data || []);
      
      // Handle pagination
      if (response.pagination) {
        const calculatedPages = Math.ceil(response.pagination.total / response.pagination.limit);
        setTotalPages(Math.max(1, isNaN(calculatedPages) ? 1 : calculatedPages));
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

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
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

  const getStatusBadge = (status) => {
    return <Badge status={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getReceiptUrl = (filename) => {
    if (!filename) return null;
    // Use the same base URL as the API calls (without /api suffix for static files)
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
    const baseUrl = apiBaseUrl.replace('/api', ''); // Remove /api for static file serving
    return `${baseUrl}/uploads/receipts/${filename}`;
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
    return <Spinner />;
  }

  return (
    <AdminLayout>
      <Container>
        <Header>
          <HeaderContent>
            <Title>Order Management</Title>
            <Subtitle>Manage all orders, payments, and customer requests</Subtitle>
          </HeaderContent>
          <form onSubmit={handleSearch}>
            <SearchContainer>
              <FaSearch />
              <SearchInput
                type="text"
                placeholder="Search orders by ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>
          </form>
        </Header>

        <ViewToggle>
          <ViewButton
            active={viewMode === 'cards'}
            onClick={() => setViewMode('cards')}
          >
            Card View
          </ViewButton>
          <ViewButton
            active={viewMode === 'table'}
            onClick={() => setViewMode('table')}
          >
            Table View
          </ViewButton>
        </ViewToggle>

        <FilterTabs>
          <FilterTab
            active={activeFilter === 'all'}
            onClick={() => {
              setActiveFilter('all');
              setCurrentPage(1);
            }}
          >
            All Orders
          </FilterTab>
          <FilterTab
            active={activeFilter === 'pending'}
            onClick={() => {
              setActiveFilter('pending');
              setCurrentPage(1);
            }}
          >
            Pending
          </FilterTab>
          <FilterTab
            active={activeFilter === 'processing'}
            onClick={() => {
              setActiveFilter('processing');
              setCurrentPage(1);
            }}
          >
            Processing
          </FilterTab>
          <FilterTab
            active={activeFilter === 'shipped'}
            onClick={() => {
              setActiveFilter('shipped');
              setCurrentPage(1);
            }}
          >
            Shipped
          </FilterTab>
          <FilterTab
            active={activeFilter === 'delivered'}
            onClick={() => {
              setActiveFilter('delivered');
              setCurrentPage(1);
            }}
          >
            Delivered
          </FilterTab>
          <FilterTab
            active={activeFilter === 'cancelled'}
            onClick={() => {
              setActiveFilter('cancelled');
              setCurrentPage(1);
            }}
          >
            Cancelled
          </FilterTab>
          <FilterTab
            active={activeFilter === 'pending_verification'}
            onClick={() => {
              setActiveFilter('pending_verification');
              setCurrentPage(1);
            }}
          >
            Payment Verification
          </FilterTab>
        </FilterTabs>

        {filteredOrders.length > 0 ? (
          viewMode === 'table' ? (
            <>
              <OrdersTable>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order._id}>
                      <td>{order.orderNumber || order._id.slice(-6).toUpperCase()}</td>
                      <td>{order.user ? order.user.name : 'Deleted User'}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>MVR {order.totalPrice.toFixed(2)}</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>{order.isPaid ? 'Paid' : 'Unpaid'}</td>
                      <td>
                        <ActionButtons>
                          <Button 
                            small 
                            as={Link}
                            to={`/admin/orders/${order._id}`}
                            icon={<FaEye />}
                            title="View Order Details"
                          />
                          <Button 
                            small 
                            variant="secondary"
                            icon={<FaDownload />}
                            onClick={() => handleDownloadInvoice(order._id)}
                            title="Download Invoice"
                          />
                          {(order.paymentReceipt || order.paymentResult?.receiptUrl) && (
                            <Button
                              variant="secondary"
                              small
                              icon={<FaImage />}
                              onClick={() => handlePreviewReceipt(order)}
                              title="Preview Receipt"
                            />
                          )}
                        </ActionButtons>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </OrdersTable>
              
              <Pagination>
                <PageButton 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </PageButton>
                
                {totalPages > 0 && [...Array(Math.max(1, totalPages)).keys()].map(page => (
                  <PageButton 
                    key={page + 1}
                    active={currentPage === page + 1}
                    onClick={() => setCurrentPage(page + 1)}
                  >
                    {page + 1}
                  </PageButton>
                ))}
                
                <PageButton 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next
                </PageButton>
              </Pagination>
            </>
          ) : (
            <PaymentsList>
              {filteredOrders.map(order => (
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
                          variant="secondary"
                          small
                          icon={<FaImage />}
                          onClick={() => handlePreviewReceipt(order)}
                        >
                          Preview Receipt
                        </Button>
                        <Button
                          variant="secondary"
                          small
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
                        {order.paymentStatus === 'pending_verification' && (
                          <>
                            <Button
                              variant="success"
                              small
                              icon={<FaCheck />}
                              onClick={() => handlePaymentAction(order._id, 'approve')}
                              loading={processingOrder === order._id}
                              disabled={processingOrder === order._id}
                            >
                              Approve Payment
                            </Button>
                            <Button
                              variant="danger"
                              small
                              icon={<FaTimes />}
                              onClick={() => handlePaymentAction(order._id, 'reject')}
                              loading={processingOrder === order._id}
                              disabled={processingOrder === order._id}
                            >
                              Reject Payment
                            </Button>
                          </>
                        )}
                      </ActionButtons>
                    </ReceiptSection>
                  )}

                  {!order.paymentReceipt && !order.paymentResult?.receiptUrl && (
                    <div style={{ color: '#666', fontStyle: 'italic' }}>
                      No receipt uploaded yet
                    </div>
                  )}
                </PaymentDetails>
              </PaymentCard>
              ))}
            </PaymentsList>
          )
        ) : (
          <EmptyState>
            <h3>No orders found</h3>
            <p>Try adjusting your search criteria or filters</p>
          </EmptyState>
        )}

        {/* Pagination for both views */}
        {filteredOrders.length > 0 && viewMode === 'cards' && (
          <Pagination>
            <PageButton 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              Previous
            </PageButton>
            
            {totalPages > 0 && [...Array(Math.max(1, totalPages)).keys()].map(page => (
              <PageButton 
                key={page + 1}
                active={currentPage === page + 1}
                onClick={() => setCurrentPage(page + 1)}
              >
                {page + 1}
              </PageButton>
            ))}
            
            <PageButton 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Next
            </PageButton>
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
                  <NoDataMessage>
                    <p>No receipt available for this order</p>
                  </NoDataMessage>
                )}
              </ModalContent>
            </ModalBackdrop>
          )}
        </AnimatePresence>
      </Container>
    </AdminLayout>
  );
};

export default VerifyPayments; 