import { createContext, useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUtils';

// Create context
const CartContext = createContext();

// Provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Load cart from localStorage on initial load
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      setCartItems(parsedCart);
    }
  }, []);

  // Update localStorage and totals whenever cart changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));

    // Calculate totals
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const price = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    setTotalItems(itemCount);
    setTotalPrice(price);
  }, [cartItems]);

  // Helper function to get proper image URL
  const getProductImageUrl = (product) => {
    // Handle different image formats from different sources
    if (product.image) {
      // Already processed image URL
      return product.image;
    }
    
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'object' && firstImage.url) {
        return getImageUrl(firstImage.url);
      } else if (typeof firstImage === 'string') {
        return getImageUrl(firstImage);
      }
    }
    
    // Fallback to placeholder
    return getImageUrl(null);
  };

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    const productId = product._id || product.id;
    const existingItemIndex = cartItems.findIndex(
      (item) => item._id === productId
    );

    if (existingItemIndex >= 0) {
      // Item exists, update quantity
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += quantity;
      setCartItems(updatedCart);
    } else {
      // Item doesn't exist, add new item
      setCartItems([
        ...cartItems,
        {
          _id: productId,
          name: product.name || product.title,
          price: product.price,
          image: getProductImageUrl(product),
          quantity,
          frequency: product.frequency,
          category: product.category,
          stock: product.stock
        },
      ]);
    }
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => item._id !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    const updatedCart = cartItems.map((item) =>
      item._id === productId ? { ...item, quantity } : item
    );
    setCartItems(updatedCart);
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
