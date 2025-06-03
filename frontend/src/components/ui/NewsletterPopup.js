import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaEnvelope, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { subscribeToNewsletter } from '../../services/newsletterService';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const Modal = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const ModalHeader = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const ModalIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${props => props.theme.colors.mediumGold};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  
  svg {
    color: white;
    font-size: 1.5rem;
  }
`;

const ModalTitle = styled.h2`
  color: ${props => props.theme.colors.black};
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
`;

const ModalSubtitle = styled.p`
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  outline: none;
  
  &:focus {
    border-color: ${props => props.theme.colors.mediumGold};
  }
  
  &::placeholder {
    color: #aaa;
  }
`;

const SubmitButton = styled.button`
  background: ${props => props.theme.colors.mediumGold};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.paleGold};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  margin-top: 1rem;
  
  svg {
    margin-right: 0.5rem;
    flex-shrink: 0;
  }
  
  &.success {
    background: rgba(76, 175, 80, 0.1);
    color: #4caf50;
    border: 1px solid rgba(76, 175, 80, 0.3);
  }
  
  &.error {
    background: rgba(244, 67, 54, 0.1);
    color: #f44336;
    border: 1px solid rgba(244, 67, 54, 0.3);
  }
`;

const Benefits = styled.ul`
  margin: 1.5rem 0;
  padding: 0;
  list-style: none;
`;

const Benefit = styled.li`
  padding: 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  
  &:before {
    content: '✓';
    color: ${props => props.theme.colors.mediumGold};
    font-weight: bold;
    margin-right: 0.5rem;
  }
`;

const NewsletterPopup = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await subscribeToNewsletter(email);
      setMessage({ 
        type: 'success', 
        text: 'Successfully subscribed! Welcome to the FoiyFoshi community!' 
      });
      setEmail('');
      
      // Close popup after 2 seconds on success
      setTimeout(() => {
        onClose();
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to subscribe. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <Modal
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
          >
            <CloseButton onClick={onClose}>
              <FaTimes />
            </CloseButton>
            
            <ModalHeader>
              <ModalIcon>
                <FaEnvelope />
              </ModalIcon>
              <ModalTitle>Join Our Newsletter</ModalTitle>
              <ModalSubtitle>
                Stay updated with the latest book recommendations, exclusive offers, and reading community news.
              </ModalSubtitle>
            </ModalHeader>

            <Benefits>
              <Benefit>Monthly book box previews and sneak peeks</Benefit>
              <Benefit>Exclusive subscriber discounts and early access</Benefit>
              <Benefit>Author interviews and reading tips</Benefit>
              <Benefit>Community book club discussions and events</Benefit>
            </Benefits>

            <Form onSubmit={handleSubmit}>
              <InputGroup>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </InputGroup>
              
              <SubmitButton type="submit" disabled={isLoading}>
                {isLoading ? 'Subscribing...' : 'Subscribe Now'}
              </SubmitButton>
            </Form>

            {message.text && (
              <Message className={message.type}>
                {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                {message.text}
              </Message>
            )}
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default NewsletterPopup; 