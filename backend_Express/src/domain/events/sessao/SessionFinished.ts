// src/domain/events/sessao/SessionFinished.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";

export class SessionFinished implements DomainEventInterface {

    dateTimeOccurred: Date;

    eventData: {

        sessaoId: string;

        pacienteId: number;

        profissionalId: number;

        elegivelParaRelatorio: boolean;

    };

    constructor(eventData: {

        sessaoId: string;

        pacienteId: number;

        profissionalId: number;

        elegivelParaRelatorio: boolean;

    }) {

        this.dateTimeOccurred = new Date();

        this.eventData = eventData;

    }

}