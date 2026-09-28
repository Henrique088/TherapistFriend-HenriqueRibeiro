// src/domain/agenda/events/AgendamentoCancelado.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";


export class AgendamentoCancelado implements DomainEventInterface {
    dateTimeOccurred: Date;
    eventData: {
        agendamentoId: number;
        pacienteId: number;
        profissionalId: number;
        canceladoPor: 'paciente' | 'profissional';
        dataInicio: Date;
    };
    constructor(eventData: any) {
        this.dateTimeOccurred = new Date();
        this.eventData = eventData;
    }
}

