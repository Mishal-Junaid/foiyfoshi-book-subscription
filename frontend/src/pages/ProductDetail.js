import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaCheckCircle, FaRegHeart, FaHeart, FaRegClock } from 'react-icons/fa';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { imgErrorProps, getImageUrl } from '../utils/imageUtils';

import APIDebugger from '../components/debug/APIDebugger';
import { useNotification } from '../components/ui/Notification';
import { addToWishlist, removeFromWishlist, isInWishlist } from '../services/wishlistService';
import api from '../services/api';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 10rem 1.5rem 5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: 8rem 1.5rem 3rem;
  }
`;

const ProductSection = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.medium};
`;

const MainImage = styled.img`
  width: 100%;
  height: 500px;
  object-fit: cover;
  display: block;
`;

const ThumbnailsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    gap: 0.5rem;
  }
`;

const Thumbnail = styled.div.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) => {
    if (['active'].includes(prop)) {
      return false;
    }
    if (typeof defaultValidatorFn === 'function') {
      return defaultValidatorFn(prop);
    }
    return !prop.startsWith('$');
  }
})`
  width: 80px;
  height: 80px;
  border-radius: 5px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${props => props.active ? props.theme.colors.gold : 'transparent'};
  transition: ${props => props.theme.transitions.short};
  
  &:hover {
    opacity: 0.9;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    width: 60px;
    height: 60px;
  }
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProductTitle = styled.h1`
  margin-bottom: 0.5rem;
`;

const ProductPrice = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: ${props => props.theme.colors.gold};
  margin: 1rem 0;
  display: flex;
  align-items: center;
  
  .old-price {
    text-decoration: line-through;
    color: #999;
    font-size: 1.2rem;
    font-weight: normal;
    margin-left: 1rem;
  }
  
  .discount {
    background-color: ${props => props.theme.colors.gold};
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
    margin-left: 1rem;
  }
`;

const Description = styled.div`
  margin-bottom: 2rem;
  
  p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1rem;
  }
`;

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid #e0e0e0;
  margin: 1.5rem 0;
`;

const ProductFeatures = styled.div`
  margin-bottom: 2rem;
`;

const FeatureTitle = styled.h3`
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  
  li {
    display: flex;
    align-items: center;
    margin-bottom: 0.8rem;
    color: #444;
    
    svg {
      color: ${props => props.theme.colors.gold};
      margin-right: 0.5rem;
      flex-shrink: 0;
    }
  }
`;

const SubscriptionInfo = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid ${props => props.theme.colors.gold};
`;



const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  
  button {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f9f9f9;
    border: 1px solid #e0e0e0;
    font-size: 1.2rem;
    cursor: pointer;
    
    &:first-child {
      border-radius: 4px 0 0 4px;
    }
    
    &:last-child {
      border-radius: 0 4px 4px 0;
    }
    
    &:hover {
      background-color: #f0f0f0;
    }
    
    &:focus {
      outline: none;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  span {
    width: 60px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
  }
`;

const ProductActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
  }
  
  button {
    flex: 1;
  }
`;

const WishlistButton = styled.button.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) => {
    if (['active'].includes(prop)) {
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
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem;
  width: 50px;
  border: 1px solid ${props => props.active ? props.theme.colors.gold : '#e0e0e0'};
  background-color: ${props => props.active ? props.theme.colors.gold : 'transparent'};
  color: ${props => props.active ? props.theme.colors.white : '#666'};
  border-radius: 4px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.short};
  
  &:hover {
    background-color: ${props => props.active ? props.theme.colors.gold : '#f9f9f9'};
  }
`;

const RelatedProducts = styled.section`
  margin-top: 5rem;
`;

const RelatedHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const RelatedTitle = styled.h2`
  position: relative;
  margin-bottom: 1.5rem;
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

const RelatedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const RelatedProductCard = styled(motion.div)`
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

const RelatedProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const RelatedProductContent = styled.div`
  padding: 1rem;
`;

const RelatedProductTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const RelatedProductPrice = styled.p`
  font-weight: bold;
  color: ${props => props.theme.colors.gold};
`;

const OptionGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const OptionLabel = styled.p`
  font-weight: 600;
  margin-bottom: 0.8rem;
`;

const OptionButtons = styled.div`
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
`;

const OptionButton = styled.button.withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) => {
    if (['active'].includes(prop)) {
      return false;
    }
    if (typeof defaultValidatorFn === 'function') {
      return defaultValidatorFn(prop);
    }
    return !prop.startsWith('$');
  }
})`
  padding: 0.6rem 1.2rem;
  border: 2px solid ${props => props.active ? props.theme.colors.gold : '#e0e0e0'};
  background-color: ${props => props.active ? props.theme.colors.gold : 'transparent'};
  color: ${props => props.active ? props.theme.colors.white : props.theme.colors.black};
  border-radius: 4px;
  cursor: pointer;
  font-weight: ${props => props.active ? '600' : '400'};
  transition: ${props => props.theme.transitions.short};
  
  &:hover {
    border-color: ${props => props.theme.colors.gold};
    background-color: ${props => props.active ? props.theme.colors.gold : 'rgba(128, 90, 41, 0.1)'};
  }
`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState('monthly');
  const [addedToCart, setAddedToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
    useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        
        if (response.data && response.data.data) {
          const productData = response.data.data;
          
          // Transform API response to match expected format
          const formattedProduct = {
            id: productData._id,
            title: productData.name,
            description: productData.description,
            price: productData.price,
            stock: productData.stock,
            category: productData.category?.toLowerCase() || "other",
            isFeatured: productData.isFeatured || false,
              // Handle images: use actual images from API or fallback to placeholders
            images: productData.images && productData.images.length > 0
              ? productData.images.map(img => (typeof img === 'object' && img.url) ? img.url : getImageUrl(null))
              : ["/images/product-1.jpg", "/images/product-detail-2.jpg"],
              
            // Convert itemsIncluded to features for the "What's Included" section
            features: productData.itemsIncluded && productData.itemsIncluded.length > 0
              ? productData.itemsIncluded.map(item => {
                  // Handle both string and object formats
                  if (typeof item === 'object') {
                    // If item has a description, combine with name
                    return item.description ? `${item.name}: ${item.description}` : item.name;
                  }
                  return String(item);
                })
              : ["No items information available"],
              
            // For subscription products, add standard frequencies
            frequencies: ["monthly", "quarterly", "bi-annual"]
          };
          
          console.log('Product detail fetched from API:', formattedProduct);
          setProduct(formattedProduct);
          
          // Fetch related products
          try {
            // Get products in the same category
            const relatedResponse = await api.get(`/products?category=${productData.category}&limit=4`);
            if (relatedResponse.data && relatedResponse.data.data) {
              // Filter out the current product
              const relatedProductsData = relatedResponse.data.data
                .filter(prod => prod._id !== id)
                .slice(0, 4)
                .map(prod => ({
                  id: prod._id,
                  title: prod.name,
                  price: prod.price,                  image: prod.images && prod.images.length > 0 && typeof prod.images[0] === 'object'
                    ? prod.images[0].url || getImageUrl(null)
                    : getImageUrl(null)
                }));
                
              setRelatedProducts(relatedProductsData);
            }
          } catch (error) {
            console.error('Error fetching related products:', error);
            // Fallback related products
            setRelatedProducts([
              {
                id: 2,
                title: "Quarterly Book Box",
                price: 1499,
                image: "/images/product-2.jpg"
              },
              {
                id: 3,
                title: "Gift Box Special",
                price: 799,
                image: "/images/product-3.jpg"
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        // Show error message or fallback data
        alert('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProductData();
    }
  }, [id]);

  // Check if product is in wishlist
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user && product) {
        try {
          const response = await isInWishlist(product.id);
          setIsWishlisted(response.data.isInWishlist);
        } catch (error) {
          console.error('Error checking wishlist status:', error);
        }
      }
    };

    checkWishlistStatus();
  }, [user, product]);
    const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : getImageUrl(null),
        quantity: quantity,
        frequency: selectedFrequency,
        category: product.category,
        stock: product.stock
      });
      
      setAddedToCart(true);
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    }
  };
  
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };
  
  const toggleWishlist = async () => {
    if (!user) {
      addNotification({
        type: 'warning',
        message: 'Please log in to add items to your wishlist'
      });
      navigate('/login');
      return;
    }

    if (!product) return;

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        setIsWishlisted(false);
        addNotification({
          type: 'success',
          message: 'Removed from wishlist'
        });
      } else {
        await addToWishlist(product.id);
        setIsWishlisted(true);
        addNotification({
          type: 'success',
          message: 'Added to wishlist'
        });
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      addNotification({
        type: 'error',
        message: 'Failed to update wishlist. Please try again.'
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return <Spinner message="Loading product details..." />;
  }
  
  if (!product) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2>Product not found</h2>
          <p style={{ marginBottom: '2rem' }}>Sorry, the product you're looking for doesn't exist.</p>
          <Button variant="primary" onClick={() => navigate('/products')}>
            Browse Products
          </Button>
        </div>
      </PageContainer>
    );
  }
  return (
    <PageContainer>
      {/* Debug panel - only visible in development environment */}
      {process.env.NODE_ENV === 'development' && (
        <APIDebugger endpoint={`/products/${id}`} />
      )}
      
      <ProductSection>
        {/* Product Images */}
        <ImageContainer>          <MainImage 
            src={product.images && product.images.length > 0 ? 
              getImageUrl(product.images[selectedImage]) : getImageUrl(null)} 
            alt={product.title} 
            {...imgErrorProps} 
          />
          {product.isFeatured && (
            <ProductBadge>Featured</ProductBadge>
          )}
          <ThumbnailsContainer>
            {product.images && product.images.length > 0 ? (
              product.images.map((image, index) => (
                <Thumbnail 
                  key={index}
                  active={selectedImage === index}
                  onClick={() => setSelectedImage(index)}
                >
                  <ThumbnailImage 
                    src={getImageUrl(image)} 
                    alt={`${product.title} thumbnail ${index + 1}`} 
                    {...imgErrorProps} 
                  />
                </Thumbnail>
              ))
            ) : (
              <Thumbnail active={true}>
                <ThumbnailImage 
                  src={getImageUrl(null)} 
                  alt="Product placeholder" 
                  {...imgErrorProps} 
                />
              </Thumbnail>
            )}
          </ThumbnailsContainer>
        </ImageContainer>
        
        {/* Product Information */}
        <ProductInfo>
          <ProductTitle>{product.title}</ProductTitle>
          <ProductPrice>
            MVR {product.price}
            {product.oldPrice && (
              <>
                <span className="old-price">MVR {product.oldPrice}</span>
                <span className="discount">{product.discount}</span>
              </>
            )}
          </ProductPrice>
          
          <Description>
            <p>{product.description}</p>
          </Description>
          
          {product.category === 'subscription' && (
            <SubscriptionInfo>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <FaRegClock style={{ marginRight: '0.5rem', color: '#805A29' }} />
                <strong>Subscription Details</strong>
              </div>
              <p style={{ fontSize: '0.9rem' }}>
                Your first box ships within 3-5 business days. Subsequent boxes will be shipped on the 1st of each month.
              </p>
            </SubscriptionInfo>
          )}
            {product.frequencies && product.frequencies.length > 0 && (
            <OptionGroup>
              <OptionLabel>Subscription Frequency</OptionLabel>
              <OptionButtons>
                {product.frequencies.map((frequency) => (
                  <OptionButton 
                    key={frequency}
                    active={selectedFrequency === frequency}
                    onClick={() => setSelectedFrequency(frequency)}
                  >
                    {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                  </OptionButton>
                ))}
              </OptionButtons>
            </OptionGroup>
          )}
          
          <QuantitySelector>
            <button 
              onClick={() => handleQuantityChange(-1)} 
              disabled={quantity <= 1}
            >
              -
            </button>
            <span>{quantity}</span>
            <button 
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= 10}
            >
              +
            </button>
          </QuantitySelector>
          
          <ProductActions>
            <Button 
              variant="primary" 
              onClick={handleAddToCart}
            >
              {addedToCart ? (
                <>
                  <FaCheckCircle style={{ marginRight: '0.5rem' }} />
                  Added to Cart
                </>
              ) : (
                <>
                  <FaShoppingCart style={{ marginRight: '0.5rem' }} />
                  Add to Cart
                </>
              )}
            </Button>
            <WishlistButton
              onClick={toggleWishlist}
              active={isWishlisted}
              disabled={wishlistLoading}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              {wishlistLoading ? '...' : (isWishlisted ? <FaHeart /> : <FaRegHeart />)}
            </WishlistButton>
          </ProductActions>
          
          <Divider />
            <ProductFeatures>
            <FeatureTitle>What's Included</FeatureTitle>
            <FeatureList>
              {product.features && product.features.length > 0 ? (
                product.features.map((feature, index) => (
                  <li key={index}>
                    <FaCheckCircle />
                    {feature}
                  </li>
                ))
              ) : (
                <li>
                  <FaCheckCircle />
                  Product details unavailable
                </li>
              )}
            </FeatureList>
          </ProductFeatures>
        </ProductInfo>
      </ProductSection>
      
      {/* Related Products Section */}
      <RelatedProducts>
        <RelatedHeader>
          <RelatedTitle>You May Also Like</RelatedTitle>
        </RelatedHeader>
        
        <RelatedGrid>
          {relatedProducts.map((relatedProduct, index) => (
            <RelatedProductCard
              key={relatedProduct.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => navigate(`/product/${relatedProduct.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <RelatedProductImage 
                src={getImageUrl(relatedProduct.image)} 
                alt={relatedProduct.title} 
                {...imgErrorProps} 
              />
              <RelatedProductContent>
                <RelatedProductTitle>{relatedProduct.title}</RelatedProductTitle>
                <RelatedProductPrice>MVR {relatedProduct.price}</RelatedProductPrice>
              </RelatedProductContent>
            </RelatedProductCard>
          ))}
        </RelatedGrid>
      </RelatedProducts>
    </PageContainer>
  );
};

export default ProductDetail;
