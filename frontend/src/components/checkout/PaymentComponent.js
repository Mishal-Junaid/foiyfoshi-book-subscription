import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaLock, FaExclamationCircle, FaUpload, FaFileInvoice, FaMoneyBill, FaTimes } from 'react-icons/fa';

import Button from '../ui/Button';
import BankDetails from '../ui/BankDetails';

const PaymentFormContainer = styled.div`
  margin-top: 1rem;
`;

const CardSection = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: ${props => props.theme.colors.lightGrey};
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  
  svg {
    margin-right: 0.75rem;
    color: ${props => props.theme.colors.gold};
    font-size: 1.25rem;
  }
  
  h3 {
    font-size: 1.1rem;
    margin: 0;
  }
`;

const SecureNote = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;
  color: #666;
  font-size: 0.85rem;
  
  svg {
    margin-right: 0.5rem;
    color: ${props => props.theme.colors.success};
  }
`;

const PaymentError = styled(motion.div)`
  margin: 1rem 0;
  padding: 0.75rem;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
  }
`;

// Add a styled component for file upload
const UploadWrapper = styled.div`
  margin-top: 1rem;
`;

const FileUploadContainer = styled.div`
  border: 2px dashed ${props => props.$isDragActive ? props.theme.colors.gold : '#ddd'};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  background-color: ${props => props.$isDragActive ? 'rgba(128, 90, 41, 0.05)' : 'transparent'};
  cursor: pointer;
  margin-bottom: 1rem;
  
  &:hover {
    border-color: ${props => props.theme.colors.gold};
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  color: ${props => props.theme.colors.gold};
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  margin-bottom: 1rem;
  color: #666;
`;

const FileName = styled.div`
  background-color: #f5f5f5;
  padding: 0.75rem 1rem;
  border-radius: 5px;
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  svg {
    color: #d32f2f;
    cursor: pointer;
  }
`;

const PaymentComponent = ({ paymentMethod, onPaymentComplete, onPaymentError }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const fileInputRef = React.useRef(null);
  
  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };
  
  // Handle file selection
  const handleFileSelect = (file) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setPaymentError('Only image files (JPEG, PNG, WEBP) are allowed');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPaymentError('File size must be less than 5MB');
      return;
    }
    
    setSelectedFile(file);
    setPaymentError('');
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length) {
      handleFileSelect(e.target.files[0]);
    }
  };
  
  const handleFileClick = () => {
    fileInputRef.current.click();
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
    const handleConfirmPayment = async () => {
    if (paymentMethod === 'bankTransfer' && !selectedFile) {
      setPaymentError('Please upload your payment receipt');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create payment result object based on payment method
      let paymentResult;
      
      if (paymentMethod === 'bankTransfer') {
        // Store file temporarily - it will be uploaded with order ID after order creation
        paymentResult = {
          method: paymentMethod,
          status: 'pending',
          receiptFile: selectedFile,
          timestamp: new Date().toISOString()
        };
      } else {
        // Cash on delivery just gets marked as pending
        paymentResult = {
          method: paymentMethod,
          status: 'pending',
          timestamp: new Date().toISOString()
        };
      }
      
      setIsUploading(false);
      onPaymentComplete(paymentResult);
    } catch (error) {
      console.error('Receipt upload error:', error);
      setPaymentError('An error occurred while uploading your receipt. Please try again.');
      setIsUploading(false);
      onPaymentError(error.message);
    }
  };
  
  // Bank transfer with receipt upload
  if (paymentMethod === 'bankTransfer') {
    return (
      <PaymentFormContainer>
        <CardSection>
          <CardHeader>
            <FaMoneyBill />
            <h3>Bank Transfer Instructions</h3>
          </CardHeader>
          
          <div>
            <p>Please transfer the total amount to the following bank account:</p>
            
            <BankDetails />
            
            <SecureNote style={{ marginBottom: '1.5rem' }}>
              <FaLock /> Please include your order reference in the transfer
            </SecureNote>
            
            <h4 style={{ marginBottom: '1rem' }}>Upload Payment Receipt</h4>
            
            <UploadWrapper>
              {paymentError && (
                <PaymentError
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FaExclamationCircle />
                  <span>{paymentError}</span>
                </PaymentError>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/jpg,image/webp"
              />
              
              {!selectedFile ? (
                <FileUploadContainer 
                  onClick={handleFileClick}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  $isDragActive={isDragActive}
                >
                  <UploadIcon>
                    <FaUpload />
                  </UploadIcon>
                  <UploadText>
                    <strong>Click to upload</strong> or drag and drop
                  </UploadText>
                  <UploadText>
                    JPG, PNG or WEBP (Max 5MB)
                  </UploadText>
                </FileUploadContainer>
              ) : (
                <FileName>
                  <span>{selectedFile.name}</span>
                  <FaTimes onClick={handleRemoveFile} />
                </FileName>
              )}
            </UploadWrapper>
            
            <p style={{ margin: '1rem 0', fontSize: '0.9rem', color: '#666' }}>
              Please note: Your order will only be processed after our team verifies your payment receipt. You will receive a confirmation email once your payment is verified.
            </p>
            
            <div style={{ marginTop: '1.5rem' }}>
              <Button 
                variant="primary" 
                onClick={handleConfirmPayment}
                disabled={isUploading}
                loading={isUploading}
                fullWidth
              >
                {isUploading ? 'Uploading Receipt...' : 'Submit Order with Receipt'}
              </Button>
            </div>
          </div>
        </CardSection>
      </PaymentFormContainer>
    );
  }
  
  // Cash on Delivery
  return (
    <PaymentFormContainer>
      <CardSection>
        <CardHeader>
          <FaFileInvoice />
          <h3>Cash on Delivery</h3>
        </CardHeader>
        
        <div>
          <p>You have selected Cash on Delivery as your payment method.</p>
          <p style={{ margin: '1rem 0' }}>
            Your order will be delivered to your shipping address and payment will be collected upon delivery.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            Please ensure someone is available at the delivery address to receive the package and make the payment.
          </p>
          
          <SecureNote>
            <FaLock /> Your order details are secure
          </SecureNote>
          
          <div style={{ marginTop: '1.5rem' }}>
            <Button 
              variant="primary" 
              onClick={() => onPaymentComplete({ method: 'cashOnDelivery', status: 'pending' })}
              fullWidth
            >
              Confirm Order with Cash on Delivery
            </Button>
          </div>
        </div>
      </CardSection>
    </PaymentFormContainer>
  );
};

export default PaymentComponent;
