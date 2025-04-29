import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaUser, FaEnvelope, FaPhone, FaHistory } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

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

const Section = styled.div`
  background: #16213e;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  color: #e94560;
`;

const SectionIcon = styled.span`
  display: flex;
  align-items: center;
  margin-right: 0.8rem;
`;

const ProfileInfo = styled.div`
  margin-bottom: 1.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoIcon = styled.span`
  display: flex;
  align-items: center;
  margin-right: 1rem;
  color: #a0a0a0;
  width: 20px;
`;

const InfoLabel = styled.div`
  width: 100px;
  color: #a0a0a0;
`;

const InfoValue = styled.div`
  flex: 1;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: ${props => props.secondary ? 'transparent' : '#e94560'};
  color: white;
  border: ${props => props.secondary ? '1px solid #333' : 'none'};
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: ${props => props.secondary ? 'rgba(255, 255, 255, 0.1)' : '#ff6b81'};
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #e94560;
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const ErrorMessage = styled.div`
  color: #e94560;
  background: rgba(233, 69, 96, 0.1);
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, logout, loading, setError } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [refreshNeeded, setRefreshNeeded] = useState(false);
  
  // Function to refresh user profile
  const refreshProfile = async () => {
    try {
      setLocalLoading(true);
      // Check if we have an API call to refresh profile specifically
      await authService.getCurrentUser();
      // Load booking history if needed
      // const response = await bookingService.getUserBookings();
      // setBookings(response.data);
    } catch (err) {
      setError('Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.');
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && refreshNeeded) {
      refreshProfile();
      setRefreshNeeded(false);
    }
  }, [currentUser, refreshNeeded]);
  
  // Set refresh needed on mount
  useEffect(() => {
    setRefreshNeeded(true);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading || localLoading) {
    return (
      <PageContainer>
        <Header />
        <ContentContainer>
          <LoadingContainer>
            <LoadingSpinner />
          </LoadingContainer>
        </ContentContainer>
      </PageContainer>
    );
  }

  if (!currentUser) {
    return (
      <PageContainer>
        <Header />
        <ContentContainer>
          <Section>
            <SectionTitle>Thông báo</SectionTitle>
            <p>Vui lòng đăng nhập để xem thông tin tài khoản.</p>
            <Button onClick={() => navigate('/login')}>Đăng nhập</Button>
          </Section>
        </ContentContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header />
      
      <ContentContainer>
        <PageTitle>Tài khoản của tôi</PageTitle>
        
        <Section>
          <SectionTitle>
            <SectionIcon><FaUser /></SectionIcon>
            Thông tin cá nhân
          </SectionTitle>
          
          <ProfileInfo>
            <InfoRow>
              <InfoIcon><FaUser /></InfoIcon>
              <InfoLabel>Họ tên:</InfoLabel>
              <InfoValue>{currentUser.fullName}</InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoIcon><FaEnvelope /></InfoIcon>
              <InfoLabel>Email:</InfoLabel>
              <InfoValue>{currentUser.email}</InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoIcon><FaPhone /></InfoIcon>
              <InfoLabel>Điện thoại:</InfoLabel>
              <InfoValue>{currentUser.phoneNumber || 'Không có thông tin'}</InfoValue>
            </InfoRow>
          </ProfileInfo>
          
          <Button onClick={() => setRefreshNeeded(true)}>
            Làm mới
          </Button>
          
          <Button secondary onClick={handleLogout} style={{ marginLeft: '10px' }}>
            Đăng xuất
          </Button>
        </Section>
        
        <Section>
          <SectionTitle>
            <SectionIcon><FaHistory /></SectionIcon>
            Lịch sử đặt vé
          </SectionTitle>
          
          {bookings.length > 0 ? (
            // Render your bookings list here
            <div>
              {/* Map through bookings */}
            </div>
          ) : (
            <p>Chưa có lịch sử đặt vé.</p>
          )}
          
          <Button onClick={() => navigate('/movies')}>
            Đặt vé ngay
          </Button>
        </Section>
      </ContentContainer>
    </PageContainer>
  );
};

export default ProfilePage;