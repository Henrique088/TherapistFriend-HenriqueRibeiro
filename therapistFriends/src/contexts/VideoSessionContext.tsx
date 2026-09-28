// src/contexts/VideoSessionContext.tsx

import React, { createContext, useContext } from "react";
import { Socket } from "socket.io-client";
import { useVideoSessionEngine } from "../hooks/useVideoSessionEngine";
import { ConnectionState } from "../hooks/connection/types";

export interface VideoSessionData {

    sessaoId: string;

    localStream: MediaStream | null;

    remoteStream: MediaStream | null;

    currentEmotion: any | null;

    analysisError: string | null;

    isCallStarted: boolean;

    /**
     * Estado atual da conexão.
     */
    connectionState: ConnectionState;

    isAudioMuted: boolean;

    isVideoDisabled: boolean;

    startCall(): Promise<void>;

    endCall(): void;

    toggleAudio(): void;

    toggleVideo(): void;

    socketSignaling: Socket | null;

    isOtherParticipantOnline: boolean;

}

const VideoSessionContext =
    createContext<VideoSessionData>(
        {} as VideoSessionData
    );

interface VideoSessionProviderProps {

    children: React.ReactNode;

    sessaoId: string;

    iceServers: RTCIceServer[];

    initialStream?: MediaStream;

}

export const VideoSessionProvider = ({
    children,
    sessaoId,
    iceServers,
    initialStream
}: VideoSessionProviderProps) => {

    const engine =
        useVideoSessionEngine(
            sessaoId,
            iceServers,
            initialStream
        );

    return (

        <VideoSessionContext.Provider
            value={{

                sessaoId,

                localStream: engine.localStream,

                remoteStream: engine.remoteStream,

                currentEmotion: engine.currentEmotion,

                analysisError: engine.analysisError,

                isCallStarted: engine.isCallStarted,

                 connectionState: engine.connectionState,

                startCall: engine.startCall,

                endCall: engine.stopTracks,

                socketSignaling: engine.socketSignaling,

                toggleAudio: engine.toggleAudio,

                toggleVideo: engine.toggleVideo,

                isAudioMuted: engine.isAudioMuted,

                isVideoDisabled: engine.isVideoDisabled,
                
                isOtherParticipantOnline: engine.isOtherParticipantOnline

            }}
        >

            {children}

        </VideoSessionContext.Provider>

    );

};

export const useVideoSession = () =>
    useContext(VideoSessionContext);