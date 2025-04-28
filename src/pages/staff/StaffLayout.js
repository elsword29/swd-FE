import React, { useState } from 'react';
import { Layout, Menu, Breadcrumb, Button, Avatar, Dropdown } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  TagOutlined,
  HistoryOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import "../style/StaffLayout.css";

const { Header, Sider, Content } = Layout;

const StaffLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const getCurrentPath = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    return pathSegments.length > 1 ? pathSegments[1] : 'dashboard';
  };

  const handleLogout = () => {
    // Implement logout logic here
    // For example, clear token from local storage
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/staff/profile">Thông tin cá nhân</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  const menuItems = [
    {
      key: 'dashboard',
      icon: <AppstoreOutlined />,
      label: <Link to="/staff">Dashboard</Link>,
    },
    {
      key: 'films',
      icon: <VideoCameraOutlined />,
      label: <Link to="/staff/films">Quản lý phim</Link>,
    },
    {
      key: 'genres',
      icon: <TagOutlined />,
      label: <Link to="/staff/genres">Thể loại phim</Link>,
    },
    {
      key: 'projections',
      icon: <ClockCircleOutlined />,
      label: <Link to="/staff/projections">Lịch chiếu</Link>,
    },
    {
      key: 'bookings',
      icon: <HistoryOutlined />,
      label: <Link to="/staff/bookings">Lịch sử đặt vé</Link>,
    },
  ];

  // Mapping of route keys to breadcrumb text
  const breadcrumbMap = {
    dashboard: 'Dashboard',
    films: 'Quản lý phim',
    genres: 'Thể loại phim',
    projections: 'Lịch chiếu',
    bookings: 'Lịch sử đặt vé',
    'add-film': 'Thêm phim mới',
    'edit-film': 'Chỉnh sửa phim',
    'add-genre': 'Thêm thể loại mới',
    'edit-genre': 'Chỉnh sửa thể loại',
    'add-projection': 'Thêm suất chiếu mới',
    'edit-projection': 'Chỉnh sửa suất chiếu',
  };

  // Parse current pathname to generate breadcrumbs
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    
    const breadcrumbs = pathSegments.map((segment, index) => {
      const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
      const text = breadcrumbMap[segment] || segment;
      
      return {
        url,
        text: text.charAt(0).toUpperCase() + text.slice(1),
      };
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <Layout className="staff-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="staff-sider"
      >
        <div className="staff-logo">
          {collapsed ? 'CB' : 'Cinema Booking'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getCurrentPath()]}
          items={menuItems}
        />
      </Sider>
      <Layout className="site-layout">
        <Header className="staff-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            className="trigger-button"
          />
          <div className="header-right">
            <Dropdown overlay={userMenu} placement="bottomRight">
              <div className="user-dropdown">
                <Avatar icon={<UserOutlined />} />
                <span className="user-name">Admin</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="staff-content">
          <div className="staff-breadcrumb">
            <Breadcrumb>
              {breadcrumbs.map((breadcrumb, index) => (
                <Breadcrumb.Item key={index}>
                  {index === breadcrumbs.length - 1 ? (
                    breadcrumb.text
                  ) : (
                    <Link to={breadcrumb.url}>{breadcrumb.text}</Link>
                  )}
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          </div>
          <div className="content-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StaffLayout;