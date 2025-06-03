import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaEnvelope, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';

const PageContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 11rem 1.5rem 5rem;
`;

const OTPCard = styled(motion.div)`
  background-color: ${props => props.theme.colors.white};
  border-radius: 10px;
  box-shadow: ${props => props.theme.shadows.medium};
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: 2rem 1rem;
    max-width: 100%;
    margin: 0 0.5rem;
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

const OTPForm = styled.form`
  margin-bottom: 1.5rem;
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

const OTPInputContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 2rem auto;
  max-width: 330px;
  padding: 0 1rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    gap: 0.4rem;
    max-width: 280px;
    padding: 0 0.5rem;
  }
  
  @media (max-width: 350px) {
    gap: 0.3rem;
    max-width: 240px;
    padding: 0 0.25rem;
  }
`;

const OTPDigit = styled.input`
  width: 45px;
  height: 55px;
  font-size: 1.4rem;
  text-align: center;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  flex-shrink: 0;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.gold};
    box-shadow: 0 0 0 2px rgba(128, 90, 41, 0.2);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    width: 38px;
    height: 48px;
    font-size: 1.2rem;
  }
  
  @media (max-width: 350px) {
    width: 32px;
    height: 42px;
    font-size: 1.1rem;
  }
`;

const ResendContainer = styled.div`
  margin-top: 2rem;
  text-align: center;
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.gold};
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
  
  &:disabled {
    color: #999;
    cursor: not-allowed;
    text-decoration: none;
  }
`;

const EmailInfo = styled.div`
  background-color: #f5f5f5;
  border-radius: 5px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.8rem;
    color: ${props => props.theme.colors.gold};
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
  }
  
  strong {
    font-weight: 600;
  }
`;

const Timer = styled.span`
  font-size: 0.85rem;
  color: #666;
`;

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP, error, loading } = useAuth();
  
  // Get email and redirect path from location state or session storage
  const email = location.state?.email || sessionStorage.getItem('registrationEmail');
  const redirectPath = location.state?.redirectAfterVerification || '/dashboard';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const inputRefs = useRef([]);
  
  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);
  
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);
  
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [countdown]);
  
  const handleChange = (index, e) => {
    const value = e.target.value;
    
    // Allow only numbers
    if (!/^\d*$/.test(value)) return;
    
    // Update OTP state
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only the last digit
    setOtp(newOtp);
    
    // Clear any previous errors
    setErrorMessage('');
    
    // Move to next input if current one is filled
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };
  
  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Check if pasted data is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      
      // Focus the last input
      inputRefs.current[5].focus();
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if OTP is complete
    if (otp.some(digit => !digit)) {
      setErrorMessage('Please enter the complete 6-digit OTP');
      return;
    }
    
    try {
      const response = await verifyOTP({
        email,
        otp: otp.join('')
      });
      
      setSuccessMessage('OTP verified successfully. Redirecting...');
      
      // Store user data if returned
      if (response && response.user) {
        sessionStorage.setItem('userData', JSON.stringify(response.user));
      }
      
      // Redirect after successful verification
      setTimeout(() => {
        navigate(redirectPath);
      }, 1500);
    } catch (err) {
      // Error is handled by the context
      console.error('OTP verification error:', err);
    }
  };
  
  const handleResendOTP = async () => {
    if (!email || resendDisabled) return;
    
    try {
      await resendOTP(email);
      
      // Disable resend button for 60 seconds
      setResendDisabled(true);
      setCountdown(60);
      
      setSuccessMessage('A new OTP has been sent to your email');
      setErrorMessage('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      // Error is handled by the context
      console.error('Resend OTP error:', err);
    }
  };

  return (
    <PageContainer>
      <OTPCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardSubtitle>We've sent a 6-digit verification code</CardSubtitle>
        </CardHeader>
        
        <EmailInfo>
          <FaEnvelope />
          <p>
            Enter the code sent to <strong>{email || 'your email'}</strong>
          </p>
        </EmailInfo>
        
        {errorMessage && (
          <ErrorAlert
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <FaExclamationCircle />
            <span>{errorMessage}</span>
          </ErrorAlert>
        )}
        
        {successMessage && (
          <SuccessAlert
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <FaCheckCircle />
            <span>{successMessage}</span>
          </SuccessAlert>
        )}
        
        <OTPForm onSubmit={handleSubmit}>
          <OTPInputContainer>
            {otp.map((digit, index) => (
              <OTPDigit
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength="1"
                value={digit}
                onChange={e => handleChange(index, e)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                autoFocus={index === 0}
              />
            ))}
          </OTPInputContainer>
          
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth
            loading={loading}
            disabled={loading || otp.join('').length !== 6}
          >
            Verify
          </Button>
        </OTPForm>
        
        <ResendContainer>
          <p>Didn't receive the code?</p>
          <ResendButton 
            type="button" 
            onClick={handleResendOTP}
            disabled={resendDisabled || loading}
          >
            Resend Code{' '}
            {countdown > 0 && (
              <Timer>({countdown}s)</Timer>
            )}
          </ResendButton>
        </ResendContainer>
      </OTPCard>
    </PageContainer>
  );
};

export default OTPVerification;
