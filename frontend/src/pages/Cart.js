import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaTrash, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import { imgErrorProps } from '../utils/imageUtils';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 7rem 1.5rem 5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: 6rem 1.5rem 3rem;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const PageTitle = styled.h1`
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background-color: ${props => props.theme.colors.gold};
  }
`;

const CartSection = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const CartItemsList = styled.div`
  background-color: ${props => props.theme.colors.white};
  border-radius: 10px;
  box-shadow: ${props => props.theme.shadows.small};
  padding: 1.5rem;
`;

const CartItem = styled(motion.div)`
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 1.5rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 80px 1fr;
    gap: 1rem;
    position: relative;
    padding-bottom: 3.5rem;
  }
`;

const CartItemImage = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 5px;
`;

const CartItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CartItemTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const CartItemMeta = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const CartItemPrice = styled.div`
  font-weight: bold;
  color: ${props => props.theme.colors.gold};
`;

const CartItemActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    position: absolute;
    bottom: 1.5rem;
    right: 0;
    width: 100%;
    justify-content: space-between;
  }
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  margin-right: 1rem;
  
  button {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f9f9f9;
    border: 1px solid #e0e0e0;
    font-size: 1rem;
    cursor: pointer;
    
    &:first-child {
      border-radius: 4px 0 0 4px;
    }
    
    &:last-child {
      border-radius: 0 4px 4px 0;
    }
    
    &:hover {
      background-color: #f0f0f0;
    }
    
    &:focus {
      outline: none;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  span {
    width: 40px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  transition: ${props => props.theme.transitions.short};
  
  &:hover {
    color: ${props => props.theme.colors.error};
  }
`;

const CartSummary = styled.div`
  background-color: ${props => props.theme.colors.white};
  border-radius: 10px;
  box-shadow: ${props => props.theme.shadows.small};
  padding: 1.5rem;
  align-self: start;
`;

const SummaryTitle = styled.h3`
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const SummaryTotal = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const SummaryActions = styled.div`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EmptyCartContent = styled.div`
  text-align: center;
  padding: 4rem 1rem;
  
  svg {
    font-size: 4rem;
    color: #ddd;
    margin-bottom: 1.5rem;
  }
  
  h2 {
    margin-bottom: 1rem;
    color: #666;
  }
  
  p {
    color: #888;
    margin-bottom: 2rem;
  }
`;

const ContinueShopping = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 2rem;
  
  a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${props => props.theme.colors.gold};
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const PromoCode = styled.div`
  display: flex;
  margin-top: 1.5rem;
  gap: 0.5rem;
  
  input {
    flex: 1;
    padding: 0.7rem 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 0.9rem;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.gold};
    }
  }
  
  button {
    white-space: nowrap;
  }
`;

const SubtotalText = styled.div`
  color: ${props => props.theme.colors.gold};
  font-weight: bold;
`;

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  
  // Calculate cart totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = 0; // Free shipping for all orders
  const total = subtotal + shippingCost - discountAmount;
  
  const handleQuantityChange = (itemId, change) => {
    const item = cartItems.find(item => item._id === itemId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity >= 1 && newQuantity <= 10) {
        updateQuantity(itemId, newQuantity);
      }
    }
  };
  
  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };
  
  const handleCheckout = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
  };
  
  const handleApplyPromo = () => {
    // Reset previous messages
    setPromoError('');
    setPromoSuccess('');
    
    // Simple promo code validation
    if (promoCode.trim() === '') {
      setPromoError('Please enter a promo code');
      return;
    }
    
    // Mock promo code validation
    if (promoCode.toUpperCase() === 'WELCOME10') {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      setPromoSuccess('Promo code applied successfully!');
      setPromoCode('');
    } else {
      setPromoError('Invalid promo code');
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Your Cart</PageTitle>
      </PageHeader>
      
      {cartItems.length > 0 ? (
        <CartSection>
          <CartItemsList>
            <AnimatePresence>
              {cartItems.map(item => (
                <CartItem
                  key={item._id || item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CartItemImage src={item.image} alt={item.name || item.title} {...imgErrorProps} />
                  
                  <CartItemDetails>
                    <div>
                      <CartItemTitle>{item.name || item.title}</CartItemTitle>
                      {item.frequency && (
                        <CartItemMeta>
                          Frequency: {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
                        </CartItemMeta>
                      )}
                      <CartItemMeta>
                        MVR {item.price} × {item.quantity}
                      </CartItemMeta>
                    </div>
                    <CartItemPrice>MVR {(item.price * item.quantity).toFixed(2)}</CartItemPrice>
                  </CartItemDetails>
                  
                  <CartItemActions>
                    <QuantitySelector>
                      <button 
                        onClick={() => handleQuantityChange(item._id, -1)} 
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item._id, 1)}
                        disabled={item.quantity >= 10}
                      >
                        +
                      </button>
                    </QuantitySelector>
                    <RemoveButton onClick={() => handleRemoveItem(item._id)} aria-label="Remove item">
                      <FaTrash />
                    </RemoveButton>
                  </CartItemActions>
                </CartItem>
              ))}
            </AnimatePresence>
            
            <ContinueShopping>
              <Link to="/products">
                <FaArrowLeft />
                Continue Shopping
              </Link>
            </ContinueShopping>
          </CartItemsList>
          
          <CartSummary>
            <SummaryTitle>Order Summary</SummaryTitle>
            <SummaryRow>
              <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
              <SubtotalText>MVR {subtotal.toFixed(2)}</SubtotalText>
            </SummaryRow>
            <SummaryRow>
              <span>Shipping</span>
              <span>
                {shippingCost === 0 ? 'Free' : `MVR ${shippingCost.toFixed(2)}`}
              </span>
            </SummaryRow>
            {discountAmount > 0 && (
              <SummaryRow>
                <span>Discount</span>
                <span style={{ color: '#ef4444' }}>- MVR {discountAmount.toFixed(2)}</span>
              </SummaryRow>
            )}
            <SummaryTotal>
              <span>Total</span>
              <span>MVR {total.toFixed(2)}</span>
            </SummaryTotal>
            
            <PromoCode>
              <input 
                type="text" 
                placeholder="Promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <Button variant="secondary" small onClick={handleApplyPromo}>
                Apply
              </Button>
            </PromoCode>
            
            {promoError && (
              <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                {promoError}
              </p>
            )}
            
            {promoSuccess && (
              <p style={{ color: 'green', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                {promoSuccess}
              </p>
            )}
            
            <SummaryActions>
              <Button variant="primary" onClick={handleCheckout}>
                Proceed to Checkout <FaArrowRight style={{ marginLeft: '0.5rem' }} />
              </Button>
            </SummaryActions>
          </CartSummary>
        </CartSection>
      ) : (
        <EmptyCartContent>
          <FaShoppingCart />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <Button variant="primary" as={Link} to="/products">
            Start Shopping
          </Button>
        </EmptyCartContent>
      )}
    </PageContainer>
  );
};

export default Cart;
