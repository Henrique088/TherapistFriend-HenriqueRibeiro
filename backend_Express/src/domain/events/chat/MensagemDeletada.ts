// src/domain/events/chat/MensagemDeletada.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";

export class MensagemDeletada implements DomainEventInterface {
    dateTimeOccurred: Date;
    eventData: {
        conversaId: number;
        mensagemId: number;
        remetenteId: number;
        destinatarioId: number;
        lida: boolean;
    };

    constructor(eventData: any) {
        this.dateTimeOccurred = new Date();
        this.eventData = eventData;
    }
}