// src/domain/events/relato/SolicitacaoConversaRecebida.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";

export class SolicitacaoConversaRecebida implements DomainEventInterface {
    dateTimeOccurred: Date;
    eventData: {
        relatoId: number;
        pacienteId: number;
        profissionalId: number;
        nomeProfissional: string;
        tituloRelato: string;
    };

    constructor(eventData: any) {
        this.dateTimeOccurred = new Date();
        this.eventData = eventData;
    }
}

