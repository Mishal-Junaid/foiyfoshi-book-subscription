import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaShoppingCart, FaTrash } from 'react-icons/fa';

import Button from '../components/ui/Button';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import { useNotification } from '../components/ui/Notification';
import { getWishlist, removeFromWishlist } from '../services/wishlistService';

const WishlistContainer = styled.div`
  max-width: 800px;
`;

const PageTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const WishlistGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const WishlistItem = styled(motion.div)`
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #eee;
  display: flex;
  gap: 1rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const ProductImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    width: 100%;
    height: 200px;
  }
`;

const ProductInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ProductName = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const ProductAuthor = styled.p`
  color: #666;
  margin-bottom: 0.5rem;
`;

const ProductPrice = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.gold};
  margin-bottom: 1rem;
`;

const ProductActions = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
  
  svg {
    font-size: 4rem;
    color: #ddd;
    margin-bottom: 1rem;
  }
  
  h3 {
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  p {
    margin-bottom: 1.5rem;
  }
`;

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await getWishlist();
        const wishlistData = response.data || {};
        
        // Transform API data to match component expectations
        const transformedItems = (wishlistData.products || []).map(product => ({
          id: product._id,
          name: product.name,
          author: product.category || 'Unknown Category',
          price: product.price,
          image: product.images && product.images.length > 0 
            ? product.images[0].url || product.images[0]
            : '/images/placeholder.jpg',
          inStock: product.stock > 0
        }));
        
        setWishlistItems(transformedItems);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setError('Failed to load your wishlist. Please try again later.');
        setLoading(false);
      }
    };

    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      await removeFromWishlist(itemId);
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      addNotification({
        type: 'success',
        message: 'Item removed from wishlist'
      });
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      addNotification({
        type: 'error',
        message: 'Failed to remove item from wishlist'
      });
    }
  };

  const handleAddToCart = (item) => {
    try {
      const cartItem = {
        _id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1
      };
      
      addToCart(cartItem);
      addNotification({
        type: 'success',
        message: `${item.name} added to cart!`
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      addNotification({
        type: 'error',
        message: 'Failed to add item to cart'
      });
    }
  };

  if (loading) {
    return (
      <WishlistContainer>
        <PageTitle>My Wishlist</PageTitle>
        <p>Loading your wishlist...</p>
      </WishlistContainer>
    );
  }

  if (error) {
    return (
      <WishlistContainer>
        <PageTitle>My Wishlist</PageTitle>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#d32f2f' }}>
          <p>{error}</p>
          <Button 
            variant="primary" 
            onClick={() => window.location.reload()}
            style={{ marginTop: '1rem' }}
          >
            Try Again
          </Button>
        </div>
      </WishlistContainer>
    );
  }

  return (
    <WishlistContainer>
      <PageTitle>My Wishlist</PageTitle>
      
      {wishlistItems.length === 0 ? (
        <EmptyState>
          <FaHeart />
          <h3>Your wishlist is empty</h3>
          <p>Save items you love to your wishlist and shop them later.</p>
          <Button as={Link} to="/products" variant="primary">
            Browse Books
          </Button>
        </EmptyState>
      ) : (
        <WishlistGrid>
          <AnimatePresence>
            {wishlistItems.map((item, index) => (
              <WishlistItem
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ProductImage 
                  src={item.image} 
                  alt={item.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
                
                <ProductInfo>
                  <div>
                    <ProductName>{item.name}</ProductName>
                    <ProductAuthor>by {item.author}</ProductAuthor>
                    <ProductPrice>MVR {item.price.toFixed(2)}</ProductPrice>
                  </div>
                  
                  <ProductActions>
                    {item.inStock ? (
                      <Button
                        variant="primary"
                        small
                        onClick={() => handleAddToCart(item)}
                      >
                        <FaShoppingCart style={{ marginRight: '0.5rem' }} />
                        Add to Cart
                      </Button>
                    ) : (
                      <Button variant="secondary" small disabled>
                        Out of Stock
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      small
                      onClick={() => handleRemoveFromWishlist(item.id)}
                    >
                      <FaTrash style={{ marginRight: '0.5rem' }} />
                      Remove
                    </Button>
                  </ProductActions>
                </ProductInfo>
              </WishlistItem>
            ))}
          </AnimatePresence>
        </WishlistGrid>
      )}
    </WishlistContainer>
  );
};

export default Wishlist; 