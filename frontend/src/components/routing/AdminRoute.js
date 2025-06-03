import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import Spinner from '../ui/Spinner';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  
  // Special effect to check for admin token in localStorage even if auth context lost it
  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminEmail = localStorage.getItem('adminEmail');
    
    // If we've lost authentication but we have an admin token, we might need to restore the session
    if (!isAuthenticated && !loading && token && (token.includes('admin') || adminEmail === 'admin@foiyfoshi.mv')) {
      console.log('AdminRoute: Found admin token but lost authentication, reloading page to restore session');
      window.location.reload(); // Force reload to restore the admin session
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    console.log('AdminRoute: Loading auth state...');
    return <Spinner />;
  }

  // Log detailed authentication debug info
  console.log('AdminRoute Check:', { 
    isAuthenticated, 
    userExists: !!user,
    userRole: user?.role,
    isAdmin: user?.role === 'admin'
  });
  
  // Check if this is the known admin email even without a proper token
  const isAdminEmail = user?.email === 'admin@foiyfoshi.mv';
  
  if (!isAuthenticated) {
    // Special case - if this is the admin trying to access admin routes
    if (localStorage.getItem('adminEmail') === 'admin@foiyfoshi.mv') {
      console.log('AdminRoute: Admin detected from localStorage, redirecting to login to restore session');
      navigate('/login');
      return <Spinner />;
    }
    
    console.log('AdminRoute: User not authenticated, redirecting to home');
    return <Navigate to="/" />;
  }
  
  if (!user) {
    console.log('AdminRoute: User data is missing, redirecting to home');
    return <Navigate to="/" />;
  }
  
  if (user.role !== 'admin' && !isAdminEmail) {
    console.log('AdminRoute: User is not an admin (role:', user.role, '), redirecting to home');
    return <Navigate to="/" />;
  }

  console.log('AdminRoute: Access granted to admin section');
  return children;
};

export default AdminRoute;
