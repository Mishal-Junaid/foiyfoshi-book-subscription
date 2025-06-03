import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const InputContainer = styled.div`
  margin-bottom: 1.5rem;
  width: 100%;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme.colors.black};
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid ${props => 
    props.error 
      ? props.theme.colors.error 
      : props.success 
      ? props.theme.colors.success 
      : '#e0e0e0'
  };
  border-radius: 4px;
  font-size: 1rem;
  font-family: ${props => props.theme.fonts.body};
  background-color: ${props => props.disabled ? '#f9f9f9' : '#ffffff'};
  transition: ${props => props.theme.transitions.short};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.gold};
    box-shadow: 0 0 0 2px rgba(164, 112, 49, 0.2);
  }
  
  &::placeholder {
    color: #aaaaaa;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const TextareaField = styled.textarea`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid ${props => 
    props.error 
      ? props.theme.colors.error 
      : props.success 
      ? props.theme.colors.success 
      : '#e0e0e0'
  };
  border-radius: 4px;
  font-size: 1rem;
  font-family: ${props => props.theme.fonts.body};
  background-color: ${props => props.disabled ? '#f9f9f9' : '#ffffff'};
  transition: ${props => props.theme.transitions.short};
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.gold};
    box-shadow: 0 0 0 2px rgba(164, 112, 49, 0.2);
  }
  
  &::placeholder {
    color: #aaaaaa;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const SelectField = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid ${props => 
    props.error 
      ? props.theme.colors.error 
      : props.success 
      ? props.theme.colors.success 
      : '#e0e0e0'
  };
  border-radius: 4px;
  font-size: 1rem;
  font-family: ${props => props.theme.fonts.body};
  background-color: ${props => props.disabled ? '#f9f9f9' : '#ffffff'};
  transition: ${props => props.theme.transitions.short};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.gold};
    box-shadow: 0 0 0 2px rgba(164, 112, 49, 0.2);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ErrorMessage = styled(motion.div)`
  color: ${props => props.theme.colors.error};
  font-size: 0.85rem;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled(motion.div)`
  color: ${props => props.theme.colors.success};
  font-size: 0.85rem;
  margin-top: 0.5rem;
`;

const HelpText = styled.div`
  color: #666666;
  font-size: 0.85rem;
  margin-top: 0.5rem;
`;

const FieldAnimation = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
};

export const FormInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  success,
  disabled = false,
  required = false,
  helpText,
  successMessage,
  ...props
}) => {
  return (
    <InputContainer>
      {label && (
        <Label htmlFor={name}>
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </Label>
      )}
      <InputField
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        error={error}
        success={success}
        disabled={disabled}
        required={required}
        {...props}
      />
      
      {error && (
        <ErrorMessage
          initial="initial"
          animate="animate"
          exit="exit"
          variants={FieldAnimation}
        >
          {error}
        </ErrorMessage>
      )}
      
      {!error && success && successMessage && (
        <SuccessMessage
          initial="initial"
          animate="animate"
          exit="exit"
          variants={FieldAnimation}
        >
          {successMessage}
        </SuccessMessage>
      )}
      
      {helpText && <HelpText>{helpText}</HelpText>}
    </InputContainer>
  );
};

export const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  success,
  disabled = false,
  required = false,
  helpText,
  rows = 4,
  ...props
}) => {
  return (
    <InputContainer>
      {label && (
        <Label htmlFor={name}>
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </Label>
      )}
      <TextareaField
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        error={error}
        success={success}
        disabled={disabled}
        required={required}
        rows={rows}
        {...props}
      />
      
      {error && (
        <ErrorMessage
          initial="initial"
          animate="animate"
          exit="exit"
          variants={FieldAnimation}
        >
          {error}
        </ErrorMessage>
      )}
      
      {helpText && <HelpText>{helpText}</HelpText>}
    </InputContainer>
  );
};

export const FormSelect = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
  error,
  success,
  disabled = false,
  required = false,
  helpText,
  children,
  ...props
}) => {
  return (
    <InputContainer>
      {label && (
        <Label htmlFor={name}>
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </Label>
      )}
      <SelectField
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        success={success}
        disabled={disabled}
        required={required}
        {...props}
      >
        {options ? (
          <>
            <option value="">Select an option</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </>
        ) : (
          children
        )}
      </SelectField>
      
      {error && (
        <ErrorMessage
          initial="initial"
          animate="animate"
          exit="exit"
          variants={FieldAnimation}
        >
          {error}
        </ErrorMessage>
      )}
      
      {helpText && <HelpText>{helpText}</HelpText>}
    </InputContainer>
  );
};

export const FormCheckbox = ({
  label,
  name,
  checked,
  onChange,
  error,
  disabled = false,
  required = false,
  helpText,
  ...props
}) => {
  return (
    <InputContainer>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          required={required}
          style={{ marginRight: '8px' }}
          {...props}
        />
        <Label htmlFor={name} style={{ margin: 0 }}>
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </Label>
      </div>
      
      {error && (
        <ErrorMessage
          initial="initial"
          animate="animate"
          exit="exit"
          variants={FieldAnimation}
        >
          {error}
        </ErrorMessage>
      )}
      
      {helpText && <HelpText>{helpText}</HelpText>}
    </InputContainer>
  );
};

export const FormGroup = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    gap: 0;
  }
`;
