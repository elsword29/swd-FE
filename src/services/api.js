import axios from 'axios';

const API_URL = 'https://galaxycinema-a6eeaze9afbagaft.southeastasia-01.azurewebsites.net';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/api/Authentication/login-jwt', {
        Email: credentials.email,
        Password: credentials.password,
      });
      const { token, isSuccess, message } = response.data;

      // Thêm log để kiểm tra phản hồi từ API
      console.log('API login response:', response.data);

      if (!isSuccess || !token) {
        throw new Error(message || 'Đăng nhập thất bại');
      }

      localStorage.setItem('token', token);
      console.log('Token stored:', token);

      try {
        const userResponse = await api.get('/api/Authentication/profile');
        const user = userResponse.data;

        localStorage.setItem('userId', user.id);
        const role = user.role === 2 ? 'staff' : 'customer';
        localStorage.setItem('userRole', role);
        return { token, user };
      } catch (profileError) {
        console.error('Failed to fetch user profile:', profileError);
        return { token, user: null, error: 'Không thể lấy thông tin người dùng.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        throw new Error('Email hoặc mật khẩu không đúng.');
      }
      // Cải thiện thông báo lỗi để hiển thị chi tiết hơn
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Đăng nhập thất bại. Vui lòng thử lại.'
      );
    }
  },

  staffLogin: async (email, password) => {
    try {
      const response = await api.post('/api/Authentication/login-jwt', {
        Email: email,
        Password: password,
      });
      const { token, isSuccess, message } = response.data;

      if (!isSuccess || !token) {
        throw new Error(message || 'Đăng nhập thất bại');
      }

      localStorage.setItem('token', token);
      console.log('Token stored (staff):', token);

      try {
        const userResponse = await api.get('/api/Authentication/profile');
        const user = userResponse.data;

        if (user.role !== 2) {
          localStorage.removeItem('token');
          throw new Error('Tài khoản này không có quyền truy cập khu vực quản trị');
        }

        localStorage.setItem('userId', user.id);
        localStorage.setItem('userRole', 'staff');
        return { token, user };
      } catch (profileError) {
        console.error('Failed to fetch user profile:', profileError);
        return { token, user: null, error: 'Không thể lấy thông tin người dùng.' };
      }
    } catch (error) {
      console.error('Staff login error:', error);
      if (error.response?.status === 401) {
        throw new Error('Email hoặc mật khẩu không đúng.');
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
        PhoneNumber: userData.phoneNumber,
      });
      const { isSuccess, message, token } = response.data;

      if (!isSuccess) {
        throw new Error(message || 'Đăng ký thất bại');
      }

      // Không lưu token hoặc gọi profile để tránh đăng nhập tự động
      return { message: 'Đăng ký thành công' };
    } catch (error) {
      console.error('Register error:', error);
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
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

export const movieService = {
  getAll: () => api.get('/api/Film'),
  getById: (id) => api.get(`/api/Film/${id}`),
  getNowPlaying: () => api.get('/api/Film?releaseDate_lte=2025-04-17'),
  getUpcoming: () => api.get('/api/Film?releaseDate_gt=2025-04-17'),
};

export const showTimeService = {
  getByMovieId: (movieId) =>
    api.get(`/api/projection/by-film/${movieId}`).then((response) => {
      console.log('Raw response from /api/projection/by-film:', response.data);
      return {
        data: response.data.map((projection) => ({
          id: projection.id,
          startTime: projection.startTime,
          price: projection.price,
          room: projection.room
            ? {
                id: projection.room.id,
                roomNumber: projection.room.roomNumber || 'Không có thông tin phòng',
              }
            : null,
        })),
      };
    }),
  getAll: () => Promise.reject('Endpoint chưa được triển khai'),
  getById: () => Promise.reject('Endpoint chưa được triển khai'),
  getByCinemaId: () => Promise.reject('Endpoint chưa được triển khai'),
  getByMovieAndCinema: () => Promise.reject('Endpoint chưa được triển khai'),
  getByDate: () => Promise.reject('Endpoint chưa được triển khai'),
};

export const seatService = {
  getByShowTimeId: (showTimeId) => api.get(`/api/seat?showTimeId=${showTimeId}`),
  updateSeat: (seatId, seatData) => api.patch(`/api/seat/${seatId}`, seatData),
  getRoomById: (roomId) => api.get(`/api/Room/${roomId}`),
  getByRoomId: (roomId) => api.get(`/api/Seat/getseatbyroomid/${roomId}`),
};

export const bookingService = {
  getAll: () => api.get('/api/bookings'),
  getById: (id) => api.get(`/api/bookings/${id}`),
  getByUserId: (userId) => api.get(`/api/bookings?userId=${userId}`),
  create: (bookingData) => api.post('/api/bookings', bookingData),
  update: (id, bookingData) => api.put(`/api/bookings/${id}`, bookingData),
  delete: (id) => api.delete(`/api/bookings/${id}`),
};

export default api;