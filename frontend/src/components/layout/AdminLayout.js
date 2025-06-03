import React from 'react';
import styled from 'styled-components';

const AdminContainer = styled.div`
  padding: 10rem 2rem 2rem 2rem; /* Top padding accounts for fixed navbar with larger logo */
  min-height: 100vh;
  background-color: #f8f9fa;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: 8rem 1rem 2rem 1rem;
  }
`;

const AdminContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const AdminLayout = ({ children }) => {
  return (
    <AdminContainer>
      <AdminContent>
        {children}
      </AdminContent>
    </AdminContainer>
  );
};

export default AdminLayout; 