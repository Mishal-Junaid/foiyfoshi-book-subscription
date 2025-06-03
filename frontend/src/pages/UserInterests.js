import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaBook, FaUser, FaCheck, FaExclamationCircle, FaTimes } from 'react-icons/fa';

import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import api from '../services/api';
import Spinner from '../components/ui/Spinner';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 11rem 1.5rem 5rem;
`;

const InterestsCard = styled(motion.div)`
  background-color: ${props => props.theme.colors.white};
  border-radius: 10px;
  box-shadow: ${props => props.theme.shadows.medium};
  padding: 2.5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: 2rem 1.5rem;
  }
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const CardTitle = styled.h2`
  margin-bottom: 0.5rem;
`;

const CardSubtitle = styled.p`
  color: #666;
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    color: ${props => props.theme.colors.gold};
  }
`;

const GenreContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.8rem;
  margin-bottom: 1.5rem;
`;

const GenreCheckbox = styled.div`
  input {
    display: none;
  }
  
  label {
    display: flex;
    align-items: center;
    padding: 0.6rem 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: #f9f9f9;
    }
    
    svg {
      margin-left: auto;
      color: ${props => props.theme.colors.gold};
      opacity: 0;
      transition: opacity 0.2s ease;
    }
  }
  
  input:checked + label {
    background-color: ${props => props.theme.colors.gold + '1A'}; // 10% opacity
    border-color: ${props => props.theme.colors.gold};
    
    svg {
      opacity: 1;
    }
  }
`;

const AuthorInput = styled.div`
  margin-bottom: 1rem;
  
  input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.gold};
    }
  }
`;

const AuthorTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const AuthorTag = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.theme.colors.gold + '1A'};
  border: 1px solid ${props => props.theme.colors.gold};
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  
  button {
    background: none;
    border: none;
    color: ${props => props.theme.colors.gold};
    margin-left: 0.5rem;
    cursor: pointer;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
  }
`;

const RadioGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.8rem;
  margin-bottom: 1.5rem;
`;

const RadioButton = styled.div`
  input {
    display: none;
  }
  
  label {
    display: block;
    padding: 0.8rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: #f9f9f9;
    }
  }
  
  input:checked + label {
    background-color: ${props => props.theme.colors.gold + '1A'};
    border-color: ${props => props.theme.colors.gold};
    font-weight: 500;
  }
`;

const ButtonContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const AlertMessage = styled(motion.div)`
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  background-color: ${props => props.status === 'error' ? '#ffebee' : '#e8f5e9'};
  color: ${props => props.status === 'error' ? '#c62828' : '#2e7d32'};
  
  svg {
    margin-right: 0.5rem;
  }
`;

const ErrorText = styled.p`
  color: ${props => props.theme.colors.danger};
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.3rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const genres = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Fantasy', 'Romance', 'Science Fiction',
  'Biography', 'History', 'Self-Help', 'Young Adult', 'Children', 'Poetry',
  'Travel', 'Cooking', 'Other'
];

const languages = ['English', 'Dhivehi', 'Both'];
const readingFrequencies = ['Daily', 'Few times a week', 'Weekly', 'Monthly', 'Occasionally'];

const UserInterests = () => {
  const { user, updateUserProfile, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [favoriteAuthors, setFavoriteAuthors] = useState([]);
  const [authorInput, setAuthorInput] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [readingFrequency, setReadingFrequency] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
    
    // Prefill with existing data if available
    if (user && user.interests) {
      if (user.interests.genres) setSelectedGenres(user.interests.genres);
      if (user.interests.authors) setFavoriteAuthors(user.interests.authors);
      if (user.interests.preferredLanguage) setPreferredLanguage(user.interests.preferredLanguage);
      if (user.interests.readingFrequency) setReadingFrequency(user.interests.readingFrequency);
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validate genres (require at least one)
    if (selectedGenres.length === 0) {
      newErrors.genres = 'Please select at least one genre';
    }
    
    // Validate reading frequency
    if (!readingFrequency) {
      newErrors.readingFrequency = 'Please select how often you read';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleGenre = (genre) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
    
    // Clear error when user selects a genre
    if (errors.genres) {
      setErrors(prev => ({ ...prev, genres: null }));
    }
  };
  
  const addAuthor = () => {
    // Validate before adding
    if (!authorInput.trim()) {
      return;
    }
    
    // Check for duplicate
    if (favoriteAuthors.some(author => author.toLowerCase() === authorInput.trim().toLowerCase())) {
      setErrors(prev => ({ ...prev, author: 'You already added this author' }));
      return;
    }
    
    // Add author and clear input
    setFavoriteAuthors([...favoriteAuthors, authorInput.trim()]);
    setAuthorInput('');
    
    // Clear error if exists
    if (errors.author) {
      setErrors(prev => ({ ...prev, author: null }));
    }
  };
  
  const removeAuthor = (author) => {
    setFavoriteAuthors(favoriteAuthors.filter(a => a !== author));
  };
  
  const handleAuthorKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAuthor();
    }
  };

  const handleFrequencyChange = (frequency) => {
    setReadingFrequency(frequency);
    
    // Clear error when user selects a frequency
    if (errors.readingFrequency) {
      setErrors(prev => ({ ...prev, readingFrequency: null }));
    }
  };

  const saveInterests = async () => {
    // Validate form before submitting
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare interests data
      const interestsData = {
        interests: {
          genres: selectedGenres,
          authors: favoriteAuthors,
          preferredLanguage,
          readingFrequency
        }
      };
      
      // Update user profile with interests
      await updateUserProfile(interestsData);
      
      setAlert({
        status: 'success',
        message: 'Your reading preferences have been saved successfully!'
      });
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error saving interests:', error);
      setAlert({
        status: 'error',
        message: 'Failed to save your preferences. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const skipForNow = () => {
    navigate('/dashboard');
  };
  
  if (authLoading) {
    return <Spinner message="Loading..." />;
  }
  
  return (
    <PageContainer>
      <InterestsCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CardHeader>
          <CardTitle>Tell us about your reading preferences</CardTitle>
          <CardSubtitle>This helps us personalize your book recommendations</CardSubtitle>
        </CardHeader>
        
        {alert && (
          <AlertMessage status={alert.status}>
            {alert.status === 'error' ? <FaExclamationCircle /> : <FaCheck />}
            {alert.message}
          </AlertMessage>
        )}
        
        <FormSection id="genres">
          <SectionTitle>
            <FaBook /> What genres do you enjoy reading?
          </SectionTitle>
          {errors.genres && (
            <ErrorText>
              <FaExclamationCircle /> {errors.genres}
            </ErrorText>
          )}
          <GenreContainer>
            {genres.map(genre => (
              <GenreCheckbox key={genre}>
                <input
                  type="checkbox"
                  id={`genre-${genre}`}
                  checked={selectedGenres.includes(genre)}
                  onChange={() => toggleGenre(genre)}
                />
                <label htmlFor={`genre-${genre}`}>
                  {genre}
                  {selectedGenres.includes(genre) && <FaCheck />}
                </label>
              </GenreCheckbox>
            ))}
          </GenreContainer>
        </FormSection>
        
        <FormSection>
          <SectionTitle>Who are your favorite authors?</SectionTitle>
          <AuthorInput>
            <input
              type="text"
              value={authorInput}
              onChange={e => setAuthorInput(e.target.value)}
              onKeyPress={handleAuthorKeyPress}
              placeholder="Type an author's name and press Enter"
              aria-label="Favorite author name"
            />
            {errors.author && (
              <ErrorText>
                <FaExclamationCircle /> {errors.author}
              </ErrorText>
            )}
            <Button 
              type="button" 
              variant="secondary" 
              onClick={addAuthor}
            >
              Add Author
            </Button>
          </AuthorInput>
          
          <AuthorTags>
            {favoriteAuthors.map((author, index) => (
              <AuthorTag key={index}>
                {author}
                <button
                  onClick={() => removeAuthor(author)}
                  aria-label={`Remove ${author}`}
                >
                  <FaTimes />
                </button>
              </AuthorTag>
            ))}
            {favoriteAuthors.length === 0 && (
              <p style={{ color: '#777', fontSize: '0.9rem' }}>
                No favorite authors added yet
              </p>
            )}
          </AuthorTags>
        </FormSection>
        
        <FormSection>
          <SectionTitle>Which language do you prefer to read in?</SectionTitle>
          <RadioGroup>
            {languages.map(language => (
              <RadioButton key={language}>
                <input
                  type="radio"
                  id={`language-${language}`}
                  name="language"
                  checked={preferredLanguage === language}
                  onChange={() => setPreferredLanguage(language)}
                />
                <label htmlFor={`language-${language}`}>
                  {language}
                  {preferredLanguage === language && <FaCheck />}
                </label>
              </RadioButton>
            ))}
          </RadioGroup>
        </FormSection>
        
        <FormSection id="readingFrequency">
          <SectionTitle>How often do you typically read?</SectionTitle>
          {errors.readingFrequency && (
            <ErrorText>
              <FaExclamationCircle /> {errors.readingFrequency}
            </ErrorText>
          )}
          <RadioGroup>
            {readingFrequencies.map(frequency => (
              <RadioButton key={frequency}>
                <input
                  type="radio"
                  id={`frequency-${frequency}`}
                  name="frequency"
                  checked={readingFrequency === frequency}
                  onChange={() => handleFrequencyChange(frequency)}
                />
                <label htmlFor={`frequency-${frequency}`}>
                  {frequency}
                  {readingFrequency === frequency && <FaCheck />}
                </label>
              </RadioButton>
            ))}
          </RadioGroup>
        </FormSection>
        
        <ButtonGroup>
          <Button
            variant="text"
            onClick={skipForNow}
            disabled={loading}
          >
            Skip for now
          </Button>
          
          <Button
            onClick={saveInterests}
            loading={loading}
            disabled={loading}
          >
            Save Preferences
          </Button>
        </ButtonGroup>
      </InterestsCard>
    </PageContainer>
  );
}

export default UserInterests;
