// src/hooks/socket/useHeartbeat.ts

import { useEffect } from "react";
import { Socket } from "socket.io-client";

interface Props {

    socket: Socket | null;

    sessaoId: string;

    enabled?: boolean;

    onHeartbeat?(): void;

}

/**
 * ==================================================
 * Monitora atividade da sessão
 * ==================================================
 */
export function useHeartbeat({

    socket,

    sessaoId,

    enabled = true,

    onHeartbeat

}: Props) {

    useEffect(() => {

        /**
         * Se a sessão não está ativa,
         * não cria nenhum heartbeat.
         */
        if (!socket || !enabled) {

            console.log("❤️ Heartbeat desativado.");

            return;

        }

        console.log("❤️ Heartbeat iniciado:", sessaoId);

        const emitHeartbeat = () => {

            console.log("❤️ enviando heartbeat:", sessaoId);

            socket.emit("heartbeat", {sessaoId, timestamp: Date.now()});

            onHeartbeat?.();

        };

        /**
         * Primeiro heartbeat imediato.
         */
        emitHeartbeat();

        /**
         * Depois, a cada 5 segundos.
         */
        const interval = setInterval(
            emitHeartbeat,
            5000
        );

        /**
         * ==================================================
         * Cleanup
         * ==================================================
         */
        return () => {

            console.log("🛑 Heartbeat finalizado:", sessaoId);

            clearInterval(interval);

        };

    }, [
        socket,
        sessaoId,
        enabled,
        onHeartbeat
    ]);

}