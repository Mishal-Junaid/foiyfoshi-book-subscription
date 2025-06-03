import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import api from '../../services/api';
import { createDevAdminToken, isUsingDevAdminToken } from '../../utils/adminTokenHelper';

import Button from '../../components/ui/Button';
import { useNotification } from '../../components/ui/Notification';
import Spinner from '../../components/ui/Spinner';
import { imgErrorProps, getImageUrl } from '../../utils/imageUtils';
import DebugProductPanel from '../../components/admin/DebugProductPanel';
import APIDebugger from '../../components/debug/APIDebugger';
import AdminAuthDebugger from '../../components/debug/AdminAuthDebugger';
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

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
`;

const ProductCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: ${props => props.theme.colors.gold};
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  z-index: 1;
`;

const ProductImageContainer = styled.div`
  height: 200px;
  overflow: hidden;
  position: relative;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  padding: 1rem;
`;

const ProductName = styled.h3`
  margin: 0 0 0.5rem;
  font-size: 1rem;
`;

const ProductPrice = styled.p`
  font-weight: bold;
  margin: 0.5rem 0;
  color: ${props => props.theme.colors.primary};
`;

const ProductStock = styled.p.withConfig({
  shouldForwardProp: prop => !['inStock'].includes(prop)
})`
  font-size: 0.9rem;
  color: ${props => props.inStock ? props.theme.colors.success : props.theme.colors.danger};
  margin: 0.5rem 0;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  grid-column: 1 / -1;
  color: #666;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 3rem;
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

const Products = () => {
  const notify = useNotification();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDebug, setShowDebug] = useState(process.env.NODE_ENV === 'development');
  const [isLoadingFrontend, setIsLoadingFrontend] = useState(false);
  
  // Auto-create dev admin token in development if not present
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !isUsingDevAdminToken()) {
      createDevAdminToken();
      console.log('Created development admin token automatically');
    }
  }, []);
  
  // Debug state
  const [frontendProducts, setFrontendProducts] = useState([]);
  const [lastApiResponse, setLastApiResponse] = useState(null);
    const fetchProducts = async (page = 1, search = '') => {
    setLoading(true);
    try {
      // Using correct endpoint format, ensuring we have the right path
      const res = await api.get(`/products?page=${page}&limit=12${search ? `&search=${search}` : ''}`);
      console.log('Admin products API response:', res.data);
      setLastApiResponse(res.data);
      
      if (res.data && res.data.data) {
        setProducts(res.data.data);
        console.log('Products set from API:', res.data.data.length, 'items');
        
        // Ensure totalPages is a valid number greater than 0
        const calculatedPages = res.data.pagination && res.data.pagination.total && res.data.pagination.limit ? 
          Math.ceil(res.data.pagination.total / res.data.pagination.limit) : 1;
        setTotalPages(Math.max(1, calculatedPages));
      } else {
        console.error('Invalid API response structure:', res.data);
        setProducts([]);
        setTotalPages(1);        notify.addNotification({ message: 'Received invalid product data from API', type: 'error' });
      }
    } catch (err) {
      notify.addNotification({ message: 'Failed to fetch products', type: 'error' });
      console.error('Error fetching products:', err);
      // Set default values on error
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }  };

  // Fetch frontend products (all products and featured products)
  const fetchFrontendProducts = async () => {
    setIsLoadingFrontend(true);
    try {
      // Try without the /api prefix as it might be causing the 404 error
      console.log('Fetching frontend products...');
      
      // Get all published products that would appear on frontend
      const allProductsRes = await api.get('/products?limit=100');
      console.log('All products response:', allProductsRes.data);
      
      // Get featured products specifically
      const featuredRes = await api.get('/products/featured');
      console.log('Featured products response:', featuredRes.data);
      
      // Combine and deduplicate
      const allProducts = allProductsRes.data.data || [];
      const featuredProducts = featuredRes.data.data || [];
      
      console.log('All products count:', allProducts.length);
      console.log('Featured products count:', featuredProducts.length);
      
      // Mark featured products
      const frontendProductsMap = new Map();
      
      // Add all products first
      allProducts.forEach(product => {
        frontendProductsMap.set(product._id, {...product});
      });
      
      // Then add or update featured products
      featuredProducts.forEach(product => {
        if (frontendProductsMap.has(product._id)) {
          const existingProduct = frontendProductsMap.get(product._id);
          existingProduct.isFeatured = true;
          frontendProductsMap.set(product._id, existingProduct);
        } else {
          const markedProduct = {...product, isFeatured: true};
          frontendProductsMap.set(product._id, markedProduct);
        }
      });
      
      // Convert map to array
      const combinedProducts = Array.from(frontendProductsMap.values());
      console.log('Combined frontend products:', combinedProducts.length);
      setFrontendProducts(combinedProducts);
    } catch (err) {
      console.error("Failed to fetch frontend products:", err.message);
      console.error("Error details:", err);
    } finally {
      setIsLoadingFrontend(false);
    }  };

  useEffect(() => {
    fetchProducts(currentPage, searchTerm);    fetchFrontendProducts(); // Fetch frontend products on initial load and page changes
  }, [currentPage]);

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    
    try {
      // Updated API path without /api prefix
      await api.delete(`/products/${id}`);
      notify.addNotification({ message: `${name} deleted successfully`, type: 'success' });
      fetchProducts(currentPage, searchTerm);
      fetchFrontendProducts(); // Refresh frontend products too after deletion
    } catch (err) {
      notify.addNotification({ message: 'Failed to delete product', type: 'error' });
      console.error('Delete product error:', err);
    }
  };

  const toggleFeaturedProduct = async (id, name, currentStatus) => {
    try {
      // Updated API path without /api prefix
      await api.put(`/products/${id}`, { isFeatured: !currentStatus });
      notify.addNotification({ 
        message: `${name} ${!currentStatus ? 'added to' : 'removed from'} featured products`, 
        type: 'success' 
      });
      fetchProducts(currentPage, searchTerm);
      fetchFrontendProducts(); // Refresh frontend products too after status change
    } catch (err) {
      notify.addNotification({ message: 'Failed to update featured status', type: 'error' });
      console.error('Toggle featured error:', err);    }
  };

  if (loading && products.length === 0) {
    return <Spinner />;
  }
  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>Products</Title>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <SearchBar>
              <FaSearch />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    setCurrentPage(1);
                    fetchProducts(1, searchTerm);
                  }
                }}
              />
            </SearchBar>
                      <Link to="/admin/products/new">
            <Button color="primary">
              <FaPlus /> Add Product
            </Button>
          </Link>
        </div>
        </Header>

        {process.env.NODE_ENV === 'development' && (
          <>
            <AdminAuthDebugger />
            
            <div style={{ margin: '1rem 0', padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Development Tools:</strong>
                <div>
                  <Button 
                    color="secondary" 
                    size="small"
                    onClick={() => setShowDebug(!showDebug)}
                  >
                    {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {showDebug && process.env.NODE_ENV === 'development' && (
          <APIDebugger endpoint="/products" />
        )}
          {products.length > 0 ? (
          <ProductsGrid>
            {products.map(product => (
              <ProductCard key={product._id}>
                {product.isFeatured && <FeaturedBadge>Featured</FeaturedBadge>}
                <ProductImageContainer>
                  <ProductImage 
                    src={product.images && product.images.length > 0 
                      ? (typeof product.images[0] === 'object' ? product.images[0].url : product.images[0])
                      : getImageUrl(null)} 
                    alt={product.name}
                    {...imgErrorProps}
                  />
                </ProductImageContainer>
                <ProductInfo>
                  <ProductName>{product.name}</ProductName>
                  <ProductPrice>MVR {product.price.toFixed(2)}</ProductPrice>
                  <ProductStock inStock={product.stock > 0}>
                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </ProductStock>
                  <ActionButtons>
                    <Button 
                      small
                      as={Link}
                      to={`/admin/products/edit/${product._id}`}
                      icon={<FaEdit />}
                    >
                      Edit
                    </Button>
                    <Button 
                      small
                      variant={product.isFeatured ? 'secondary' : 'primary'}
                      onClick={() => toggleFeaturedProduct(product._id, product.name, product.isFeatured)}
                    >
                      {product.isFeatured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button 
                      small
                      variant="danger"
                      icon={<FaTrash />}
                      onClick={() => handleDeleteProduct(product._id, product.name)}
                    >
                      Delete
                    </Button>
                  </ActionButtons>
                </ProductInfo>
              </ProductCard>
            ))}
          </ProductsGrid>
        ) : (
          <EmptyState>
            <h3>No products found</h3>
            <p>Try adjusting your search criteria or add new products</p>
            <Button 
              as={Link} 
              to="/admin/products/new"
              icon={<FaPlus />}
              style={{ marginTop: '1rem' }}
            >
              Add Product
            </Button>          </EmptyState>
        )}

        {products.length > 0 && totalPages > 0 && (
          <Pagination>
            <PageButton 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              Previous
            </PageButton>
            
            {/* Create array safely with valid length */}
            {Array.from({length: Math.min(totalPages, 100)}, (_, i) => (
              <PageButton 
                key={i + 1}
                active={currentPage === i + 1}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </PageButton>
            ))}
            
            <PageButton 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Next
            </PageButton>
          </Pagination>
        )}
        
        {/* Debug panel to show product data differences */}
        <DebugProductPanel 
          apiProducts={products}
          frontEndProducts={frontendProducts}
          apiResponse={lastApiResponse}
        />
      </Container>
    </AdminLayout>
  );
}

export default Products;
