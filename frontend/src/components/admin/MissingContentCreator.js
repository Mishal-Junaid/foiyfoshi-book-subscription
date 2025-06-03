import React, { useState } from 'react';
import styled from 'styled-components';
import { FaMagic } from 'react-icons/fa';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { useNotification } from '../ui/Notification';
import { useContent } from '../../context/ContentContext';
import { createMissingContent, checkMissingContent } from '../../utils/createMissingContent';

const Container = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const Title = styled.h3`
  margin-top: 0;
`;

const StatusContainer = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background-color: ${props => props.$success ? '#d4edda' : '#f8d7da'};
  border: 1px solid ${props => props.$success ? '#c3e6cb' : '#f5c6cb'};
  border-radius: 4px;
  color: ${props => props.$success ? '#155724' : '#721c24'};
`;

const MissingList = styled.ul`
  margin: 1rem 0;
  padding-left: 1.5rem;
`;

const MissingContentCreator = ({ onContentCreated }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [missingContent, setMissingContent] = useState(null);
  const { addNotification } = useNotification();
  const { refreshContent } = useContent();

  const handleCheckMissing = async () => {
    setLoading(true);
    try {
      const result = await checkMissingContent();
      setMissingContent(result);
      
      if (result.success) {
        if (result.missingCount === 0) {
          setStatus({ 
            success: true, 
            message: 'All required content sections exist!' 
          });
        } else {
          setStatus({
            success: false,
            message: `Found ${result.missingCount} missing content sections.`
          });
        }
      } else {
        setStatus({
          success: false,
          message: result.message || 'Failed to check for missing content.'
        });
      }
    } catch (error) {
      console.error('Error checking for missing content:', error);
      setStatus({
        success: false,
        message: error.message || 'An error occurred while checking content.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMissing = async () => {
    setLoading(true);
    try {
      const result = await createMissingContent();
      
      if (result.success) {
        setStatus({
          success: true,
          message: `Successfully created ${result.created.length} content sections!`
        });
        
        // Refresh the content context and notify
        await refreshContent();
        addNotification({ 
          message: 'Missing content created and front-end refreshed', 
          type: 'success' 
        });
        
        // Update the parent component
        if (onContentCreated) {
          onContentCreated();
        }
        
        // Reset the missing content state
        await handleCheckMissing();
      } else {
        setStatus({
          success: false,
          message: result.message || 'Failed to create content sections.'
        });
      }
    } catch (error) {
      console.error('Error creating content:', error);
      setStatus({
        success: false,
        message: error.message || 'An error occurred while creating content.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Missing Content Generator</Title>
      <p>This tool checks for missing content sections and can automatically create them.</p>
      
      {status && (
        <StatusContainer $success={status.success}>
          {status.message}
        </StatusContainer>
      )}
      
      {missingContent && missingContent.missingSections && missingContent.missingSections.length > 0 && (
        <>
          <p>Missing content sections:</p>
          <MissingList>
            {missingContent.missingSections.map(section => (
              <li key={section}>{section}</li>
            ))}
          </MissingList>
        </>
      )}
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <Button
          onClick={handleCheckMissing}
          disabled={loading}
          variant="primary"
        >
          {loading ? <Spinner size={16} /> : 'Check Missing Content'}
        </Button>
        
        {missingContent && missingContent.missingSections && missingContent.missingSections.length > 0 && (
          <Button
            onClick={handleCreateMissing}
            disabled={loading}
            variant="primary"
            icon={<FaMagic />}
            style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1' }}
          >
            {loading ? <Spinner size={16} /> : 'Create Missing Content'}
          </Button>
        )}
      </div>
    </Container>
  );
};

export default MissingContentCreator;
