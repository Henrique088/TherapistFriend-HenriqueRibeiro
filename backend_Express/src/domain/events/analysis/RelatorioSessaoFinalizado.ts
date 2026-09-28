// src/domain/events/analysis/RelatorioSessaoFinalizado.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";

export class RelatorioSessaoFinalizado implements DomainEventInterface {
    dateTimeOccurred: Date;
    eventData: {
        sessaoId: string;
        pacienteId: number;
        profissionalId: number;
        dadosConsolidados: {
            emocaoDominante: string;
            picosDeAnsiedade: number;
            graficoSetorial: any; // Dados vindos do Microservice
        };
    };

    constructor(eventData: any) {
        this.dateTimeOccurred = new Date();
        this.eventData = eventData;
    }
}