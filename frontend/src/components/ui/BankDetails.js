import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaUniversity, FaCopy, FaCheck, FaInfoCircle } from 'react-icons/fa';

const BankDetailsContainer = styled(motion.div)`
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
`;

const BankHeader = styled.div`
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
    color: ${props => props.theme.colors.black};
  }
`;

const BankInfo = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 5px;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const DetailValue = styled.span`
  font-family: 'Courier New', monospace;
  font-weight: 500;
  color: ${props => props.theme.colors.black};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.gold};
  font-size: 0.9rem;
  padding: 0.25rem;
  border-radius: 3px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(128, 90, 41, 0.1);
  }
`;

const InstructionsBox = styled.div`
  background-color: #e8f5e8;
  border: 1px solid #4caf50;
  border-radius: 5px;
  padding: 1rem;
  margin-top: 1rem;
  
  h4 {
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
    color: #2e7d32;
    font-size: 0.95rem;
    
    svg {
      margin-right: 0.5rem;
    }
  }
  
  ol {
    margin: 0;
    padding-left: 1.25rem;
    
    li {
      margin-bottom: 0.5rem;
      line-height: 1.5;
      font-size: 0.9rem;
      color: #333;
    }
  }
`;

const ReferenceNote = styled.div`
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 5px;
  padding: 1rem;
  margin-top: 1rem;
  
  p {
    margin: 0;
    font-size: 0.9rem;
    color: #856404;
    
    strong {
      color: #533803;
    }
  }
`;

const BankDetails = ({ orderId }) => {
  const [copiedField, setCopiedField] = useState('');
  const [bankInfo, setBankInfo] = useState(null);
  
  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, using mock bank information
    const mockBankInfo = {
      bankName: 'Bank of Maldives',
      accountName: 'FoiyFoshi Pvt Ltd',
      accountNumber: '7701234567890',
      branch: 'Male Branch',
      currency: 'MVR',
      routingNumber: '001234567'
    };
    
    setBankInfo(mockBankInfo);
  }, []);
  
  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };
  
  if (!bankInfo) {
    return null;
  }
  
  return (
    <BankDetailsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <BankHeader>
        <FaUniversity />
        <h3>Bank Transfer Details</h3>
      </BankHeader>
      
      <BankInfo>
        <DetailRow>
          <DetailLabel>Bank Name:</DetailLabel>
          <DetailValue>
            {bankInfo.bankName}
            <CopyButton onClick={() => handleCopy(bankInfo.bankName, 'bankName')}>
              {copiedField === 'bankName' ? <FaCheck /> : <FaCopy />}
            </CopyButton>
          </DetailValue>
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>Account Name:</DetailLabel>
          <DetailValue>
            {bankInfo.accountName}
            <CopyButton onClick={() => handleCopy(bankInfo.accountName, 'accountName')}>
              {copiedField === 'accountName' ? <FaCheck /> : <FaCopy />}
            </CopyButton>
          </DetailValue>
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>Account Number:</DetailLabel>
          <DetailValue>
            {bankInfo.accountNumber}
            <CopyButton onClick={() => handleCopy(bankInfo.accountNumber, 'accountNumber')}>
              {copiedField === 'accountNumber' ? <FaCheck /> : <FaCopy />}
            </CopyButton>
          </DetailValue>
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>Branch:</DetailLabel>
          <DetailValue>
            {bankInfo.branch}
            <CopyButton onClick={() => handleCopy(bankInfo.branch, 'branch')}>
              {copiedField === 'branch' ? <FaCheck /> : <FaCopy />}
            </CopyButton>
          </DetailValue>
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>Currency:</DetailLabel>
          <DetailValue>{bankInfo.currency}</DetailValue>
        </DetailRow>
      </BankInfo>
      
      <InstructionsBox>
        <h4>
          <FaInfoCircle />
          Payment Instructions
        </h4>
        <ol>
          <li>Transfer the exact order amount to the bank account above</li>
          <li>Keep your transaction receipt/screenshot</li>
          <li>Upload the receipt when completing your order</li>
          <li>Include your order number in the transfer reference if possible</li>
          <li>Your order will be processed once payment is verified</li>
        </ol>
      </InstructionsBox>
      
      {orderId && (
        <ReferenceNote>
          <p>
            <strong>Reference:</strong> Please include order number <strong>{orderId}</strong> in your transfer reference for faster processing.
          </p>
        </ReferenceNote>
      )}
    </BankDetailsContainer>
  );
};

export default BankDetails; 