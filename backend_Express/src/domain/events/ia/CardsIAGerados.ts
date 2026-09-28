// src/domain/events/ia/CardsIAGerados.ts

import { DomainEventInterface } from "../../@shared/events/DomainEventInterface";

export class CardsIAGerados implements DomainEventInterface {
    dateTimeOccurred: Date;
    eventData: {
        usuarioId: number;
        cards: any[];
    };

    constructor(eventData: { usuarioId: number; cards: any[] }) {
        this.dateTimeOccurred = new Date();
        this.eventData = eventData;
    }
}