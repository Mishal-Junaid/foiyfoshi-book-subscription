import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles, theme } from './styles/theme';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ContentProvider } from './context/ContentContext';
import { NotificationProvider } from './components/ui/Notification';
import ProtectedRoute from './components/routing/ProtectedRoute';
import AdminRoute from './components/routing/AdminRoute';
import DevHelper from './components/DevHelper';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Spinner from './components/ui/Spinner';
import ScrollToTop from './components/ui/ScrollToTop';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const UserInterests = lazy(() => import('./pages/UserInterests'));
const OTPVerification = lazy(() => import('./pages/OTPVerification'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Unsubscribe = lazy(() => import('./pages/Unsubscribe'));

// Dashboard pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DashboardIndex = lazy(() => import('./pages/DashboardIndex'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Addresses = lazy(() => import('./pages/Addresses'));
const PaymentMethods = lazy(() => import('./pages/PaymentMethods'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminUserEdit = lazy(() => import('./pages/admin/UserEdit'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminProductEdit = lazy(() => import('./pages/admin/ProductEdit'));
const AdminOrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const AdminContent = lazy(() => import('./pages/admin/Content'));
const VerifyPayments = lazy(() => import('./pages/admin/VerifyPayments'));
const AdminNewsletter = lazy(() => import('./pages/admin/Newsletter'));
const AdminMessages = lazy(() => import('./pages/admin/Messages'));
const BankInformation = lazy(() => import('./pages/admin/BankInformation'));

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <NotificationProvider>
        <AuthProvider>
          <ContentProvider>
            <CartProvider>
              <Router>
                <ScrollToTop />
                <DevHelper />
                <Navbar />
                <Suspense fallback={<Spinner />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/unsubscribe" element={<Unsubscribe />} />
                    <Route path="/checkout" element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    } />
                    <Route path="/checkout/confirmation" element={
                      <ProtectedRoute>
                        <OrderConfirmation />
                      </ProtectedRoute>
                    } />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/user-interests" element={
                      <ProtectedRoute>
                        <UserInterests />
                      </ProtectedRoute>
                    } />
                    <Route path="/verify-otp" element={<OTPVerification />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    
                    {/* Protected User Routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }>
                      {/* Nested Dashboard Routes */}
                      <Route index element={<DashboardIndex />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="orders/:orderId" element={<OrderDetails />} />
                      <Route path="wishlist" element={<Wishlist />} />
                      <Route path="addresses" element={<Addresses />} />
                      <Route path="payment-methods" element={<PaymentMethods />} />
                    </Route>
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    } />
                    <Route path="/admin/users" element={
                      <AdminRoute>
                        <AdminUsers />
                      </AdminRoute>
                    } />
                    <Route path="/admin/users/new" element={
                      <AdminRoute>
                        <AdminUserEdit />
                      </AdminRoute>
                    } />
                    <Route path="/admin/users/edit/:id" element={
                      <AdminRoute>
                        <AdminUserEdit />
                      </AdminRoute>
                    } />
                    <Route path="/admin/products" element={
                      <AdminRoute>
                        <AdminProducts />
                      </AdminRoute>
                    } />
                    <Route path="/admin/products/new" element={
                      <AdminRoute>
                        <AdminProductEdit />
                      </AdminRoute>
                    } />
                    <Route path="/admin/products/edit/:id" element={
                      <AdminRoute>
                        <AdminProductEdit />
                      </AdminRoute>
                    } />
                    <Route path="/admin/orders" element={
                      <AdminRoute>
                        <VerifyPayments />
                      </AdminRoute>
                    } />
                    <Route path="/admin/orders/:id" element={
                      <AdminRoute>
                        <AdminOrderDetail />
                      </AdminRoute>
                    } />
                    <Route path="/admin/newsletter" element={
                      <AdminRoute>
                        <AdminNewsletter />
                      </AdminRoute>
                    } />
                    <Route path="/admin/content" element={
                      <AdminRoute>
                        <AdminContent />
                      </AdminRoute>
                    } />
                    <Route path="/admin/messages" element={
                      <AdminRoute>
                        <AdminMessages />
                      </AdminRoute>
                    } />
                    <Route path="/admin/bank-information" element={
                      <AdminRoute>
                        <BankInformation />
                      </AdminRoute>
                    } />
                  </Routes>
                </Suspense>
                <Footer />
              </Router>
            </CartProvider>
          </ContentProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
