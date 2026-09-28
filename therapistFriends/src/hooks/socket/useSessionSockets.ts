// src/hooks/socket/useSessionSockets.ts

import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

import { createSessionSockets } from "./createSessionSockets";

interface UseSessionSocketsProps {

    baseUrl: string;

    sessaoId: string;
}

export function useSessionSockets({ baseUrl, sessaoId }: UseSessionSocketsProps) {

    const signalingSocket = useRef<Socket | null>(null);

    const analysisSocket = useRef<Socket | null>(null);

    const [signaling, setSignaling] = useState<Socket | null>(null);

    const [analysis, setAnalysis] = useState<Socket | null>(null);

    useEffect(() => {

        console.log("🔌 Inicializando sockets da sessão:", sessaoId);

        const sockets = createSessionSockets({baseUrl, sessaoId});

        signalingSocket.current = sockets.signaling;

        analysisSocket.current = sockets.analysis;

        setSignaling(sockets.signaling);

        setAnalysis(sockets.analysis);

        const handleSignalingConnect = () => {

            console.log("🟢 Signaling conectado:", sockets.signaling.id);

            sockets.signaling.emit("join-session", sessaoId);

        };

        const handleSignalingDisconnect = (
            reason: string
        ) => {

            console.log("🔴 Signaling desconectado:", reason);

        };

        sockets.signaling.on("connect", handleSignalingConnect);

        sockets.signaling.on("disconnect", handleSignalingDisconnect);

        return () => {

            console.log("🔌 Encerrando sockets da sessão:", sessaoId);

            sockets.signaling.off("connect", handleSignalingConnect);

            sockets.signaling.off("disconnect", handleSignalingDisconnect);

            sockets.signaling.disconnect();
            sockets.analysis.disconnect();

            if (signalingSocket.current === sockets.signaling) {
                
                signalingSocket.current = null;
            }

            if (analysisSocket.current === sockets.analysis) {
                
                analysisSocket.current = null;
            }

            setSignaling(null);
            
            setAnalysis(null);

        };

    }, [baseUrl, sessaoId]);

    return {
        signalingSocket,
        analysisSocket,
        signaling,
        analysis
    };
}