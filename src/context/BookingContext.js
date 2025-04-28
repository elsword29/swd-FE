// BookingContext.js
import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedShowTime, setSelectedShowTime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [recentTickets, setRecentTickets] = useState(null);

  const calculateTotalPrice = () => {
    if (!selectedShowTime || !selectedSeats.length) return 0;
    const basePrice = selectedShowTime.price * selectedSeats.length;
    const vipSurcharge = selectedSeats.filter((seat) => seat.type === 'vip').length * (selectedShowTime.price * 0.2);
    return basePrice + vipSurcharge;
  };

  const resetBooking = () => {
    setSelectedMovie(null);
    setSelectedCinema(null);
    setSelectedShowTime(null);
    setSelectedSeats([]);
    // Giữ recentTickets để hiển thị sau thanh toán
  };

  return (
    <BookingContext.Provider
      value={{
        selectedMovie,
        setSelectedMovie,
        selectedCinema,
        setSelectedCinema,
        selectedShowTime,
        setSelectedShowTime,
        selectedSeats,
        setSelectedSeats,
        recentTickets,
        setRecentTickets,
        calculateTotalPrice,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);