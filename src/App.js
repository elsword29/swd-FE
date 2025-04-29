import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Trang Người dùng
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailPage from './pages/MovieDetailPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import BookingPage from './pages/BookingPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import PaymentCallback from './pages/PaymentCallback';

// Trang Nhân viên
import StaffLayout from './pages/staff/StaffLayout';
import StaffDashboard from './pages/staff/StaffDashboard';
import FilmsManagementPage from './pages/staff/FilmsManagementPage';
import FilmForm from './pages/staff/FilmForm';
import GenresManagementPage from './pages/staff/GenresManagementPage';
import ProjectionsManagementPage from './pages/staff/ProjectionsManagementPage';
import ProjectionForm from './pages/staff/ProjectionForm';
import BookingsManagementPage from './pages/staff/BookingsManagementPage';
import FilmGenreForm from './pages/staff/FilmGenreForm';


const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Tuyến đường được bảo vệ cho Nhân viên
const StaffProtectedRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();
  
  if (loading) {
    return <div>Đang tải...</div>;
  }
  
  if (!currentUser || userRole !== 'staff') {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Tuyến đường Trang chủ với chuyển hướng cho Nhân viên
const HomeRoute = () => {
  const { currentUser, userRole, loading } = useAuth();
  
  if (loading) {
    return <div>Đang tải...</div>;
  }
  
  if (currentUser && userRole === 'staff') {
    return <Navigate to="/staff/dashboard" />;
  }
  
  return <HomePage />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <BookingProvider>
          <ToastContainer />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<HomeRoute />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/movies/:id" element={<MovieDetailPage />} />
            <Route path="/booking/:id" element={<BookingPage />} />
            <Route path="/seat-selection" element={<SeatSelectionPage />} />
            <Route path="/booking/payment-callback" element={<PaymentCallback />} /> 
            <Route path="/booking-history" element={<BookingHistoryPage />} /> 
            <Route 
              path="/booking/seats" 
              element={
                <ProtectedRoute>
                  <SeatSelectionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking/tickethistory"
              element={
                <ProtectedRoute>
                  <BookingHistoryPage />
                </ProtectedRoute>
              }
            />
            
            {/* Tuyến đường được bảo vệ cho Nhân viên */}
            <Route 
              path="/staff"
              element={
                <StaffProtectedRoute>
                  <StaffLayout />
                </StaffProtectedRoute>
              }
            >
              <Route index element={<StaffDashboard />} />
              <Route path="dashboard" element={<StaffDashboard />} />
              
              {/* Tuyến đường Quản lý Phim */}
              <Route path="films" element={<FilmsManagementPage />} />
              <Route path="films/add" element={<FilmForm mode="add" />} />
              <Route path="films/edit/:id" element={<FilmForm mode="edit" />} />
              <Route path="films/:id/genres" element={<FilmGenreForm />} />
              
              {/* Tuyến đường Quản lý Thể loại */}
              <Route path="genres" element={<GenresManagementPage />} />
              
              {/* Tuyến đường Quản lý Suất chiếu */}
              <Route path="projections" element={<ProjectionsManagementPage />} />
              <Route path="projections/add" element={<ProjectionForm mode="add" />} />
              <Route path="projections/edit/:id" element={<ProjectionForm mode="edit" />} />
              
              {/* Tuyến đường Quản lý Đặt vé */}
              <Route path="bookings" element={<BookingsManagementPage />} />
            </Route>
            
            {/* Tuyến đường dự phòng */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BookingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;