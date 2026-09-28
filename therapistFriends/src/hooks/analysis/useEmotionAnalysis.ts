// src/hooks/analysis/useEmotionAnalysis.ts

import { useCallback, useEffect, useRef, useState } from "react";

import { Socket } from "socket.io-client";

import { EmotionFeedback } from "./EmotionTypes";

interface Props {

    sessaoId: string;

    isProfissional: boolean;

    socket: Socket | null;

}

export function useEmotionAnalysis({ sessaoId, isProfissional, socket }: Props) {

    /**
     * ==========================
     * Controle da captura
     * ==========================
     */

    const frameInterval =
        useRef<NodeJS.Timeout | null>(null);

    /**
     * ==========================
     * Estados
     * ==========================
     */

    const [currentEmotion, setCurrentEmotion] = useState<EmotionFeedback | null>(null);

    const [analysisError, setAnalysisError] = useState<string | null>(null);

    /**
     * ==========================
     * Inicia análise
     * ==========================
     */

    const startAnalysis = useCallback(

        (stream: MediaStream) => {

            if (isProfissional)
                return;

            if (!socket) {

                console.warn("Socket da IA ainda não conectado.");
                return;
            }

            if (frameInterval.current) {

                clearInterval(frameInterval.current);
            }

            const video = document.createElement("video");

            video.srcObject = stream;

            video.muted = true;

            video.play().catch(console.error);

            const canvas = document.createElement("canvas");

            const context = canvas.getContext("2d", { alpha: false });

            frameInterval.current = setInterval(() => {
                if (!socket.connected || video.readyState !== 4) return;

                // Usa as dimensões originais que a câmera está fornecendo (ex: 1280x720)
                const width = video.videoWidth || 640;
                const height = video.videoHeight || 480;

                canvas.width = width;
                canvas.height = height;

                // Desenha o frame completo sem distorção nem crop
                context?.drawImage(video, 0, 0, width, height);

                canvas.toBlob(
                    blob => {
                        if (!blob) return;
                        socket.emit("video-frame", { sessaoId, image: blob });
                    },
                    "image/jpeg",
                    0.75 // Qualidade levemente reduzida para compensar a resolução maior sem perder detalhes
                );
            }, 2000);
            console.log("🎥 Emotion Analysis iniciada");

        },

        [
            socket,

            sessaoId,

            isProfissional
        ]

    );

    /**
     * ==========================
     * Encerra análise
     * ==========================
     */

    const stopAnalysis = useCallback(() => {

        if (frameInterval.current) {

            clearInterval(frameInterval.current);

            frameInterval.current = null;

        }

        console.log("🛑 Emotion Analysis encerrada");
    }, []);

    /**
     * ==========================
     * Eventos Socket.IO
     * ==========================
     */

    useEffect(() => {

        if (!socket)
            return;

        let errorTimer: NodeJS.Timeout;

        function handleFeedback(data: EmotionFeedback) {

            console.log("📊 Feedback IA", data);

            setAnalysisError(null);

            setCurrentEmotion(data);

        }

        function handleError(

            err: { message: string; }

        ) {

            console.warn(err.message);

            setAnalysisError(err.message);

            clearTimeout(errorTimer);

            errorTimer = setTimeout(() => {

                setAnalysisError(null);

            }, 4000);

        }

        socket.on("analysis-feedback", handleFeedback);

        socket.on("analysis-error", handleError);

        console.log("🧠 Eventos da IA registrados.");

        return () => {

            socket.off("analysis-feedback", handleFeedback);

            socket.off("analysis-error", handleError);

            clearTimeout(errorTimer);

            console.log("🧹 Eventos da IA removidos.");
        };
    }, [socket]);

    /**
     * ==========================
     * API Pública
     * ==========================
     */

    return {
        currentEmotion,

        analysisError,

        startAnalysis,

        stopAnalysis
    };

}