import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUniversity, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaStar, 
  FaRegStar, 
  FaCopy, 
  FaCheck, 
  FaTimes, 
  FaGlobe, 
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';
import AdminLayout from '../../components/layout/AdminLayout';
import { useNotification } from '../../components/ui/Notification';
import {
  getBankInformation,
  createBankInformation,
  updateBankInformation,
  deleteBankInformation,
  setPrimaryBank
} from '../../services/bankService';

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    color: ${props => props.theme.colors.mediumGold};
  }
`;

const AddButton = styled.button`
  background: ${props => props.theme.colors.mediumGold};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    background: ${props => props.theme.colors.paleGold};
    transform: translateY(-2px);
  }
`;

const BankGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const BankCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: ${props => props.isPrimary ? `2px solid ${props.theme.colors.mediumGold}` : '2px solid transparent'};
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.isPrimary 
      ? props.theme.colors.mediumGold 
      : props.isActive 
        ? props.theme.colors.success 
        : props.theme.colors.grey};
  }
`;

const BankHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const BankTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    color: ${props => props.theme.colors.mediumGold};
  }
`;

const BankActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: ${props => props.variant === 'primary' ? props.theme.colors.mediumGold : 
                     props.variant === 'danger' ? props.theme.colors.danger : 
                     props.theme.colors.grey};
  color: white;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const BankDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const DetailGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailLabel = styled.span`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  
  &.primary {
    background: ${props => props.theme.colors.mediumGold}20;
    color: ${props => props.theme.colors.mediumGold};
  }
  
  &.active {
    background: ${props => props.theme.colors.success}20;
    color: ${props => props.theme.colors.success};
  }
  
  &.inactive {
    background: ${props => props.theme.colors.grey}20;
    color: ${props => props.theme.colors.grey};
  }
  
  svg {
    margin-right: 0.25rem;
  }
`;

const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.theme.colors.lightGrey};
  color: ${props => props.theme.colors.text};
  
  svg {
    margin-right: 0.25rem;
  }
`;

// Modal Styles
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const Modal = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.lightGrey};
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${props => props.theme.colors.grey};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  
  &:hover {
    background: ${props => props.theme.colors.lightGrey};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid ${props => props.theme.colors.lightGrey};
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.mediumGold};
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 2px solid ${props => props.theme.colors.lightGrey};
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.mediumGold};
  }
`;

const Textarea = styled.textarea`
  padding: 12px;
  border: 2px solid ${props => props.theme.colors.lightGrey};
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.mediumGold};
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  accent-color: ${props => props.theme.colors.mediumGold};
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme.colors.lightGrey};
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: ${props => props.theme.colors.mediumGold};
    color: white;
    
    &:hover {
      background: ${props => props.theme.colors.paleGold};
    }
  }
  
  &.secondary {
    background: ${props => props.theme.colors.lightGrey};
    color: ${props => props.theme.colors.text};
    
    &:hover {
      background: ${props => props.theme.colors.grey};
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.textLight};
  
  svg {
    font-size: 4rem;
    margin-bottom: 1rem;
    color: ${props => props.theme.colors.lightGrey};
  }
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: ${props => props.theme.colors.text};
  }
  
  p {
    margin: 0;
    font-size: 1.1rem;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  
  &:after {
    content: '';
    width: 40px;
    height: 40px;
    border: 3px solid ${props => props.theme.colors.lightGrey};
    border-top: 3px solid ${props => props.theme.colors.mediumGold};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const BankInformation = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    swiftCode: '',
    iban: '',
    branch: '',
    currency: 'MVR',
    paymentInstructions: 'Please use your order number as the payment reference.',
    isActive: true,
    isPrimary: false,
    bankType: 'local',
    contactInfo: {
      email: '',
      phone: ''
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const response = await getBankInformation();
      setBanks(response.data || []);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to fetch bank information'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBank = () => {
    setEditingBank(null);
    setFormData({
      bankName: '',
      accountName: '',
      accountNumber: '',
      routingNumber: '',
      swiftCode: '',
      iban: '',
      branch: '',
      currency: 'MVR',
      paymentInstructions: 'Please use your order number as the payment reference.',
      isActive: true,
      isPrimary: false,
      bankType: 'local',
      contactInfo: {
        email: '',
        phone: ''
      }
    });
    setShowModal(true);
  };

  const handleEditBank = (bank) => {
    setEditingBank(bank);
    setFormData({
      bankName: bank.bankName || '',
      accountName: bank.accountName || '',
      accountNumber: bank.accountNumber || '',
      routingNumber: bank.routingNumber || '',
      swiftCode: bank.swiftCode || '',
      iban: bank.iban || '',
      branch: bank.branch || '',
      currency: bank.currency || 'MVR',
      paymentInstructions: bank.paymentInstructions || '',
      isActive: bank.isActive,
      isPrimary: bank.isPrimary,
      bankType: bank.bankType || 'local',
      contactInfo: {
        email: bank.contactInfo?.email || '',
        phone: bank.contactInfo?.phone || ''
      }
    });
    setShowModal(true);
  };

  const handleDeleteBank = async (bankId) => {
    if (!window.confirm('Are you sure you want to delete this bank account? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteBankInformation(bankId);
      addNotification({
        type: 'success',
        message: 'Bank account deleted successfully'
      });
      fetchBanks();
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.response?.data?.error || 'Failed to delete bank account'
      });
    }
  };

  const handleSetPrimary = async (bankId) => {
    try {
      await setPrimaryBank(bankId);
      addNotification({
        type: 'success',
        message: 'Primary bank account updated successfully'
      });
      fetchBanks();
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.response?.data?.error || 'Failed to update primary bank account'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingBank) {
        await updateBankInformation(editingBank._id, formData);
        addNotification({
          type: 'success',
          message: 'Bank information updated successfully'
        });
      } else {
        await createBankInformation(formData);
        addNotification({
          type: 'success',
          message: 'Bank information created successfully'
        });
      }
      
      setShowModal(false);
      fetchBanks();
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.response?.data?.error || 'Failed to save bank information'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Container>
          <LoadingSpinner />
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>
            <FaUniversity />
            Bank Information
          </Title>
          <AddButton onClick={handleAddBank}>
            <FaPlus />
            Add Bank Account
          </AddButton>
        </Header>

        {banks.length === 0 ? (
          <EmptyState>
            <FaUniversity />
            <h3>No Bank Accounts</h3>
            <p>Add your first bank account to start accepting payments</p>
          </EmptyState>
        ) : (
          <BankGrid>
            {banks.map((bank) => (
              <BankCard
                key={bank._id}
                isPrimary={bank.isPrimary}
                isActive={bank.isActive}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <BankHeader>
                  <BankTitle>
                    <FaUniversity />
                    {bank.bankName}
                  </BankTitle>
                  <BankActions>
                    {!bank.isPrimary && (
                      <ActionButton
                        variant="primary"
                        onClick={() => handleSetPrimary(bank._id)}
                        title="Set as Primary"
                      >
                        <FaRegStar />
                      </ActionButton>
                    )}
                    <ActionButton
                      onClick={() => handleEditBank(bank)}
                      title="Edit"
                    >
                      <FaEdit />
                    </ActionButton>
                    <ActionButton
                      variant="danger"
                      onClick={() => handleDeleteBank(bank._id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </ActionButton>
                  </BankActions>
                </BankHeader>

                <BankDetails>
                  <DetailGroup>
                    <DetailLabel>Account Name</DetailLabel>
                    <DetailValue>{bank.accountName}</DetailValue>
                  </DetailGroup>
                  <DetailGroup>
                    <DetailLabel>Account Number</DetailLabel>
                    <DetailValue>{bank.accountNumber}</DetailValue>
                  </DetailGroup>
                  {bank.branch && (
                    <DetailGroup>
                      <DetailLabel>Branch</DetailLabel>
                      <DetailValue>{bank.branch}</DetailValue>
                    </DetailGroup>
                  )}
                  <DetailGroup>
                    <DetailLabel>Currency</DetailLabel>
                    <DetailValue>{bank.currency}</DetailValue>
                  </DetailGroup>
                </BankDetails>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {bank.isPrimary && (
                    <StatusBadge className="primary">
                      <FaStar />
                      Primary
                    </StatusBadge>
                  )}
                  <StatusBadge className={bank.isActive ? 'active' : 'inactive'}>
                    <FaCheck />
                    {bank.isActive ? 'Active' : 'Inactive'}
                  </StatusBadge>
                  <TypeBadge>
                    {bank.bankType === 'local' ? <FaMapMarkerAlt /> : <FaGlobe />}
                    {bank.bankType === 'local' ? 'Local' : 'International'}
                  </TypeBadge>
                </div>

                {bank.paymentInstructions && (
                  <DetailGroup>
                    <DetailLabel>Payment Instructions</DetailLabel>
                    <DetailValue style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                      {bank.paymentInstructions}
                    </DetailValue>
                  </DetailGroup>
                )}
              </BankCard>
            ))}
          </BankGrid>
        )}

        <AnimatePresence>
          {showModal && (
            <ModalOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
            >
              <Modal
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <ModalHeader>
                  <ModalTitle>
                    {editingBank ? 'Edit Bank Account' : 'Add Bank Account'}
                  </ModalTitle>
                  <CloseButton onClick={() => setShowModal(false)}>
                    <FaTimes />
                  </CloseButton>
                </ModalHeader>

                <Form onSubmit={handleSubmit}>
                  <FormRow>
                    <FormGroup>
                      <Label>Bank Name *</Label>
                      <Input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Bank of Maldives"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Account Name *</Label>
                      <Input
                        type="text"
                        name="accountName"
                        value={formData.accountName}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., FoiyFoshi Pvt Ltd"
                      />
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup>
                      <Label>Account Number *</Label>
                      <Input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., 1234567890"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Currency *</Label>
                      <Select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="MVR">MVR - Maldivian Rufiyaa</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                      </Select>
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup>
                      <Label>Bank Type</Label>
                      <Select
                        name="bankType"
                        value={formData.bankType}
                        onChange={handleInputChange}
                      >
                        <option value="local">Local Bank</option>
                        <option value="international">International Bank</option>
                      </Select>
                    </FormGroup>
                    <FormGroup>
                      <Label>Branch</Label>
                      <Input
                        type="text"
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        placeholder="e.g., Male Branch"
                      />
                    </FormGroup>
                  </FormRow>

                  {formData.bankType === 'international' && (
                    <FormRow>
                      <FormGroup>
                        <Label>SWIFT Code</Label>
                        <Input
                          type="text"
                          name="swiftCode"
                          value={formData.swiftCode}
                          onChange={handleInputChange}
                          placeholder="e.g., BOMVMVMV"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>IBAN</Label>
                        <Input
                          type="text"
                          name="iban"
                          value={formData.iban}
                          onChange={handleInputChange}
                          placeholder="e.g., MV64BOMV0001234567890"
                        />
                      </FormGroup>
                    </FormRow>
                  )}

                  <FormRow>
                    <FormGroup>
                      <Label>Routing Number</Label>
                      <Input
                        type="text"
                        name="routingNumber"
                        value={formData.routingNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., 001234567"
                      />
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup>
                      <Label>Contact Email</Label>
                      <Input
                        type="email"
                        name="contactInfo.email"
                        value={formData.contactInfo.email}
                        onChange={handleInputChange}
                        placeholder="e.g., payments@foiyfoshi.mv"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Contact Phone</Label>
                      <Input
                        type="tel"
                        name="contactInfo.phone"
                        value={formData.contactInfo.phone}
                        onChange={handleInputChange}
                        placeholder="e.g., +960 330-5555"
                      />
                    </FormGroup>
                  </FormRow>

                  <FormGroup>
                    <Label>Payment Instructions</Label>
                    <Textarea
                      name="paymentInstructions"
                      value={formData.paymentInstructions}
                      onChange={handleInputChange}
                      placeholder="Instructions for customers making payments to this account..."
                    />
                  </FormGroup>

                  <FormRow>
                    <CheckboxGroup>
                      <Checkbox
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                      />
                      <Label>Active Account</Label>
                    </CheckboxGroup>
                    <CheckboxGroup>
                      <Checkbox
                        type="checkbox"
                        name="isPrimary"
                        checked={formData.isPrimary}
                        onChange={handleInputChange}
                      />
                      <Label>Set as Primary Account</Label>
                    </CheckboxGroup>
                  </FormRow>

                  <FormActions>
                    <Button
                      type="button"
                      className="secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="primary"
                      disabled={submitting}
                    >
                      {submitting ? 'Saving...' : editingBank ? 'Update' : 'Create'}
                    </Button>
                  </FormActions>
                </Form>
              </Modal>
            </ModalOverlay>
          )}
        </AnimatePresence>
      </Container>
    </AdminLayout>
  );
};

export default BankInformation; 