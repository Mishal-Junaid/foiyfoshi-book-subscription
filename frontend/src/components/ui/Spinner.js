import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${(props) => (props.$fullScreen ? '100vh' : '100px')};
`;

const SpinnerRing = styled.div`
  display: inline-block;
  width: ${(props) => props.size || '50px'};
  height: ${(props) => props.size || '50px'};
  
  &:after {
    content: " ";
    display: block;
    width: ${(props) => props.size || '50px'};
    height: ${(props) => props.size || '50px'};
    border-radius: 50%;
    border: 5px solid ${(props) => props.theme.colors.gold};
    border-color: ${(props) => props.theme.colors.gold} transparent ${(props) => props.theme.colors.gold} transparent;
    animation: ${spin} 1.2s linear infinite;
  }
`;

const Spinner = ({ fullScreen = false, size }) => {
  return (
    <SpinnerContainer $fullScreen={fullScreen}>
      <SpinnerRing size={size} />
    </SpinnerContainer>
  );
};

export default Spinner;
