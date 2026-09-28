// hooks/useSocketStabilityTest.js - VERSÃO MELHORADA
import { useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';

export const useSocketStabilityTest = (componentName) => {
  const socket = useSocket();
  const socketIdRef = useRef(null);
  const testStartRef = useRef(Date.now());
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current += 1;
    
    if (socket?.id) {
      const currentTime = Date.now();
      const testDuration = currentTime - testStartRef.current;
      
      if (socketIdRef.current === null) {
        // Primeira conexão
        console.log(`🧪 [${componentName}] TESTE INICIADO - Socket: ${socket.id} (Render: ${renderCountRef.current})`);
        socketIdRef.current = socket.id;
      } 
      else if (socketIdRef.current !== socket.id) {
        // Socket mudou - PROBLEMA
        console.error(`🚨 [${componentName}] TESTE FALHOU - Socket mudou! (Render: ${renderCountRef.current})`);
        console.error(`   Anterior: ${socketIdRef.current}`);
        console.error(`   Novo: ${socket.id}`);
        console.error(`   Tempo: ${testDuration}ms`);
        socketIdRef.current = socket.id; // Atualiza para continuar o teste
      }
      else {
        // Mesmo socket - SUCESSO
        console.log(`✅ [${componentName}] TESTE OK - Socket: ${socket.id} (Render: ${renderCountRef.current}, ${testDuration}ms)`);
      }
    } else {
      console.log(`⏳ [${componentName}] Aguardando socket... (Render: ${renderCountRef.current})`);
    }
  }, [socket, componentName]);
};