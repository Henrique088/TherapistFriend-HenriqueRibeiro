// src/contexts/ChatContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { useSocket } from './SocketContext';
import api from '../api/apiConfig';
import { useLocation } from 'react-router-dom';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { usuario } = useUser();
  const socket = useSocket();

  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [conversationUnreadCounts, setConversationUnreadCounts] = useState({});
  const [activeConversationId, setActiveConversationId] = useState(null);

  const location = useLocation();

  /**
   * Busca os contadores iniciais de mensagens não lidas.
   */
  useEffect(() => {
    if (!usuario) return;

    const fetchInitialUnreadCounts = async () => {
      try {
        const response = await api.get('/chat/conversas/nao-lidas', {
          params: {
            _isPublic: true
          }
        });

        setUnreadChatCount(response.data.total || 0);

        setConversationUnreadCounts(
          response.data.contagensPorConversa || {}
        );

      } catch (error) {
        console.error('Erro na chamada inicial:', error.response?.data || error.message);
      }
    };

    fetchInitialUnreadCounts();
  }, [usuario]);

  /**
   * Listeners relacionados aos contadores do chat.
   *
   * O Context NÃO manipula a lista de mensagens da conversa.
   * Ele apenas mantém:
   *
   * - unreadChatCount
   * - conversationUnreadCounts
   */
  useEffect(() => {
    if (!socket || !usuario) return;

    /**
     * Nova mensagem recebida.
     *
     * Só contabilizam:
     * - mensagens enviadas por outro usuário;
     * - mensagens de uma conversa que não está aberta atualmente.
     */
    const handleNewMessageChat = (payload) => {
      if (payload.remetenteId !== usuario.id && payload.conversaId !== activeConversationId) {
        setUnreadChatCount(prevCount => prevCount + 1);

        setConversationUnreadCounts(prevCounts => ({
          ...prevCounts,
          [payload.conversaId]:
            (prevCounts[payload.conversaId] || 0) + 1
        }));
      }
    };

    /**
     * Mensagens marcadas como lidas.
     *
     * O evento deve informar:
     * - conversaId
     * - leitorId
     */
    const handleMessagesRead = ({ conversaId, leitorId }) => {

      // Só interessa quando o próprio usuário marcou mensagens como lidas.
      if (leitorId !== usuario.id) return;

      setConversationUnreadCounts(prevCounts => {
        const newCounts = { ...prevCounts };

        const messagesRead = newCounts[conversaId] || 0;

        if (messagesRead > 0) {
          setUnreadChatCount(prevTotal => Math.max(0, prevTotal - messagesRead));
        }

        delete newCounts[conversaId];

        return newCounts;
      });
    };

    /**
     * Mensagem excluída.
     *
     * O backend deve enviar:
     *
     * {
     *   mensagemId,
     *   conversaId,
     *   remetenteId,
     *   lida
     * }
     *
     * Só diminui os contadores se a mensagem:
     *
     * 1. ainda estava não lida;
     * 2. não foi enviada pelo próprio usuário.
     *
     * Isso evita remover do contador uma mensagem que nunca
     * fez parte das mensagens não lidas.
     */
    const handleMessageDeleted = ({
      mensagemId,
      conversaId,
      remetenteId,
      lida
    }) => {
      // Mensagem já lida não está no contador.
      if (lida) return;

      // Mensagem enviada pelo próprio usuário também não
      // entra no contador de mensagens não lidas.
      if (remetenteId === usuario.id) return;

      setConversationUnreadCounts(prevCounts => {
        const quantidadeAtual = prevCounts[conversaId] || 0;

        // Não existe contador para essa conversa.
        if (quantidadeAtual <= 0) {
          return prevCounts;
        }

        const newCounts = { ...prevCounts };

        if (quantidadeAtual === 1) {
          delete newCounts[conversaId];
        } else {
          newCounts[conversaId] = quantidadeAtual - 1;
        }

        return newCounts;
      });

      setUnreadChatCount(prevCount => Math.max(0, prevCount - 1));
    };

    socket.on('nova_mensagem_chat', handleNewMessageChat);
    socket.on('mensagens_lidas', handleMessagesRead);
    socket.on('excluir_mensagem', handleMessageDeleted);

    return () => {
      socket.off('nova_mensagem_chat', handleNewMessageChat);
      socket.off('mensagens_lidas', handleMessagesRead);
      socket.off('excluir_mensagem', handleMessageDeleted);
    };
  }, [socket, usuario, activeConversationId]);

  /**
   * Quando o usuário sai da página de chat,
   * nenhuma conversa permanece como ativa.
   */
  useEffect(() => {
    if (!location.pathname.includes('/chat')) {
      setActiveConversationId(null);
    }
  }, [location.pathname]);

  /**
   * Zera o contador de uma conversa quando ela é aberta.
   */
  const clearUnreadCountForConversation = (conversaId) => {
    const messagesToClear = conversationUnreadCounts[conversaId] || 0;

    if (messagesToClear <= 0) return;

    setUnreadChatCount(prevCount =>
      Math.max(0, prevCount - messagesToClear)
    );

    setConversationUnreadCounts(prevCounts => {
      const newCounts = { ...prevCounts };

      delete newCounts[conversaId];

      return newCounts;
    });
  };

  const value = {
    unreadChatCount,
    conversationUnreadCounts,
    clearUnreadCountForConversation,
    setActiveConversationId
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  return useContext(ChatContext);
};