import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import api from '../services/api';

import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import APIDebugger from '../components/debug/APIDebugger'; 
import { imgErrorProps, getImageUrl } from '../utils/imageUtils';

import useCart from '../hooks/useCart';
import { useNotification } from '../components/ui/Notification';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 5rem;
`;

const PageHeader = styled.div`
  margin-top: 8rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const PageTitle = styled.h1`
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background-color: ${props => props.theme.colors.gold};
  }
`;

const PageDescription = styled.p`
  max-width: 600px;
  margin: 2rem auto;
  font-size: 1.1rem;
  color: #666;
`;

const FiltersContainer = styled.div`
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background-color: ${props => props.theme.colors.white};
  border-radius: 8px;
  box-shadow: ${props => props.theme.shadows.small};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const SearchBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 400px;
  
  input {
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 2.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 0.9rem;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.gold};
      box-shadow: 0 0 0 2px rgba(128, 90, 41, 0.1);
    }
  }
  
  svg {
    position: absolute;
    left: 0.8rem;
    color: #999;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    max-width: 100%;
  }
`;

const FiltersGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    width: 100%;
    justify-content: space-between;
  }
`;

const FilterButton = styled.button.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) => {
    if (['isActive'].includes(prop)) {
      return false;
    }
    if (typeof defaultValidatorFn === 'function') {
      return defaultValidatorFn(prop);
    }
    return !prop.startsWith('$');
  }
})`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  background-color: ${props => props.isActive ? props.theme.colors.gold : 'transparent'};
  color: ${props => props.isActive ? props.theme.colors.white : props.theme.colors.black};
  border: 1px solid ${props => props.isActive ? props.theme.colors.gold : '#e0e0e0'};
  border-radius: 4px;
  cursor: pointer;
  font-weight: ${props => props.isActive ? '600' : '400'};
  transition: ${props => props.theme.transitions.short};
  
  &:hover {
    background-color: ${props => props.isActive ? props.theme.colors.gold : '#f9f9f9'};
  }
  
  svg {
    font-size: 0.9rem;
  }
`;

const SortButton = styled(FilterButton).withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) => {
    if (['isDesc'].includes(prop)) {
      return false;
    }
    if (typeof defaultValidatorFn === 'function') {
      return defaultValidatorFn(prop);
    }
    return !prop.startsWith('$');
  }
})`
  svg {
    transition: ${props => props.theme.transitions.short};
    transform: ${props => props.isDesc ? 'rotate(0deg)' : 'rotate(180deg)'};
  }
`;

const Results = styled.div`
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled(motion.div)`
  background-color: ${props => props.theme.colors.white};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.small};
  transition: ${props => props.theme.transitions.short};
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
`;

const ProductBadge = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.3rem 0.8rem;
  background-color: ${props => props.theme.colors.gold};
  color: ${props => props.theme.colors.white};
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 4px;
  z-index: 1;
`;

const ProductContent = styled.div`
  padding: 1.5rem;
`;

const ProductTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const ProductDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
`;

const ProductPrice = styled.p`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${props => props.theme.colors.gold};
  margin-bottom: 1rem;
`;

const ProductActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
`;

const FilterDropdown = styled.div`
  position: relative;
`;

const FilterDropdownContent = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: ${props => props.theme.colors.white};
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1rem;
  width: 250px;
  z-index: 10;
  box-shadow: ${props => props.theme.shadows.medium};
`;

const FilterGroup = styled.div`
  margin-bottom: 1.2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.p`
  font-weight: 600;
  margin-bottom: 0.6rem;
  font-size: 0.9rem;
`;

const FilterOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  
  input {
    cursor: pointer;
    accent-color: ${props => props.theme.colors.gold};
  }
`;

const FilterActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
  padding-top: 1rem;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: ${props => props.theme.colors.white};
  border-radius: 8px;
  box-shadow: ${props => props.theme.shadows.small};
  
  h3 {
    margin-bottom: 1rem;
    color: #666;
  }
  
  p {
    color: #888;
    margin-bottom: 1.5rem;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 3rem;
  gap: 0.5rem;
`;

const PageButton = styled.button.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) => {
    if (['isActive'].includes(prop)) {
      return false;
    }
    if (typeof defaultValidatorFn === 'function') {
      return defaultValidatorFn(prop);
    }
    return !prop.startsWith('$');
  }
})`
  padding: 0.5rem 0.8rem;
  border: 1px solid ${props => props.isActive ? props.theme.colors.gold : '#e0e0e0'};
  background-color: ${props => props.isActive ? props.theme.colors.gold : 'transparent'};
  color: ${props => props.isActive ? props.theme.colors.white : props.theme.colors.black};
  border-radius: 4px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.short};
  
  &:hover {
    background-color: ${props => props.isActive ? props.theme.colors.gold : '#f9f9f9'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Products = () => {
  const { addToCart } = useCart();
  const { addNotification } = useNotification();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortDescending, setSortDescending] = useState(true);
  const [apiError, setApiError] = useState(null);
  
  const getProductImageUrl = (product) => {
    if (product.images && product.images.length > 0) {
      // Handle the actual API image structure where images are objects with url property
      const firstImage = product.images[0];
      if (typeof firstImage === 'object' && firstImage.url) {
        return getImageUrl(firstImage.url);
      } else if (typeof firstImage === 'string') {
        return getImageUrl(firstImage);
      }
    }
    return getImageUrl(null);
  };

  const [filters, setFilters] = useState({
    category: {
      subscription: false,
      gift: false
    },
    frequency: {
      monthly: false,
      quarterly: false,
      'one-time': false
    },
    price: {
      under500: false,
      '500to1000': false,
      above1000: false
    }
  });

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;
  
  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setApiError(null);
      
      try {
        const response = await api.get('/products?limit=50');
        if (response.data && response.data.data) {
          // Transform API data to match our expected format
          const formattedProducts = response.data.data.map(product => ({
            id: product._id,
            title: product.name,
            description: product.description,
            price: product.price,
            images: product.images || [], // Preserve the original image structure
            isFeatured: product.isFeatured || false,
            category: product.category || "subscription",
            frequency: product.frequency || "monthly"
          }));          // Add debugging to see the image structure
          console.log('Raw API image data example:', 
            response.data.data.length > 0 ? JSON.stringify(response.data.data[0].images) : 'No products');
          
          setProducts(formattedProducts);
          console.log('Products fetched from API:', formattedProducts.length);
        } else {
          // Fallback to empty array if no data
          setProducts([]);
          console.log('No products found in API response');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setApiError('Failed to load products. Please try again later.');
        // Provide empty products array in case of error
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Apply filters and search
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let results = [...products];
      
      // Apply search
      if (searchQuery) {
        results = results.filter(product => 
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply category filters
      const activeCategories = Object.entries(filters.category)
        .filter(([_, isActive]) => isActive)
        .map(([category]) => category);
      
      if (activeCategories.length > 0) {
        results = results.filter(product => activeCategories.includes(product.category));
      }
      
      // Apply frequency filters
      const activeFrequencies = Object.entries(filters.frequency)
        .filter(([_, isActive]) => isActive)
        .map(([frequency]) => frequency);
      
      if (activeFrequencies.length > 0) {
        results = results.filter(product => activeFrequencies.includes(product.frequency));
      }
      
      // Apply price filters
      const activePriceRanges = Object.entries(filters.price)
        .filter(([_, isActive]) => isActive)
        .map(([priceRange]) => priceRange);
      
      if (activePriceRanges.length > 0) {
        results = results.filter(product => {
          return activePriceRanges.some(range => {
            if (range === 'under500') return product.price < 500;
            if (range === '500to1000') return product.price >= 500 && product.price <= 1000;
            if (range === 'above1000') return product.price > 1000;
            return false;
          });
        });
      }
      
      // Apply sorting
      results.sort((a, b) => {
        if (sortDescending) {
          return b.price - a.price;
        } else {
          return a.price - b.price;
        }
      });
      
      setFilteredProducts(results);
      setCurrentPage(1);
      setLoading(false);
    }, 500);
  }, [searchQuery, filters, sortDescending, products]);
  
  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  
  const handleFilterChange = (filterCategory, filterName) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterCategory]: {
        ...prevFilters[filterCategory],
        [filterName]: !prevFilters[filterCategory][filterName]
      }
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      category: {
        subscription: false,
        gift: false
      },
      frequency: {
        monthly: false,
        quarterly: false,
        'one-time': false
      },
      price: {
        under500: false,
        '500to1000': false,
        above1000: false
      }
    });
    setSearchQuery('');
  };
  
  const toggleSort = () => {
    setSortDescending(!sortDescending);
  };
  
  const areFiltersActive = () => {
    return Object.values(filters).some(filterCategory => 
      Object.values(filterCategory).some(isActive => isActive)
    );
  };

  // Add to cart function
  const handleAddToCart = (product) => {
    try {
      const cartItem = {
        _id: product._id || product.id,
        name: product.name || product.title,
        price: product.price,
        image: getProductImageUrl(product),
        quantity: 1
      };
      
      addToCart(cartItem);
      addNotification({ 
        message: `${product.name || product.title} added to cart!`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      addNotification({ 
        message: 'Failed to add item to cart', 
        type: 'error' 
      });
    }
  };

  return (
    <PageContainer>
      {/* Debug panel - only visible in development environment */}
      {process.env.NODE_ENV === 'development' && (
        <APIDebugger endpoint="/products" />
      )}
      
      <PageHeader>
        <PageTitle>Our Book Boxes</PageTitle>
        <PageDescription>
          Explore our collection of curated book boxes designed to enhance your reading experience. 
          From monthly subscriptions to one-time gifts, find the perfect box for yourself or a book lover in your life.
        </PageDescription>
      </PageHeader>
      
      <FiltersContainer>
        <SearchBox>
          <FaSearch />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBox>
        
        <FiltersGroup>
          <FilterDropdown>
            <FilterButton 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              isActive={areFiltersActive()}
            >
              <FaFilter />
              Filter
            </FilterButton>
            
            {isFilterOpen && (
              <FilterDropdownContent
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <FilterGroup>
                  <FilterLabel>Category</FilterLabel>
                  <FilterOptions>
                    <FilterCheckbox>
                      <input 
                        type="checkbox" 
                        checked={filters.category.subscription}
                        onChange={() => handleFilterChange('category', 'subscription')}
                      />
                      Subscription Boxes
                    </FilterCheckbox>
                    <FilterCheckbox>
                      <input 
                        type="checkbox" 
                        checked={filters.category.gift}
                        onChange={() => handleFilterChange('category', 'gift')}
                      />
                      Gift Boxes
                    </FilterCheckbox>
                  </FilterOptions>
                </FilterGroup>
                
                <FilterGroup>
                  <FilterLabel>Frequency</FilterLabel>
                  <FilterOptions>
                    <FilterCheckbox>
                      <input 
                        type="checkbox" 
                        checked={filters.frequency.monthly}
                        onChange={() => handleFilterChange('frequency', 'monthly')}
                      />
                      Monthly
                    </FilterCheckbox>
                    <FilterCheckbox>
                      <input 
                        type="checkbox" 
                        checked={filters.frequency.quarterly}
                        onChange={() => handleFilterChange('frequency', 'quarterly')}
                      />
                      Quarterly
                    </FilterCheckbox>
                    <FilterCheckbox>
                      <input 
                        type="checkbox" 
                        checked={filters.frequency['one-time']}
                        onChange={() => handleFilterChange('frequency', 'one-time')}
                      />
                      One-time
                    </FilterCheckbox>
                  </FilterOptions>
                </FilterGroup>
                
                <FilterGroup>
                  <FilterLabel>Price</FilterLabel>
                  <FilterOptions>
                    <FilterCheckbox>
                      <input 
                        type="checkbox" 
                        checked={filters.price.under500}
                        onChange={() => handleFilterChange('price', 'under500')}
                      />
                      Under MVR 500
                    </FilterCheckbox>
                    <FilterCheckbox>
                      <input 
                        type="checkbox" 
                        checked={filters.price['500to1000']}
                        onChange={() => handleFilterChange('price', '500to1000')}
                      />
                      MVR 500 - MVR 1000
                    </FilterCheckbox>
                    <FilterCheckbox>
                      <input 
                        type="checkbox" 
                        checked={filters.price.above1000}
                        onChange={() => handleFilterChange('price', 'above1000')}
                      />
                      Above MVR 1000
                    </FilterCheckbox>
                  </FilterOptions>
                </FilterGroup>
                
                <FilterActions>
                  <Button 
                    variant="secondary" 
                    small 
                    onClick={resetFilters}
                  >
                    Reset All
                  </Button>
                  <Button 
                    variant="primary" 
                    small 
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Apply
                  </Button>
                </FilterActions>
              </FilterDropdownContent>
            )}
          </FilterDropdown>
          
          <SortButton onClick={toggleSort} isDesc={sortDescending}>
            {sortDescending ? <FaSortAmountDown /> : <FaSortAmountUp />}
            Price {sortDescending ? 'High to Low' : 'Low to High'}
          </SortButton>
        </FiltersGroup>
      </FiltersContainer>
      
      {loading ? (
        <Spinner message="Loading products..." />
      ) : apiError ? (
        <NoResults>
          <h3>Error</h3>
          <p>{apiError}</p>
          <Button 
            variant="secondary" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </NoResults>
      ) : (
        <>
          <Results>
            Showing {currentProducts.length} of {filteredProducts.length} products
          </Results>
          
          {currentProducts.length > 0 ? (
            <>
              <ProductsGrid>
                {currentProducts.map((product, index) => (                  <ProductCard
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div style={{ position: 'relative' }}>                      <ProductImage 
                        src={getProductImageUrl(product)} 
                        alt={product.title} 
                        {...imgErrorProps} 
                      />
                      {product.isFeatured && (
                        <ProductBadge>Featured</ProductBadge>
                      )}
                    </div>
                    <ProductContent>
                      <ProductTitle>{product.title}</ProductTitle>
                      <ProductDescription>{product.description}</ProductDescription>
                      <ProductPrice>MVR {product.price}</ProductPrice>
                      <ProductActions>
                        <Button 
                          variant="secondary" 
                          small 
                          as={Link} 
                          to={`/product/${product.id}`}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="primary" 
                          small
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </Button>
                      </ProductActions>
                    </ProductContent>
                  </ProductCard>
                ))}
              </ProductsGrid>
              
              {totalPages > 1 && (
                <Pagination>
                  <PageButton
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    &lt;
                  </PageButton>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <PageButton
                      key={index}
                      onClick={() => paginate(index + 1)}
                      isActive={currentPage === index + 1}
                    >
                      {index + 1}
                    </PageButton>
                  ))}
                  
                  <PageButton
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    &gt;
                  </PageButton>
                </Pagination>
              )}
            </>
          ) : (
            <NoResults>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search query</p>
              <Button variant="secondary" onClick={resetFilters}>
                Reset Filters
              </Button>
            </NoResults>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default Products;
