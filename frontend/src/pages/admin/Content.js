import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSave, 
  FaTimes, 
  FaHome, 
  FaInfoCircle, 
  FaEnvelope, 
  FaSync,
  FaExclamationTriangle,
  FaCheck,
  FaQuoteLeft,
  FaPhoneAlt
} from 'react-icons/fa';

import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/ui/Button';
import { FormInput, FormTextarea } from '../../components/ui/FormElements';
import Spinner from '../../components/ui/Spinner';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import { useNotification } from '../../components/ui/Notification';
import ImageManager from '../../components/admin/ImageManager';
import { 
  getAllContent, 
  createContent, 
  updateContent, 
  deleteContent,
  addContentImage,
  removeContentImage
} from '../../services/contentService';
import * as contentService from '../../services/contentService';

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.black};
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
  overflow-x: auto;
`;

const Tab = styled.button`
  padding: 1rem 2rem;
  border: none;
  background: none;
  font-size: 1rem;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &.active {
    border-bottom-color: ${props => props.theme.colors.gold};
    color: ${props => props.theme.colors.gold};
    font-weight: 600;
  }
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const InfoAlert = styled.div`
  background: ${props => props.type === 'warning' ? '#fff3cd' : '#e3f2fd'};
  border: 1px solid ${props => props.type === 'warning' ? '#ffc107' : '#2196f3'};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  
  svg {
    color: ${props => props.type === 'warning' ? '#ff9800' : '#2196f3'};
    margin-top: 0.2rem;
  }
  
  div {
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ContentCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
`;

const CardTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.black};
  font-size: 1.1rem;
`;

const CardSubtitle = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  color: #666;
`;

const ActionIcons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionIcon = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.gold};
  font-size: 1.1rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$danger ? '#ffe6e6' : '#fff7e6'};
    color: ${props => props.$danger ? '#dc3545' : props.theme.colors.darkGold};
  }
`;

const ContentValue = styled.div`
  margin-top: 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #444;
`;

const ContentKey = styled.span`
  display: block;
  font-weight: 600;
  font-size: 0.8rem;
  color: ${props => props.theme.colors.gold};
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const Modal = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.black};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.black};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
`;

const TestimonialsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FooterInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

function Content() {
  const [activeTab, setActiveTab] = useState('home');
  const [contents, setContents] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [footerInfo, setFooterInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('content');
  const [currentContent, setCurrentContent] = useState(null);
  const [formData, setFormData] = useState({
    section: '',
    title: '',
    subtitle: '',
    content: '',
    active: true,
    order: 0,
  });
  const [testimonialForm, setTestimonialForm] = useState({
    text: '',
    author: '',
    role: '',
    active: true,
  });
  const [footerForm, setFooterForm] = useState({
    companyName: 'FoiyFoshi',
    tagline: 'The Maldives\' first book subscription box',
    address: '123 Boduthakurufaanu Magu, Malé, Maldives',
    phone: '+960 777-7777',
    email: 'info@foiyfoshi.mv',
    description: 'delivering curated reading experiences to your doorstep.',
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [contentRefreshing, setContentRefreshing] = useState(false);
  const { addNotification } = useNotification();
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'confirm'
  });

  // Define page sections for organization
  const pageSections = {
    home: ['hero', 'about', 'how-it-works', 'products', 'cta'],
    about: ['about-hero', 'our-story', 'different', 'mission'],
    contact: ['contact-hero', 'contact-info', 'contact-form', 'business-hours']
  };

  // Helper methods
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setHasUnsavedChanges(true);
  };

  const handleTestimonialChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTestimonialForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setHasUnsavedChanges(true);
  };

  const handleFooterChange = (e) => {
    const { name, value } = e.target;
    setFooterForm(prev => ({
      ...prev,
      [name]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleNewTestimonial = () => {
    setTestimonialForm({
      text: '',
      author: '',
      role: '',
      active: true,
    });
    setModalType('testimonial');
    setIsModalOpen(true);
    setHasUnsavedChanges(false);
  };

  const handleEditFooter = () => {
    setModalType('footer');
    setIsModalOpen(true);
    setHasUnsavedChanges(false);
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Content',
      message: 'Are you sure you want to delete this content? This action cannot be undone.',
      type: 'confirm',
      onConfirm: async () => {
        try {
          await contentService.deleteContent(id);
          addNotification('Content deleted successfully', 'success');
          fetchAllData();
        } catch (error) {
          addNotification('Failed to delete content', 'error');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDeleteTestimonial = (index) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Testimonial',
      message: 'Are you sure you want to delete this testimonial?',
      type: 'confirm',
      onConfirm: () => {
        const newTestimonials = testimonials.filter((_, i) => i !== index);
        setTestimonials(newTestimonials);
        saveTestimonials(newTestimonials);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddImage = (image) => {
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), image]
    }));
  };

  const handleRemoveImage = async (imageId) => {
    try {
      // If we're editing an existing content and the image has an ID, delete it from the server
      if (currentContent && typeof imageId === 'string') {
        await removeContentImage(currentContent._id, imageId);
        addNotification({ message: 'Image removed successfully', type: 'success' });
      }
      
      // Remove from local state regardless
      setFormData(prev => ({
        ...prev,
        images: (prev.images || []).filter((img, i) => 
          typeof imageId === 'string' ? img._id !== imageId : i !== imageId
        )
      }));
    } catch (err) {
      addNotification({ message: 'Failed to remove image', type: 'error' });
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (modalType === 'content') {
      try {
        if (currentContent) {
          await updateContent(currentContent._id, formData);
          addNotification({ message: 'Content updated successfully', type: 'success' });
        } else {
          await createContent(formData);
          addNotification({ message: 'Content created successfully', type: 'success' });
        }
        
        await fetchAllData();
        handleCloseModal();
      } catch (err) {
        addNotification({ message: err.response?.data?.message || 'Error saving content', type: 'error' });
      }
    } else if (modalType === 'testimonial') {
      try {
        await saveTestimonials([...testimonials, testimonialForm]);
        setTestimonials(prev => [...prev, testimonialForm]);
        setTestimonialForm({ text: '', author: '', role: '' });
        addNotification({ message: 'Testimonial added successfully', type: 'success' });
        handleCloseModal();
      } catch (err) {
        addNotification({ message: 'Failed to add testimonial', type: 'error' });
      }
    } else if (modalType === 'footer') {
      try {
        await saveFooterInfo(footerForm);
        setFooterInfo(footerForm);
        addNotification({ message: 'Footer information updated successfully', type: 'success' });
        handleCloseModal();
      } catch (err) {
        addNotification({ message: 'Failed to update footer information', type: 'error' });
      }
    }
  };

  const saveTestimonials = async (testimonialsData) => {
    try {
      const testimonialsContent = contents.find(c => c.section === 'testimonials');
      const data = {
        section: 'testimonials',
        title: 'What Our Readers Say',
        subtitle: 'Customer Testimonials',
        content: JSON.stringify(testimonialsData),
        active: true,
        order: 4,
      };
      
      if (testimonialsContent) {
        await contentService.updateContent(testimonialsContent._id, data);
      } else {
        await contentService.createContent(data);
      }
      
      // Refresh content on frontend to update testimonials immediately
      await fetchAllData();
    } catch (error) {
      console.error('Error saving testimonials:', error);
      throw error;
    }
  };

  const saveFooterInfo = async (footerData) => {
    try {
      const footerContent = contents.find(c => c.section === 'footer');
      const data = {
        section: 'footer',
        title: 'Footer Information',
        content: JSON.stringify(footerData),
        active: true,
        order: 999,
      };
      
      if (footerContent) {
        await contentService.updateContent(footerContent._id, data);
      } else {
        await contentService.createContent(data);
      }
      
      // Refresh content on frontend to update footer immediately
      await fetchAllData();
    } catch (error) {
      console.error('Error saving footer info:', error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    if (hasUnsavedChanges) {
      setConfirmDialog({
        isOpen: true,
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to close without saving?',
        type: 'confirm',
        onConfirm: () => {
          setIsModalOpen(false);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      });
    } else {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch general content
      const contentRes = await contentService.getAllContent(false);
      setContents(contentRes.data);
      
      // Load testimonials from content (if exists) or use default
      const testimonialsContent = contentRes.data.find(c => c.section === 'testimonials');
      if (testimonialsContent && testimonialsContent.content) {
        try {
          const parsedTestimonials = JSON.parse(testimonialsContent.content);
          setTestimonials(Array.isArray(parsedTestimonials) ? parsedTestimonials : []);
        } catch (e) {
          setTestimonials([]);
        }
      } else {
        // Default testimonial
        setTestimonials([
          {
            text: "FoiyFoshi has completely transformed my reading experience. Each month I get introduced to amazing books I would have never discovered on my own.",
            author: "Aishath Mohamed",
            role: "Monthly Subscriber",
            active: true
          }
        ]);
      }
      
      // Load footer info from content (if exists) or use default
      const footerContent = contentRes.data.find(c => c.section === 'footer');
      if (footerContent && footerContent.content) {
        try {
          const parsedFooter = JSON.parse(footerContent.content);
          setFooterForm(parsedFooter);
          setFooterInfo(parsedFooter);
        } catch (e) {
          setFooterInfo(footerForm);
        }
      } else {
        setFooterInfo(footerForm);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      addNotification('Failed to fetch content', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get content by page
  const getContentByPage = (page) => {
    const sections = pageSections[page] || [];
    return contents.filter(content => sections.includes(content.section));
  };

  // Create all missing sections for all pages
  const createAllMissingSections = async () => {
    const allMissingSections = [
      // Home page sections
      {
        section: 'hero',
        title: 'Discover Your Next Favorite Book',
        subtitle: 'The Maldives\' First Book Subscription Box',
        content: 'Hand-picked books and exclusive bookish items delivered straight to your door every month.',
        active: true,
        order: 1
      },
      {
        section: 'about',
        title: 'About FoiyFoshi',
        subtitle: 'We\'re book lovers on a mission to spread the joy of reading throughout the Maldives',
        content: 'Founded by passionate readers who understand the struggle of finding good books in the Maldives.',
        active: true,
        order: 2
      },
      {
        section: 'how-it-works',
        title: 'How It Works',
        subtitle: 'Getting started with your FoiyFoshi book subscription is simple',
        content: 'Choose your plan, tell us your preferences, and enjoy curated books delivered monthly.',
        active: true,
        order: 3
      },
      {
        section: 'products',
        title: 'Our Book Boxes',
        subtitle: 'Choose the perfect FoiyFoshi subscription plan for your reading journey',
        content: 'From monthly surprises to quarterly collections, we have the perfect box for every reader.',
        active: true,
        order: 4
      },
      {
        section: 'cta',
        title: 'Ready to Start Your Reading Journey?',
        subtitle: 'Join FoiyFoshi today and discover the joy of receiving a box full of books and goodies every month',
        content: 'Subscribe now and get your first curated book box delivered to your doorstep.',
        active: true,
        order: 5
      },

      // About page sections
      {
        section: 'about-hero',
        title: 'About FoiyFoshi Books',
        subtitle: 'Bringing the joy of reading to Maldivian readers through curated book subscription boxes',
        active: true,
        order: 0
      },
      {
        section: 'our-story',
        title: 'Our Story',
        content: 'Founded in 2023, FoiyFoshi Books was born from a simple passion: to make reading more accessible and exciting for people across the Maldives.\n\nWe understand the challenges of finding good books in our islands, and how expensive importing individual titles can be. That\'s why we created a subscription service that delivers carefully selected books to your doorstep every month.\n\nOur name "FoiyFoshi" combines the Dhivehi words for "book" and "good/beautiful," representing our mission to bring beautiful reading experiences to our community.',
        active: true,
        order: 0
      },
      {
        section: 'different',
        title: 'What Makes Us Different',
        subtitle: 'Our unique approach to book subscriptions',
        content: 'Here at FoiyFoshi Books, we take pride in what sets us apart:\n\n• Curated Selection - Each book is hand-selected by our team of avid readers to ensure quality and diversity in your reading journey.\n\n• Made With Love - We personally pack each box with care, adding special touches and surprises to delight our subscribers.\n\n• Community Focus - We\'re building a community of readers in the Maldives through book clubs, events, and online discussions.',
        active: true,
        order: 0
      },
      {
        section: 'mission',
        title: 'Our Mission',
        content: 'At FoiyFoshi Books, our mission is to foster a love of reading throughout the Maldives by making quality books accessible, affordable, and exciting. We believe that books have the power to transform lives, open minds, and connect people from all backgrounds.',
        active: true,
        order: 0
      },

      // Contact page sections
      {
        section: 'contact-hero',
        title: 'Contact Us',
        subtitle: 'We\'d love to hear from you! Get in touch with any questions or feedback.',
        active: true,
        order: 0
      },
      {
        section: 'contact-info',
        title: 'Get In Touch',
        content: 'Email: info@foiyfoshi.mv\nPhone: +960 777-7777\nAddress: FoiyFoshi Books\nChaandhanee Magu, Malé 20-02\nMaldives',
        active: true,
        order: 0
      },
      {
        section: 'contact-form',
        title: 'Send Us a Message',
        content: 'Fill out the form below and we\'ll get back to you as soon as possible. Whether you have questions about our subscription boxes, need help with your order, or just want to share your reading experience, we\'re here to help!',
        active: true,
        order: 0
      },
      {
        section: 'business-hours',
        title: 'Business Hours',
        content: 'Sunday - Thursday: 9am to 6pm\nFriday - Saturday: Closed\nOnline orders: 24/7',
        active: true,
        order: 0
      }
    ];

    try {
      let created = 0;
      for (const sectionData of allMissingSections) {
        // Check if section already exists
        const exists = contents.find(c => c.section === sectionData.section);
        if (!exists) {
          await contentService.createContent(sectionData);
          created++;
        }
      }
      
      // Refresh data
      await fetchAllData();
      addNotification(`Created ${created} missing content sections for all pages`, 'success');
    } catch (error) {
      console.error('Error creating missing sections:', error);
      addNotification('Failed to create missing sections', 'error');
    }
  };

  // Check which sections are missing for a page
  const getMissingSections = (page) => {
    const expectedSections = pageSections[page] || [];
    const existingSections = contents.filter(c => expectedSections.includes(c.section)).map(c => c.section);
    return expectedSections.filter(section => !existingSections.includes(section));
  };

  const handleEdit = (content) => {
    setCurrentContent(content);
    setFormData({
      section: content.section,
      title: content.title,
      subtitle: content.subtitle || '',
      content: content.content || '',
      active: content.active,
      order: content.order || 0,
      images: content.images || [],
    });
    setModalType('content');
    setIsModalOpen(true);
    setHasUnsavedChanges(false);
  };

  const handleNewContent = (prefilledSection = '') => {
    setCurrentContent(null);
    setFormData({
      section: prefilledSection,
      title: '',
      subtitle: '',
      content: '',
      active: true,
      order: 0,
    });
    setModalType('content');
    setIsModalOpen(true);
    setHasUnsavedChanges(false);
  };

  const handleRefreshContent = async () => {
    setContentRefreshing(true);
    try {
      await fetchAllData();
      addNotification('Front-end content refreshed successfully', 'success');
    } catch (error) {
      addNotification('Failed to refresh content', 'error');
    } finally {
      setContentRefreshing(false);
    }
  };

  if (loading && contents.length === 0) {
    return (
      <AdminLayout>
        <Container>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Spinner size={50} />
          </div>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>Content Management</Title>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button 
              onClick={createAllMissingSections} 
              icon={<FaPlus />}
              variant="secondary"
            >
              Create Missing Sections
            </Button>
            <Button 
              onClick={handleRefreshContent} 
              icon={<FaSync />}
              variant="primary"
              loading={contentRefreshing}
            >
              Refresh Front-end Content
            </Button>
          </div>
        </Header>

        <InfoAlert>
          <FaInfoCircle />
          <div>
            <strong>Page-Based Content Management:</strong><br />
            Content is now organized by pages (Home, About, Contact) for easier management. Each page has specific sections that are used by the frontend.
          </div>
        </InfoAlert>

        <TabContainer>
          <Tab 
            className={activeTab === 'home' ? 'active' : ''} 
            onClick={() => setActiveTab('home')}
          >
            <FaHome /> Home Page
          </Tab>
          <Tab 
            className={activeTab === 'about' ? 'active' : ''} 
            onClick={() => setActiveTab('about')}
          >
            <FaInfoCircle /> About Page
          </Tab>
          <Tab 
            className={activeTab === 'contact' ? 'active' : ''} 
            onClick={() => setActiveTab('contact')}
          >
            <FaPhoneAlt /> Contact Page
          </Tab>
          <Tab 
            className={activeTab === 'testimonials' ? 'active' : ''} 
            onClick={() => setActiveTab('testimonials')}
          >
            <FaQuoteLeft /> Testimonials
          </Tab>
          <Tab 
            className={activeTab === 'footer' ? 'active' : ''} 
            onClick={() => setActiveTab('footer')}
          >
            <FaEnvelope /> Footer & Contact Info
          </Tab>
        </TabContainer>

        {/* Home Page Tab */}
        {activeTab === 'home' && (
          <>
            {getMissingSections('home').length > 0 && (
              <InfoAlert type="warning">
                <FaExclamationTriangle />
                <div>
                  <strong>Missing Home Page Sections:</strong><br />
                  {getMissingSections('home').join(', ')}. Click "Create Missing Sections" to add them.
                </div>
              </InfoAlert>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <Button onClick={() => handleNewContent('')} icon={<FaPlus />}>
                Add Home Section
              </Button>
            </div>
            
            <ContentGrid>
              {getContentByPage('home').map(content => (
                <ContentCard key={content._id}>
                  <CardHeader>
                    <div>
                      <CardTitle>{content.title}</CardTitle>
                      <CardSubtitle>
                        Section: {content.section} {!content.active && <span style={{color: 'orange'}}>(inactive)</span>}
                      </CardSubtitle>
                    </div>
                    <ActionIcons>
                      <ActionIcon onClick={() => handleEdit(content)} title="Edit">
                        <FaEdit />
                      </ActionIcon>
                      <ActionIcon 
                        $danger 
                        onClick={() => handleDelete(content._id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </ActionIcon>
                    </ActionIcons>
                  </CardHeader>
                  
                  {content.subtitle && (
                    <ContentValue>
                      <ContentKey>Subtitle:</ContentKey>
                      {content.subtitle}
                    </ContentValue>
                  )}
                  
                  {content.content && (
                    <ContentValue>
                      <ContentKey>Content:</ContentKey>
                      {content.content.length > 150 
                        ? content.content.substring(0, 150) + '...' 
                        : content.content}
                    </ContentValue>
                  )}
                </ContentCard>
              ))}
              
              {getContentByPage('home').length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                  <h3>No home page sections found</h3>
                  <p>Expected sections: {pageSections.home.join(', ')}</p>
                  <Button onClick={createAllMissingSections} icon={<FaPlus />}>
                    Create Missing Sections
                  </Button>
                </div>
              )}
            </ContentGrid>
          </>
        )}

        {/* About Page Tab */}
        {activeTab === 'about' && (
          <>
            {getMissingSections('about').length > 0 && (
              <InfoAlert type="warning">
                <FaExclamationTriangle />
                <div>
                  <strong>Missing About Page Sections:</strong><br />
                  {getMissingSections('about').join(', ')}. Click "Create Missing Sections" to add them.
                </div>
              </InfoAlert>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <Button onClick={() => handleNewContent('')} icon={<FaPlus />}>
                Add About Section
              </Button>
            </div>
            
            <ContentGrid>
              {getContentByPage('about').map(content => (
                <ContentCard key={content._id}>
                  <CardHeader>
                    <div>
                      <CardTitle>{content.title}</CardTitle>
                      <CardSubtitle>
                        Section: {content.section} {!content.active && <span style={{color: 'orange'}}>(inactive)</span>}
                      </CardSubtitle>
                    </div>
                    <ActionIcons>
                      <ActionIcon onClick={() => handleEdit(content)} title="Edit">
                        <FaEdit />
                      </ActionIcon>
                      <ActionIcon 
                        $danger 
                        onClick={() => handleDelete(content._id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </ActionIcon>
                    </ActionIcons>
                  </CardHeader>
                  
                  {content.subtitle && (
                    <ContentValue>
                      <ContentKey>Subtitle:</ContentKey>
                      {content.subtitle}
                    </ContentValue>
                  )}
                  
                  {content.content && (
                    <ContentValue>
                      <ContentKey>Content:</ContentKey>
                      {content.content.length > 150 
                        ? content.content.substring(0, 150) + '...' 
                        : content.content}
                    </ContentValue>
                  )}
                </ContentCard>
              ))}
              
              {getContentByPage('about').length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                  <h3>No about page sections found</h3>
                  <p>Expected sections: {pageSections.about.join(', ')}</p>
                  <Button onClick={createAllMissingSections} icon={<FaPlus />}>
                    Create Missing Sections
                  </Button>
                </div>
              )}
            </ContentGrid>
          </>
        )}

        {/* Contact Page Tab */}
        {activeTab === 'contact' && (
          <>
            {getMissingSections('contact').length > 0 && (
              <InfoAlert type="warning">
                <FaExclamationTriangle />
                <div>
                  <strong>Missing Contact Page Sections:</strong><br />
                  {getMissingSections('contact').join(', ')}. Click "Create Missing Sections" to add them.
                </div>
              </InfoAlert>
            )}
            
            <InfoAlert>
              <FaInfoCircle />
              <div>
                <strong>Contact Information Format:</strong><br />
                For the "contact-info" section, format the content as:<br />
                <code>Email: your@email.com<br />Phone: +960 123-4567<br />Address: Your Address Line 1<br />Your Address Line 2<br />Your City, Country</code><br /><br />
                For the "business-hours" section, format each day/time on a new line:<br />
                <code>Monday - Friday: 9am to 6pm<br />Saturday: 10am to 2pm<br />Sunday: Closed</code>
              </div>
            </InfoAlert>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <Button onClick={() => handleNewContent('')} icon={<FaPlus />}>
                Add Contact Section
              </Button>
            </div>
            
            <ContentGrid>
              {getContentByPage('contact').map(content => (
                <ContentCard key={content._id}>
                  <CardHeader>
                    <div>
                      <CardTitle>{content.title}</CardTitle>
                      <CardSubtitle>
                        Section: {content.section} {!content.active && <span style={{color: 'orange'}}>(inactive)</span>}
                      </CardSubtitle>
                    </div>
                    <ActionIcons>
                      <ActionIcon onClick={() => handleEdit(content)} title="Edit">
                        <FaEdit />
                      </ActionIcon>
                      <ActionIcon 
                        $danger 
                        onClick={() => handleDelete(content._id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </ActionIcon>
                    </ActionIcons>
                  </CardHeader>
                  
                  {content.subtitle && (
                    <ContentValue>
                      <ContentKey>Subtitle:</ContentKey>
                      {content.subtitle}
                    </ContentValue>
                  )}
                  
                  {content.content && (
                    <ContentValue>
                      <ContentKey>Content:</ContentKey>
                      {content.content.length > 150 
                        ? content.content.substring(0, 150) + '...' 
                        : content.content}
                    </ContentValue>
                  )}
                </ContentCard>
              ))}
              
              {getContentByPage('contact').length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                  <h3>No contact page sections found</h3>
                  <p>Expected sections: {pageSections.contact.join(', ')}</p>
                  <Button onClick={createAllMissingSections} icon={<FaPlus />}>
                    Create Missing Sections
                  </Button>
                </div>
              )}
            </ContentGrid>
          </>
        )}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <Button onClick={handleNewTestimonial} icon={<FaPlus />}>
                Add Testimonial
              </Button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {testimonials.map((testimonial, index) => (
                <ContentCard key={index}>
                  <CardHeader>
                    <div>
                      <CardTitle>"{testimonial.text.substring(0, 50)}..."</CardTitle>
                      <CardSubtitle>by {testimonial.author}</CardSubtitle>
                    </div>
                    <ActionIcons>
                      <ActionIcon 
                        $danger 
                        onClick={() => handleDeleteTestimonial(index)}
                        title="Delete"
                      >
                        <FaTrash />
                      </ActionIcon>
                    </ActionIcons>
                  </CardHeader>
                  
                  <ContentValue>
                    <ContentKey>Full Quote:</ContentKey>
                    "{testimonial.text}"
                  </ContentValue>
                  
                  <ContentValue>
                    <ContentKey>Author:</ContentKey>
                    {testimonial.author}
                  </ContentValue>
                  
                  <ContentValue>
                    <ContentKey>Role/Title:</ContentKey>
                    {testimonial.role}
                  </ContentValue>
                </ContentCard>
              ))}
              
              {testimonials.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <h3>No testimonials found</h3>
                  <p>Add your first customer testimonial to display on the website</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer Tab */}
        {activeTab === 'footer' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <Button onClick={handleEditFooter} icon={<FaEdit />}>
                Edit Footer Information
              </Button>
            </div>
            
            <ContentCard>
              <CardTitle>Current Footer Information</CardTitle>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <ContentValue>
                  <ContentKey>Company Name:</ContentKey>
                  {footerInfo.companyName || 'FoiyFoshi'}
                </ContentValue>
                
                <ContentValue>
                  <ContentKey>Tagline:</ContentKey>
                  {footerInfo.tagline || 'The Maldives\' first book subscription box'}
                </ContentValue>
                
                <ContentValue>
                  <ContentKey>Description:</ContentKey>
                  {footerInfo.description || 'delivering curated reading experiences to your doorstep.'}
                </ContentValue>
                
                <ContentValue>
                  <ContentKey>Address:</ContentKey>
                  {footerInfo.address || '123 Boduthakurufaanu Magu, Malé, Maldives'}
                </ContentValue>
                
                <ContentValue>
                  <ContentKey>Phone:</ContentKey>
                  {footerInfo.phone || '+960 777-7777'}
                </ContentValue>
                
                <ContentValue>
                  <ContentKey>Email:</ContentKey>
                  {footerInfo.email || 'info@foiyfoshi.mv'}
                </ContentValue>
              </div>
            </ContentCard>
          </>
        )}

        {/* Modals */}
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '1rem'
          }} onClick={handleCloseModal}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                paddingBottom: '1rem',
                borderBottom: '2px solid #f0f0f0'
              }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {modalType === 'content' && (currentContent ? <><FaEdit /> Edit Content</> : <><FaPlus /> Add New Content</>)}
                  {modalType === 'testimonial' && <><FaQuoteLeft /> Add New Testimonial</>}
                  {modalType === 'footer' && <><FaEnvelope /> Edit Footer Information</>}
                </h2>
                <button style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }} onClick={handleCloseModal}>×</button>
              </div>
              
              <form onSubmit={handleSubmit}>
                {/* Content Form */}
                {modalType === 'content' && (
                  <>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Section (Unique Identifier)
                      </label>
                      <FormInput
                        type="text"
                        name="section"
                        value={formData.section}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. hero, about-hero, contact-info"
                      />
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Title
                      </label>
                      <FormInput
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="Section title"
                      />
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Subtitle (optional)
                      </label>
                      <FormInput
                        type="text"
                        name="subtitle"
                        value={formData.subtitle}
                        onChange={handleInputChange}
                        placeholder="Section subtitle"
                      />
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Content (optional)
                      </label>
                      <FormTextarea
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        rows={5}
                        placeholder="Main content text"
                      />
                    </div>
                    
                    {/* Image Management - Only show for existing content */}
                    {currentContent && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <ImageManager
                          contentId={currentContent._id}
                          images={formData.images || []}
                          onAddImage={handleAddImage}
                          onRemoveImage={handleRemoveImage}
                          type="content"
                        />
                      </div>
                    )}
                    
                    {!currentContent && (
                      <div style={{ 
                        marginBottom: '1.5rem', 
                        padding: '1rem', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                      }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                          💡 <strong>Note:</strong> Save the content first to enable image uploads. You can add images after creating the content section.
                        </p>
                      </div>
                    )}
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                          Display Order
                        </label>
                        <FormInput
                          type="number"
                          name="order"
                          value={formData.order}
                          onChange={handleInputChange}
                          placeholder="0"
                        />
                      </div>
                      
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.8rem' }}>
                          <input
                            type="checkbox"
                            id="active"
                            name="active"
                            checked={formData.active}
                            onChange={handleInputChange}
                            style={{ marginRight: '8px' }}
                          />
                          <label htmlFor="active" style={{ margin: 0, fontWeight: 600 }}>Active</label>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Testimonial Form */}
                {modalType === 'testimonial' && (
                  <>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Testimonial Text
                      </label>
                      <FormTextarea
                        name="text"
                        value={testimonialForm.text}
                        onChange={handleTestimonialChange}
                        rows={4}
                        placeholder="What did the customer say?"
                        required
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                          Customer Name
                        </label>
                        <FormInput
                          type="text"
                          name="author"
                          value={testimonialForm.author}
                          onChange={handleTestimonialChange}
                          placeholder="Customer's full name"
                          required
                        />
                      </div>
                      
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                          Role/Title
                        </label>
                        <FormInput
                          type="text"
                          name="role"
                          value={testimonialForm.role}
                          onChange={handleTestimonialChange}
                          placeholder="e.g. Monthly Subscriber, Book Lover"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Footer Form */}
                {modalType === 'footer' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                          Company Name
                        </label>
                        <FormInput
                          type="text"
                          name="companyName"
                          value={footerForm.companyName}
                          onChange={handleFooterChange}
                          placeholder="FoiyFoshi"
                        />
                      </div>
                      
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                          Tagline
                        </label>
                        <FormInput
                          type="text"
                          name="tagline"
                          value={footerForm.tagline}
                          onChange={handleFooterChange}
                          placeholder="The Maldives' first book subscription box"
                        />
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Description
                      </label>
                      <FormInput
                        type="text"
                        name="description"
                        value={footerForm.description}
                        onChange={handleFooterChange}
                        placeholder="delivering curated reading experiences to your doorstep."
                      />
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Address
                      </label>
                      <FormTextarea
                        name="address"
                        value={footerForm.address}
                        onChange={handleFooterChange}
                        rows={2}
                        placeholder="123 Boduthakurufaanu Magu, Malé, Maldives"
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                          Phone Number
                        </label>
                        <FormInput
                          type="text"
                          name="phone"
                          value={footerForm.phone}
                          onChange={handleFooterChange}
                          placeholder="+960 777-7777"
                        />
                      </div>
                      
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                          Email Address
                        </label>
                        <FormInput
                          type="email"
                          name="email"
                          value={footerForm.email}
                          onChange={handleFooterChange}
                          placeholder="info@foiyfoshi.mv"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '1rem', 
                  marginTop: '2rem', 
                  paddingTop: '1rem', 
                  borderTop: '1px solid #f0f0f0' 
                }}>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    icon={<FaSave />}
                  >
                    {modalType === 'content' && (currentContent ? 'Update Content' : 'Create Content')}
                    {modalType === 'testimonial' && 'Add Testimonial'}
                    {modalType === 'footer' && 'Update Footer'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          type={confirmDialog.type}
        />
      </Container>
    </AdminLayout>
  );
}

export default Content;
