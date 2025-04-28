import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, message } from 'antd';

const styles = `
  .staff-dashboard {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f2f5;
  }
  
  .welcome-message {
    font-size: 24px;
    color: #1890ff;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const { Title } = Typography;

const StaffDashboard = () => {
  const navigate = useNavigate();


  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'staff') {
      message.error('Bạn không có quyền truy cập trang này');
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="staff-dashboard">
      <Title className="welcome-message">
        Chào mừng đến với Staff Dashboard!
      </Title>
    </div>
  );
};

export default StaffDashboard;