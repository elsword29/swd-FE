import React from 'react';
import styled from 'styled-components';
import { FaCouch } from 'react-icons/fa';

const Container = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h3`
  margin-bottom: 1.5rem;
  color: #e94560;
`;

const Screen = styled.div`
  height: 40px;
  background: #1a1a2e;
  margin: 0 auto 2rem;
  width: 80%;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #a0a0a0;
  font-size: 0.9rem;
  transform: perspective(300px) rotateX(-30deg);
`;

const SeatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  margin-bottom: 2rem;
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const RowLabel = styled.div`
  width: 30px;
  text-align: center;
  font-weight: bold;
`;

const Seat = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: ${props => props.isAvailable ? 'pointer' : 'not-allowed'};
  background-color: ${props => {
    if (props.isSelected) return '#e94560';
    if (!props.isAvailable) return '#333';
    return props.type === 'vip' ? '#ff9800' : '#1a1a2e';
  }};
  color: ${props => {
    if (props.isSelected) return '#fff';
    if (!props.isAvailable) return '#777';
    return props.type === 'vip' ? '#fff' : '#fff';
  }};
  transition: all 0.2s;
  
  &:hover {
    transform: ${props => props.isAvailable ? 'scale(1.1)' : 'none'};
  }
`;

const SeatIcon = styled(FaCouch)`
  font-size: 1.5rem;
`;

const SeatLegend = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 1rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #a0a0a0;
`;

const LegendColor = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 8px;
  background-color: ${props => props.color};
`;

const SelectedSeatsInfo = styled.div`
  background: #16213e;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1.5rem;
`;

const SelectedSeatsTitle = styled.h4`
  font-size: 1rem;
  margin-bottom: 1rem;
  color: white;
`;

const SelectedSeatsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SelectedSeatBadge = styled.span`
  background: #1a1a2e;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const SeatMap = ({ 
  seatMap = [], 
  selectedSeats = [], 
  onSeatClick,
  showSelectedSeatsInfo = true 
}) => {
  
  const isSeatSelected = (seat) => {
    return selectedSeats.some(s => s.id === seat.id);
  };

  return (
    <Container>
      <Title>Chọn ghế ngồi</Title>
      
      <Screen>Màn hình</Screen>
      
      <SeatsContainer>
        {seatMap.map(row => (
          <Row key={row.row}>
            <RowLabel>{row.row}</RowLabel>
            {row.seats.map(seat => (
              <Seat
                key={`${seat.row}-${seat.number}`}
                isAvailable={seat.isAvailable}
                isSelected={isSeatSelected(seat)}
                type={seat.type}
                onClick={() => onSeatClick(seat)}
              >
                <SeatIcon />
              </Seat>
            ))}
            <RowLabel>{row.row}</RowLabel>
          </Row>
        ))}
      </SeatsContainer>
      
      <SeatLegend>
        <LegendItem>
          <LegendColor color="#1a1a2e" />
          <span>Ghế thường</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#ff9800" />
          <span>Ghế VIP</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#e94560" />
          <span>Đang chọn</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#333" />
          <span>Đã đặt</span>
        </LegendItem>
      </SeatLegend>
      
      {showSelectedSeatsInfo && selectedSeats.length > 0 && (
        <SelectedSeatsInfo>
          <SelectedSeatsTitle>Ghế đã chọn:</SelectedSeatsTitle>
          <SelectedSeatsList>
            {selectedSeats.map(seat => (
              <SelectedSeatBadge key={seat.id}>
                {seat.row}{seat.number} ({seat.type === 'vip' ? 'VIP' : 'Thường'})
              </SelectedSeatBadge>
            ))}
          </SelectedSeatsList>
        </SelectedSeatsInfo>
      )}
    </Container>
  );
};

export default SeatMap;