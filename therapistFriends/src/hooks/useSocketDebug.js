// // hooks/useSocketDebug.js - VERSÃO SEGURA
// import { useEffect, useRef } from 'react';
// import { useUser } from '../contexts/UserContext';

// // Importe o contexto diretamente para evitar o hook useSocket
// import { SocketContext } from '../contexts/SocketContext';
// import { useContext } from 'react';

// export const useSocketDebug = (componentName) => {
//   const { usuario } = useUser();
  
//   // Use useContext diretamente em vez de useSocket()
//   const socketContext = useContext(SocketContext);
  
//   // Extraia socket e isConnected de forma segura
//   const socket = socketContext?.socket || socketContext; // Suporta ambas as versões
//   const isConnected = socketContext?.isConnected !== undefined 
//     ? socketContext.isConnected 
//     : socket?.connected;

//   const prevSocketIdRef = useRef(null);

//   useEffect(() => {
//     const socketChanged = prevSocketIdRef.current !== socket?.id;

//     console.log(`🔌 [${componentName}] Socket Debug:`, {
//       hasSocketContext: !!socketContext,
//       hasSocket: !!socket,
//       socketId: socket?.id,
//       prevSocketId: prevSocketIdRef.current,
//       isConnected: isConnected,
//       userId: usuario?.id,
//       userType: usuario?.tipo_usuario,
//       socketChanged,
//       timestamp: new Date().toLocaleTimeString()
//     });

//     if (socket?.id) {
//       prevSocketIdRef.current = socket.id;
//     }
//   }, [socket, isConnected, usuario, componentName, socketContext]);
// };