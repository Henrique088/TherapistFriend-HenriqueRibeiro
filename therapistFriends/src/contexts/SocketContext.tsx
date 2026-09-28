// src/contexts/SocketContext.tsx

import { createContext, useContext, useEffect, useMemo, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from './UserContext';

// Definir tipos para o contexto
export type SocketContextType = Socket | null;

export const SocketContext = createContext<SocketContextType>(null);

// Tipos para o usuário (baseado no que é esperado do UserContext)
interface User {
  id: string | number;
  tipo_usuario: string;
}

// Props para o SocketProvider
interface SocketProviderProps {
  children: ReactNode;
}

const getSocketUrl = (): string => {
  const { hostname, protocol } = window.location;

  const isLocalNetwork =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname);

  if (isLocalNetwork) {
    return `${protocol}//${hostname}:8000`;
  } else {
    return window.location.origin;
  }
};

export function SocketProvider({ children }: SocketProviderProps) {
  const { usuario, loadingUsuario } = useUser();

  const socket = useMemo(() => {
    const instance = io(getSocketUrl(), {
      withCredentials: true,
      autoConnect: false,
    });

    instance.on("disconnect", (reason: string) => {
      console.log(" Socket desconectou:", reason);

      if (reason === "io server disconnect") {
        console.log("➡️ O servidor chamou socket.disconnect()");
      }
      if (reason === "transport close") {
        console.log("➡️ O transporte WebSocket caiu (router, proxy, cors)");
      }
      if (reason === "ping timeout") {
        console.log("➡️ O servidor não recebeu o ping do client");
      }
    });

    instance.on("connect", () => console.log("⚡ Socket conectado"));
    instance.on("disconnect", () => console.log("⚠️ Socket desconectado"));
    instance.on("connect_error", (err: Error) => console.log("❌ Erro no socket:", err));

    return instance;
  }, []); // Nunca recria

  // Conectar após user carregado
  useEffect(() => {
    if (loadingUsuario) return;

    if (!usuario) {
      console.log(" Sem usuário — socket permanece desconectado");
      return;
    }
   
    console.log("🔌 Conectando socket…");
    socket.connect();
  }, [loadingUsuario, usuario, socket]);

  // Enviar auth quando usuário mudar
  // useEffect(() => {
  //   if (!usuario || !socket.connected) return;

  //   console.log("Emitindo auth no socket…");

  //   socket.emit("auth", {
  //     userId: usuario.id,
  //     tipo: usuario.tipo_usuario,
  //   });
  // }, [usuario, socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextType {
  return useContext(SocketContext);
}