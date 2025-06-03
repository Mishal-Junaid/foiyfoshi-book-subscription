import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaEnvelope, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import { unsubscribeFromNewsletter } from '../services/newsletterService';
import Spinner from '../components/ui/Spinner';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 11rem 2rem 2rem;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  border: 1px solid #eee;
  width: 100%;
`;

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem auto;
  font-size: 2rem;
  
  &.loading {
    background: #f8f9fa;
    color: #805A29;
  }
  
  &.success {
    background: rgba(76, 175, 80, 0.1);
    color: #4caf50;
  }
  
  &.error {
    background: rgba(244, 67, 54, 0.1);
    color: #f44336;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #2c3e50;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const EmailDisplay = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-family: monospace;
  font-size: 1rem;
  color: #2c3e50;
  border: 1px solid #e9ecef;
`;

const ActionButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #805A29;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-top: 1rem;
  
  &:hover {
    background: #5d3f1f;
    color: white;
    transform: translateY(-2px);
  }
`;

const RetryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #805A29;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 1rem 0.5rem 0 0.5rem;
  
  &:hover {
    background: #5d3f1f;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error, notFound
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  const handleUnsubscribe = async (emailToUnsubscribe) => {
    try {
      setStatus('loading');
      setMessage('Processing your unsubscribe request...');
      
      await unsubscribeFromNewsletter(emailToUnsubscribe);
      
      setStatus('success');
      setMessage('You have been successfully unsubscribed from our newsletter.');
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setStatus('error');
      
      if (error.response?.status === 404) {
        setMessage('This email address is not subscribed to our newsletter or has already been unsubscribed.');
      } else {
        setMessage('An error occurred while processing your request. Please try again.');
      }
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await handleUnsubscribe(email);
    setIsRetrying(false);
  };

  useEffect(() => {
    const emailParam = searchParams.get('email');
    
    if (!emailParam) {
      setStatus('notFound');
      setMessage('No email address provided in the unsubscribe link.');
      return;
    }
    
    setEmail(emailParam);
    handleUnsubscribe(emailParam);
  }, [searchParams]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <IconContainer className="loading">
              <Spinner />
            </IconContainer>
            <Title>Processing Request</Title>
            <Subtitle>{message}</Subtitle>
            {email && (
              <EmailDisplay>{email}</EmailDisplay>
            )}
          </>
        );

      case 'success':
        return (
          <>
            <IconContainer className="success">
              <FaCheckCircle />
            </IconContainer>
            <Title>Successfully Unsubscribed</Title>
            <Subtitle>{message}</Subtitle>
            <EmailDisplay>{email}</EmailDisplay>
            <Subtitle>
              You will no longer receive newsletter emails from FoiyFoshi Books. 
              If you change your mind, you can always subscribe again on our website.
            </Subtitle>
            <ActionButton to="/">
              <FaArrowLeft />
              Return to Home
            </ActionButton>
          </>
        );

      case 'error':
        return (
          <>
            <IconContainer className="error">
              <FaTimesCircle />
            </IconContainer>
            <Title>Unsubscribe Failed</Title>
            <Subtitle>{message}</Subtitle>
            {email && (
              <EmailDisplay>{email}</EmailDisplay>
            )}
            <div>
              <RetryButton onClick={handleRetry} disabled={isRetrying}>
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </RetryButton>
              <ActionButton to="/contact">
                Contact Support
              </ActionButton>
            </div>
          </>
        );

      case 'notFound':
        return (
          <>
            <IconContainer className="error">
              <FaEnvelope />
            </IconContainer>
            <Title>Invalid Unsubscribe Link</Title>
            <Subtitle>{message}</Subtitle>
            <Subtitle>
              Please make sure you clicked the correct unsubscribe link from your email, 
              or contact our support team for assistance.
            </Subtitle>
            <div>
              <ActionButton to="/">
                <FaArrowLeft />
                Return to Home
              </ActionButton>
              <ActionButton to="/contact">
                Contact Support
              </ActionButton>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {renderContent()}
      </Card>
    </Container>
  );
};

export default Unsubscribe; 