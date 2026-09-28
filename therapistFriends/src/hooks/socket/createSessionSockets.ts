// src/hooks/socket/createSessionSockets.ts

import { io } from "socket.io-client";
import { SessionSockets } from "./SessionSockets";

interface Props {

    baseUrl: string;

    sessaoId: string;
}

export function createSessionSockets({ baseUrl, sessaoId }: Props): SessionSockets {

    const signaling = io( `${baseUrl}/sessao-signaling`,
        {
            withCredentials: true,

            forceNew: true,

        }
    );

    const analysis = io( `${baseUrl}/sessao-analysis`,
        {

            withCredentials: true,

            forceNew: true
        }
    );

    console.count("EMIT JOIN SIGNALING");
    
    signaling.emit( "join-session", sessaoId );

    analysis.emit( "join-session", sessaoId );

    return {
        signaling,

        analysis
    };

}