import api from './api';

/**
 * Get all bank information (Admin only)
 * @param {Object} params - Query parameters
 * @returns {Promise}
 */
export const getBankInformation = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const res = await api.get(`/bank?${queryString}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching bank information:', error);
    throw error;
  }
};

/**
 * Get bank information by ID (Admin only)
 * @param {string} id - Bank information ID
 * @returns {Promise}
 */
export const getBankInformationById = async (id) => {
  try {
    const res = await api.get(`/bank/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching bank information by ID:', error);
    throw error;
  }
};

/**
 * Create new bank information (Admin only)
 * @param {Object} bankData - Bank information data
 * @returns {Promise}
 */
export const createBankInformation = async (bankData) => {
  try {
    const res = await api.post('/bank', bankData);
    return res.data;
  } catch (error) {
    console.error('Error creating bank information:', error);
    throw error;
  }
};

/**
 * Update bank information (Admin only)
 * @param {string} id - Bank information ID
 * @param {Object} bankData - Updated bank information data
 * @returns {Promise}
 */
export const updateBankInformation = async (id, bankData) => {
  try {
    const res = await api.put(`/bank/${id}`, bankData);
    return res.data;
  } catch (error) {
    console.error('Error updating bank information:', error);
    throw error;
  }
};

/**
 * Delete bank information (Admin only)
 * @param {string} id - Bank information ID
 * @returns {Promise}
 */
export const deleteBankInformation = async (id) => {
  try {
    const res = await api.delete(`/bank/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting bank information:', error);
    throw error;
  }
};

/**
 * Set primary bank account (Admin only)
 * @param {string} id - Bank information ID
 * @returns {Promise}
 */
export const setPrimaryBank = async (id) => {
  try {
    const res = await api.put(`/bank/${id}/primary`);
    return res.data;
  } catch (error) {
    console.error('Error setting primary bank:', error);
    throw error;
  }
};

/**
 * Get primary bank information (Public)
 * @returns {Promise}
 */
export const getPrimaryBankInformation = async () => {
  try {
    const res = await api.get('/bank/primary');
    return res.data;
  } catch (error) {
    console.error('Error fetching primary bank information:', error);
    throw error;
  }
}; 