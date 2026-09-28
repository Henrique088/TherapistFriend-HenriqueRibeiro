// src/domain/events/relato/VinculoRelatoConfirmado.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";
export class VinculoRelatoConfirmado implements DomainEventInterface {
    dateTimeOccurred: Date;
    eventData: {
        relatoId: number;
        profissionalId: number;
        pacienteId: number;
        decisao: 'aceite' | 'recusa';
        nomeProfissional: string;
        codinomePaciente: string;
        conversaId: string;
    };

    constructor(eventData: any) {
        this.dateTimeOccurred = new Date();
        this.eventData = eventData;
    }
}