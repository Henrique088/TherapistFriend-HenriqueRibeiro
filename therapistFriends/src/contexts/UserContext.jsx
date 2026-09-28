// src/contexts/UserContext.jsx

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/apiConfig';
import { useLocation } from "react-router-dom";


const UserContext = createContext();

export function UserProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loadingUsuario, setLoadingUsuario] = useState(true);
  const location = useLocation();

  // Define quais rotas não precisam disparar a busca de perfil
  const rotaPublica = ["/login", "/cadastro", "/"].includes(location.pathname);

  const fetchUsuario = useCallback(async () => {
    if (rotaPublica) {
      setLoadingUsuario(false);
      return;
    }

    try {
      setLoadingUsuario(true);
      const response = await api.get('/usuarios/perfil/me', { _isPublic: true });
      
      setUsuario(response.data);
      localStorage.setItem('userAuthInfo', JSON.stringify(response.data));
    } catch (error) {
      setUsuario(null);
      localStorage.removeItem('userAuthInfo');
    } finally {
      setLoadingUsuario(false);
    }
  }, [rotaPublica]);

  useEffect(() => {
    const localAuthInfo = localStorage.getItem('userAuthInfo');

    // Hidratação rápida do estado se já houver info no localStorage
    if (!rotaPublica && localAuthInfo) {
      try {
        setUsuario(JSON.parse(localAuthInfo));
      } catch {
        localStorage.removeItem('userAuthInfo');
      }
    }

    fetchUsuario();
  }, [fetchUsuario, rotaPublica]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });
      setUsuario(null);
      localStorage.clear();
    } catch (error) {
      console.error('Erro ao fazer logout:', error.response?.data || error.message);
    }
  }, []);

  return (
    <UserContext.Provider value={{ usuario, setUsuario, loadingUsuario, fetchUsuario, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}