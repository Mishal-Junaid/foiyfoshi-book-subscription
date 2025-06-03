import React, { createContext, useContext, useState, useCallback } from 'react';

// Create the context
const NotificationContext = createContext();

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add notification
  const addNotification = useCallback((message, type = NOTIFICATION_TYPES.INFO, duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message, duration) => {
    return addNotification(message, NOTIFICATION_TYPES.SUCCESS, duration);
  }, [addNotification]);

  const showError = useCallback((message, duration) => {
    return addNotification(message, NOTIFICATION_TYPES.ERROR, duration);
  }, [addNotification]);

  const showWarning = useCallback((message, duration) => {
    return addNotification(message, NOTIFICATION_TYPES.WARNING, duration);
  }, [addNotification]);

  const showInfo = useCallback((message, duration) => {
    return addNotification(message, NOTIFICATION_TYPES.INFO, duration);
  }, [addNotification]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    // If no context is provided, return dummy functions for development
    console.warn('useNotification must be used within a NotificationProvider. Returning dummy functions.');
    return {
      notifications: [],
      addNotification: () => {},
      removeNotification: () => {},
      showSuccess: (message) => console.log('Success:', message),
      showError: (message) => console.error('Error:', message),
      showWarning: (message) => console.warn('Warning:', message),
      showInfo: (message) => console.info('Info:', message),
      clearAll: () => {}
    };
  }
  
  return context;
};

// Notification display component (optional)
export const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      maxWidth: '400px'
    }}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={{
            padding: '12px 16px',
            marginBottom: '8px',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            backgroundColor: 
              notification.type === 'success' ? '#10b981' :
              notification.type === 'error' ? '#ef4444' :
              notification.type === 'warning' ? '#f59e0b' :
              '#3b82f6',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          onClick={() => removeNotification(notification.id)}
        >
          <div style={{ fontWeight: '500' }}>
            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
          </div>
          <div>{notification.message}</div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContext; 