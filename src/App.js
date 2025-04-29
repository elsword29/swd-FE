import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// User Pages
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailPage from './pages/MovieDetailPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import BookingPage from './pages/BookingPage';
import PaymentCallback from './pages/PaymentCallback';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffLayout from './pages/staff/StaffLayout';
import FilmsManagementPage from './pages/staff/FilmsManagementPage';
import FilmForm from './pages/staff/FilmForm';
import GenresManagementPage from './pages/staff/GenresManagementPage';
import ProjectionsManagementPage from './pages/staff/ProjectionsManagementPage';
import ProjectionForm from './pages/staff/ProjectionForm';
import BookingsManagementPage from './pages/staff/BookingsManagementPage';
import FilmGenreForm from './pages/staff/FilmGenreForm';
import BookingHistoryPage from './pages/BookingHistoryPage';

// User Protected Route


const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Staff Protected Route
const StaffProtectedRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser || userRole !== 'staff') {
    return <Navigate to="/staff/login" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <BookingProvider>
          <ToastContainer />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/movies/:id" element={<MovieDetailPage />} />
            <Route path="/booking/:id" element={<BookingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/seat-selection" element={<SeatSelectionPage />} />
            <Route path="/booking/payment-callback" element={<PaymentCallback />} />


            {/* Protected user routes */}
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
              } />
            <Route
              path="/staff"
              element={<StaffLayout />}
            >
              <Route index element={<StaffDashboard />} />
              <Route path="dashboard" element={<StaffDashboard />} />

              {/* Film Management Routes */}
              <Route path="films" element={<FilmsManagementPage />} />
              <Route path="films/add" element={<FilmForm mode="add" />} />
              <Route path="films/edit/:id" element={<FilmForm mode="edit" />} />
              <Route path="films/:id/genres" element={<FilmGenreForm />} />

              {/* Genre Management Routes */}
              <Route path="genres" element={<GenresManagementPage />} />

              {/* Projection Management Routes */}
              <Route path="projections" element={<ProjectionsManagementPage />} />
              <Route path="projections/add" element={<ProjectionForm mode="add" />} />
              <Route path="projections/edit/:id" element={<ProjectionForm mode="edit" />} />

              {/* Booking Management Routes */}
              <Route path="bookings" element={<BookingsManagementPage />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BookingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;