// src/hooks/signaling/registerWebRTCEvents.ts

import { Socket } from "socket.io-client";

import { handleOffer } from "./handlers/handleOffer";
import { handleAnswer } from "./handlers/handleAnswer";
import { handleIceCandidate } from "./handlers/handleIceCandidate";
import { handleRoomReady } from "./handlers/handleRoomReady";
import { handleIceRestart } from "./handlers/handleIceRestart";

interface RegisterWebRTCEventsParams {
    socket: Socket;

    sessaoId: string;
    
    isProfissional: boolean;
    
    localStream: MediaStream | null;
    
    setLocalStream: (stream: MediaStream) => void;
    
    initWebRTC: (stream: MediaStream) => Promise<RTCPeerConnection>;
    
    startAnalysis: (stream: MediaStream) => void;
    
    startCall: () => Promise<void>;
    
    peerRef: React.MutableRefObject<RTCPeerConnection | null>;
    
    pendingIceCandidates: React.MutableRefObject<RTCIceCandidateInit[]>;
}

export function registerWebRTCEvents(params: RegisterWebRTCEventsParams) {
    const {
        socket,
        
        peerRef,
        
        pendingIceCandidates,
        
        startCall
    } = params;

    /**
     * OFFER
     */
    const handleOfferEvent = async ({ offer }: { offer: RTCSessionDescriptionInit }) => {

        console.log("📨 [WebRTC] Offer recebida.");

        try {

            await handleOffer({ ...params, offer });

        } catch (error) {

            console.error("❌ Erro ao processar Offer:", error);
        }
    };

    /**
     * ANSWER
     */
    const handleAnswerEvent = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
        
        console.log("📨 [WebRTC] Answer recebida.");

        try {

            await handleAnswer( answer, peerRef, pendingIceCandidates);

        } catch (error) {

            console.error("❌ Erro ao processar Answer:", error);
        }
    };

    /**
     * ICE CANDIDATE
     */
    const handleIceCandidateEvent = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        
        console.log("🧊 [WebRTC] ICE candidate recebido.");
        
        try {

            await handleIceCandidate( {candidate, peerRef, pendingIceCandidates} );

        } catch (error) {

            console.error("❌ Erro ao processar ICE candidate:", error);
        }
    };

    /**
     * ROOM READY
     */
    const handleRoomReadyEvent = ({ shouldCreateOffer }: { shouldCreateOffer: boolean }) => {
        
        console.log("🚪 [WebRTC] room-ready recebido:", { shouldCreateOffer });
        
        handleRoomReady(shouldCreateOffer, startCall);
    };

    /**
     * ICE RESTART 
     */
    const handleIceRestartEvent = async (data?: any) => {
        
        console.log("🔄 [WebRTC] Recebido evento de ICE Restart.");
        
        try {

            await handleIceRestart(params, data);
        
        } catch (error) {
            
            console.error("❌ Erro ao processar ICE Restart:", error);
        }
    };

    console.log("📡 Registrando eventos WebRTC...");

    socket.on("offer", handleOfferEvent);
    socket.on("answer", handleAnswerEvent);
    socket.on("ice-candidate", handleIceCandidateEvent);
    socket.on("room-ready", handleRoomReadyEvent);
    socket.on("ice-restart", handleIceRestartEvent);

    return () => {
        console.log("🧹 Removendo eventos WebRTC...");
        socket.off("offer", handleOfferEvent);
        socket.off("answer", handleAnswerEvent);
        socket.off("ice-candidate", handleIceCandidateEvent);
        socket.off("room-ready", handleRoomReadyEvent);
        socket.off("ice-restart", handleIceRestartEvent);
    };
}