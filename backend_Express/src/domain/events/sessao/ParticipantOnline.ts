// src/domain/events/sessao/ParticipantOnline.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";

export class ParticipantOnline implements DomainEventInterface {

    dateTimeOccurred: Date;

    eventData: {

        sessaoId: string;

        usuarioId: number;
    };

    constructor(eventData: { sessaoId: string; usuarioId: number; }) {

        this.dateTimeOccurred = new Date();
        
        this.eventData = eventData;
    }
}