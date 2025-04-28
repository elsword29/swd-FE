import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { movieService } from '../services/api';
import MovieCard from '../components/movie/MovieCard';
import Header from '../components/common/Header';
import { FaSearch } from 'react-icons/fa';

const PageContainer = styled.div`
  background-color: #0f0f1e;
  color: #fff;
  min-height: 100vh;
`;

const Content = styled.div`
  padding: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
`;

const FiltersContainer = styled.div`
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const CategoryTabs = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
`;

const Tab = styled.button`
  padding: 0.5rem 1.5rem;
  background: ${props => props.active ? '#e94560' : 'transparent'};
  color: ${props => props.active ? 'white' : '#a0a0a0'};
  border: 1px solid ${props => props.active ? '#e94560' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  margin-right: 1rem;
  transition: all 0.3s;
  
  &:hover {
    background: ${props => props.active ? '#ff6b81' : 'rgba(233, 69, 96, 0.1)'};
    color: ${props => props.active ? 'white' : '#e94560'};
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border-radius: 4px;
  border: 1px solid #333;
  background-color: #1a1a2e;
  color: white;
  
  &:focus {
    outline: none;
    border-color: #e94560;
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0a0a0;
`;

const GenreFilter = styled.select`
  padding: 0.8rem;
  border-radius: 4px;
  border: 1px solid #333;
  background-color: #1a1a2e;
  color: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #e94560;
  }
`;

const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #a0a0a0;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
`;

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await movieService.getAll();
        const moviesData = response.data;
        
        setMovies(moviesData);
        setFilteredMovies(moviesData);
      
        const allGenres = moviesData.flatMap(movie => movie.genre);
        const uniqueGenres = [...new Set(allGenres)];
        setGenres(uniqueGenres);
        
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Không thể tải danh sách phim. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {

    const filterMovies = () => {
      let result = [...movies];
      
      if (activeTab === 'now-playing') {
        result = result.filter(movie => new Date(movie.releaseDate) <= new Date());
      } else if (activeTab === 'upcoming') {
        result = result.filter(movie => new Date(movie.releaseDate) > new Date());
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(movie => 
          movie.title.toLowerCase().includes(query) || 
          movie.description.toLowerCase().includes(query)
        );
      }
      
      if (selectedGenre) {
        result = result.filter(movie => 
          movie.genre.includes(selectedGenre)
        );
      }
      
      setFilteredMovies(result);
    };
    
    filterMovies();
  }, [movies, activeTab, searchQuery, selectedGenre]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
  };

  return (
    <PageContainer>
      <Header />
      
      <Content>
        <PageTitle>Danh sách phim</PageTitle>
        
        <FiltersContainer>
          <CategoryTabs>
            <Tab 
              active={activeTab === 'all'} 
              onClick={() => handleTabChange('all')}
            >
              Tất cả phim
            </Tab>
            <Tab 
              active={activeTab === 'now-playing'} 
              onClick={() => handleTabChange('now-playing')}
            >
              Đang chiếu
            </Tab>
            <Tab 
              active={activeTab === 'upcoming'} 
              onClick={() => handleTabChange('upcoming')}
            >
              Sắp chiếu
            </Tab>
          </CategoryTabs>
          
          <SearchContainer>
            <SearchIcon><FaSearch /></SearchIcon>
            <SearchInput 
              type="text" 
              placeholder="Tìm kiếm phim..." 
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </SearchContainer>
          
        </FiltersContainer>
        
        {loading ? (
          <LoadingMessage>Đang tải...</LoadingMessage>
        ) : error ? (
          <EmptyState>{error}</EmptyState>
        ) : filteredMovies.length > 0 ? (
          <MovieGrid>
            {filteredMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </MovieGrid>
        ) : (
          <EmptyState>
            <h3>Không tìm thấy phim phù hợp</h3>
            <p>Vui lòng thử lại với bộ lọc khác</p>
          </EmptyState>
        )}
      </Content>
    </PageContainer>
  );
};

export default MoviesPage;