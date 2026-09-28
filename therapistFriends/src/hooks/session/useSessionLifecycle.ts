// src/hooks/session/useSessionLifecycle.ts

import { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";


import { ensureLocalStream } from "../media/ensureLocalStream";
import { cleanupStreams } from "../cleanup/cleanupStreams";
import { cleanupSockets } from "../cleanup/cleanupSockets";
import { resetSessionState } from "../cleanup/resetSessionState";
import { startNegotiation } from "../webrtc/startNegotiation";
import { UseSessionLifecycleParams } from "../interfaces/IVideoSessionEngine";
import { SessionEndedPayload } from "../signaling/registerSessionEvents";
import { toast } from "react-toastify";



export function useSessionLifecycle({
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
}: UseSessionLifecycleParams) {
    const navigate = useNavigate();
    const startingCallRef = useRef(false);

    /**
     * Encerra e limpa todos os recursos da sessão (tracks, sockets, peer)
     */
    const stopTracks = useCallback(() => {
        console.log("🛑 Encerrando recursos da sessão...");

        setIsSessionActive(false);
        setIsOtherParticipantOnline(false);
        connectionRecovery.reset();

        stopAnalysis();

        if (remoteStream) {
            remoteStream.getTracks().forEach((track) => track.stop());
        }

        cleanupStreams(localStream, remoteStream);
        destroyPeer();
        cleanupSockets(socketSignaling, socketAnalysis);

        resetSessionState({
            setLocalStream,
            setIsCallStarted,
            resetMediaControls
        });

        console.log("✅ Recursos da sessão encerrados com sucesso.");
    }, [
        setIsSessionActive,
        setIsOtherParticipantOnline,
        connectionRecovery,
        remoteStream,
        localStream,
        destroyPeer,
        socketSignaling,
        socketAnalysis,
        setLocalStream,
        setIsCallStarted,
        resetMediaControls
    ]);

    /**
     * Inicia a chamada (garante a mídia local, peer connection e dispara negociação ou análise)
     */
    const startCall = useCallback(async () => {
        if (startingCallRef.current) return;
        startingCallRef.current = true;

        try {
            const stream = await ensureLocalStream(localStream, setLocalStream);
            const peer = await initWebRTC(stream);

            setIsCallStarted(true);

            if (isProfissional && socketSignaling.current) {
                await startNegotiation({
                    peer,
                    signalingSocket: socketSignaling.current,
                    sessaoId
                });
            } else {
                startAnalysis(stream);
            }
        } finally {
            startingCallRef.current = false;
        }
    }, [
        localStream,
        setLocalStream,
        initWebRTC,
        setIsCallStarted,
        isProfissional,
        socketSignaling,
        sessaoId,
        startAnalysis
    ]);

    /**
     * Trata a entrada/reconexão de um participante
     */
    const handleParticipantOnline = useCallback(
        async (data: { usuarioId: number }) => {
            console.log("🟢 Participante entrou/voltou:", data.usuarioId);
            setIsOtherParticipantOnline(true);
            connectionRecovery.participantOnline(data);

            if (isProfissional) {
                try {
                    const stream = await ensureLocalStream(localStream, setLocalStream);
                    const peer = await reconnectPeer(stream);

                    setIsCallStarted(true);

                    if (socketSignaling.current) {
                        await startNegotiation({
                            peer,
                            signalingSocket: socketSignaling.current,
                            sessaoId
                        });
                    }
                } catch (error) {
                    console.error("❌ Erro ao reconectar WebRTC automaticamente:", error);
                }
            } else {
                const stream = await ensureLocalStream(localStream, setLocalStream);
                startAnalysis(stream);
            }
        },
        [
            setIsOtherParticipantOnline,
            connectionRecovery,
            isProfissional,
            localStream,
            setLocalStream,
            reconnectPeer,
            setIsCallStarted,
            socketSignaling,
            sessaoId,
            startAnalysis
        ]
    );

    /**
     * Trata a saída/queda de um participante
     */
    const handleParticipantOffline = useCallback(() => {
        console.warn("⚠️ Participante ficou offline/caiu da sala.");
        setIsOtherParticipantOnline(false);
        destroyPeer();
    }, [setIsOtherParticipantOnline, destroyPeer]);

    /**
     * Redireciona quando a sessão expira por timeout
     */
    const handleSessionTimeout = useCallback(() => {
        console.warn("⏰ Timeout recebido no frontend.");
        stopTracks();
        navigate("/");
    }, [stopTracks, navigate]);

    /**
     * Redireciona quando a sessão é encerrada pelo backend
     */
    const handleSessionEnded = useCallback(
        (data?: SessionEndedPayload) => {
            console.log("🛑 Sessão encerrada via WebSocket. Dados recebidos:", data);

            
            stopTracks();

            
            if (data?.mensagem) {
                toast.info(data.mensagem);
            }

            if (isProfissional) {
                navigate('/relatorio/processando', {
                    state: {
                        elegivelParaRelatorio:
                            data?.elegivelParaRelatorio ?? false,
                    },
                });
            } else {
                const sessaoFinalizadaId = data?.sessaoId || sessaoId;

                navigate(`/sessao/avaliando/${sessaoFinalizadaId}`, {
                    state: {
                        elegivelParaRelatorio:
                            data?.elegivelParaRelatorio ?? false,
                    },
                });
            }
        },
        [stopTracks, navigate, isProfissional, sessaoId]
    );

    return {
        startCall,
        stopTracks,
        handleParticipantOnline,
        handleParticipantOffline,
        handleSessionTimeout,
        handleSessionEnded
    };
}