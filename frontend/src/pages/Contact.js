import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaInstagram, FaFacebookSquare, FaTwitter } from 'react-icons/fa';

import Button from '../components/ui/Button';
import { FormInput, FormTextarea } from '../components/ui/FormElements';
import { useNotification } from '../components/ui/Notification';
import { useContent } from '../context/ContentContext';
import Spinner from '../components/ui/Spinner';
import { submitContactMessage } from '../services/contactService';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 12rem 1.5rem 5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: 10rem 1.5rem 3rem;
  }
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 30%;
    width: 40%;
    height: 4px;
    background-color: ${props => props.theme.colors.gold};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    font-size: 2rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.2rem;
  color: #666;
  max-width: 800px;
  margin: 2rem auto;
  line-height: 1.6;
`;

const ContactContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const ContactFormContainer = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: ${props => props.theme.shadows.small};
`;

const ContactForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormTitle = styled.h2`
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
`;

const ContactInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ContactInfo = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: ${props => props.theme.shadows.small};
`;

const InfoTitle = styled.h2`
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  
  svg {
    color: ${props => props.theme.colors.gold};
    font-size: 1.5rem;
    margin-top: 0.2rem;
  }
`;

const InfoText = styled.div`
  h4 {
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #666;
    line-height: 1.5;
  }
`;

const SocialMediaContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.lightGrey};
  color: ${props => props.theme.colors.black};
  font-size: 1.2rem;
  transition: ${props => props.theme.transitions.short};
  
  &:hover {
    background-color: ${props => props.theme.colors.gold};
    color: white;
    transform: translateY(-3px);
  }
`;

const SuccessMessage = styled(motion.div)`
  background-color: ${props => props.theme.colors.success};
  color: white;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  text-align: center;
`;

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { addNotification } = useNotification();
  const { loading: contentLoading, getContentBySection } = useContent();
  
  // Get content for different contact page sections
  const contactHeroContent = getContentBySection('contact-hero');
  const contactInfoContent = getContentBySection('contact-info');
  const contactFormContent = getContentBySection('contact-form');
  const businessHoursContent = getContentBySection('business-hours');
  
  // Parse contact information more intelligently
  const parseContactInfo = () => {
    if (!contactInfoContent?.content) {
      return {
        email: 'info@foiyfoshi.mv',
        phone: '+960 777-7777',
        address: 'FoiyFoshi Books\nChaandhanee Magu, Malé 20-02\nMaldives'
      };
    }
    
    const contentText = contactInfoContent.content;
    const lines = contentText.split('\n').map(line => line.trim()).filter(line => line);
    
    let email = 'info@foiyfoshi.mv';
    let phone = '+960 777-7777';
    let address = 'FoiyFoshi Books\nChaandhanee Magu, Malé 20-02\nMaldives';
    
    // Extract email (look for email pattern or Email: prefix)
    const emailLine = lines.find(line => 
      line.toLowerCase().startsWith('email:') || 
      line.includes('@')
    );
    if (emailLine) {
      const emailMatch = emailLine.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        email = emailMatch[1];
      }
    }
    
    // Extract phone (look for phone pattern or Phone: prefix)
    const phoneLine = lines.find(line => 
      line.toLowerCase().startsWith('phone:') || 
      line.match(/[+\d\s\-()]{8,}/)
    );
    if (phoneLine) {
      const phoneMatch = phoneLine.match(/[+\d\s\-()]{8,}/);
      if (phoneMatch) {
        phone = phoneMatch[0].trim();
      }
    }
    
    // Extract address (look for Address: prefix or remaining lines)
    const addressStartIndex = lines.findIndex(line => 
      line.toLowerCase().startsWith('address:')
    );
    
    if (addressStartIndex !== -1) {
      // Get address lines starting from Address: line
      let addressLines = lines.slice(addressStartIndex);
      // Remove "Address:" prefix from first line
      addressLines[0] = addressLines[0].replace(/^address:\s*/i, '');
      address = addressLines.filter(line => line).join('\n');
    } else {
      // If no "Address:" prefix, look for lines that aren't email or phone
      const nonContactLines = lines.filter(line => 
        !line.toLowerCase().startsWith('email:') &&
        !line.toLowerCase().startsWith('phone:') &&
        !line.includes('@') &&
        !line.match(/[+\d\s\-()]{8,}/)
      );
      if (nonContactLines.length > 0) {
        address = nonContactLines.join('\n');
      }
    }
    
    return { email, phone, address };
  };

  const contactInfo = parseContactInfo();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await submitContactMessage(formData);
      
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      addNotification({
        message: response.message || 'Message sent successfully. We\'ll get back to you soon!',
        type: 'success'
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Contact form error:', error);
      const errorMessage = error.error || error.message || 'Could not send message. Please try again.';
      addNotification({
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
    // Show loading spinner when content is loading
  if (contentLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spinner size={60} />
      </div>
    );
  }

  return (
    <PageContainer>
      <HeroSection>
        <Title
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {contactHeroContent?.title || "Contact Us"}
        </Title>
        <Subtitle
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {contactHeroContent?.subtitle || "Have questions about our book boxes or subscription plans? Want to work with us? We'd love to hear from you!"}
        </Subtitle>
      </HeroSection>
      
      <ContactContainer>        <ContactFormContainer>
          <FormTitle>{contactFormContent?.title || "Send Us a Message"}</FormTitle>
          {contactFormContent?.content && (
            <p style={{ marginBottom: '1.5rem', color: '#666', lineHeight: '1.5' }}>
              {contactFormContent.content}
            </p>
          )}
          {success && (
            <SuccessMessage
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              Thank you for your message! We'll get back to you soon.
            </SuccessMessage>
          )}
          <ContactForm onSubmit={handleSubmit}>
            <div>
              <FormInput 
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <FormInput 
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <FormInput 
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <FormTextarea 
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              fullWidth
            >
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </ContactForm>
        </ContactFormContainer>
        
        <ContactInfoContainer>          <ContactInfo>
            <InfoTitle>{contactInfoContent?.title || "Get In Touch"}</InfoTitle>
            
            <InfoItem>
              <FaEnvelope />
              <InfoText>
                <h4>Email</h4>
                <p>{contactInfo.email}</p>
              </InfoText>
            </InfoItem>
            
            <InfoItem>
              <FaPhone />
              <InfoText>
                <h4>Phone</h4>
                <p>{contactInfo.phone}</p>
              </InfoText>
            </InfoItem>
            
            <InfoItem>
              <FaMapMarkerAlt />
              <InfoText>
                <h4>Address</h4>
                {contactInfo.address.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </InfoText>
            </InfoItem>
            
            <InfoTitle>Connect With Us</InfoTitle>
            <SocialMediaContainer>
              <SocialLink href="https://instagram.com/foiyfoshi" target="_blank" aria-label="Instagram">
                <FaInstagram />
              </SocialLink>
              <SocialLink href="https://facebook.com/foiyfoshi" target="_blank" aria-label="Facebook">
                <FaFacebookSquare />
              </SocialLink>
              <SocialLink href="https://twitter.com/foiyfoshi" target="_blank" aria-label="Twitter">
                <FaTwitter />
              </SocialLink>
            </SocialMediaContainer>
          </ContactInfo>
          
          <ContactInfo>
            <InfoTitle>{businessHoursContent?.title || "Business Hours"}</InfoTitle>
            {businessHoursContent?.content ? (
              businessHoursContent.content.split('\n').map((line, index) => (
                line.trim() && <p key={index}>{line.trim()}</p>
              ))
            ) : (
              <>
                <p>Sunday - Thursday: 9am to 6pm</p>
                <p>Friday - Saturday: Closed</p>
                <p>Online orders: 24/7</p>
              </>
            )}
          </ContactInfo>
        </ContactInfoContainer>
      </ContactContainer>
    </PageContainer>
  );
}

export default Contact;
