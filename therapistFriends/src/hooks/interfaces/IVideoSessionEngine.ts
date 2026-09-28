// src/hooks/interfaces/IVideoSessionEngine.ts

import { MutableRefObject } from "react";
import { Socket } from "socket.io-client";
import { useConnectionRecovery } from "../connection/useConnectionRecovery";

export interface EmotionFeedback {

    emotion: string;

    confidence: number;
    
    timestamp?: number;
}

export interface UseSessionLifecycleParams {
    
    sessaoId: string;
    
    isProfissional: boolean;
    
    localStream: MediaStream | null;
    
    remoteStream: MediaStream | null;
    
    setLocalStream: React.Dispatch<React.SetStateAction<MediaStream | null>>;
    
    setIsCallStarted: React.Dispatch<React.SetStateAction<boolean>>;
    
    setIsSessionActive: React.Dispatch<React.SetStateAction<boolean>>;
    
    setIsOtherParticipantOnline: React.Dispatch<React.SetStateAction<boolean>>;
    
    resetMediaControls: () => void;
    
    startAnalysis: (stream: MediaStream) => void;

    stopAnalysis: () => void;
    
    initWebRTC: (stream: MediaStream) => Promise<RTCPeerConnection>;
    
    reconnectPeer: (stream: MediaStream) => Promise<RTCPeerConnection>;
    
    destroyPeer: () => void;
    
    socketSignaling: MutableRefObject<Socket | null>;
    
    socketAnalysis: MutableRefObject<Socket | null>;
    
    connectionRecovery: ReturnType<typeof useConnectionRecovery>;
}