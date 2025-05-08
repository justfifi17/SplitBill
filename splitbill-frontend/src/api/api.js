import axios from 'axios';

const API_BASE_URL = 'https://splitbill-api.onrender.com/api';

export const fetchTransactions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/transactions`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
