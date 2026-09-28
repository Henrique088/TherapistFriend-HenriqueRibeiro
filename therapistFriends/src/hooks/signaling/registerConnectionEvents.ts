// src/hooks/signaling/registerConnectionEvents.ts

import { Socket } from "socket.io-client";

interface RegisterConnectionEventsParams {

    socket: Socket;

    participantOffline(data: { usuarioId: number }): void;

    participantOnline(data: { usuarioId: number }): void;

}

export function registerConnectionEvents({

    socket,

    participantOffline,

    participantOnline

}: RegisterConnectionEventsParams) {

    socket.on("participant-offline", participantOffline);

    socket.on("participant-online", participantOnline);

    return () => {

        socket.off("participant-offline", participantOffline

        );

        socket.off("participant-online", participantOnline);

    };

}