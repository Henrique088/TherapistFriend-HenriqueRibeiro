// src/domain/events/sessao/SessionTimeout.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";

export class SessionTimeout implements DomainEventInterface {

    dateTimeOccurred: Date;

    eventData: {

        sessaoId: string;
    };

    constructor(eventData: { sessaoId: string; }) {

        this.dateTimeOccurred = new Date();
        
        this.eventData = eventData;
    }
}