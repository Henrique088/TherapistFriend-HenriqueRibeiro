// src/domain/events/agenda/AgendamentoSolicitado.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";

export class AgendamentoSolicitado implements DomainEventInterface {
    dateTimeOccurred: Date;
    eventData: {
        agendamentoId: number;
        pacienteId: number;
        profissionalId: number;
        codinome: string;
        dataInicio: Date;
    };

    constructor(eventData: any) {
        this.dateTimeOccurred = new Date();
        this.eventData = eventData;
    }
}

