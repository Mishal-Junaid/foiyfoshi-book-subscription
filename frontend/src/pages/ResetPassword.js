import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaLock, FaUserShield, FaEnvelope, FaKey } from 'react-icons/fa';

import { FormInput } from '../components/ui/FormElements';
import Button from '../components/ui/Button';
import { useNotification } from '../components/ui/Notification';
import api from '../services/api';

const PageContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 11rem 1.5rem 5rem;
`;

const FormCard = styled(motion.div)`
  background-color: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.medium};
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const FormTitle = styled.h1`
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.primary};
`;

const FormDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  
  svg {
    font-size: 3rem;
    color: ${props => props.theme.colors.primary};
  }
`;

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotification();
  
  // Get email from URL query params if provided
  const query = new URLSearchParams(location.search);
  const emailFromUrl = query.get('email');
  
  // Set email from URL if available
  React.useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [emailFromUrl]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email || !otp || !password || !confirmPassword) {
      return addNotification('Please fill in all fields', 'error');
    }
    
    if (password !== confirmPassword) {
      return addNotification('Passwords do not match', 'error');
    }
    
    if (password.length < 6) {
      return addNotification('Password must be at least 6 characters', 'error');
    }
    
    if (otp.length !== 6) {
      return addNotification('OTP must be 6 digits', 'error');
    }
    
    setLoading(true);
    
    try {
      const res = await api.put('/auth/resetpassword', {
        email,
        otp,
        password
      });
      
      addNotification(res.data.message || 'Password reset successfully', 'success');
      navigate('/login');
    } catch (err) {
      addNotification(
        err.response?.data?.error || 'Password reset failed', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PageContainer>
      <FormCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FormHeader>
          <IconContainer>
            <FaUserShield />
          </IconContainer>
          <FormTitle>Reset Password</FormTitle>
          <FormDescription>
            Enter the OTP sent to your email and set a new password
          </FormDescription>
        </FormHeader>
        
        <Form onSubmit={handleSubmit}>
          <FormInput
            icon={<FaEnvelope />}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!emailFromUrl}
          />
          
          <FormInput
            icon={<FaKey />}
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength="6"
          />
          
          <FormInput
            icon={<FaLock />}
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <FormInput
            icon={<FaLock />}
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          
          <Button 
            type="submit" 
            fullWidth
            loading={loading}
          >
            Reset Password
          </Button>
        </Form>
      </FormCard>
    </PageContainer>
  );
}

export default ResetPassword;
