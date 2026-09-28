// src/infrastructure/events/emotion/handlers/EnviarUpdateEmotionSocketHandler.ts

import { Server } from 'socket.io';
import { EventHandlerInterface } from '../../../../domain/@shared/events/EventHandlerInterface';
import { EmotionProcessada } from '../../../../domain/events/emotion/EmotionProcessada';

export default class EnviarUpdateEmotionSocketHandler implements EventHandlerInterface<EmotionProcessada> {
    constructor(private io: Server) {}

    async handle(event: EmotionProcessada): Promise<void> {
        const { sessionId, emocao, confianca } = event.eventData;

        // Emite para a sala específica da sessão
        this.io.to(`sessao_${sessionId}`).emit('emotion_update', {
            emocao,
            confianca
        });
    }
}