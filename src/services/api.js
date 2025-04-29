import axios from 'axios';

const API_URL = 'https://galaxycinema-a6eeaze9afbagaft.southeastasia-01.azurewebsites.net';
const BASE_URL = 'https://galaxycinema-a6eeaze9afbagaft.southeastasia-01.azurewebsites.net';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
const axiosInstance = axios.create({
  baseURL: BASE_URL
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
      const response = await api.get('/api/Authentication/profile');
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
};

export const bookingService = {
  getAll: () => api.get('/api/bookings'),
  getById: (id) => api.get(`/api/bookings/${id}`),
  getByUserId: (userId) => api.get(`/api/bookings?userId=${userId}`),
  create: (bookingData) => api.post('/api/bookings', bookingData),
  update: (id, bookingData) => api.put(`/api/bookings/${id}`, bookingData),
  delete: (id) => api.delete(`/api/bookings/${id}`),
};



export const filmGenreService = {
  getAll: () => api.get('/FilmGenre'),
  getById: (id) => api.get(`/api/FilmGenre/${id}`),
  create: (filmGenreData) => api.post('/api/FilmGenre', filmGenreData),
  update: (id, filmGenreData) => api.put(`/api/FilmGenre/${id}`, filmGenreData),
  delete: (id) => api.delete(`/api/FilmGenre/${id}`),
  getPaged: (params) => api.get('/api/FilmGenre/paged', { params }),
  getByFilm: (filmId) => api.get(`/api/FilmGenre/by-film/${filmId}`),
  getByGenre: (genreId) => api.get(`/api/FilmGenre/by-genre/${genreId}`),
};

export const genreService = {
  getAll: () => api.get('/api/Genre'),
  getById: (id) => api.get(`/api/Genre/${id}`),
  create: (genreData) => api.post('/api/Genre', genreData),
  update: (id, genreData) => api.put(`/api/Genre/${id}`, genreData),
  delete: (id) => api.delete(`/api/Genre/${id}`),
  getPaged: (params) => api.get('/api/Genre/paged', { params }),
  find: (id) => api.get(`/api/Genre/find/${id}`),
};

export const projectionService = {
  getAll: () => api.get('/api/Projection'),
  getById: (id) => api.get(`/api/Projection/${id}`),
  create: (projectionData) => api.post('/api/Projection', projectionData),
  update: (id, projectionData) => api.put(`/api/Projection/${id}`, projectionData),
  delete: (id) => api.delete(`/api/Projection/${id}`),
  getPaged: (params) => api.get('/api/Projection/paged', { params }),
  getByFilm: (filmId) => api.get(`/api/Projection/by-film/${filmId}`),
  getByRoom: (roomId) => api.get(`/api/Projection/by-room/${roomId}`),
};

export const roomService = {
  getAll: () => api.get('/Room'),
  getById: (id) => api.get(`/Room/${id}`),
  create: (roomData) => api.post('/Room', roomData),
  update: (id, roomData) => api.put(`/Room/${id}`, roomData),
  delete: (id) => api.delete(`/Room/${id}`),
  getByNumber: (roomNumber) => api.get(`/Room/by-number/${roomNumber}`),
  getByType: (roomType) => api.get(`/Room/by-type/${roomType}`),
  getBySpecificId: (id) => api.get(`/Room/by-id/${id}`),
};


export const ticketService = {
  createTicket: (ticketData) => axios.post(`${BASE_URL}/Ticket/CreateTicket`, ticketData),
  getAllMyTickets: (pageNumber, pageSize) => axios.get(`${BASE_URL}/Ticket/GetTicket/getallmyticket/${pageNumber}/${pageSize}`),
  getTicketsByUserId: (userId, pageNumber, pageSize) => axios.get(`${BASE_URL}/Ticket/GetTicketByUserId/getallticketbyuserid/${userId}/${pageNumber}/${pageSize}`),
  getAllTickets: (pageNumber, pageSize) => axios.get(`${BASE_URL}/Ticket/GetTickets/getallticketlist/${pageNumber}/${pageSize}`),
  getTicketById: (ticketId) => axios.get(`${BASE_URL}/Ticket/GetTicketById/${ticketId}`),
  deleteTicket: (ticketId) => axiosInstance.delete(`/Ticket/DeleteTicketById`, { data: { id: ticketId } }),
  deleteBooking: async (appTransId, ticketIds) => {
    // If we have individual ticket IDs, delete each one
    if (Array.isArray(ticketIds) && ticketIds.length > 0) {
      // Delete tickets one by one
      const deletePromises = ticketIds.map(ticketId => 
        axiosInstance.delete(`/Ticket/DeleteTicketById`, { 
          data: { id: ticketId } 
        })
      );
      
      return Promise.all(deletePromises);
    } else {
      // If no specific ticket IDs provided, try using the booking transaction ID
      // This is a fallback and might not work depending on API design
      return axiosInstance.delete(`/Ticket/DeleteBooking`, { 
        data: { appTransId: appTransId } 
      });
    }
  }
};

export const zalopayService = {
  checkOrderStatus: (params) => api.get('/Zalopay/CheckOrderStatus', { params }),
};

export const testService = {
  checkConnection: () => api.get('/Test/connection'),
};


export default api;