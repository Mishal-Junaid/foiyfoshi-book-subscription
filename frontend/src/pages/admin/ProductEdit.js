import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import styled from 'styled-components';
import { FaSave, FaArrowLeft, FaTrash } from 'react-icons/fa';

import Button from '../../components/ui/Button';
import { FormGroup, FormInput, FormTextarea, FormSelect, FormCheckbox } from '../../components/ui/FormElements';
import { useNotification } from '../../components/ui/Notification';
import Spinner from '../../components/ui/Spinner';
import ImageManager from '../../components/admin/ImageManager';
import AdminLayout from '../../components/layout/AdminLayout';

const Container = styled.div`
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
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

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.div``;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme.colors.black};
`;

const FormActions = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  grid-column: 1 / -1;
`;

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  
  // Make sure we have a valid ID or 'new'
  const safeId = id || 'new'; 
  const isEditMode = safeId !== 'new';
  
  console.log('ProductEdit initialized with ID:', safeId, 'isEditMode:', isEditMode);
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Monthly Box',  // Updated to match backend enum
    theme: '',  // Added required theme field
    isSubscription: false,
    isFeatured: false,
    itemsIncluded: [],
    images: []
  });
  
  // For items included in the box
  const [newItem, setNewItem] = useState('');
    useEffect(() => {
    if (isEditMode && safeId !== 'new') {
      fetchProduct();
    }
  }, [isEditMode, safeId]);
  
  const fetchProduct = async () => {
    try {
      if (!safeId || safeId === 'new') {
        console.error('Cannot fetch product: Invalid ID');
        addNotification({ message: 'Invalid product ID', type: 'error' });
        return;
      }
      
      // Updated API path without /api prefix
      const res = await api.get(`/products/${safeId}`);
      console.log('ProductEdit: Fetched product data:', res.data);
      
      // Process data to ensure all fields are in the correct format
      const productData = res.data.data;
        // Ensure itemsIncluded is properly processed based on the Product schema
      // In the Product schema, itemsIncluded is an array of objects with name and description
      if (productData.itemsIncluded) {
        console.log('Original itemsIncluded from API:', JSON.stringify(productData.itemsIncluded));
        
        // Keep the original structure of items for proper display and updating
        // Don't transform objects to strings, keep them as objects
        if (!Array.isArray(productData.itemsIncluded)) {
          productData.itemsIncluded = [];
          console.warn('itemsIncluded was not an array, resetting to empty array');
        }
      } else {
        productData.itemsIncluded = [];
      }
      
      setProduct(productData);
    } catch (err) {
      addNotification({ message: 'Failed to fetch product', type: 'error' });
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const handleAddItem = () => {
    if (!newItem.trim()) return;
    
    // Create an object in the format expected by the backend schema
    const newItemObj = {
      name: newItem.trim(),
      description: '' // Empty description by default
    };
    
    // Always store as object with name property for consistency with backend
    setProduct(prev => ({
      ...prev,
      itemsIncluded: [...prev.itemsIncluded, newItemObj]
    }));
    
    setNewItem('');
  };
  
  const handleRemoveItem = (index) => {
    setProduct(prev => ({
      ...prev,
      itemsIncluded: prev.itemsIncluded.filter((_, i) => i !== index)
    }));
  };
  
  const handleAddImage = (image) => {
    setProduct(prev => ({
      ...prev,
      images: [...prev.images, image]
    }));
  };  const handleRemoveImage = async (imageId) => {
    try {
      // If we're in edit mode and the image has an ID, delete it from the server
      if (isEditMode && typeof imageId === 'string' && safeId !== 'new') {
        // Updated API path without /api prefix
        await api.delete(`/products/${safeId}/images/${imageId}`);
        console.log('Removed image with ID:', imageId);
        addNotification({ message: 'Image removed successfully', type: 'success' });
      }
      // Remove from local state regardless
      setProduct(prev => ({
        ...prev,
        images: prev.images.filter((img, i) => 
          typeof imageId === 'string' ? img._id !== imageId : i !== imageId
        )
      }));} catch (err) {
      addNotification({ message: 'Failed to remove image', type: 'error' });
      console.error(err);
    }
  };
    const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const productData = { ...product };
      
      // Format price as number
      productData.price = parseFloat(productData.price);
      // Format stock as integer
      productData.stock = parseInt(productData.stock);
        // Format itemsIncluded as array of objects with name and description
      if (productData.itemsIncluded && Array.isArray(productData.itemsIncluded)) {
        productData.itemsIncluded = productData.itemsIncluded.map(item => {
          // If already an object with required structure, keep as is
          if (typeof item === 'object' && item !== null && item.name) {
            return item;
          }
          // Otherwise create object with required structure
          return {
            name: String(item),
            description: ''
          };
        });
        
        // Log the formatted items for debugging
        console.log('Formatted itemsIncluded:', JSON.stringify(productData.itemsIncluded));
      }// Make sure ID is properly set to avoid undefined issues
      const productId = safeId !== 'new' ? safeId : null;
      
      console.log('Saving product data:', {
        isEditMode,
        id: productId || 'new',
        data: productData
      });
      
      if (isEditMode && productId) {
        // Remove /api prefix as it's already in the baseURL
        await api.put(`/products/${productId}`, productData);
        console.log('Updated product:', productData);
        addNotification({ message: 'Product updated successfully', type: 'success' });
      } else {
        // Remove /api prefix as it's already in the baseURL
        await api.post('/products', productData);
        console.log('Created new product:', productData);
        addNotification({ message: 'Product created successfully', type: 'success' });
      }
      
      navigate('/admin/products');    } catch (err) {
      addNotification({ message: 'Failed to save product', type: 'error' });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <Spinner />;
  }
  
  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>{isEditMode ? 'Edit Product' : 'Add New Product'}</Title>
          <Button 
            onClick={() => navigate('/admin/products')}
            variant="secondary"
            icon={<FaArrowLeft />}
          >
            Back to Products
          </Button>
        </Header>
        
        <Form onSubmit={handleSubmit}>
          <FormSection>
            <FormGroup>
              <FormLabel>Product Name</FormLabel>
              <FormInput 
                type="text" 
                name="name" 
                value={product.name} 
                onChange={handleChange} 
                required 
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel>Description</FormLabel>
              <FormTextarea 
                name="description" 
                value={product.description} 
                onChange={handleChange} 
                rows="5" 
                required 
              />          </FormGroup>
            
            <FormGroup>
              <FormLabel>Theme</FormLabel>
              <FormInput 
                type="text" 
                name="theme" 
                value={product.theme} 
                onChange={handleChange} 
                placeholder="Summer Reading, Adventure, etc." 
                required 
              />
            </FormGroup>
              
            <FormGroup>
              <FormLabel>Category</FormLabel>
              <FormSelect 
                name="category" 
                value={product.category} 
                onChange={handleChange}
              >
                <option value="Monthly Box">Monthly Box</option>
                <option value="Special Edition">Special Edition</option>
                <option value="Gift Box">Gift Box</option>
                <option value="Children">Children</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Other">Other</option>
              </FormSelect>
            </FormGroup>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormGroup>
                <FormLabel>Price (MVR)</FormLabel>
                <FormInput 
                  type="number" 
                  name="price" 
                  value={product.price} 
                  onChange={handleChange} 
                  min="0" 
                  step="0.01" 
                  required 
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel>Stock</FormLabel>
                <FormInput 
                  type="number" 
                  name="stock" 
                  value={product.stock} 
                  onChange={handleChange} 
                  min="0" 
                  required 
                />
              </FormGroup>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <FormGroup style={{ marginRight: '1rem' }}>
                <FormCheckbox 
                  name="isSubscription" 
                  checked={product.isSubscription} 
                  onChange={handleChange}
                  label="Is Subscription Box" 
                />
              </FormGroup>
              
              <FormGroup>
                <FormCheckbox 
                  name="isFeatured" 
                  checked={product.isFeatured} 
                  onChange={handleChange}
                  label="Featured Product" 
                />
              </FormGroup>
            </div>
          </FormSection>
          
          <FormSection>
            <FormGroup>
              <FormLabel>Items Included</FormLabel>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <FormInput 
                  type="text" 
                  value={newItem} 
                  onChange={(e) => setNewItem(e.target.value)} 
                  placeholder="Add item..." 
                />
                <Button 
                  type="button" 
                  onClick={handleAddItem} 
                  disabled={!newItem.trim()}
                  variant="secondary"
                >
                  Add
                </Button>
              </div>
                {product.itemsIncluded.length > 0 ? (
                <ul>                  {product.itemsIncluded.map((item, index) => (
                    <li key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {typeof item === 'object' && item !== null 
                          ? (item.name || JSON.stringify(item))
                          : String(item)
                        }
                      </span>
                      <Button 
                        type="button" 
                        variant="danger" 
                        size="small" 
                        icon={<FaTrash />}
                        onClick={() => handleRemoveItem(index)}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#666' }}>No items added yet</p>
              )}
            </FormGroup>
            
            <ImageManager 
              productId={id}
              type="product"
              images={product.images} 
              onAddImage={handleAddImage} 
              onRemoveImage={handleRemoveImage} 
            />
          </FormSection>
          
          <FormActions>
            <Button 
              type="button"
              variant="secondary" 
              onClick={() => navigate('/admin/products')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              icon={<FaSave />} 
              disabled={saving}
            >
              {saving ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
            </Button>
          </FormActions>
        </Form>
      </Container>
    </AdminLayout>
  );
};

export default ProductEdit;
