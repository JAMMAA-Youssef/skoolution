import api from './api';
import Cookies from 'js-cookie';

const isBrowser = typeof window !== 'undefined';

class AuthService {
  async login(email, password) {
    try {
      console.log('Login attempt with email:', email);
      const response = await api.post('/users/login', { email, password });
      console.log('Complete login response:', response.data);
      
      if (response.data && isBrowser) {
        // Store token in cookie
        Cookies.set('token', response.data.token, { expires: 1 });
        console.log('Token stored in cookie');
        
        // The user data is directly in the response
        const userData = {
          _id: response.data._id,
          username: response.data.username || '',
          email: response.data.email || '',
          level: response.data.level || "2ème année Bac SMA",
          profilePicture: response.data.profilePicture || "/sk/testimony_4.webp",
          role: response.data.role || 'student',
          phone: response.data.phone || '',
          school: response.data.school || '',
          subjects: response.data.subjects || [],
          progress: response.data.progress || []
        };
        
        console.log('Storing user data:', userData);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Verify the data was stored correctly
        const storedData = localStorage.getItem('userData');
        console.log('Verified stored data:', JSON.parse(storedData));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      console.log('Registration attempt with data:', userData);
      const response = await api.post('/users', userData);
      console.log('Complete registration response:', response.data);
      
      if (response.data && isBrowser) {
        // Store token in cookie
        Cookies.set('token', response.data.token, { expires: 1 });
        console.log('Token stored in cookie');
        
        // The user data is directly in the response
        const userData = {
          _id: response.data._id,
          username: response.data.username || '',
          email: response.data.email || '',
          level: response.data.level || "2ème année Bac SMA",
          profilePicture: response.data.profilePicture || "/sk/testimony_4.webp",
          role: response.data.role || 'student',
          phone: response.data.phone || '',
          school: response.data.school || '',
          subjects: response.data.subjects || [],
          progress: response.data.progress || []
        };
        
        console.log('Storing user data:', userData);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Verify the data was stored correctly
        const storedData = localStorage.getItem('userData');
        console.log('Verified stored data:', JSON.parse(storedData));
      }
      return response.data;
    } catch (error) {
      console.error('Registration error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  logout() {
    if (isBrowser) {
      console.log('Logging out - clearing auth data');
      Cookies.remove('token');
      localStorage.removeItem('userData');
    }
  }

  getCurrentUser() {
    if (!isBrowser) {
      console.log('getCurrentUser called in non-browser environment');
      return null;
    }
    try {
      const userData = localStorage.getItem('userData');
      console.log('Raw user data from localStorage:', userData);
      
      if (!userData) {
        console.log('No user data found in localStorage');
        return null;
      }
      
      const parsedData = JSON.parse(userData);
      console.log('Parsed user data:', parsedData);
      
      // Ensure we return all required fields
      return {
        _id: parsedData._id,
        username: parsedData.username || '',
        email: parsedData.email || '',
        level: parsedData.level || "2ème année Bac SMA",
        profilePicture: parsedData.profilePicture || "/sk/testimony_4.webp",
        role: parsedData.role || 'student',
        phone: parsedData.phone || '',
        school: parsedData.school || '',
        subjects: parsedData.subjects || [],
        progress: parsedData.progress || []
      };
    } catch (error) {
      console.error('Error parsing user data:', error);
      // Clear invalid data
      this.logout();
      return null;
    }
  }

  isAuthenticated() {
    if (!isBrowser) return false;
    const hasToken = !!Cookies.get('token');
    console.log('isAuthenticated check:', { hasToken });
    return hasToken;
  }
}

export default new AuthService(); 