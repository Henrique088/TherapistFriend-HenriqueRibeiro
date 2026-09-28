// src/domain/events/sessao/SessaoIniciando.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";

export class SessaoIniciando implements DomainEventInterface {
    dateTimeOccurred: Date;
    eventData: {
        usuarios: number[]; // ID do Paciente e do Profissional
        mensagem: string;
        link: string;
        agendamentoId: number;
        horaInicio: Date;
        nomePaciente: string;
        nomeProfissional: string;
    };

    constructor(eventData: any) {
        this.dateTimeOccurred = new Date();
        this.eventData = eventData;
    }
}