import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTrash, FaExternalLinkAlt, FaUpload } from 'react-icons/fa';
import Button from '../ui/Button';
import { FormInput } from '../ui/FormElements';
import ImagePreview from './ImagePreview';
import { uploadContentImages } from '../../services/contentService';
import { uploadProductImages } from '../../services/productService';

const ImageContainer = styled.div`
  margin-top: 1rem;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ImageItem = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Image = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
`;

const PreviewSection = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${ImageItem}:hover & {
    opacity: 1;
  }
`;

const DeleteButton = styled.button`
  background: ${props => props.theme.colors.danger};
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme.colors.dangerDark || '#c82333'};
  }
`;

const ImageFormGroup = styled.div`
  margin-top: 1rem;
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

const FileUploadSection = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border: 2px dashed ${props => props.theme.colors.border || '#ddd'};
  border-radius: 8px;
  text-align: center;
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: inline-block;
  padding: 0.5rem 1rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark || '#0056b3'};
  }
`;

const UploadProgress = styled.div`
  margin-top: 1rem;
  padding: 0.5rem;
  background: ${props => props.theme.colors.light || '#f8f9fa'};
  border-radius: 4px;
  font-size: 0.9rem;
`;

// Image Manager Component
const ImageManager = ({ contentId, productId, images = [], onAddImage, onRemoveImage, type = 'content' }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  
  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    
    console.log('Adding image URL:', imageUrl);
    
    const imageData = {
      url: imageUrl.trim(),
      alt: imageAlt || 'Content image'
    };
    
    console.log('Image data being added:', imageData);
    
    onAddImage(imageData);
    
    // Reset form
    setImageUrl('');
    setImageAlt('');
    setPreviewUrl('');
  };
  
  const handlePreview = () => {
    if (imageUrl.trim()) {
      setPreviewUrl(imageUrl);
    }
  };
  
  const handleRemovePreview = () => {
    setPreviewUrl('');
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setUploadProgress(`Selected ${files.length} file(s)`);
  };

  const handleFileUpload = async () => {
    const targetId = type === 'product' ? productId : contentId;
    if (!selectedFiles.length || !targetId) {
      // Show error message if no targetId for file uploads
      setUploadProgress('Please save the content first to enable file uploads.');
      setTimeout(() => {
        setUploadProgress('');
      }, 3000);
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress('Uploading images...');
      
      let result;
      if (type === 'product') {
        result = await uploadProductImages(productId, selectedFiles, imageAlt);
      } else {
        result = await uploadContentImages(contentId, selectedFiles, imageAlt);
      }
      
      if (result.success) {
        setUploadProgress(`Successfully uploaded ${result.count} image(s)`);
        
        // Add uploaded images to the form
        result.data.forEach(image => {
          onAddImage(image);
        });
        
        // Reset form
        setSelectedFiles([]);
        setImageAlt('');
        document.getElementById('file-upload').value = '';
        
        setTimeout(() => {
          setUploadProgress('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadProgress('Upload failed. Please try again.');
      setTimeout(() => {
        setUploadProgress('');
      }, 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (imageId) => {
    // Log for debugging
    console.log('ImageManager - Removing image:', imageId);
    console.log('Image type:', typeof imageId);
    console.log('Current images:', images);
    
    try {
      // Call the parent component's onRemoveImage function
      onRemoveImage(imageId);
    } catch (error) {
      console.error('Error removing image:', error);
      // If there's an error, you might want to show a notification here
    }
  };

  return (
    <ImageContainer>
      <h4>Images</h4>
      
      {images.length > 0 ? (
        <ImageGrid>
          {images.map((image, index) => (              <ImageItem key={image._id || index}>
              <Image src={image.url} alt={image.alt} />
              <ImageOverlay>                <DeleteButton 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // If image has _id property, use that, otherwise use index
                    const idToRemove = image._id ? image._id : index;
                    console.log(`Removing image with ${image._id ? 'ID' : 'index'}: `, idToRemove);
                    handleRemoveImage(idToRemove);
                  }}
                >
                  <FaTrash size={14} />
                </DeleteButton>
              </ImageOverlay>
            </ImageItem>
          ))}
        </ImageGrid>
      ) : (
        <p>No images added yet.</p>
      )}
      
      {/* File Upload Section */}
      <FileUploadSection>
        <h5>Upload Images</h5>
        {(type === 'content' && !contentId) || (type === 'product' && !productId) ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            File upload is disabled. Save the {type} first to enable image uploads.
          </p>
        ) : (
          <>
            <p>Select image files to upload</p>
            <FileInput
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
            />
            <FileInputLabel htmlFor="file-upload">
              <FaUpload style={{ marginRight: '0.5rem' }} />
              Choose Files
            </FileInputLabel>
            
            {selectedFiles.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <FormInput
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Alt text for uploaded images (optional)"
                  style={{ marginBottom: '1rem' }}
                />
                <Button 
                  onClick={handleFileUpload} 
                  icon={<FaUpload />}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
                </Button>
              </div>
            )}
            
            {uploadProgress && (
              <UploadProgress>{uploadProgress}</UploadProgress>
            )}
          </>
        )}
      </FileUploadSection>
      
      {/* URL-based Image Addition */}
      <h5 style={{ marginTop: '2rem' }}>Or Add Image by URL</h5>
      <ImageFormGroup>
        <FormCol>
          <FormInput
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL"
          />
        </FormCol>
        <FormCol>
          <FormInput
            type="text"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            placeholder="Alt text (optional)"
          />
        </FormCol>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            onClick={handlePreview} 
            icon={<FaExternalLinkAlt />} 
            variant="secondary"
            disabled={!imageUrl}
          >
            Preview
          </Button>
          <Button onClick={handleAddImage} icon={<FaPlus />} disabled={!imageUrl}>
            Add
          </Button>
        </div>
      </ImageFormGroup>
      
      {previewUrl && (
        <PreviewSection>
          <ImagePreview 
            imageUrl={previewUrl} 
            alt={imageAlt} 
            onRemove={handleRemovePreview} 
          />
        </PreviewSection>
      )}
    </ImageContainer>
  );
};

export default ImageManager;
