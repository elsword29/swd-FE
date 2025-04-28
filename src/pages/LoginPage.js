import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaLock, FaEnvelope, FaPhone } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Header from '../components/common/Header';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const PageContainer = styled.div`
  background-color: #0f0f1e;
  color: #fff;
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 3rem 2rem;
`;

const FormContainer = styled.div`
  background: #16213e;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  position: relative;
`;

const FormIcon = styled.span`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0a0a0;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px 12px 45px;
  border-radius: 4px;
  border: 1px solid #333;
  background-color: #1a1a2e;
  color: white;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #e94560;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 1rem;
  
  &:hover {
    background: #ff6b81;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
`;

const ToggleText = styled.p`
  color: #a0a0a0;
`;

const ToggleLink = styled.span`
  color: #e94560;
  cursor: pointer;
  margin-left: 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register, error: authError } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [isStaffLogin, setIsStaffLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const { email, password, name, phone } = formData;

    if (isLogin) {
      if (!email || !password) {
        setError('Vui lòng nhập cả email và mật khẩu');
        return false;
      }
    } else {
      if (!email || !password || !name || !phone) {
        setError('Vui lòng điền đầy đủ tất cả các trường');
        return false;
      }

      if (password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        return false;
      }

      if (!/^\d{10}$/.test(phone)) {
        setError('Số điện thoại phải có đúng 10 chữ số');
        return false;
      }

      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        setError('Email không hợp lệ');
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      // Thêm log để kiểm tra dữ liệu gửi lên API
      console.log('Form data:', formData);

      if (isLogin) {
        if (isStaffLogin) {
          await authService.staffLogin(formData.email, formData.password);
          navigate('/staff/dashboard');
        } else {
          await login(formData.email, formData.password);
          const userRole = localStorage.getItem('userRole');
          if (userRole === 'staff') {
            navigate('/staff/dashboard');
          } else {
            navigate('/');
          }
        }
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          fullname: formData.name,
          phoneNumber: formData.phone,
        });
        toast.success('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
        setIsLogin(true);
        setFormData({
          email: formData.email,
          password: '',
          name: '',
          phone: '',
        });
      }
    } catch (err) {
      // Thêm log để kiểm tra lỗi chi tiết
      console.error('Submit error:', err);
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setIsStaffLogin(false);
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
    });
  };

  return (
    <PageContainer>
      <Header />
      <ContentContainer>
        <FormContainer>
          <PageTitle>{isLogin ? (isStaffLogin ? 'Đăng nhập Nhân viên' : 'Đăng nhập') : 'Đăng ký'}</PageTitle>
          <Form>
            {!isLogin && (
              <FormGroup>
                <FormIcon><FaUser /></FormIcon>
                <Input
                  type="text"
                  name="name"
                  placeholder="Họ và tên"
                  value={formData.name}
                  onChange={handleChange}
                />
              </FormGroup>
            )}
            <FormGroup>
              <FormIcon><FaEnvelope /></FormIcon>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <FormIcon><FaLock /></FormIcon>
              <Input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
              />
            </FormGroup>
            {!isLogin && (
              <FormGroup>
                <FormIcon><FaPhone /></FormIcon>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="Số điện thoại"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </FormGroup>
            )}
            {(error || authError) && <ErrorMessage>{error || authError}</ErrorMessage>}
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </Button>
          </Form>
          <ToggleContainer>
            <ToggleText>
              {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            </ToggleText>
            <ToggleLink onClick={toggleForm}>
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </ToggleLink>
          </ToggleContainer>
        </FormContainer>
      </ContentContainer>
    </PageContainer>
  );
};

export default LoginPage;