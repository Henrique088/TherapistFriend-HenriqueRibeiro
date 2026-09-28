// src/hooks/useVideoSessionEngine.ts

import { useEffect, useRef, useState } from "react";
import { useUser } from "../contexts/UserContext";

import { registerWebRTCEvents } from "./signaling/registerWebRTCEvents";
import { registerConnectionEvents } from "./signaling/registerConnectionEvents";
import { registerSessionEvents } from "./signaling/registerSessionEvents";

import { useConnectionRecovery } from "./connection/useConnectionRecovery";
import { useEmotionAnalysis } from "./analysis/useEmotionAnalysis";
import { useSessionSockets } from "./socket/useSessionSockets";
import { useMediaControls } from "./media/useMediaControls";
import { useHeartbeat } from "./socket/useHeartbeat";
import { usePeerConnection } from "./webrtc/usePeerConnection";
import { useSessionLifecycle } from "./session/useSessionLifecycle";

export const useVideoSessionEngine = (
    sessaoId: string, 
    iceServers: RTCIceServer[], 
    initialStream?: MediaStream
) => {
    const { usuario } = useUser();
    const isProfissional = usuario?.tipo_usuario === "profissional";

    /**
     * Estados
     */
    const [localStream, setLocalStream] = useState<MediaStream | null>(initialStream || null);
    const [isCallStarted, setIsCallStarted] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(true);
    const [isOtherParticipantOnline, setIsOtherParticipantOnline] = useState(false);

    const reconnectTimeoutRef = useRef<(() => void) | null>(null);

    /**
     * Controles de Mídia
     */
    const { 
        toggleAudio, 
        toggleVideo, 
        isAudioMuted, 
        isVideoDisabled, 
        resetMediaControls 
    } = useMediaControls({ localStream });

    const getSocketUrl = (): string => {
        const { hostname, protocol } = window.location;
        const isLocalNetwork =
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname);

        return isLocalNetwork ? `${protocol}//${hostname}:8000` : window.location.origin;
    };

    /**
     * Sockets e WebRTC
     */
    const {
        analysis,
        signalingSocket: socketSignaling,
        analysisSocket: socketAnalysis
    } = useSessionSockets({ baseUrl: getSocketUrl(), sessaoId });

    const {
        remoteStream,
        initWebRTC,
        destroyPeer,
        peerRef: pc,
        pendingIceCandidates,
        reconnectPeer
    } = usePeerConnection({
        iceServers,
        sessaoId,
        signalingSocketRef: socketSignaling
    });

    const { currentEmotion, analysisError, startAnalysis, stopAnalysis } = 
        useEmotionAnalysis({ sessaoId, isProfissional, socket: analysis });

    // Instancia o controle de recuperação de conexão
    const connectionRecovery = useConnectionRecovery({
        usuarioId: usuario?.id,
        onReconnectTimeoutRef: reconnectTimeoutRef,
        onParticipantOffline: () => handlersRef.current.handleParticipantOffline()
    });

    // Delegando o controle do ciclo de vida da sessão ao hook especializado
    const lifecycle = useSessionLifecycle({
        sessaoId,
        isProfissional,
        localStream,
        remoteStream,
        setLocalStream,
        setIsCallStarted,
        setIsSessionActive,
        setIsOtherParticipantOnline,
        resetMediaControls,
        startAnalysis,
        stopAnalysis,
        initWebRTC,
        reconnectPeer,
        destroyPeer,
        socketSignaling,
        socketAnalysis,
        connectionRecovery
    });

    /**
     * Atualização do stream remoto
     */
    useEffect(() => {
        if (remoteStream && remoteStream.getTracks().length > 0) {
            console.log("🎥 remoteStream recebido com sucesso. Iniciando exibição...");
            setIsCallStarted(true);
            setIsOtherParticipantOnline(true);
        }
    }, [remoteStream]);

    useEffect(() => {
        reconnectTimeoutRef.current = () => {
            console.warn("⏰ Tempo limite de reconexão atingido! Finalizando chamada...");
            lifecycle.handleSessionTimeout();
        };
    }, [lifecycle]);

    /**
     * Heartbeat
     */
    useHeartbeat({
        socket: socketSignaling.current,
        sessaoId,
        enabled: isSessionActive,
        onHeartbeat: connectionRecovery.heartbeatReceived
    });

    /**
     * Referência para Handlers de WebSocket
     */
    const handlersRef = useRef({
        ...lifecycle,
        localStream,
        isCallStarted
    });

    useEffect(() => {
        handlersRef.current = {
            ...lifecycle,
            localStream,
            isCallStarted
        };
    });

    const socketInstance = socketSignaling.current;

    /**
     * Registro de ouvintes WebSocket e consulta do status inicial da sala
     */
    useEffect(() => {
        if (!socketInstance) return;

        console.log("🔌 Registrando ouvintes WebSocket no Socket de Sinalização...");

        // Pede ao backend o estado atual da sala assim que conecta no socket
        socketInstance.emit("check-room-status", { sessaoId });

        // Ouve atualizações de status da sala
        const handleRoomStatus = (data: { participantsCount: number; isOtherOnline?: boolean }) => {
            console.log("📊 Status da sala recebido:", data);

            if (data.isOtherOnline || data.participantsCount > 1) {
                setIsOtherParticipantOnline(true);

                // Se o profissional entrou e o paciente já estava na sala, inicia a chamada automaticamente
                if (isProfissional && !handlersRef.current.isCallStarted) {
                    handlersRef.current.startCall();
                }
            } else {
                setIsOtherParticipantOnline(false);
            }
        };

        socketInstance.on("room-status", handleRoomStatus);

        const unregisterWebRTC = registerWebRTCEvents({
            socket: socketInstance,
            sessaoId,
            isProfissional,
            localStream: handlersRef.current.localStream,
            setLocalStream,
            initWebRTC,
            startAnalysis: (stream) => handlersRef.current.startCall(), // garante disparos das refs atualizadas
            startCall: () => handlersRef.current.startCall(),
            peerRef: pc,
            pendingIceCandidates
        });

        const unregisterConnection = registerConnectionEvents({
            socket: socketInstance,
            participantOffline: (data) => handlersRef.current.handleParticipantOffline(),
            participantOnline: (data) => handlersRef.current.handleParticipantOnline(data)
        });

        const unregisterSession = registerSessionEvents({
            socket: socketInstance,
            sessionTimeout: () => handlersRef.current.handleSessionTimeout(),
            sessionEnded: (data) => handlersRef.current.handleSessionEnded(data)
        });

        return () => {
            console.log("🧹 Removendo ouvintes WebSocket...");
            socketInstance.off("room-status", handleRoomStatus);
            unregisterWebRTC();
            unregisterConnection();
            unregisterSession();
        };
    }, [
        socketInstance,
        sessaoId,
        isProfissional,
        initWebRTC,
        pc,
        pendingIceCandidates,
        setLocalStream
    ]);

    return {
        localStream,
        remoteStream,
        currentEmotion,
        analysisError,
        isCallStarted,
        isOtherParticipantOnline,
        connectionState: connectionRecovery.state,
        startCall: lifecycle.startCall,
        stopTracks: lifecycle.stopTracks,
        socketSignaling: socketSignaling.current,
        toggleAudio,
        toggleVideo,
        isAudioMuted,
        isVideoDisabled
    };
};