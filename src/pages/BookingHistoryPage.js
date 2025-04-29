import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Pagination } from 'antd';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { ticketService, authService } from '../services/api';

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

const BookingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const BookingCard = styled.div`
  background: #16213e;
  border-radius: 8px;
  padding: 1.5rem;
`;

const BookingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const BookingTitle = styled.h3`
  font-size: 1.2rem;
  cursor: pointer;
  color: #e94560;
  
  &:hover {
    text-decoration: underline;
  }
`;

const BookingStatus = styled.span`
  color: ${props => (props.success ? '#4caf50' : '#e94560')};
`;

const BookingDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
  &:hover {
    background: #ff6b81;
  }
`;

const PaginationContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: center;
`;

const BookingHistoryPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (!currentUser || !currentUser.id) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await ticketService.getTicketsByUserId(currentUser.id, currentPage, pageSize);
        const data = response.data;

        // Giả định API trả về { items: [], totalItems: number }
        setBookings(data.items || []);
        setTotalItems(data.totalItems || data.items?.length || 0);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        if (err.response?.status === 401) {
          await authService.logout();
          navigate('/login');
        }
        setError('Không thể tải lịch sử đặt vé. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser, navigate, currentPage, pageSize]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetails = async (appTransId) => {
    try {
      const response = await ticketService.getTicketByAppTransId(appTransId);
      const bookingDetails = response.data;
      // Chuyển hướng đến trang chi tiết
      navigate(`/booking-details/${appTransId}`, { state: { bookingDetails } });
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError('Không thể tải chi tiết vé. Vui lòng thử lại.');
    }
  };

  const formatPrice = price =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);

  if (loading) return <PageContainer><Header /><ContentContainer>Đang tải...</ContentContainer><Footer /></PageContainer>;
  if (error) return <PageContainer><Header /><ContentContainer>{error}</ContentContainer><Footer /></PageContainer>;

  return (
    <PageContainer>
      <Header />
      <ContentContainer>
        <PageTitle>Lịch Sử Đặt Vé</PageTitle>
        {bookings.length === 0 ? (
          <p>Bạn chưa có vé nào được đặt.</p>
        ) : (
          <>
            <BookingList>
              {bookings.map(booking => {
                const firstTicket = booking.tickets[0] || {};
                const isPaymentSuccess = booking.tickets.every(t => t.isPaymentSuccess);
                const totalPrice = booking.tickets.reduce((sum, ticket) => sum + ticket.price, 0);
                const seats = booking.tickets.map(ticket => ticket.seatName);

                return (
                  <BookingCard key={booking.appTransId}>
                    <BookingHeader>
                      <BookingTitle onClick={() => handleViewDetails(booking.appTransId)}>
                        Mã giao dịch: {booking.appTransId}
                      </BookingTitle>
                      <BookingStatus success={isPaymentSuccess}>
                        {isPaymentSuccess ? 'Thành công' : 'Thất bại'}
                      </BookingStatus>
                    </BookingHeader>
                    <BookingDetails>
                      <DetailRow>
                        <span>Phim:</span>
                        <span>{firstTicket.title || 'N/A'}</span>
                      </DetailRow>
                      <DetailRow>
                        <span>Phòng chiếu:</span>
                        <span>{firstTicket.roomNumber || 'N/A'}</span>
                      </DetailRow>
                      <DetailRow>
                        <span>Suất chiếu:</span>
                        <span>
                          {firstTicket.startTime
                            ? `${format(new Date(firstTicket.startTime), 'dd/MM/yyyy HH:mm')} - ${format(new Date(firstTicket.endTime || new Date(firstTicket.startTime).setHours(new Date(firstTicket.startTime).getHours() + 2)), 'HH:mm')}`
                            : 'N/A'}
                        </span>
                      </DetailRow>
                      <DetailRow>
                        <span>Ghế:</span>
                        <span>{seats.join(', ') || 'N/A'}</span>
                      </DetailRow>
                    </BookingDetails>
                  </BookingCard>
                );
              })}
            </BookingList>
            <PaginationContainer>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalItems}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </PaginationContainer>
          </>
        )}
        <Button onClick={() => navigate('/')}>Quay Lại Trang Chủ</Button>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
};

export default BookingHistoryPage;