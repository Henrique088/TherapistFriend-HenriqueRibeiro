// src/domain/agenda/events/AgendamentoRespondido.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";


export class AgendamentoRespondido implements DomainEventInterface {
    dateTimeOccurred: Date;
    eventData: {
        agendamentoId: number;
        pacienteId: number;
        nome: string;
        status: 'confirmado' | 'recusado';
        dataInicio: Date;
        dataFinal: Date;
    };

    constructor(eventData: any) {
        this.dateTimeOccurred = new Date();
        this.eventData = eventData;
    }
}