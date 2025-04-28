/*import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { movieService } from './api';
import MovieCard from './MovieCard';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #fff;
  font-size: 28px;
  margin-bottom: 20px;
  text-align: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;

const ErrorMessage = styled.div`
  color: #e94560;
  text-align: center;
  font-size: 16px;
  margin-top: 20px;
`;

const Loading = styled.div`
  color: #fff;
  text-align: center;
  font-size: 16px;
  margin-top: 20px;
`;

const NoFilms = styled.div`
  color: #a0a0a0;
  text-align: center;
  font-size: 16px;
  margin-top: 20px;
`;

const MovieList = () => {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const response = await movieService.getAll();
        console.log('Dữ liệu phim từ API:', response.data);
        const activeFilms = response.data.filter(film => !film.isDeleted);
        console.log('Danh sách phim sau khi lọc:', activeFilms);
        setFilms(activeFilms);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải danh sách phim. Vui lòng thử lại.');
        setLoading(false);
        console.error('Lỗi khi gọi API:', err);
      }
    };

    fetchFilms();
  }, []);

  if (loading) {
    return <Loading>Đang tải...</Loading>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <Container>
      <Title>Danh sách phim</Title>
      {films.length > 0 ? (
        <Grid>
          {films.map(film => (
            <MovieCard key={film.id} movie={film} />
          ))}
        </Grid>
      ) : (
        <NoFilms>Không có phim nào để hiển thị.</NoFilms>
      )}
    </Container>
  );
};

export default MovieList;
*/