import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin: 1rem 0 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 5px;
  border-left: 4px solid #007bff;
`;

const Title = styled.h3`
  margin-top: 0;
  color: #007bff;
`;

const SectionGroup = styled.div`
  margin-top: 1.5rem;
`;

const SectionTitle = styled.h4`
  color: #343a40;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.5rem;
`;

const List = styled.ul`
  padding-left: 1.5rem;
`;

const ListItem = styled.li`
  margin-bottom: 0.5rem;
  display: flex;
  align-items: flex-start;
`;

const SectionName = styled.code`
  background-color: #e9ecef;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-weight: bold;
`;

const Description = styled.span`
  margin-left: 0.5rem;
`;

const ContentGuide = () => {
  const contentSections = {
    home: [
      { section: 'hero', description: 'Main homepage hero section with title and subtitle' },
      { section: 'about', description: 'Homepage about section' },
      { section: 'how-it-works', description: 'Homepage how it works section with steps' },
      { section: 'products', description: 'Homepage featured products section' },
      { section: 'testimonials', description: 'Homepage customer testimonials' },
      { section: 'cta', description: 'Homepage call-to-action section' }
    ],
    about: [
      { section: 'about-hero', description: 'About page hero section' },
      { section: 'our-story', description: 'About page story section' },
      { section: 'different', description: 'About page features section (What Makes Us Different)' },
      { section: 'mission', description: 'About page mission statement' }
    ],
    contact: [
      { section: 'contact-hero', description: 'Contact page hero section with title and subtitle' },
      { section: 'contact-info', description: 'Contact page information section (address, phone, email)' },
      { section: 'contact-form', description: 'Contact page form section with instructions' },
      { section: 'business-hours', description: 'Contact page business hours section' }
    ]
  };

  return (
    <Container>
      <Title>Content Section Guide</Title>
      <p>To update content on the website, create content entries with these exact section names for each page:</p>
      
      <SectionGroup>
        <SectionTitle>Home Page</SectionTitle>
        <List>
          {contentSections.home.map((item) => (
            <ListItem key={item.section}>
              <SectionName>{item.section}</SectionName>
              <Description>{item.description}</Description>
            </ListItem>
          ))}
        </List>
      </SectionGroup>
      
      <SectionGroup>
        <SectionTitle>About Page</SectionTitle>
        <List>
          {contentSections.about.map((item) => (
            <ListItem key={item.section}>
              <SectionName>{item.section}</SectionName>
              <Description>{item.description}</Description>
            </ListItem>
          ))}
        </List>
      </SectionGroup>
      
      <SectionGroup>
        <SectionTitle>Contact Page</SectionTitle>
        <List>
          {contentSections.contact.map((item) => (
            <ListItem key={item.section}>
              <SectionName>{item.section}</SectionName>
              <Description>{item.description}</Description>
            </ListItem>
          ))}
        </List>
      </SectionGroup>
    </Container>
  );
};

export default ContentGuide;
