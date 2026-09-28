// hooks/useTransportCloseDebug.js
import { useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

export const useTransportCloseDebug = () => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleDisconnect = (reason) => {
      if (reason === 'transport close') {
        console.error('💥 TRANSPORT CLOSE DETECTADO!');
        console.trace('Stack trace do transport close:'); // 🔥 MOSTRA QUEM CAUSOU
        
        alert('🚨 O transporte WebSocket caiu! Verifique o console para mais detalhes.');
        // Log adicional para debugging
        setTimeout(() => {
          console.log('🔍 Estado pós-transport close:', {
            socketConnected: socket.connected,
            socketId: socket.id,
            url: window.location.href
          });
        }, 100);
      }
    };

    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);
};

