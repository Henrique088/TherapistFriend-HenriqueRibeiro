// src/hooks/socket/SessionSockets.ts

import { Socket } from "socket.io-client";

export interface SessionSockets {

    signaling: Socket;

    analysis: Socket;

}