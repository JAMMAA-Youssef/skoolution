import api from './api';

export const userService = {
  register: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 409) {
        if (error.response.data?.message?.includes('email')) {
          throw new Error('Cette adresse email est déjà utilisée. Veuillez utiliser une autre adresse email.');
        } else if (error.response.data?.message?.includes('username')) {
          throw new Error('Ce nom d\'utilisateur est déjà pris. Veuillez en choisir un autre.');
        }
      }
      throw new Error(error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur de connexion. Veuillez vérifier vos identifiants.');
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des données utilisateur.');
    }
  }
}; 