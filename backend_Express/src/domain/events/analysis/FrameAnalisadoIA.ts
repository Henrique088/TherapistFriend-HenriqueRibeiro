// src/domain/events/analysis/FrameAnalisadoIA.ts
import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";

/**
 * Disparado assim que o microserviço gRPC responde sobre um frame específico.
 * Foco: Feedback visual imediato no Front-end.
 */
export class FrameAnalisadoIA implements DomainEventInterface {
    dateTimeOccurred: Date;
    eventData: {
        sessaoId: string;
        emocaoPredominante: string;
        confianca: number;
        timestamp: number;
    };

    constructor(eventData: any) {
        this.dateTimeOccurred = new Date();
        this.eventData = eventData;
    }
}

