import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaExclamationCircle } from 'react-icons/fa';

import useAuth from '../hooks/useAuth';
import { FormInput } from '../components/ui/FormElements';
import Button from '../components/ui/Button';

const PageContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 11rem 1.5rem 5rem;
`;

const LoginCard = styled(motion.div)`
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

const LoginForm = styled.form`
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

const ForgotPasswordLink = styled(Link)`
  display: block;
  text-align: right;
  margin: -0.5rem 0 1.5rem;
  font-size: 0.9rem;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 2rem 0;
  
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: #eee;
  }
  
  span {
    padding: 0 1rem;
    color: #999;
    font-size: 0.9rem;
  }
`;

const RegisterPrompt = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
  
  a {
    color: ${props => props.theme.colors.gold};
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });  const [formErrors, setFormErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  
  const { login, error, clearErrors, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for redirect query param
  const redirectPath = new URLSearchParams(location.search).get('redirect');
  
  // Clear errors when component mounts
  useEffect(() => {
    clearErrors();
    // eslint-disable-next-line
  }, []);
  
  // Show alert when error occurs
  useEffect(() => {
    if (error) {
      setShowAlert(true);
    }
  }, [error]);
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email address is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
      // Clear alert if showing
    if (showAlert) {
      setShowAlert(false);
      clearErrors();
    }
  };
    const handleSubmit = async e => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        console.log('Form submitted with email:', formData.email);
        
        // Special case for admin - let's print more debugging info
        if (formData.email === 'admin@foiyfoshi.mv') {
          console.log('Attempting admin login...');
        }
        
        // Attempt login
        const response = await login(formData.email, formData.password);
        console.log('Login successful:', response);
        
        // If OTP verification required
        if (response && response.requiresVerification) {
          console.log('OTP verification required, redirecting');
          navigate('/verify-otp');
          return;
        }
        
        // Special handling for admin user
        if (formData.email === 'admin@foiyfoshi.mv') {
          console.log('Admin login successful, redirecting to admin dashboard');
          navigate('/admin');
          return;
        }
        
        // Redirect to the requested page or dashboard for normal users
        console.log('Login successful, redirecting to:', redirectPath || '/dashboard');
        navigate(redirectPath || '/dashboard');
      } catch (err) {
        // Error is handled by the context and shown in the alert
        console.error('Login error:', err);
        setShowAlert(true);
        
        // Enhanced error handling for debugging
        if (formData.email === 'admin@foiyfoshi.mv') {
          console.error('Admin login failed. Please check the backend logs and ensure the admin user exists in the database.');
        }
      }
    }
  };

  return (
    <PageContainer>
      <LoginCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardSubtitle>Sign in to your FoiyFoshi account</CardSubtitle>
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
        
        <LoginForm onSubmit={handleSubmit}>
          <FormInput
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            error={formErrors.email}
            required
          />
          
          <FormInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            error={formErrors.password}
            required
          />
          
          <ForgotPasswordLink to="/forgot-password">
            Forgot password?
          </ForgotPasswordLink>
          
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            loading={loading}
            disabled={loading}
          >
            Sign In
          </Button>
        </LoginForm>
        
        <Divider>
          <span>OR</span>
        </Divider>
        
        <RegisterPrompt>
          Don't have an account? <Link to="/register">Sign up</Link>
        </RegisterPrompt>
      </LoginCard>
    </PageContainer>
  );
};

export default Login;
