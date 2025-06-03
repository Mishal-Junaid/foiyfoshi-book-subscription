import React from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle, FaQuestionCircle, FaCheckCircle } from 'react-icons/fa';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ConfirmationModal = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h3`
  margin: 0;
  margin-left: 1rem;
  color: ${props => {
    switch(props.type) {
      case 'danger': return props.theme.colors.danger;
      case 'success': return props.theme.colors.success;
      default: return props.theme.colors.primary;
    }
  }};
`;

const ModalBody = styled.div`
  margin-bottom: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  background-color: ${props => {
    if (props.variant === 'primary') return props.theme.colors.primary;
    if (props.variant === 'danger') return props.theme.colors.danger;
    if (props.variant === 'success') return props.theme.colors.success;
    return '#e0e0e0';
  }};
  color: ${props => (props.variant === 'primary' || props.variant === 'danger' || props.variant === 'success') ? 'white' : '#333'};
  
  &:hover {
    opacity: 0.9;
  }
`;

const ConfirmationDialog = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  onConfirm, 
  onCancel,
  type = 'confirm' // 'confirm', 'danger', 'success'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch(type) {
      case 'danger': return <FaExclamationTriangle size={24} color="#d32f2f" />;
      case 'success': return <FaCheckCircle size={24} color="#2e7d32" />;
      default: return <FaQuestionCircle size={24} color="#1976d2" />;
    }
  };

  return (
    <ModalOverlay>
      <ConfirmationModal>
        <ModalHeader>
          {getIcon()}
          <ModalTitle type={type}>{title}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>{message}</p>
        </ModalBody>
        <ButtonGroup>          {onCancel && (
            <Button variant="default" onClick={onCancel}>
              {cancelText}
            </Button>
          )}<Button 
            variant={type === 'confirm' ? 'primary' : type === 'danger' ? 'danger' : type === 'success' ? 'success' : 'primary'}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </ButtonGroup>
      </ConfirmationModal>
    </ModalOverlay>
  );
};

export default ConfirmationDialog;
