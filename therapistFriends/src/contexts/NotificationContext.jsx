// contexts/NotificationContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/apiConfig';
import { useSocket } from './SocketContext';
import { useUser } from './UserContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const socket = useSocket();
  const { usuario } = useUser();

  // Carregar notificações ao inicializar
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Adicionar dependência do usuário
  useEffect(() => {
    if (usuario) {
      fetchNotifications();
    }
  }, [usuario]);

  // Escutar por novas notificações via socket
  useEffect(() => {
    if (socket) {
      socket.on('nova_notificacao', (data) => {
        setHasNewNotification(true);
        fetchNotifications(); // Recarregar notificações
      });
      

      socket.on('sessao_iniciando', () => {
      
        setHasNewNotification(true);
        fetchNotifications();

      });

      return () => {
        socket.off('nova_notificacao');
        socket.off('sessao_iniciando');
      };
    }
  }, [socket]);

  const fetchNotifications = async () => {
    if (!usuario) return;

    try {
      const response = await api.get('/notificacoes/contar-nao-lidas', {
        params: { _isPublic: true }
      });

      setUnreadCount(response.data.totalNaoLidas || 0);
      setHasNewNotification((response.data.totalNaoLidas || 0) > 0);

    } catch (error) {
      console.error('Erro ao buscar notificações:', error.response?.data || error.message);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notificacoes/${notificationId}/marcar-como-lida`);

      // Atualizar contador
      setUnreadCount(prev => Math.max(0, prev - 1));
      setHasNewNotification(unreadCount - 1 > 0);

    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error.response?.data || error.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notificacoes/marcar-todas-lidas');

      setUnreadCount(0);
      setHasNewNotification(false);

    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error.response?.data || error.message);
    }
  };

  const value = {
    notifications,
    unreadCount,
    hasNewNotification,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};