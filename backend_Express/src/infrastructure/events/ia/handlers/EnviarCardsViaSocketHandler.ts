// src/infrastructure/ia/events/handlers/EnviarCardsViaSocketHandler.ts

import { Server } from 'socket.io';
import { EventHandlerInterface } from '../../../../domain/@shared/events/EventHandlerInterface';
import { CardsIAGerados } from '../../../../domain/events/ia/CardsIAGerados';

export default class EnviarCardsViaSocketHandler implements EventHandlerInterface<CardsIAGerados> {
    constructor(private io: Server) {}

    async handle(event: CardsIAGerados): Promise<void> {
        const { usuarioId, cards } = event.eventData;

        console.log(`[Handler] Enviando cards via socket para usuário ${usuarioId}`);
        
        this.io.to(`usuario_${usuarioId}`).emit('cards_gerados', {
            cards: cards
        });
    }
}