import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';

const PreviewContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  margin-top: 10px;
  border-radius: 5px;
  overflow: hidden;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: white;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: rgba(255, 0, 0, 0.6);
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  font-size: 0.8rem;
  margin-top: 5px;
`;

const ImagePreview = ({ imageUrl, alt, onRemove }) => {
  const [error, setError] = useState(false);
  
  const handleImageError = () => {
    setError(true);
  };

  return (
    <>
      {!error ? (
        <PreviewContainer>
          <PreviewImage 
            src={imageUrl} 
            alt={alt || 'Preview'} 
            onError={handleImageError} 
          />
          <RemoveButton onClick={onRemove}>
            <FaTimes size={12} />
          </RemoveButton>
        </PreviewContainer>
      ) : (
        <div>
          <ErrorMessage>Image URL is invalid or cannot be loaded</ErrorMessage>
          <RemoveButton onClick={onRemove} style={{ position: 'relative', marginTop: '5px' }}>
            <FaTimes size={12} />
          </RemoveButton>
        </div>
      )}
    </>
  );
};

export default ImagePreview;
