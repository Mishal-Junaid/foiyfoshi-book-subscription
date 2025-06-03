import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';

const DevRegisterTest = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devInfo, setDevInfo] = useState(null);
  const { register } = useAuth();

  const { name, email, phone, password, confirmPassword } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setSuccess('');
    setDevInfo(null);

    // Validation
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    
    try {
      const response = await register(name, email, phone, password);
      console.log('Registration response:', response);
      
      setSuccess('Registration successful!');
      
      // Check for development info
      if (response && response.developmentInfo) {
        setDevInfo(response.developmentInfo);
      }
      
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <h1 className="text-center mb-4">Developer Registration Test</h1>
      <p className="text-center text-muted mb-4">
        Test registration with development mode features
      </p>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Row>
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your name"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your phone number"
                    name="phone"
                    value={phone}
                    onChange={onChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm your password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={onChange}
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="shadow-sm bg-light">
            <Card.Body>
              <h4>Development Information</h4>
              {devInfo ? (
                <div>
                  <Alert variant="info">
                    <strong>OTP Code:</strong> {devInfo.otp}
                  </Alert>
                  
                  {devInfo.emailPreviewUrl && (
                    <div className="mt-3">
                      <h5>Email Preview</h5>
                      <a 
                        href={devInfo.emailPreviewUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        View Email
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted">
                  Development information will appear here after registration 
                  when in development mode.
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DevRegisterTest;
