import axios from 'axios';

const API_URL = 'https://galaxycinema-a6eeaze9afbagaft.southeastasia-01.azurewebsites.net/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const BASE_URL = 'https://galaxycinema-a6eeaze9afbagaft.southeastasia-01.azurewebsites.net';
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
      const response = await api.post('/Authentication/login-jwt', {
        Email: credentials.email,
        Password: credentials.password,
      });
      const { token, isSuccess, message } = response.data;

      console.log('API login response:', response.data);

      if (!isSuccess || !token) {
        throw new Error(message || 'Đăng nhập thất bại');
      }

      localStorage.setItem('token', token);
      console.log('Token stored:', token);

      try {
        const userResponse = await api.get('/Authentication/profile');
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
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Đăng nhập thất bại. Vui lòng thử lại.'
      );
    }
  },

  staffLogin: async (email, password) => {
    try {
      const response = await api.post('/Authentication/login-jwt', {
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
        const userResponse = await api.get('/Authentication/profile');
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
      const response = await api.post('/Authentication/register', {
        Fullname: userData.fullname,
        Email: userData.email,
        Password: userData.password,
        PhoneNumber: userData.phoneNumber,
      });
      const { isSuccess, message } = response.data;

      if (!isSuccess) {
        throw new Error(message || 'Đăng ký thất bại');
      }

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
        window.location.href = '/login';
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

// Các dịch vụ khác (movieService, filmGenreService, v.v.) giữ nguyên
export const movieService = {
  getAll: () => api.get('/Film'),
  getById: (id) => api.get(`/Film/${id}`),
  create: (filmData) => api.post('/Film', filmData),
  update: (id, filmData) => api.put(`/Film/${id}`, filmData),
  delete: (id) => api.delete(`/Film/${id}`),
  getNewFilms: (pageNumber, pageSize) => api.get(`/Film/getnewfilms/${pageNumber}/${pageSize}`),
  getInProgressFilms: (pageNumber, pageSize) => api.get(`/Film/getinprogressfilms/${pageNumber}/${pageSize}`),
  getEndFilms: (pageNumber, pageSize) => api.get(`/Film/getendfilms/${pageNumber}/${pageSize}`),
  getPaged: (params) => api.get('/Film/paged', { params }),
  getByTitle: (title) => api.get(`/Film/by-title/${title}`),
  getByDirector: (director) => api.get(`/Film/by-director/${director}`),
  getByReleaseDate: (params) => api.get('/Film/by-release-date', { params }),
  getNowPlaying: () => api.get('/Film?releaseDate_lte=2025-04-17'),
  getUpcoming: () => api.get('/Film?releaseDate_gt=2025-04-17'),
};

export const filmGenreService = {
  getAll: () => api.get('/FilmGenre'),
  getById: (id) => api.get(`/FilmGenre/${id}`),
  create: (filmGenreData) => api.post('/FilmGenre', filmGenreData),
  update: (id, filmGenreData) => api.put(`/FilmGenre/${id}`, filmGenreData),
  delete: (id) => api.delete(`/FilmGenre/${id}`),
  getPaged: (params) => api.get('/FilmGenre/paged', { params }),
  getByFilm: (filmId) => api.get(`/FilmGenre/by-film/${filmId}`),
  getByGenre: (genreId) => api.get(`/FilmGenre/by-genre/${genreId}`),
};

export const genreService = {
  getAll: () => api.get('/Genre'),
  getById: (id) => api.get(`/Genre/${id}`),
  create: (genreData) => api.post('/Genre', genreData),
  update: (id, genreData) => api.put(`/Genre/${id}`, genreData),
  delete: (id) => api.delete(`/Genre/${id}`),
  getPaged: (params) => api.get('/Genre/paged', { params }),
  find: (id) => api.get(`/Genre/find/${id}`),
};

export const projectionService = {
  getAll: () => api.get('/Projection'),
  getById: (id) => api.get(`/Projection/${id}`),
  create: (projectionData) => api.post('/Projection', projectionData),
  update: (id, projectionData) => api.put(`/Projection/${id}`, projectionData),
  delete: (id) => api.delete(`/Projection/${id}`),
  getPaged: (params) => api.get('/Projection/paged', { params }),
  getByFilm: (filmId) => api.get(`/Projection/by-film/${filmId}`),
  getByRoom: (roomId) => api.get(`/Projection/by-room/${roomId}`),
  
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

export const seatService = {
  getAll: () => api.get('/Seat'),
  getById: (id) => api.get(`/Seat/${id}`),
  create: (seatData) => api.post('/Seat', seatData),
  update: (id, seatData) => api.put(`/Seat/${id}`, seatData),
  delete: (id) => api.delete(`/Seat/${id}`),
  getPaged: (params) => api.get('/Seat/paged', { params }),
  find: (id) => api.get(`/Seat/find/${id}`),
  getByShowTimeId: (showTimeId) => api.get(`/seat?showTimeId=${showTimeId}`),
  updateSeat: (seatId, seatData) => api.patch(`/seat/${seatId}`, seatData),
  getRoomById: (roomId) => api.get(`/Room/${roomId}`),
  getByRoomId: (roomId) => api.get(`/Seat/getseatbyroomid/${roomId}`),
};

export const ticketService = {
  createTicket: (ticketData) => axios.post(`${BASE_URL}/Ticket/CreateTicket`, ticketData),
  getAllMyTickets: (pageNumber, pageSize) => axios.get(`${BASE_URL}/Ticket/GetTicket/getallmyticket/${pageNumber}/${pageSize}`),
  getTicketsByUserId: (userId, pageNumber, pageSize) => axios.get(`${BASE_URL}/Ticket/GetTicketByUserId/getallticketbyuserid/${userId}/${pageNumber}/${pageSize}`),
  getAllTickets: (pageNumber, pageSize) => axios.get(`${BASE_URL}/Ticket/GetTickets/getallticketlist/${pageNumber}/${pageSize}`),
  getTicketById: (ticketId) => axios.get(`${BASE_URL}/Ticket/GetTicketById/${ticketId}`),
  deleteTicket: (ticketId) => axios.delete(`${BASE_URL}/Ticket/DeleteTicketById`, { data: { id: ticketId } }),
};

export const zalopayService = {
  checkOrderStatus: (params) => api.get('/Zalopay/CheckOrderStatus', { params }),
};

export const testService = {
  checkConnection: () => api.get('/Test/connection'),
};

export const showTimeService = {
  getByMovieId: (movieId) =>
    api.get(`/projection/by-film/${movieId}`).then((response) => {
      console.log('Raw response from /projection/by-film:', response.data);
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
  getAll: () => projectionService.getAll(),
  getById: (id) => projectionService.getById(id),
  getByCinemaId: (roomId) => projectionService.getByRoom(roomId),
  getByMovieAndCinema: (filmId, roomId) => {
    console.log('This method is a custom implementation combining two API calls');
    return projectionService.getByFilm(filmId).then(filmProjections => {
      if (roomId) {
        return {
          data: filmProjections.data.filter(projection => projection.roomId === roomId)
        };
      }
      return filmProjections;
    });
  },
  getByDate: (date) => {
    console.log('This method is a custom implementation filtering by date');
    return projectionService.getAll().then(projections => {
      const targetDate = new Date(date);
      return {
        data: projections.data.filter(projection => {
          const projectionDate = new Date(projection.startTime);
          return projectionDate.toDateString() === targetDate.toDateString();
        })
      };
    });
  },
};

export const bookingService = {
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  getByUserId: (userId) => api.get(`/bookings?userId=${userId}`),
  create: (bookingData) => api.post('/bookings', bookingData),
  update: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
  delete: (id) => api.delete(`/bookings/${id}`),
};



export default api;