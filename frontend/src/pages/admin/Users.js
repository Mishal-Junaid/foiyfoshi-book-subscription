import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaUserEdit, FaUserPlus, FaTrash, FaUserCheck, FaSearch, FaEye, FaBook, FaFilter, FaTimes, FaChevronDown } from 'react-icons/fa';
import api from '../../services/api';

import Button from '../../components/ui/Button';
import { useNotification } from '../../components/ui/Notification';
import Spinner from '../../components/ui/Spinner';
import AdminLayout from '../../components/layout/AdminLayout';

const Container = styled.div`
  padding: 2rem;
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
`;

const SearchAndFilters = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  width: 300px;
  
  svg {
    color: #666;
    margin-right: 0.5rem;
  }
  
  input {
    border: none;
    background: transparent;
    outline: none;
    width: 100%;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FilterContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: ${props => props.hasFilters ? props.theme.colors.primary : '#f5f5f5'};
  color: ${props => props.hasFilters ? 'white' : '#333'};
  border: 1px solid ${props => props.hasFilters ? props.theme.colors.primary : '#ddd'};
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.hasFilters ? props.theme.colors.primaryDark : '#e9e9e9'};
  }
  
  svg {
    font-size: 0.8rem;
  }
`;

const FilterDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 300px;
  max-height: 400px;
  overflow-y: auto;
`;

const FilterSection = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const FilterSectionTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
`;

const FilterOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.25rem;
  border-radius: 3px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f9f9f9;
  }
  
  input[type="checkbox"] {
    margin: 0;
  }
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const FilterTag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  font-size: 0.8rem;
  
  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    
    &:hover {
      opacity: 0.8;
    }
  }
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background-color: #f5f5f5;
    color: #333;
  }
  
  tr:hover {
    background-color: #f9f9f9;
  }
  
  @media (max-width: 768px) {
    display: block;
    overflow-x: auto;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  background-color: ${props => 
    props.type === 'admin' ? props.theme.colors.gold : 
    props.type === 'verified' ? props.theme.colors.success : 
    props.theme.colors.danger};
  color: white;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  gap: 0.5rem;
`;

const PageButton = styled.button.withConfig({
  shouldForwardProp: prop => !['active'].includes(prop)
})`
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  background-color: ${props => props.active ? props.theme.colors.primary : 'white'};
  color: ${props => props.active ? 'white' : props.theme.colors.primary};
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? props.theme.colors.primary : '#f0f0f0'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h2 {
    margin: 0;
  }
  
  button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
  }
`;

const InfoSection = styled.div`
  margin-bottom: 1.5rem;
`;

const InfoTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
  }
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Tag = styled.span`
  background-color: #e0e0e0;
  padding: 0.25rem 0.5rem;
  border-radius: 16px;
  font-size: 0.85rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  
  h4 {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
  }
  
  p {
    margin: 0.5rem 0 0;
    font-size: 1.2rem;
    font-weight: bold;
  }
`;

// Available genres for filtering
const availableGenres = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Fantasy', 'Romance', 
  'Science Fiction', 'Biography', 'History', 'Self-Help', 
  'Young Adult', 'Children', 'Poetry', 'Travel', 'Cooking', 'Other'
];

const availableLanguages = ['English', 'Dhivehi', 'Both'];
const availableFrequencies = ['Daily', 'Few times a week', 'Weekly', 'Monthly', 'Occasionally'];

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedFrequencies, setSelectedFrequencies] = useState([]);
  
  const { addNotification } = useNotification();

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilters && !event.target.closest('.filter-container')) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  const fetchUsers = useCallback(async (page = 1, search = '', filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add headers for fallback admin authentication if needed
      const headers = {};
      const token = localStorage.getItem('token');
      if (token && token.includes('admin-fallback-token-')) {
        headers['x-admin-override'] = 'true';
        headers['admin-email'] = 'admin@foiyfoshi.mv';
      }
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      // Add filters
      if (filters.genres && filters.genres.length > 0) {
        params.append('genres', filters.genres.join(','));
      }
      
      if (filters.languages && filters.languages.length > 0) {
        params.append('languages', filters.languages.join(','));
      }
      
      if (filters.frequencies && filters.frequencies.length > 0) {
        params.append('frequencies', filters.frequencies.join(','));
      }
      
      const response = await api.get(`/users?${params.toString()}`, { headers });
      
      if (response.data && response.data.success) {
        setUsers(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalUsers(response.data.totalUsers || 0);
      } else {
        console.error('Unexpected API response format:', response.data);
        setError('Unexpected API response format');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const filters = {
      genres: selectedGenres,
      languages: selectedLanguages,
      frequencies: selectedFrequencies
    };
    fetchUsers(currentPage, searchTerm, filters);
  }, [currentPage, selectedGenres, selectedLanguages, selectedFrequencies, fetchUsers, searchTerm]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    const filters = {
      genres: selectedGenres,
      languages: selectedLanguages,
      frequencies: selectedFrequencies
    };
    fetchUsers(1, searchTerm, filters);
  };

  const handleGenreChange = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
    setCurrentPage(1);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
    setCurrentPage(1);
  };

  const handleFrequencyChange = (frequency) => {
    setSelectedFrequencies(prev => 
      prev.includes(frequency) 
        ? prev.filter(f => f !== frequency)
        : [...prev, frequency]
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedGenres([]);
    setSelectedLanguages([]);
    setSelectedFrequencies([]);
    setCurrentPage(1);
  };

  const removeFilter = (type, value) => {
    if (type === 'genre') {
      setSelectedGenres(prev => prev.filter(g => g !== value));
    } else if (type === 'language') {
      setSelectedLanguages(prev => prev.filter(l => l !== value));
    } else if (type === 'frequency') {
      setSelectedFrequencies(prev => prev.filter(f => f !== value));
    }
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedGenres.length > 0 || selectedLanguages.length > 0 || selectedFrequencies.length > 0;

  const handleVerifyUser = async (id) => {
    try {
      // Add headers for fallback admin authentication if needed
      const headers = {};
      const token = localStorage.getItem('token');
      if (token && token.includes('admin-fallback-token-')) {
        headers['x-admin-override'] = 'true';
        headers['admin-email'] = 'admin@foiyfoshi.mv';
      }
      
      await api.put(`/users/${id}/verify`, {}, { headers });
      addNotification({ message: 'User verified successfully', type: 'success' });
      const filters = {
        genres: selectedGenres,
        languages: selectedLanguages,
        frequencies: selectedFrequencies
      };
      fetchUsers(currentPage, searchTerm, filters);
    } catch (err) {
      addNotification({ message: 'Failed to verify user: ' + (err.response?.data?.error || err.message), type: 'error' });
      console.error('Error verifying user:', err.response?.data || err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      // Add headers for fallback admin authentication if needed
      const headers = {};
      const token = localStorage.getItem('token');
      if (token && token.includes('admin-fallback-token-')) {
        headers['x-admin-override'] = 'true';
        headers['admin-email'] = 'admin@foiyfoshi.mv';
      }
      
      await api.delete(`/users/${id}`, { headers });
      addNotification({ message: 'User deleted successfully', type: 'success' });
      const filters = {
        genres: selectedGenres,
        languages: selectedLanguages,
        frequencies: selectedFrequencies
      };
      fetchUsers(currentPage, searchTerm, filters);
    } catch (err) {
      addNotification({ message: 'Failed to delete user: ' + (err.response?.data?.error || err.message), type: 'error' });
      console.error('Error deleting user:', err.response?.data || err.message);
    }
  };

  const handleViewUserDetails = async (id) => {
    try {
      // Add headers for fallback admin authentication if needed
      const headers = {};
      const token = localStorage.getItem('token');
      if (token && token.includes('admin-fallback-token-')) {
        headers['x-admin-override'] = 'true';
        headers['admin-email'] = 'admin@foiyfoshi.mv';
      }
      
      const res = await api.get(`/users/${id}`, { headers });
      if (res.data && res.data.data) {
        setSelectedUser(res.data.data);
        setShowModal(true);
      } else {
        console.error('Unexpected API response format:', res.data);
        addNotification({ message: 'Unexpected API response format', type: 'error' });
      }
    } catch (err) {
      addNotification({ message: 'Failed to load user details: ' + (err.response?.data?.error || err.message), type: 'error' });
      console.error('Error loading user details:', err.response?.data || err.message);
    }
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };
  
  if (loading && users.length === 0) {
    return <Spinner />;
  }

  if (error) {
    return (
      <AdminLayout>
        <Container>
          <EmptyState>
            <h3>Error loading users</h3>
            <p>{error}</p>
            <Button onClick={() => {
              setError(null);
              fetchUsers(currentPage, searchTerm, {
                genres: selectedGenres,
                languages: selectedLanguages,
                frequencies: selectedFrequencies
              });
            }}>
              Try Again
            </Button>
          </EmptyState>
        </Container>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <Container>
      <Header>
        <div>
          <Title>User Management</Title>
          {totalUsers > 0 && (
            <p style={{ margin: '0.5rem 0', color: '#666' }}>
              {totalUsers} total users found
            </p>
          )}
        </div>
        <SearchAndFilters>
          <form onSubmit={handleSearch}>
            <SearchBar>
              <FaSearch />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </SearchBar>
          </form>
          
          <FilterContainer className="filter-container">
            <FilterButton 
              hasFilters={hasActiveFilters}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter />
              Filter by Interests
              <FaChevronDown />
            </FilterButton>
            
            {showFilters && (
              <FilterDropdown>
                <FilterSection>
                  <FilterSectionTitle>
                    <FaBook />
                    Favorite Genres
                  </FilterSectionTitle>
                  <FilterOptions>
                    {availableGenres.map(genre => (
                      <FilterOption key={genre}>
                        <input
                          type="checkbox"
                          checked={selectedGenres.includes(genre)}
                          onChange={() => handleGenreChange(genre)}
                        />
                        {genre}
                      </FilterOption>
                    ))}
                  </FilterOptions>
                </FilterSection>
                
                <FilterSection>
                  <FilterSectionTitle>Preferred Language</FilterSectionTitle>
                  <FilterOptions>
                    {availableLanguages.map(language => (
                      <FilterOption key={language}>
                        <input
                          type="checkbox"
                          checked={selectedLanguages.includes(language)}
                          onChange={() => handleLanguageChange(language)}
                        />
                        {language}
                      </FilterOption>
                    ))}
                  </FilterOptions>
                </FilterSection>
                
                <FilterSection>
                  <FilterSectionTitle>Reading Frequency</FilterSectionTitle>
                  <FilterOptions>
                    {availableFrequencies.map(frequency => (
                      <FilterOption key={frequency}>
                        <input
                          type="checkbox"
                          checked={selectedFrequencies.includes(frequency)}
                          onChange={() => handleFrequencyChange(frequency)}
                        />
                        {frequency}
                      </FilterOption>
                    ))}
                  </FilterOptions>
                </FilterSection>
                
                {hasActiveFilters && (
                  <FilterSection>
                    <Button 
                      variant="secondary" 
                      small 
                      onClick={clearAllFilters}
                    >
                      Clear All Filters
                    </Button>
                  </FilterSection>
                )}
              </FilterDropdown>
            )}
          </FilterContainer>
          
          <Button 
            icon={<FaUserPlus />}
            as={Link}
            to="/admin/users/new"
          >
            Add User
          </Button>
        </SearchAndFilters>
      </Header>
      
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <ActiveFilters>
          {selectedGenres.map(genre => (
            <FilterTag key={`genre-${genre}`}>
              Genre: {genre}
              <button onClick={() => removeFilter('genre', genre)}>
                <FaTimes />
              </button>
            </FilterTag>
          ))}
          {selectedLanguages.map(language => (
            <FilterTag key={`language-${language}`}>
              Language: {language}
              <button onClick={() => removeFilter('language', language)}>
                <FaTimes />
              </button>
            </FilterTag>
          ))}
          {selectedFrequencies.map(frequency => (
            <FilterTag key={`frequency-${frequency}`}>
              Frequency: {frequency}
              <button onClick={() => removeFilter('frequency', frequency)}>
                <FaTimes />
              </button>
            </FilterTag>
          ))}
        </ActiveFilters>
      )}
      
      {users.length > 0 ? (
        <>
          <UserTable>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Interests</th>
                <th>Registered On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.role === 'admin' ? (
                      <Badge type="admin">Admin</Badge>
                    ) : (
                      'User'
                    )}
                  </td>
                  <td>
                    {user.isVerified ? (
                      <Badge type="verified">Verified</Badge>
                    ) : (
                      <Badge type="unverified">Unverified</Badge>
                    )}
                  </td>
                  <td>
                    {user.interests && user.interests.genres && user.interests.genres.length > 0 ? (
                      <span>{user.interests.genres.length} genres</span>
                    ) : (
                      <span style={{ color: '#999' }}>No interests</span>
                    )}
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <ActionButtons>
                      <Button 
                        small 
                        icon={<FaEye />}
                        onClick={() => handleViewUserDetails(user._id)}
                        title="View Details"
                      />
                      <Button 
                        small 
                        variant="secondary"
                        icon={<FaUserEdit />}
                        as={Link}
                        to={`/admin/users/edit/${user._id}`}
                        title="Edit User"
                      />
                      {!user.isVerified && (
                        <Button 
                          small 
                          variant="success"
                          icon={<FaUserCheck />}
                          onClick={() => handleVerifyUser(user._id)}
                          title="Verify User"
                        />
                      )}
                      <Button 
                        small 
                        variant="danger"
                        icon={<FaTrash />}
                        onClick={() => handleDeleteUser(user._id)}
                        title="Delete User"
                      />
                    </ActionButtons>
                  </td>
                </tr>
              ))}
            </tbody>
          </UserTable>
          
          <Pagination>
            <PageButton 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              Previous
            </PageButton>
            
            {[...Array(totalPages).keys()].map(page => (
              <PageButton 
                key={page + 1}
                active={currentPage === page + 1}
                onClick={() => setCurrentPage(page + 1)}
              >
                {page + 1}
              </PageButton>
            ))}
            
            <PageButton 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Next
            </PageButton>
          </Pagination>
        </>
      ) : (
        <EmptyState>
          <h3>No users found</h3>
          <p>Try adjusting your search criteria or filters</p>
        </EmptyState>
      )}
      
      {/* User Details Modal */}
      {showModal && selectedUser && (
        <Modal onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>{selectedUser.name}</h2>
              <button onClick={closeModal}>&times;</button>
            </ModalHeader>
            
            <StatsGrid>
              <StatCard>
                <h4>Role</h4>
                <p>{selectedUser.role === 'admin' ? 'Admin' : 'User'}</p>
              </StatCard>
              <StatCard>
                <h4>Status</h4>
                <p>{selectedUser.isVerified ? 'Verified' : 'Unverified'}</p>
              </StatCard>
              <StatCard>
                <h4>Joined</h4>
                <p>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </StatCard>
              {selectedUser.lastLogin && (
                <StatCard>
                  <h4>Last Login</h4>
                  <p>{new Date(selectedUser.lastLogin).toLocaleDateString()}</p>
                </StatCard>
              )}
            </StatsGrid>
            
            <InfoSection>
              <InfoTitle>Contact Information</InfoTitle>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone:</strong> {selectedUser.phone || 'Not provided'}</p>
            </InfoSection>
            
            {selectedUser.address && (
              <InfoSection>
                <InfoTitle>Address</InfoTitle>
                <p>
                  {selectedUser.address.street && `${selectedUser.address.street}, `}
                  {selectedUser.address.city && `${selectedUser.address.city}, `}
                  {selectedUser.address.state && `${selectedUser.address.state}, `}
                  {selectedUser.address.postalCode && `${selectedUser.address.postalCode}, `}
                  {selectedUser.address.country && selectedUser.address.country}
                </p>
              </InfoSection>
            )}
            
            {selectedUser.bio && (
              <InfoSection>
                <InfoTitle>Bio</InfoTitle>
                <p>{selectedUser.bio}</p>
              </InfoSection>
            )}
            
            {selectedUser.interests && (
              <InfoSection>
                <InfoTitle>
                  <FaBook />
                  Reading Preferences
                </InfoTitle>
                
                {selectedUser.interests.genres && selectedUser.interests.genres.length > 0 && (
                  <div>
                    <p><strong>Favorite Genres:</strong></p>
                    <TagsList>
                      {selectedUser.interests.genres.map((genre, index) => (
                        <Tag key={index}>{genre}</Tag>
                      ))}
                    </TagsList>
                  </div>
                )}
                
                {selectedUser.interests.authors && selectedUser.interests.authors.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <p><strong>Favorite Authors:</strong></p>
                    <TagsList>
                      {selectedUser.interests.authors.map((author, index) => (
                        <Tag key={index}>{author}</Tag>
                      ))}
                    </TagsList>
                  </div>
                )}
                
                {selectedUser.interests.preferredLanguage && (
                  <p style={{ marginTop: '1rem' }}>
                    <strong>Preferred Language:</strong> {selectedUser.interests.preferredLanguage}
                  </p>
                )}
                
                {selectedUser.interests.readingFrequency && (
                  <p>
                    <strong>Reading Frequency:</strong> {selectedUser.interests.readingFrequency.charAt(0).toUpperCase() + selectedUser.interests.readingFrequency.slice(1)}
                  </p>
                )}
              </InfoSection>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <Button 
                variant="secondary"
                as={Link}
                to={`/admin/users/edit/${selectedUser._id}`}
                icon={<FaUserEdit />}
              >
                Edit User
              </Button>
              
              {!selectedUser.isVerified && (
                <Button 
                  variant="success"
                  icon={<FaUserCheck />}
                  onClick={() => {
                    handleVerifyUser(selectedUser._id);
                    closeModal();
                  }}
                >
                  Verify User
                </Button>
              )}
              
              <Button 
                variant="danger"
                icon={<FaTrash />}
                onClick={() => {
                  closeModal();
                  handleDeleteUser(selectedUser._id);
                }}
              >
                Delete User
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
    </AdminLayout>
  );
}

export default Users;
