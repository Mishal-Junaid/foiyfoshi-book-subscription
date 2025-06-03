import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaBook, FaGift, FaShippingFast, FaRegSmile } from 'react-icons/fa';
import { imgErrorProps, getImageUrl } from '../utils/imageUtils';
import { useContent } from '../context/ContentContext';
import api from '../services/api';

import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import DebugProductPanel from '../components/admin/DebugProductPanel';
import NewsletterPopup from '../components/ui/NewsletterPopup';

// Hero background image placeholder
const PLACEHOLDER_BG_IMAGE = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAEsASwDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIHMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7Hr5c+zCgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoA==';

// Hero Section
const HeroSection = styled.section`
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4)), url('/hero-bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.white};
  text-align: center;
  padding: 10rem 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: 8rem 1rem;
    background-attachment: scroll;
  }
`;

// Using $bgImage as a transient prop to prevent DOM warnings
const HeroBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$bgImage || PLACEHOLDER_BG_IMAGE});
  background-size: cover;
  background-position: center;
  filter: brightness(0.6);
  z-index: -1;
`;

const HeroContent = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 2;
  color: ${props => props.theme.colors.white};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
`;

const HeroTitle = styled(motion.h1)`
  font-size: 4rem;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.colors.white};
  text-align: center;
  
  span {
    color: ${props => props.theme.colors.mediumGold};
    display: block;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    font-size: 3rem;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto 2rem auto;
  font-weight: 300;
  text-align: center;
  line-height: 1.6;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    font-size: 1.1rem;
  }
`;

const HeroActions = styled(motion.div)`
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
`;

// About Section
const SectionContainer = styled.section`
  padding: 6rem 2rem;
  background-color: ${props => props.$alt ? props.theme.colors.background : props.theme.colors.white};
`;

const SectionContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const SectionTitle = styled(motion.h2)`
  position: relative;
  margin-bottom: 1.5rem;
  display: inline-block;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background-color: ${props => props.theme.colors.gold};
  }
`;

const SectionSubtitle = styled(motion.p)`
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto;
`;

const FeaturesGrid = styled.div`
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

const FeatureCard = styled(motion.div)`
  background-color: ${props => props.theme.colors.white};
  border-radius: 10px;
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.small};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: ${props => props.theme.transitions.short};
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const FeatureIcon = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.lightGrey};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  
  svg {
    color: ${props => props.theme.colors.gold};
    font-size: 2rem;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const FeatureText = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

// How It Works Section
const StepsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    top: 70px;
    left: 20%;
    right: 20%;
    height: 2px;
    background: ${props => props.theme.colors.lightGrey};
    z-index: 0;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    
    &:after {
      display: none;
    }
  }
`;

const StepCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  z-index: 1;
`;

const StepNumber = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.gold};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme.colors.white};
  margin-bottom: 1.5rem;
  box-shadow: ${props => props.theme.shadows.small};
`;

const StepTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 1rem;
`;

const StepText = styled.p`
  font-size: 1rem;
  color: #666;
`;

// Products Section
const ProductsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled(motion.div)`
  background-color: ${props => props.theme.colors.white};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.small};
  transition: ${props => props.theme.transitions.short};
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
`;

const ProductContent = styled.div`
  padding: 1.5rem;
`;

const ProductTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const ProductDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
`;

const ProductPrice = styled.p`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${props => props.theme.colors.gold};
  margin-bottom: 1rem;
`;

// Testimonials Section
const TestimonialsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
`;

const TestimonialCard = styled(motion.div)`
  background-color: ${props => props.theme.colors.white};
  border-radius: 10px;
  padding: 3rem 2rem;
  box-shadow: ${props => props.theme.shadows.small};
  margin: 2rem 0;
  text-align: center;
  position: relative;
  
  &:before {
    content: '"';
    position: absolute;
    top: 15px;
    left: 20px;
    font-size: 5rem;
    color: ${props => props.theme.colors.lightGrey};
    font-family: serif;
    opacity: 0.6;
  }
`;

const TestimonialText = styled.p`
  font-style: italic;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const TestimonialAuthor = styled.h4`
  color: ${props => props.theme.colors.gold};
  margin-bottom: 0.5rem;
`;

const TestimonialRole = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

// CTA Section
const CTASection = styled.section`
  background-color: ${props => props.theme.colors.black};
  color: ${props => props.theme.colors.white};
  padding: 5rem 2rem;
  margin-bottom: 0; /* Remove margin to eliminate gap */
`;

const CTAContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const CTATitle = styled(motion.h2)`
  color: ${props => props.theme.colors.white};
  margin-bottom: 1.5rem;
  
  span {
    color: ${props => props.theme.colors.mediumGold};
  }
`;

const CTAText = styled(motion.p)`
  font-size: 1.1rem;
  margin-bottom: 2rem;
`;

const CTAButton = styled(motion.div)``;

const Home = () => {
  const { loading, getContentBySection } = useContent();
  const productImageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAEsASwDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIHMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7Hr5c+zCgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoA==';
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  // Debugging state
  const [allProducts, setAllProducts] = useState([]);
  const [lastApiResponse, setLastApiResponse] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  // Newsletter popup state
  const [isNewsletterPopupOpen, setIsNewsletterPopupOpen] = useState(false);
  
  // Check if current user is admin
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setIsAdmin(userData.role === 'admin');
      } catch (e) {
        console.error('Could not parse user data', e);
      }
    }
  }, []);
      useEffect(() => {    
    const fetchFeaturedProducts = async () => {
      try {
        setFeaturedLoading(true);
        
        // Updated API path without /api prefix
        const response = await api.get('/products/featured?limit=3');
        console.log('Home: Featured products API response:', response.data);
        setLastApiResponse(response.data);
        
        if (response.data.data && response.data.data.length > 0) {
          setFeaturedProducts(response.data.data);
          console.log('Home: Featured products set:', response.data.data.length, 'items');
        } else {
          console.log('Home: No featured products found, using fallback');
          // Fallback to default products if none are featured
          setFeaturedProducts([
            {
              _id: '1',
              name: "Monthly Book Box",
              description: "A curated selection of 2 books and reading accessories delivered monthly.",
              price: 599,
              images: [productImageBase64]
            },
            {
              _id: '2',
              name: "Quarterly Book Box",
              description: "Our premium box with 3 books and exclusive accessories every 3 months.",
              price: 1499,
              images: [productImageBase64]
            },
            {
              _id: '3',
              name: "Gift Box Special",
              description: "The perfect gift for book lovers - a one-time curated book box with surprises.",
              price: 799,
              images: [productImageBase64]
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        // Use fallback products on error
        setFeaturedProducts([
          {
            _id: '1',
            name: "Monthly Book Box",
            description: "A curated selection of 2 books and reading accessories delivered monthly.",
            price: 599,
            images: [productImageBase64]
          },
          {
            _id: '2',
            name: "Quarterly Book Box",
            description: "Our premium box with 3 books and exclusive accessories every 3 months.",
            price: 1499,
            images: [productImageBase64]
          },
          {
            _id: '3',
            name: "Gift Box Special",
            description: "The perfect gift for book lovers - a one-time curated book box with surprises.",
            price: 799,
            images: [productImageBase64]
          }
        ]);      } finally {
        setFeaturedLoading(false);
      }
        // Also fetch all products for debugging
      try {
        // Updated API path without /api prefix
        const allProductsRes = await api.get('/products?limit=50');
        console.log('Home: All products API response:', allProductsRes.data);
        setAllProducts(allProductsRes.data.data || []);
      } catch (error) {
        console.error('Error fetching all products:', error);
      }
    };

    fetchFeaturedProducts();
  }, []);
  
  // Get content sections with updated section names to match database entries
  const heroContent = getContentBySection('hero');
  const aboutContent = getContentBySection('about');
  const howContent = getContentBySection('how-it-works');
  const productsContent = getContentBySection('products');
  const testimonialsContent = getContentBySection('testimonials');
  const ctaContent = getContentBySection('cta');
  
  console.log('Content sections found:', { 
    heroContent, 
    aboutContent, 
    howContent,
    productsContent,
    testimonialsContent,
    ctaContent
  });
  
  // Animation controls
  
  // Scroll animations
  const { scrollY } = useScroll();
  const heroTextY = useTransform(scrollY, [0, 300], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Intersection observers for different sections
  const [aboutRef, aboutInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [howRef, howInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [productsRef, productsInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [testimonialRef, testimonialInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [ctaRef, ctaInView] = useInView({ threshold: 0.2, triggerOnce: true });

  // Feature cards array
  const features = [
    {
      icon: <FaBook />,
      title: "Curated Books",
      text: "Expertly selected books tailored to your reading preferences."
    },
    {
      icon: <FaGift />,
      title: "Exclusive Goodies",
      text: "Unique bookish items you won't find anywhere else."
    },
    {
      icon: <FaShippingFast />,
      title: "Free Delivery",
      text: "Free shipping to all islands across the Maldives."
    },
    {
      icon: <FaRegSmile />,
      title: "Satisfaction Guaranteed",
      text: "Love your box or get your money back."
    }
  ];

  // How it works steps
  const steps = [
    {
      number: 1,
      title: "Choose a Plan",
      text: "Select between our monthly, quarterly, or one-time gift box options."
    },
    {
      number: 2,
      title: "Customize Preferences",
      text: "Tell us your favorite genres and reading preferences."
    },
    {
      number: 3,
      title: "Receive & Enjoy",
      text: "Get your book box delivered to your doorstep and dive into a new reading adventure."
    }
  ];

  // Testimonials - dynamic from content management
  const getTestimonials = () => {
    const testimonialsContent = getContentBySection('testimonials');
    console.log('Home: Getting testimonials content:', testimonialsContent);
    
    if (testimonialsContent && testimonialsContent.content) {
      try {
        const parsedTestimonials = JSON.parse(testimonialsContent.content);
        console.log('Home: Parsed testimonials:', parsedTestimonials);
        
        return Array.isArray(parsedTestimonials) && parsedTestimonials.length > 0 
          ? parsedTestimonials.filter(t => t.active !== false)
          : [
              {
                text: "FoiyFoshi has completely transformed my reading experience. Each month I get introduced to amazing books I would have never discovered on my own.",
                author: "Aishath Mohamed",
                role: "Monthly Subscriber"
              }
            ];
      } catch (e) {
        console.error('Error parsing testimonials:', e);
        return [
          {
            text: "FoiyFoshi has completely transformed my reading experience. Each month I get introduced to amazing books I would have never discovered on my own.",
            author: "Aishath Mohamed",
            role: "Monthly Subscriber"
          }
        ];
      }
    }
    
    console.log('Home: No testimonials content found, using default');
    return [
      {
        text: "FoiyFoshi has completely transformed my reading experience. Each month I get introduced to amazing books I would have never discovered on my own.",
        author: "Aishath Mohamed",
        role: "Monthly Subscriber"
      }
    ];
  };

  const testimonials = getTestimonials();

  // Show loading spinner when content is loading
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spinner size={60} />
      </div>
    );
  }

  return (
    <main>      {/* Hero Section */}
      <HeroSection>
        <HeroBackground $bgImage={
          heroContent?.images && 
          heroContent.images[0] && 
          typeof heroContent.images[0].url === 'string' 
            ? getImageUrl(heroContent.images[0].url) 
            : null
        } />
        <HeroContent style={{ y: heroTextY, opacity: heroOpacity }}>
          <HeroTitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {heroContent?.title || "Discover Your Next"} <span>{heroContent?.subtitle || "Favorite Book"}</span>
          </HeroTitle>
          <HeroSubtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {heroContent?.content || "The Maldives' first book subscription box delivering hand-picked books and exclusive bookish items straight to your door."}
          </HeroSubtitle>
          <HeroActions
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {heroContent?.links?.length > 0 ? (
              heroContent.links.map((link, index) => (
                <Button 
                  key={index} 
                  variant={index === 0 ? "primary" : "secondary"} 
                  as={Link} 
                  to={link.url}
                >
                  {link.text}
                </Button>
              ))
            ) : (
              <>
                <Button variant="primary" as={Link} to="/products">
                  Browse Products
                </Button>
                <Button variant="secondary" as={Link} to="/about">
                  Learn More
                </Button>
              </>
            )}
          </HeroActions>
        </HeroContent>
      </HeroSection>      {/* About Section */}
      <SectionContainer>
        <SectionContent ref={aboutRef}>
          <SectionHeader>
            <SectionTitle
              initial={{ opacity: 0, y: 20 }}
              animate={aboutInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
            >
              {aboutContent?.title || "About FoiyFoshi"}
            </SectionTitle>
            <SectionSubtitle
              initial={{ opacity: 0, y: 20 }}
              animate={aboutInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {aboutContent?.subtitle || "We're book lovers on a mission to spread the joy of reading throughout the Maldives with our carefully curated subscription boxes."}
            </SectionSubtitle>
          </SectionHeader>
          
          <FeaturesGrid ref={featuresRef}>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              >
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureText>{feature.text}</FeatureText>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </SectionContent>
      </SectionContainer>      {/* How It Works Section */}
      <SectionContainer $alt>
        <SectionContent ref={howRef}>
          <SectionHeader>
            <SectionTitle
              initial={{ opacity: 0, y: 20 }}
              animate={howInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
            >
              {howContent?.title || "How It Works"}
            </SectionTitle>
            <SectionSubtitle
              initial={{ opacity: 0, y: 20 }}
              animate={howInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {howContent?.subtitle || "Getting started with your FoiyFoshi book subscription is simple."}
            </SectionSubtitle>
          </SectionHeader>

          <StepsContainer>
            {steps.map((step, index) => (
              <StepCard
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={howInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
              >
                <StepNumber>{step.number}</StepNumber>
                <StepTitle>{step.title}</StepTitle>
                <StepText>{step.text}</StepText>
              </StepCard>
            ))}
          </StepsContainer>
        </SectionContent>
      </SectionContainer>      {/* Featured Products Section */}
      <SectionContainer>
        <SectionContent ref={productsRef}>
          <SectionHeader>
            <SectionTitle
              initial={{ opacity: 0, y: 20 }}
              animate={productsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
            >
              {productsContent?.title || "Our Book Boxes"}
            </SectionTitle>
            <SectionSubtitle
              initial={{ opacity: 0, y: 20 }}
              animate={productsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {productsContent?.subtitle || "Choose the perfect FoiyFoshi subscription plan for your reading journey."}
            </SectionSubtitle>
          </SectionHeader>          <ProductsContainer>
            {featuredLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '2rem' }}>
                <Spinner size={40} />
              </div>
            ) : featuredProducts.map((product, index) => (
              <ProductCard
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                animate={productsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
              >                <ProductImage 
                  src={product.images && product.images.length > 0 && product.images[0].url
                    ? getImageUrl(product.images[0].url) 
                    : getImageUrl(null)} 
                  alt={product.name} 
                  {...imgErrorProps} 
                />
                <ProductContent>
                  <ProductTitle>{product.name}</ProductTitle>
                  <ProductDescription>{product.description}</ProductDescription>
                  <ProductPrice>MVR {product.price}</ProductPrice>
                  <Button variant="primary" as={Link} to={`/product/${product._id}`} small fullWidth>
                    View Details
                  </Button>
                </ProductContent>
              </ProductCard>
            ))}
          </ProductsContainer>
          
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Button variant="secondary" as={Link} to="/products">
              View All Products
            </Button>
          </div>
        </SectionContent>
      </SectionContainer>      {/* Testimonials Section */}
      <SectionContainer $alt>
        <SectionContent>
          <SectionHeader>
            <SectionTitle
              initial={{ opacity: 0, y: 20 }}
              animate={testimonialInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
            >
              {testimonialsContent?.title || "What Our Readers Say"}
            </SectionTitle>
            {testimonialsContent?.subtitle && (
              <SectionSubtitle
                initial={{ opacity: 0, y: 20 }}
                animate={testimonialInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {testimonialsContent.subtitle}
              </SectionSubtitle>
            )}
          </SectionHeader>

          <TestimonialsContainer ref={testimonialRef}>
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={testimonialInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <TestimonialText>"{testimonial.text}"</TestimonialText>
                <TestimonialAuthor>{testimonial.author}</TestimonialAuthor>
                <TestimonialRole>{testimonial.role}</TestimonialRole>
              </TestimonialCard>
            ))}
          </TestimonialsContainer>
        </SectionContent>
      </SectionContainer>      {/* CTA Section */}
      <CTASection>
        <CTAContent ref={ctaRef}>
          <CTATitle
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            {ctaContent?.title ? (
              <>
                {ctaContent.title.split(' ').slice(0, -1).join(' ')} <span>{ctaContent.title.split(' ').slice(-1)}</span>
              </>
            ) : (
              <>Ready to Start Your <span>Reading Journey?</span></>
            )}
          </CTATitle>
          <CTAText
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {ctaContent?.subtitle || "Join FoiyFoshi today and discover the joy of receiving a box full of books and goodies every month."}
          </CTAText>
          <CTAButton
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {ctaContent?.links?.length > 0 ? (
              <Button 
                variant="primary" 
                size="large" 
                onClick={() => setIsNewsletterPopupOpen(true)}
              >
                {ctaContent.links[0].text || "Subscribe Now"}
              </Button>
            ) : (
              <Button 
                variant="primary" 
                size="large" 
                onClick={() => setIsNewsletterPopupOpen(true)}
              >
                Subscribe Now
              </Button>
            )}
          </CTAButton>
        </CTAContent>
      </CTASection>
      
      {/* Newsletter Popup */}
      <NewsletterPopup 
        isOpen={isNewsletterPopupOpen}
        onClose={() => setIsNewsletterPopupOpen(false)}
      />
      
      {/* Debug section - only visible for admins */}
      {isAdmin && (
        <div style={{ padding: '2rem', background: '#f9f9f9' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2>Product Debug Information (Admin Only)</h2>
            <DebugProductPanel 
              apiProducts={allProducts}
              frontEndProducts={featuredProducts}
              apiResponse={lastApiResponse}
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;