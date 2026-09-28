// src/hooks/signaling/handlers/handleIceRestart.ts

import { Socket } from "socket.io-client";

interface HandleIceRestartParams {

    socket: Socket;

    peerRef: React.MutableRefObject<RTCPeerConnection | null>;

}

export async function handleIceRestart(params: HandleIceRestartParams, data?: any) {

    const { peerRef, socket } = params;

    const peer = peerRef.current;

    if (!peer) {
        
        console.warn("⚠️ PeerConnection não existe para realizar o ICE Restart.");
        return;
    }

    console.log("🔄 [WebRTC] Criando nova Offer com iceRestart: true...");
    
    // 1. Cria uma oferta com a flag iceRestart habilitada
    const offer = await peer.createOffer({ iceRestart: true });
    
    // 2. Define Local Description
    await peer.setLocalDescription(offer);

    // 3. Emite a nova oferta para o outro peer via signaling
    socket.emit("offer", { offer });
}