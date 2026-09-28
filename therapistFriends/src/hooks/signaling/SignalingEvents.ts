// src/hooks/signaling/SignalingEvents.ts

import { Socket } from "socket.io-client";

export interface RegisterSignalingEventsProps {

    socket: Socket;

    sessaoId: string;

    pc: React.MutableRefObject<RTCPeerConnection | null>;

    pendingIceCandidates: React.MutableRefObject<RTCIceCandidateInit[]>;

    isProfissional: boolean;

    isCallStarted: boolean;

    localStream: MediaStream | null;

    startCall(): Promise<void>;

    initWebRTC( stream: MediaStream ): Promise<RTCPeerConnection>;

    startAnalysis( stream: MediaStream ): void;

    setLocalStream( stream: MediaStream ): void;

    setIsCallStarted( value: boolean ): void;
}