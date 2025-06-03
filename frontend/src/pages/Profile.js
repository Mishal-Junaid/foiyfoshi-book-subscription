import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaExclamationCircle, FaCheckCircle, FaBook, FaTimes, FaShoppingBag } from 'react-icons/fa';

import useAuth from '../hooks/useAuth';
import { FormInput } from '../components/ui/FormElements';
import Button from '../components/ui/Button';
import OrderHistory from '../components/profile/OrderHistory';

const ProfileContainer = styled.div`
  max-width: 800px;
`;

const PageTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    
    button {
      width: 100%;
    }
  }
`;

const AlertContainer = styled(motion.div)`
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    flex-shrink: 0;
  }
`;

const ErrorAlert = styled(AlertContainer)`
  background-color: #ffebee;
  color: #c62828;
`;

const SuccessAlert = styled(AlertContainer)`
  background-color: #e8f5e9;
  color: #2e7d32;
`;

const PasswordRequirements = styled.ul`
  margin-top: 1rem;
  padding-left: 1.5rem;
  font-size: 0.9rem;
  color: #666;
`;

const GenreCheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1.5rem;
  margin-top: 1rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  
  input {
    margin-right: 0.5rem;
  }
`;

const TextareaField = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 2rem;
`;

const Tab = styled.button.withConfig({
  shouldForwardProp: prop => !['active'].includes(prop)
})`
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid ${props => props.active ? props.theme.colors.gold : 'transparent'};
  color: ${props => props.active ? props.theme.colors.black : '#666'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.colors.black};
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
  min-height: 2rem;
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.theme.colors.gold || '#f5c842'};
  color: #333;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  
  button {
    background: none;
    border: none;
    margin-left: 0.5rem;
    cursor: pointer;
    color: #666;
    display: flex;
    align-items: center;
    padding: 0;
    
    &:hover {
      color: #333;
    }
    
    svg {
      font-size: 0.7rem;
    }
  }
`;

const SelectField = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary || '#007bff'};
    outline: none;
  }
`;

const ProfileContainerStyled = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const Profile = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('profile');
  
  // State for user details form
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // State for interests form
  const [interestsForm, setInterestsForm] = useState({
    genres: [],
    authors: [],
    preferredLanguage: 'English',
    readingFrequency: 'weekly',
    bio: ''
  });
  
  const [newAuthor, setNewAuthor] = useState('');
  
  // State for change password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Form validation errors
  const [userErrors, setUserErrors] = useState({});
  const [interestsErrors, setInterestsErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  
  // Alert states
  const [showUserAlert, setShowUserAlert] = useState(false);
  const [userAlertType, setUserAlertType] = useState('');
  const [userAlertMessage, setUserAlertMessage] = useState('');
  
  const [showPasswordAlert, setShowPasswordAlert] = useState(false);
  const [passwordAlertType, setPasswordAlertType] = useState('');
  const [passwordAlertMessage, setPasswordAlertMessage] = useState('');
    // Get auth context
  const { user, updateProfile, updateUserProfile, updatePassword, error, loading } = useAuth();
  
  // Success states for different form submissions
  const [userSuccess, setUserSuccess] = useState(false);
  const [interestsSuccess, setInterestsSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Populate form with user data when component loads
  useEffect(() => {
    if (user) {
      setUserForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });

      // Initialize interests form with user data if available
      setInterestsForm({
        genres: user.interests?.genres || [],
        authors: user.interests?.authors || [],
        preferredLanguage: user.interests?.preferredLanguage || 'English',
        readingFrequency: user.interests?.readingFrequency || 'weekly',
        bio: user.bio || ''
      });
    }
  }, [user]);
    // Handle user form inputs
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when typing
    if (userErrors[name]) {
      setUserErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear alerts
    setUserSuccess(false);
    setShowUserAlert(false);
  };  // Handle interests form inputs
  const handleInterestsInputChange = (e) => {
    const { name, value } = e.target;
    setInterestsForm(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when typing
    if (interestsErrors[name]) {
      setInterestsErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle password form inputs
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear alerts
    setShowPasswordAlert(false);
  };
    // Validate user form
  const validateUserForm = () => {
    const errors = {};
    
    if (!userForm.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!userForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userForm.email)) {
      errors.email = 'Email address is invalid';
    }
    
    if (!userForm.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{7,15}$/.test(userForm.phone.replace(/\s+/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    setUserErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validate interests form
  const validateInterestsForm = () => {
    const errors = {};
    
    if (interestsForm.genres.length === 0) {
      errors.genres = 'At least one genre is required';
    }
    
    if (interestsForm.authors.length === 0) {
      errors.authors = 'At least one author is required';
    }
    
    setInterestsErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle user form submission
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    
    if (validateUserForm()) {
      try {
        await updateProfile(userForm);
        
        // Show success message
        setUserSuccess(true);
        setUserAlertType('success');
        setUserAlertMessage('Profile updated successfully');
        setShowUserAlert(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setUserSuccess(false);
        }, 3000);
      } catch (err) {
        // Show error message
        setUserAlertType('error');
        setUserAlertMessage(error || 'Failed to update profile');
        setShowUserAlert(true);
      }
    }
  };
  
  // Handle interests form submission
  const handleUpdateInterests = async (e) => {
    e.preventDefault();
    
    if (validateInterestsForm()) {
      try {
        await updateProfile(interestsForm);
        
        // Show success message
        setUserAlertType('success');
        setUserAlertMessage('Interests updated successfully');
        setShowUserAlert(true);
      } catch (err) {
        // Show error message
        setUserAlertType('error');
        setUserAlertMessage(error || 'Failed to update interests');
        setShowUserAlert(true);
      }
    }
  };
  
  // Handle password form submission
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (validatePasswordForm()) {
      try {
        await updatePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        });
        
        // Show success message
        setPasswordAlertType('success');
        setPasswordAlertMessage('Password updated successfully');
        setShowPasswordAlert(true);
        
        // Clear form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (err) {
        // Show error message
        setPasswordAlertType('error');
        setPasswordAlertMessage(error || 'Failed to update password');
        setShowPasswordAlert(true);
      }
    }
  };

  // Handle interests form input changes
  const handleInterestsChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // For genre checkboxes
      if (checked) {
        setInterestsForm({
          ...interestsForm,
          genres: [...interestsForm.genres, value]
        });
      } else {
        setInterestsForm({
          ...interestsForm,
          genres: interestsForm.genres.filter(genre => genre !== value)
        });
      }
    } else {
      // For other inputs
      setInterestsForm({
        ...interestsForm,
        [name]: value
      });
    }
  };
  
  // Handle adding a new author
  const handleAddAuthor = () => {
    if (newAuthor.trim() && !interestsForm.authors.includes(newAuthor.trim())) {
      setInterestsForm({
        ...interestsForm,
        authors: [...interestsForm.authors, newAuthor.trim()]
      });
      setNewAuthor('');
    }
  };
  
  // Handle remove author tag
  const handleRemoveAuthor = (authorToRemove) => {
    setInterestsForm({
      ...interestsForm,
      authors: interestsForm.authors.filter(author => author !== authorToRemove)
    });
  };
    // Handle interests form submission
  const handleInterestsSubmit = async (e) => {
    e.preventDefault();
    
    // Set initial state
    setInterestsSuccess(false);
    
    // Validate form
    const validationErrors = {};
    if (interestsForm.genres.length === 0) {
      validationErrors.genres = 'Please select at least one genre';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setInterestsErrors(validationErrors);
      return;
    }
    
    setInterestsErrors({});
    
    try {
      // Call the update profile API
      await updateUserProfile({
        interests: {
          genres: interestsForm.genres,
          authors: interestsForm.authors,
          preferredLanguage: interestsForm.preferredLanguage,
          readingFrequency: interestsForm.readingFrequency
        },
        bio: interestsForm.bio
      });
      
      // Show success message
      setInterestsSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setInterestsSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating interests:', err);
      setInterestsErrors({
        general: err.response?.data?.error || 'Failed to update interests'
      });
    }
  };

  return (
    <ProfileContainer>
      <PageTitle>Your Profile</PageTitle>
      
      {/* Personal Information Section */}
      <FormSection>
        <SectionTitle>Personal Information</SectionTitle>
        
        {error && (
          <ErrorAlert
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FaExclamationCircle /> {error}
          </ErrorAlert>
        )}
        
        {userSuccess && (
          <SuccessAlert
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FaCheckCircle /> Profile updated successfully!
          </SuccessAlert>
        )}
        
        <form onSubmit={handleUserSubmit}>
          <FormGrid>
            <FormInput
              label="Full Name"
              id="name"
              name="name"
              value={userForm.name}
              onChange={handleUserChange}
              icon={<FaUser />}
              error={userErrors.name}
            />
            
            <FormInput
              label="Email Address"
              id="email"
              name="email"
              type="email"
              value={userForm.email}
              onChange={handleUserChange}
              icon={<FaEnvelope />}
              error={userErrors.email}
            />
            
            <FormInput
              label="Phone Number"
              id="phone"
              name="phone"
              value={userForm.phone}
              onChange={handleUserChange}
              icon={<FaPhone />}
              error={userErrors.phone}
            />
          </FormGrid>
            <ButtonsContainer>
            <Button type="submit" loading={loading} disabled={loading}>
              Save Changes
            </Button>
          </ButtonsContainer>
        </form>
      </FormSection>
      
      {/* Reading Preferences Section */}
      <FormSection>
        <SectionTitle>
          <FaBook style={{ marginRight: '0.5rem' }} />
          Reading Preferences & Bio
        </SectionTitle>
        
        {interestsErrors.general && (
          <ErrorAlert
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FaExclamationCircle /> {interestsErrors.general}
          </ErrorAlert>
        )}
        
        {interestsSuccess && (
          <SuccessAlert
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FaCheckCircle /> Reading preferences updated successfully!
          </SuccessAlert>
        )}
        
        <form onSubmit={handleInterestsSubmit}>
          <FormSection>
            <SectionTitle style={{ fontSize: '1.1rem' }}>Favorite Genres</SectionTitle>
            {interestsErrors.genres && (
              <p style={{ color: '#c62828', marginBottom: '0.5rem' }}>{interestsErrors.genres}</p>
            )}
            <GenreCheckboxGroup>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  value="Fiction"
                  checked={interestsForm.genres.includes('Fiction')}
                  onChange={handleInterestsChange}
                />
                Fiction
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  value="Non-Fiction"
                  checked={interestsForm.genres.includes('Non-Fiction')}
                  onChange={handleInterestsChange}
                />
                Non-Fiction
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  value="Mystery"
                  checked={interestsForm.genres.includes('Mystery')}
                  onChange={handleInterestsChange}
                />
                Mystery
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  value="Romance"
                  checked={interestsForm.genres.includes('Romance')}
                  onChange={handleInterestsChange}
                />
                Romance
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  value="Science Fiction"
                  checked={interestsForm.genres.includes('Science Fiction')}
                  onChange={handleInterestsChange}
                />
                Science Fiction
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  value="Fantasy"
                  checked={interestsForm.genres.includes('Fantasy')}
                  onChange={handleInterestsChange}
                />
                Fantasy
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  value="Biography"
                  checked={interestsForm.genres.includes('Biography')}
                  onChange={handleInterestsChange}
                />
                Biography
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  value="History"
                  checked={interestsForm.genres.includes('History')}
                  onChange={handleInterestsChange}
                />
                History
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  value="Self-Help"
                  checked={interestsForm.genres.includes('Self-Help')}
                  onChange={handleInterestsChange}
                />
                Self-Help
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  value="Poetry"
                  checked={interestsForm.genres.includes('Poetry')}
                  onChange={handleInterestsChange}
                />
                Poetry
              </CheckboxLabel>
            </GenreCheckboxGroup>
          </FormSection>
          
          <FormSection>
            <SectionTitle style={{ fontSize: '1.1rem' }}>Favorite Authors</SectionTitle>
            <div style={{ marginBottom: '1rem' }}>
              <FormInput
                label="Add Author"
                id="new-author"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="Enter author name"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAuthor())}
                suffix={
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleAddAuthor}
                    style={{ padding: '0.3rem 0.7rem', margin: '-0.5rem' }}
                  >
                    Add
                  </Button>
                }
              />
            </div>
            
            <TagsContainer>
              {interestsForm.authors.map((author, index) => (
                <Tag key={index}>
                  {author}
                  <button type="button" onClick={() => handleRemoveAuthor(author)}>
                    <FaTimes />
                  </button>
                </Tag>
              ))}
              
              {interestsForm.authors.length === 0 && (
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  No favorite authors added yet.
                </p>
              )}
            </TagsContainer>
          </FormSection>
          
          <FormGrid>
            <div>
              <label htmlFor="preferredLanguage" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Preferred Language
              </label>
              <SelectField
                id="preferredLanguage"
                name="preferredLanguage"
                value={interestsForm.preferredLanguage}
                onChange={handleInterestsChange}
              >
                <option value="English">English</option>
                <option value="Dhivehi">Dhivehi</option>
                <option value="Arabic">Arabic</option>
              </SelectField>
            </div>
            
            <div>
              <label htmlFor="readingFrequency" style={{ display: 'block', marginBottom: '0.5rem' }}>
                How often do you read?
              </label>
              <SelectField
                id="readingFrequency"
                name="readingFrequency"
                value={interestsForm.readingFrequency}
                onChange={handleInterestsChange}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="occasionally">Occasionally</option>
              </SelectField>
            </div>
          </FormGrid>
          
          <div style={{ marginTop: '1.5rem' }}>
            <label htmlFor="bio" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Bio
            </label>
            <TextareaField
              id="bio"
              name="bio"
              value={interestsForm.bio}
              onChange={handleInterestsChange}
              placeholder="Tell us a bit about yourself and your reading habits..."
            />
          </div>
            <ButtonsContainer>
            <Button type="submit" loading={loading} disabled={loading}>
              Save Preferences
            </Button>
          </ButtonsContainer>
        </form>
      </FormSection>
      
      {/* Password Section */}
      <FormSection>
        <SectionTitle>Change Password</SectionTitle>
        
        {showPasswordAlert && (
          passwordAlertType === 'error' ? (
            <ErrorAlert
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <FaExclamationCircle />
              <span>{passwordAlertMessage}</span>
            </ErrorAlert>
          ) : (
            <SuccessAlert
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <FaCheckCircle />
              <span>{passwordAlertMessage}</span>
            </SuccessAlert>
          )
        )}
        
        <form onSubmit={handleUpdatePassword}>
          <FormGrid>
            <FormInput
              label="Current Password"
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordInputChange}
              placeholder="Enter your current password"
              error={passwordErrors.currentPassword}
              required
            />
            
            <div></div>
            
            <FormInput
              label="New Password"
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordInputChange}
              placeholder="Create a new password"
              error={passwordErrors.newPassword}
              required
            />
            
            <FormInput
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordInputChange}
              placeholder="Confirm your new password"
              error={passwordErrors.confirmPassword}
              required
            />
          </FormGrid>
          
          <PasswordRequirements>
            <li>Password must be at least 8 characters long</li>
            <li>Use a mix of letters, numbers, and special characters</li>
            <li>Do not reuse previous passwords</li>
          </PasswordRequirements>
          
          <ButtonsContainer>
            <Button 
              type="submit" 
              variant="primary"
            >
              Update Password
            </Button>
            
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => {
                setPasswordForm({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
                setPasswordErrors({});
                setShowPasswordAlert(false);
              }}
            >
              Cancel
            </Button>
          </ButtonsContainer>
        </form>
      </FormSection>
      
      {/* Order History Section */}
      <FormSection>
        <SectionTitle>
          <FaShoppingBag style={{ marginRight: '0.5rem' }} />
          Order History
        </SectionTitle>
        
        <OrderHistory />
      </FormSection>
    </ProfileContainer>
  );
};

export default Profile;
