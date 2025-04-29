import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const { token, user } = await authService.login({ email, password });
    localStorage.setItem('token', token);
    setUser(user);
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    return { token, user };
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    setUser(null);
    setUserRole(null);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('token');
    setUser(null);
    setUserRole(null);
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await authService.getCurrentUser();
          setUser(response.data);
          const role = localStorage.getItem('userRole');
          setUserRole(role);
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (err) {
        setUser(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser: user, userRole, login, register, logout, error, setError, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);