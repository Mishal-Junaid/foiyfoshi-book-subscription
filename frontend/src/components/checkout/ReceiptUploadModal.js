import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaUpload, FaExclamationCircle, FaCheckCircle, FaTimes, FaSpinner } from 'react-icons/fa';

import { uploadReceipt } from '../../services/orderService';
import Button from '../ui/Button';
import { useNotification } from '../ui/Notification';

const ModalBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: ${props => props.theme.shadows.large};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h3 {
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: ${props => props.theme.colors.black};
  }
`;

const UploadWrapper = styled.div`
  margin-bottom: 1.5rem;
`;

const FileUploadContainer = styled.div.withConfig({
  shouldForwardProp: prop => !['isDragActive'].includes(prop)
})`
  border: 2px dashed ${props => props.isDragActive ? props.theme.colors.gold : '#ddd'};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  background-color: ${props => props.isDragActive ? 'rgba(128, 90, 41, 0.05)' : 'transparent'};
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

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  margin-top: 0.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
  }
`;

const SuccessMessage = styled.div`
  color: ${props => props.theme.colors.success};
  margin-top: 1rem;
  padding: 1rem;
  background-color: #e8f5e9;
  border-radius: 5px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
  }
`;

const ReceiptUploadModal = ({ isOpen, orderId, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const { addNotification } = useNotification();
  
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
    // Clear previous states
    setError('');
    setSuccess('');
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only image files (JPEG, PNG, WEBP) are allowed');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    setSelectedFile(file);
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
    const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    try {
      // Get user token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('receipt', selectedFile);
      
      // Call the uploadReceipt service
      await uploadReceipt(orderId, selectedFile, token);
      
      setSuccess('Receipt uploaded successfully! Our team will review it shortly.');
      setIsUploading(false);
      
      // Add success notification
      addNotification({
        type: 'success',
        title: 'Receipt Uploaded',
        message: 'Your payment receipt has been uploaded successfully! Our team will verify it shortly.'
      });
      
      // Notify parent component of successful upload
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading receipt:', error);
      setError(error.response?.data?.message || 'Failed to upload receipt. Please try again.');
      setIsUploading(false);
      
      // Add error notification
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: error.response?.data?.message || 'Failed to upload receipt. Please try again.'
      });
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <ModalBackdrop
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <ModalContent
        onClick={e => e.stopPropagation()}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ModalHeader>
          <h3>Upload Payment Receipt</h3>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <p>Please upload a clear image of your bank transfer receipt for order #{orderId}</p>
        
        <UploadWrapper>
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
              isDragActive={isDragActive}
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
          
          {error && (
            <ErrorMessage>
              <FaExclamationCircle /> {error}
            </ErrorMessage>
          )}
        </UploadWrapper>
        
        {success ? (
          <SuccessMessage>
            <FaCheckCircle /> {success}
          </SuccessMessage>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="secondary" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              loading={isUploading}
            >
              {isUploading ? (
                <>
                  <FaSpinner className="spinner" style={{ marginRight: '0.5rem' }} />
                  Uploading...
                </>
              ) : (
                'Upload Receipt'
              )}
            </Button>
          </div>
        )}
      </ModalContent>
    </ModalBackdrop>
  );
};

export default ReceiptUploadModal;
