// src/hooks/connection/useConnectionRecovery.ts

import { MutableRefObject, useCallback, useReducer, useRef, useState } from "react";

import { initialConnectionState } from "./types";

import { heartbeatReceived, participantOffline, participantOnline, resetConnection } from "./actions";

import { connectionReducer } from "./reducer/ConnectionReducer";

interface UseConnectionRecoveryParams {

    usuarioId: number;

    onReconnectTimeoutRef?: MutableRefObject<(() => void) | null>;

    onParticipantOffline?: () => void;
}

export function useConnectionRecovery({

    usuarioId,

    onReconnectTimeoutRef,

    onParticipantOffline

}: UseConnectionRecoveryParams) {

    const [state, dispatch] = useReducer(

        connectionReducer,

        initialConnectionState

    );

    const [isParticipantOnline, setIsParticipantOnline] = useState(false);

    /**
     * Timer da reconexão
     */
    const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

    /**
     * Timer do heartbeat
     */
    const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);

    /**
     * ==================================================
     * Participante Offline
     * ==================================================
     */

    const handleParticipantOffline = useCallback(
        (data: { usuarioId: number }) => {

            console.log("[Recovery] participant-offline", {
                recebido: data.usuarioId,
                local: usuarioId
            });

            setIsParticipantOnline(false);

            /**
             * Ignora evento referente ao próprio usuário.
             */
            if (data.usuarioId === usuarioId) {

                console.log("[Recovery] Ignorando evento próprio.");
                return;
            }

            /**
             * Primeiro altera o estado da recuperação.
             *
             * Isso garante que a UI saiba imediatamente
             * que o participante remoto está offline.
             */
            participantOffline({
                dispatch,
                reconnectTimer,
                onReconnectTimeout: () => onReconnectTimeoutRef?.current?.()
            });

            /**
             * Depois remove a PeerConnection/stream remoto.
             */
            onParticipantOffline?.();
        },
        [
            usuarioId,
            onReconnectTimeoutRef,
            onParticipantOffline
        ]
    );

    /**
     * ==================================================
     * Participante Online
     * ==================================================
     */

    const handleParticipantOnline = useCallback(

        (data: { usuarioId: number }) => {

            if (data.usuarioId === usuarioId)
                return;

            setIsParticipantOnline(true);

            participantOnline({ dispatch, reconnectTimer });

        },[usuarioId]);

    /**
     * ==================================================
     * Heartbeat
     * ==================================================
     */

    const handleHeartbeatReceived = useCallback(() => {

        heartbeatReceived({

            heartbeatTimer,

            participantOffline: () =>

                handleParticipantOffline({ usuarioId: -1 }) 

        });

    }, [handleParticipantOffline]);

    /**
     * ==================================================
     * Reset
     * ==================================================
     */

    const reset = useCallback(() => {

        setIsParticipantOnline(false);

        resetConnection({

            dispatch,

            reconnectTimer,

            heartbeatTimer

        });

    }, []);

    return {

        state,

        isParticipantOnline,

        participantOffline: handleParticipantOffline,

        participantOnline: handleParticipantOnline,

        heartbeatReceived: handleHeartbeatReceived,

        reset

    };

}