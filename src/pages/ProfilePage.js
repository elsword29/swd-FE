import React, { useEffect } from 'react';
import styled from 'styled-components';
import { FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
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

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, setUser, userRole, setUserRole, logout, loading } = useAuth();

  // Tải lại thông tin người dùng khi truy cập trang
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getCurrentUser();
        setUser(response.data);
        const role = localStorage.getItem('userRole');
        setUserRole(role);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        logout();
        navigate('/login');
      }
    };

    if (!currentUser) {
      fetchUser();
    }
  }, [currentUser, setUser, setUserRole, logout, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return <PageContainer><Header /><div style={{ padding: '2rem' }}>Đang tải...</div></PageContainer>;
  }

  if (!currentUser) {
    return <PageContainer><Header /><div style={{ padding: '2rem' }}>Vui lòng đăng nhập để xem thông tin tài khoản.</div></PageContainer>;
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
              <InfoValue>{currentUser.fullName || 'Không có thông tin'}</InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoIcon><FaEnvelope /></InfoIcon>
              <InfoLabel>Email:</InfoLabel>
              <InfoValue>{currentUser.email || 'Không có thông tin'}</InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoIcon><FaPhone /></InfoIcon>
              <InfoLabel>Điện thoại:</InfoLabel>
              <InfoValue>{currentUser.phoneNumber || 'Không có thông tin'}</InfoValue>
            </InfoRow>
          </ProfileInfo>
          
          <Button secondary onClick={handleLogout}>
            Đăng xuất
          </Button>
        </Section>
      </ContentContainer>
    </PageContainer>
  );
};

export default ProfilePage;