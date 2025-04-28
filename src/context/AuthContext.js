import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const { token, user } = await authService.login({ email, password });
    setUser(user);
    return { token, user };
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    // Đặt user về null để đảm bảo không có trạng thái đăng nhập
    setUser(null);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Chỉ gọi getCurrentUser nếu đã có token
        const token = localStorage.getItem('token');
        if (token) {
          const response = await authService.getCurrentUser();
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser: user, login, register, logout, error, setError, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);