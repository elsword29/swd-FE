import api from './api';

const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/api/Authentication/login-jwt', {
        Email: credentials.email,
        Password: credentials.password,
      });
      const { token, isSuccess, message } = response.data;

      if (!isSuccess || !token) {
        throw new Error(message || 'Đăng nhập thất bại');
      }

      localStorage.setItem('token', token);
      console.log('Token stored:', token);

      const userResponse = await api.get('/api/Authentication/profile');
      const user = userResponse.data;

      localStorage.setItem('userId', user.userId || user.id);
      const role = user.role === 2 ? 'staff' : 'customer';
      localStorage.setItem('userRole', role);

      return { token, user };
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        throw new Error('Email hoặc mật khẩu không đúng.');
      }
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    }
  },

  staffLogin: async (username, password) => {
    try {
      const response = await api.post('/api/Authentication/login-jwt', {
        Email: username,
        Password: password,
      });
      const { token, isSuccess, message } = response.data;

      if (!isSuccess || !token) {
        throw new Error(message || 'Đăng nhập thất bại');
      }

      localStorage.setItem('token', token);
      console.log('Token stored (staff):', token);

      const userResponse = await api.get('/api/Authentication/profile');
      const user = userResponse.data;

      if (user.role !== 2) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        throw new Error('Tài khoản này không có quyền truy cập khu vực quản trị');
      }

      localStorage.setItem('userId', user.userId || user.id);
      localStorage.setItem('userRole', 'staff');

      return { token, user };
    } catch (error) {
      console.error('Staff login error:', error);
      if (error.response?.status === 401) {
        throw new Error('Tên đăng nhập hoặc mật khẩu không đúng.');
      }
      throw new Error(error.response?.data?.message || 'Đăng nhập quản trị thất bại. Vui lòng thử lại.');
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/api/Authentication/register', {
        Fullname: userData.fullname,
        Email: userData.email,
        Password: userData.password,
      });
      const { token, isSuccess, message } = response.data;

      if (!isSuccess || !token) {
        throw new Error(message || 'Đăng ký thất bại');
      }

      localStorage.setItem('token', token);
      console.log('Token stored:', token);

      const userResponse = await api.get('/api/Authentication/profile');
      const user = userResponse.data;

      localStorage.setItem('userId', user.userId || user.id);
      localStorage.setItem('userRole', 'customer');

      return { token, user };
    } catch (error) {
      console.error('Register error:', error);
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
      }
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      }
      throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
    }
  },

  getCurrentUser: async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('Không có người dùng đăng nhập');
      }
      const response = await api.get('/Authentication/profile');
      console.log('Get current user response:', response.data);
      return response;
    } catch (error) {
      console.error('Get current user error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      }
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin người dùng');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    return Promise.resolve();
  },
};

export default authService;