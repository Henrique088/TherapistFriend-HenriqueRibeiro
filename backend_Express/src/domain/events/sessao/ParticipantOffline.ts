// src/domain/events/sessao/ParticipantOffline.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";

export class ParticipantOffline implements DomainEventInterface {

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