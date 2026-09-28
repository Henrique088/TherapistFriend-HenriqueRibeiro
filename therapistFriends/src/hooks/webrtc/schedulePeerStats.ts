// src/hooks/webrtc/schedulePeerStats.ts

import { MutableRefObject } from "react";

import { dumpPeerStats } from "./dumpPeerStats";

/**
 * Agenda a coleta das estatísticas da PeerConnection.
 *
 * Caso já exista um agendamento pendente,
 * ele é cancelado antes de criar um novo.
 */
export function schedulePeerStats(

    peer: RTCPeerConnection,

    timeoutRef: MutableRefObject<NodeJS.Timeout | null>,

    delay = 5000

): void {

    if (timeoutRef.current) {

        clearTimeout(timeoutRef.current);

        timeoutRef.current = null;
    }

    timeoutRef.current = setTimeout(async () => {

        try {
            await dumpPeerStats(peer);

        } catch (error) {

            console.error( "❌ Erro ao coletar estatísticas WebRTC:", error );
        }

    }, delay);

}