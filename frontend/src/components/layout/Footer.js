import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaFacebookF, FaTwitter, FaInstagram, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { subscribeToNewsletter } from '../../services/newsletterService';
import { useContent } from '../../context/ContentContext';

const FooterContainer = styled.footer`
  background-color: ${props => props.theme.colors.black};
  color: ${props => props.theme.colors.white};
  padding: 4rem 0 2rem;
  margin-top: 0;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FooterSection = styled.div`
  h3 {
    color: ${props => props.theme.colors.mediumGold};
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
    position: relative;
    
    &:after {
      content: '';
      position: absolute;
      width: 50px;
      height: 2px;
      background-color: ${props => props.theme.colors.mediumGold};
      bottom: -8px;
      left: 0;
    }
  }
`;

const FooterLogo = styled(Link)`
  color: ${props => props.theme.colors.white};
  display: block;
  margin-bottom: 1rem;
  text-decoration: none;
  
  img {
    height: 120px;
    width: auto;
    filter: brightness(0) invert(1);
    transition: all 0.3s ease;
    
    &:hover {
      filter: brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(25deg);
      transform: scale(1.05);
    }
  }
`;

const FooterText = styled.p`
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  
  li {
    margin-bottom: 1rem;
    
    a {
      color: ${props => props.theme.colors.white};
      text-decoration: none;
      transition: ${props => props.theme.transitions.short};
      
      &:hover {
        color: ${props => props.theme.colors.mediumGold};
        padding-left: 5px;
      }
    }
  }
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  
  .icon {
    margin-right: 10px;
    color: ${props => props.theme.colors.mediumGold};
  }
`;

const SocialLinks = styled.div`
  display: flex;
  margin-top: 1.5rem;
  
  a {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    color: ${props => props.theme.colors.white};
    margin-right: 1rem;
    transition: ${props => props.theme.transitions.short};
    
    &:hover {
      background: ${props => props.theme.colors.mediumGold};
      color: ${props => props.theme.colors.black};
      transform: translateY(-3px);
    }
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  p {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
  }
`;

const NewsletterForm = styled.form`
  display: flex;
  margin-top: 1rem;
`;

const EmailInput = styled.input`
  flex: 1;
  padding: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: ${props => props.theme.colors.white};
  border-radius: 4px 0 0 4px;
  outline: none;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SubscribeButton = styled.button`
  padding: 10px 15px;
  border: none;
  background: ${props => props.theme.colors.mediumGold};
  color: ${props => props.theme.colors.black};
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-weight: bold;
  transition: ${props => props.theme.transitions.short};
  
  &:hover {
    background: ${props => props.theme.colors.paleGold};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const NewsletterMessage = styled.div`
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &.success {
    background: rgba(76, 175, 80, 0.2);
    color: #4caf50;
  }
  
  &.error {
    background: rgba(244, 67, 54, 0.2);
    color: #f44336;
  }
`;

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { getContentBySection } = useContent();

  // Get footer information from content management
  const getFooterInfo = () => {
    const footerContent = getContentBySection('footer');
    if (footerContent && footerContent.content) {
      try {
        const footerData = JSON.parse(footerContent.content);
        return footerData;
      } catch (e) {
        console.error('Error parsing footer content:', e);
      }
    }
    
    // Default footer information
    return {
      companyName: 'FoiyFoshi',
      tagline: 'The Maldives\' first book subscription box',
      description: 'delivering curated reading experiences to your doorstep.',
      address: '123 Boduthakurufaanu Magu, Malé, Maldives',
      phone: '+960 777-7777',
      email: 'info@foiyfoshi.mv'
    };
  };

  const footerInfo = getFooterInfo();

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await subscribeToNewsletter(email);
      setMessage({ type: 'success', text: 'Successfully subscribed to newsletter!' });
      setEmail('');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to subscribe. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterLogo to="/">
            <img src="/logo.svg" alt="FoiyFoshi Logo" />
          </FooterLogo>
          <FooterText>
            {footerInfo.tagline} {footerInfo.description}
          </FooterText>
          <SocialLinks>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
          </SocialLinks>
        </FooterSection>
        
        <FooterSection>
          <h3>Quick Links</h3>
          <FooterLinks>
            <li>
              <Link to="/products">Products</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/contact">Contact Us</Link>
            </li>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <h3>Contact Us</h3>
          <ContactInfo>
            <FaMapMarkerAlt className="icon" />
            <span>{footerInfo.address}</span>
          </ContactInfo>
          <ContactInfo>
            <FaPhoneAlt className="icon" />
            <span>{footerInfo.phone}</span>
          </ContactInfo>
          <ContactInfo>
            <FaEnvelope className="icon" />
            <span>{footerInfo.email}</span>
          </ContactInfo>
        </FooterSection>
        
        <FooterSection>
          <h3>Newsletter</h3>
          <FooterText>
            Subscribe to our newsletter for the latest updates on new book boxes and promotions.
          </FooterText>
          <NewsletterForm onSubmit={handleNewsletterSubmit}>
            <EmailInput 
              type="email" 
              placeholder="Your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <SubscribeButton type="submit" disabled={isLoading}>
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </SubscribeButton>
          </NewsletterForm>
          {message.text && (
            <NewsletterMessage className={message.type}>
              {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
              {message.text}
            </NewsletterMessage>
          )}
        </FooterSection>
      </FooterContent>
      
      <FooterBottom>
        <p>&copy; {new Date().getFullYear()} {footerInfo.companyName}. All rights reserved.</p>
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;
