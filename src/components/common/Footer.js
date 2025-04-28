import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaPhoneAlt, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';

const FooterContainer = styled.footer`
  background-color: #0a0a18;
  color: #a0a0a0;
  padding: 3rem 0 1rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const FooterLogo = styled(Link)`
  font-size: 1.8rem;
  font-weight: bold;
  color: #e94560;
  text-decoration: none;
  margin-bottom: 1rem;
  
  &:hover {
    color: #ff6b81;
  }
`;

const FooterDescription = styled.p`
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const ColumnTitle = styled.h4`
  color: white;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -8px;
    width: 50px;
    height: 2px;
    background-color: #e94560;
  }
`;

const FooterLink = styled(Link)`
  color: #a0a0a0;
  text-decoration: none;
  margin-bottom: 0.8rem;
  transition: color 0.3s;
  
  &:hover {
    color: #e94560;
  }
`;

const FooterNav = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const ContactIcon = styled.span`
  display: flex;
  align-items: center;
  margin-right: 10px;
  color: #e94560;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 1rem;
`;

const SocialIcon = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #1a1a2e;
  color: #a0a0a0;
  border-radius: 50%;
  transition: all 0.3s;
  
  &:hover {
    background-color: #e94560;
    color: white;
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 1px solid #1a1a2e;
  font-size: 0.9rem;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterColumn>
          <FooterLogo to="/">Cinema<span style={{ color: 'white' }}>Booking</span></FooterLogo>
          <FooterDescription>
            Trang web đặt vé xem phim hàng đầu Việt Nam, cung cấp trải nghiệm đặt vé dễ dàng và thuận tiện với nhiều ưu đãi hấp dẫn.
          </FooterDescription>
          <SocialLinks>
            <SocialIcon href="#" target="_blank">
              <FaFacebookF />
            </SocialIcon>
            <SocialIcon href="#" target="_blank">
              <FaTwitter />
            </SocialIcon>
            <SocialIcon href="#" target="_blank">
              <FaInstagram />
            </SocialIcon>
            <SocialIcon href="#" target="_blank">
              <FaYoutube />
            </SocialIcon>
          </SocialLinks>
        </FooterColumn>
        
        <FooterColumn>
          <ColumnTitle>Liên kết nhanh</ColumnTitle>
          <FooterNav>
            <FooterLink to="/">Trang chủ</FooterLink>
            <FooterLink to="/movies">Phim</FooterLink>
            <FooterLink to="/login">Đăng nhập</FooterLink>
            <FooterLink to="/profile">Tài khoản</FooterLink>
          </FooterNav>
        </FooterColumn>
        
        <FooterColumn>
          <ColumnTitle>Thông tin</ColumnTitle>
          <FooterNav>
            <FooterLink to="#">Về chúng tôi</FooterLink>
            <FooterLink to="#">Điều khoản sử dụng</FooterLink>
            <FooterLink to="#">Chính sách bảo mật</FooterLink>
            <FooterLink to="#">Câu hỏi thường gặp</FooterLink>
          </FooterNav>
        </FooterColumn>
        
        <FooterColumn>
          <ColumnTitle>Liên hệ</ColumnTitle>
          <ContactItem>
            <ContactIcon><FaMapMarkerAlt /></ContactIcon>
            <div>Tầng 5, Tòa nhà ABC, 123 Đường XYZ, Quận 1, TP. Hồ Chí Minh</div>
          </ContactItem>
          <ContactItem>
            <ContactIcon><FaPhoneAlt /></ContactIcon>
            <div>+84 123 456 789</div>
          </ContactItem>
          <ContactItem>
            <ContactIcon><FaEnvelope /></ContactIcon>
            <div>support@cinemabooking.com</div>
          </ContactItem>
        </FooterColumn>
      </FooterContent>
      
      <Copyright>
        &copy; {new Date().getFullYear()} Cinema Booking. Tất cả quyền được bảo lưu.
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;