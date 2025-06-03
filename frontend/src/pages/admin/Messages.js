import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaEnvelope, 
  FaEnvelopeOpen, 
  FaReply, 
  FaTrash, 
  FaSearch, 
  FaFilter,
  FaEye,
  FaExclamationCircle,
  FaClock,
  FaCheckCircle,
  FaArchive,
  FaSort
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/ui/Button';
import { FormInput, FormTextarea } from '../../components/ui/FormElements';
import { useNotification } from '../../components/ui/Notification';
import Spinner from '../../components/ui/Spinner';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import * as contactService from '../../services/contactService';

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .icon {
    font-size: 2rem;
    color: ${props => props.theme.colors.gold};
  }
  
  .content {
    flex: 1;
    
    .number {
      font-size: 1.5rem;
      font-weight: bold;
      color: ${props => props.theme.colors.black};
      margin: 0;
    }
    
    .label {
      font-size: 0.9rem;
      color: #666;
      margin: 0;
    }
  }
`;

const FiltersContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.gold};
  }
`;

const MessagesContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const MessagesList = styled.div`
  display: flex;
  flex-direction: column;
`;

const MessageItem = styled(motion.div)`
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  
  &:hover {
    background-color: #f9f9f9;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => props.$isUnread && `
    background-color: #fff8e1;
    border-left: 4px solid ${props.theme.colors.gold};
  `}
`;

const MessageIcon = styled.div`
  font-size: 1.2rem;
  color: ${props => props.$isUnread ? props.theme.colors.gold : '#666'};
  margin-top: 0.2rem;
`;

const MessageContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 1rem;
`;

const MessageInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MessageFrom = styled.h3`
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: ${props => props.theme.colors.black};
  font-weight: ${props => props.$isUnread ? '600' : '500'};
`;

const MessageEmail = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #666;
`;

const MessageMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #666;
`;

const MessageSubject = styled.p`
  margin: 0.5rem 0;
  font-size: 0.95rem;
  color: ${props => props.theme.colors.black};
  font-weight: ${props => props.$isUnread ? '500' : 'normal'};
`;

const MessagePreview = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const MessageActions = styled.div`
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${MessageItem}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f0f0f0;
    color: ${props => props.theme.colors.gold};
  }
  
  &.danger:hover {
    background-color: #ffe6e6;
    color: #dc3545;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  
  &.new {
    background-color: #fff3cd;
    color: #856404;
  }
  
  &.read {
    background-color: #d1ecf1;
    color: #0c5460;
  }
  
  &.replied {
    background-color: #d4edda;
    color: #155724;
  }
  
  &.resolved {
    background-color: #e2e3e5;
    color: #495057;
  }
  
  &.archived {
    background-color: #f8d7da;
    color: #721c24;
  }
`;

const PriorityBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  
  &.low {
    background-color: #e2e3e5;
    color: #495057;
  }
  
  &.normal {
    background-color: #d1ecf1;
    color: #0c5460;
  }
  
  &.high {
    background-color: #fff3cd;
    color: #856404;
  }
  
  &.urgent {
    background-color: #f8d7da;
    color: #721c24;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f0f0f0;
  background-color: #f9f9f9;
`;

const PaginationInfo = styled.span`
  font-size: 0.9rem;
  color: #666;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.theme.colors.lightGold};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.active {
    background-color: ${props => props.theme.colors.gold};
    color: white;
    border-color: ${props => props.theme.colors.gold};
  }
`;

// Modal styles
const Modal = styled(motion.div)`
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

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.black};
`;

const CloseButton = styled.button`
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

const MessageDetails = styled.div`
  margin-bottom: 2rem;
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 1rem;
  
  .label {
    font-weight: 600;
    min-width: 100px;
    color: ${props => props.theme.colors.black};
  }
  
  .value {
    flex: 1;
    color: #666;
  }
`;

const MessageText = styled.div`
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid ${props => props.theme.colors.gold};
  margin: 1rem 0;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const ReplySection = styled.div`
  border-top: 2px solid #f0f0f0;
  padding-top: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.black};
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
`;

function Messages() {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    category: '',
    priority: '',
    search: ''
  });
  
  // Pagination
  const [pagination, setPagination] = useState({});
  
  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'confirm'
  });
  
  const { addNotification } = useNotification();

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const [messagesResponse, statsResponse] = await Promise.all([
        contactService.getContactMessages(filters),
        contactService.getContactStats()
      ]);
      
      setMessages(messagesResponse.data);
      setPagination(messagesResponse.pagination);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      addNotification('Failed to fetch messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // View message details
  const viewMessage = async (message) => {
    try {
      const response = await contactService.getContactMessage(message._id);
      setSelectedMessage(response.data);
      setReplyText('');
      setAdminNotes(response.data.adminNotes || '');
      setIsModalOpen(true);
      
      // Refresh messages list to update read status
      fetchMessages();
    } catch (error) {
      console.error('Error fetching message details:', error);
      addNotification('Failed to load message details', 'error');
    }
  };

  // Send reply
  const handleSendReply = async () => {
    if (!replyText.trim()) {
      addNotification('Please enter a reply message', 'error');
      return;
    }

    try {
      setSendingReply(true);
      await contactService.replyToMessage(selectedMessage._id, {
        replyMessage: replyText,
        adminNotes: adminNotes
      });
      
      addNotification('Reply sent successfully!', 'success');
      setIsModalOpen(false);
      fetchMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      addNotification(error.error || 'Failed to send reply', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  // Update message status
  const updateMessageStatus = async (messageId, status) => {
    try {
      await contactService.updateMessageStatus(messageId, { status });
      addNotification(`Message marked as ${status}`, 'success');
      fetchMessages();
    } catch (error) {
      console.error('Error updating message status:', error);
      addNotification('Failed to update message status', 'error');
    }
  };

  // Delete message
  const deleteMessage = (messageId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Message',
      message: 'Are you sure you want to delete this message? This action cannot be undone.',
      type: 'confirm',
      onConfirm: async () => {
        try {
          await contactService.deleteContactMessage(messageId);
          addNotification('Message deleted successfully', 'success');
          fetchMessages();
          if (selectedMessage?._id === messageId) {
            setIsModalOpen(false);
          }
        } catch (error) {
          console.error('Error deleting message:', error);
          addNotification('Failed to delete message', 'error');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { 
        weekday: 'short' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading && messages.length === 0) {
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
          <Title>Contact Messages</Title>
        </Header>

        {/* Statistics */}
        <StatsContainer>
          <StatCard>
            <FaEnvelope className="icon" />
            <div className="content">
              <p className="number">{stats.total || 0}</p>
              <p className="label">Total Messages</p>
            </div>
          </StatCard>
          <StatCard>
            <FaExclamationCircle className="icon" />
            <div className="content">
              <p className="number">{stats.unread || 0}</p>
              <p className="label">Unread</p>
            </div>
          </StatCard>
          <StatCard>
            <FaClock className="icon" />
            <div className="content">
              <p className="number">{stats.recent || 0}</p>
              <p className="label">This Week</p>
            </div>
          </StatCard>
          <StatCard>
            <FaCheckCircle className="icon" />
            <div className="content">
              <p className="number">{stats.byStatus?.replied || 0}</p>
              <p className="label">Replied</p>
            </div>
          </StatCard>
        </StatsContainer>

        {/* Filters */}
        <FiltersContainer>
          <FiltersGrid>
            <div>
              <Label>Search</Label>
              <FormInput
                type="text"
                placeholder="Search messages..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                icon={<FaSearch />}
              />
            </div>
            
            <div>
              <Label>Status</Label>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="resolved">Resolved</option>
                <option value="archived">Archived</option>
              </Select>
            </div>
            
            <div>
              <Label>Category</Label>
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="general">General</option>
                <option value="support">Support</option>
                <option value="billing">Billing</option>
                <option value="technical">Technical</option>
                <option value="feedback">Feedback</option>
                <option value="partnership">Partnership</option>
              </Select>
            </div>
            
            <div>
              <Label>Priority</Label>
              <Select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>
            
            <Button
              variant="secondary"
              onClick={() => setFilters({
                page: 1,
                limit: 20,
                status: '',
                category: '',
                priority: '',
                search: ''
              })}
            >
              Clear
            </Button>
          </FiltersGrid>
        </FiltersContainer>

        {/* Messages List */}
        <MessagesContainer>
          {messages.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
              <FaEnvelope style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
              <p>No messages found</p>
            </div>
          ) : (
            <>
              <MessagesList>
                <AnimatePresence>
                  {messages.map((message) => (
                    <MessageItem
                      key={message._id}
                      $isUnread={message.status === 'new'}
                      onClick={() => viewMessage(message)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <MessageIcon $isUnread={message.status === 'new'}>
                        {message.status === 'new' ? <FaEnvelope /> : <FaEnvelopeOpen />}
                      </MessageIcon>
                      
                      <MessageContent>
                        <MessageHeader>
                          <MessageInfo>
                            <MessageFrom $isUnread={message.status === 'new'}>
                              {message.name}
                            </MessageFrom>
                            <MessageEmail>{message.email}</MessageEmail>
                          </MessageInfo>
                          
                          <MessageMeta>
                            <span>{formatDate(message.createdAt)}</span>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <StatusBadge className={message.status}>
                                {message.status}
                              </StatusBadge>
                              <PriorityBadge className={message.priority}>
                                {message.priority}
                              </PriorityBadge>
                            </div>
                          </MessageMeta>
                        </MessageHeader>
                        
                        <MessageSubject $isUnread={message.status === 'new'}>
                          {message.subject}
                        </MessageSubject>
                        
                        <MessagePreview>
                          {message.message}
                        </MessagePreview>
                      </MessageContent>
                      
                      <MessageActions onClick={(e) => e.stopPropagation()}>
                        <ActionButton
                          onClick={() => viewMessage(message)}
                          title="View Details"
                        >
                          <FaEye />
                        </ActionButton>
                        <ActionButton
                          onClick={() => updateMessageStatus(message._id, 'archived')}
                          title="Archive"
                        >
                          <FaArchive />
                        </ActionButton>
                        <ActionButton
                          className="danger"
                          onClick={() => deleteMessage(message._id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </ActionButton>
                      </MessageActions>
                    </MessageItem>
                  ))}
                </AnimatePresence>
              </MessagesList>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Pagination>
                  <PaginationInfo>
                    Showing {((pagination.currentPage - 1) * filters.limit) + 1} to{' '}
                    {Math.min(pagination.currentPage * filters.limit, pagination.totalMessages)} of{' '}
                    {pagination.totalMessages} messages
                  </PaginationInfo>
                  
                  <PaginationButtons>
                    <PaginationButton
                      disabled={!pagination.hasPrevPage}
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                    >
                      Previous
                    </PaginationButton>
                    
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        const current = pagination.currentPage;
                        return page === 1 || page === pagination.totalPages || 
                               (page >= current - 1 && page <= current + 1);
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] < page - 1 && (
                            <span style={{ padding: '0.5rem' }}>...</span>
                          )}
                          <PaginationButton
                            className={page === pagination.currentPage ? 'active' : ''}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </PaginationButton>
                        </React.Fragment>
                      ))}
                    
                    <PaginationButton
                      disabled={!pagination.hasNextPage}
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                    >
                      Next
                    </PaginationButton>
                  </PaginationButtons>
                </Pagination>
              )}
            </>
          )}
        </MessagesContainer>

        {/* Message Details Modal */}
        <AnimatePresence>
          {isModalOpen && selectedMessage && (
            <Modal
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            >
              <ModalContent
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <ModalHeader>
                  <ModalTitle>Message Details</ModalTitle>
                  <CloseButton onClick={() => setIsModalOpen(false)}>
                    ×
                  </CloseButton>
                </ModalHeader>

                <MessageDetails>
                  <DetailRow>
                    <span className="label">From:</span>
                    <span className="value">{selectedMessage.name}</span>
                  </DetailRow>
                  <DetailRow>
                    <span className="label">Email:</span>
                    <span className="value">{selectedMessage.email}</span>
                  </DetailRow>
                  <DetailRow>
                    <span className="label">Subject:</span>
                    <span className="value">{selectedMessage.subject}</span>
                  </DetailRow>
                  <DetailRow>
                    <span className="label">Date:</span>
                    <span className="value">
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </span>
                  </DetailRow>
                  <DetailRow>
                    <span className="label">Status:</span>
                    <span className="value">
                      <StatusBadge className={selectedMessage.status}>
                        {selectedMessage.status}
                      </StatusBadge>
                    </span>
                  </DetailRow>
                  <DetailRow>
                    <span className="label">Priority:</span>
                    <span className="value">
                      <PriorityBadge className={selectedMessage.priority}>
                        {selectedMessage.priority}
                      </PriorityBadge>
                    </span>
                  </DetailRow>
                </MessageDetails>

                <div>
                  <Label>Original Message:</Label>
                  <MessageText>{selectedMessage.message}</MessageText>
                </div>

                {selectedMessage.replyMessage && (
                  <div>
                    <Label>Previous Reply:</Label>
                    <MessageText style={{ borderLeftColor: '#28a745' }}>
                      {selectedMessage.replyMessage}
                    </MessageText>
                    <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.5rem 0' }}>
                      Replied on {new Date(selectedMessage.repliedAt).toLocaleString()}
                      {selectedMessage.repliedBy && ` by ${selectedMessage.repliedBy.name}`}
                    </p>
                  </div>
                )}

                <ReplySection>
                  <h3>Send Reply</h3>
                  
                  <FormGroup>
                    <Label>Reply Message *</Label>
                    <FormTextarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      rows={6}
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Admin Notes (Internal)</Label>
                    <FormTextarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes about this message..."
                      rows={3}
                    />
                  </FormGroup>

                  <ActionButtons>
                    <Button
                      variant="secondary"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      onClick={() => updateMessageStatus(selectedMessage._id, 'resolved')}
                      variant="secondary"
                    >
                      Mark as Resolved
                    </Button>
                    
                    <Button
                      onClick={handleSendReply}
                      loading={sendingReply}
                      disabled={!replyText.trim()}
                      icon={<FaReply />}
                    >
                      Send Reply
                    </Button>
                  </ActionButtons>
                </ReplySection>
              </ModalContent>
            </Modal>
          )}
        </AnimatePresence>

        {/* Confirmation Dialog */}
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

export default Messages; 