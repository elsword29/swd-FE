import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { movieService, showTimeService } from '../services/api';
import { useBooking } from '../context/BookingContext';

const PageContainer = styled.div`
  background-color: #0f0f1e;
  color: #fff;
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
`;

const MovieInfo = styled.div`
  display: flex;
  margin-bottom: 2rem;
  background: #16213e;
  border-radius: 8px;
  overflow: hidden;
`;

const MoviePoster = styled.img`
  width: 120px;
  height: 180px;
  object-fit: cover;
`;

const MovieDetails = styled.div`
  padding: 1rem;
  flex: 1;
`;

const MovieTitle = styled.h2`
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
`;

const MovieMeta = styled.div`
  color: #a0a0a0;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const ButtonContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
`;

const StyledButton = styled.button`
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;

  ${props =>
    props.$buttonVariant === 'primary' &&
    `
    background: #e94560;
    color: white;
    border: none;
    
    &:hover {
      background: #ff6b81;
    }
  `}

  ${props =>
    props.$buttonVariant === 'secondary' &&
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
    props.$disabled &&
    `
    opacity: 0.5;
    cursor: not-allowed;
  `}
`;

const ShowTimeList = ({ showTimes, selectedShowTime, onSelectShowTime }) => (
  <div>
    <h3>Chọn suất chiếu</h3>
    {showTimes.length > 0 ? (
      showTimes.map(showTime => (
        <div
          key={showTime.id}
          onClick={() => onSelectShowTime(showTime)}
          style={{
            padding: '10px',
            background: selectedShowTime?.id === showTime.id ? '#e94560' : '#16213e',
            marginBottom: '8px',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        >
          {new Date(showTime.startTime).toLocaleString()} - Phòng:{' '}
          {showTime.roomNumber || showTime.room?.roomNumber || 'Không có thông tin phòng'}
        </div>
      ))
    ) : (
      <p>Không có suất chiếu</p>
    )}
  </div>
);

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setSelectedMovie, setSelectedShowTime } = useBooking(); 
  const [movie, setMovie] = useState(null);
  const [showTimes, setShowTimes] = useState([]);
  const [selectedShowTime, setLocalSelectedShowTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const movieResponse = await movieService.getById(id);
        if (!movieResponse.data) {
          throw new Error('Không tìm thấy thông tin phim.');
        }
        console.log('Movie response:', movieResponse.data);
        setMovie(movieResponse.data);
        setSelectedMovie(movieResponse.data); 

        const showTimesResponse = await showTimeService.getByMovieId(id);
        if (!showTimesResponse.data) {
          throw new Error('Không tìm thấy lịch chiếu.');
        }
        console.log('ShowTimes response:', showTimesResponse.data);
        setShowTimes(showTimesResponse.data);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu đặt vé:', err);
        setError('Không thể tải thông tin đặt vé. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, setSelectedMovie]);

  const handleShowTimeSelect = showTime => {
    setLocalSelectedShowTime(showTime);
    setSelectedShowTime(showTime); 
    console.log('Selected ShowTime:', showTime);
  };

  const handleBack = () => {
    navigate(`/movies/${id}`);
  };

  const handleContinue = () => {
    if (!selectedShowTime) {
      alert('Vui lòng chọn suất chiếu để tiếp tục.');
      return;
    }
    navigate('/booking/seats', {
      state: {
        movie: movie,
        showTime: selectedShowTime,
      },
    });
  };

  if (loading)
    return (
      <PageContainer>
        <Header />
        <ContentContainer>Đang tải thông tin đặt vé...</ContentContainer>
        <Footer />
      </PageContainer>
    );

  if (error)
    return (
      <PageContainer>
        <Header />
        <ContentContainer>
          <div>{error}</div>
          <StyledButton $buttonVariant="primary" onClick={() => navigate('/movies')}>
            Quay lại danh sách phim
          </StyledButton>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );

  if (!movie)
    return (
      <PageContainer>
        <Header />
        <ContentContainer>
          <div>Không tìm thấy thông tin phim</div>
          <StyledButton $buttonVariant="primary" onClick={() => navigate('/movies')}>
            Quay lại danh sách phim
          </StyledButton>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );

  return (
    <PageContainer>
      <Header />
      <ContentContainer>
        <PageTitle>Đặt vé xem phim</PageTitle>

        <MovieInfo>
          <MoviePoster
            src={movie.imageURL || 'https://via.placeholder.com/120x180?text=No+Image'}
            alt={movie.title}
          />
          <MovieDetails>
            <MovieTitle>{movie.title}</MovieTitle>
            <MovieMeta>
              {movie.duration
                ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m`
                : 'Không có thông tin thời lượng'}
              {' • '}
              {movie.filmGenres || 'Không có thể loại'}
            </MovieMeta>
          </MovieDetails>
        </MovieInfo>

        <ShowTimeList
          showTimes={showTimes}
          selectedShowTime={selectedShowTime}
          onSelectShowTime={handleShowTimeSelect}
        />

        <ButtonContainer>
          <StyledButton $buttonVariant="secondary" onClick={handleBack}>
            Quay lại
          </StyledButton>
          <StyledButton
            $buttonVariant="primary"
            onClick={handleContinue}
            $disabled={!selectedShowTime}
          >
            Tiếp tục
          </StyledButton>
        </ButtonContainer>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
};

export default BookingPage;