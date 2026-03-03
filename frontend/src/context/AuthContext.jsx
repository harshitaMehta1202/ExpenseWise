import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [name, setName] = useState(localStorage.getItem('name'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId || '');
      localStorage.setItem('name', name || '');
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('name');
    }
  }, [token, userId, name]);

  const login = (token, userId, name, email) => {
    setToken(token);
    setUserId(userId);
    setName(name);
    setUser({ userId, name, email });
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setName(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, userId, name, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
