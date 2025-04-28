import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Divider, 
  message, 
  Alert, 
  Layout
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  LoginOutlined 
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import '../style/StaffLoginPage.css';

const { Title, Text } = Typography;
const { Content } = Layout;

const StaffLoginPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { staffLogin, error: authError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError('');

      await staffLogin(values.username, values.password);
      message.success('Đăng nhập thành công!');
      navigate('/staff');
    } catch (err) {
      console.error('Login error:', err);
      setError(authError || 'Tên đăng nhập hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="staff-login-layout">
      <Content className="staff-login-content">
        <div className="login-container">
          <Card className="login-card">
            <div className="login-header">
              <Title level={2}>Cinema Admin</Title>
              <Text type="secondary">Đăng nhập quản trị viên</Text>
            </div>

            <Divider />

            {error && (
              <Alert
                message="Lỗi đăng nhập"
                description={error}
                type="error"
                showIcon
                className="login-error"
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="login-form"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Tên đăng nhập"
                  size="large"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Mật khẩu"
                  size="large"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item className="login-button-container">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<LoginOutlined />}
                  size="large"
                  loading={loading}
                  block
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>

            <div className="login-help">
              <Text type="secondary">
                Gợi ý: Tên đăng nhập: admin, Mật khẩu: admin123
              </Text>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default StaffLoginPage;