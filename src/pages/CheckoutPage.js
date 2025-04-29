// CheckoutPage.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { format } from 'date-fns';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
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

const SectionTitle = styled.h3`
  margin-bottom: 1.5rem;
  color: #e94560;
`;

const BookingInfo = styled.div`
  background: #16213e;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BackButton = styled(Button)`
  background: transparent;
  color: #e94560;
  border: 2px solid #e94560;

  &:hover:not(:disabled) {
    background: #e94560;
    color: white;
  }
`;

const ConfirmButton = styled(Button)`
  background: #e94560;
  color: white;
  border: none;

  &:hover:not(:disabled) {
    background: #ff6b81;
  }
`;

const ErrorMessage = styled.div`
  color: #e94560;
  margin-bottom: 1rem;
`;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { selectedMovie, selectedShowTime, selectedSeats, calculateTotalPrice } = useBooking();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { movie = selectedMovie, showTime = selectedShowTime, seats = selectedSeats, ticketData } = location.state || {};
  const backendUrl = process.env.REACT_APP_API_URL || 'https://galaxycinema-a6eeaze9afbagaft.southeastasia-01.azurewebsites.net';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  console.log(ticketData);

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    if (!currentUser) {
      setError('Vui lòng đăng nhập để tiếp tục.');
      setLoading(false);
      navigate('/login');
      return;
    }

    if (!movie || !showTime || !seats || seats.length === 0) {
      setError('Thông tin đặt vé không đầy đủ. Vui lòng chọn lại.');
      setLoading(false);
      return;
    }

    try {
      const ticketRequest = ticketData;
      console.log(ticketRequest);
      const ticketResponse = await axios.post(
        `${backendUrl}/Ticket/CreateTicket`,
        ticketRequest,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(ticketResponse.data.appTransId)
      if (ticketResponse.data?.redirectUrl) {
        window.location.href = ticketResponse.data.redirectUrl;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xử lý đặt vé. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/booking/seats`, { state: { movie, showTime } });
  };

  if (!movie || !showTime || !seats) {
    return (
      <PageContainer>
        <Header />
        <ContentContainer>
          <ErrorMessage>Thông tin đặt vé không hợp lệ. Vui lòng thử lại.</ErrorMessage>
          <Button onClick={() => navigate('/movies')}>Quay lại danh sách phim</Button>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header />
      <ContentContainer>
        <SectionTitle>Thông tin đặt vé</SectionTitle>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <BookingInfo>
          <InfoRow>
            <span>Phim:</span>
            <span>{movie.title}</span>
          </InfoRow>
          <InfoRow>
            <span>Suất chiếu:</span>
            <span>{format(new Date(showTime.startTime), 'dd/MM/yyyy HH:mm')}</span>
          </InfoRow>
          <InfoRow>
            <span>Phòng:</span>
            <span>{showTime.room?.roomNumber || 'N/A'}</span>
          </InfoRow>
          <InfoRow>
            <span>Ghế:</span>
            <span>{seats.map(seat => `${seat.row}${seat.number}`).join(', ')}</span>
          </InfoRow>
          <InfoRow>
            <span>Tổng tiền:</span>
            <span>{formatPrice(calculateTotalPrice())}</span>
          </InfoRow>
        </BookingInfo>

        <ButtonContainer>
          <BackButton onClick={handleBack}>Quay lại</BackButton>
          <ConfirmButton onClick={handleComplete} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Hoàn Tất Đặt Vé'}
          </ConfirmButton>
        </ButtonContainer>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
};

export default CheckoutPage;