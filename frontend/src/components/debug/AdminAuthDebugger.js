import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  createDevAdminToken, 
  isUsingDevAdminToken, 
  clearDevAdminToken 
} from '../../utils/adminTokenHelper';

/**
 * A debug component for testing admin authentication without backend in development
 */
const AdminAuthDebugger = () => {
  const [isActive, setIsActive] = useState(isUsingDevAdminToken());
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;
  
  const handleToggleToken = () => {
    if (isActive) {
      clearDevAdminToken();
      setIsActive(false);
    } else {
      createDevAdminToken();
      setIsActive(true);
    }
  };
  
  return (
    <DebugContainer>
      <DebugHeader>Admin Auth Debugger</DebugHeader>
      <DebugContent>
        <StatusIndicator $active={isActive}>
          {isActive ? 'Using developer admin token ' : 'Admin token not active '}
        </StatusIndicator>
        <DebugButton onClick={handleToggleToken}>
          {isActive ? 'Disable Admin Token' : 'Enable Admin Token'}
        </DebugButton>
        <InfoText>
          This is a development tool that creates a special token for testing admin features.
          It will only work in development mode and with the backend configured to accept these tokens.
        </InfoText>
      </DebugContent>
    </DebugContainer>
  );
};

// Styled Components
const DebugContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
  background-color: #f9f9f9;
`;

const DebugHeader = styled.div`
  padding: 0.5rem 1rem;
  background-color: #f1f1f1;
  border-bottom: 1px solid #ddd;
  font-weight: bold;
  font-size: 0.9rem;
`;

const DebugContent = styled.div`
  padding: 1rem;
`;

// Using $active as a transient prop to fix styled-component warnings
const StatusIndicator = styled.div`
  padding: 0.5rem;
  margin-bottom: 1rem;
  font-weight: bold;
  background-color: ${props => props.$active ? '#e6f4ea' : '#fce8e8'};
  color: ${props => props.$active ? '#137333' : '#c53929'};
  border-radius: 4px;
  border: 1px solid ${props => props.$active ? '#b7e1cd' : '#f5c2c7'};
`;

const DebugButton = styled.button`
  background-color: #1a73e8;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  
  &:hover {
    background-color: #174ea6;
  }
`;

const InfoText = styled.p`
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #666;
`;

export default AdminAuthDebugger;
