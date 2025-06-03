import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaUser, 
  FaShoppingBag, 
  FaHeart, 
  FaAddressCard, 
  FaCreditCard,
  FaBars,
  FaTimes, 
  FaSignOutAlt 
} from 'react-icons/fa';

import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';

const DashboardContainer = styled.div`
  max-width: 1200px;
  min-height: 80vh;
  margin: 0 auto;
  padding: 11rem 1.5rem 5rem;
`;

const DashboardHeader = styled.div`
  margin-bottom: 2rem;
`;

const DashboardTitle = styled.h1`
  color: ${props => props.theme.colors.black};
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const DashboardSubtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const DashboardContent = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  width: 280px;
  background-color: white;
  border-radius: 10px;
  box-shadow: ${props => props.theme.shadows.medium};
  padding: 1.5rem;
  height: fit-content;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100%;
  }
`;

const SidebarMobileToggle = styled.button`
  display: none;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.theme.colors.black};
  
  svg {
    font-size: 1.2rem;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: flex;
  }
`;

const SidebarMenu = styled.nav`
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: ${props => (props.$isOpen ? 'block' : 'none')};
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: ${props => (props.$isOpen ? 'flex' : 'none')};
  }
`;

const UserAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.lightGrey};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.gold};
  font-size: 2rem;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`;

const UserName = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.2rem;
  text-align: center;
`;

const UserEmail = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
  text-align: center;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 5px;
  color: ${props => props.theme.colors.black};
  font-weight: 500;
  margin-bottom: 0.5rem;
  transition: ${props => props.theme.transitions.short};
  
  svg {
    color: ${props => props.theme.colors.gold};
  }
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &.active {
    background-color: ${props => props.theme.colors.gold};
    color: white;
    
    svg {
      color: white;
    }
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 5px;
  color: ${props => props.theme.colors.error};
  font-weight: 500;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  margin-top: 1.5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: ${props => (props.$isOpen ? 'flex' : 'none')};
  }
  
  svg {
    color: ${props => props.theme.colors.error};
  }
  
  &:hover {
    background-color: #fff1f1;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  background-color: white;
  border-radius: 10px;
  box-shadow: ${props => props.theme.shadows.medium};
  padding: 2rem;
`;

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Function to get the first character of first and last name for avatar
  const getInitials = () => {
    if (!user || !user.name) return 'U';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    } else {
      return nameParts[0][0];
    }
  };
  
  // Function to get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/dashboard/profile') return 'My Profile';
    if (path === '/dashboard/orders') return 'My Orders';
    if (path.includes('/dashboard/orders/')) return 'Order Details';
    if (path === '/dashboard/wishlist') return 'My Wishlist';
    if (path === '/dashboard/addresses') return 'My Addresses';
    if (path === '/dashboard/payment-methods') return 'Payment Methods';
    return 'Dashboard';
  };
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>{getPageTitle()}</DashboardTitle>
        <DashboardSubtitle>Manage your account and view your orders</DashboardSubtitle>
      </DashboardHeader>
      
      <DashboardContent>
        <Sidebar>
          <SidebarMobileToggle onClick={toggleSidebar}>
            {sidebarOpen ? (
              <>
                <FaTimes /> Close Menu
              </>
            ) : (
              <>
                <FaBars /> Menu
              </>
            )}
          </SidebarMobileToggle>
          
          <UserInfo $isOpen={sidebarOpen}>
            <UserAvatar>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                getInitials()
              )}
            </UserAvatar>
            <UserName>{user?.name || 'User'}</UserName>
            <UserEmail>{user?.email || 'user@example.com'}</UserEmail>
            <Button variant="secondary" size="small" as={NavLink} to="/dashboard/profile">
              Edit Profile
            </Button>
          </UserInfo>
          
          <SidebarMenu $isOpen={sidebarOpen}>
            <NavItem to="/dashboard" end>
              <FaUser /> Dashboard
            </NavItem>
            <NavItem to="/dashboard/profile">
              <FaUser /> My Profile
            </NavItem>
            <NavItem to="/dashboard/orders">
              <FaShoppingBag /> My Orders
            </NavItem>
            <NavItem to="/dashboard/wishlist">
              <FaHeart /> My Wishlist
            </NavItem>
            <NavItem to="/dashboard/addresses">
              <FaAddressCard /> My Addresses
            </NavItem>
            <NavItem to="/dashboard/payment-methods">
              <FaCreditCard /> Payment Methods
            </NavItem>
            
            <LogoutButton onClick={handleLogout} $isOpen={sidebarOpen}>
              <FaSignOutAlt /> Logout
            </LogoutButton>
          </SidebarMenu>
        </Sidebar>
        
        <ContentArea>
          <Outlet />
        </ContentArea>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default Dashboard;
