// src/hooks/useNotificacoes.js

import { useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function useNotificacoes() {
  const socket = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    // Notificação comum 
    const handleNotificacao = ({ mensagem }) => {
      toast.info(mensagem);
    };

    // Alerta de Sessão 
    const handleSessaoIniciando = (data) => {

      console.log(data)

      toast.info(
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <span
            style={{
              fontWeight: 700,
              color: '#243331',
              lineHeight: '1.4'
            }}
          >
            {data.mensagem}
          </span>

          <button
            onClick={() =>
              window.open(
                data.link,
                '_blank',
                'noopener,noreferrer'
              )
            }
            style={{
              alignSelf: 'flex-start',
              padding: '8px 14px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#5E8190',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease, transform 0.2s ease',
              boxShadow: '0 3px 8px rgba(36, 51, 49, 0.12)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4F6F7C';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#5E8190';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ENTRAR NA SALA
          </button>
        </div>,
        {
          position: 'top-right',
          autoClose: 15000,
          closeOnClick: false,
          pauseOnHover: true
        }
      );
    };

    const setupListeners = () => {
      socket.off('nova_notificacao', handleNotificacao);
      socket.on('nova_notificacao', handleNotificacao);

      socket.off('sessao_iniciando', handleSessaoIniciando);
      socket.on('sessao_iniciando', handleSessaoIniciando);
    };

    setupListeners();
    socket.on('connect', setupListeners);

    return () => {
      socket.off('nova_notificacao', handleNotificacao);
      socket.off('sessao_iniciando', handleSessaoIniciando);
      socket.off('connect', setupListeners);
    };
  }, [socket, navigate]);
}