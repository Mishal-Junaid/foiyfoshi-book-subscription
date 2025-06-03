import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

// Container for individual notification
const NotificationItem = styled(motion.div)`
  position: relative;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  border-left: 4px solid;
  border-left-color: ${props => {
    switch (props.type) {
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      default: return '#2196f3';
    }
  }};
  width: 100%;
  max-width: 400px;
  overflow: hidden;
`;

const IconContainer = styled.div`
  margin-right: 0.75rem;
  font-size: 1.25rem;
  color: ${props => {
    switch (props.type) {
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      default: return '#2196f3';
    }
  }};
`;

const ContentContainer = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h4`
  margin: 0 0 0.25rem;
  font-size: 1rem;
  font-weight: 600;
`;

const NotificationMessage = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #666;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-left: 0.75rem;
  cursor: pointer;
  color: #999;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #666;
  }
`;

// Container for all notifications
const NotificationsContainer = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
`;

// Context to manage notifications throughout the app
const NotificationContext = React.createContext({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {}
});

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = {
      id,
      title: notification.title || '',
      message: notification.message || '',
      type: notification.type || 'info',
      duration: notification.duration || 5000
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <Notifications />
    </NotificationContext.Provider>
  );
};

// Hook to use notifications from any component
export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};

// Notification item component
const Notification = ({ notification, onClose }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaExclamationCircle />;
      case 'warning':
        return <FaExclamationCircle />;
      default:
        return <FaInfoCircle />;
    }
  };

  return (
    <NotificationItem
      type={notification.type}
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      layout
      transition={{ duration: 0.2 }}
    >
      <IconContainer type={notification.type}>
        {getIcon()}
      </IconContainer>
      <ContentContainer>
        {notification.title && <NotificationTitle>{notification.title}</NotificationTitle>}
        <NotificationMessage>{notification.message}</NotificationMessage>
      </ContentContainer>
      <CloseButton onClick={() => onClose(notification.id)}>
        <FaTimes />
      </CloseButton>
    </NotificationItem>
  );
};

// Component to render all notifications
const Notifications = () => {
  const { notifications, removeNotification } = useContext(NotificationContext);

  return (
    <NotificationsContainer>
      <AnimatePresence>
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </AnimatePresence>
    </NotificationsContainer>
  );
};

export default Notification;
