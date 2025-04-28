import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { movieService } from '../services/api';
import MovieCard from '../components/movie/MovieCard';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { FaArrowRight } from 'react-icons/fa';

const HomeContainer = styled.div`
  background-color: #0f0f1e;
  color: #fff;
  min-height: 100vh;
`;

const HeroSection = styled.div`
  background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
    url('https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg');
  background-size: cover;
  background-position: center;
  height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 20px;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  max-width: 600px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
`;

const BookTicketsButton = styled(Link)`
  background-color: #e94560;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  text-decoration: none;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #ff6b81;
  }
`;

const Section = styled.section`
  padding: 3rem 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  color: #e94560;
`;

const ViewAllLink = styled(Link)`
  display: flex;
  align-items: center;
  color: #a0a0a0;
  text-decoration: none;
  transition: color 0.3s;
  
  &:hover {
    color: #e94560;
  }
`;

const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 2rem;
`;

const HomePage = () => {
  const [nowPlaying, setNowPlaying] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        
        const allMoviesResponse = await movieService.getAll();
        const allMovies = allMoviesResponse.data;
        
        console.log("Tất cả phim:", allMovies);
      
        const currentDate = new Date().toISOString().split('T')[0]; 
        
        const nowPlayingMovies = allMovies.filter(movie => 
          movie.releaseDate <= currentDate
        );
        
        const upcomingMovies = allMovies.filter(movie => 
          movie.releaseDate > currentDate
        );
        
        console.log("Phim đang chiếu:", nowPlayingMovies);
        console.log("Phim sắp chiếu:", upcomingMovies);
        
        setNowPlaying(nowPlayingMovies.slice(0, 4)); 
        setUpcoming(upcomingMovies.slice(0, 4));
        
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Không thể tải danh sách phim. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <HomeContainer>
      <Header />
      
      <HeroSection>
        <HeroTitle>Trải nghiệm điện ảnh tuyệt vời</HeroTitle>
        <HeroSubtitle>
          Đặt vé xem phim ngay hôm nay và tận hưởng những bộ phim hot nhất trên màn ảnh rộng
        </HeroSubtitle>
        <BookTicketsButton to="/movies">Đặt vé ngay</BookTicketsButton>
      </HeroSection>
      
      <Section>
        <SectionHeader>
          <SectionTitle>Phim đang chiếu</SectionTitle>
          <ViewAllLink to="/movies">
            Xem tất cả <FaArrowRight style={{ marginLeft: '8px' }} />
          </ViewAllLink>
        </SectionHeader>
        
        {loading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p>{error}</p>
        ) : nowPlaying.length > 0 ? (
          <MovieGrid>
            {nowPlaying.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </MovieGrid>
        ) : (
          <p>Không có phim đang chiếu.</p>
        )}
      </Section>
      
      <Section>
        <SectionHeader>
          <SectionTitle>Phim sắp chiếu</SectionTitle>
          <ViewAllLink to="/movies">
            Xem tất cả <FaArrowRight style={{ marginLeft: '8px' }} />
          </ViewAllLink>
        </SectionHeader>
        
        {loading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p>{error}</p>
        ) : upcoming.length > 0 ? (
          <MovieGrid>
            {upcoming.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </MovieGrid>
        ) : (
          <p>Không có phim sắp chiếu.</p>
        )}
      </Section>
      
      <Footer />
    </HomeContainer>
  );
};

export default HomePage;