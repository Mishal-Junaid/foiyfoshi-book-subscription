import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaExclamationCircle } from 'react-icons/fa';

import useAuth from '../hooks/useAuth';
import { FormInput, FormCheckbox } from '../components/ui/FormElements';
import Button from '../components/ui/Button';

const PageContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 11rem 1.5rem 5rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const RegisterCard = styled(motion.div)`
  background-color: ${props => props.theme.colors.white};
  border-radius: 10px;
  box-shadow: ${props => props.theme.shadows.medium};
  width: 100%;
  max-width: 550px;
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

const RegisterForm = styled.form`
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

const TermsText = styled.div`
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #666;
  
  a {
    color: ${props => props.theme.colors.gold};
    
    &:hover {
      text-decoration: underline;
    }
  }
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

const LoginPrompt = styled.div`
  text-align: center;
  color: #666;
  
  a {
    color: ${props => props.theme.colors.gold};
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);
    const { register, error, clearErrors, loading } = useAuth();
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
    }
  }, [error]);
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email address is invalid';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{7,15}$/.test(formData.phone.replace(/\s+/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and privacy policy';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
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
        // Prepare user data
        const userData = {
          name: `${formData.firstName} ${formData.lastName}`,
                  email: formData.email,
          phone: formData.phone,
          password: formData.password
        };
        
        await register(userData);
        
        // Store email in session storage for OTP verification
        sessionStorage.setItem('registrationEmail', formData.email);
        
        // Registration successful, redirect to OTP verification
        navigate('/verify-otp', { 
          state: { 
            email: formData.email,
            redirectAfterVerification: '/user-interests'
          }
        });
      } catch (err) {
        // Error is handled by the context and shown in the alert
        console.error('Registration error:', err);
      }
    }
  };

  return (
    <PageContainer>
      <RegisterCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardSubtitle>Join FoiyFoshi and start your reading journey</CardSubtitle>
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
        
        <RegisterForm onSubmit={handleSubmit}>
          <FormRow>
            <FormInput
              label="First Name"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              error={formErrors.firstName}
              required
            />
            
            <FormInput
              label="Last Name"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              error={formErrors.lastName}
              required
            />
          </FormRow>
          
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
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            error={formErrors.phone}
            required
            helpText="Include country code (e.g., +960)"
          />
          
          <FormRow>
            <FormInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              error={formErrors.password}
              required
              helpText="Minimum 8 characters"
            />
            
            <FormInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              error={formErrors.confirmPassword}
              required
            />
          </FormRow>
          
          <FormCheckbox
            label="I accept the Terms of Service and Privacy Policy"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            error={formErrors.acceptTerms}
          />
          <TermsText>
            By creating an account, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
          </TermsText>
          
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            style={{ marginTop: '1.5rem' }}
            loading={loading}
            disabled={loading}
          >
            Create Account
          </Button>
        </RegisterForm>
        
        <Divider>
          <span>OR</span>
        </Divider>
        
        <LoginPrompt>
          Already have an account? <Link to="/login">Sign in</Link>
        </LoginPrompt>
      </RegisterCard>
    </PageContainer>
  );
};

export default Register;
