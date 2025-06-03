import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTrash } from 'react-icons/fa';
import Button from '../ui/Button';
import { FormInput } from '../ui/FormElements';

const LinkContainer = styled.div`
  margin-top: 1rem;
`;

const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const LinkItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: #f9f9f9;
  border-radius: 4px;
  
  &:hover {
    background: #f3f3f3;
  }
`;

const LinkText = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const LinkTitle = styled.span`
  font-weight: 600;
`;

const LinkUrl = styled.span`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.primary};
`;

const DeleteIcon = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.danger};
  cursor: pointer;
  padding: 0.5rem;
  margin-left: 0.5rem;
`;

const LinkFormGroup = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FormCol = styled.div`
  flex: 1;
`;

// Link Manager Component
const LinkManager = ({ contentId, links = [], onAddLink, onRemoveLink }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const handleAddLink = () => {
    if (!linkUrl.trim() || !linkText.trim()) return;
    
    onAddLink({
      url: linkUrl,
      text: linkText
    });
    
    // Reset form
    setLinkUrl('');
    setLinkText('');
  };

  return (
    <LinkContainer>
      <h4>Links</h4>
      
      {links.length > 0 ? (
        <LinkList>
          {links.map((link, index) => (
            <LinkItem key={link._id || index}>
              <LinkText>
                <LinkTitle>{link.text}</LinkTitle>
                <LinkUrl>{link.url}</LinkUrl>
              </LinkText>
              <DeleteIcon onClick={() => onRemoveLink(link._id || index)}>
                <FaTrash />
              </DeleteIcon>
            </LinkItem>
          ))}
        </LinkList>
      ) : (
        <p>No links added yet.</p>
      )}
      
      <LinkFormGroup>
        <FormRow>
          <FormCol>
            <FormInput
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Link text"
            />
          </FormCol>
          <FormCol>
            <FormInput
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="URL"
            />
          </FormCol>
        </FormRow>
        <Button 
          onClick={handleAddLink} 
          icon={<FaPlus />}
          disabled={!linkUrl || !linkText}
          style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
        >
          Add Link
        </Button>
      </LinkFormGroup>
    </LinkContainer>
  );
};

export default LinkManager;
