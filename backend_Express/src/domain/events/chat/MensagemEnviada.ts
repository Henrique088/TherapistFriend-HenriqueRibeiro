// src/domain/chat/events/MensagemEnviada.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";

export class MensagemEnviada implements DomainEventInterface {
    dateTimeOccurred: Date;
    eventData: {
        conversaId: number;
        mensagem: {
            id: number;
            texto: string;
            remetenteId: number;   
        };
        destinatarioId: number;
    };

    constructor(eventData: any) {
        this.dateTimeOccurred = new Date();
        this.eventData = eventData;
    }
}