// src/hooks/signaling/registerSessionEvents.ts

import { Socket } from "socket.io-client";

export interface SessionEndedPayload {
    sessaoId: string;
    mensagem: string;
    tipo: 'INFO_SESSAO';
    elegivelParaRelatorio: boolean;
}

interface RegisterSessionEventsParams {

    socket: Socket;

    sessionTimeout(): void;

    sessionEnded(data: SessionEndedPayload): void;

}

export function registerSessionEvents({

    socket,

    sessionTimeout,

    sessionEnded

}: RegisterSessionEventsParams) {

    socket.on("session-timeout", sessionTimeout);

    socket.on("session-ended", (data: SessionEndedPayload) => {
        sessionEnded(data);
    });

    return () => {

        socket.off("session-timeout", sessionTimeout);

        socket.off("session-ended", sessionEnded);

    };

}