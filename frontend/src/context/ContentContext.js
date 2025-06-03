import React, { createContext, useState, useContext, useEffect } from 'react';
import * as contentService from '../services/contentService';

// Create content context
const ContentContext = createContext();

// Content Provider component
export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Fetch content on initial load
  useEffect(() => {
    const fetchAllContent = async () => {
      try {
        setLoading(true);
        const response = await contentService.getAllContent(true); // Get only active content
        
        // Transform array to object with section as key for easier access
        const contentMap = response.data.reduce((acc, item) => {
          acc[item.section] = item;
          return acc;
        }, {});
        
        setContent(contentMap);
      } catch (err) {
        console.error('Error loading content:', err);
        setError('Failed to load page content');
      } finally {
        setLoading(false);
      }
    };

    fetchAllContent();
  }, []);  // Get content for a specific section
  const getContentBySection = (section) => {
    if (!section) {
      console.warn('No section name provided to getContentBySection');
      return null;
    }
    
    // First try exact match
    if (content[section]) {
      return content[section];
    }
    
    // Try with/without "-section" suffix as fallback
    const altSection = section.endsWith('-section') 
      ? section.replace('-section', '') 
      : `${section}-section`;
    
    if (content[altSection]) {
      console.info(`Found content using alternative section name '${altSection}' instead of '${section}'`);
      return content[altSection];
    }
      // Nothing found - log warning only once per session per section to avoid console spam
    if (!window._loggedMissingSections) {
      window._loggedMissingSections = new Set();
    }
      
    if (!window._loggedMissingSections.has(section)) {
      console.log(`Content for section '${section}' not found. Available sections:`, Object.keys(content));
      window._loggedMissingSections.add(section);
    }
    return null;
  };
  // Helper function to check if required sections exist
  const checkRequiredSections = () => {
    // Define sections that should exist
    const requiredSections = {
      'hero': 'Main homepage hero section',
      'about': 'Homepage about section',
      'how-it-works': 'Homepage how it works section',
      'products': 'Homepage featured products',
      'testimonials': 'Homepage testimonials',
      'cta': 'Homepage call-to-action',
      'about-hero': 'About page hero section',
      'our-story': 'About page story section',
      'different': 'About page features section',
      'mission': 'About page mission statement',
      'contact-hero': 'Contact page hero section',
      'contact-info': 'Contact page information',
      'contact-form': 'Contact page form section',
      'business-hours': 'Contact page business hours'
    };
    
    // Log missing sections for admin users
    const missingSections = Object.keys(requiredSections).filter(
      section => !content[section]
    );
    
    if (missingSections.length > 0) {
      console.warn('Missing content sections:', missingSections);
      console.info('Please go to Admin > Content Management to create these sections');
    }
  };

  // Run the check when content is loaded
  useEffect(() => {
    if (!loading) {
      checkRequiredSections();
    }
  }, [loading, content]);

  // Refresh content (used after updates in admin)
  const refreshContent = async () => {
    try {
      setLoading(true);
      const response = await contentService.getAllContent(true);
      
      const contentMap = response.data.reduce((acc, item) => {
        acc[item.section] = item;
        return acc;
      }, {});
      
      setContent(contentMap);
      return true;
    } catch (err) {
      console.error('Error refreshing content:', err);
      setError('Failed to refresh content');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContentContext.Provider value={{ 
      content, 
      loading, 
      error, 
      getContentBySection,
      refreshContent
    }}>
      {children}
    </ContentContext.Provider>
  );
};

// Custom hook to use content context
export const useContent = () => {
  const context = useContext(ContentContext);
  
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  
  return context;
};

export default ContentContext;
