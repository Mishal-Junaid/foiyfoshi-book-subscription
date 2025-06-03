import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ButtonWrapper = styled(motion.button).withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) => {
    // Filter out our custom props
    if (['variant', 'icon', 'loading', 'small', 'fullWidth'].includes(prop)) {
      return false;
    }
    // Use default validator for all other props, with fallback
    if (typeof defaultValidatorFn === 'function') {
      return defaultValidatorFn(prop);
    }
    // Fallback: allow all standard HTML props
    return !prop.startsWith('$');
  }
})`
  display: inline-block;
  padding: ${props => props.$small ? '0.5rem 1rem' : '0.8rem 1.5rem'};
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.short};
  font-family: ${props => props.theme.fonts.body};
  font-size: ${props => props.$small ? '0.9rem' : '1rem'};
  text-align: center;
  border: none;
  outline: none;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  
  /* Primary button */
  background-color: ${props => props.$variant === 'primary' 
    ? props.theme.colors.gold 
    : props.$variant === 'secondary'
    ? 'transparent'
    : props.$variant === 'dark'
    ? props.theme.colors.black
    : props.$variant === 'light'
    ? props.theme.colors.white
    : props.$variant === 'danger'
    ? props.theme.colors.error
    : props.$variant === 'success'
    ? '#4caf50'
    : props.theme.colors.gold};
  
  color: ${props => props.$variant === 'primary' 
    ? props.theme.colors.white 
    : props.$variant === 'secondary'
    ? props.theme.colors.gold
    : props.$variant === 'dark'
    ? props.theme.colors.white
    : props.$variant === 'light'
    ? props.theme.colors.black
    : props.$variant === 'danger'
    ? props.theme.colors.white
    : props.$variant === 'success'
    ? props.theme.colors.white
    : props.theme.colors.white};
  
  border: ${props => props.$variant === 'secondary' 
    ? `2px solid ${props.theme.colors.gold}` 
    : 'none'};
  
  &:hover {
    background-color: ${props => props.$variant === 'primary' 
      ? props.theme.colors.lightGold 
      : props.$variant === 'secondary'
      ? props.theme.colors.gold
      : props.$variant === 'dark'
      ? '#333333'
      : props.$variant === 'light'
      ? props.theme.colors.lightGrey
      : props.$variant === 'danger'
      ? '#f44336'
      : props.$variant === 'success'
      ? '#45a049'
      : props.theme.colors.lightGold};
    
    color: ${props => props.$variant === 'secondary' && props.theme.colors.white};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.small};
  }
  
  &:disabled {
    background-color: #cccccc;
    color: #666666;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const LoadingSpinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Create a motion component that handles the Framer Motion props
const MotionButton = ({ whileTap, variant, small, fullWidth, icon, loading, ...props }) => {
  return (
    <ButtonWrapper 
      whileTap={whileTap} 
      $variant={variant}
      $small={small}
      $fullWidth={fullWidth}
      {...props} 
    />
  );
};

const Button = ({ 
  children, 
  variant = 'primary', 
  type = 'button', 
  onClick, 
  disabled = false,
  loading = false,
  fullWidth = false,
  small = false,
  icon,
  as,
  ...props 
}) => {
  // For Link or other components, we need a different approach to avoid DOM warnings
  if (as) {
    // Don't pass motion props when rendering as another component
    return (
      <ButtonWrapper
        as={as}
        $variant={variant}
        onClick={onClick}
        disabled={disabled || loading}
        $fullWidth={fullWidth}
        $small={small}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {icon && <span style={{ marginRight: '0.5rem' }}>{icon}</span>}
        {children}
      </ButtonWrapper>
    );
  }
  
  // For regular buttons, use the motion features
  return (
    <MotionButton
      type={type}
      variant={variant}
      onClick={onClick}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      small={small}
      icon={icon}
      loading={loading}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {icon && <span style={{ marginRight: '0.5rem' }}>{icon}</span>}
      {children}
    </MotionButton>
  );
};

export default Button;
