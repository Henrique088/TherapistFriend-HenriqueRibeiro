// src/domain/events/analysis/RelatorioSessaoGerado.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";
import { ISessionReportSummary } from "../../entities/SessionReportEntity";

export class RelatorioSessaoGerado implements DomainEventInterface {
    dateTimeOccurred: Date;
    eventData: {
        sessaoId: string;
        pacienteId: number;   
        profissionalId: number;
        summary: ISessionReportSummary; 
        duracaoTotal?: number;
    };

    constructor(eventData: {
        sessaoId: string;
        pacienteId: number;
        profissionalId: number;
        summary: ISessionReportSummary;
        duracaoTotal?: number;
    }) {
        this.dateTimeOccurred = new Date();
        this.eventData = eventData;
    }
}