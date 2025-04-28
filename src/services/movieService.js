
import api from './api';

const movieService = {
  getAll: () => api.get('/api/Film'),
  getById: (id) => api.get(`/api/Film/${id}`),
  getNowPlaying: () => api.get('/api/Film?releaseDate_lte=2025-04-17'),
  getUpcoming: () => api.get('/api/Film?releaseDate_gt=2025-04-17'),
  searchMovies: (query) => api.get(`/api/Film?q=${query}`),
  getByGenre: (genre) => api.get(`/api/Film?genre_like=${genre}`),
};

export default movieService;