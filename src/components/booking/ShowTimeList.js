import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

const Container = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h3`
  margin-bottom: 1.5rem;
  color: #e94560;
`;

const DateSelector = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #333;
    border-radius: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: #1a1a2e;
  }
`;

const DateButton = styled.button`
  padding: 10px 16px;
  background: ${props => props.selected ? '#e94560' : '#1a1a2e'};
  color: ${props => props.selected ? 'white' : '#a0a0a0'};
  border: 1px solid ${props => props.selected ? '#e94560' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  min-width: 80px;
  transition: all 0.3s;
  
  &:hover {
    background: ${props => props.selected ? '#ff6b81' : 'rgba(233, 69, 96, 0.1)'};
    color: ${props => props.selected ? 'white' : '#e94560'};
  }
`;

const DateLabel = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`;

const DateValue = styled.div`
  font-size: 0.8rem;
`;

const ShowtimesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
`;

const ShowtimeButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  background: ${props => props.selected ? 'rgba(233, 69, 96, 0.2)' : '#1a1a2e'};
  color: ${props => props.selected ? '#e94560' : 'white'};
  border: 1px solid ${props => props.selected ? '#e94560' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  min-width: 80px;
  transition: all 0.3s;
  
  &:hover {
    border-color: #e94560;
    background: ${props => props.selected ? 'rgba(233, 69, 96, 0.2)' : 'rgba(233, 69, 96, 0.1)'};
  }
`;

const Time = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`;

const Hall = styled.div`
  font-size: 0.8rem;
  color: #a0a0a0;
`;

const Price = styled.div`
  font-size: 0.8rem;
  color: ${props => props.selected ? '#e94560' : '#a0a0a0'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #a0a0a0;
  background: #16213e;
  border-radius: 8px;
`;


const getDateOptions = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};

const formatShortDate = (date) => {
  return format(date, 'EEE', { locale: vi });
};

const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() && 
         date.getMonth() === today.getMonth() && 
         date.getFullYear() === today.getFullYear();
};

const formatShowtimeDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd');
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const ShowTimeList = ({ 
  showTimes = [], 
  selectedDate = new Date(),
  selectedShowTime = null,
  onSelectDate,
  onSelectShowTime,
  emptyMessage = 'Không có suất chiếu nào' 
}) => {
  const dateOptions = getDateOptions();
  
  const filteredShowTimes = showTimes.filter(showtime => 
    formatShowtimeDate(showtime.date) === formatShowtimeDate(selectedDate)
  );

  return (
    <Container>
      <Title>Chọn suất chiếu</Title>
      
      <DateSelector>
        {dateOptions.map((date, index) => (
          <DateButton
            key={index}
            selected={formatShowtimeDate(date) === formatShowtimeDate(selectedDate)}
            onClick={() => onSelectDate(date)}
          >
            <DateLabel>
              {isToday(date) ? 'Hôm nay' : formatShortDate(date)}
            </DateLabel>
            <DateValue>{format(date, 'dd/MM')}</DateValue>
          </DateButton>
        ))}
      </DateSelector>
      
      {filteredShowTimes.length > 0 ? (
        <ShowtimesContainer>
          {filteredShowTimes.map(showtime => (
            <ShowtimeButton
              key={showtime.id}
              selected={selectedShowTime && selectedShowTime.id === showtime.id}
              onClick={() => onSelectShowTime(showtime)}
            >
              <Time>{showtime.startTime}</Time>
              <Hall>{showtime.hall}</Hall>
              <Price selected={selectedShowTime && selectedShowTime.id === showtime.id}>
                {formatPrice(showtime.price)}
              </Price>
            </ShowtimeButton>
          ))}
        </ShowtimesContainer>
      ) : (
        <EmptyState>
          <p>{emptyMessage}</p>
        </EmptyState>
      )}
    </Container>
  );
};

export default ShowTimeList;