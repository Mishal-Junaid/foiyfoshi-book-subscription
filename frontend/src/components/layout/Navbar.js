import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaUserCircle, FaBars, FaTimes, FaUser, FaSignOutAlt, FaCog, FaShoppingBag, FaHome, FaBox, FaEnvelope, FaInfoCircle } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: ${props => props.$scrolled ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.9)'};
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  transition: all 0.3s ease;
  border-bottom: ${props => props.$scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
  box-shadow: ${props => props.$scrolled ? '0 2px 20px rgba(0, 0, 0, 0.3)' : 'none'};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: 0.75rem 1rem;
  }
`;

const Logo = styled(Link)`
  color: ${props => props.theme.colors.white};
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  img {
    height: 120px;
    width: auto;
    filter: brightness(0) invert(1);
    transition: all 0.3s ease;
    
    &:hover {
      filter: brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(25deg);
    }
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    img {
      height: 100px;
    }
  }
`;

const DesktopNavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: ${props => props.theme.colors.white};
  font-weight: 500;
  position: relative;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: 0;
    left: 50%;
    background: linear-gradient(90deg, ${props => props.theme.colors.mediumGold}, ${props => props.theme.colors.gold});
    transition: all 0.3s ease;
    transform: translateX(-50%);
  }
  
  &:hover {
    color: ${props => props.theme.colors.mediumGold};
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:hover::after {
    width: 80%;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CartIcon = styled(Link)`
  color: ${props => props.theme.colors.white};
  font-size: 1.2rem;
  cursor: pointer;
  position: relative;
  padding: 0.6rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  
  &:hover {
    color: ${props => props.theme.colors.mediumGold};
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }
`;

const CartCount = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  background: linear-gradient(135deg, ${props => props.theme.colors.mediumGold}, ${props => props.theme.colors.gold});
  color: ${props => props.theme.colors.black};
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.7rem;
  font-weight: bold;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const UserMenuContainer = styled.div`
  position: relative;
`;

const UserButton = styled.div`
  color: ${props => props.theme.colors.white};
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.6rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 40px;
  height: 40px;
  
  &:hover {
    color: ${props => props.theme.colors.mediumGold};
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    gap: 0;
    width: 40px;
    
    .username {
      display: none;
    }
  }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${props => props.theme.colors.white};
  width: 260px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
  z-index: 1001;
  margin-top: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const DropdownHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  
  .name {
    font-weight: bold;
    color: ${props => props.theme.colors.black};
    margin-bottom: 0.25rem;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .email {
    font-size: 0.8rem;
    color: ${props => props.theme.colors.grey};
    word-wrap: break-word;
    overflow-wrap: break-word;
    line-height: 1.3;
  }
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: ${props => props.theme.colors.black};
  transition: all 0.2s ease;
  text-decoration: none;
  
  &:hover {
    background: ${props => props.theme.colors.lightGrey};
    color: ${props => props.theme.colors.mediumGold};
    padding-left: 2rem;
  }
  
  .icon {
    font-size: 0.9rem;
    width: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1.5rem;
  color: ${props => props.theme.colors.error};
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  transition: all 0.2s ease;
  border-top: 1px solid #f0f0f0;
  margin-top: 0.5rem;
  
  &:hover {
    background: rgba(239, 68, 68, 0.1);
    padding-left: 2rem;
  }
  
  .icon {
    font-size: 0.9rem;
    width: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileMenuButton = styled.div`
  display: none;
  color: ${props => props.theme.colors.white};
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.6rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${props => props.theme.colors.mediumGold};
    transform: scale(1.05);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: flex;
  }
`;

const MobileMenuOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1001;
  backdrop-filter: blur(5px);
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  z-index: 1002;
  box-shadow: 5px 0 25px rgba(0, 0, 0, 0.3);
`;

const MobileMenuHeader = styled.div`
  padding: 0 2rem 2rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
  
  .logo {
    margin-bottom: 1rem;
    
    img {
      height: 90px;
      width: auto;
      filter: brightness(0) invert(1);
    }
  }
  
  .user-info {
    color: ${props => props.theme.colors.white};
    font-size: 0.9rem;
    
    .name {
      font-weight: 500;
      margin-bottom: 0.25rem;
    }
    
    .email {
      color: ${props => props.theme.colors.grey};
      font-size: 0.8rem;
    }
  }
`;

const CloseButton = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: ${props => props.theme.colors.white};
  font-size: 1.3rem;
  cursor: pointer;
  padding: 0.6rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${props => props.theme.colors.mediumGold};
    transform: scale(1.05);
  }
`;

const MobileNavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: ${props => props.theme.colors.white};
  padding: 1rem 2rem;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-left-color: ${props => props.theme.colors.mediumGold};
    color: ${props => props.theme.colors.mediumGold};
  }
  
  .icon {
    font-size: 1.1rem;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileLogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  text-align: left;
  padding: 1rem 2rem;
  color: ${props => props.theme.colors.error};
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background: rgba(239, 68, 68, 0.1);
    border-left-color: ${props => props.theme.colors.error};
  }
  
  .icon {
    font-size: 1.1rem;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const LoginButton = styled(Link)`
  color: ${props => props.theme.colors.white};
  background: linear-gradient(135deg, ${props => props.theme.colors.mediumGold}, ${props => props.theme.colors.gold});
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(133, 77, 14, 0.4);
  }
`;

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu-container') && !event.target.closest('.mobile-menu')) {
        setUserMenuOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setUserMenuOpen(false);
  };

  const handleUserMenuToggle = () => {
    setUserMenuOpen(!userMenuOpen);
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <NavbarContainer $scrolled={scrolled}>
        <Logo to="/">
          <img src="/logo.svg" alt="FoiyFoshi Logo" />
        </Logo>
        
        <DesktopNavLinks>
          <NavLink to="/"><FaHome className="icon" /> Home</NavLink>
          <NavLink to="/products"><FaBox className="icon" /> Products</NavLink>
          <NavLink to="/about"><FaInfoCircle className="icon" /> About</NavLink>
          <NavLink to="/contact"><FaEnvelope className="icon" /> Contact</NavLink>
        </DesktopNavLinks>
        
        <RightSection>
          <CartIcon to="/cart">
            <FaShoppingCart />
            {totalItems > 0 && <CartCount>{totalItems}</CartCount>}
          </CartIcon>
          
          {isAuthenticated ? (
            <UserMenuContainer className="user-menu-container">
              <UserButton onClick={handleUserMenuToggle}>
                <FaUserCircle />
                <span className="username">{user?.name?.split(' ')[0]}</span>
              </UserButton>
              <AnimatePresence>
                {userMenuOpen && (
                  <DropdownMenu
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DropdownHeader>
                      <div className="name">{user?.name}</div>
                      <div className="email">{user?.email}</div>
                    </DropdownHeader>
                    
                    {user?.role === 'admin' && (
                      <DropdownItem to="/admin">
                        <FaCog className="icon" />
                        Admin Dashboard
                      </DropdownItem>
                    )}
                    <DropdownItem to="/dashboard">
                      <FaUser className="icon" />
                      My Dashboard
                    </DropdownItem>
                    <DropdownItem to="/dashboard/orders">
                      <FaShoppingBag className="icon" />
                      My Orders
                    </DropdownItem>
                    <DropdownItem to="/dashboard/profile">
                      <FaCog className="icon" />
                      Profile Settings
                    </DropdownItem>
                    <LogoutButton onClick={handleLogout}>
                      <FaSignOutAlt className="icon" />
                      Logout
                    </LogoutButton>
                  </DropdownMenu>
                )}
              </AnimatePresence>
            </UserMenuContainer>
          ) : (
            <LoginButton to="/login">Login</LoginButton>
          )}
          
          <MobileMenuButton onClick={handleMobileMenuToggle}>
            <FaBars />
          </MobileMenuButton>
        </RightSection>
      </NavbarContainer>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <MobileMenuOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
            />
            <MobileMenu
              className="mobile-menu"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <CloseButton onClick={closeMobileMenu}>
                <FaTimes />
              </CloseButton>
              
              <MobileMenuHeader>
                <div className="logo">
                  <img src="/logo.svg" alt="FoiyFoshi Logo" />
                </div>
                {isAuthenticated && (
                  <div className="user-info">
                    <div className="name">{user?.name}</div>
                    <div className="email">{user?.email}</div>
                  </div>
                )}
              </MobileMenuHeader>
              
              <MobileNavLink to="/" onClick={closeMobileMenu}>
                <FaHome className="icon" />
                Home
              </MobileNavLink>
              <MobileNavLink to="/products" onClick={closeMobileMenu}>
                <FaBox className="icon" />
                Products
              </MobileNavLink>
              <MobileNavLink to="/about" onClick={closeMobileMenu}>
                <FaInfoCircle className="icon" />
                About
              </MobileNavLink>
              <MobileNavLink to="/contact" onClick={closeMobileMenu}>
                <FaEnvelope className="icon" />
                Contact
              </MobileNavLink>
              <MobileNavLink to="/cart" onClick={closeMobileMenu}>
                <FaShoppingCart className="icon" />
                Cart {totalItems > 0 && `(${totalItems})`}
              </MobileNavLink>
              
              {isAuthenticated ? (
                <>
                  <MobileNavLink to="/dashboard" onClick={closeMobileMenu}>
                    <FaUser className="icon" />
                    My Dashboard
                  </MobileNavLink>
                  <MobileNavLink to="/dashboard/orders" onClick={closeMobileMenu}>
                    <FaShoppingBag className="icon" />
                    My Orders
                  </MobileNavLink>
                  <MobileNavLink to="/dashboard/profile" onClick={closeMobileMenu}>
                    <FaCog className="icon" />
                    Profile Settings
                  </MobileNavLink>
                  {user?.role === 'admin' && (
                    <MobileNavLink to="/admin" onClick={closeMobileMenu}>
                      <FaCog className="icon" />
                      Admin Dashboard
                    </MobileNavLink>
                  )}
                  <MobileLogoutButton onClick={handleLogout}>
                    <FaSignOutAlt className="icon" />
                    Logout
                  </MobileLogoutButton>
                </>
              ) : (
                <MobileNavLink to="/login" onClick={closeMobileMenu}>
                  <FaUser className="icon" />
                  Login
                </MobileNavLink>
              )}
            </MobileMenu>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
