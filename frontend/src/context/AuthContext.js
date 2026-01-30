import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin as adminLoginAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for regular user
    const savedUser = localStorage.getItem('dzaghik_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Check for admin user
    const savedAdminUser = localStorage.getItem('admin_user');
    const accessToken = localStorage.getItem('admin_access_token');
    if (savedAdminUser && accessToken) {
      setAdminUser(JSON.parse(savedAdminUser));
      setIsAdmin(true);
    }
  }, []);

  const login = (email, password) => {
    // Mock login for regular users (not connected to backend yet)
    const mockUser = { email, name: 'Օգտատեր' };
    setUser(mockUser);
    localStorage.setItem('dzaghik_user', JSON.stringify(mockUser));
    return true;
  };

  const adminLogin = async (username, password) => {
    setLoading(true);
    try {
      // Call backend API for admin login
      const data = await adminLoginAPI(username, password);
      
      // Store tokens and user info
      localStorage.setItem('admin_access_token', data.access);
      localStorage.setItem('admin_refresh_token', data.refresh);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      
      setAdminUser(data.user);
      setIsAdmin(true);
      setLoading(false);
      return { success: true, data };
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          'Սխալ մուտքանուն կամ գաղտնաբառ';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dzaghik_user');
  };

  const adminLogout = () => {
    setIsAdmin(false);
    setAdminUser(null);
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
  };

  const signup = (name, email, password) => {
    // Mock signup for regular users
    const mockUser = { email, name };
    setUser(mockUser);
    localStorage.setItem('dzaghik_user', JSON.stringify(mockUser));
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        adminUser,
        loading,
        login,
        adminLogin,
        logout,
        adminLogout,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
