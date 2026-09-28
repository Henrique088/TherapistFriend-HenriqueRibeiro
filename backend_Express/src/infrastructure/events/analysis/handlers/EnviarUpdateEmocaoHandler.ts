// src/infrastructure/handlers/analysis/EnviarUpdateEmocaoHandler.ts

import { Server } from "socket.io";
import { EventHandlerInterface } from "../../../../domain/@shared/events/EventHandlerInterface";
import { FrameAnalisadoIA } from "../../../../domain/events/analysis/FrameAnalisadoIA";


export default class EnviarUpdateEmocaoHandler implements EventHandlerInterface<FrameAnalisadoIA> {
    constructor(private io: Server) {}

    async handle(event: FrameAnalisadoIA): Promise<void> {
        const { sessaoId, emocaoPredominante, confianca } = event.eventData;
        
        // Envia para a sala específica da call WebRTC
        this.io.to(`sessao_${sessaoId}`).emit('vibe_check_update', {
            emocao: emocaoPredominante,
            confianca
        });
    }
}