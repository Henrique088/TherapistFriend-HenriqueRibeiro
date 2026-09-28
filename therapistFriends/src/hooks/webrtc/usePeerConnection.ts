// src/hooks/webrtc/usePeerConnection.ts

import { useCallback, useRef, useState } from "react";
import { Socket } from "socket.io-client";

import { createPeerConnection } from "./createPeerConnection";
// import { schedulePeerStats } from "./schedulePeerStats";
import { cleanupPeerConnection } from "../cleanup/cleanupPeerConnection";

interface UsePeerConnectionParams {
    iceServers: RTCIceServer[];
    sessaoId: string;
    signalingSocketRef: React.MutableRefObject<Socket | null>;
}

/**
 * Dispara o processo de ICE Restart via WebRTC Offer
 */
async function triggerIceRestart(

    pcRef: React.MutableRefObject<RTCPeerConnection | null>,
    
    socket: Socket,
    
    sessaoId: string
) {
    const peer = pcRef.current;
    
    if (!peer) {
        
        console.warn("⚠️ [WebRTC] Não foi possível executar o ICE Restart: PeerConnection nulo.");
        return;
    }

    try {
        
        console.log("🔄 [WebRTC] Iniciando ICE Restart (Criando Offer com iceRestart: true)...");

        // Em navegadores modernos, aciona a sinalização interna do ICE
        if (typeof peer.restartIce === "function") {
            
            peer.restartIce();
        }

        const offer = await peer.createOffer({ iceRestart: true });
        
        await peer.setLocalDescription(offer);

        socket.emit("offer", { sessaoId, offer });

    } catch (error) {
        
        console.error("❌ [WebRTC] Erro ao disparar ICE Restart:", error);
    }
}

export function usePeerConnection({
    
    iceServers,
    
    sessaoId,
    
    signalingSocketRef
}: UsePeerConnectionParams) {
    
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    
    const pc = useRef<RTCPeerConnection | null>(null);
    
    const pendingIceCandidates = useRef<RTCIceCandidateInit[]>([]);
    
    const statsTimeout = useRef<NodeJS.Timeout | null>(null);
    
    const disconnectTimer = useRef<NodeJS.Timeout | null>(null);

    /**
     * Limpa o temporizador de tolerância de desconexão
     */
    const clearDisconnectTimer = useCallback(() => {
        
        if (disconnectTimer.current) {
            
            clearTimeout(disconnectTimer.current);
            
            disconnectTimer.current = null;
        }
    }, []);

    /**
     * ==========================================
     * Criar PeerConnection
     * ==========================================
     */
    const initWebRTC = useCallback(
        
        async (stream: MediaStream): Promise<RTCPeerConnection> => {
            
            const activeSocket = signalingSocketRef.current;

            if (!activeSocket) {
                
                throw new Error("Socket de sinalização não está disponível.");
            }

            clearDisconnectTimer();

            const peer = createPeerConnection({
                
                iceServers,
                
                stream,
                
                sessaoId,
                
                signalingSocket: activeSocket,
                
                onRemoteStream: (remote) => setRemoteStream(remote),

                // Limpa o timer caso a conexão recupere antes do tempo limite
                onIceConnected: () => {

                    console.log("🟢 [WebRTC] Conexão ICE estabelecida/recuperada.");
                    
                    clearDisconnectTimer();
                },

                // Tolerância para 'disconnected' (aguarda 5s antes de forçar restart)
                onIceDisconnected: () => {
                    
                    console.warn("⚠️ [WebRTC] ICE Desconectado. Aguardando tolerância de 5 segundos...");
                    
                    clearDisconnectTimer();

                    disconnectTimer.current = setTimeout(() => {
                        
                        if (pc.current?.iceConnectionState === "disconnected") {
                            
                            console.warn("⏱️ [WebRTC] Tempo limite de desconexão atingido. Forçando ICE Restart...");
                            
                            if (signalingSocketRef.current) {
                                
                                triggerIceRestart(pc, signalingSocketRef.current, sessaoId);
                            }
                        }
                    }, 5000);
                },

                // Reação imediata para 'failed'
                onIceFailed: () => {
                    
                    clearDisconnectTimer();
                    
                    console.error("🚨 [WebRTC] ICE Falhou criticamente. Forçando ICE Restart imediato...");
                    
                    if (signalingSocketRef.current) {
                        
                        triggerIceRestart(pc, signalingSocketRef.current, sessaoId);
                    }
                }
            });

            pc.current = peer;
            
            return peer;
        }, [iceServers, sessaoId, signalingSocketRef, clearDisconnectTimer] );

    /**
     * ==========================================
     * Destruir PeerConnection
     * ==========================================
     */
    const destroyPeer = useCallback(() => {
        
        console.log("🛑 Destruindo PeerConnection...");

        clearDisconnectTimer();

        if (statsTimeout.current) {
            
            clearTimeout(statsTimeout.current);
            
            statsTimeout.current = null;
        }

        if (remoteStream) {
            
            remoteStream.getTracks().forEach((track) => track.stop());
        }

        cleanupPeerConnection(pc, pendingIceCandidates);
        
        setRemoteStream(null);
    }, [remoteStream, clearDisconnectTimer]);

    /**
     * Reinstancia completamente o Peer
     */
    const reconnectPeer = useCallback(
        
        async (stream: MediaStream): Promise<RTCPeerConnection> => {
            
            destroyPeer();
            
            return initWebRTC(stream);
        }, [destroyPeer, initWebRTC] );

    return {
        
        remoteStream,
        
        initWebRTC,
        
        destroyPeer,
        
        peerRef: pc,
        
        pendingIceCandidates,
        
        reconnectPeer
    };
}