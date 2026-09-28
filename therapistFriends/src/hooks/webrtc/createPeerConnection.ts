// src/hooks/webrtc/createPeerConnection.ts

import { Socket } from "socket.io-client";

interface CreatePeerConnectionParams {
    
    iceServers: RTCIceServer[];
    
    stream: MediaStream;
    
    sessaoId: string;
    
    signalingSocket: Socket;
    
    onRemoteStream: (stream: MediaStream) => void;
    
    onIceConnected?: () => void;
    
    onIceDisconnected?: () => void;
    
    onIceFailed?: () => void;
}

export function createPeerConnection({
    
    iceServers,
    
    stream,
    
    sessaoId,
    
    signalingSocket,
    
    onRemoteStream,
    
    onIceConnected,
    
    onIceDisconnected,
    
    onIceFailed
}: CreatePeerConnectionParams): RTCPeerConnection {

    const peer = new RTCPeerConnection({ iceServers, iceTransportPolicy: "all" });

    // 1. Adiciona faixas (tracks) locais
    stream.getTracks().forEach((track) => { peer.addTrack(track, stream);});

    // 2. Recebe faixas (tracks) remotas
    peer.ontrack = (event) => {
        
        console.log("🎥 [WebRTC] Track remota recebida.");
        
        if (event.streams && event.streams[0]) {
            
            onRemoteStream(event.streams[0]);
        }

        event.track.onended = () => {
            console.warn("🛑 [WebRTC] Faixa de mídia remota encerrada.");
            onIceDisconnected?.();
        };
    };

    // 3. Envia candidatos ICE locais via Socket
    peer.onicecandidate = (event) => {
        
        if (event.candidate) {
            
            console.log("🧊 [WebRTC] Enviando ICE candidate local...");
            
            signalingSocket.emit("ice-candidate", {sessaoId, candidate: event.candidate });
        }
    };

    /**
     * ============================
     * Monitoramento do Estado da RTCPeerConnection
     * ============================
     */

    peer.onconnectionstatechange = () => {
        
        const state = peer.connectionState;
        
        console.log(`[Peer Connection State Change]: ${state}`);

        if (state === "disconnected" || state === "failed" || state === "closed") {
            
            onIceDisconnected?.();
        }
    };

    /**
     * ============================
     * Monitoramento de Estado ICE
     * ============================
     */
    peer.oniceconnectionstatechange = () => {
        
        const state = peer.iceConnectionState;
        
        console.log(`[ICE State Change]: ${state}`);

        if (state === "connected" || state === "completed") {
            
            console.log("🟢 Conexão WebRTC conectada/recuperada com sucesso.");
            
            onIceConnected?.();
        }

        if (state === "disconnected") {
            
            console.warn("⚠️ Conexão WebRTC oscilou (disconnected). Aguardando recuperação...");
            
            onIceDisconnected?.();
        }

        if (state === "failed") {
            
            console.error("❌ Conexão WebRTC falhou (failed). Disparando recuperação...");
            
            onIceFailed?.();
        }
    };

    return peer;
}