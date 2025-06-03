import React from 'react';
import styled from 'styled-components';
import { FaTruck, FaCreditCard, FaClipboardCheck } from 'react-icons/fa';

const StepsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    top: 2rem;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.theme.colors.lightGrey};
    z-index: 1;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    gap: 1rem;
    
    &:after {
      display: none;
    }
  }
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  width: 33.333%;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    width: 100%;
    flex-direction: row;
    gap: 1rem;
  }
`;

const StepCircle = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: ${props => 
    props.$active 
      ? props.theme.colors.gold 
      : props.$completed 
      ? props.theme.colors.success 
      : props.theme.colors.lightGrey};
  color: ${props => 
    props.$active || props.$completed 
      ? props.theme.colors.white 
      : props.theme.colors.darkGrey};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    margin-bottom: 0;
    width: 3rem;
    height: 3rem;
  }
`;

const StepLabel = styled.div`
  text-align: center;
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => props.$active ? props.theme.colors.black : props.theme.colors.darkGrey};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    text-align: left;
  }
`;

const CheckoutSteps = ({ activeStep }) => {
  return (
    <StepsContainer>
      <Step>
        <StepCircle $active={activeStep === 1} $completed={activeStep > 1}>
          {activeStep > 1 ? '✓' : <FaTruck />}
        </StepCircle>
        <StepLabel $active={activeStep === 1}>Shipping Information</StepLabel>
      </Step>
      
      <Step>
        <StepCircle $active={activeStep === 2} $completed={activeStep > 2}>
          {activeStep > 2 ? '✓' : <FaCreditCard />}
        </StepCircle>
        <StepLabel $active={activeStep === 2}>Payment Details</StepLabel>
      </Step>
      
      <Step>
        <StepCircle $active={activeStep === 3} $completed={activeStep > 3}>
          {activeStep > 3 ? '✓' : <FaClipboardCheck />}
        </StepCircle>
        <StepLabel $active={activeStep === 3}>Review Order</StepLabel>
      </Step>
    </StepsContainer>
  );
};

export default CheckoutSteps;
