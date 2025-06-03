import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaShoppingBag, 
  FaHeart, 
  FaAddressCard, 
  FaBoxOpen,
  FaArrowRight
} from 'react-icons/fa';

import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import { getMyOrders } from '../services/orderService';
import { getFeaturedProducts, getProducts } from '../services/productService';
import Spinner from '../components/ui/Spinner';

const DashboardContainer = styled.div`
  max-width: 800px;
`;

const WelcomeCard = styled(motion.div)`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 1.5rem 2rem;
  color: #333;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDEwMHYxMDBIMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNOTUuNDk3IDIzLjQ5OEwtNzYuOTk2IDE5NS45OTMgMzAyLjQ5OSAzMDIuNDk3IDE3My45OTcgMzAuNDk5eiIgZmlsbD0iIzgwNUEyOSIgZmlsbC1vcGFjaXR5PSIuMDUiLz48cGF0aCBkPSJNLTYyLjQ5NyAxMjcuNDk4TDExMi45OTYgMzIxLjk5MyA0NzcuNDk5IDQyNC40OTcgMzU0Ljk5NyAxNTQuNDk5eiIgZmlsbD0iIzgwNUEyOSIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3N2Zz4=') no-repeat center right;
    background-size: cover;
    opacity: 0.3;
  }
`;

const WelcomeTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  position: relative;
  z-index: 1;
`;

const WelcomeMessage = styled.p`
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
`;

const QuickLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const QuickLinkCard = styled(Link)`
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #eee;
  text-decoration: none;
  color: ${props => props.theme.colors.black};
  transition: ${props => props.theme.transitions.short};
  display: flex;
  align-items: center;
  gap: 1rem;
  
  &:hover {
    border-color: ${props => props.theme.colors.gold};
    transform: translateY(-3px);
    box-shadow: ${props => props.theme.shadows.medium};
    color: ${props => props.theme.colors.black};
  }
`;

const IconContainer = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 10px;
  background-color: ${props => props.$bgColor || props.theme.colors.gold};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
`;

const LinkContent = styled.div``;

const LinkTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
`;

const LinkText = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  a {
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    
    svg {
      margin-left: 0.25rem;
    }
  }
`;

const RecentOrders = styled.div`
  margin-bottom: 2.5rem;
`;

const OrdersList = styled.div`
  display: grid;
  gap: 1rem;
`;

const OrderCard = styled(motion.div)`
  background-color: white;
  border-radius: 8px;
  padding: 1.25rem;
  border: 1px solid #eee;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const OrderInfo = styled.div``;

const OrderID = styled.h4`
  margin-bottom: 0.25rem;
`;

const OrderMeta = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
  
  div {
    font-size: 0.9rem;
    color: #666;
  }
`;

const OrderStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.6rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  width: fit-content;
  
  background-color: ${props => {
    switch (props.$status) {
      case 'processing':
        return '#fff8e1';
      case 'shipped':
        return '#e3f2fd';
      case 'delivered':
        return '#e8f5e9';
      case 'cancelled':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  }};
  
  color: ${props => {
    switch (props.$status) {
      case 'processing':
        return '#f57c00';
      case 'shipped':
        return '#1976d2';
      case 'delivered':
        return '#388e3c';
      case 'cancelled':
        return '#d32f2f';
      default:
        return '#616161';
    }
  }};
`;

const OrderActions = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    justify-content: flex-end;
  }
`;

const RecommendedBooks = styled.div`
  margin-bottom: 2.5rem;
`;

const BooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
`;

const BookCard = styled(motion.div)`
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #eee;
  text-align: center;
  
  img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    margin-bottom: 1rem;
    border-radius: 4px;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    img {
      height: 160px;
    }
  }
`;

const BookTitle = styled.h4`
  margin-bottom: 0.25rem;
  font-size: 1rem;
  line-height: 1.3;
  
  a {
    color: ${props => props.theme.colors.black};
    
    &:hover {
      color: ${props => props.theme.colors.gold};
    }
  }
`;

const BookAuthor = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  
  p {
    margin-bottom: 1rem;
  }
`;

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const DashboardIndex = () => {
  const [recentOrders, setRecentOrders] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Helper function to get image URL
  const getImageUrl = (images) => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return '/images/placeholder.jpg';
    }
    
    const firstImage = images[0];
    if (typeof firstImage === 'object' && firstImage !== null && firstImage.url) {
      return firstImage.url;
    } else if (typeof firstImage === 'string') {
      return firstImage;
    }
    
    return '/images/placeholder.jpg';
  };

  // Function to get recommendations based on user interests
  const getRecommendations = (products, userInterests) => {
    if (!products || products.length === 0) return [];
    
    // If user has no interests, return featured products or random selection
    if (!userInterests || !userInterests.genres || userInterests.genres.length === 0) {
      const featuredProducts = products.filter(product => product.isFeatured);
      if (featuredProducts.length > 0) {
        return featuredProducts.slice(0, 3);
      }
      // Return random 3 products if no featured products
      return products.slice(0, 3);
    }

    // Score products based on user interests
    const scoredProducts = products.map(product => {
      let score = 0;
      
      // Match product category with user genres
      if (userInterests.genres.includes(product.category)) {
        score += 3;
      }
      
      // Boost score for featured products
      if (product.isFeatured) {
        score += 2;
      }
      
      // Consider reading frequency for certain product types
      if (userInterests.readingFrequency === 'daily' && product.category === 'Monthly Box') {
        score += 1;
      }
      
      return { ...product, score };
    });

    // Sort by score and return top 3
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch real orders
        setOrdersLoading(true);
        const ordersResponse = await getMyOrders();
        const orders = ordersResponse.data || [];
        
        // Get the 3 most recent orders
        const recentOrdersData = orders.slice(0, 3).map(order => ({
          id: order._id,
          orderNumber: order.orderNumber || order._id.slice(-6).toUpperCase(),
          date: order.createdAt,
          total: order.totalPrice,
          status: order.status
        }));
        
        setRecentOrders(recentOrdersData);
        setOrdersLoading(false);
        
        // Fetch real products for recommendations
        try {
          const productsResponse = await getProducts({ limit: 20 });
          const allProducts = productsResponse.data || [];
          
          // Get recommendations based on user interests
          const recommendations = getRecommendations(allProducts, user?.interests);
          
          // Format recommendations for display
          const formattedRecommendations = recommendations.map(product => ({
            id: product._id,
            title: product.name,
            author: product.category || 'FoiyFoshi',
            image: getImageUrl(product.images),
            price: product.price
          }));
          
          setRecommendedBooks(formattedRecommendations);
          console.log('Recommendations based on user interests:', formattedRecommendations);
        } catch (productsErr) {
          console.error('Error fetching products for recommendations:', productsErr);
          // Fallback to featured products
          try {
            const featuredResponse = await getFeaturedProducts(3);
            const featuredProducts = featuredResponse.data || [];
            
            const formattedFeatured = featuredProducts.map(product => ({
              id: product._id,
              title: product.name,
              author: product.category || 'FoiyFoshi',
              image: getImageUrl(product.images),
              price: product.price
            }));
            
            setRecommendedBooks(formattedFeatured);
            console.log('Using featured products as fallback:', formattedFeatured);
          } catch (featuredErr) {
            console.error('Error fetching featured products:', featuredErr);
            setRecommendedBooks([]);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setRecentOrders([]);
        setRecommendedBooks([]);
        setOrdersLoading(false);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  // Get first name for personalization
  const getFirstName = () => {
    if (!user || !user.name) return 'Reader';
    return user.name.split(' ')[0];
  };

  return (
    <DashboardContainer>
      <WelcomeCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <WelcomeTitle>Welcome back, {getFirstName()}!</WelcomeTitle>
        <WelcomeMessage>
          Manage your account, track your orders, and discover your next great read.
        </WelcomeMessage>
      </WelcomeCard>
      
      <QuickLinks>
        <QuickLinkCard to="/dashboard/orders">
          <IconContainer>
            <FaShoppingBag />
          </IconContainer>
          <LinkContent>
            <LinkTitle>My Orders</LinkTitle>
            <LinkText>Track or view your order history</LinkText>
          </LinkContent>
        </QuickLinkCard>
        
        <QuickLinkCard to="/dashboard/wishlist">
          <IconContainer $bgColor="#e91e63">
            <FaHeart />
          </IconContainer>
          <LinkContent>
            <LinkTitle>Wishlist</LinkTitle>
            <LinkText>Books you want to explore</LinkText>
          </LinkContent>
        </QuickLinkCard>
        
        <QuickLinkCard to="/dashboard/addresses">
          <IconContainer $bgColor="#2196f3">
            <FaAddressCard />
          </IconContainer>
          <LinkContent>
            <LinkTitle>Addresses</LinkTitle>
            <LinkText>Manage your delivery addresses</LinkText>
          </LinkContent>
        </QuickLinkCard>
        
        <QuickLinkCard to="/dashboard/profile">
          <IconContainer $bgColor="#9c27b0">
            <FaBoxOpen />
          </IconContainer>
          <LinkContent>
            <LinkTitle>Profile</LinkTitle>
            <LinkText>Update your account information</LinkText>
          </LinkContent>
        </QuickLinkCard>
      </QuickLinks>
      
      <RecentOrders>
        <SectionTitle>
          Recent Orders
          <Link to="/dashboard/orders">
            View All <FaArrowRight />
          </Link>
        </SectionTitle>
        
        {ordersLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Spinner />
          </div>
        ) : recentOrders.length > 0 ? (
          <OrdersList>
            {recentOrders.map((order, index) => (
              <OrderCard
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <OrderInfo>
                  <OrderID>Order #{order.orderNumber}</OrderID>
                  <OrderMeta>
                    <div>
                      <strong>Date:</strong> {formatDate(order.date)}
                    </div>
                    <div>
                      <strong>Total:</strong> MVR {order.total.toFixed(2)}
                    </div>
                  </OrderMeta>
                  <OrderStatus $status={order.status}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </OrderStatus>
                </OrderInfo>
                <OrderActions>
                  <Button 
                    as={Link} 
                    to={`/dashboard/orders/${order.id}`} 
                    small 
                    variant="outline"
                  >
                    View Details
                  </Button>
                </OrderActions>
              </OrderCard>
            ))}
          </OrdersList>
        ) : (
          <NoDataMessage>
            <p>You haven't placed any orders yet.</p>
            <Button 
              small
              onClick={() => {
                console.log('Start Shopping button clicked - navigating to /products');
                navigate('/products');
              }}
            >
              Start Shopping
            </Button>
          </NoDataMessage>
        )}
      </RecentOrders>
      
      <RecommendedBooks>
        <SectionTitle>
          Recommended for You
          <Link to="/products">
            View All <FaArrowRight />
          </Link>
        </SectionTitle>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Spinner />
          </div>
        ) : recommendedBooks.length > 0 ? (
          <BooksGrid>
            {recommendedBooks.map((book, index) => (
              <BookCard
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <img src={book.image} alt={book.title} />
                <BookTitle>
                  <Link to={`/product/${book.id}`}>{book.title}</Link>
                </BookTitle>
                <BookAuthor>Category: {book.author}</BookAuthor>
                {book.price && (
                  <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: '#805A29' }}>
                    MVR {book.price}
                  </div>
                )}
              </BookCard>
            ))}
          </BooksGrid>
        ) : (
          <NoDataMessage>
            <p>No recommendations available at the moment.</p>
            <Button 
              small
              onClick={() => {
                console.log('Browse All Products button clicked - navigating to /products');
                navigate('/products');
              }}
            >
              Browse All Products
            </Button>
          </NoDataMessage>
        )}
      </RecommendedBooks>
    </DashboardContainer>
  );
};

export default DashboardIndex;
