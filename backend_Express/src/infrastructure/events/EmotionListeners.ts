// src/infrastructure/events/EmotionListeners.ts

import { Server } from 'socket.io';
import { EMOTION_EVENT_TYPES, emotionEvents } from './EmotionEvents'; 

export function setupEmotionListeners(io: Server) {
    emotionEvents.on(EMOTION_EVENT_TYPES.EMOTION_PROCESSADA, (payload) => {
        const { sessionId, emocao, confianca } = payload;

        io.to(`sessao_${sessionId}`).emit('emotion_update', {
            emocao,
            confianca
        });
    });
}