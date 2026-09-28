// src/infrastructure/events/QueueListeners.ts

import { QueueEvents } from 'bullmq';
import { redisConnection } from '../config/redis';
import { EventDispatcherInterface } from '../../domain/@shared/events/EventDispatcher';
import { CardsIAGerados } from '../../domain/events/ia/CardsIAGerados';

export const setupQueueListeners = (eventDispatcher: EventDispatcherInterface) => {
    const queueEvents = new QueueEvents('ia-analise-geracao', { connection: redisConnection });

    queueEvents.on('completed', ({ jobId, returnvalue }: any) => {
        if (returnvalue?.jobType === 'gerar-cards' && returnvalue.cards && returnvalue.usuarioId) {
            
            console.log(`[Queue] Job ${jobId} finalizado. Notificando via Domain Event.`);

            // Disparando o evento de domínio
            const event = new CardsIAGerados({
                usuarioId: returnvalue.usuarioId,
                cards: returnvalue.cards
            });

            eventDispatcher.notify(event);
        }
    });

    console.log("[QueueListeners] Monitorando eventos de conclusão da fila IA...");
};