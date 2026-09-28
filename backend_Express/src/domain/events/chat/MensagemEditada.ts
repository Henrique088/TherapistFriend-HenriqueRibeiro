// src/domain/events/chat/MensagemEditada.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";

export class MensagemEditada implements DomainEventInterface {
    dateTimeOccurred: Date;
    eventData: {
        conversaId: number;
        mensagemId: number;
        novoTexto: string;
    };

    constructor(eventData: any) {
        this.dateTimeOccurred = new Date();
        this.eventData = eventData;
    }
}