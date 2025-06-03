import React, { useState } from 'react';
import { createDevAdmin } from '../services/authService';
import styled from 'styled-components';

const DevHelperContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #f44336;
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 9999;
  font-size: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  max-width: 200px;
`;

const DevButton = styled.button`
  background: white;
  color: #f44336;
  border: none;
  padding: 5px 10px;
  margin: 2px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const DevHelper = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleCreateAdmin = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await createDevAdmin();
      setMessage('✅ Admin created! Check console for details.');
      
      // Reload page to update auth state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setMessage('❌ Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleClearStorage = () => {
    localStorage.clear();
    setMessage('🗑️ Storage cleared! Reload page.');
  };

  const handleShowTokens = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('Current token:', token);
    console.log('Current user:', user);
    setMessage('📋 Check console for current auth data');
  };

  return (
    <DevHelperContainer>
      <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>
        🛠️ DEV TOOLS
      </div>
      
      <div>
        <DevButton onClick={handleCreateAdmin} disabled={loading}>
          {loading ? 'Creating...' : 'Create Admin'}
        </DevButton>
        
        <DevButton onClick={handleClearStorage}>
          Clear Storage
        </DevButton>
        
        <DevButton onClick={handleShowTokens}>
          Show Auth
        </DevButton>
      </div>
      
      {message && (
        <div style={{ marginTop: '5px', fontSize: '10px' }}>
          {message}
        </div>
      )}
    </DevHelperContainer>
  );
};

export default DevHelper; 