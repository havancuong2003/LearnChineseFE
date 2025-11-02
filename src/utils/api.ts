import axios from 'axios';

// Development: sử dụng proxy từ vite.config.ts (/api)
// Production: sử dụng VITE_API_URL từ .env
const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  },
});

export default api;

