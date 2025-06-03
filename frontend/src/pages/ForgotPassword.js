import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaExclamationCircle, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

import useAuth from '../hooks/useAuth';
import { FormInput } from '../components/ui/FormElements';
import Button from '../components/ui/Button';

const PageContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 11rem 1.5rem 5rem;
`;

const ForgotCard = styled(motion.div)`
  background-color: ${props => props.theme.colors.white};
  border-radius: 10px;
  box-shadow: ${props => props.theme.shadows.medium};
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: 2rem 1.5rem;
  }
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const CardTitle = styled.h2`
  margin-bottom: 0.5rem;
`;

const CardSubtitle = styled.p`
  color: #666;
`;

const ForgotForm = styled.form`
  margin-bottom: 2rem;
`;

const ErrorAlert = styled(motion.div)`
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    flex-shrink: 0;
  }
`;

const SuccessAlert = styled(motion.div)`
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    flex-shrink: 0;
  }
`;

const BackToLogin = styled(Link)`
  display: flex;
  align-items: center;
  color: ${props => props.theme.colors.gold};
  text-decoration: none;
  font-weight: 500;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    text-decoration: underline;
  }
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { forgotPassword, error, clearErrors, loading } = useAuth();
  const navigate = useNavigate();
  
  // Clear errors when component mounts
  useEffect(() => {
    clearErrors();
    // eslint-disable-next-line
  }, []);
  
  // Show alert when error occurs
  useEffect(() => {
    if (error) {
      setShowAlert(true);
      setShowSuccessAlert(false);
    }
  }, [error]);
  
  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email address is invalid');
      return false;
    }
    
    setEmailError('');
    return true;
  };
  
  const handleEmailChange = e => {
    setEmail(e.target.value);
    
    // Clear error when user types
    if (emailError) {
      setEmailError('');
    }
    
    // Clear alerts
    setShowAlert(false);
    setShowSuccessAlert(false);
    clearErrors();
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    
    if (validateEmail()) {
      try {
        await forgotPassword(email);
        
        // Show success message briefly then redirect to reset password page
        setSuccessMessage(`OTP sent to ${email}. Redirecting to reset password page...`);
        setShowSuccessAlert(true);
        setShowAlert(false);
        setIsSubmitted(true);
        
        // Redirect to reset password page with email parameter after 2 seconds
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      } catch (err) {
        // Error is handled by the context and shown in the alert
        console.error('Forgot password error:', err);
      }
    }
  };

  return (
    <PageContainer>
      <ForgotCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardSubtitle>Enter your email to reset your password</CardSubtitle>
        </CardHeader>
        
        {showAlert && error && (
          <ErrorAlert
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <FaExclamationCircle />
            <span>{error}</span>
          </ErrorAlert>
        )}
        
        {showSuccessAlert && successMessage && (
          <SuccessAlert
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <FaCheckCircle />
            <span>{successMessage}</span>
          </SuccessAlert>
        )}
        
        {!isSubmitted ? (
          <ForgotForm onSubmit={handleSubmit}>
            <FormInput
              label="Email Address"
              type="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              error={emailError}
              required
            />
            
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              style={{ marginTop: '1rem' }}
              loading={loading}
              disabled={loading}
            >
              Send OTP
            </Button>
          </ForgotForm>
        ) : (
          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              An OTP has been sent to your email. You will be redirected to the reset password page shortly.
            </p>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
              If you're not redirected automatically, click the button below.
            </p>
            <Button 
              variant="primary" 
              onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
              style={{ marginBottom: '1rem' }}
            >
              Go to Reset Password
            </Button>
            <br />
            <Button 
              variant="secondary" 
              onClick={() => {
                setEmail('');
                setIsSubmitted(false);
                setShowSuccessAlert(false);
              }}
            >
              Try Another Email
            </Button>
          </div>
        )}
        
        <BackToLogin to="/login">
          <FaArrowLeft />
          Back to Login
        </BackToLogin>
      </ForgotCard>
    </PageContainer>
  );
};

export default ForgotPassword;
