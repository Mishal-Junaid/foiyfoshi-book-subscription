import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  // Try to get email from session storage if available
  React.useEffect(() => {
    const storedEmail = sessionStorage.getItem('verificationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await verifyOTP(email, otp);
      if (result.success) {
        setSuccessMessage('Account verified successfully! Redirecting to login...');
        // Remove email from session storage
        sessionStorage.removeItem('verificationEmail');
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError('Please enter your email address to resend OTP.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await resendOTP(email);
      setSuccessMessage('New OTP sent to your email!');
      
      // Save email to session storage
      sessionStorage.setItem('verificationEmail', email);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-center align-items-center">
        <Card className="p-4 shadow" style={{ maxWidth: '500px', width: '100%' }}>
          <Card.Body>
            <h2 className="text-center mb-4">Verify Your Account</h2>
            
            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>One-Time Password (OTP)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter the 6-digit OTP sent to your email"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </Form.Group>
              
              <div className="d-grid gap-2">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{' '}
                      Verifying...
                    </>
                  ) : (
                    'Verify Account'
                  )}
                </Button>
                
                <Button variant="outline-secondary" onClick={handleResendOTP} disabled={loading}>
                  {loading ? 'Please wait...' : 'Resend OTP'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default VerifyOTP;
