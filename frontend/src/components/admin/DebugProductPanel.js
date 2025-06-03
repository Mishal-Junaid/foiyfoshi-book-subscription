import React, { useState } from 'react';
import styled from 'styled-components';
import { FaChevronDown, FaChevronUp, FaBug } from 'react-icons/fa';


const DebugContainer = styled.div`
  margin-top: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f9f9f9;
`;

const DebugHeader = styled.div`
  padding: 1rem;
  background-color: #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  
  h3 {
    margin: 0;
    display: flex;
    align-items: center;
    font-size: 1rem;
    color: #333;
    
    svg {
      margin-right: 0.5rem;
      color: #E91E63;
    }
  }
`;

const DebugContent = styled.div.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) => {
    if (['isOpen'].includes(prop)) {
      return false;
    }
    if (typeof defaultValidatorFn === 'function') {
      return defaultValidatorFn(prop);
    }
    return !prop.startsWith('$');
  }
})`
  padding: 1rem;
  max-height: ${props => props.isOpen ? '500px' : '0'};
  overflow-y: auto;
  transition: max-height 0.3s ease;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h4`
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #444;
`;

const DebugInfo = styled.pre`
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1rem;
  margin: 0;
  font-size: 0.8rem;
  overflow-x: auto;
  max-height: 200px;
`;

const DebugTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  
  th, td {
    border: 1px solid #ddd;
    padding: 0.5rem;
    text-align: left;
  }
  
  th {
    background-color: #f0f0f0;
  }
  
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const Badge = styled.span.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) => {
    if (['featured'].includes(prop)) {
      return false;
    }
    if (typeof defaultValidatorFn === 'function') {
      return defaultValidatorFn(prop);
    }
    return !prop.startsWith('$');
  }
})`
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  background-color: ${props => props.featured ? '#FFC107' : '#4CAF50'};
  color: ${props => props.featured ? '#000' : '#fff'};
  margin-right: 0.5rem;
`;

const DebugProductPanel = ({ apiProducts, frontEndProducts, apiResponse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  
  // Format product data for display
  const formatProduct = (product) => {
    if (!product) return null;
    
    // Safely handle images that might be objects with URL properties
    const processImages = (images) => {
      if (!images) return [];
      if (!Array.isArray(images)) return [];
      
      return images.map(img => {
        if (typeof img === 'object' && img !== null) {
          // If image is an object with a URL property, extract the URL
          return img.url || '';
        }
        return img;
      });
    };
    
    return {
      id: product._id || '',
      name: product.name || '',
      price: typeof product.price === 'number' ? product.price : 0,
      isFeatured: !!product.isFeatured,
      inStock: product.stock > 0,
      imageCount: product.images?.length || 0,
      // Process images to avoid rendering objects directly
      images: processImages(product.images),
      stock: typeof product.stock === 'number' ? product.stock : 0,
      // Ensure category is always a string
      category: product.category ? (typeof product.category === 'object' ? JSON.stringify(product.category) : String(product.category)) : '',
      // Ensure these are always strings
      createdAt: product.createdAt ? String(product.createdAt) : '',
      updatedAt: product.updatedAt ? String(product.updatedAt) : ''
    };
  };

  // Extract common product IDs between admin and frontend products
  const getCommonProducts = () => {
    if (!apiProducts || !frontEndProducts) return [];
    
    const apiIds = new Set(apiProducts.map(p => p._id));
    return frontEndProducts.filter(p => apiIds.has(p._id)).map(formatProduct);
  };
  
  // Extract products only in admin view
  const getAdminOnlyProducts = () => {
    if (!apiProducts || !frontEndProducts) return [];
    
    const frontEndIds = new Set(frontEndProducts.map(p => p._id));
    return apiProducts.filter(p => !frontEndIds.has(p._id)).map(formatProduct);
  };
  
  // Extract products only in frontend
  const getFrontEndOnlyProducts = () => {
    if (!apiProducts || !frontEndProducts) return [];
    
    const apiIds = new Set(apiProducts.map(p => p._id));
    return frontEndProducts.filter(p => !apiIds.has(p._id)).map(formatProduct);
  };
  
  const commonProducts = getCommonProducts();
  const adminOnlyProducts = getAdminOnlyProducts();
  const frontEndOnlyProducts = getFrontEndOnlyProducts();
  
  return (
    <DebugContainer>
      <DebugHeader onClick={() => setIsOpen(prev => !prev)}>
        <h3>
          <FaBug /> Product Debug Information
        </h3>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </DebugHeader>
      
      {isOpen && (
        <DebugContent isOpen={isOpen}>
          <Section>
            <SectionTitle>API Products Count: {apiProducts?.length || 0}</SectionTitle>
            <SectionTitle>Front-End Products Count: {frontEndProducts?.length || 0}</SectionTitle>
            <SectionTitle>API Products Valid Array: {Array.isArray(apiProducts) ? 'Yes' : 'No'}</SectionTitle>
            <SectionTitle>Frontend Products Valid Array: {Array.isArray(frontEndProducts) ? 'Yes' : 'No'}</SectionTitle>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowRawData(!showRawData);
              }}
              style={{ 
                padding: '5px 10px', 
                marginTop: '10px', 
                background: '#E91E63', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showRawData ? 'Hide Raw Data' : 'Show Raw Data'}
            </button>
          </Section>
          
          {showRawData && (
            <>
              <Section>
                <SectionTitle>Raw API Products</SectionTitle>
                <DebugInfo>
                  {apiProducts && apiProducts.length > 0
                    ? JSON.stringify(apiProducts, (key, value) => {
                        // Handle circular references and complex objects
                        if (typeof value === 'object' && value !== null) {
                          try {
                            JSON.stringify(value);
                            return value;
                          } catch (err) {
                            return '[Complex Object]';
                          }
                        }
                        return value;
                      }, 2)
                    : 'No API products available'}
                </DebugInfo>
              </Section>
              
              <Section>
                <SectionTitle>Raw Frontend Products</SectionTitle>
                <DebugInfo>                  {frontEndProducts && frontEndProducts.length > 0
                    ? JSON.stringify(frontEndProducts, (key, value) => {
                        // Handle circular references and complex objects
                        if (typeof value === 'object' && value !== null) {
                          try {
                            JSON.stringify(value);
                            
                            // Special handling for itemsIncluded to prevent rendering issues
                            if (key === 'itemsIncluded' && Array.isArray(value)) {
                              return value.map(item => {
                                if (typeof item === 'object' && item !== null) {
                                  return item.name || JSON.stringify(item);
                                }
                                return String(item);
                              });
                            }
                            
                            return value;
                          } catch (err) {
                            return '[Complex Object]';
                          }
                        }
                        return value;
                      }, 2)
                    : 'No frontend products available'}
                </DebugInfo>
              </Section>
            </>
          )}
          
          <Section>
            <SectionTitle>Last API Response</SectionTitle>
            <DebugInfo>              {apiResponse 
                ? JSON.stringify(apiResponse, (key, value) => {
                    // Handle circular references and complex objects
                    if (typeof value === 'object' && value !== null) {
                      try {
                        JSON.stringify(value);
                        
                        // Special handling for itemsIncluded to prevent rendering issues
                        if (key === 'itemsIncluded' && Array.isArray(value)) {
                          return value.map(item => {
                            if (typeof item === 'object' && item !== null) {
                              return item.name || JSON.stringify(item);
                            }
                            return String(item);
                          });
                        }
                        
                        return value;
                      } catch (err) {
                        return '[Complex Object]';
                      }
                    }
                    return value;
                  }, 2)
                : 'No API response available'}
            </DebugInfo>
          </Section>
          
          {commonProducts.length > 0 && (
            <Section>
              <SectionTitle>Products in Both Admin & Front-end ({commonProducts.length})</SectionTitle>
              <DebugTable>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Images</th>
                  </tr>
                </thead>
                <tbody>
                  {commonProducts.map(product => (
                    <tr key={product.id}>
                      <td>{String(product.id)}</td>
                      <td>{String(product.name)}</td>
                      <td>MVR {typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}</td>
                      <td>
                        {product.isFeatured && <Badge featured>Featured</Badge>}
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </td>
                      <td>{String(product.imageCount)}</td>
                    </tr>
                  ))}
                </tbody>
              </DebugTable>
            </Section>
          )}
          
          {adminOnlyProducts.length > 0 && (
            <Section>
              <SectionTitle>Products Only in Admin View ({adminOnlyProducts.length})</SectionTitle>
              <DebugTable>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Images</th>
                  </tr>
                </thead>
                <tbody>
                  {adminOnlyProducts.map(product => (
                    <tr key={product.id}>
                      <td>{String(product.id)}</td>
                      <td>{String(product.name)}</td>
                      <td>MVR {typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}</td>
                      <td>
                        {product.isFeatured && <Badge featured>Featured</Badge>}
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </td>
                      <td>{String(product.imageCount)}</td>
                    </tr>
                  ))}
                </tbody>
              </DebugTable>
            </Section>
          )}
          
          {frontEndOnlyProducts.length > 0 && (
            <Section>
              <SectionTitle>Products Only in Front-End ({frontEndOnlyProducts.length})</SectionTitle>
              <DebugTable>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Images</th>
                  </tr>
                </thead>
                <tbody>
                  {frontEndOnlyProducts.map(product => (
                    <tr key={product.id}>
                      <td>{String(product.id)}</td>
                      <td>{String(product.name)}</td>
                      <td>MVR {typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}</td>
                      <td>
                        {product.isFeatured && <Badge featured>Featured</Badge>}
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </td>
                      <td>{String(product.imageCount)}</td>
                    </tr>
                  ))}
                </tbody>
              </DebugTable>
            </Section>
          )}
        </DebugContent>
      )}
    </DebugContainer>
  );
};

export default DebugProductPanel;
