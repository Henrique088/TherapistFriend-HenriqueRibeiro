// src/domain/events/emotion/EmotionProcessada.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";

export class EmotionProcessada implements DomainEventInterface {
    dateTimeOccurred: Date;
    eventData: {
        sessionId: string;
        emocao: string;
        confianca: number;
    };

    constructor(eventData: any) {
        this.dateTimeOccurred = new Date();
        this.eventData = eventData;
    }
}

