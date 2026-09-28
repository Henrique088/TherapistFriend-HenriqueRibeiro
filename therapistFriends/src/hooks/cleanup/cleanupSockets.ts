// src/hooks/cleanup/cleanupSockets.ts

import { Socket } from "socket.io-client";

import React from "react";

export function cleanupSockets(
    signalingSocket: React.MutableRefObject<Socket | null>, 
    
    analysisSocket: React.MutableRefObject<Socket | null>

) {

    signalingSocket.current?.disconnect();

    analysisSocket.current?.disconnect();

    signalingSocket.current = null;

    analysisSocket.current = null;

    console.log("🔌 Sockets desconectados.");

}