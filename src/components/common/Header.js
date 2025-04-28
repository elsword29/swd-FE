import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const HeaderContainer = styled.header`
  background-color: #1a1a2e;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled(Link)`
  font-size: 1.8rem;
  font-weight: bold;
  color: #e94560;
  text-decoration: none;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #ff6b81;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  margin-left: 2rem;
  font-weight: 500;
  
  &:hover {
    color: #e94560;
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const UserButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-left: 2rem;
  
  &:hover {
    color: #e94560;
  }
`;

const UserName = styled.span`
  margin-left: 0.5rem;
`;

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <HeaderContainer>
      <Logo to="/">Cinema<span style={{ color: 'white' }}>Booking</span></Logo>
      
      <Nav>
        <NavLink to="/">Trang chủ</NavLink>
        <NavLink to="/movies">Phim</NavLink>
        
        {currentUser ? (
          <UserMenu>
            <NavLink to="/profile">
              <FaUser /> <UserName>{currentUser.name}</UserName>
            </NavLink>
            <UserButton onClick={handleLogout}>
              <FaSignOutAlt /> <UserName>Đăng xuất</UserName>
            </UserButton>
          </UserMenu>
        ) : (
          <NavLink to="/login">Đăng nhập</NavLink>
        )}
      </Nav>
    </HeaderContainer>
  );
};

export default Header;