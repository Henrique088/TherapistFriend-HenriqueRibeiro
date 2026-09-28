// src/domain/agenda/events/UrgenciaConfirmada.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";


export class UrgenciaConfirmada implements DomainEventInterface {
    dateTimeOccurred: Date;
    eventData: {
        urgenciaId: number;
        usuarioId: number;
        profissionalNome: string;
    };
    constructor(eventData: any) {
        this.dateTimeOccurred = new Date();
        this.eventData = eventData;
    }
}