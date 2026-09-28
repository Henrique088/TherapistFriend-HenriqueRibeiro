// src/domain/emotion/events/SessaoFinalizada.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";

export class SessaoFinalizada implements DomainEventInterface {
    dateTimeOccurred: Date;
    eventData: {
        sessionId: string;
        duracao: number;
        dataEncerramento: Date;
    };

    constructor(eventData: any) {
        this.dateTimeOccurred = new Date();
        this.eventData = eventData;
    }
}