import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaHome, FaBriefcase } from 'react-icons/fa';

import Button from '../components/ui/Button';
import useAuth from '../hooks/useAuth';

const AddressesContainer = styled.div`
  max-width: 800px;
`;

const PageTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const AddressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const AddressGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const AddressCard = styled(motion.div)`
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #eee;
  position: relative;
  
  ${props => props.$isDefault && `
    border-color: ${props.theme.colors.gold};
    background-color: #fffbf0;
  `}
`;

const AddressType = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.gold};
  
  svg {
    font-size: 1.1rem;
  }
`;

const DefaultBadge = styled.span`
  background-color: ${props => props.theme.colors.gold};
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: auto;
`;

const AddressDetails = styled.div`
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #333;
`;

const AddressName = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const AddressLine = styled.div`
  margin-bottom: 0.3rem;
`;

const AddressActions = styled.div`
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

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.gold};
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.gold};
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 1.2rem;
  height: 1.2rem;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    type: 'home',
    isDefault: false
  });
  const { user } = useAuth();

  useEffect(() => {
    // Simulate loading addresses
    const fetchAddresses = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock addresses data
        const mockAddresses = [
          {
            id: '1',
            name: 'John Doe',
            phone: '+960 123-4567',
            addressLine1: 'Majeedhee Magu',
            addressLine2: 'Near Central Park',
            city: 'Malé',
            state: 'Kaafu Atoll',
            postalCode: '20026',
            type: 'home',
            isDefault: true
          },
          {
            id: '2',
            name: 'John Doe',
            phone: '+960 987-6543',
            addressLine1: 'Sosun Magu',
            addressLine2: 'Office Building 2nd Floor',
            city: 'Malé',
            state: 'Kaafu Atoll',
            postalCode: '20026',
            type: 'work',
            isDefault: false
          }
        ];
        
        setAddresses(mockAddresses);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching addresses:', err);
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setFormData({
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      type: 'home',
      isDefault: false
    });
    setShowModal(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setFormData(address);
    setShowModal(true);
  };

  const handleDeleteAddress = (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingAddress) {
      // Update existing address
      setAddresses(prev => prev.map(addr => 
        addr.id === editingAddress.id ? { ...formData, id: editingAddress.id } : addr
      ));
    } else {
      // Add new address
      const newAddress = {
        ...formData,
        id: Date.now().toString()
      };
      setAddresses(prev => [...prev, newAddress]);
    }
    
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getAddressTypeIcon = (type) => {
    switch (type) {
      case 'home':
        return <FaHome />;
      case 'work':
        return <FaBriefcase />;
      default:
        return <FaMapMarkerAlt />;
    }
  };

  if (loading) {
    return (
      <AddressesContainer>
        <PageTitle>My Addresses</PageTitle>
        <p>Loading your addresses...</p>
      </AddressesContainer>
    );
  }

  return (
    <AddressesContainer>
      <AddressHeader>
        <PageTitle>My Addresses</PageTitle>
        <Button variant="primary" onClick={handleAddAddress}>
          <FaPlus style={{ marginRight: '0.5rem' }} />
          Add New Address
        </Button>
      </AddressHeader>
      
      {addresses.length === 0 ? (
        <EmptyState>
          <FaMapMarkerAlt />
          <h3>No addresses saved</h3>
          <p>Add your delivery addresses to make checkout faster.</p>
          <Button variant="primary" onClick={handleAddAddress}>
            Add Your First Address
          </Button>
        </EmptyState>
      ) : (
        <AddressGrid>
          <AnimatePresence>
            {addresses.map((address, index) => (
              <AddressCard
                key={address.id}
                $isDefault={address.isDefault}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <AddressType>
                  {getAddressTypeIcon(address.type)}
                  {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                  {address.isDefault && <DefaultBadge>Default</DefaultBadge>}
                </AddressType>
                
                <AddressDetails>
                  <AddressName>{address.name}</AddressName>
                  <AddressLine>{address.phone}</AddressLine>
                  <AddressLine>{address.addressLine1}</AddressLine>
                  {address.addressLine2 && <AddressLine>{address.addressLine2}</AddressLine>}
                  <AddressLine>{address.city}, {address.state} {address.postalCode}</AddressLine>
                </AddressDetails>
                
                <AddressActions>
                  <Button
                    variant="outline"
                    small
                    onClick={() => handleEditAddress(address)}
                  >
                    <FaEdit style={{ marginRight: '0.5rem' }} />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    small
                    onClick={() => handleDeleteAddress(address.id)}
                    disabled={address.isDefault}
                  >
                    <FaTrash style={{ marginRight: '0.5rem' }} />
                    Delete
                  </Button>
                </AddressActions>
              </AddressCard>
            ))}
          </AnimatePresence>
        </AddressGrid>
      )}

      {/* Add/Edit Address Modal */}
      <AnimatePresence>
        {showModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalTitle>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </ModalTitle>
              
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Address Line 1</Label>
                  <Input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Address Line 2 (Optional)</Label>
                  <Input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>City</Label>
                  <Input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>State/Atoll</Label>
                  <Input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Postal Code</Label>
                  <Input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Address Type</Label>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </Select>
                </FormGroup>
                
                <CheckboxGroup>
                  <Checkbox
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                  />
                  <Label>Set as default address</Label>
                </CheckboxGroup>
                
                <ModalActions>
                  <Button type="submit" variant="primary">
                    {editingAddress ? 'Update Address' : 'Add Address'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                </ModalActions>
              </Form>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </AddressesContainer>
  );
};

export default Addresses; 