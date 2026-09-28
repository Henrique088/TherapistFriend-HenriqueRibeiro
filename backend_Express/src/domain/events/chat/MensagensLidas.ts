// src/domain/chat/events/MensagensLidas.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";

export class MensagensLidas implements DomainEventInterface {
    dateTimeOccurred: Date;
    eventData: {
        conversaId: number;
        mensagemIds: number[];
        lidoPor: number; 
    };

    constructor(eventData: any) {
        this.dateTimeOccurred = new Date();
        this.eventData = eventData;
    }
}