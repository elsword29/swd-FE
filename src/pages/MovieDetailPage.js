import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { format } from 'date-fns';
import { FaStar, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { movieService, showTimeService } from '../services/api';
import Header from '../components/common/Header';

const PageContainer = styled.div`
  background-color: #0f0f1e;
  color: #fff;
  min-height: 100vh;
`;

const BackdropContainer = styled.div`
  position: relative;
  height: 60vh;
  background-image: linear-gradient(to bottom, rgba(15, 15, 30, 0.5), #0f0f1e), 
    url(${props => props.backdrop});
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center; 
  justify-content: center; 
`;

const ContentContainer = styled.div`
  padding: 0 2rem;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center; 
`;

const PosterContainer = styled.div`
  width: 270px;
  margin-right: 2rem;
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center; 
  align-items: center; 
`;

const Poster = styled.img`
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
`;

const MovieInfo = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  color: #a0a0a0;
`;

const InfoIcon = styled.span`
  margin-right: 10px;
  color: #e94560;
  display: flex;
  align-items: center;
`;

const GenresContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  gap: 8px;
`;

const GenreBadge = styled.span`
  background: #e94560;
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
`;

const Description = styled.div`
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const ShowTimesContainer = styled.div`
  margin-bottom: 2rem;
`;

const ShowTimesTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #e94560;
`;

const ShowTimesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const ShowTimeButton = styled.button`
  padding: 8px 16px;
  background: #1a1a2e;
  color: #fff;
  border: 2px solid #e94560;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #e94560;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.3s;

  ${props =>
    props.variant === 'primary' &&
    `
    background: #e94560;
    color: white;
    border: none;
    
    &:hover {
      background: #ff6b81;
    }
  `}

  ${props =>
    props.variant === 'outline' &&
    `
    background: transparent;
    color: #e94560;
    border: 2px solid #e94560;
    
    &:hover {
      background: #e94560;
      color: white;
    }
  `}

  ${props =>
    props.size === 'large' &&
    `
    padding: 12px 24px;
    font-size: 16px;
  `}
`;

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showTimes, setShowTimes] = useState([]);
  const [selectedShowTime, setSelectedShowTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieDetailsAndShowTimes = async () => {
      try {
        setLoading(true);

       
        const movieResponse = await movieService.getById(id);
        setMovie(movieResponse.data);

        const showTimesResponse = await showTimeService.getByMovieId(id);
        setShowTimes(showTimesResponse.data);
      } catch (err) {
        console.error('Error:', err);
        setError('Không thể tải thông tin phim hoặc suất chiếu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetailsAndShowTimes();
  }, [id]);

  const handleSelectShowTime = (showTime) => {
    setSelectedShowTime(showTime);
  };

  const handleBookTicket = () => {
    if (!selectedShowTime) {
      alert('Vui lòng chọn một suất chiếu trước khi đặt vé.');
      return;
    }
    console.log('Navigating with movie and showTime:', { movie, showTime: selectedShowTime });
    navigate('/seat-selection', {
      state: { movie, showTime: selectedShowTime },
    });
  };

  if (loading) return <PageContainer><Header /><div style={{ padding: '2rem' }}>Đang tải...</div></PageContainer>;
  if (error) return <PageContainer><Header /><div style={{ padding: '2rem' }}>{error}</div></PageContainer>;
  if (!movie) return <PageContainer><Header /><div style={{ padding: '2rem' }}>Không tìm thấy phim</div></PageContainer>;

  const displayPoster = movie.imageURL || 'https://via.placeholder.com/300x450?text=No+Image';
  const displayGenres = movie.filmGenres ? movie.filmGenres.split(',').map(genre => genre.trim()) : [];
  const displayDuration = movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : 'Không có thông tin';
  const displayReleaseDate = movie.releaseDate ? format(new Date(movie.releaseDate), 'dd/MM/yyyy') : 'Không có thông tin';

  return (
    <PageContainer>
      <Header />
      
      <BackdropContainer backdrop={displayPoster}>
        <ContentContainer>
          <PosterContainer>
            <Poster src={displayPoster} alt={movie.title} />
          </PosterContainer>
          
          <MovieInfo>
            <Title>{movie.title}</Title>
            
            <InfoGrid>
              <InfoItem>
                <InfoIcon><FaClock /></InfoIcon>
                <div>{displayDuration}</div>
              </InfoItem>
              
              <InfoItem>
                <InfoIcon><FaCalendarAlt /></InfoIcon>
                <div>{displayReleaseDate}</div>
              </InfoItem>
            </InfoGrid>
            
            <GenresContainer>
              {displayGenres.length > 0 ? (
                displayGenres.map((genre, index) => (
                  <GenreBadge key={index}>{genre}</GenreBadge>
                ))
              ) : (
                <GenreBadge>Không có thể loại</GenreBadge>
              )}
            </GenresContainer>
            
            <Description>{movie.description}</Description>

            <ShowTimesContainer>
              <ShowTimesTitle>Chọn suất chiếu</ShowTimesTitle>
              <ShowTimesList>
                {showTimes.length > 0 ? (
                  showTimes.map((showTime) => (
                    <ShowTimeButton
                      key={showTime.id}
                      onClick={() => handleSelectShowTime(showTime)}
                      style={{
                        background: showTime.id === selectedShowTime?.id ? '#e94560' : '#1a1a2e',
                      }}
                    >
                      {format(new Date(showTime.startTime), 'dd/MM/yyyy HH:mm')} - Phòng {showTime.room?.roomNumber || 'N/A'}
                    </ShowTimeButton>
                  ))
                ) : (
                  <div style={{ color: '#a0a0a0' }}>Không có suất chiếu nào cho phim này.</div>
                )}
              </ShowTimesList>
            </ShowTimesContainer>

            <ButtonContainer>
              <Button
                as="button"
                variant="primary"
                size="large"
                onClick={handleBookTicket}
              >
                Đặt vé xem phim
              </Button>
              {movie.trailerURL && (
                <Button
                  variant="outline"
                  size="large"
                  href={movie.trailerURL}
                  target="_blank"
                >
                  Xem trailer
                </Button>
              )}
            </ButtonContainer>
          </MovieInfo>
        </ContentContainer>
      </BackdropContainer>
    </PageContainer>
  );
};

export default MovieDetailPage;