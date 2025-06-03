import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaCreditCard, FaMoneyBillWave, FaExclamationCircle, FaChevronRight, FaChevronLeft } from 'react-icons/fa';

import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import { createOrder, uploadReceipt } from '../services/orderService';
import PaymentComponent from '../components/checkout/PaymentComponent';
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import { FormInput, FormCheckbox } from '../components/ui/FormElements';
import Button from '../components/ui/Button';
import { useNotification } from '../components/ui/Notification';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 10rem 1.5rem 5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: 8rem 1.5rem 3rem;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: ${props => props.theme.colors.gold};
  }
`;

const CheckoutContainer = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const CheckoutForm = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: ${props => props.theme.shadows.small};
`;

const FormSection = styled.div`
  margin-bottom: 2.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eee;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

const PaymentMethods = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const PaymentMethod = styled.label`
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid ${props => props.$isSelected ? props.theme.colors.gold : '#eee'};
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.$isSelected ? 'rgba(128, 90, 41, 0.05)' : 'white'};
  
  &:hover {
    border-color: ${props => props.theme.colors.gold};
  }
  
  input {
    margin-right: 1rem;
  }
`;

const PaymentIcon = styled.span`
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: ${props => props.theme.colors.lightGrey};
  border-radius: 50%;
  
  svg {
    color: ${props => props.theme.colors.black};
  }
`;

const PaymentInfo = styled.div`
  flex: 1;
`;

const PaymentTitle = styled.h4`
  margin-bottom: 0.25rem;
`;

const PaymentDescription = styled.p`
  font-size: 0.85rem;
  color: #666;
`;

const OrderSummaryCard = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: ${props => props.theme.shadows.small};
  position: sticky;
  top: 7rem;
`;

const OrderSummaryTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eee;
`;

const SummaryItems = styled.div`
  margin-bottom: 1.5rem;
  max-height: 250px;
  overflow-y: auto;
`;

const SummaryItem = styled.div`
  display: flex;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 5px;
  overflow: hidden;
  margin-right: 1rem;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemTitle = styled.h4`
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const ItemPrice = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  
  span:last-child {
    font-weight: 500;
  }
`;

const SummaryTotal = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  
  &:last-child {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #eee;
    font-weight: 700;
    font-size: 1.1rem;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: ${props => props.theme.colors.gold};
  margin-bottom: 1rem;
  
  svg {
    margin-right: 0.5rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
  }
`;

const CheckoutPage = () => {  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { cartItems, totalPrice, clearCart } = useCart();
  const { addNotification } = useNotification();
    // Checkout steps
  const [activeStep, setActiveStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  
  // Form state
  const [shippingForm, setShippingForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    islandName: '',
    postalCode: '',
    saveAddress: true
  });
    // Payment state
  const [paymentMethod, setPaymentMethod] = useState('bankTransfer');
  const [paymentResult, setPaymentResult] = useState(null);
  
  // Validation & error state
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Order calculation
  const subtotal = totalPrice;
  const shippingCost = 0; // Free shipping for now
  const total = subtotal + shippingCost;
  
  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
    
    // Redirect if user is not logged in
    if (!isAuthenticated && !isSubmitting) {
      navigate('/login?redirect=/checkout');
    }
  }, [cartItems, isAuthenticated, navigate, isSubmitting]);
  
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setShippingForm({
      ...shippingForm,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear errors when typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const handlePaymentSelect = (method) => {
    setPaymentMethod(method);
  };
  
  const validateForm = () => {
    const errors = {};
    
    // Required fields validation
    if (!shippingForm.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!shippingForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(shippingForm.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!shippingForm.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{7,15}$/.test(shippingForm.phone.replace(/\s+/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!shippingForm.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!shippingForm.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!shippingForm.islandName.trim()) {
      errors.islandName = 'Island name is required';
    }
    
    if (!shippingForm.postalCode.trim()) {
      errors.postalCode = 'Postal code is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('You need to be logged in to complete your order.');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare order data
      const orderData = {
        products: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: {
          street: shippingForm.address,
          city: shippingForm.city,
          island: shippingForm.islandName,
          postalCode: shippingForm.postalCode,
        },
        paymentMethod,
        totalPrice: total,
        ...(paymentResult && { paymentResult })
      };
      
      let orderId;
      try {
        // Call the API to create the order
        const response = await createOrder(orderData);
        orderId = response.data._id;
        
        // If bank transfer with receipt file, upload the receipt
        if (paymentMethod === 'bankTransfer' && paymentResult?.receiptFile) {
          try {
            await uploadReceipt(orderId, paymentResult.receiptFile);
            addNotification({ 
              message: 'Order created and receipt uploaded successfully!', 
              type: 'success' 
            });
          } catch (receiptError) {
            console.error('Error uploading receipt:', receiptError);
            addNotification({ 
              message: 'Order created but receipt upload failed. You can upload it later from your profile.', 
              type: 'warning' 
            });
          }
        }
        
        // If the user chose to save their address, we would save it to their profile here
        if (shippingForm.saveAddress) {
          try {
            // In production, we would call an API to save the address
            // await updateUserProfile({ shippingAddress: orderData.shippingAddress }, token);
            console.log('Saving address to user profile...');
          } catch (profileError) {
            console.error('Error saving address to profile:', profileError);
            // Non-critical, we can continue
          }
        }
        
        // Success! Clear cart and redirect to confirmation
        clearCart();
        if (!paymentResult?.receiptFile) {
          addNotification({ message: 'Order placed successfully!', type: 'success' });
        }
        navigate('/checkout/confirmation', { 
          state: { 
            orderNumber: orderId,
            total,
            paymentMethod,
            receiptUploaded: paymentMethod === 'bankTransfer' && paymentResult?.receiptFile ? true : false
          }
        });
      } catch (error) {
        console.error('Error creating order:', error);
        const errorMsg = error.response?.data?.message || 'Failed to create your order. Please try again.';
        setErrorMessage(errorMsg);
        addNotification({ message: errorMsg, type: 'error' });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error processing order:', error);
      const errorMsg = 'There was a problem processing your order. Please try again.';
      setErrorMessage(errorMsg);
      addNotification({ message: errorMsg, type: 'error' });
      setIsSubmitting(false);
    }
  };
  // Handle step navigation
  const nextStep = () => {
    if (activeStep === 1 && !validateShippingForm()) {
      return;
    }
    
    setActiveStep(activeStep + 1);
  };
  
  const prevStep = () => {
    setActiveStep(activeStep - 1);
  };
  
  // Validate just the shipping form
  const validateShippingForm = () => {
    const errors = {};
    
    // Required fields validation
    if (!shippingForm.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!shippingForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(shippingForm.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!shippingForm.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{7,15}$/.test(shippingForm.phone.replace(/\s+/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!shippingForm.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!shippingForm.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!shippingForm.islandName.trim()) {
      errors.islandName = 'Island name is required';
    }
    
    if (!shippingForm.postalCode.trim()) {
      errors.postalCode = 'Postal code is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle payment completion
  const handlePaymentComplete = (result) => {
    setPaymentResult(result);
    setActiveStep(3); // Move to review step
  };
  
  // Handle payment error
  const handlePaymentError = (error) => {
    setErrorMessage(`Payment failed: ${error}`);
  };

  return (
    <PageContainer>
      <BackLink to="/cart">
        <FaArrowLeft /> Back to Cart
      </BackLink>
      
      <PageHeader>
        <PageTitle>Checkout</PageTitle>
      </PageHeader>
      
      {/* Checkout Steps Indicator */}
      <CheckoutSteps activeStep={activeStep} />
      
      {errorMessage && (
        <ErrorMessage>
          <FaExclamationCircle />
          <span>{errorMessage}</span>
        </ErrorMessage>
      )}
      
      <form onSubmit={(e) => e.preventDefault()}>
        <CheckoutContainer>
          <div>
            {/* Step 1: Shipping Information */}
            {activeStep === 1 && (
              <CheckoutForm>
                <FormSection>
                  <SectionTitle>Shipping Information</SectionTitle>
                  <FormInput
                    label="Full Name"
                    type="text"
                    name="fullName"
                    value={shippingForm.fullName}
                    onChange={handleInputChange}
                    error={formErrors.fullName}
                    required
                  />
                  
                  <FormGrid>
                    <FormInput
                      label="Email Address"
                      type="email"
                      name="email"
                      value={shippingForm.email}
                      onChange={handleInputChange}
                      error={formErrors.email}
                      required
                    />
                    
                    <FormInput
                      label="Phone Number"
                      type="tel"
                      name="phone"
                      value={shippingForm.phone}
                      onChange={handleInputChange}
                      error={formErrors.phone}
                      required
                      helpText="Include country code (e.g., +960)"
                    />
                  </FormGrid>
                  
                  <FormInput
                    label="Address"
                    type="text"
                    name="address"
                    value={shippingForm.address}
                    onChange={handleInputChange}
                    error={formErrors.address}
                    placeholder="House/Building name, street"
                    required
                  />
                  
                  <FormGrid>
                    <FormInput
                      label="City"
                      type="text"
                      name="city"
                      value={shippingForm.city}
                      onChange={handleInputChange}
                      error={formErrors.city}
                      required
                    />
                    
                    <FormInput
                      label="Island Name"
                      type="text"
                      name="islandName"
                      value={shippingForm.islandName}
                      onChange={handleInputChange}
                      error={formErrors.islandName}
                      required
                    />
                  </FormGrid>
                  
                  <FormInput
                    label="Postal Code"
                    type="text"
                    name="postalCode"
                    value={shippingForm.postalCode}
                    onChange={handleInputChange}
                    error={formErrors.postalCode}
                    required
                  />
                  
                  <FormCheckbox
                    label="Save this address for future orders"
                    name="saveAddress"
                    checked={shippingForm.saveAddress}
                    onChange={handleInputChange}
                  />
                  
                  <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                    <Button 
                      variant="primary" 
                      onClick={nextStep}
                    >
                      Continue to Payment <FaChevronRight style={{ marginLeft: '0.5rem' }} />
                    </Button>
                  </div>
                </FormSection>
              </CheckoutForm>
            )}
            
            {/* Step 2: Payment Method */}
            {activeStep === 2 && (
              <CheckoutForm>
                <FormSection>
                  <SectionTitle>Payment Method</SectionTitle>                  <PaymentMethods>
                    <PaymentMethod $isSelected={paymentMethod === 'bankTransfer'}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="bankTransfer" 
                        checked={paymentMethod === 'bankTransfer'}
                        onChange={() => handlePaymentSelect('bankTransfer')}
                      />
                      <PaymentIcon>
                        <FaMoneyBillWave />
                      </PaymentIcon>
                      <PaymentInfo>
                        <PaymentTitle>Bank Transfer</PaymentTitle>
                        <PaymentDescription>Pay via bank transfer with receipt upload</PaymentDescription>
                      </PaymentInfo>
                    </PaymentMethod>
                    
                    <PaymentMethod $isSelected={paymentMethod === 'cashOnDelivery'}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cashOnDelivery" 
                        checked={paymentMethod === 'cashOnDelivery'}
                        onChange={() => handlePaymentSelect('cashOnDelivery')}
                      />
                      <PaymentIcon>
                        <FaCreditCard />
                      </PaymentIcon>
                      <PaymentInfo>
                        <PaymentTitle>Cash On Delivery</PaymentTitle>
                        <PaymentDescription>Pay when your order arrives</PaymentDescription>
                      </PaymentInfo>
                    </PaymentMethod>
                  </PaymentMethods>
                </FormSection>
                
                <FormSection>
                  <PaymentComponent 
                    paymentMethod={paymentMethod}
                    onPaymentComplete={handlePaymentComplete}
                    onPaymentError={handlePaymentError}
                  />
                </FormSection>
                
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                  <Button 
                    variant="secondary" 
                    onClick={prevStep}
                  >
                    <FaChevronLeft style={{ marginRight: '0.5rem' }} /> Back to Shipping
                  </Button>
                </div>
              </CheckoutForm>
            )}
            
            {/* Step 3: Order Review */}
            {activeStep === 3 && (
              <CheckoutForm>
                <FormSection>
                  <SectionTitle>Order Review</SectionTitle>
                  
                  <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Shipping Address</h4>
                    <p>
                      {shippingForm.fullName}<br />
                      {shippingForm.address}<br />
                      {shippingForm.city}, {shippingForm.islandName}<br />
                      {shippingForm.postalCode}<br />
                      Phone: {shippingForm.phone}
                    </p>
                  </div>
                  
                  <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Payment Method</h4>
                    <p>
                      {paymentMethod === 'card' ? 'Credit/Debit Card' : 'Bank Transfer'}
                      {paymentResult && paymentMethod === 'card' && (
                        <span> ending in {paymentResult.last4}</span>
                      )}
                    </p>
                  </div>
                  
                  <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                      variant="secondary" 
                      onClick={prevStep}
                    >
                      <FaChevronLeft style={{ marginRight: '0.5rem' }} /> Back to Payment
                    </Button>
                    
                    <Button 
                      variant="primary" 
                      onClick={handleSubmitOrder}
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : 'Place Order'}
                    </Button>
                  </div>
                </FormSection>
              </CheckoutForm>
            )}
          </div>
          
          <div>
            <OrderSummaryCard>
              <OrderSummaryTitle>Order Summary</OrderSummaryTitle>
              <SummaryItems>
                {cartItems.map((item) => (
                  <SummaryItem key={item._id}>
                    <ItemImage>
                      <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} />
                    </ItemImage>
                    <ItemInfo>
                      <ItemTitle>{item.name}</ItemTitle>
                      <ItemPrice>
                        <span>Qty: {item.quantity}</span>
                        <span>MVR {(item.price * item.quantity).toFixed(2)}</span>
                      </ItemPrice>
                    </ItemInfo>
                  </SummaryItem>
                ))}
              </SummaryItems>
              
              <SummaryTotal>
                <SummaryRow>
                  <span>Subtotal</span>
                  <span>MVR {subtotal.toFixed(2)}</span>
                </SummaryRow>
                <SummaryRow>
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `MVR ${shippingCost.toFixed(2)}`}</span>
                </SummaryRow>
                <SummaryRow>
                  <span>Total</span>
                  <span>MVR {total.toFixed(2)}</span>
                </SummaryRow>
              </SummaryTotal>
            </OrderSummaryCard>
          </div>
        </CheckoutContainer>
      </form>
    </PageContainer>
  );
};

export default CheckoutPage;
