import api from './api';

const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return {
        success: true,
        user: response.data.user,
        token: response.data.token
      };
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/verify-token');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;