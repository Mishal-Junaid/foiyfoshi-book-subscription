import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaBookOpen, FaHeart, FaUsers } from 'react-icons/fa';
import { useContent } from '../context/ContentContext';
import { getImageUrl, imgErrorProps } from '../utils/imageUtils';
import Spinner from '../components/ui/Spinner';

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

const ContentSection = styled.section`
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 2rem;
  position: relative;
  display: inline-block;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: ${props => props.theme.colors.gold};
  }
`;

const FeaturesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const FeatureCard = styled(motion.div)`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: ${props => props.theme.shadows.small};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  color: ${props => props.theme.colors.gold};
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.5;
`;

const StorySection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const StoryImage = styled.img`
  width: 100%;
  border-radius: 10px;
  box-shadow: ${props => props.theme.shadows.medium};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    margin-bottom: 2rem;
  }
`;

const StoryText = styled.div`
  p {
    margin-bottom: 1rem;
    line-height: 1.7;
    color: #444;
  }
`;

function About() {
  const { content, loading, getContentBySection } = useContent();
  
  // Get content for different about page sections with section names matching the database
  const aboutHeroContent = getContentBySection('about-hero');
  const ourStoryContent = getContentBySection('our-story');
  const differenceContent = getContentBySection('different');
  const missionContent = getContentBySection('mission');
  
  // Show loading spinner when content is loading
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spinner size={60} />
      </div>
    );
  }

  // Helper function to safely render content
  const renderContent = (content) => {
    if (!content) return null;
    
    // If content contains HTML tags, render as HTML, otherwise as plain text
    if (content.includes('<') && content.includes('>')) {
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    } else {
      // Split by newlines and render as paragraphs
      return content.split('\n').map((paragraph, index) => (
        paragraph.trim() && <p key={index}>{paragraph.trim()}</p>
      ));
    }
  };
  
  return (
    <PageContainer>
      <HeroSection>
        <Title
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {aboutHeroContent?.title || "About FoiyFoshi Books"}
        </Title>
        <Subtitle
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {aboutHeroContent?.subtitle || "Bringing the joy of reading to Maldivian readers through curated book subscription boxes"}
        </Subtitle>
      </HeroSection>

      <ContentSection>
        <StorySection>
          {aboutHeroContent?.images && aboutHeroContent.images[0] ? (
            <StoryImage 
              src={getImageUrl(aboutHeroContent.images[0].url)} 
              alt={aboutHeroContent.images[0].alt || "FoiyFoshi Books Team"}
              {...imgErrorProps}
            />
          ) : (
            <StoryImage 
              src={getImageUrl(null)} 
              alt="FoiyFoshi Books Team"
              {...imgErrorProps}
            />
          )}
          <StoryText>
            <SectionTitle>{ourStoryContent?.title || "Our Story"}</SectionTitle>
            {ourStoryContent?.content ? (
              renderContent(ourStoryContent.content)
            ) : (
              <>
                <p>
                  Founded in 2023, FoiyFoshi Books was born from a simple passion: to make reading more accessible and exciting for people across the Maldives.
                </p>
                <p>
                  We understand the challenges of finding good books in our islands, and how expensive importing individual titles can be. That's why we created a subscription service that delivers carefully selected books to your doorstep every month.
                </p>
                <p>
                  Our name "FoiyFoshi" combines the Dhivehi words for "book" and "good/beautiful," representing our mission to bring beautiful reading experiences to our community.
                </p>
                <p>
                  Every book box is curated with care, featuring titles across various genres, special editions, and reading accessories that enhance your experience.
                </p>
              </>
            )}
          </StoryText>
        </StorySection>
      </ContentSection>

      <ContentSection>
        <SectionTitle>{differenceContent?.title || "What Makes Us Different"}</SectionTitle>
        {differenceContent?.subtitle && (
          <Subtitle style={{ fontSize: '1rem', marginBottom: '2rem' }}>
            {differenceContent.subtitle}
          </Subtitle>
        )}
        <FeaturesContainer>
          {differenceContent?.content ? (
            <div style={{ gridColumn: '1 / -1' }}>
              {renderContent(differenceContent.content)}
            </div>
          ) : (
            <>
              <FeatureCard
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FeatureIcon>
                  <FaBookOpen />
                </FeatureIcon>
                <FeatureTitle>Curated Selection</FeatureTitle>
                <FeatureDescription>
                  Each book is hand-selected by our team of avid readers to ensure quality and diversity in your reading journey.
                </FeatureDescription>
              </FeatureCard>
              
              <FeatureCard
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FeatureIcon>
                  <FaHeart />
                </FeatureIcon>
                <FeatureTitle>Made With Love</FeatureTitle>
                <FeatureDescription>
                  We personally pack each box with care, adding special touches and surprises to delight our subscribers.
                </FeatureDescription>
              </FeatureCard>
              
              <FeatureCard
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FeatureIcon>
                  <FaUsers />
                </FeatureIcon>
                <FeatureTitle>Community Focus</FeatureTitle>
                <FeatureDescription>
                  We're building a community of readers in the Maldives through book clubs, events, and online discussions.
                </FeatureDescription>
              </FeatureCard>
            </>
          )}
        </FeaturesContainer>
      </ContentSection>

      <ContentSection>
        <SectionTitle>{missionContent?.title || "Our Mission"}</SectionTitle>
        <Subtitle>
          {missionContent?.content || "At FoiyFoshi Books, our mission is to foster a love of reading throughout the Maldives by making quality books accessible, affordable, and exciting. We believe that books have the power to transform lives, open minds, and connect people from all backgrounds."}
        </Subtitle>
        {missionContent?.images && missionContent.images.length > 0 && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <img 
              src={getImageUrl(missionContent.images[0].url)} 
              alt={missionContent.images[0].alt || "Our Mission"} 
              style={{ maxWidth: '100%', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
              {...imgErrorProps}
            />
          </div>
        )}
      </ContentSection>
    </PageContainer>
  );
}

export default About;
