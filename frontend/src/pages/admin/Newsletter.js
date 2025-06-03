import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaEnvelope, FaTrash, FaPlus, FaUsers, FaPaperPlane, FaEye, FaEyeSlash } from 'react-icons/fa';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  getNewsletterSubscribers,
  sendNewsletter,
  addNewsletterSubscriber,
  deleteNewsletterSubscriber,
} from '../../services/newsletterService';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: ${props => props.theme.colors.black};
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
`;

const Tab = styled.button`
  padding: 1rem 2rem;
  border: none;
  background: none;
  font-size: 1rem;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  
  &.active {
    border-bottom-color: ${props => props.theme.colors.gold};
    color: ${props => props.theme.colors.gold};
    font-weight: 600;
  }
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  
  h3 {
    font-size: 2rem;
    margin: 0;
    color: ${props => props.theme.colors.gold};
  }
  
  p {
    margin: 0.5rem 0 0;
    color: #666;
  }
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: between;
  align-items: center;
  
  h2 {
    margin: 0;
    color: ${props => props.theme.colors.black};
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  min-width: 200px;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &.primary {
    background: ${props => props.theme.colors.gold};
    color: white;
    
    &:hover {
      background: ${props => props.theme.colors.darkGold};
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  }
  
  &.danger {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }
  
  th {
    background-color: #f8f9fa;
    font-weight: 600;
  }
  
  tr:hover {
    background-color: #f8f9fa;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  
  &.active {
    background: #d4edda;
    color: #155724;
  }
  
  &.inactive {
    background: #f8d7da;
    color: #721c24;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  input, textarea, select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.gold};
    }
  }
  
  textarea {
    min-height: 120px;
    resize: vertical;
  }
`;

const EmailPreview = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  background: #f8f9fa;
  margin-top: 1rem;
  
  h4 {
    margin: 0 0 1rem 0;
    color: ${props => props.theme.colors.gold};
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  
  button {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
    
    &:hover {
      background: #f8f9fa;
    }
    
    &.active {
      background: ${props => props.theme.colors.gold};
      color: white;
      border-color: ${props => props.theme.colors.gold};
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const AlertMessage = styled.div`
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  
  &.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  &.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  &.info {
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
  }
`;

const Newsletter = () => {
  const [activeTab, setActiveTab] = useState('subscribers');
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Add subscriber
  const [newEmail, setNewEmail] = useState('');
  
  // Newsletter composition
  const [newsletter, setNewsletter] = useState({
    subject: '',
    content: '',
    htmlContent: '',
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (activeTab === 'subscribers') {
      fetchSubscribers();
    }
  }, [activeTab, currentPage, statusFilter]);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 20,
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const response = await getNewsletterSubscribers(params);
      setSubscribers(response.data);
      setTotalPages(Math.ceil(response.total / 20));
      
      // Update stats
      const allResponse = await getNewsletterSubscribers();
      const activeCount = allResponse.data.filter(sub => sub.isActive).length;
      const inactiveCount = allResponse.data.filter(sub => !sub.isActive).length;
      
      setStats({
        total: allResponse.total,
        active: activeCount,
        inactive: inactiveCount,
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch subscribers' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    
    try {
      await addNewsletterSubscriber(newEmail);
      setMessage({ type: 'success', text: 'Subscriber added successfully' });
      setNewEmail('');
      fetchSubscribers();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to add subscriber';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  const handleDeleteSubscriber = async (subscriberId) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) return;
    
    try {
      await deleteNewsletterSubscriber(subscriberId);
      setMessage({ type: 'success', text: 'Subscriber deleted successfully' });
      fetchSubscribers();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete subscriber' });
    }
  };

  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    
    if (!newsletter.subject.trim() || (!newsletter.content.trim() && !newsletter.htmlContent.trim())) {
      setMessage({ type: 'error', text: 'Please provide subject and content' });
      return;
    }
    
    if (!window.confirm(`Are you sure you want to send this newsletter to ${stats.active} active subscribers?`)) {
      return;
    }
    
    setSending(true);
    try {
      const response = await sendNewsletter(newsletter);
      setMessage({ 
        type: 'success', 
        text: `Newsletter sent successfully to ${response.data.successful} subscribers` 
      });
      setNewsletter({ subject: '', content: '', htmlContent: '' });
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to send newsletter';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSending(false);
    }
  };

  const generateHTMLPreview = () => {
    if (newsletter.htmlContent) {
      return newsletter.htmlContent;
    }
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="text-align: center; padding: 20px; background-color: #805A29;">
          <h1 style="color: #ffffff; margin: 0;">FoiyFoshi Books</h1>
        </header>
        
        <div style="padding: 20px; border: 1px solid #eee; border-top: none;">
          <h2>${newsletter.subject}</h2>
          <div style="white-space: pre-wrap;">${newsletter.content}</div>
        </div>
        
        <footer style="text-align: center; padding: 15px; font-size: 12px; color: #666;">
          <p>&copy; ${new Date().getFullYear()} FoiyFoshi Books. All rights reserved.</p>
        </footer>
      </div>
    `;
  };

  return (
    <AdminLayout>
      <PageContainer>
        <PageTitle>Newsletter Management</PageTitle>
        
        <StatsContainer>
          <StatCard>
            <h3>{stats.total}</h3>
            <p>Total Subscribers</p>
          </StatCard>
          <StatCard>
            <h3>{stats.active}</h3>
            <p>Active Subscribers</p>
          </StatCard>
          <StatCard>
            <h3>{stats.inactive}</h3>
            <p>Inactive Subscribers</p>
          </StatCard>
        </StatsContainer>

        {message.text && (
          <AlertMessage className={message.type}>
            {message.text}
          </AlertMessage>
        )}

        <TabContainer>
          <Tab 
            className={activeTab === 'subscribers' ? 'active' : ''} 
            onClick={() => setActiveTab('subscribers')}
          >
            <FaUsers /> Subscribers
          </Tab>
          <Tab 
            className={activeTab === 'compose' ? 'active' : ''} 
            onClick={() => setActiveTab('compose')}
          >
            <FaEnvelope /> Compose Newsletter
          </Tab>
        </TabContainer>

        {activeTab === 'subscribers' && (
          <ContentCard>
            <CardHeader>
              <h2>Newsletter Subscribers</h2>
            </CardHeader>
            <CardContent>
              <FilterContainer>
                <FilterSelect 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Subscribers</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </FilterSelect>
                
                <form onSubmit={handleAddSubscriber} style={{ display: 'flex', gap: '0.5rem' }}>
                  <SearchInput
                    type="email"
                    placeholder="Add new subscriber email..."
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <Button type="submit" className="primary">
                    <FaPlus /> Add
                  </Button>
                </form>
              </FilterContainer>

              {loading ? (
                <p>Loading subscribers...</p>
              ) : (
                <>
                  <Table>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Subscribed Date</th>
                        <th>Source</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((subscriber) => (
                        <tr key={subscriber._id}>
                          <td>{subscriber.email}</td>
                          <td>
                            <StatusBadge className={subscriber.isActive ? 'active' : 'inactive'}>
                              {subscriber.isActive ? 'Active' : 'Inactive'}
                            </StatusBadge>
                          </td>
                          <td>{new Date(subscriber.subscribedAt).toLocaleDateString()}</td>
                          <td>{subscriber.source}</td>
                          <td>
                            <Button 
                              className="danger" 
                              onClick={() => handleDeleteSubscriber(subscriber._id)}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {totalPages > 1 && (
                    <Pagination>
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          className={currentPage === index + 1 ? 'active' : ''}
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </Pagination>
                  )}
                </>
              )}
            </CardContent>
          </ContentCard>
        )}

        {activeTab === 'compose' && (
          <ContentCard>
            <CardHeader>
              <h2>Compose Newsletter</h2>
              <Button 
                className="secondary" 
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? <FaEyeSlash /> : <FaEye />} 
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
            </CardHeader>
            <CardContent>
              {!previewMode ? (
                <form onSubmit={handleSendNewsletter}>
                  <FormGroup>
                    <label>Subject</label>
                    <input
                      type="text"
                      value={newsletter.subject}
                      onChange={(e) => setNewsletter(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Newsletter subject..."
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Content (Plain Text)</label>
                    <textarea
                      value={newsletter.content}
                      onChange={(e) => setNewsletter(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Newsletter content..."
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>HTML Content (Optional)</label>
                    <textarea
                      value={newsletter.htmlContent}
                      onChange={(e) => setNewsletter(prev => ({ ...prev, htmlContent: e.target.value }))}
                      placeholder="HTML content (will override plain text if provided)..."
                      style={{ fontFamily: 'monospace' }}
                    />
                  </FormGroup>

                  <Button 
                    type="submit" 
                    className="primary" 
                    disabled={sending || stats.active === 0}
                  >
                    <FaPaperPlane /> 
                    {sending ? 'Sending...' : `Send to ${stats.active} Active Subscribers`}
                  </Button>
                </form>
              ) : (
                <EmailPreview>
                  <h4>Email Preview</h4>
                  <div dangerouslySetInnerHTML={{ __html: generateHTMLPreview() }} />
                </EmailPreview>
              )}
            </CardContent>
          </ContentCard>
        )}
      </PageContainer>
    </AdminLayout>
  );
};

export default Newsletter; 