import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaEye, FaUpload, FaDownload, FaCheckCircle, FaClock, FaExclamationTriangle, FaReceipt } from 'react-icons/fa';
import { getMyOrders, uploadReceipt } from '../../services/orderService';
import { useNotification } from '../../components/ui/Notification';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { getImageUrl, imgErrorProps } from '../../utils/imageUtils';

const OrdersContainer = styled.div`
  margin-top: 2rem;
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const OrderCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: ${props => props.theme.colors.lightGrey};
  border-bottom: 1px solid #eee;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const OrderId = styled.div`
  font-weight: 600;
`;

const OrderDate = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const OrderInfo = styled.div`
  padding: 1rem;
`;

const OrderRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const OrderLabel = styled.div`
  color: #666;
`;

const OrderValue = styled.div`
  font-weight: 500;
`;

const OrderStatus = styled.div`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  
  background-color: ${props => {
    switch (props.status) {
      case 'delivered':
        return '#e8f5e9';
      case 'shipped':
        return '#e3f2fd';
      case 'processing':
        return '#fff8e1';
      case 'cancelled':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  }};
  
  color: ${props => {
    switch (props.status) {
      case 'delivered':
        return '#2e7d32';
      case 'shipped':
        return '#1565c0';
      case 'processing':
        return '#f57c00';
      case 'cancelled':
        return '#c62828';
      default:
        return '#616161';
    }
  }};
`;

const OrderProducts = styled.div`
  margin-top: 1rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
`;

const ProductItem = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr auto;
  gap: 1rem;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ProductName = styled.div`
  font-weight: 500;
`;

const ProductMeta = styled.div`
  font-size: 0.85rem;
  color: #666;
`;

const ProductPrice = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  font-weight: 500;
`;

const OrderActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
`;

const FileUpload = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #ddd;
`;

const FileUploadLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const FileUploadInput = styled.input`
  display: none;
`;

const FileUploadButton = styled(Button)`
  margin-top: 0.5rem;
`;

const ReceiptPreview = styled.div`
  margin-top: 1rem;
  text-align: center;
  
  img {
    max-width: 100%;
    max-height: 200px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
`;

const PaymentStatus = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  font-style: italic;
  color: ${props => props.isPaid ? '#2e7d32' : '#c62828'};
`;

const ReceiptStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  
  ${props => {
    switch (props.status) {
      case 'verified':
        return `
          background: #e8f5e9;
          color: #2e7d32;
          border: 1px solid #c8e6c9;
        `;
      case 'pending_verification':
        return `
          background: #fff8e1;
          color: #f57c00;
          border: 1px solid #ffecb3;
        `;
      case 'rejected':
        return `
          background: #ffebee;
          color: #c62828;
          border: 1px solid #ffcdd2;
        `;
      default:
        return `
          background: #f5f5f5;
          color: #616161;
          border: 1px solid #e0e0e0;
        `;
    }
  }}
`;

const ReceiptActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
`;

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addNotification } = useNotification();
  const [uploadingOrder, setUploadingOrder] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getMyOrders();
      setOrders(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders. Please try again.');
      addNotification({
        message: 'Failed to load your orders. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);

      // Create preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleUploadReceipt = async (orderId) => {
    if (!receiptFile) {
      addNotification({
        message: 'Please select a receipt file to upload',
        type: 'error'
      });
      return;
    }

    try {
      setUploading(true);
      await uploadReceipt(orderId, receiptFile);
      
      addNotification({
        message: 'Receipt uploaded successfully!',
        type: 'success'
      });
      
      // Refresh orders
      await fetchOrders();
      
      // Reset upload state
      setUploadingOrder(null);
      setReceiptFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error('Error uploading receipt:', err);
      addNotification({
        message: 'Failed to upload receipt. Please try again.',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getReceiptUrl = (filename) => {
    if (!filename) return null;
    
    // If it's already a full URL, return as is
    if (filename.startsWith('http') || filename.startsWith('/uploads/')) {
      return filename.startsWith('http') ? filename : `http://localhost:5000${filename}`;
    }
    
    // Otherwise construct the URL
    return `http://localhost:5000/uploads/receipts/${filename}`;
  };

  const getReceiptStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <FaCheckCircle />;
      case 'pending_verification':
        return <FaClock />;
      case 'rejected':
        return <FaExclamationTriangle />;
      default:
        return <FaClock />;
    }
  };

  const getReceiptStatusText = (status) => {
    switch (status) {
      case 'verified':
        return 'Receipt verified and payment confirmed';
      case 'pending_verification':
        return 'Receipt uploaded, awaiting verification';
      case 'rejected':
        return 'Receipt was rejected, please upload a new one';
      default:
        return 'No receipt uploaded';
    }
  };

  const handleViewReceipt = (receiptUrl) => {
    window.open(receiptUrl, '_blank');
  };

  const handleDownloadReceipt = (receiptUrl, orderId) => {
    const link = document.createElement('a');
    link.href = receiptUrl;
    link.download = `receipt-order-${orderId}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <EmptyState>
        <p>{error}</p>
        <Button onClick={fetchOrders} style={{ marginTop: '1rem' }}>
          Try Again
        </Button>
      </EmptyState>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState>
        <h3>No Orders Yet</h3>
        <p>You haven't placed any orders yet.</p>
        <Button as={Link} to="/products" style={{ marginTop: '1rem' }}>
          Start Shopping
        </Button>
      </EmptyState>
    );
  }

  return (
    <OrdersContainer>
      <OrdersList>
        {orders.map((order) => (
          <OrderCard key={order._id}>
            <OrderHeader>
              <OrderId>Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}</OrderId>
              <OrderDate>Placed on {formatDate(order.createdAt)}</OrderDate>
            </OrderHeader>
            
            <OrderInfo>
              <OrderRow>
                <OrderLabel>Status</OrderLabel>
                <OrderStatus status={order.status}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </OrderStatus>
              </OrderRow>
              
              <OrderRow>
                <OrderLabel>Payment Method</OrderLabel>
                <OrderValue>
                  {order.paymentMethod === 'bankTransfer' ? 'Bank Transfer' : 'Cash On Delivery'}
                </OrderValue>
              </OrderRow>
              
              <OrderRow>
                <OrderLabel>Total Amount</OrderLabel>
                <OrderValue>MVR {order.totalPrice.toFixed(2)}</OrderValue>
              </OrderRow>
              
              {order.paymentMethod === 'bankTransfer' && (
                <OrderRow>
                  <OrderLabel>Payment Status</OrderLabel>
                  <PaymentStatus isPaid={order.isPaid}>
                    {order.isPaid ? 'Paid' : 'Awaiting Payment'}
                  </PaymentStatus>
                </OrderRow>
              )}
              
              {order.trackingNumber && (
                <OrderRow>
                  <OrderLabel>Tracking Number</OrderLabel>
                  <OrderValue>{order.trackingNumber}</OrderValue>
                </OrderRow>
              )}
              
              <OrderProducts>
                {order.products.map((item, index) => (
                  <ProductItem key={index}>
                    <ProductImage 
                      src={getImageUrl(item.product.image)} 
                      alt={item.product.name} 
                      {...imgErrorProps}
                    />
                    <ProductInfo>
                      <ProductName>{item.product.name}</ProductName>
                      <ProductMeta>Qty: {item.quantity}</ProductMeta>
                    </ProductInfo>
                    <ProductPrice>MVR {(item.price * item.quantity).toFixed(2)}</ProductPrice>
                  </ProductItem>
                ))}
              </OrderProducts>
              
              <OrderActions>
                <Button
                  small
                  as={Link}
                  to={`/dashboard/orders/${order._id}`}
                  icon={<FaEye />}
                >
                  View Details
                </Button>
                
                {order.paymentMethod === 'bankTransfer' && !order.isPaid && (
                  <Button
                    small
                    variant="secondary"
                    icon={<FaUpload />}
                    onClick={() => setUploadingOrder(order._id)}
                  >
                    Upload Receipt
                  </Button>
                )}
              </OrderActions>
              
              {/* Receipt Display Section for Bank Transfer Orders */}
              {order.paymentMethod === 'bankTransfer' && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FaReceipt />
                    <strong>Payment Receipt</strong>
                  </div>
                  
                  {order.paymentReceipt ? (
                    <>
                      <ReceiptStatus status={order.paymentStatus}>
                        {getReceiptStatusIcon(order.paymentStatus)}
                        {getReceiptStatusText(order.paymentStatus)}
                      </ReceiptStatus>
                      
                      <ReceiptActions>
                        <Button
                          small
                          variant="secondary"
                          icon={<FaEye />}
                          onClick={() => handleViewReceipt(getReceiptUrl(order.paymentReceipt))}
                        >
                          View Receipt
                        </Button>
                        <Button
                          small
                          variant="secondary"
                          icon={<FaDownload />}
                          onClick={() => handleDownloadReceipt(getReceiptUrl(order.paymentReceipt), order._id)}
                        >
                          Download
                        </Button>
                        {order.paymentStatus !== 'verified' && (
                          <Button
                            small
                            variant="primary"
                            icon={<FaUpload />}
                            onClick={() => setUploadingOrder(order._id)}
                          >
                            Replace Receipt
                          </Button>
                        )}
                      </ReceiptActions>
                      
                      {order.receiptUploadedAt && (
                        <p style={{ 
                          fontSize: '0.8rem', 
                          color: '#666',
                          marginTop: '0.5rem',
                          marginBottom: 0
                        }}>
                          Uploaded on {formatDate(order.receiptUploadedAt)}
                        </p>
                      )}
                    </>
                  ) : (
                    <ReceiptStatus status="no_receipt">
                      <FaExclamationTriangle />
                      No receipt uploaded yet
                    </ReceiptStatus>
                  )}
                </div>
              )}
              
              {uploadingOrder === order._id && (
                <FileUpload>
                  <FileUploadLabel>Upload Payment Receipt</FileUploadLabel>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                    Please upload a clear image of your payment receipt.
                  </p>
                  
                  <FileUploadInput
                    type="file"
                    id={`receipt-${order._id}`}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  
                  <FileUploadButton
                    as="label"
                    htmlFor={`receipt-${order._id}`}
                    variant="secondary"
                    icon={<FaUpload />}
                  >
                    Select File
                  </FileUploadButton>
                  
                  {previewUrl && (
                    <ReceiptPreview>
                      <img src={previewUrl} alt="Receipt Preview" />
                    </ReceiptPreview>
                  )}
                  
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <Button
                      small
                      variant="secondary"
                      onClick={() => {
                        setUploadingOrder(null);
                        setReceiptFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      small
                      variant="primary"
                      onClick={() => handleUploadReceipt(order._id)}
                      loading={uploading}
                      disabled={uploading || !receiptFile}
                    >
                      Upload Receipt
                    </Button>
                  </div>
                </FileUpload>
              )}
            </OrderInfo>
          </OrderCard>
        ))}
      </OrdersList>
    </OrdersContainer>
  );
};

export default OrderHistory;
