import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { FaTicketAlt, FaCreditCard, FaMoneyBill, FaQrcode } from 'react-icons/fa';
import Button from '../common/Button';

const Container = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h3`
  margin-bottom: 1.5rem;
  color: #e94560;
`;

const SectionIcon = styled.span`
  display: flex;
  align-items: center;
  margin-right: 0.8rem;
`;

const BookingInfo = styled.div`
  background: #16213e;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const MovieInfo = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
`;

const MoviePoster = styled.img`
  width: 100px;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 1rem;
`;

const MovieDetails = styled.div`
  flex: 1;
`;

const MovieTitle = styled.h4`
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
  color: #a0a0a0;
  font-size: 0.9rem;
`;

const InfoLabel = styled.div`
  width: 100px;
  color: #a0a0a0;
`;

const InfoValue = styled.div`
  flex: 1;
  color: white;
`;

const SeatsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SeatBadge = styled.span`
  background: #1a1a2e;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const PaymentMethodsContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const PaymentMethods = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PaymentMethod = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid ${props => props.selected ? '#e94560' : '#333'};
  background: ${props => props.selected ? 'rgba(233, 69, 96, 0.1)' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: #e94560;
  }
`;

const PaymentIcon = styled.span`
  display: flex;
  align-items: center;
  margin-right: 1rem;
  font-size: 1.5rem;
  color: ${props => props.selected ? '#e94560' : '#a0a0a0'};
`;

const PaymentInfo = styled.div`
  flex: 1;
`;

const PaymentName = styled.div`
  font-weight: bold;
  margin-bottom: 0.2rem;
`;

const PaymentDescription = styled.div`
  font-size: 0.9rem;
  color: #a0a0a0;
`;

const SummaryContainer = styled.div`
  background: #16213e;
  border-radius: 8px;
  padding: 1.5rem;
`;

const SummaryTitle = styled.h4`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  color: #e94560;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
    padding-top: 1rem;
    border-top: 1px solid #333;
    font-weight: bold;
    font-size: 1.2rem;
  }
`;

const ButtonContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
`;

const Checkout = ({ 
  movie, 
  cinema, 
  showTime, 
  selectedSeats, 
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onBack,
  onComplete,
  isProcessing = false
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  const calculateTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };
  
  return (
    <Container>
      <Title>
        <SectionIcon><FaTicketAlt /></SectionIcon>
        Thông tin đặt vé
      </Title>
      
      <BookingInfo>
        <MovieInfo>
          <MoviePoster src={movie.poster} alt={movie.title} />
          <MovieDetails>
            <MovieTitle>{movie.title}</MovieTitle>
            
            <InfoRow>
              <InfoLabel>Rạp:</InfoLabel>
              <InfoValue>{cinema.name}</InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoLabel>Phòng chiếu:</InfoLabel>
              <InfoValue>{showTime.hall}</InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoLabel>Ngày chiếu:</InfoLabel>
              <InfoValue>{format(new Date(showTime.date), 'dd/MM/yyyy')}</InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoLabel>Suất chiếu:</InfoLabel>
              <InfoValue>{showTime.startTime} - {showTime.endTime}</InfoValue>
            </InfoRow>
          </MovieDetails>
        </MovieInfo>
        
        <InfoRow>
          <InfoLabel>Ghế:</InfoLabel>
          <SeatsContainer>
            {selectedSeats.map(seat => (
              <SeatBadge key={seat.id}>
                {seat.row}{seat.number} ({seat.type === 'vip' ? 'VIP' : 'Thường'})
              </SeatBadge>
            ))}
          </SeatsContainer>
        </InfoRow>
      </BookingInfo>
      
      <PaymentMethodsContainer>
        <Title>
          <SectionIcon><FaCreditCard /></SectionIcon>
          Phương thức thanh toán
        </Title>
        
        <PaymentMethods>
          <PaymentMethod 
            selected={selectedPaymentMethod === 'credit_card'}
            onClick={() => onPaymentMethodSelect('credit_card')}
          >
            <PaymentIcon selected={selectedPaymentMethod === 'credit_card'}>
              <FaCreditCard />
            </PaymentIcon>
            <PaymentInfo>
              <PaymentName>Thẻ tín dụng / Ghi nợ</PaymentName>
              <PaymentDescription>Visa, Mastercard, JCB</PaymentDescription>
            </PaymentInfo>
          </PaymentMethod>
          
          <PaymentMethod 
            selected={selectedPaymentMethod === 'cash'}
            onClick={() => onPaymentMethodSelect('cash')}
          >
            <PaymentIcon selected={selectedPaymentMethod === 'cash'}>
              <FaMoneyBill />
            </PaymentIcon>
            <PaymentInfo>
              <PaymentName>Tiền mặt</PaymentName>
              <PaymentDescription>Thanh toán tại quầy</PaymentDescription>
            </PaymentInfo>
          </PaymentMethod>
          
          <PaymentMethod 
            selected={selectedPaymentMethod === 'momo'}
            onClick={() => onPaymentMethodSelect('momo')}
          >
            <PaymentIcon selected={selectedPaymentMethod === 'momo'}>
              <FaQrcode />
            </PaymentIcon>
            <PaymentInfo>
              <PaymentName>Ví điện tử</PaymentName>
              <PaymentDescription>MoMo, ZaloPay, VNPay</PaymentDescription>
            </PaymentInfo>
          </PaymentMethod>
        </PaymentMethods>
      </PaymentMethodsContainer>
      
      <SummaryContainer>
        <SummaryTitle>
          <SectionIcon><FaTicketAlt /></SectionIcon>
          Tóm tắt đơn hàng
        </SummaryTitle>
        
        <SummaryRow>
          <div>Phim:</div>
          <div>{movie.title}</div>
        </SummaryRow>
        
        <SummaryRow>
          <div>Rạp:</div>
          <div>{cinema.name}</div>
        </SummaryRow>
        
        <SummaryRow>
          <div>Suất chiếu:</div>
          <div>{showTime.startTime}</div>
        </SummaryRow>
        
        <SummaryRow>
          <div>Số ghế:</div>
          <div>{selectedSeats.length}</div>
        </SummaryRow>
        
        <SummaryRow>
          <div>Giá vé:</div>
          <div>{formatPrice(showTime.price)}</div>
        </SummaryRow>
        
        {selectedSeats.some(seat => seat.type === 'vip') && (
          <SummaryRow>
            <div>Phụ thu VIP:</div>
            <div>{formatPrice(selectedSeats.filter(seat => seat.type === 'vip').length * (showTime.price * 0.2))}</div>
          </SummaryRow>
        )}
        
        <SummaryRow>
          <div>Tổng tiền:</div>
          <div>{formatPrice(calculateTotalPrice())}</div>
        </SummaryRow>
      </SummaryContainer>
      
      <ButtonContainer>
        <Button variant="secondary" onClick={onBack} disabled={isProcessing}>
          Quay lại
        </Button>
        <Button variant="primary" onClick={onComplete} disabled={isProcessing}>
          {isProcessing ? 'Đang xử lý...' : 'Hoàn tất đặt vé'}
        </Button>
      </ButtonContainer>
    </Container>
  );
};

export default Checkout;